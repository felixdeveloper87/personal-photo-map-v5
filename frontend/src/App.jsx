import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import SmartHomeRoute from './components/ui/SmartHomeRoute';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Header from './components/layout/Header/Header';

import Footer from './components/layout/Footer';
import { CountryDetails } from './components/features';
import NotFound from './components/ui/Notfound.jsx';
import About from './pages/About';
import Contact from "./pages/Contact";
import TimelinePage from './pages/TimelinePage';
import MapPage from './pages/MapPage';
import { AuthProvider } from './context/AuthContext';
import { CountriesProvider } from './context/CountriesContext';
import { usePhotoUploadListener } from './hooks/usePhotoUploadListener';

/**
 * App Component
 * 
 * This is the root component of the application. It sets up global providers,
 * the main layout structure (Header, Footer, and Content), and defines the
 * routing structure using React Router.
 * 
 * It also manages a state (`updateCounts`) to trigger updates when an upload
 * event occurs.
 * 
 * @returns {JSX.Element} The main application wrapper.
 */
function App() {

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <AuthProvider> {/* Provides authentication context to the entire app */}
      <CountriesProvider> {/* Provides country-related data to the app */}
        <PhotoUploadListener /> {/* Listens for photo upload events globally */}
        <Flex direction="column" minH="100vh"> {/* Ensures a full-height layout */}

          {/* Header Section */}
          <Box as="header">
            <Header />
          </Box>

          {/* Main Content Section */}
          <Box 
            as="main" 
            flex="1" 
            px={0} 
            pb={0}
          >
            <Routes>
              <Route path="/" element={<SmartHomeRoute />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/map/private" element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/countries/:countryId" element={
                <ProtectedRoute>
                  <CountryDetails />
                </ProtectedRoute>
              } />
              <Route path="/timeline" element={
                <ProtectedRoute>
                  <TimelinePage />
                </ProtectedRoute>
              } />
              <Route path="/timeline/:year" element={
                <ProtectedRoute>
                  <TimelinePage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} /> {/* 404 Page */}
            </Routes>
          </Box>

          {/* Footer Section */}
          <Box as="footer">
            <Footer />
          </Box>

        </Flex>
      </CountriesProvider>
    </AuthProvider>
  );
}

/**
 * PhotoUploadListener Component
 * 
 * Componente que escuta eventos de upload de fotos globalmente
 * e atualiza o cache de países automaticamente.
 */
function PhotoUploadListener() {
  usePhotoUploadListener();
  return null; // Componente invisível
}

export default App;
