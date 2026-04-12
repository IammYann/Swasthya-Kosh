import { create } from 'zustand';

const useDataStore = create((set) => ({
  lifeScore: null,
  transactions: [],
  accounts: [],
  budgets: [],
  workouts: [],
  steps: [],
  insights: [],
  isLoading: false,
  
  setLifeScore: (lifeScore) => set({ lifeScore }),
  setTransactions: (transactions) => set({ transactions }),
  setAccounts: (accounts) => set({ accounts }),
  setBudgets: (budgets) => set({ budgets }),
  setWorkouts: (workouts) => set({ workouts }),
  setSteps: (steps) => set({ steps }),
  setInsights: (insights) => set({ insights }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useDataStore;
