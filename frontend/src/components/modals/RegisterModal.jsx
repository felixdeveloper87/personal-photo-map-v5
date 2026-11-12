import { useState } from 'react';
import { Checkbox, FormControl, FormErrorMessage, FormLabel, HStack, Icon, InputGroup, InputLeftElement, Select, SimpleGrid, Text, VStack, useToast } from '@chakra-ui/react';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { HiEnvelope, HiGlobeAmericas, HiLockClosed, HiShieldCheck, HiUser, HiUserPlus } from 'react-icons/hi2';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { ModalDivider, ModalField } from './ModalKit';
import { color } from '../../design/tokens';

const FORM_ID = 'register-form';

const COUNTRIES = [
  { code: 'br', name: 'Brazil' },
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'it', name: 'Italy' },
  { code: 'es', name: 'Spain' },
  { code: 'pt', name: 'Portugal' },
  { code: 'mx', name: 'Mexico' },
  { code: 'ar', name: 'Argentina' },
  { code: 'cl', name: 'Chile' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'cn', name: 'China' },
  { code: 'in', name: 'India' },
  { code: 'ru', name: 'Russia' },
  { code: 'za', name: 'South Africa' },
  { code: 'eg', name: 'Egypt' },
  { code: 'other', name: 'Other' },
];

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullname) errors.fullname = 'Full name is required';
    else if (formData.fullname.length < 2) errors.fullname = 'Full name must be at least 2 characters';

    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (!formData.country) errors.country = 'Please select your country';
    if (!acceptedTerms) errors.terms = 'You must accept the terms and conditions';
    if (!acceptedPrivacy) errors.privacy = 'You must accept the privacy policy';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const url = import.meta.env.VITE_BACKEND_URL
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`
        : '/api/auth/register';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Registration failed');
      }

      toast({
        title: 'Account created successfully',
        description: 'You can now sign in with your new account.',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });

      onClose();
      onSwitchToLogin();
    } catch (err) {
      toast({
        title: 'Registration failed',
        description: err.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const comingSoon = (provider) =>
    toast({
      title: 'Coming soon',
      description: `${provider} sign up will be available soon.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });

  const footer = (
    <VStack spacing={3} w="full">
      <ModalButton
        type="submit"
        form={FORM_ID}
        variant="primary"
        size="lg"
        isLoading={isLoading}
        leftIcon={<HiUserPlus />}
        w="full"
      >
        Create account
      </ModalButton>
      <Text fontSize="sm" color={color.textMuted} textAlign="center">
        Already have an account?{' '}
        <ModalButton variant="ghost" size="sm" h="auto" px={1} py={0.5} color={color.primary} onClick={onSwitchToLogin}>
          Sign in
        </ModalButton>
      </Text>
    </VStack>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Create account"
      title="Join PhotoMap"
      subtitle="Start your photo mapping adventure today."
      icon={HiUserPlus}
      footer={footer}
      size={{ base: 'full', sm: 'md', md: 'lg' }}
      closeOnOverlayClick={false}
    >
      <VStack spacing={5} align="stretch">
        <HStack spacing={2.5}>
          <ModalButton variant="secondary" onClick={() => comingSoon('Google')} leftIcon={<FaGoogle />} flex={1}>
            Google
          </ModalButton>
          <ModalButton variant="secondary" onClick={() => comingSoon('GitHub')} leftIcon={<FaGithub />} flex={1}>
            GitHub
          </ModalButton>
        </HStack>

        <ModalDivider label="or sign up with email" />

        <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
          <VStack spacing={4} align="stretch">
            <ModalField
              label="Full name"
              icon={HiUser}
              autoComplete="name"
              placeholder="Your full name"
              value={formData.fullname}
              onChange={(e) => handleInputChange('fullname', e.target.value)}
              error={formErrors.fullname}
            />
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

            <FormControl isInvalid={!!formErrors.country}>
              <FormLabel variant="atlas">Country</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" zIndex={1}>
                  <Icon as={HiGlobeAmericas} boxSize={3.5} />
                </InputLeftElement>
                <Select
                  placeholder="Select your country"
                  pl={10}
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </InputGroup>
              <FormErrorMessage>{formErrors.country}</FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <ModalField
                label="Password"
                icon={HiLockClosed}
                type="password"
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={formErrors.password}
              />
              <ModalField
                label="Confirm password"
                icon={HiLockClosed}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={formErrors.confirmPassword}
              />
            </SimpleGrid>

            <VStack spacing={2.5} align="stretch" pt={1}>
              <FormControl isInvalid={!!formErrors.terms}>
                <Checkbox isChecked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}>
                  <Text fontSize="sm">
                    I accept the{' '}
                    <Text as="span" color={color.primary}>
                      Terms and Conditions
                    </Text>
                  </Text>
                </Checkbox>
                <FormErrorMessage>{formErrors.terms}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!formErrors.privacy}>
                <Checkbox isChecked={acceptedPrivacy} onChange={(e) => setAcceptedPrivacy(e.target.checked)}>
                  <Text fontSize="sm">
                    I accept the{' '}
                    <Text as="span" color={color.primary}>
                      Privacy Policy
                    </Text>
                  </Text>
                </Checkbox>
                <FormErrorMessage>{formErrors.privacy}</FormErrorMessage>
              </FormControl>
            </VStack>
          </VStack>
        </form>

        <HStack spacing={2} justify="center" color={color.textMuted}>
          <HiShieldCheck />
          <Text fontSize="xs">Your data is encrypted and secure. We never store your password.</Text>
        </HStack>
      </VStack>
    </BaseModal>
  );
};

export default RegisterModal;
