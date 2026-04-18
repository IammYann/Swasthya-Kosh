import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { emailNotificationAPI } from '../lib/api';

const FEATURES = [
  { icon: '💰', label: 'Expense Tracking', desc: 'Track every rupee' },
  { icon: '🏃', label: 'Fitness Log', desc: 'Daily activity tracking' },
  { icon: '🧠', label: 'AI Insights', desc: 'Smart correlations' },
  { icon: '📊', label: 'Life Score', desc: 'Your wellness meter' },
  { icon: '🔔', label: 'Smart Alerts', desc: 'Budget notifications' },
  { icon: '🔐', label: 'Bank Security', desc: 'Enterprise-grade' },
];

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState(null);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const windowScroll = window.scrollY;
      setScrollProgress(windowScroll / totalScroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStartedSubmit = async (e) => {
    e.preventDefault();
    const email = emailInput.trim();
    
    if (!email) return;
    
    setEmailLoading(true);
    setEmailMessage(null);

    try {
      await emailNotificationAPI.sendWelcomeEmail(email);
      setEmailMessage({
        type: 'success',
        text: `Welcome email sent to ${email}! Check your inbox.`
      });
      setEmailInput('');
      setTimeout(() => setEmailMessage(null), 5000);
    } catch (error) {
      setEmailMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to send email. Please try again.'
      });
      setTimeout(() => setEmailMessage(null), 5000);
    } finally {
      setEmailLoading(false);
    }
  };

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
    <div className="bg-navy text-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-navy/80 backdrop-blur border-b border-teal/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-teal"></span>
              <span className="text-xl font-bold">स्वास्थ्य कोष</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg font-semibold text-teal border border-teal hover:bg-teal/10 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-teal to-teal text-navy hover:shadow-lg transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 pt-16">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center z-10"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="text-7xl"></span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            तपाईंको स्वास्थ्य र सम्पत्ति
            <span className="block text-teal">एउटै ठाउँमा</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 mb-8"
          >
            Track your health and wealth — together.
            <br />
            <span className="text-teal">AI-powered insights for Nepali people.</span>
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 212, 180, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-teal to-teal rounded-lg font-bold text-navy hover:shadow-lg transition text-lg"
              >
                Start Free
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05, borderColor: '#00D4B4' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border-2 border-teal rounded-lg font-bold hover:bg-teal/10 transition text-lg"
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 mt-16 text-sm"
          >
            <div className="p-4 bg-teal/10 border border-teal/20 rounded-lg">
              <p className="text-gold font-bold text-lg">Life Score: 78/100</p>
              <p className="text-gray-400 text-xs mt-1">Your wellness metric</p>
            </div>
            <div className="p-4 bg-teal/10 border border-teal/20 rounded-lg">
              <p className="text-green-400 font-bold text-lg">रु 45,200</p>
              <p className="text-gray-400 text-xs mt-1">Saved this month</p>
            </div>
            <div className="p-4 bg-teal/10 border border-teal/20 rounded-lg">
              <p className="text-blue-400 font-bold text-lg">4,200 steps</p>
              <p className="text-gray-400 text-xs mt-1">Today's activity</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Life Score Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">One Number. Your Entire Life.</h2>
            <p className="text-gray-400 text-lg">Life Score combines your health and wealth into one meaningful metric</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative w-64 h-64 mx-auto mb-12"
          >
            <svg className="w-full h-full" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 212, 180, 0.1)" strokeWidth="2" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(0, 212, 180, 0.2)" strokeWidth="2" />
              <motion.circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#00D4B4"
                strokeWidth="3"
                strokeDasharray="534"
                initial={{ strokeDashoffset: 534 }}
                whileInView={{ strokeDashoffset: 160 }}
                transition={{ duration: 2 }}
              />
              <text x="100" y="110" textAnchor="middle" fontSize="48" fontWeight="bold" fill="#00D4B4">
                78
              </text>
              <text x="100" y="130" textAnchor="middle" fontSize="16" fill="#999">
                /100
              </text>
            </svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto"
          >
            <div className="p-6 rounded-lg border border-teal/20 bg-teal/5">
              <p className="text-lg font-semibold text-teal mb-2">Fitness Score</p>
              <p className="text-3xl font-bold mb-2">72/100</p>
              <p className="text-sm text-gray-400">Workouts + Steps + Nutrition</p>
            </div>
            <div className="p-6 rounded-lg border border-gold/20 bg-gold/5">
              <p className="text-lg font-semibold text-gold mb-2">Wealth Score</p>
              <p className="text-3xl font-bold mb-2">84/100</p>
              <p className="text-sm text-gray-400">Savings + Budget + Net Worth</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4">
        <div className="max-w-6xl mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Everything You Need
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10, borderColor: '#00D4B4' }}
                className="p-8 rounded-xl border border-teal/20 bg-navy/50 hover:bg-teal/5 transition"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.label}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">सुरु गरौं</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of Nepali people taking control of their health and wealth.
            </p>

            <motion.form
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-12"
              onSubmit={handleGetStartedSubmit}
            >
              <input
                type="email"
                placeholder="Your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-navy/50 border border-teal/30 rounded-lg focus:border-teal focus:outline-none"
                required
                disabled={emailLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={emailLoading}
                className="px-8 py-3 bg-teal text-navy rounded-lg font-bold hover:bg-teal/90 disabled:opacity-50"
              >
                {emailLoading ? 'Sending...' : 'Get Started'}
              </motion.button>
            </motion.form>

            {emailMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-3 rounded-lg text-sm font-semibold ${
                  emailMessage.type === 'success'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                    : 'bg-red-500/20 text-red-300 border border-red-500/50'
                }`}
              >
                {emailMessage.text}
              </motion.div>
            )}

            <p className="text-sm text-gray-400">
              Made for Nepal 🇳🇵 | <a href="#" className="text-teal hover:underline">Privacy Policy</a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
