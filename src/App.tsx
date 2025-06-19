import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FilterProvider } from './contexts/FilterContext';
import theme from './theme/index.js';

// Public Components
import WeddingHome from './components/public/WeddingHome.jsx';
import CameraCapture from './components/public/CameraCapture.jsx';
import Gallery from './components/public/Gallery.jsx';

// Admin Components
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <ConfigProvider>
          <ThemeProvider>
            <FilterProvider>
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<WeddingHome />} />
                  <Route path="/camera" element={<CameraCapture />} />
                  <Route path="/gallery" element={<Gallery />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/*" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Router>
            </FilterProvider>
          </ThemeProvider>
        </ConfigProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;