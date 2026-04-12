import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';

export default function Insights() {
  const [narrative, setNarrative] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await api.get('/insights/correlations');
        setNarrative(response.data.narrative);
        setInsights(response.data.insights);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading insights...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Monthly Narrative */}
      <div className="bg-gradient-to-r from-teal/20 to-gold/20 border border-teal/30 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4">📖 This Month's Story</h2>
        {narrative ? (
          <div className="space-y-4">
            <p className="text-white/90 leading-relaxed">{narrative.en}</p>
            <p className="text-gray-300 text-sm italic">{narrative.np}</p>
          </div>
        ) : (
          <p className="text-gray-400">No narrative available yet. Log more data!</p>
        )}
      </div>

      {/* Insights Grid */}
      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-navy/50 border border-teal/20 rounded-xl p-6 hover:border-teal/50 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold flex-1">{insight.type}</h3>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${
                  insight.confidence === 'high'
                    ? 'bg-teal/30 text-teal'
                    : insight.confidence === 'medium'
                    ? 'bg-gold/30 text-gold'
                    : 'bg-gray-500/30 text-gray-400'
                }`}>
                  {insight.confidence} confidence
                </span>
              </div>

              <p className="text-white/90 mb-3">{insight.message_en}</p>
              <p className="text-gray-400 text-sm italic mb-4">{insight.message_np}</p>

              {insight.delta && (
                <div className="pt-3 border-t border-teal/20">
                  <p className="text-xs text-gray-400">
                    <span className="text-teal font-semibold">{insight.delta}</span>% impact
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-navy/50 border border-teal/20 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No insights generated yet.</p>
          <p className="text-gray-500 text-sm mt-2">Start logging your health and finance data to receive personalized insights!</p>
        </div>
      )}
    </motion.div>
  );
}
