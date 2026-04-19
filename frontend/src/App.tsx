import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.scss';

import LoginPage     from './pages/LoginPage';
import FeedPage      from './pages/FeedPage';
import ReaderPage    from './pages/ReaderPage';
import DashboardPage from './pages/DashboardPage';
import { authService } from './services/authService';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return authService.isAuthenticated()
    ? <>{children}</>
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/"       element={<FeedPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/stories/:storyId/chapters/:chapterId" element={<ReaderPage />} />

        {/* Privado */}
        <Route path="/dashboard/*" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
