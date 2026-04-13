import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../stores/authStore';
import api from '../lib/api';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [lifeScore, setLifeScore] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [scoreRes, profileRes] = await Promise.all([
          api.get('/insights'),
          api.get('/auth/me')
        ]);
        setLifeScore(scoreRes.data.score);
        setProfilePicture(profileRes.data.profilePicture);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    }
    
    fetchData();
    
    // Refresh Life Score every 10 seconds
    const interval = setInterval(fetchData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'np' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-navy/95 backdrop-blur border-b border-teal/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/app" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-teal">🏔️</span>
            <span className="text-xl font-bold">{t('app_title')}</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/app" className="hover:text-teal transition">
              {t('nav_dashboard')}
            </Link>
            <Link to="/app/finance" className="hover:text-teal transition">
              {t('nav_finance')}
            </Link>
            <Link to="/app/health" className="hover:text-teal transition">
              {t('nav_health')}
            </Link>
            <Link to="/app/insights" className="hover:text-teal transition">
              {t('nav_insights')}
            </Link>

            {lifeScore !== null && (
              <div className="px-4 py-1 rounded-full bg-teal/10 border border-teal text-teal text-sm font-semibold">
                Score: {lifeScore}/100
              </div>
            )}

            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded bg-teal/20 hover:bg-teal/30 transition text-sm"
            >
              {i18n.language === 'en' ? 'नेपाली' : 'English'}
            </button>

            <Link to="/app/profile" className="hover:opacity-80 transition">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-teal/50"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-teal/20 border-2 border-teal/50 flex items-center justify-center text-lg">
                  👤
                </div>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-1 rounded bg-red-600/20 hover:bg-red-600/30 transition text-sm"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
