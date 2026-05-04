import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar/Navbar';
import Spinner from './components/Spinner/Spinner';
import './styles/global.scss';

const FeedPage         = lazy(() => import('./pages/Feed/FeedPage'));
const LoginPage        = lazy(() => import('./pages/Login/LoginPage'));
const StoryDetailPage  = lazy(() => import('./pages/StoryDetail/StoryDetailPage'));
const ChapterPage      = lazy(() => import('./pages/Chapter/ChapterPage'));
const DashboardPage    = lazy(() => import('./pages/Dashboard/DashboardPage'));
const StoryEditorPage  = lazy(() => import('./pages/StoryEditor/StoryEditorPage'));
const ChapterEditorPage = lazy(() => import('./pages/ChapterEditor/ChapterEditorPage'));

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}><Spinner size="lg" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}><Spinner size="lg" /></div>}>
        <Routes>
          <Route path="/"                                       element={<FeedPage />} />
          <Route path="/login"                                  element={<LoginPage />} />
          <Route path="/stories/:storyId"                       element={<StoryDetailPage />} />
          <Route path="/stories/:storyId/chapters/:chapterId"   element={<ChapterPage />} />
          <Route path="/dashboard"                              element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/dashboard/stories/new"                  element={<RequireAuth><StoryEditorPage /></RequireAuth>} />
          <Route path="/dashboard/stories/:storyId/edit"        element={<RequireAuth><StoryEditorPage /></RequireAuth>} />
          <Route path="/dashboard/stories/:storyId/chapters/new"         element={<RequireAuth><ChapterEditorPage /></RequireAuth>} />
          <Route path="/dashboard/stories/:storyId/chapters/:chapterId/edit" element={<RequireAuth><ChapterEditorPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
