// resources/js/app.jsx
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// Pages
import HomePage     from '@/Pages/HomePage';
import LoginPage    from '@/Pages/LoginPage';
import RegisterPage from '@/Pages/RegisterPage';
import Dashboard    from '@/Pages/Dashboard';
import CalendarPage from '@/Pages/CalendarPage';
import ChatPage     from '@/Pages/ChatPage';
import CardsPage    from '@/Pages/CardsPage';
import MusicPage       from '@/pages/MusicPage';
import AccountPage  from '@/Pages/AccountPage';
import AboutPage    from '@/Pages/AboutPage';
import PrivacyPage  from '@/Pages/PrivacyPage';
import TermsPage    from '@/Pages/TermsPage';

import '../css/app.css';   // Tailwind directives: @tailwind base/components/utilities

function App() {
  return (
    // BrowserRouter enables /login, /register, etc.
    <BrowserRouter>
      <ThemeProvider>
        {/* AuthProvider wraps everything — provides currentUser everywhere */}
        <AuthProvider>
          <Routes>
          {/* Public routes — accessible without login */}
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/privacy"  element={<PrivacyPage />} />
          <Route path="/terms"    element={<TermsPage />} />

          {/* Protected routes — redirect to /login if not authenticated */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute><CalendarPage /></ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute><ChatPage /></ProtectedRoute>
          } />
          <Route path="/cards" element={
            <ProtectedRoute><CardsPage /></ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute><AccountPage /></ProtectedRoute>
          } />
          <Route path="/music"    element={
            <ProtectedRoute><MusicPage /></ProtectedRoute>
          } /> 

          {/* Catch-all: redirect unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
}

createRoot(document.getElementById('app')).render(<App />);