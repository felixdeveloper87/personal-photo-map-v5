import React from 'react';
import UserProfileModal from '../modals/UserProfileModal';
import PremiumBenefitsModal from '../modals/PremiumBenefitsModal';
import PhotoStorageModal from '../modals/PhotoStorageModal';
import LoginModal from '../modals/LoginModal';
import RegisterModal from '../modals/RegisterModal';
import SearchForm from '../features/SearchForm';

/**
 * Renders every app-level modal once, driven by the shared useNavActions state.
 * SearchForm exposes a hidden [data-search-trigger] used by the nav surfaces.
 */
const AppModals = ({ nav }) => {
  const {
    fullname,
    isPremium,
    photoCount,
    countryCount,
    countriesWithPhotos,
    isUpgrading,
    profileModal,
    photoStorageModal,
    premiumModal,
    loginModal,
    registerModal,
    handlePremiumUpgrade,
    handlePremiumDeactivate,
    navigate,
  } = nav;

  return (
    <>
      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={profileModal.onClose}
        fullname={fullname}
        email=""
        photoCount={photoCount}
        countryCount={countryCount}
        isPremium={isPremium}
      />
      <PremiumBenefitsModal
        isOpen={premiumModal.isOpen}
        onClose={premiumModal.onClose}
        onUpgrade={handlePremiumUpgrade}
        onDeactivate={handlePremiumDeactivate}
        isLoading={isUpgrading}
        isPremium={isPremium}
      />
      <PhotoStorageModal isOpen={photoStorageModal.isOpen} onClose={photoStorageModal.onClose} />
      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        onSwitchToRegister={() => { loginModal.onClose(); registerModal.onOpen(); }}
      />
      <RegisterModal
        isOpen={registerModal.isOpen}
        onClose={registerModal.onClose}
        onSwitchToLogin={() => { registerModal.onClose(); loginModal.onOpen(); }}
      />
      <SearchForm
        countriesWithPhotos={countriesWithPhotos}
        onSearch={(p) => navigate(`/countries/${p.country}?year=${p.year}`)}
      />
    </>
  );
};

export default AppModals;
