import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Health from './pages/Health';
import Insights from './pages/Insights';
import Profile from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/app',
    element: <Layout />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'finance', element: <Finance /> },
      { path: 'health', element: <Health /> },
      { path: 'insights', element: <Insights /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
]);

export default router;
