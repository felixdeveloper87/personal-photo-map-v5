import AppShell from './components/layout/AppShell';
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
  return (
    <AuthProvider> {/* Provides authentication context to the entire app */}
      <CountriesProvider> {/* Provides country-related data to the app */}
        <PhotoUploadListener /> {/* Listens for photo upload events globally */}
        <AppShell />
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
