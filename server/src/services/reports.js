import { prisma } from '../lib/db.js';
import { retryQuery } from '../utils/queryRetry.js';

/**
 * Get monthly report data
 * Includes health and finance summaries
 * All queries auto-retry on connection failures
 */
export async function getMonthlyReportData(userId, year, month) {
  const startDate = new Date(year, month - 1, 1); // month is 1-indexed in API
  const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
  
  // === HEALTH DATA ===
  // All queries with automatic retry on connection failures
  const workoutLogs = await retryQuery(() => 
    prisma.workoutLog.findMany({
      where: {
        userId,
        date: { 
          gte: startDate,
          lte: endDate
        }
      }
    })
  );
  
  const stepLogs = await retryQuery(() =>
    prisma.stepLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  );
  
  const nutritionLogs = await retryQuery(() =>
    prisma.nutritionLog.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  );
  
  const bodyMetrics = await retryQuery(() =>
    prisma.bodyMetric.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    })
  );
  
  // Workout analysis
  const totalWorkouts = workoutLogs.length;
  const totalCaloriesBurned = workoutLogs.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalDurationMinutes = workoutLogs.reduce((sum, w) => sum + w.durationMinutes, 0);
  const avgDurationPerWorkout = totalWorkouts > 0 ? Math.round(totalDurationMinutes / totalWorkouts) : 0;
  
  // Group workouts by type
  const workoutsByType = {};
  workoutLogs.forEach(log => {
    workoutsByType[log.type] = (workoutsByType[log.type] || 0) + 1;
  });
  
  // Steps analysis
  const totalSteps = stepLogs.reduce((sum, s) => sum + s.steps, 0);
  const avgDailySteps = stepLogs.length > 0 ? Math.round(totalSteps / stepLogs.length) : 0;
  const maxStepsDay = stepLogs.length > 0 ? Math.max(...stepLogs.map(s => s.steps)) : 0;
  
  // Nutrition analysis
  const totalNutritionLogs = nutritionLogs.length;
  const totalCaloriesConsumed = nutritionLogs.reduce((sum, n) => sum + n.calories, 0);
  const avgCaloriesPerDay = totalNutritionLogs > 0 ? Math.round(totalCaloriesConsumed / totalNutritionLogs) : 0;
  const totalProtein = nutritionLogs.reduce((sum, n) => sum + (n.protein || 0), 0);
  const totalCarbs = nutritionLogs.reduce((sum, n) => sum + (n.carbs || 0), 0);
  const totalFat = nutritionLogs.reduce((sum, n) => sum + (n.fat || 0), 0);
  
  // Body metrics analysis
  const startWeight = bodyMetrics.length > 0 ? bodyMetrics[0].weight : null;
  const endWeight = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1].weight : null;
  const weightChange = startWeight && endWeight ? (endWeight - startWeight).toFixed(2) : 0;
  const avgBMI = bodyMetrics.length > 0 
    ? (bodyMetrics.reduce((sum, m) => sum + (m.bmi || 0), 0) / bodyMetrics.length).toFixed(1)
    : null;
  
  // === FINANCE DATA ===
  const transactions = await retryQuery(() =>
    prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })
  );
  
  const budgets = await retryQuery(() =>
    prisma.budget.findMany({
      where: { userId }
    })
  );
  
  // Income/Expense summary
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netSavings = income - expenses;
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(2) : 0;
  
  // Spending breakdown by category
  const spendingByCategory = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    });
  
  // Sort categories by spending
  const topCategories = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount: amount.toFixed(2) }));
  
  // Budget analysis
  const budgetAnalysis = [];
  for (const budget of budgets) {
    const spent = transactions
      .filter(t => t.category === budget.category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = budget.limitAmount - spent;
    const percentUsed = budget.limitAmount > 0 ? ((spent / budget.limitAmount) * 100).toFixed(1) : 0;
    
    budgetAnalysis.push({
      category: budget.category,
      limit: budget.limitAmount.toFixed(2),
      spent: spent.toFixed(2),
      remaining: Math.max(0, remaining).toFixed(2),
      percentUsed: Math.min(100, parseFloat(percentUsed))
    });
  }
  
  // Account balances
  const accounts = await retryQuery(() =>
    prisma.account.findMany({
      where: { userId }
    })
  );
  
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  
  return {
    month: new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    period: `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long' })} ${year}`,
    
    // Health metrics
    health: {
      workouts: {
        total: totalWorkouts,
        totalCalories: totalCaloriesBurned,
        totalDuration: totalDurationMinutes,
        avgDuration: avgDurationPerWorkout,
        byType: workoutsByType
      },
      steps: {
        total: totalSteps,
        avgPerDay: avgDailySteps,
        daysLogged: stepLogs.length,
        maxDay: maxStepsDay
      },
      nutrition: {
        logsCount: totalNutritionLogs,
        totalCalories: totalCaloriesConsumed,
        avgCaloriesPerDay: avgCaloriesPerDay,
        macros: {
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat
        }
      },
      bodyMetrics: {
        startWeight,
        endWeight,
        weightChange: parseFloat(weightChange),
        avgBMI: parseFloat(avgBMI) || null,
        metricsLogged: bodyMetrics.length
      }
    },
    
    // Finance metrics
    finance: {
      summary: {
        totalIncome: income.toFixed(2),
        totalExpenses: expenses.toFixed(2),
        netSavings: netSavings.toFixed(2),
        savingsRate: `${savingsRate}%`
      },
      accounts: {
        total: accounts.length,
        totalBalance: totalBalance.toFixed(2),
        accounts: accounts.map(a => ({
          name: a.name,
          type: a.type,
          balance: a.balance.toFixed(2)
        }))
      },
      topCategories,
      budgetAnalysis,
      transactionCount: transactions.length
    }
  };
}

/**
 * Get quarterly report data (3 months)
 */
export async function getQuarterlyReportData(userId, year, quarter) {
  if (quarter < 1 || quarter > 4) {
    throw new Error('Quarter must be 1-4');
  }
  
  const monthsInQuarter = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [10, 11, 12]
  ];
  
  const months = monthsInQuarter[quarter - 1];
  const startDate = new Date(year, months[0] - 1, 1);
  const endDate = new Date(year, months[2], 0, 23, 59, 59);
  
  // === HEALTH DATA ===
  const workoutLogs = await prisma.workoutLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  const stepLogs = await prisma.stepLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  const nutritionLogs = await prisma.nutritionLog.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  const bodyMetrics = await prisma.bodyMetric.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  });
  
  // Workout analysis
  const totalWorkouts = workoutLogs.length;
  const totalCaloriesBurned = workoutLogs.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalDurationMinutes = workoutLogs.reduce((sum, w) => sum + w.durationMinutes, 0);
  const avgWorkoutsPerWeek = (totalWorkouts / 12).toFixed(1); // 3 months ≈ 12 weeks
  
  // Steps analysis
  const totalSteps = stepLogs.reduce((sum, s) => sum + s.steps, 0);
  const avgDailySteps = stepLogs.length > 0 ? Math.round(totalSteps / stepLogs.length) : 0;
  
  // Nutrition analysis
  const totalCaloriesConsumed = nutritionLogs.reduce((sum, n) => sum + n.calories, 0);
  const avgCaloriesPerDay = nutritionLogs.length > 0 ? Math.round(totalCaloriesConsumed / nutritionLogs.length) : 0;
  
  // === FINANCE DATA ===
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  const budgets = await prisma.budget.findMany({
    where: { userId }
  });
  
  // Income/Expense summary
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netSavings = income - expenses;
  const savingsRate = income > 0 ? ((netSavings / income) * 100).toFixed(2) : 0;
  
  // Spending breakdown by category
  const spendingByCategory = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
    });
  
  // Sort categories by spending
  const topCategories = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount: amount.toFixed(2) }));
  
  // Budget analysis
  const budgetAnalysis = [];
  for (const budget of budgets) {
    const spent = transactions
      .filter(t => t.category === budget.category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const remaining = budget.limitAmount - spent;
    const percentUsed = budget.limitAmount > 0 ? ((spent / budget.limitAmount) * 100).toFixed(1) : 0;
    
    budgetAnalysis.push({
      category: budget.category,
      limit: budget.limitAmount.toFixed(2),
      spent: spent.toFixed(2),
      percentUsed: Math.min(100, parseFloat(percentUsed))
    });
  }
  
  // Calculate progress metrics
  const startWeight = bodyMetrics.length > 0 ? bodyMetrics[0].weight : null;
  const endWeight = bodyMetrics.length > 0 ? bodyMetrics[bodyMetrics.length - 1].weight : null;
  const weightChange = startWeight && endWeight ? (endWeight - startWeight).toFixed(2) : 0;
  
  return {
    quarter: `Q${quarter} ${year}`,
    period: `Quarter ${quarter} (${['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'][quarter - 1]}) ${year}`,
    
    // Health metrics
    health: {
      workouts: {
        total: totalWorkouts,
        totalCalories: totalCaloriesBurned,
        totalDuration: totalDurationMinutes,
        avgPerWeek: parseFloat(avgWorkoutsPerWeek)
      },
      steps: {
        total: totalSteps,
        avgPerDay: avgDailySteps,
        daysLogged: stepLogs.length
      },
      nutrition: {
        logsCount: nutritionLogs.length,
        totalCalories: totalCaloriesConsumed,
        avgCaloriesPerDay: avgCaloriesPerDay
      },
      bodyMetrics: {
        startWeight,
        endWeight,
        weightChange: parseFloat(weightChange),
        metricsLogged: bodyMetrics.length
      }
    },
    
    // Finance metrics
    finance: {
      summary: {
        totalIncome: income.toFixed(2),
        totalExpenses: expenses.toFixed(2),
        netSavings: netSavings.toFixed(2),
        avgMonthlyIncome: (income / 3).toFixed(2),
        avgMonthlyExpenses: (expenses / 3).toFixed(2),
        savingsRate: `${savingsRate}%`
      },
      topCategories,
      budgetAnalysis,
      transactionCount: transactions.length
    }
  };
}
