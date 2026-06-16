import { useContext } from 'react';
import { Box, useDisclosure } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import HeroSection from '../components/features/landing/HeroSection';
import BentoShowcase from '../components/features/landing/BentoShowcase';
import ManifestoSection from '../components/features/landing/ManifestoSection';
import MemoryGallerySection from '../components/features/landing/MemoryGallerySection';
import HowItWorksSection from '../components/features/landing/HowItWorksSection';
import TestimonialsSection from '../components/features/landing/TestimonialsSection';
import CTASection from '../components/features/landing/CTASection';
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
        <HeroSection onOpenRegister={handleOpenRegister} onOpenLogin={loginModal.onOpen} />
        <BentoShowcase />
        <ManifestoSection />
        <MemoryGallerySection />
        <HowItWorksSection />
        <TestimonialsSection />
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
