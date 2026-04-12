import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import api from '../lib/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get('/auth/me');
        setUserData(response.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!userData) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-navy/50 border border-teal/20 rounded-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-3xl font-bold">{userData.name}</h1>
          <p className="text-gray-400 mt-2">{userData.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-teal/5 rounded-lg">
          <div>
            <p className="text-gray-400 text-sm mb-1">Age</p>
            <p className="text-2xl font-bold">{userData.age || '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Weight</p>
            <p className="text-2xl font-bold">{userData.weight ? `${userData.weight} kg` : '—'}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Currency</p>
            <p className="text-2xl font-bold">{userData.currency}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Member Since</p>
            <p className="text-sm">{new Date(userData.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg mb-4">Settings</h3>
          
          <div className="p-3 bg-teal/5 border border-teal/20 rounded-lg flex justify-between items-center">
            <span>Email Notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>

          <div className="p-3 bg-teal/5 border border-teal/20 rounded-lg flex justify-between items-center">
            <span>Daily Health Summary</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>

          <div className="p-3 bg-teal/5 border border-teal/20 rounded-lg flex justify-between items-center">
            <span>Budget Alerts</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-8 py-3 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg font-semibold hover:bg-red-600/30 transition"
        >
          Logout
        </button>

        <div className="mt-8 pt-6 border-t border-teal/20 text-center text-sm text-gray-500">
          <p>Made for Nepal 🇳🇵 | Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
