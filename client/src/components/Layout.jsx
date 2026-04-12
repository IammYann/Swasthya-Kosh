import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../stores/authStore';
import Navbar from './Navbar';
import Chatbot from './Chatbot';

export default function Layout() {
  const { isAuthenticated, loadAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadAuth();
    setMounted(true);
  }, [loadAuth]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, mounted, navigate]);

  if (!mounted) {
    return <div className="flex items-center justify-center h-screen bg-navy text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-navy text-white">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
}
