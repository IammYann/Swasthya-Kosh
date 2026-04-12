import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';

export default function Dashboard() {
  const [lifeScore, setLifeScore] = useState(null);
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [scoreRes, summaryRes, accountsRes, insightsRes, stepsRes] = await Promise.all([
          api.get('/insights'),
          api.get('/transactions/summary/month'),
          api.get('/accounts'),
          api.get('/insights/correlations'),
          api.get('/health/steps')
        ]);

        setLifeScore(scoreRes.data);
        setSummary(summaryRes.data);
        setAccounts(accountsRes.data);
        setInsights(insightsRes.data.insights);
        
        // Get today's steps
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStepLog = stepsRes.data.find(log => {
          const logDate = new Date(log.date);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === today.getTime();
        });
        setTodaySteps(todayStepLog?.steps || 0);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    
    // Refresh Life Score every 10 seconds
    const interval = setInterval(() => {
      api.get('/insights').then(res => setLifeScore(res.data)).catch(err => console.error('Failed to update life score:', err));
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Category data for pie chart
  const categoryData = summary?.byCategory
    ? Object.entries(summary.byCategory).map(([name, data]) => ({
        name,
        value: data.expense
      }))
    : [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Life Score and Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Life Score */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 md:col-span-2 bg-gradient-to-br from-teal/20 to-teal/5 border border-teal/30 rounded-xl p-6"
        >
          <h3 className="text-gray-400 text-sm mb-2">Life Score</h3>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold text-teal">{lifeScore?.score || 0}</div>
            <div className="text-gray-400 mb-2">/ 100</div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Fitness: {lifeScore?.fitnessScore || 0}</span>
              <span className="text-teal">●</span>
            </div>
            <div className="flex justify-between">
              <span>Wealth: {lifeScore?.wealthScore || 0}</span>
              <span className="text-gold">●</span>
            </div>
          </div>
        </motion.div>

        {/* Net Worth */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 rounded-xl p-6"
        >
          <h3 className="text-gray-400 text-sm mb-2">रु Net Worth</h3>
          <p className="text-3xl font-bold text-blue-400">{netWorth.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">{accounts.length} accounts</p>
        </motion.div>

        {/* Today's Spending */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-600/30 rounded-xl p-6"
        >
          <h3 className="text-gray-400 text-sm mb-2">Today's Spent</h3>
          <p className="text-3xl font-bold text-red-400">रु {summary?.expense || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Monthly: रु {summary?.expense}</p>
        </motion.div>

        {/* Daily Steps */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-600/30 rounded-xl p-6"
        >
          <h3 className="text-gray-400 text-sm mb-2">Daily Steps</h3>
          <p className="text-3xl font-bold text-green-400">{todaySteps.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Today</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Spending by Category */}
        <motion.div
          variants={itemVariants}
          className="bg-navy/50 border border-teal/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: रु${value}`}
                  outerRadius={80}
                  fill="#00D4B4"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#00D4B4', '#F5A623', '#FF6B6B', '#4ECDC4'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `रु ${value}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No spending data yet</p>
          )}
        </motion.div>

        {/* Monthly Summary */}
        <motion.div
          variants={itemVariants}
          className="bg-navy/50 border border-teal/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Income</span>
                <span className="text-green-400 font-semibold">रु {(summary?.income || 0).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Expense</span>
                <span className="text-red-400 font-semibold">रु {(summary?.expense || 0).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Savings</span>
                <span className="text-teal font-semibold">रु {(summary?.net || 0).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-teal h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-navy/50 border border-teal/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">📊 AI Insights</h3>
          <div className="space-y-4">
            {insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="p-4 bg-teal/5 border border-teal/20 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{insight.type === 'spending_workout_correlation' ? '💪' : '📈'}</h4>
                  <span className="text-xs bg-teal/20 px-2 py-1 rounded capitalize">{insight.confidence}</span>
                </div>
                <p className="text-sm">{insight.message_np}</p>
                <p className="text-xs text-gray-400 mt-1">{insight.message_en}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
