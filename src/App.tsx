import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Electricity from './pages/Electricity';
import Analytics from './pages/Analytics';
import Subscriptions from './pages/Subscriptions';
import Goals from './pages/Goals';
import { Toaster } from 'sonner';
import { useSmartReminder } from './hooks/useSmartReminder';
import { OnboardingModal } from './components/OnboardingModal';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

function App() {
  useSmartReminder();
  const initStore = useStore(state => state.initStore);

  useEffect(() => {
    initStore();
  }, [initStore]);

  return (
    <Router>
      <OnboardingModal />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/electricity" element={<Electricity />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;
