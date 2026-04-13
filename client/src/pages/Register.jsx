import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import api from '../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    weight: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' ? (value ? parseInt(value) : '') : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const { user, accessToken, refreshToken } = response.data;

      setAuth(user, accessToken, refreshToken);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy to-blue-900 flex items-center justify-center px-4 py-8 relative">
      {/* Home Button */}
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-teal hover:text-teal/80 transition">
        <span className="text-2xl">←</span>
        <span className="font-semibold">Back</span>
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <span>🏔️</span>
            <span>स्वास्थ्य कोष</span>
          </h1>
          <p className="text-gray-400">Create your Health & Wealth Journey</p>
        </div>

        <div className="bg-navy/50 border border-teal/30 backdrop-blur-md rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded-lg focus:outline-none focus:border-teal text-white placeholder-gray-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded-lg focus:outline-none focus:border-teal text-white placeholder-gray-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded-lg focus:outline-none focus:border-teal text-white placeholder-gray-500 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Age (optional)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="25"
                  className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded-lg focus:outline-none focus:border-teal text-white placeholder-gray-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight kg (optional)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded-lg focus:outline-none focus:border-teal text-white placeholder-gray-500 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
                {error}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gradient-to-r from-teal to-teal rounded-lg font-semibold text-navy hover:shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal hover:underline">
              Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
