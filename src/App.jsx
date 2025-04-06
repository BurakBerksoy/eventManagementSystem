import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, useMediaQuery } from '@mui/material';
import { MainLayout } from './components/layouts';
import Login from './pages/Login';
import { Register } from './components/auth';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Profile from './pages/Profile';
import Students from './pages/Students';
import UserWaitingListPage from './pages/UserWaitingListPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import theme from './theme';

// Korumalı route bileşeni
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Yükleme durumunda
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!currentUser) {
    console.log('Kullanıcı giriş yapmamış. Login sayfasına yönlendiriliyor.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// AnonymousRoute bileşeni - sadece giriş yapmamış kullanıcılar için
const AnonymousRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  // Yükleme durumunda
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Kullanıcı giriş yapmışsa Etkinlikler sayfasına yönlendir
  if (currentUser) {
    console.log('Kullanıcı zaten giriş yapmış. Etkinlikler sayfasına yönlendiriliyor.');
    return <Navigate to="/events" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<Events />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="clubs" element={<Clubs />} />
              <Route path="clubs/:id" element={<ClubDetail />} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
              <Route path="waiting-list" element={<ProtectedRoute><UserWaitingListPage /></ProtectedRoute>} />
            </Route>
            
            {/* Anonim kullanıcı sayfaları */}
            <Route path="/login" element={<AnonymousRoute><Login /></AnonymousRoute>} />
            <Route path="/register" element={<AnonymousRoute><Register /></AnonymousRoute>} />
            
            {/* 404 sayfası */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;
