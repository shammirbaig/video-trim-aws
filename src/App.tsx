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
  throw new Error("Missing Publishable Key - Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file");
}

function App() {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#1f2937',
          borderRadius: '0.75rem'
        },
        elements: {
          formButtonPrimary: 
            'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg',
          card: 'shadow-xl border border-gray-100 rounded-2xl',
          headerTitle: 'text-2xl font-bold text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 
            'border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all hover:shadow-md',
          formFieldInput: 
            'border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
          footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium transition-colors'
        }
      }}
    >
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