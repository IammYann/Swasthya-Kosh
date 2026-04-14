import PDFDocument from 'pdfkit';

/**
 * Generate a PDF report from report data
 * Returns a stream that can be piped to response
 */
export function generateReportPDF(reportData) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40
  });
  
  // Title and period
  doc.fontSize(24).font('Helvetica-Bold').text('Swasthya Kosh', { align: 'center' });
  doc.fontSize(16).font('Helvetica').text(reportData.period, { align: 'center' });
  doc.fontSize(12).text('Health & Wealth Report', { align: 'center' });
  doc.moveDown(0.5);
  
  const noteDate = new Date().toLocaleDateString();
  doc.fontSize(10).font('Helvetica-Oblique').text(`Generated: ${noteDate}`, { align: 'center' });
  doc.moveDown(1);
  
  // Draw separator line
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);
  
  // === HEALTH SECTION ===
  doc.fontSize(16).font('Helvetica-Bold').text('HEALTH SUMMARY', { align: 'left' });
  doc.moveDown(0.3);
  
  // Workouts
  doc.fontSize(12).font('Helvetica-Bold').text('Workouts');
  doc.fontSize(10).font('Helvetica');
  doc.text(`  • Total Workouts: ${reportData.health.workouts.total}`, { indent: 0 });
  doc.text(`  • Total Duration: ${reportData.health.workouts.totalDuration} minutes`, { indent: 0 });
  if (reportData.health.workouts.totalCalories > 0) {
    doc.text(`  • Calories Burned: ${reportData.health.workouts.totalCalories} kcal`, { indent: 0 });
  }
  if (reportData.health.workouts.avgDuration > 0) {
    doc.text(`  • Average Duration: ${reportData.health.workouts.avgDuration} minutes/workout`, { indent: 0 });
  }
  
  // Workout types
  const workoutTypes = Object.entries(reportData.health.workouts.byType || {}).length > 0
    ? Object.entries(reportData.health.workouts.byType)
      .map(([type, count]) => `${type} (${count})`)
      .join(', ')
    : 'No workouts logged';
  doc.fontSize(10).text(`  • Workout Types: ${workoutTypes}`, { indent: 0 });
  doc.moveDown(0.4);
  
  // Steps
  doc.fontSize(12).font('Helvetica-Bold').text('Steps');
  doc.fontSize(10).font('Helvetica');
  doc.text(`  • Total Steps: ${reportData.health.steps.total.toLocaleString()}`, { indent: 0 });
  doc.text(`  • Average Daily: ${reportData.health.steps.avgPerDay.toLocaleString()} steps`, { indent: 0 });
  doc.text(`  • Days Logged: ${reportData.health.steps.daysLogged}`, { indent: 0 });
  if (reportData.health.steps.maxDay > 0) {
    doc.text(`  • Peak Day: ${reportData.health.steps.maxDay.toLocaleString()} steps`, { indent: 0 });
  }
  doc.moveDown(0.4);
  
  // Nutrition
  doc.fontSize(12).font('Helvetica-Bold').text('Nutrition');
  doc.fontSize(10).font('Helvetica');
  doc.text(`  • Logs Recorded: ${reportData.health.nutrition.logsCount}`, { indent: 0 });
  doc.text(`  • Total Calories: ${reportData.health.nutrition.totalCalories.toLocaleString()} kcal`, { indent: 0 });
  doc.text(`  • Average/Day: ${reportData.health.nutrition.avgCaloriesPerDay.toLocaleString()} kcal`, { indent: 0 });
  if (reportData.health.nutrition.macros.protein > 0) {
    doc.text(`  • Macros: P:${reportData.health.nutrition.macros.protein}g | C:${reportData.health.nutrition.macros.carbs}g | F:${reportData.health.nutrition.macros.fat}g`, { indent: 0 });
  }
  doc.moveDown(0.4);
  
  // Body Metrics
  if (reportData.health.bodyMetrics.metricsLogged > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Body Metrics');
    doc.fontSize(10).font('Helvetica');
    doc.text(`  • Metrics Logged: ${reportData.health.bodyMetrics.metricsLogged}`, { indent: 0 });
    if (reportData.health.bodyMetrics.startWeight) {
      doc.text(`  • Start Weight: ${reportData.health.bodyMetrics.startWeight} kg`, { indent: 0 });
    }
    if (reportData.health.bodyMetrics.endWeight) {
      doc.text(`  • End Weight: ${reportData.health.bodyMetrics.endWeight} kg`, { indent: 0 });
    }
    if (reportData.health.bodyMetrics.weightChange !== 0) {
      const changeText = reportData.health.bodyMetrics.weightChange > 0
        ? `+${reportData.health.bodyMetrics.weightChange} kg (gained)`
        : `${reportData.health.bodyMetrics.weightChange} kg (lost)`;
      doc.text(`  • Change: ${changeText}`, { indent: 0 });
    }
    if (reportData.health.bodyMetrics.avgBMI) {
      doc.text(`  • Average BMI: ${reportData.health.bodyMetrics.avgBMI}`, { indent: 0 });
    }
  }
  
  // === PAGE BREAK OR SPACING ===
  if (doc.y > 650) {
    doc.addPage();
  } else {
    doc.moveDown(1);
  }
  
  // === FINANCE SECTION ===
  doc.fontSize(16).font('Helvetica-Bold').text('FINANCE SUMMARY', { align: 'left' });
  doc.moveDown(0.3);
  
  // Summary
  doc.fontSize(12).font('Helvetica-Bold').text('Income & Expenses');
  doc.fontSize(10).font('Helvetica');
  doc.text(`  • Total Income: ${reportData.finance.summary.totalIncome}`, { indent: 0 });
  doc.text(`  • Total Expenses: ${reportData.finance.summary.totalExpenses}`, { indent: 0 });
  doc.text(`  • Net Savings: ${reportData.finance.summary.netSavings}`, { indent: 0 });
  doc.text(`  • Savings Rate: ${reportData.finance.summary.savingsRate}`, { indent: 0 });
  doc.text(`  • Transactions: ${reportData.finance.transactionCount}`, { indent: 0 });
  doc.moveDown(0.4);
  
  // Top Categories
  if (reportData.finance.topCategories.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').text('Top Spending Categories');
    doc.fontSize(10).font('Helvetica');
    reportData.finance.topCategories.forEach((cat, idx) => {
      doc.text(`  ${idx + 1}. ${cat.category}: ${cat.amount}`, { indent: 0 });
    });
    doc.moveDown(0.4);
  }
  
  // Budget Analysis
  if (reportData.finance.budgetAnalysis.length > 0) {
    const budgets = reportData.finance.budgetAnalysis;
    if (doc.y > 650) {
      doc.addPage();
    }
    
    doc.fontSize(12).font('Helvetica-Bold').text('Budget Status');
    doc.fontSize(10).font('Helvetica');
    
    // Create simple budget table
    budgets.slice(0, 8).forEach(budget => {
      const status = budget.percentUsed <= 80 ? '[OK]' : budget.percentUsed > 100 ? '[OVER]' : '[HIGH]';
      doc.text(`  ${status} ${budget.category}: ${budget.spent} / ${budget.limit} (${budget.percentUsed}%)`, { indent: 0 });
    });
    
    if (budgets.length > 8) {
      doc.text(`  ... and ${budgets.length - 8} more categories`, { indent: 0 });
    }
    doc.moveDown(0.4);
  }
  
  // Accounts (if available)
  if (reportData.finance.accounts) {
    doc.fontSize(12).font('Helvetica-Bold').text('Account Summary');
    doc.fontSize(10).font('Helvetica');
    doc.text(`  • Total Accounts: ${reportData.finance.accounts.total}`, { indent: 0 });
    doc.text(`  • Total Balance: ${reportData.finance.accounts.totalBalance}`, { indent: 0 });
    doc.moveDown(0.4);
  }
  
  // Footer
  doc.moveDown(2);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.3);
  doc.fontSize(8).font('Helvetica-Oblique').text('This report was generated by Swasthya Kosh', { align: 'center' });
  doc.text('Track your health and wealth journey', { align: 'center' });
  
  return doc;
}
