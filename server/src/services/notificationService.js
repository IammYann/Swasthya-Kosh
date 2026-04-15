import { prisma } from '../lib/db.js';
import { sendEmail, emailTemplates } from './emailService.js';
import { retryQuery } from '../utils/queryRetry.js';

/**
 * Check and create budget alert notifications
 */
export async function checkBudgetAlerts(userId) {
  try {
    const user = await retryQuery(() =>
      prisma.user.findUnique({ where: { id: userId } })
    );

    if (!user || !user.budgetAlertsEnabled) return null;

    // Get all budgets for the user
    const budgets = await retryQuery(() =>
      prisma.budget.findMany({
        where: { userId },
        include: { category: true }
      })
    );

    const currentMonth = new Date();
    currentMonth.setHours(0, 0, 0, 0);
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

    const alerts = [];

    for (const budget of budgets) {
      // Get spending for this budget this month
      const spent = await retryQuery(() =>
        prisma.transaction.aggregate({
          where: {
            userId,
            category: budget.category,
            type: 'expense',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })
      );

      const spentAmount = spent._sum.amount || 0;
      const percentUsed = budget.limitAmount > 0 ? (spentAmount / budget.limitAmount) * 100 : 0;

      // Create alert if spending is above 70% or 90% of budget
      if (percentUsed >= 70) {
        // Check if we already sent an alert recently
        const recentAlert = await retryQuery(() =>
          prisma.notification.findFirst({
            where: {
              userId,
              type: 'budget_alert',
              data: JSON.stringify({ budgetId: budget.id }),
              createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
            }
          })
        );

        if (!recentAlert) {
          const notification = await retryQuery(() =>
            prisma.notification.create({
              data: {
                userId,
                type: 'budget_alert',
                title: `Budget Alert: ${budget.category}`,
                titleNp: `बजेट सतर्कता: ${budget.category}`,
                message: `You have spent ${percentUsed.toFixed(0)}% of your ${budget.category} budget (${spentAmount.toFixed(2)} / ${budget.limitAmount.toFixed(2)})`,
                messageNp: `तपाईंले आफ्नो ${budget.category} बजेटको ${percentUsed.toFixed(0)}% खर्च गर्नुभयो (${spentAmount.toFixed(2)} / ${budget.limitAmount.toFixed(2)})`,
                data: JSON.stringify({
                  budgetId: budget.id,
                  category: budget.category,
                  spent: spentAmount,
                  limit: budget.limitAmount,
                  percentUsed: percentUsed.toFixed(0)
                })
              }
            })
          );

          alerts.push(notification);

          // Send email if notifications enabled
          if (user.emailNotificationsEnabled) {
            const { htmlContent, textContent } = emailTemplates.budgetAlert(
              user.name,
              budget.category,
              `${spentAmount.toFixed(2)} ${user.currency}`,
              `${budget.limitAmount.toFixed(2)} ${user.currency}`,
              percentUsed.toFixed(0)
            );

            await sendEmail(user.email, `Budget Alert: ${budget.category}`, htmlContent, textContent).catch(err => {
              console.error('Failed to send budget alert email:', err);
            });
          }
        }
      }
    }

    return alerts;
  } catch (err) {
    console.error('Error checking budget alerts:', err);
    throw err;
  }
}

/**
 * Check and create goal achievement notifications
 */
export async function checkGoalAchievements(userId) {
  try {
    const user = await retryQuery(() =>
      prisma.user.findUnique({ where: { id: userId } })
    );

    if (!user || !user.goalsNotificationsEnabled) return null;

    // Get all incompleted goals for the user
    const goals = await retryQuery(() =>
      prisma.goal.findMany({
        where: {
          userId,
          completed: false
        }
      })
    );

    const achievements = [];

    for (const goal of goals) {
      let achieved = false;

      try {
        if (goal.type === 'fitness') {
          // Check fitness goals (e.g., total workouts, total steps, etc.)
          if (goal.metric === 'workouts') {
            const workoutCount = await retryQuery(() =>
              prisma.workoutLog.count({ where: { userId } })
            );
            if (workoutCount >= goal.targetValue) {
              achieved = true;
            }
          } else if (goal.metric === 'steps') {
            const stepLogs = await retryQuery(() =>
              prisma.stepLog.findMany({ where: { userId } })
            );
            const totalSteps = stepLogs.reduce((sum, log) => sum + log.steps, 0);
            if (totalSteps >= goal.targetValue) {
              achieved = true;
            }
          }
        } else if (goal.type === 'finance') {
          // Check finance goals
          if (goal.metric === 'savings') {
            const accounts = await retryQuery(() =>
              prisma.account.findMany({ where: { userId } })
            );
            const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
            if (totalBalance >= goal.targetValue) {
              achieved = true;
            }
          }
        }

        if (achieved && !goal.achievedAt) {
          // Update goal as achieved
          const achievedGoal = await retryQuery(() =>
            prisma.goal.update({
              where: { id: goal.id },
              data: {
                completed: true,
                achievedAt: new Date()
              }
            })
          );

          // Create notification
          const notification = await retryQuery(() =>
            prisma.notification.create({
              data: {
                userId,
                type: 'goal_achieved',
                title: `Goal Achieved: ${goal.name}`,
                titleNp: `लक्ष्य प्राप्त: ${goal.name}`,
                message: `Congratulations! You have achieved your goal: ${goal.name}`,
                messageNp: `बधाई छ! तपाईंले आफ्नो लक्ष्य प्राप्त गर्नुभयो: ${goal.name}`,
                data: JSON.stringify({
                  goalId: goal.id,
                  goalName: goal.name,
                  goalType: goal.type
                })
              }
            })
          );

          achievements.push(notification);

          // Send email if notifications enabled
          if (user.emailNotificationsEnabled) {
            const { htmlContent, textContent } = emailTemplates.goalAchieved(
              user.name,
              goal.name,
              goal.type
            );

            await sendEmail(user.email, `Goal Achieved: ${goal.name}`, htmlContent, textContent).catch(err => {
              console.error('Failed to send goal achievement email:', err);
            });
          }
        }
      } catch (err) {
        console.error(`Error checking goal ${goal.id}:`, err);
      }
    }

    return achievements;
  } catch (err) {
    console.error('Error checking goal achievements:', err);
    throw err;
  }
}

/**
 * Create daily digest (called manually or via scheduler)
 */
export async function createDailyDigest(userId) {
  try {
    const user = await retryQuery(() =>
      prisma.user.findUnique({ where: { id: userId } })
    );

    if (!user || !user.emailNotificationsEnabled || user.digestEmailFrequency === 'none') {
      return null;
    }

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const workoutLogs = await retryQuery(() =>
      prisma.workoutLog.findMany({
        where: {
          userId,
          date: { gte: today, lt: tomorrow }
        }
      })
    );

    const stepLogs = await retryQuery(() =>
      prisma.stepLog.findMany({
        where: {
          userId,
          date: { gte: today, lt: tomorrow }
        }
      })
    );

    const nutritionLogs = await retryQuery(() =>
      prisma.nutritionLog.findMany({
        where: {
          userId,
          date: { gte: today, lt: tomorrow }
        }
      })
    );

    const transactions = await retryQuery(() =>
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: today, lt: tomorrow }
        }
      })
    );

    const lifeScore = await retryQuery(() =>
      prisma.lifeScore.findFirst({
        where: {
          userId,
          date: today
        }
      })
    );

    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    const totalSteps = stepLogs.reduce((sum, log) => sum + log.steps, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    const digestData = {
      workoutCount: workoutLogs.length,
      totalSteps,
      nutritionLogs: nutritionLogs.length,
      expenseCount: expenses.length,
      totalExpenses: `${totalExpenses.toFixed(2)} ${user.currency}`,
      savingsRate,
      lifeScore: lifeScore?.score || 0
    };

    const { htmlContent, textContent } = emailTemplates.dailyDigest(user.name, digestData);

    await sendEmail(user.email, 'Your Daily Summary - Svasthya Kosh', htmlContent, textContent).catch(err => {
      console.error('Failed to send daily digest email:', err);
    });

    // Update last digest sent time
    await retryQuery(() =>
      prisma.user.update({
        where: { id: userId },
        data: { lastDigestEmailSentAt: new Date() }
      })
    );

    return digestData;
  } catch (err) {
    console.error('Error creating daily digest:', err);
    throw err;
  }
}

/**
 * Create weekly digest (called manually or via scheduler)
 */
export async function createWeeklyDigest(userId) {
  try {
    const user = await retryQuery(() =>
      prisma.user.findUnique({ where: { id: userId } })
    );

    if (!user || !user.emailNotificationsEnabled) {
      return null;
    }

    // Get last 7 days data
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Health data
    const workoutLogs = await retryQuery(() =>
      prisma.workoutLog.findMany({
        where: {
          userId,
          date: { gte: weekAgo, lte: today }
        }
      })
    );

    const stepLogs = await retryQuery(() =>
      prisma.stepLog.findMany({
        where: {
          userId,
          date: { gte: weekAgo, lte: today }
        }
      })
    );

    const lifScores = await retryQuery(() =>
      prisma.lifeScore.findMany({
        where: {
          userId,
          date: { gte: weekAgo, lte: today }
        }
      })
    );

    // Finance data
    const transactions = await retryQuery(() =>
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: weekAgo, lte: today }
        }
      })
    );

    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    const budgets = await retryQuery(() =>
      prisma.budget.findMany({ where: { userId } })
    );

    const totalSteps = stepLogs.reduce((sum, log) => sum + log.steps, 0);
    const avgDailySteps = stepLogs.length > 0 ? Math.round(totalSteps / 7) : 0;
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const averageDailyExpenses = (totalExpenses / 7).toFixed(2);
    const avgLifeScore = lifScores.length > 0 ? Math.round(lifScores.reduce((sum, ls) => sum + ls.score, 0) / lifScores.length) : 0;

    // Calculate budget adherence
    let totalBudgetAdherence = 0;
    let budgetCount = 0;
    for (const budget of budgets) {
      const spent = expenses
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      const adherence = budget.limitAmount > 0 
        ? Math.max(0, 100 - (spent / budget.limitAmount) * 100)
        : 100;
      totalBudgetAdherence += adherence;
      budgetCount++;
    }
    const budgetAdhereance = budgetCount > 0 ? Math.round(totalBudgetAdherence / budgetCount) : 100;

    const weeklyData = {
      totalWorkouts: workoutLogs.length,
      totalSteps,
      avgDailySteps,
      totalExpenses: `${totalExpenses.toFixed(2)} ${user.currency}`,
      averageDailyExpenses: `${averageDailyExpenses} ${user.currency}`,
      avgLifeScore,
      budgetAdhereance
    };

    const { htmlContent, textContent } = emailTemplates.weeklyDigest(user.name, weeklyData);

    await sendEmail(user.email, 'Your Weekly Summary - Svasthya Kosh', htmlContent, textContent).catch(err => {
      console.error('Failed to send weekly digest email:', err);
    });

    // Update last digest sent time
    await retryQuery(() =>
      prisma.user.update({
        where: { id: userId },
        data: { lastDigestEmailSentAt: new Date() }
      })
    );

    return weeklyData;
  } catch (err) {
    console.error('Error creating weekly digest:', err);
    throw err;
  }
}
