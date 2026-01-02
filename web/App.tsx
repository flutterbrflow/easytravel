import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import TripListScreen from './components/TripListScreen';
import NewTripScreen from './components/NewTripScreen';
import { AppRoute } from './types';

import { AuthProvider } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex justify-center min-h-screen bg-gray-100 dark:bg-black">
          {/* Mobile container wrapper */}
          <div className="w-full max-w-md h-full min-h-screen bg-white dark:bg-[#101922] shadow-2xl overflow-hidden relative">
            <Routes>
              <Route path={AppRoute.WELCOME} element={<WelcomeScreen />} />
              <Route path={AppRoute.LOGIN} element={<LoginScreen />} />
              <Route path={AppRoute.LIST} element={<TripListScreen />} />
              <Route path={AppRoute.NEW_TRIP} element={<NewTripScreen />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
