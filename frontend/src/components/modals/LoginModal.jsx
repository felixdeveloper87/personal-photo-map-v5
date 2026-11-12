import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HStack, Text, VStack, useToast } from '@chakra-ui/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { HiArrowRightOnRectangle, HiEnvelope, HiLockClosed, HiShieldCheck } from 'react-icons/hi2';
import { AuthContext } from '../../context/AuthContext';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import ResetPasswordModal from './ResetPasswordModal';
import { ModalDivider, ModalField } from './ModalKit';
import { buildApiUrl } from '../../utils/apiConfig';
import { color } from '../../design/tokens';

const FORM_ID = 'login-form';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Backend returns plain text on error
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }

      const data = await response.json();
      login(data);
      onClose();
      navigate('/');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message || 'Please check your credentials and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: 'Coming soon',
      description: `${provider} login will be available soon.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const footer = (
    <VStack spacing={3} w="full">
      <ModalButton
        type="submit"
        form={FORM_ID}
        variant="primary"
        size="lg"
        isLoading={isLoading}
        leftIcon={<HiArrowRightOnRectangle />}
        w="full"
      >
        Sign in
      </ModalButton>
      <Text fontSize="sm" color={color.textMuted} textAlign="center">
        New to PhotoMap?{' '}
        <ModalButton variant="ghost" size="sm" h="auto" px={1} py={0.5} color={color.primary} onClick={onSwitchToRegister}>
          Create an account
        </ModalButton>
      </Text>
    </VStack>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        eyebrow="Sign in"
        title="Welcome back"
        subtitle="Pick up your photo map right where you left it."
        icon={HiArrowRightOnRectangle}
        footer={footer}
        size="md"
        closeOnOverlayClick={false}
      >
        <VStack spacing={5} align="stretch">
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
                label="Password"
                icon={HiLockClosed}
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={formErrors.password}
              />
              <HStack justify="flex-end" mt={-1}>
                <ModalButton
                  variant="ghost"
                  size="sm"
                  h="auto"
                  px={1}
                  py={0.5}
                  color={color.textSoft}
                  onClick={() => setShowResetModal(true)}
                >
                  Forgot password?
                </ModalButton>
              </HStack>
            </VStack>
          </form>

          <ModalDivider label="or continue with" />

          <HStack spacing={2.5}>
            <ModalButton variant="secondary" onClick={() => handleSocialLogin('Google')} leftIcon={<FaGoogle />} flex={1}>
              Google
            </ModalButton>
            <ModalButton variant="secondary" onClick={() => handleSocialLogin('GitHub')} leftIcon={<FaGithub />} flex={1}>
              GitHub
            </ModalButton>
          </HStack>

          <HStack spacing={2} justify="center" color={color.textMuted}>
            <HiShieldCheck />
            <Text fontSize="xs">Your data is encrypted and secure. We never store your password.</Text>
          </HStack>
        </VStack>
      </BaseModal>

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onReset={() => {
          setShowResetModal(false);
          toast({
            title: 'Reset Email Sent',
            description: 'Check your inbox for reset instructions.',
            status: 'success',
            duration: 4000,
            isClosable: true,
            position: 'top-right',
          });
        }}
        isLoading={false}
      />
    </>
  );
};

export default LoginModal;
