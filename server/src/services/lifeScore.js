import { prisma } from '../lib/db.js';

/**
 * Calculate Life Score
 * fitnessScore = (workoutsThisWeek/5 * 40) + (avgDailySteps/10000 * 30) + (nutritionLogDays/7 * 30)
 * wealthScore = (savingsRate * 50) + (budgetAdherence * 30) + (netWorthGrowth * 20)
 * lifeScore = (fitnessScore + wealthScore) / 2, capped at 0–100
 */
export async function calculateLifeScore(userId) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // === FITNESS SCORE ===
  const workoutsThisWeek = await prisma.workoutLog.count({
    where: {
      userId,
      date: { gte: sevenDaysAgo }
    }
  });
  
  const stepLogs = await prisma.stepLog.findMany({
    where: {
      userId,
      date: { gte: sevenDaysAgo }
    }
  });
  
  const totalSteps = stepLogs.reduce((sum, log) => sum + log.steps, 0);
  const avgDailySteps = stepLogs.length > 0 ? totalSteps / stepLogs.length : 0;
  
  const nutritionDays = await prisma.nutritionLog.findMany({
    where: {
      userId,
      date: { gte: sevenDaysAgo }
    },
    distinct: ['date']
  });
  
  const workoutScore = Math.min((workoutsThisWeek / 5) * 40, 40);
  const stepScore = Math.min((avgDailySteps / 10000) * 30, 30);
  const nutritionScore = Math.min((nutritionDays.length / 7) * 30, 30);
  const fitnessScore = Math.round(workoutScore + stepScore + nutritionScore);
  
  // === WEALTH SCORE ===
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo }
    }
  });
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const savingsRate = income > 0 ? Math.min(((income - expenses) / income) * 100, 100) : 0;
  
  // Calculate budget adherence
  const budgets = await prisma.budget.findMany({
    where: { userId }
  });
  
  let totalBudgetAdherence = 0;
  let budgetCount = 0;
  
  for (const budget of budgets) {
    const spent = transactions
      .filter(t => t.category === budget.category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const adherence = Math.max(0, 100 - (spent / budget.limitAmount) * 100);
    totalBudgetAdherence += adherence;
    budgetCount++;
  }
  
  const budgetAdherence = budgetCount > 0 ? totalBudgetAdherence / budgetCount : 0;
  
  // Net worth growth (30-day trend)
  const firstDayBalance = await prisma.account.aggregate({
    _sum: { balance: true },
    where: { userId }
  });
  
  const earlierTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: new Date(thirtyDaysAgo.getTime() - 1 * 24 * 60 * 60 * 1000) }
    }
  });
  
  const netWorthGrowth = savingsRate > 0 ? Math.min(savingsRate / 2, 20) : 0;
  
  const wealthScoreValue = (savingsRate / 100 * 50) + (budgetAdherence / 100 * 30) + Math.min(netWorthGrowth, 20);
  const wealthScore = Math.round(Math.min(wealthScoreValue, 100));
  
  // === FINAL SCORE ===
  const lifeScore = Math.round((fitnessScore + wealthScore) / 2);
  
  // Store in database
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingScore = await prisma.lifeScore.findUnique({
    where: {
      userId_date: {
        userId,
        date: today
      }
    }
  });
  
  if (existingScore) {
    return await prisma.lifeScore.update({
      where: { id: existingScore.id },
      data: { score: lifeScore, fitnessScore, wealthScore }
    });
  } else {
    return await prisma.lifeScore.create({
      data: {
        userId,
        score: lifeScore,
        fitnessScore,
        wealthScore,
        date: today
      }
    });
  }
}

export async function getLatestLifeScore(userId) {
  return await prisma.lifeScore.findFirst({
    where: { userId },
    orderBy: { date: 'desc' }
  });
}
