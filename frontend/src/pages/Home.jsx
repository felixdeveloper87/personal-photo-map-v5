import React, { useContext } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import HeroSection from '../components/features/landing/HeroSection';
import BentoShowcase from '../components/features/landing/BentoShowcase';
import CTASection from '../components/features/landing/CTASection';
import TestimonialsSection from '../components/features/landing/TestimonialsSection';
import HowItWorksSection from '../components/features/landing/HowItWorksSection';
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
      {/* Hero */}
      <HeroSection
        onOpenRegister={handleOpenRegister}
        onOpenLogin={loginModal.onOpen}
      />

      {/* Product showcase — consolidated bento grid */}
      <BentoShowcase />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Social proof */}
      <TestimonialsSection />

      {/* CTA */}
      <CTASection onOpenRegister={handleOpenRegister} />

      {/* Authentication Modals */}
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
