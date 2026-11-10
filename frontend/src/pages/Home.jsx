import { useContext } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import HeroSection from '../components/features/landing/HeroSection';
import BentoShowcase from '../components/features/landing/BentoShowcase';
import MemoryGallerySection from '../components/features/landing/MemoryGallerySection';
import CTASection from '../components/features/landing/CTASection';
import { Grain } from '../components/features/landing/landingUI';
import LoginModal from '../components/modals/LoginModal';
import RegisterModal from '../components/modals/RegisterModal';

function Home() {
  const { isLoggedIn } = useContext(AuthContext);
  const loginModal = useDisclosure();
  const registerModal = useDisclosure();

  const handleOpenRegister = () => {
    if (!isLoggedIn) {
      registerModal.onOpen();
    }
  };

  return (
    <>
      <Box bg="#0A0C11" minH="100vh" fontFamily="'Schibsted Grotesk', Inter, sans-serif">
        <Grain />
        <HeroSection onOpenRegister={handleOpenRegister} onOpenLogin={loginModal.onOpen} />
        <BentoShowcase />
        <MemoryGallerySection />
        <CTASection onOpenRegister={handleOpenRegister} />
      </Box>

      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        onSwitchToRegister={() => {
          loginModal.onClose();
          registerModal.onOpen();
        }}
      />
      <RegisterModal
        isOpen={registerModal.isOpen}
        onClose={registerModal.onClose}
        onSwitchToLogin={() => {
          registerModal.onClose();
          loginModal.onOpen();
        }}
      />
    </>
  );
}

export default Home;
