import React, { useContext } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { AuthContext } from '../context/AuthContext';
import HeroSection from '../components/features/landing/HeroSection';
import FeaturesSection from '../components/features/landing/FeaturesSection';
import CTASection from '../components/features/landing/CTASection';
import TestimonialsSection from '../components/features/landing/TestimonialsSection';
import HowItWorksSection from '../components/features/landing/HowItWorksSection';
import BenefitsSection from '../components/features/landing/BenefitsSection';
import { 
  features, 
  educationalFeatures
} from '../data/homeData';
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
      {/* Hero Section */}
      <HeroSection 
        onOpenRegister={handleOpenRegister}
        onOpenLogin={loginModal.onOpen}
      />

      {/* Core Features Section */}
      <FeaturesSection
        title="Interactive Learning Features"
        description="Discover how our platform combines travel memories with comprehensive educational data for a unique learning experience"
        features={features}
        badgeText="🚀 Core Features"
        columns={{ base: 1, md: 2, lg: 4 }}
        spacing={8}
        bg="gray.50"
        bgDark="gray.900"
      />

      {/* Educational Data Section */}
      <FeaturesSection
        title="Comprehensive Country Data"
        description="Access real-time economic, social, and cultural information from trusted sources including World Bank, CIA Factbook, and international databases"
        features={educationalFeatures}
        badgeText="📊 Data Sources"
        columns={{ base: 1, md: 2 }}
        spacing={10}
        bg="white"
        bgDark="gray.800"
      />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
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
