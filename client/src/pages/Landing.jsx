import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { emailNotificationAPI } from '../lib/api';
import { ChevronDown } from 'lucide-react';

const FEATURES = [
  { icon: '💰', label: 'Expense Tracking', desc: 'Track every rupee' },
  { icon: '🏃', label: 'Fitness Log', desc: 'Daily activity tracking' },
  { icon: '🧠', label: 'AI Insights', desc: 'Smart correlations' },
  { icon: '📊', label: 'Life Score', desc: 'Your wellness meter' },
  { icon: '🔔', label: 'Smart Alerts', desc: 'Budget notifications' },
  { icon: '🔐', label: 'Bank Security', desc: 'Enterprise-grade' },
];

const TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Finance Manager',
    image: '👨‍💼',
    text: 'Svasthya Kosh changed how I manage my finances. The Life Score metric is brilliant!',
    rating: 5
  },
  {
    name: 'Priya Sharma',
    role: 'Fitness Enthusiast',
    image: '👩‍⚕️',
    text: 'Finally an app that combines health and wealth! The AI insights are spot-on.',
    rating: 5
  },
  {
    name: 'Arjun Paudel',
    role: 'Business Owner',
    image: '👨‍💼',
    text: 'The best health and wealth tracker for Nepali people. Highly recommended!',
    rating: 5
  },
  {
    name: 'Anita Joshi',
    role: 'Student',
    image: '👩‍🎓',
    text: 'Easy to use, bilingual interface, and actually helpful. Love it!',
    rating: 5
  },
];

const FAQS = [
  {
    question: 'What is Life Score?',
    answer: 'Life Score is a unified metric that combines your fitness and wealth scores into a single number (0-100). It helps you understand your overall wellness and financial health at a glance.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes! We use enterprise-grade encryption (AES-256) and secure authentication with JWT tokens. Your data is never shared with third parties without your consent.'
  },
  {
    question: 'Can I use it in Nepali?',
    answer: 'Absolutely! Svasthya Kosh is fully bilingual with complete Nepali and English interfaces. Switch languages anytime from settings.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, you get a 30-day free trial with full access to all features. No credit card required to get started.'
  },
  {
    question: 'How does AI insight work?',
    answer: 'Our Claude-powered AI analyzes your health and wealth data to find correlations and patterns. For example, it might notice how your exercise affects your sleep and mood.'
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes, you can generate PDF reports with your health and financial data. Download them anytime from the Reports section.'
  },
];

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

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
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
            style={{
              backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #00D4B4 50%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 5px 15px rgba(0, 212, 180, 0.1))'
            }}
          >
            तपाईंको स्वास्थ्य र सम्पत्ति
            <span className="block" style={{
              backgroundImage: 'linear-gradient(135deg, #00D4B4 0%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>एउटै ठाउँमा</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-300 mb-8 font-medium"
            style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)' }}
          >
            Track your health and wealth — together.
            <br />
            <span className="text-teal font-semibold">AI-powered insights for Nepali people.</span>
          </motion.p>

          <motion.div variants={itemVariants} className="flex gap-4 justify-center flex-wrap">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-teal to-cyan-400 rounded-lg font-bold text-navy text-lg transition-all duration-300 shadow-lg hover:shadow-[0_0_40px_rgba(0,212,180,0.8)]"
              >
                Start Free Trial
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05, borderColor: '#00D4B4' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: document.body.scrollHeight * 0.35, behavior: 'smooth' })}
              className="px-8 py-3 border-2 border-teal rounded-lg font-bold hover:bg-teal/10 transition text-lg shadow-[0_0_20px_rgba(0,212,180,0.3)] hover:shadow-[0_0_30px_rgba(0,212,180,0.6)]"
            >
              Watch Demo
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
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{
              backgroundImage: 'linear-gradient(135deg, #00D4B4 0%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 12px rgba(0, 212, 180, 0.15))'
            }}>One Number. Your Entire Life.</h2>
            <p className="text-gray-300 text-lg font-medium" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}>Life Score combines your health and wealth into one meaningful metric</p>
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
            <div className="p-6 rounded-lg border border-teal/20 bg-teal/5 hover:border-teal/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,212,180,0.2)] hover:bg-teal/10 cursor-default" style={{ perspective: '1000px' }}>
              <p className="text-lg font-bold text-teal mb-2">Fitness Score</p>
              <p className="text-3xl font-black mb-2" style={{
                backgroundImage: 'linear-gradient(135deg, #00D4B4 0%, #0ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>72/100</p>
              <p className="text-sm text-gray-400 font-medium">Workouts + Steps + Nutrition</p>
            </div>
            <div className="p-6 rounded-lg border border-gold/20 bg-gold/5 hover:border-gold/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,166,35,0.2)] hover:bg-gold/10 cursor-default" style={{ perspective: '1000px' }}>
              <p className="text-lg font-bold text-gold mb-2">Wealth Score</p>
              <p className="text-3xl font-black mb-2" style={{
                backgroundImage: 'linear-gradient(135deg, #F5A623 0%, #ffa500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>84/100</p>
              <p className="text-sm text-gray-400 font-medium">Savings + Budget + Net Worth</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-12 flex gap-4 justify-center"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-teal text-navy rounded-lg font-bold hover:shadow-lg transition"
              >
                Calculate Your Score
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4">
        <div className="max-w-6xl mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-center mb-16"
            style={{
              backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #00D4B4 50%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 12px rgba(0, 212, 180, 0.15))'
            }}
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
                whileHover={{ y: -10 }}
                className="p-8 rounded-xl border border-teal/20 bg-navy/50 hover:bg-teal/5 transition-all duration-300 hover:border-teal/50 hover:shadow-[0_0_25px_rgba(0,212,180,0.3)] group cursor-pointer"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-teal transition-colors duration-300">{feature.label}</h3>
                <p className="text-gray-400 text-sm font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{
              backgroundImage: 'linear-gradient(135deg, #00D4B4 0%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 12px rgba(0, 212, 180, 0.15))'
            }}>See It In Action</h2>
            <p className="text-xl text-gray-300 font-medium" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}>Watch how Svasthya Kosh works in 2 minutes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-navy/50 border border-teal/30 rounded-2xl p-8 overflow-hidden shadow-2xl hover:shadow-[0_0_40px_rgba(0,212,180,0.4)] transition-all duration-300 hover:border-teal/50"
          >
            <div className="aspect-video bg-navy/80 rounded-lg flex items-center justify-center relative group hover:shadow-inner">
              {/* Placeholder - Replace with actual video embed */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal/20 to-transparent rounded-lg"></div>
              <div className="text-center z-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-teal/20 rounded-full flex items-center justify-center group-hover:bg-teal/40 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,212,180,0.6)] group-hover:scale-110">
                  <div className="w-0 h-0 border-l-8 border-l-transparent border-r-0 border-t-5 border-t-transparent border-b-5 border-b-transparent ml-2" 
                    style={{borderLeftColor: '#00D4B4', borderTopColor: '#00D4B4', borderBottomColor: '#00D4B4'}}></div>
                </div>
                <p className="text-white font-semibold">Demo Video (2 min)</p>
                <p className="text-gray-400 text-sm mt-2">See the full app walkthrough</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-teal text-navy rounded-lg font-bold hover:shadow-lg transition"
              >
                Get Started For Free
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{
              backgroundImage: 'linear-gradient(135deg, #00D4B4 0%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 12px rgba(0, 212, 180, 0.15))'
            }}>Loved by Nepali Users</h2>
            <p className="text-xl text-gray-300 font-medium" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}>Join 5,000+ people improving their health and wealth</p>
          </motion.div>

          {/* User Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          >
            <motion.div
              variants={itemVariants}
              className="p-8 bg-gradient-to-br from-teal/20 to-teal/5 border border-teal/30 rounded-2xl text-center"
            >
              <div className="text-5xl font-bold text-teal mb-2">5,000+</div>
              <p className="text-gray-300 text-lg">Active Users</p>
              <p className="text-gray-400 text-sm mt-2">Across Nepal</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-8 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 rounded-2xl text-center"
            >
              <div className="text-5xl font-bold text-gold mb-2">रु 2.5 क्र</div>
              <p className="text-gray-300 text-lg">Tracked Monthly</p>
              <p className="text-gray-400 text-sm mt-2">In transactions</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-8 bg-gradient-to-br from-green-400/20 to-green-400/5 border border-green-400/30 rounded-2xl text-center"
            >
              <div className="text-5xl font-bold text-green-400 mb-2">4.9★</div>
              <p className="text-gray-300 text-lg">User Rating</p>
              <p className="text-gray-400 text-sm mt-2">500+ reviews</p>
            </motion.div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="p-8 border border-teal/20 bg-navy/50 rounded-2xl backdrop-blur hover:bg-teal/5 transition-all duration-300 hover:border-teal/50 hover:shadow-[0_0_25px_rgba(0,212,180,0.2)] group cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{testimonial.image}</div>
                  <div>
                    <p className="font-bold text-white group-hover:text-teal transition-colors duration-300">{testimonial.name}</p>
                    <p className="text-teal text-sm font-medium">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-gold text-lg group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${j * 30}ms` }}>★</span>
                  ))}
                </div>
                <p className="text-gray-300 italic font-medium" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 0.1)' }}>"{testimonial.text}"</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="min-h-screen flex items-center justify-center relative px-4 py-16">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{
              backgroundImage: 'linear-gradient(135deg, #00D4B4 0%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 12px rgba(0, 212, 180, 0.15))'
            }}>Frequently Asked Questions</h2>
            <p className="text-xl text-gray-300 font-medium" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}>Got questions? We've got answers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="space-y-4"
          >
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-teal/20 rounded-lg bg-navy/50 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-teal/10 transition-all duration-300 hover:text-teal font-semibold"
                >
                  <span className="text-lg font-semibold text-white text-left">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-teal" />
                  </motion.div>
                </button>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: openFaq === i ? 'auto' : 0,
                    opacity: openFaq === i ? 1 : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 border-t border-teal/20 bg-teal/5">
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mt-12"
          >
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <a href="mailto:support@svasthya-kosh.app" className="text-teal hover:underline font-semibold">
              Contact our support team
            </a>
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
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{
              backgroundImage: 'linear-gradient(135deg, #00D4B4 0%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 12px rgba(0, 212, 180, 0.15))'
            }}>सुरु गरौं</h2>
            <p className="text-xl text-gray-300 mb-8 font-medium" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' }}>
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
