import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';
import useLanguageStore from '../stores/languageStore';

const translations = {
  en: {
    settings: 'Settings',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Manage how you receive email updates from Svasthya Kosh',
    enableNotifications: 'Enable Email Notifications',
    budgetAlerts: 'Budget Alerts',
    budgetAlertsDesc: 'Get notified when spending approaches your budget limits',
    goalNotifications: 'Goal Achievements',
    goalNotificationsDesc: 'Notifications when you achieve your health and financial goals',
    digestEmails: 'Digest Emails',
    daily: 'Daily',
    weekly: 'Weekly',
    disabled: 'Disabled',
    dailyDigest: 'Receive a daily summary of your activities',
    weeklyDigest: 'Receive a weekly summary every Sunday',
    saving: 'Saving...',
    saved: 'Preferences saved successfully!',
    error: 'Failed to save preferences',
    testEmail: 'Send Test Email',
    sendDailyDigest: 'Send Daily Digest',
    sendWeeklyDigest: 'Send Weekly Digest',
    emailSent: 'Test email sent! Check your inbox.',
    lastDigestSent: 'Last digest email sent',
    notificationCenter: 'Notification Center',
    viewAllNotifications: 'View all in-app notifications',
    unreadNotifications: 'Unread notifications'
  },
  np: {
    settings: 'सेटिङ्गहरू',
    emailNotifications: 'ईमेल सूचनाहरू',
    emailNotificationsDesc: 'Svasthya Kosh बाट ईमेल अपडेटहरू कसरी प्राप्त गर्ने तामध्ये प्रबन्ध गर्नुहोस्',
    enableNotifications: 'ईमेल सूचनाहरू सक्षम गर्नुहोस्',
    budgetAlerts: 'बजेट सतर्कताहरू',
    budgetAlertsDesc: 'जब खर्च आपुनो बजेट सीमा सल्लाधिको निकट आचेको विषयमा सूचित हुनुहोस्',
    goalNotifications: 'लक्ष्य उपलब्धी सूचनाहरू',
    goalNotificationsDesc: 'जब आप आपुनो स्वास्थ्य र आर्थिक लक्ष्य उपलब्ध गर्दा सूचनाहरू',
    digestEmails: 'डाइजेस्ट ईमेलहरू',
    daily: 'दैनिक',
    weekly: 'साप्ताहिक',
    disabled: 'अक्षम',
    dailyDigest: 'आपुनो गतिविधिहरूको दैनिक सारांश प्राप्त गर्नुहोस्',
    weeklyDigest: 'हरेक आइतबार साप्ताहिक सारांश प्राप्त गर्नुहोस्',
    saving: 'सेभ गरिँदै...',
    saved: 'प्राथमिकताहरू सफलतापूर्वक सेभ गरिएको!',
    error: 'प्राथमिकताहरू सेभ गर्न असफल',
    testEmail: 'परीक्षण ईमेल पठाउनुहोस्',
    sendDailyDigest: 'दैनिक डाइजेस्ट पठाउनुहोस्',
    sendWeeklyDigest: 'साप्ताहिक डाइजेस्ट पठाउनुहोस्',
    emailSent: 'परीक्षण ईमेल पठाइएको! आपुनो इनबक्स जाँच गर्नुहोस्।',
    lastDigestSent: 'अन्तिम डाइजेस्ट ईमेल पठाइएको',
    notificationCenter: 'सूचना केन्द्र',
    viewAllNotifications: 'सबै इन-अ्याप सूचनाहरू हेर्नुहोस्',
    unreadNotifications: 'अपठित सूचनाहरू'
  }
};

export default function Settings() {
  const { language } = useLanguageStore();
  const t = translations[language] || translations.en;

  const [preferences, setPreferences] = useState({
    emailNotificationsEnabled: true,
    budgetAlertsEnabled: true,
    goalsNotificationsEnabled: true,
    digestEmailFrequency: 'weekly'
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [testingDigest, setTestingDigest] = useState(null);

  useEffect(() => {
    fetchPreferences();
    fetchUnreadCount();
  }, []);

  async function fetchPreferences() {
    try {
      const response = await api.get('/notifications/preferences/email');
      setPreferences(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await api.get('/notifications/count/unread');
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }

  async function handleSavePreferences() {
    setSaving(true);
    setMessage(null);

    try {
      await api.patch('/notifications/preferences/email', preferences);
      setMessage({ type: 'success', text: t.saved });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setSaving(false);
    }
  }

  async function handleSendDigest(type) {
    setTestingDigest(type);

    try {
      await api.post(`/notifications/digest/${type}`);
      setMessage({
        type: 'success',
        text: t.emailSent
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to send test email'
      });
    } finally {
      setTestingDigest(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">{t.settings}</h1>
          <p className="text-slate-400 mb-8">Manage your Svasthya Kosh preferences</p>

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

          {/* Email Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{t.emailNotifications}</h2>
            <p className="text-slate-400 mb-6">{t.emailNotificationsDesc}</p>

            <div className="space-y-6">
              {/* Enable/Disable All Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-semibold">{t.enableNotifications}</p>
                </div>
                <button
                  onClick={() => {
                    setPreferences({
                      ...preferences,
                      emailNotificationsEnabled: !preferences.emailNotificationsEnabled
                    });
                  }}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    preferences.emailNotificationsEnabled
                      ? 'bg-teal-500'
                      : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.emailNotificationsEnabled
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Budget Alerts */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-semibold">{t.budgetAlerts}</p>
                  <p className="text-slate-400 text-sm">{t.budgetAlertsDesc}</p>
                </div>
                <button
                  onClick={() => {
                    setPreferences({
                      ...preferences,
                      budgetAlertsEnabled: !preferences.budgetAlertsEnabled
                    });
                  }}
                  disabled={!preferences.emailNotificationsEnabled}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
                    preferences.budgetAlertsEnabled
                      ? 'bg-teal-500'
                      : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.budgetAlertsEnabled
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Goal Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white font-semibold">{t.goalNotifications}</p>
                  <p className="text-slate-400 text-sm">{t.goalNotificationsDesc}</p>
                </div>
                <button
                  onClick={() => {
                    setPreferences({
                      ...preferences,
                      goalsNotificationsEnabled: !preferences.goalsNotificationsEnabled
                    });
                  }}
                  disabled={!preferences.emailNotificationsEnabled}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors disabled:opacity-50 ${
                    preferences.goalsNotificationsEnabled
                      ? 'bg-teal-500'
                      : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      preferences.goalsNotificationsEnabled
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Digest Emails */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <p className="text-white font-semibold mb-4">{t.digestEmails}</p>
                <div className="grid grid-cols-3 gap-3">
                  {['daily', 'weekly', 'none'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => {
                        setPreferences({
                          ...preferences,
                          digestEmailFrequency: freq
                        });
                      }}
                      disabled={!preferences.emailNotificationsEnabled}
                      className={`p-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                        preferences.digestEmailFrequency === freq
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      {t[freq] || 'Disabled'}
                    </button>
                  ))}
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {preferences.digestEmailFrequency === 'daily'
                    ? t.dailyDigest
                    : preferences.digestEmailFrequency === 'weekly'
                    ? t.weeklyDigest
                    : 'No digest emails'}
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50"
              >
                {saving ? t.saving : 'Save Preferences'}
              </button>
            </div>
          </motion.div>

          {/* Test Emails Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Test Emails</h2>
            <p className="text-slate-400 mb-6">Send test emails to verify notification settings</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleSendDigest('daily')}
                disabled={testingDigest !== null || !preferences.emailNotificationsEnabled}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {testingDigest === 'daily' ? 'Sending...' : t.sendDailyDigest}
              </button>
              <button
                onClick={() => handleSendDigest('weekly')}
                disabled={testingDigest !== null || !preferences.emailNotificationsEnabled}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {testingDigest === 'weekly' ? 'Sending...' : t.sendWeeklyDigest}
              </button>
            </div>
          </motion.div>

          {/* Notification Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{t.notificationCenter}</h2>
            <p className="text-slate-400 mb-6">
              {t.unreadNotifications}: <span className="text-teal-400 font-semibold">{unreadCount}</span>
            </p>

            <button
              onClick={() => {
                window.location.href = '/app/notifications';
              }}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
            >
              {t.viewAllNotifications}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
