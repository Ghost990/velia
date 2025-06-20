import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FilterProvider } from './contexts/FilterContext';
import theme from './theme/index';

// Public Components
import WeddingHome from './components/public/WeddingHome';
import CameraCapture from './components/public/CameraCapture';
import Gallery from './components/public/Gallery';
import TestConfiguration from './components/public/TestConfiguration';
import DebugGallery from './components/public/DebugGallery';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';

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
                  <Route path="/test" element={<TestConfiguration />} />
                  <Route path="/debug-gallery" element={<DebugGallery />} />
                  
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