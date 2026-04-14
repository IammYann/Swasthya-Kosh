import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

export default function Reports() {
  const { t } = useTranslation();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/reports/monthly/${year}/${month}`;
      const response = await api.get(url);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReport();
  }, [year, month]);
  
  const downloadPDF = async () => {
    try {
      const url = `/reports/monthly/${year}/${month}/pdf`;
      
      const response = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Swasthya-Kosh-Report-${year}-${String(month).padStart(2, '0')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download PDF');
    }
  };
  
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('nav_reports')}</h1>
        <p className="text-gray-400">Track your health and wealth progress over time</p>
      </motion.div>
      
      {/* Filters */}
      <motion.div
        variants={itemVariants}
        className="bg-navy/50 border border-teal/20 rounded-xl p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-navy border border-teal/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-navy border border-teal/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadPDF}
              disabled={loading || !reportData}
              className="w-full px-4 py-2 bg-teal hover:bg-teal/80 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              Download PDF
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* Error */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-600/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400"
        >
          {error}
        </motion.div>
      )}
      
      {/* Loading */}
      {loading ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-12"
        >
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-2">Generating report...</p>
        </motion.div>
      ) : reportData ? (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* HEALTH SECTION */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-teal/20 to-teal/5 border border-teal/30 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Health Summary</h2>
            
            {/* Workouts */}
            <div className="mb-4 pb-4 border-b border-teal/30">
              <h3 className="font-semibold text-teal mb-2">Workouts</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Total: <span className="text-white">{reportData.health.workouts.total}</span></p>
                <p>Duration: <span className="text-white">{reportData.health.workouts.totalDuration} min</span></p>
                {reportData.health.workouts.totalCalories > 0 && (
                  <p>Calories: <span className="text-white">{reportData.health.workouts.totalCalories} kcal</span></p>
                )}
                {reportData.health.workouts.avgDuration > 0 && (
                  <p>Avg/Workout: <span className="text-white">{reportData.health.workouts.avgDuration} min</span></p>
                )}
                {Object.keys(reportData.health.workouts.byType || {}).length > 0 && (
                  <p className="mt-1">Types: <span className="text-white">
                    {Object.entries(reportData.health.workouts.byType)
                      .map(([type, count]) => `${type} (${count})`)
                      .join(', ')}
                  </span></p>
                )}
              </div>
            </div>
            
            {/* Steps */}
            <div className="mb-4 pb-4 border-b border-teal/30">
              <h3 className="font-semibold text-teal mb-2">Steps</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Total: <span className="text-white">{reportData.health.steps.total.toLocaleString()}</span></p>
                <p>Avg/Day: <span className="text-white">{reportData.health.steps.avgPerDay.toLocaleString()}</span></p>
                <p>Days Logged: <span className="text-white">{reportData.health.steps.daysLogged}</span></p>
                {reportData.health.steps.maxDay > 0 && (
                  <p>Peak Day: <span className="text-white">{reportData.health.steps.maxDay.toLocaleString()}</span></p>
                )}
              </div>
            </div>
            
            {/* Nutrition */}
            <div className="mb-4 pb-4 border-b border-teal/30">
              <h3 className="font-semibold text-teal mb-2">Nutrition</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Logs: <span className="text-white">{reportData.health.nutrition.logsCount}</span></p>
                <p>Total Calories: <span className="text-white">{reportData.health.nutrition.totalCalories.toLocaleString()} kcal</span></p>
                <p>Avg/Day: <span className="text-white">{reportData.health.nutrition.avgCaloriesPerDay.toLocaleString()} kcal</span></p>
                {reportData.health.nutrition.macros.protein > 0 && (
                  <p>Macros: <span className="text-white">P:{reportData.health.nutrition.macros.protein}g | C:{reportData.health.nutrition.macros.carbs}g | F:{reportData.health.nutrition.macros.fat}g</span></p>
                )}
              </div>
            </div>
            
            {/* Body Metrics */}
            {reportData.health.bodyMetrics.metricsLogged > 0 && (
              <div>
                <h3 className="font-semibold text-teal mb-2">Body Metrics</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Metrics: <span className="text-white">{reportData.health.bodyMetrics.metricsLogged}</span></p>
                  {reportData.health.bodyMetrics.startWeight && (
                    <p>Start: <span className="text-white">{reportData.health.bodyMetrics.startWeight} kg</span></p>
                  )}
                  {reportData.health.bodyMetrics.endWeight && (
                    <p>End: <span className="text-white">{reportData.health.bodyMetrics.endWeight} kg</span></p>
                  )}
                  {reportData.health.bodyMetrics.weightChange !== 0 && (
                    <p>Change: <span className={`${reportData.health.bodyMetrics.weightChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {reportData.health.bodyMetrics.weightChange > 0 ? '+' : ''}{reportData.health.bodyMetrics.weightChange} kg
                    </span></p>
                  )}
                  {reportData.health.bodyMetrics.avgBMI && (
                    <p>Avg BMI: <span className="text-white">{reportData.health.bodyMetrics.avgBMI}</span></p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
          
          {/* FINANCE SECTION */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-teal/20 to-teal/5 border border-teal/30 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Finance Summary</h2>
            
            {/* Summary */}
            <div className="mb-4 pb-4 border-b border-teal/30 bg-navy/30 rounded p-3">
              <h3 className="font-semibold text-teal mb-2">Overview</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Income: <span className="text-white">{reportData.finance.summary.totalIncome}</span></p>
                <p>Expenses: <span className="text-white">{reportData.finance.summary.totalExpenses}</span></p>
                <p>Savings: <span className={`${reportData.finance.summary.netSavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {reportData.finance.summary.netSavings}
                </span></p>
                <p>Savings Rate: <span className="text-white">{reportData.finance.summary.savingsRate}</span></p>
                <p>Transactions: <span className="text-white">{reportData.finance.transactionCount}</span></p>
              </div>
            </div>
            
            {/* Top Categories */}
            {reportData.finance.topCategories.length > 0 && (
              <div className="mb-4 pb-4 border-b border-teal/30">
                <h3 className="font-semibold text-teal mb-2">Top Spending</h3>
                <div className="text-sm text-gray-400 space-y-1">
                  {reportData.finance.topCategories.map((cat, idx) => (
                    <p key={idx}>{idx + 1}. {cat.category}: <span className="text-white">{cat.amount}</span></p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Budget Status */}
            {reportData.finance.budgetAnalysis.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-teal mb-2">Budget Status</h3>
                <div className="space-y-2">
                  {reportData.finance.budgetAnalysis.slice(0, 5).map((budget, idx) => {
                    const bgColor = budget.percentUsed <= 80 
                      ? 'bg-green-600/20' 
                      : budget.percentUsed > 100 
                        ? 'bg-red-600/20' 
                        : 'bg-yellow-600/20';
                    const barColor = budget.percentUsed > 100 
                      ? 'bg-red-500' 
                      : budget.percentUsed > 80 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500';
                    
                    return (
                      <div key={idx} className={`p-2 rounded ${bgColor}`}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{budget.category}</span>
                          <span className="text-white">{budget.percentUsed}%</span>
                        </div>
                        <div className="w-full bg-navy/60 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${barColor}`}
                            style={{ width: `${Math.min(100, budget.percentUsed)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{budget.spent} / {budget.limit}</span>
                        </div>
                      </div>
                    );
                  })}
                  {reportData.finance.budgetAnalysis.length > 5 && (
                    <p className="text-xs text-gray-500">... and {reportData.finance.budgetAnalysis.length - 5} more</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
