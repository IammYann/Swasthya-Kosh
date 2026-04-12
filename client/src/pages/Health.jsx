import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';

export default function Health() {
  const [activeTab, setActiveTab] = useState('activity');
  const [steps, setSteps] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [body, setBody] = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newWorkout, setNewWorkout] = useState({ type: '', durationMinutes: '', caloriesBurned: '' });
  const [newSteps, setNewSteps] = useState({ steps: '' });
  const [newBodyMetric, setNewBodyMetric] = useState({ weight: '', bmi: '', bodyFat: '' });
  const [newNutrition, setNewNutrition] = useState({ mealName: '', calories: '', protein: '', carbs: '', fat: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [stepRes, workRes, bodyRes, nutRes] = await Promise.all([
          api.get('/health/steps'),
          api.get('/health/workouts'),
          api.get('/health/body-metrics'),
          api.get('/health/nutrition')
        ]);

        setSteps(stepRes.data);
        setWorkouts(workRes.data);
        setBody(bodyRes.data);
        setNutrition(nutRes.data);
      } catch (err) {
        console.error('Failed to fetch health data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    if (!newWorkout.type || !newWorkout.durationMinutes) {
      alert('Please fill in workout type and duration');
      return;
    }

    try {
      await api.post('/health/workouts', {
        ...newWorkout,
        durationMinutes: parseInt(newWorkout.durationMinutes),
        caloriesBurned: newWorkout.caloriesBurned ? parseInt(newWorkout.caloriesBurned) : undefined,
        date: new Date().toISOString()
      });

      setNewWorkout({ type: '', durationMinutes: '', caloriesBurned: '' });
      
      const workRes = await api.get('/health/workouts');
      setWorkouts(workRes.data);
      
      // Recalculate Life Score
      await api.post('/insights/recalculate');
      
      alert('Workout logged successfully!');
    } catch (err) {
      console.error('Failed to add workout:', err);
      alert('Failed to log workout: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddBodyMetric = async (e) => {
    e.preventDefault();
    if (!newBodyMetric.weight) {
      alert('Please enter weight');
      return;
    }

    try {
      await api.post('/health/body-metrics', {
        ...newBodyMetric,
        weight: parseFloat(newBodyMetric.weight),
        bmi: newBodyMetric.bmi ? parseFloat(newBodyMetric.bmi) : undefined,
        bodyFat: newBodyMetric.bodyFat ? parseFloat(newBodyMetric.bodyFat) : undefined,
        date: new Date().toISOString()
      });

      setNewBodyMetric({ weight: '', bmi: '', bodyFat: '' });
      const bodyRes = await api.get('/health/body-metrics');
      setBody(bodyRes.data);
      
      // Recalculate Life Score
      await api.post('/insights/recalculate');
      
      alert('Body metric logged successfully!');
    } catch (err) {
      console.error('Failed to log body metric:', err);
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddSteps = async (e) => {
    e.preventDefault();
    if (!newSteps.steps) {
      alert('Please enter steps');
      return;
    }

    try {
      await api.post('/health/steps', {
        steps: parseInt(newSteps.steps),
        date: new Date().toISOString()
      });

      setNewSteps({ steps: '' });
      
      const stepRes = await api.get('/health/steps');
      setSteps(stepRes.data);
      
      // Recalculate Life Score
      await api.post('/insights/recalculate');
      
      alert('Steps logged successfully!');
    } catch (err) {
      console.error('Failed to log steps:', err);
      alert('Failed to log steps: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddNutrition = async (e) => {
    e.preventDefault();
    if (!newNutrition.calories) {
      alert('Please enter calories');
      return;
    }

    try {
      await api.post('/health/nutrition', {
        ...newNutrition,
        calories: parseInt(newNutrition.calories),
        protein: newNutrition.protein ? parseInt(newNutrition.protein) : undefined,
        carbs: newNutrition.carbs ? parseInt(newNutrition.carbs) : undefined,
        fat: newNutrition.fat ? parseInt(newNutrition.fat) : undefined,
        date: new Date().toISOString()
      });

      setNewNutrition({ mealName: '', calories: '', protein: '', carbs: '', fat: '' });
      const nutRes = await api.get('/health/nutrition');
      setNutrition(nutRes.data);
      
      // Recalculate Life Score
      await api.post('/insights/recalculate');
      
      alert('Nutrition logged successfully!');
    } catch (err) {
      console.error('Failed to log nutrition:', err);
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex gap-4 mb-8">
        {['activity', 'body', 'nutrition', 'goals'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-semibold transition capitalize ${
              activeTab === tab
                ? 'bg-teal text-navy'
                : 'bg-navy/50 border border-teal/30 hover:border-teal'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Steps Logger */}
            <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Log Steps</h3>
              <form onSubmit={handleAddSteps} className="space-y-3">
                <div>
                  <label className="block text-sm mb-2">Today's Steps</label>
                  <input
                    type="number"
                    value={newSteps.steps}
                    onChange={(e) => setNewSteps({ steps: e.target.value })}
                    placeholder="e.g., 8500"
                    className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-teal text-navy rounded font-semibold hover:bg-teal/90">
                  Log Steps
                </button>
              </form>
            </div>

            {/* Workout Logger */}
            <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Log Workout</h3>
              <form onSubmit={handleAddWorkout} className="space-y-3">
                <input
                  type="text"
                  value={newWorkout.type}
                  onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                  placeholder="e.g., Running, Gym, Yoga"
                  className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                  required
                />
                <input
                  type="number"
                  value={newWorkout.durationMinutes}
                  onChange={(e) => setNewWorkout({ ...newWorkout, durationMinutes: e.target.value })}
                  placeholder="Duration (minutes)"
                  className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                  required
                />
                <input
                  type="number"
                  value={newWorkout.caloriesBurned}
                  onChange={(e) => setNewWorkout({ ...newWorkout, caloriesBurned: e.target.value })}
                  placeholder="Calories (optional)"
                  className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                />
                <button type="submit" className="w-full py-2 bg-teal text-navy rounded font-semibold hover:bg-teal/90">
                  Log Workout
                </button>
              </form>
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Workouts</h3>
            <div className="space-y-2">
              {workouts.length > 0 ? (
                workouts.slice(0, 5).map((workout) => (
                  <div key={workout.id} className="flex justify-between items-center p-3 bg-teal/5 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{workout.type}</p>
                      <p className="text-sm text-gray-400">{workout.durationMinutes} mins</p>
                    </div>
                    {workout.caloriesBurned && (
                      <p className="text-teal font-semibold">{workout.caloriesBurned} kcal</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No workouts logged yet</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Body Tab */}
      {activeTab === 'body' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Body Metric Logger */}
          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Log Body Metric</h3>
            <form onSubmit={handleAddBodyMetric} className="space-y-3">
              <input
                type="number"
                step="0.1"
                value={newBodyMetric.weight}
                onChange={(e) => setNewBodyMetric({ ...newBodyMetric, weight: e.target.value })}
                placeholder="Weight (kg)"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                required
              />
              <input
                type="number"
                step="0.1"
                value={newBodyMetric.bmi}
                onChange={(e) => setNewBodyMetric({ ...newBodyMetric, bmi: e.target.value })}
                placeholder="BMI (optional)"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
              />
              <input
                type="number"
                step="0.1"
                value={newBodyMetric.bodyFat}
                onChange={(e) => setNewBodyMetric({ ...newBodyMetric, bodyFat: e.target.value })}
                placeholder="Body Fat % (optional)"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
              />
              <button type="submit" className="w-full py-2 bg-teal text-navy rounded font-semibold hover:bg-teal/90">
                Log Metric
              </button>
            </form>
          </div>

          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Body Metrics History</h3>
            {body.length > 0 ? (
              <div className="space-y-3">
                {body.slice(0, 5).map((metric) => (
                  <div key={metric.id} className="p-3 bg-teal/5 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">{new Date(metric.date).toLocaleDateString()}</span>
                      <span className="font-semibold">{metric.weight} kg</span>
                    </div>
                    {metric.bmi && <p className="text-xs text-gray-500">BMI: {metric.bmi.toFixed(1)}</p>}
                    {metric.bodyFat && <p className="text-xs text-gray-500">Body Fat: {metric.bodyFat.toFixed(1)}%</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No body metrics recorded</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Nutrition Tab */}
      {activeTab === 'nutrition' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Nutrition Logger */}
          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Log Meal</h3>
            <form onSubmit={handleAddNutrition} className="space-y-3">
              <input
                type="text"
                value={newNutrition.mealName}
                onChange={(e) => setNewNutrition({ ...newNutrition, mealName: e.target.value })}
                placeholder="Meal name (e.g., Breakfast, Lunch)"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
              />
              <input
                type="number"
                value={newNutrition.calories}
                onChange={(e) => setNewNutrition({ ...newNutrition, calories: e.target.value })}
                placeholder="Calories"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={newNutrition.protein}
                  onChange={(e) => setNewNutrition({ ...newNutrition, protein: e.target.value })}
                  placeholder="Protein (g)"
                  className="px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                />
                <input
                  type="number"
                  value={newNutrition.carbs}
                  onChange={(e) => setNewNutrition({ ...newNutrition, carbs: e.target.value })}
                  placeholder="Carbs (g)"
                  className="px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                />
                <input
                  type="number"
                  value={newNutrition.fat}
                  onChange={(e) => setNewNutrition({ ...newNutrition, fat: e.target.value })}
                  placeholder="Fat (g)"
                  className="px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-teal text-navy rounded font-semibold hover:bg-teal/90">
                Log Meal
              </button>
            </form>
          </div>

          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Nutrition Logs</h3>
            {nutrition.length > 0 ? (
              <div className="space-y-3">
                {nutrition.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-3 bg-teal/5 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">{log.mealName || 'Meal'}</span>
                      <span className="font-semibold text-gold">{log.calories} cal</span>
                    </div>
                    {(log.protein || log.carbs || log.fat) && (
                      <p className="text-xs text-gray-400 mt-1">
                        P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No nutrition data yet</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Goals Tab - Placeholder */}
      {activeTab === 'goals' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6 text-center">
            <p className="text-gray-400">Goals feature coming soon...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
