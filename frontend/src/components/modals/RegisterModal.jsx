import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Divider,
  Checkbox,
  useToast,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import {
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaUser,
  FaLock,
  FaEnvelope,
  FaGoogle,
  FaGithub,
  FaCheck,
  FaGlobe,
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const textColor = useColorModeValue('gray.700', 'gray.100');
  const borderColor = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.12)');
  const cardBg = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(0,0,0,0.55)');
  const focusColor = 'rgba(72,187,120,0.65)';

  const countries = [
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullname) errors.fullname = 'Full name is required';
    else if (formData.fullname.length < 2)
      errors.fullname = 'Full name must be at least 2 characters';

    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = 'Please enter a valid email';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6)
      errors.password = 'Password must be at least 6 characters';

    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    if (!formData.country) errors.country = 'Please select your country';
    if (!acceptedTerms) errors.terms = 'You must accept the terms and conditions';
    if (!acceptedPrivacy) errors.privacy = 'You must accept the privacy policy';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
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
        title: 'Account created successfully! 🎉',
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

  const footer = (
    <VStack spacing={2.5} w="full">
      <ModalButton
        variant="primary"
        onClick={handleSubmit}
        isLoading={isLoading}
        leftIcon={<FaUserPlus />}
        w="full"
      >
        Create Account
      </ModalButton>

      <ModalButton variant="secondary" onClick={onSwitchToLogin} w="full">
        Already have an account? Sign In
      </ModalButton>
    </VStack>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Photomap"
      icon={FaUserPlus}
      footer={footer}
      size={{ base: 'full', sm: 'md', md: 'lg', lg: 'xl' }}
      closeOnOverlayClick={false}
    >
      <VStack spacing={5} align="stretch">

        {/* Header card */}
        <Box
          textAlign="center"
          p={5}
          borderRadius="xl"
          bg={cardBg}
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor={borderColor}
          boxShadow={useColorModeValue(
            '0 1px 3px rgba(0,0,0,0.05)',
            '0 1px 3px rgba(255,255,255,0.05)'
          )}
        >
          <Text fontSize="md" color={useColorModeValue('green.700', 'green.200')}>
            Start your photo mapping adventure today! 📸🌍
          </Text>
        </Box>

        {/* Social Buttons */}
        <VStack spacing={3}>
          <Text fontSize="sm" fontWeight="semibold" color={textColor} textAlign="center">
            Or register with
          </Text>
          <HStack spacing={3} flexDirection={{ base: 'column', sm: 'row' }}>
            <ModalButton variant="outline" onClick={() => toast({
              title: 'Coming Soon! 🚀',
              description: 'Google sign up will be available soon.',
              status: 'info',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
            })} leftIcon={<FaGoogle />} w="full">
              Google
            </ModalButton>
            <ModalButton variant="outline" onClick={() => toast({
              title: 'Coming Soon! 🚀',
              description: 'GitHub sign up will be available soon.',
              status: 'info',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
            })} leftIcon={<FaGithub />} w="full">
              GitHub
            </ModalButton>
          </HStack>
        </VStack>

        <Divider />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            {/* Full name */}
            <FormControl isInvalid={!!formErrors.fullname}>
              <FormLabel color={textColor}>Full Name</FormLabel>
              <InputGroup>
                <InputLeftElement><FaUser color="gray.400" /></InputLeftElement>
                <Input
                  type="text"
                  value={formData.fullname}
                  onChange={e => handleInputChange('fullname', e.target.value)}
                  placeholder="Enter your full name"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  bg={cardBg}
                  backdropFilter="blur(8px)"
                  _focus={{ borderColor: focusColor, boxShadow: `0 0 0 1px ${focusColor}` }}
                />
              </InputGroup>
              <FormErrorMessage>{formErrors.fullname}</FormErrorMessage>
            </FormControl>

            {/* Email */}
            <FormControl isInvalid={!!formErrors.email}>
              <FormLabel color={textColor}>Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement><FaEnvelope color="gray.400" /></InputLeftElement>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  bg={cardBg}
                  backdropFilter="blur(8px)"
                  _focus={{ borderColor: focusColor, boxShadow: `0 0 0 1px ${focusColor}` }}
                />
              </InputGroup>
              <FormErrorMessage>{formErrors.email}</FormErrorMessage>
            </FormControl>

            {/* Country */}
            <FormControl isInvalid={!!formErrors.country}>
              <FormLabel color={textColor}>Country</FormLabel>
              <HStack spacing={3}>
                <Box color="gray.400"><FaGlobe /></Box>
                <Select
                  placeholder="Select your country"
                  value={formData.country}
                  onChange={e => handleInputChange('country', e.target.value)}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  bg={cardBg}
                  backdropFilter="blur(8px)"
                  _focus={{ borderColor: focusColor, boxShadow: `0 0 0 1px ${focusColor}` }}
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Select>
              </HStack>
              <FormErrorMessage>{formErrors.country}</FormErrorMessage>
            </FormControl>

            {/* Passwords */}
            {[{ label: 'Password', key: 'password', show: showPassword, setShow: setShowPassword },
              { label: 'Confirm Password', key: 'confirmPassword', show: showConfirmPassword, setShow: setShowConfirmPassword }]
              .map((f, i) => (
                <FormControl key={i} isInvalid={!!formErrors[f.key]}>
                  <FormLabel color={textColor}>{f.label}</FormLabel>
                  <InputGroup>
                    <InputLeftElement><FaLock color="gray.400" /></InputLeftElement>
                    <Input
                      type={f.show ? 'text' : 'password'}
                      placeholder={f.label === 'Password'
                        ? 'Create a password (min. 6 characters)'
                        : 'Confirm your password'}
                      value={formData[f.key]}
                      onChange={e => handleInputChange(f.key, e.target.value)}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="lg"
                      bg={cardBg}
                      backdropFilter="blur(8px)"
                      _focus={{ borderColor: focusColor, boxShadow: `0 0 0 1px ${focusColor}` }}
                    />
                    <InputRightElement>
                      <Box
                        cursor="pointer"
                        color="gray.500"
                        _hover={{ color: 'gray.700' }}
                        onClick={() => f.setShow(!f.show)}
                      >
                        {f.show ? <FaEyeSlash /> : <FaEye />}
                      </Box>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{formErrors[f.key]}</FormErrorMessage>
                </FormControl>
              ))}
          </VStack>
        </form>

        {/* Terms */}
        <VStack spacing={2} align="stretch">
          <FormControl isInvalid={!!formErrors.terms}>
            <Checkbox isChecked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} colorScheme="green">
              <Text fontSize="sm" color={textColor}>
                I accept the{' '}
                <Text as="span" color="green.500" _hover={{ textDecoration: 'underline' }}>
                  Terms and Conditions
                </Text>
              </Text>
            </Checkbox>
            <FormErrorMessage>{formErrors.terms}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!formErrors.privacy}>
            <Checkbox isChecked={acceptedPrivacy} onChange={e => setAcceptedPrivacy(e.target.checked)} colorScheme="green">
              <Text fontSize="sm" color={textColor}>
                I accept the{' '}
                <Text as="span" color="green.500" _hover={{ textDecoration: 'underline' }}>
                  Privacy Policy
                </Text>
              </Text>
            </Checkbox>
            <FormErrorMessage>{formErrors.privacy}</FormErrorMessage>
          </FormControl>
        </VStack>

        {/* Security note */}
        <Box
          p={3}
          borderRadius="lg"
          bg={cardBg}
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} textAlign="center">
            🔒 Your data is encrypted and secure. We never store your password.
          </Text>
        </Box>
      </VStack>
    </BaseModal>
  );
};

export default RegisterModal;
