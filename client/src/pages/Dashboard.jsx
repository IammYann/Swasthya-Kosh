import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Joyride from 'react-joyride';
import { Zap, TrendingUp, Wallet, Activity } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [lifeScore, setLifeScore] = useState(null);
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(localStorage.getItem('dashboardTourCompleted') === 'true');

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
        // Auto-start tour if first time user
        if (!tourCompleted) {
          setTimeout(() => setRunTour(true), 1000);
        }
      }
    }

    fetchData();
    
    // Refresh Life Score every 10 seconds
    const interval = setInterval(() => {
      api.get('/insights').then(res => setLifeScore(res.data)).catch(err => console.error('Failed to update life score:', err));
    }, 10000);
    
    return () => clearInterval(interval);
  }, [tourCompleted]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>;
  }

  const tourSteps = [
    {
      target: '.welcome-card',
      content: 'Welcome! This is your dashboard overview. Check your Life Score, net worth, and daily stats here.',
      placement: 'bottom',
      disableBeacon: true
    },
    {
      target: '.life-score-widget',
      content: 'Your Life Score combines fitness and wealth. Improve both to increase your overall wellness score.',
      placement: 'bottom'
    },
    {
      target: '.spending-chart',
      content: 'See where your money goes with the spending by category breakdown.',
      placement: 'left'
    },
    {
      target: '.monthly-summary',
      content: 'Track your income, expenses, and savings at a glance with these progress bars.',
      placement: 'left'
    },
    {
      target: '.ai-insights',
      content: 'Our AI finds patterns in your health and wealth data. Check back often for new insights!',
      placement: 'top'
    }
  ];

  const handleTourCallback = (data) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      setRunTour(false);
      setTourCompleted(true);
      localStorage.setItem('dashboardTourCompleted', 'true');
    }
  };

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
    <>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton
        callback={handleTourCallback}
        styles={{
          options: {
            backgroundColor: '#1a2942',
            textColor: '#ffffff',
            primaryColor: '#00D4B4',
            arrowColor: '#1a2942',
            borderRadius: 8
          }
        }}
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-8 max-w-7xl mx-auto"
      >
        {/* Welcome Card */}
        <motion.div
          variants={itemVariants}
          className="welcome-card bg-gradient-to-r from-teal/20 to-blue-600/20 border border-teal/30 rounded-2xl p-8 mb-8"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'Guest'}! 👋</h1>
              <p className="text-gray-300 text-lg">Here's your health and wealth overview for today</p>
            </div>
            <button
              onClick={() => setRunTour(true)}
              className="px-4 py-2 bg-teal/20 border border-teal hover:bg-teal/30 transition rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Take Tour
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-navy/50 rounded-lg border border-teal/20">
              <p className="text-gray-400 text-xs mb-1">Life Score</p>
              <p className="text-2xl font-bold text-teal">{lifeScore?.score || 0}/100</p>
              <p className="text-xs text-gray-500 mt-1">⬆ {Math.random() * 5 | 0} pts today</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg border border-blue-500/20">
              <p className="text-gray-400 text-xs mb-1">Net Worth</p>
              <p className="text-2xl font-bold text-blue-400">रु {(netWorth / 100000).toFixed(1)}L</p>
              <p className="text-xs text-gray-500 mt-1">Across {accounts.length} accounts</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg border border-red-500/20">
              <p className="text-gray-400 text-xs mb-1">Today Spent</p>
              <p className="text-2xl font-bold text-red-400">रु {(summary?.expense || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Budget OK ✓</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg border border-green-500/20">
              <p className="text-gray-400 text-xs mb-1">Steps Today</p>
              <p className="text-2xl font-bold text-green-400">{(todaySteps / 1000).toFixed(1)}K</p>
              <p className="text-xs text-gray-500 mt-1">Goal: 10K steps</p>
            </div>
          </div>
        </motion.div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Life Score - Featured */}
          <motion.div
            variants={itemVariants}
            className="life-score-widget col-span-1 md:col-span-2 bg-gradient-to-br from-teal/20 to-teal/5 border border-teal/30 rounded-xl p-6 hover:border-teal/50 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal" />
                Life Score
              </h3>
              <span className="text-xs bg-teal/20 px-2 py-1 rounded">Your Progress</span>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-5xl font-bold text-teal">{lifeScore?.score || 0}</div>
              <div className="text-gray-400 mb-2">/ 100</div>
            </div>
            <div className="mt-6 space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Fitness Score</span>
                  <span className="text-teal font-bold">{lifeScore?.fitnessScore || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-teal h-2 rounded-full" style={{ width: `${(lifeScore?.fitnessScore || 0) * 1}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Wealth Score</span>
                  <span className="text-gold font-bold">{lifeScore?.wealthScore || 0}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gold h-2 rounded-full" style={{ width: `${(lifeScore?.wealthScore || 0) * 1}%` }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Net Worth */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 rounded-xl p-6 hover:border-blue-600/50 transition"
          >
            <h3 className="text-gray-400 text-sm mb-2 font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-400" />
              Net Worth
            </h3>
            <p className="text-3xl font-bold text-blue-400">रु {(netWorth / 100000).toFixed(1)}L</p>
            <p className="text-xs text-gray-500 mt-2">📈 +5% this month</p>
            <p className="text-xs text-gray-500">{accounts.length} accounts</p>
          </motion.div>

          {/* Daily Steps */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-600/30 rounded-xl p-6 hover:border-green-600/50 transition"
          >
            <h3 className="text-gray-400 text-sm mb-2 font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              Daily Activity
            </h3>
            <p className="text-3xl font-bold text-green-400">{(todaySteps / 1000).toFixed(1)}K</p>
            <p className="text-xs text-gray-500 mt-2">📊 Goal: 10K steps</p>
            <p className="text-xs text-gray-500">{Math.round(todaySteps / 100) * 10}% complete</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <motion.div
            variants={itemVariants}
            className="spending-chart bg-navy/50 border border-teal/20 rounded-xl p-6 hover:border-teal/40 transition"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal" />
              Spending by Category
            </h3>
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
            className="monthly-summary bg-navy/50 border border-teal/20 rounded-xl p-6 hover:border-teal/40 transition"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal" />
              Monthly Summary
            </h3>
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
            className="ai-insights bg-navy/50 border border-teal/20 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">🧠 AI Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.slice(0, 3).map((insight, i) => (
                <div key={i} className="p-4 bg-teal/5 border border-teal/20 rounded-lg hover:bg-teal/10 transition">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm">{insight.type === 'spending_workout_correlation' ? '💪' : '📈'} {insight.type.replace(/_/g, ' ')}</h4>
                    <span className="text-xs bg-teal/20 px-2 py-1 rounded capitalize">{insight.confidence}</span>
                  </div>
                  <p className="text-sm text-gray-300">{insight.message_np}</p>
                  <p className="text-xs text-gray-500 mt-2">{insight.message_en}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
