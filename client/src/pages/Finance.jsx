import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/api';

export default function Finance() {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState({ amount: '', category: '', type: 'expense', note: '' });
  const [newAccount, setNewAccount] = useState({ name: '', type: 'cash', balance: '' });
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const [transRes, accRes, budRes, summRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/accounts'),
          api.get('/budgets'),
          api.get('/transactions/summary/month')
        ]);

        setTransactions(transRes.data);
        setAccounts(accRes.data);
        setBudgets(budRes.data);
        setSummary(summRes.data);
      } catch (err) {
        console.error('Failed to fetch finance data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.category) {
      alert('Please fill in amount and reason');
      return;
    }

    try {
      await api.post('/transactions', {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        date: new Date().toISOString()
      });

      setNewTransaction({ amount: '', category: '', type: 'expense', note: '' });
      
      // Refetch data
      const [transRes, summRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/summary/month')
      ]);
      setTransactions(transRes.data);
      setSummary(summRes.data);
      
      // Recalculate Life Score
      await api.post('/insights/recalculate');
      
      alert('Transaction added successfully!');
    } catch (err) {
      console.error('Failed to add transaction:', err);
      alert('Failed to add transaction: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.balance) {
      alert('Please fill in account name and balance');
      return;
    }

    try {
      await api.post('/accounts', {
        ...newAccount,
        balance: parseFloat(newAccount.balance)
      });

      setNewAccount({ name: '', type: 'cash', balance: '' });
      const accRes = await api.get('/accounts');
      setAccounts(accRes.data);
      alert('Account created successfully!');
    } catch (err) {
      console.error('Failed to add account:', err);
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit) {
      alert('Please fill in category and limit');
      return;
    }

    try {
      await api.post('/budgets', {
        category: newBudget.category,
        limitAmount: parseFloat(newBudget.limit),
        period: newBudget.period || 'monthly'
      });

      setNewBudget({ category: '', limit: '' });
      const budRes = await api.get('/budgets');
      setBudgets(budRes.data);
      alert('Budget created successfully!');
    } catch (err) {
      console.error('Failed to add budget:', err);
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const categoryColors = {
    'खाना': '#FF6B6B',
    'घर भाडा': '#4ECDC4',
    'यातायात': '#FFE66D',
    'जिम': '#95E1D3',
    'स्वास्थ्य': '#F38181',
    'मनोरञ्जन': '#AA96DA',
    'शिक्षा': '#FCBAD3',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex gap-4 mb-8">
        {['overview', 'transactions', 'accounts', 'budgets'].map((tab) => (
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Income</span>
                  <span className="text-green-400 font-bold">रु {(summary?.income || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expense</span>
                  <span className="text-red-400 font-bold">रु {(summary?.expense || 0).toLocaleString()}</span>
                </div>
                <div className="h-px bg-teal/20"></div>
                <div className="flex justify-between">
                  <span className="font-semibold">Net</span>
                  <span className="text-teal font-bold">रु {(summary?.net || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
              <form onSubmit={handleAddTransaction} className="space-y-3">
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  className="w-full px-3 py-2 bg-navy border-2 border-teal/50 rounded text-sm text-white focus:outline-none focus:border-teal"
                >
                  <option value="expense" className="bg-navy text-white">Expense</option>
                  <option value="income" className="bg-navy text-white">Income</option>
                </select>

                {accounts.length > 0 && (
                  <select
                    value={newTransaction.accountId || ''}
                    onChange={(e) => setNewTransaction({ ...newTransaction, accountId: e.target.value })}
                    className="w-full px-3 py-2 bg-navy border-2 border-teal/50 rounded text-sm text-white focus:outline-none focus:border-teal"
                  >
                    <option value="" className="bg-navy text-white">Select Account (optional)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id} className="bg-navy text-white">{acc.name}</option>
                    ))}
                  </select>
                )}

                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  placeholder="Amount (रु)"
                  className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                  required
                />

                <input
                  type="text"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  placeholder="Reason (e.g., Lunch, Bus fare, Gym)"
                  className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                  required
                />

                <button type="submit" className="w-full py-2 bg-teal text-navy rounded font-semibold hover:bg-teal/90 disabled:opacity-50" disabled={isLoading}>
                  Add Transaction
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-2">
              {transactions.length > 0 ? (
                transactions.slice(0, 10).map((trans) => (
                  <div key={trans.id} className="flex justify-between items-center p-3 bg-teal/5 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{trans.category}</p>
                      <p className="text-sm text-gray-400">{trans.account.name}</p>
                    </div>
                    <p className={`font-bold ${trans.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {trans.type === 'income' ? '+' : '-'} रु {trans.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No transactions yet</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Create Account */}
          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Create Account</h3>
            <form onSubmit={handleAddAccount} className="space-y-3">
              <input
                type="text"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="Account name (e.g., Savings, Checking)"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                required
              />
              <select
                value={newAccount.type}
                onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                className="w-full px-3 py-2 bg-navy border-2 border-teal/50 rounded text-sm text-white"
              >
                <option value="cash" className="bg-navy text-white">Cash</option>
                <option value="savings" className="bg-navy text-white">Savings</option>
                <option value="checking" className="bg-navy text-white">Checking</option>
              </select>
              <input
                type="number"
                step="0.01"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                placeholder="Initial balance (रु)"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                required
              />
              <button type="submit" className="w-full py-2 bg-teal text-navy rounded font-semibold hover:bg-teal/90">
                Create Account
              </button>
            </form>
          </div>

          {/* Accounts List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.id} className="bg-navy/50 border border-teal/20 rounded-xl p-6">
                <h4 className="font-semibold mb-2">{account.name}</h4>
                <p className="text-xs text-gray-400 capitalize mb-3">{account.type}</p>
                <p className="text-2xl font-bold text-teal">रु {account.balance.toLocaleString()}</p>
              </div>
            ))}
            {accounts.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No accounts yet. Create one above!
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Create Budget */}
          <div className="bg-navy/50 border border-teal/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Create Budget</h3>
            <form onSubmit={handleAddBudget} className="space-y-3">
              <input
                type="text"
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                placeholder="Category (e.g., Food, Transport)"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                required
              />
              <input
                type="number"
                step="100"
                value={newBudget.limit}
                onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                placeholder="Monthly limit (रु)"
                className="w-full px-3 py-2 bg-teal/10 border border-teal/30 rounded text-sm"
                required
              />
              <button type="submit" className="w-full py-2 bg-teal text-navy rounded font-semibold hover:bg-teal/90">
                Create Budget
              </button>
            </form>
          </div>

          {/* Budgets List */}
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = summary?.byCategory?.[budget.category]?.expense || 0;
              const percentage = Math.min((spent / budget.limit) * 100, 100);
              const isExceeded = percentage > 100;

              return (
                <div key={budget.id} className="bg-navy/50 border border-teal/20 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{budget.category}</h4>
                    </div>
                    {isExceeded && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Exceeded</span>}
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>रु {spent.toLocaleString()}</span>
                    <span className="text-gray-400">/ रु {budget.limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 transition-all ${isExceeded ? 'bg-red-500' : 'bg-teal'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No budgets yet. Create one above!
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
