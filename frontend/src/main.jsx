import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // React Query for data fetching and caching
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Devtools for React Query debugging
import theme from './theme';
import '@fontsource/rock-salt';


// Configuring the React Query client with caching and stale time options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // Cached data persists for 10 minutes
    },
  },
});

/**
 * AppWithQueryClient Component
 * 
 * This component wraps the main `App` with the `QueryClientProvider`, enabling
 * React Query for data fetching and caching.
 * It also includes the `ReactQueryDevtools` for debugging.
 * 
 * @returns {JSX.Element} The application wrapped with React Query functionality.
 */
function AppWithQueryClient() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} /> {/* Devtools for debugging */}
    </QueryClientProvider>
  );
}

// Rendering the application inside a StrictMode wrapper for better debugging
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter
      basename="/"
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ChakraProvider theme={theme}> {/* Aplique o tema aqui */}
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <AppWithQueryClient />
      </ChakraProvider>
    </BrowserRouter>
  </StrictMode>
);
