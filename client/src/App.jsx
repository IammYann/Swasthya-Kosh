import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import i18n from './i18n/config';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';
import Health from './pages/Health';
import Insights from './pages/Insights';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Landing from './pages/Landing';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={<Layout />}>
          <Route path="" element={<Dashboard />} />
          <Route path="finance" element={<Finance />} />
          <Route path="health" element={<Health />} />
          <Route path="insights" element={<Insights />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
