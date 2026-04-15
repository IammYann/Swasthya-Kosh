import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import useLanguageStore from '../stores/languageStore';

const translations = {
  en: {
    notifications: 'Notifications',
    noNotifications: 'No notifications yet',
    allRead: 'All notifications marked as read',
    markAllRead: 'Mark All as Read',
    deleteAll: 'Delete All',
    budgetAlert: 'Budget Alert',
    goalAchieved: 'Goal Achieved',
    budgetAlertDesc: 'You have spent {amount}% of your {category} budget',
    goalAchievedDesc: 'Congratulations! You have achieved your goal: {goal}',
    delete: 'Delete',
    markRead: 'Mark as Read',
    markUnread: 'Mark as Unread',
    loading: 'Loading notifications...',
    error: 'Failed to load notifications'
  },
  np: {
    notifications: 'सूचनाहरू',
    noNotifications: 'अझैसम्म कुनै सूचना छैन',
    allRead: 'सबै सूचनाहरू पढिएको रूपमा चिन्हित गरिएको',
    markAllRead: 'सबै रूपमा पढिएको',
    deleteAll: 'सबै हटाउनुहोस्',
    budgetAlert: 'बजेट सतर्कता',
    goalAchieved: 'लक्ष्य उपलब्ध',
    budgetAlertDesc: 'तपाईंले आफ्नो {category} बजेटको {amount}% खर्च गर्नुभयो',
    goalAchievedDesc: 'बधाई छ! तपाईंले आफ्नो लक्ष्य प्राप्त गर्नुभयो: {goal}',
    delete: 'हटाउनुहोस्',
    markRead: 'पढिएको रूपमा चिन्हित गर्नुहोस्',
    markUnread: 'अपठित रूपमा चिन्हित गर्नुहोस्',
    loading: 'सूचनाहरू लोड गरिँदै...',
    error: 'सूचनाहरू लोड गर्न असफल'
  }
};

export default function Notifications() {
  const { language } = useLanguageStore();
  const t = translations[language] || translations.en;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const response = await api.get('/notifications', {
        params: {
          read: filter === 'unread' ? false : filter === 'read' ? true : undefined
        }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setMessage({ type: 'error', text: t.error });
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(
        notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await api.patch('/notifications/read/all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setMessage({ type: 'success', text: t.allRead });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }

  function getNotificationIcon(type) {
    if (type === 'budget_alert') {
      return '💰';
    } else if (type === 'goal_achieved') {
      return '🎉';
    }
    return '📢';
  }

  function formatNotificationMessage(notification) {
    if (notification.type === 'budget_alert' && notification.data) {
      try {
        const data = JSON.parse(notification.data);
        return notification.message;
      } catch (e) {
        return notification.message;
      }
    }
    return notification.message;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">{t.notifications}</h1>
          <p className="text-slate-400 mb-8">Stay updated with your Svasthya Kosh activity</p>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-6">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === f
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleMarkAllAsRead}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
              >
                {t.markAllRead}
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700"
              >
                <p className="text-slate-400 text-lg">{t.noNotifications}</p>
              </motion.div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all ${
                    notification.read
                      ? 'bg-slate-800/30 border-slate-700/50'
                      : 'bg-slate-800/80 border-teal-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-2xl mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          notification.read ? 'text-slate-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {formatNotificationMessage(notification)}
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}{' '}
                          {new Date(notification.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-teal-400 hover:bg-teal-500/20 rounded-lg transition-all"
                          title={t.markRead}
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        title={t.delete}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
