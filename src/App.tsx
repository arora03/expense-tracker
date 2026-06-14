import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { Toaster } from 'sonner';
import { useSmartReminder } from './hooks/useSmartReminder';
import { OnboardingModal } from './components/OnboardingModal';
import { useStore } from './store/useStore';
import { useEffect, Suspense, lazy } from 'react';

// Lazy load page components to enable Code Splitting and reduce initial bundle size
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Electricity = lazy(() => import('./pages/Electricity'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Goals = lazy(() => import('./pages/Goals'));
const Profile = lazy(() => import('./pages/Profile'));

import SquirrelTour from './components/SquirrelTour';

function App() {
  useSmartReminder();
  const initStore = useStore(state => state.initStore);

  useEffect(() => {
    initStore();
  }, [initStore]);

  return (
    <Router>
      <OnboardingModal />
      <SquirrelTour />
      <Layout>
        <Suspense fallback={<div className="flex items-center justify-center h-full w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/electricity" element={<Electricity />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Suspense>
      </Layout>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;

// Finalized application structure
