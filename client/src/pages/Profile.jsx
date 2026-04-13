import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import api from '../lib/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await api.get('/auth/me');
        setUserData(response.data);
        setEditData(response.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    }

    fetchUser();
  }, []);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Please select a smaller image.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large (max 800px width)
          if (width > 800) {
            height = (height * 800) / width;
            width = 800;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 80% quality
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          setEditData((prev) => ({
            ...prev,
            profilePicture: compressedImage
          }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch('/auth/profile', editData);
      setUserData(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

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
          {isEditing ? (
            <div className="mb-4">
              <label className="relative inline-block cursor-pointer">
                {editData.profilePicture ? (
                  <img
                    src={editData.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-teal/50 hover:border-teal transition"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-teal/20 border-4 border-teal/50 flex items-center justify-center text-6xl hover:bg-teal/30 transition">
                    👤
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <div className="absolute bottom-0 right-1/4 bg-teal p-2 rounded-full border-2 border-navy cursor-pointer hover:bg-teal/80 transition">
                  📷
                </div>
              </label>
              <p className="text-xs text-gray-400 mt-2">Click to upload photo</p>
            </div>
          ) : (
            <div className="mb-4">
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-teal/50"
                />
              ) : (
                <div className="text-6xl mb-4">👤</div>
              )}
            </div>
          )}
          <h1 className="text-3xl font-bold">{userData.name}</h1>
          <p className="text-gray-400 mt-2">{userData.email}</p>
        </div>

        {isEditing ? (
          <div className="space-y-4 mb-8 p-6 bg-teal/5 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-teal/10 border border-teal/30 rounded-lg focus:outline-none focus:border-teal text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={editData.age || ''}
                  onChange={(e) => setEditData((prev) => ({ ...prev, age: e.target.value }))}
                  className="w-full px-4 py-2 bg-teal/10 border border-teal/30 rounded-lg focus:outline-none focus:border-teal text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={editData.weight || ''}
                  onChange={(e) => setEditData((prev) => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-4 py-2 bg-teal/10 border border-teal/30 rounded-lg focus:outline-none focus:border-teal text-white"
                />
              </div>
            </div>
          </div>
        ) : (
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
        )}

        {!isEditing && (
          <div className="space-y-3 mb-6">
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
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          {isEditing ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="py-3 bg-green-600/20 border border-green-600/50 text-green-400 rounded-lg font-semibold hover:bg-green-600/30 transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </motion.button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(userData);
                }}
                className="py-3 bg-gray-600/20 border border-gray-600/50 text-gray-400 rounded-lg font-semibold hover:bg-gray-600/30 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="col-span-2 py-3 bg-teal/20 border border-teal/50 text-teal rounded-lg font-semibold hover:bg-teal/30 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg font-semibold hover:bg-red-600/30 transition"
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
