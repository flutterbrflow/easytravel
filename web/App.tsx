import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import TripListScreen from './components/TripListScreen';
import NewTripScreen from './components/NewTripScreen';
import ProfileScreen from './components/ProfileScreen';
import TripDetailScreen from './components/TripDetailScreen';
import { AppRoute } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return null; // Ou um spinner de carregamento
  if (!session) return <Navigate to={AppRoute.LOGIN} replace />;
  return children;
};

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

              <Route path={AppRoute.LIST} element={
                <ProtectedRoute>
                  <TripListScreen />
                </ProtectedRoute>
              } />
              <Route path={AppRoute.NEW_TRIP} element={
                <ProtectedRoute>
                  <NewTripScreen />
                </ProtectedRoute>
              } />
              <Route path={AppRoute.PROFILE} element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              } />
              <Route path={AppRoute.TRIP_DETAIL} element={
                <ProtectedRoute>
                  <TripDetailScreen />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
