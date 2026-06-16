import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, Flex, Spinner, useMediaQuery } from '@chakra-ui/react';
import SmartHomeRoute from '../ui/SmartHomeRoute';
import ProtectedRoute from '../ui/ProtectedRoute';
import AdminRoute from '../ui/AdminRoute';
import Header from './Header/Header';
import Footer from './Footer';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import Topbar from './Topbar';
import AppModals from './AppModals';
import NotFound from '../ui/Notfound.jsx';
import About from '../../pages/About';
import Contact from '../../pages/Contact';
import { useHeaderHeight } from '../../hooks/useHeaderHeight';
import { useNavActions } from './useNavActions';

const CountryDetails = lazy(() => import('../features/CountryDetails/CountryDetails'));
const TimelinePage = lazy(() => import('../../pages/TimelinePage'));
const MapPage = lazy(() => import('../../pages/MapPage'));
const AdminPage = lazy(() => import('../../pages/AdminPage'));

const RouteFallback = () => (
  <Flex minH="45vh" align="center" justify="center">
    <Spinner size="lg" thickness="3px" />
  </Flex>
);

const AppRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
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
  </Suspense>
);

const AppShell = () => {
  const nav = useNavActions();
  const location = useLocation();
  const { headerHeight, headerRef } = useHeaderHeight();
  const [isDesktop] = useMediaQuery('(min-width: 992px)');
  const useDesktopShell = nav.isLoggedIn && isDesktop;
  const isLandingHeader = location.pathname === '/' && !nav.isLoggedIn;
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
            <Header ref={headerRef} nav={nav} isLandingHeader={isLandingHeader} />
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
