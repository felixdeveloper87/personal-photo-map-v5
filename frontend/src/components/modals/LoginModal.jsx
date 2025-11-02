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
  useToast,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUser,
  FaLock,
  FaEnvelope,
  FaGoogle,
  FaGithub,
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import ResetPasswordModal from './ResetPasswordModal';
import { buildApiUrl } from '../../utils/apiConfig';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const textColor = useColorModeValue('gray.700', 'gray.100');
  const borderColor = useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.12)');
  const cardBg = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(0,0,0,0.55)');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email';
    if (!formData.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(await response.text() || 'Login failed');

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

  const handleSocialLogin = provider => {
    toast({
      title: 'Coming Soon! 🚀',
      description: `${provider} login will be available soon.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const footer = (
    <VStack spacing={2.5} w="full">
      <ModalButton
        variant="primary"
        onClick={handleSubmit}
        isLoading={isLoading}
        leftIcon={<FaSignInAlt />}
        w="full"
      >
        Sign In
      </ModalButton>

      <HStack spacing={2} w="full">
        <ModalButton variant="outline" onClick={() => setShowResetModal(true)} w="full">
          Forgot Password?
        </ModalButton>
        <ModalButton variant="secondary" onClick={onSwitchToRegister} w="full">
          Create Account
        </ModalButton>
      </HStack>
    </VStack>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Welcome Back"
        icon={FaUser}
        footer={footer}
        size={{ base: 'full', sm: 'md', md: 'lg' }}
        closeOnOverlayClick={false}
      >
        <VStack spacing={5} align="stretch">
          {/* Intro card */}
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
            <Text fontSize="md" color={useColorModeValue('blue.700', 'blue.200')}>
              Sign in to continue your photo mapping journey
            </Text>
          </Box>

          {/* Social login */}
          <VStack spacing={3} align="stretch">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color={textColor}
              textAlign="center"
            >
              Or continue with
            </Text>
            <HStack spacing={3} flexDirection={{ base: 'column', sm: 'row' }}>
              <ModalButton
                variant="outline"
                onClick={() => handleSocialLogin('Google')}
                leftIcon={<FaGoogle />}
                w="full"
              >
                Google
              </ModalButton>
              <ModalButton
                variant="outline"
                onClick={() => handleSocialLogin('GitHub')}
                leftIcon={<FaGithub />}
                w="full"
              >
                GitHub
              </ModalButton>
            </HStack>
          </VStack>

          <Divider />

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!formErrors.email}>
                <FormLabel color={textColor} fontWeight="semibold">
                  Email Address
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <FaEnvelope color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={borderColor}
                    bg={cardBg}
                    backdropFilter="blur(8px)"
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`,
                    }}
                  />
                </InputGroup>
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.password}>
                <FormLabel color={textColor} fontWeight="semibold">
                  Password
                </FormLabel>
                <InputGroup>
                  <InputLeftElement>
                    <FaLock color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={borderColor}
                    bg={cardBg}
                    backdropFilter="blur(8px)"
                    _focus={{
                      borderColor: accentColor,
                      boxShadow: `0 0 0 1px ${accentColor}`,
                    }}
                  />
                  <InputRightElement>
                    <Box
                      cursor="pointer"
                      color="gray.500"
                      _hover={{ color: 'gray.700' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Box>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{formErrors.password}</FormErrorMessage>
              </FormControl>
            </VStack>
          </form>

          {/* Security note */}
          <Box
            p={3}
            borderRadius="lg"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            backdropFilter="blur(8px)"
          >
            <Text
              fontSize="xs"
              color={useColorModeValue('gray.600', 'gray.400')}
              textAlign="center"
            >
              🔒 Your data is encrypted and secure. We never store your password.
            </Text>
          </Box>
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
