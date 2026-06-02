import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Flex, useMediaQuery } from '@chakra-ui/react';
import SmartHomeRoute from '../ui/SmartHomeRoute';
import ProtectedRoute from '../ui/ProtectedRoute';
import AdminRoute from '../ui/AdminRoute';
import Header from './Header/Header';
import Footer from './Footer';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Topbar from './Topbar';
import AppModals from './AppModals';
import { CountryDetails } from '../features';
import NotFound from '../ui/Notfound.jsx';
import About from '../../pages/About';
import Contact from '../../pages/Contact';
import TimelinePage from '../../pages/TimelinePage';
import MapPage from '../../pages/MapPage';
import AdminPage from '../../pages/AdminPage';
import { useHeaderHeight } from '../../hooks/useHeaderHeight';
import { useNavActions } from './useNavActions';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<SmartHomeRoute />} />
    <Route path="/map" element={<MapPage />} />
    <Route
      path="/map/private"
      element={(
        <ProtectedRoute>
          <MapPage />
        </ProtectedRoute>
      )}
    />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route
      path="/countries/:countryId"
      element={(
        <ProtectedRoute>
          <CountryDetails />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/timeline"
      element={(
        <ProtectedRoute>
          <TimelinePage />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/timeline/:year"
      element={(
        <ProtectedRoute>
          <TimelinePage />
        </ProtectedRoute>
      )}
    />
    <Route
      path="/admin"
      element={(
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      )}
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const AppShell = () => {
  const nav = useNavActions();
  const { headerHeight, headerRef } = useHeaderHeight();
  const [isDesktop] = useMediaQuery('(min-width: 992px)');
  const useDesktopShell = nav.isLoggedIn && isDesktop;
  const topOffset = useDesktopShell ? '64px' : `${headerHeight}px`;

  return (
    <>
      <AppModals nav={nav} />
      <Flex direction="column" minH="100vh">
        {useDesktopShell ? (
          <>
            <Sidebar nav={nav} />
            <Topbar ref={headerRef} nav={nav} />
          </>
        ) : (
          <Box as="header">
            <Header ref={headerRef} nav={nav} />
          </Box>
        )}

        <Box
          as="main"
          flex="1"
          px={0}
          pb={0}
          pt={topOffset}
          ml={useDesktopShell ? SIDEBAR_WIDTH : 0}
          transition="margin-left .2s ease"
        >
          <AppRoutes />
        </Box>

        <Box as="footer" ml={useDesktopShell ? SIDEBAR_WIDTH : 0} transition="margin-left .2s ease">
          <Footer />
        </Box>
      </Flex>
    </>
  );
};

export default AppShell;
