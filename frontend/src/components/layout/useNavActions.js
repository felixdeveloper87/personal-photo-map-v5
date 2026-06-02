import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisclosure, useToast, useColorMode } from '@chakra-ui/react';
import { AuthContext } from '../../context/AuthContext';
import { CountriesContext } from '../../context/CountriesContext';

/**
 * Shared navigation state + actions for the app shell (Header / Sidebar / Topbar).
 * Owns the modal disclosures and premium handlers in a single place so whichever
 * nav surface is mounted can trigger the same modals.
 */
export function useNavActions() {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const { isLoggedIn, fullname, isPremium, logout, togglePremiumStatus } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } = useContext(CountriesContext);

  const profileModal = useDisclosure();
  const photoStorageModal = useDisclosure();
  const premiumModal = useDisclosure();
  const loginModal = useDisclosure();
  const registerModal = useDisclosure();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({ title: 'Logged out', status: 'info', duration: 2000, isClosable: true });
  };

  const handleSearchTrigger = () => {
    document.querySelector('[data-search-trigger]')?.click();
  };

  const handlePremiumUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await togglePremiumStatus(true);
      toast({
        title: 'Premium Upgrade Successful!',
        description: 'Welcome to Premium! You now have access to all premium features.',
        status: 'success',
        duration: 8000,
        isClosable: true,
        position: 'top-right',
      });
      premiumModal.onClose();
      window.location.reload();
    } catch (error) {
      let description = error.message || 'Please try again later.';
      if (error.message.includes('session has expired') || error.message.includes('Unauthorized')) {
        description = 'Your session has expired. Please log in again.';
        setTimeout(() => loginModal.onOpen(), 3000);
      } else if (error.message.includes('Access denied') || error.message.includes('Access forbidden')) {
        description = "You don't have permission to upgrade. Please contact support.";
      }
      toast({ title: 'Upgrade Failed', description, status: 'error', duration: 8000, isClosable: true, position: 'top-right' });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handlePremiumDeactivate = async () => {
    setIsUpgrading(true);
    try {
      await togglePremiumStatus(false);
      toast({
        title: 'Premium Deactivated',
        description: 'You have successfully deactivated your premium status.',
        status: 'info',
        duration: 8000,
        isClosable: true,
        position: 'top-right',
      });
      premiumModal.onClose();
      window.location.reload();
    } catch (error) {
      let description = error.message || 'Please try again later.';
      if (error.message.includes('session has expired') || error.message.includes('Unauthorized')) {
        description = 'Your session has expired. Please log in again.';
        setTimeout(() => loginModal.onOpen(), 3000);
      }
      toast({ title: 'Deactivation Failed', description, status: 'error', duration: 8000, isClosable: true, position: 'top-right' });
    } finally {
      setIsUpgrading(false);
    }
  };

  return {
    navigate,
    isLoggedIn,
    fullname,
    isPremium,
    countriesWithPhotos,
    photoCount,
    countryCount,
    colorMode,
    toggleColorMode,
    profileModal,
    photoStorageModal,
    premiumModal,
    loginModal,
    registerModal,
    isUpgrading,
    handleLogout,
    handlePremiumUpgrade,
    handlePremiumDeactivate,
    handleSearchTrigger,
  };
}
