import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import LandingPage from './components/LandingPage';
import TrimPage from './components/TrimPage';
import InsightsPage from './components/InsightsPage';
import SubscribePage from './components/SubscribePage';
import PaymentSuccess from './components/PaymentSuccess';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/trim" element={<TrimPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/subscribe" element={<SubscribePage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            {/* Legacy route redirects */}
            <Route path="/dashboard" element={<InsightsPage />} />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;