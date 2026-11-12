import { useState } from 'react';
import { VStack } from '@chakra-ui/react';
import { HiEnvelope, HiKey, HiLockClosed, HiShieldCheck } from 'react-icons/hi2';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { CheckItem, ModalActions, ModalField, ModalNotice, ModalSection, Panel } from './ModalKit';

const FORM_ID = 'reset-password-form';
const EMPTY = { email: '', newPassword: '', confirmPassword: '', currentPassword: '' };

/**
 * Reset Password Modal — secure password change form.
 */
const ResetPasswordModal = ({ isOpen, onClose, onReset, isLoading, error, success }) => {
  const [formData, setFormData] = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';

    if (!formData.currentPassword) errors.currentPassword = 'Current password is required';

    if (!formData.newPassword) errors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';

    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your new password';
    else if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) onReset(formData);
  };

  const handleClose = () => {
    setFormData(EMPTY);
    setFormErrors({});
    onClose();
  };

  const footer = (
    <ModalActions>
      <ModalButton variant="secondary" onClick={handleClose}>
        Cancel
      </ModalButton>
      <ModalButton type="submit" form={FORM_ID} variant="primary" isLoading={isLoading} leftIcon={<HiShieldCheck />}>
        Reset password
      </ModalButton>
    </ModalActions>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      eyebrow="Account security"
      title="Reset password"
      subtitle="Enter your current password and choose a new, secure one."
      icon={HiKey}
      footer={footer}
      size="md"
    >
      <VStack spacing={5} align="stretch">
        {success && (
          <ModalNotice tone="success" title="Password updated">
            Your password has been reset successfully.
          </ModalNotice>
        )}
        {error && (
          <ModalNotice tone="danger" title="Something went wrong">
            {error}
          </ModalNotice>
        )}

        <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
          <VStack spacing={4} align="stretch">
            <ModalField
              label="Email"
              icon={HiEnvelope}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={formErrors.email}
            />
            <ModalField
              label="Current password"
              icon={HiLockClosed}
              type="password"
              autoComplete="current-password"
              placeholder="Your current password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              error={formErrors.currentPassword}
            />
            <ModalField
              label="New password"
              icon={HiLockClosed}
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              error={formErrors.newPassword}
            />
            <ModalField
              label="Confirm new password"
              icon={HiLockClosed}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat new password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              error={formErrors.confirmPassword}
            />
          </VStack>
        </form>

        <Panel>
          <ModalSection title="Password requirements" spacing={2.5}>
            <VStack spacing={1.5} align="stretch">
              <CheckItem>Minimum 8 characters</CheckItem>
              <CheckItem>Upper and lowercase letters</CheckItem>
              <CheckItem>Numbers and special characters</CheckItem>
            </VStack>
          </ModalSection>
        </Panel>
      </VStack>
    </BaseModal>
  );
};

export default ResetPasswordModal;
