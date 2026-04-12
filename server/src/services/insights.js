import { prisma } from '../lib/db.js';

/**
 * Analyze last 30 days and detect patterns/correlations
 */
export async function getCorrelations(userId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo }
    }
  });
  
  const workouts = await prisma.workoutLog.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo }
    }
  });
  
  const stepLogs = await prisma.stepLog.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo }
    }
  });
  
  const insights = [];
  
  // === Correlation 1: High spending days vs workout consistency ===
  const highSpendingDays = new Set();
  const spendingByDay = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const day = t.date.toISOString().split('T')[0];
      spendingByDay[day] = (spendingByDay[day] || 0) + t.amount;
    });
  
  const avgDailySpend = Object.values(spendingByDay).reduce((a, b) => a + b, 0) / 
                        Object.keys(spendingByDay).length || 0;
  
  Object.entries(spendingByDay).forEach(([day, amount]) => {
    if (amount > avgDailySpend * 1.5) {
      highSpendingDays.add(day);
    }
  });
  
  const workoutDays = new Set(workouts.map(w => w.date.toISOString().split('T')[0]));
  const workoutOnHighSpendDays = Array.from(highSpendingDays).filter(day => workoutDays.has(day)).length;
  const workoutCorrelation = (workoutOnHighSpendDays / highSpendingDays.size) * 100 || 0;
  
  if (workoutCorrelation < 40) {
    insights.push({
      type: 'spending_workout_correlation',
      message_en: `You skip workouts on high-spending days (${(100 - workoutCorrelation).toFixed(0)}% of the time). Try an evening walk to clear your mind.`,
      message_np: `तपाईं बढी खर्च गर्ने दिनमा workout छुट्छ (${(100 - workoutCorrelation).toFixed(0)}% समय)। आफ्नो दिमाग १ साफ गर्न साँझ हिँड्ने प्रयास गर्नुहोस्।`,
      confidence: 'high',
      delta: (100 - workoutCorrelation).toFixed(0)
    });
  }
  
  // === Correlation 2: Budget adherence vs fitness streak ===
  const budgets = await prisma.budget.findMany({
    where: { userId }
  });
  
  let totalAdherence = 0;
  let budgetCount = 0;
  
  for (const budget of budgets) {
    const spent = transactions
      .filter(t => t.category === budget.category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const adherence = Math.max(0, 100 - (spent / budget.limitAmount) * 100);
    totalAdherence += adherence;
    budgetCount++;
  }
  
  const avgBudgetAdherence = budgetCount > 0 ? totalAdherence / budgetCount : 0;
  const workoutStreak = workouts.length;
  
  if (avgBudgetAdherence > 75 && workoutStreak > 5) {
    insights.push({
      type: 'discipline_correlation',
      message_en: `नियमितता is paying off! Your gym consistency (${workoutStreak} workouts) aligns perfectly with your budget discipline (${avgBudgetAdherence.toFixed(0)}% adherence).`,
      message_np: `नियमितता काम गरिरहेको छ! तपाईंको gym consistency (${workoutStreak} workouts) र budget discipline (${avgBudgetAdherence.toFixed(0)}% adherence) एकै जडियो छ।`,
      confidence: 'high',
      delta: avgBudgetAdherence.toFixed(0)
    });
  }
  
  // === Correlation 3: Net worth growth vs step count ===
  const stepAvg = stepLogs.length > 0 
    ? stepLogs.reduce((sum, log) => sum + log.steps, 0) / stepLogs.length
    : 0;
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  
  if (stepAvg > 8000 && savingsRate > 20) {
    insights.push({
      type: 'health_wealth_correlation',
      message_en: `Active people save more! Your ${stepAvg.toFixed(0)} daily steps correlate with ${savingsRate.toFixed(0)}% savings rate.`,
      message_np: `सक्रिय मान्छे बढी बचत गर्छ! तपाईंको ${stepAvg.toFixed(0)} दैनिक steps ${savingsRate.toFixed(0)}% savings rate सँग मिल्छ।`,
      confidence: 'medium',
      delta: stepAvg.toFixed(0)
    });
  }
  
  return insights;
}

/**
 * Generate a narrative monthly report
 */
export async function generateMonthlyNarrative(userId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const workouts = await prisma.workoutLog.count({
    where: {
      userId,
      date: { gte: thirtyDaysAgo }
    }
  });
  
  const stepLogs = await prisma.stepLog.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo }
    }
  });
  
  const avgSteps = stepLogs.length > 0
    ? (stepLogs.reduce((sum, log) => sum + log.steps, 0) / stepLogs.length).toFixed(0)
    : 0;
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: thirtyDaysAgo }
    }
  });
  
  const spent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const earned = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const saved = earned - spent;
  
  return {
    en: `This month you completed ${workouts} workouts and averaged ${avgSteps} steps daily. You earned रु ${earned.toFixed(0)} and saved रु ${saved.toFixed(0)}.`,
    np: `यो महिना तपाईंले ${workouts} workout पूरा गर्षु र दैनिक ${avgSteps} steps अब्पषा गर्षु। तपाईंले रु ${earned.toFixed(0)} कमायो र रु ${saved.toFixed(0)} बचत गर्षु।`
  };
}
