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
  InputLeftElement
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaSignInAlt, FaUser, FaLock, FaEnvelope, FaGoogle, FaGithub } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import ResetPasswordModal from './ResetPasswordModal';
import { buildApiUrl } from '../../utils/apiConfig';

/**
 * Professional Login Modal
 * Provides a modern and secure login experience
 */
const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login } = useContext(AuthContext);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Theme-aware colors
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || 'Login failed');
      }

      const data = await response.json();
      login(data);
      
      toast({
        title: "Welcome back! 🎉",
        description: "You have successfully logged in.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      
      onClose();
      navigate('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast({
      title: "Coming Soon! 🚀",
      description: `${provider} login will be available in the next update.`,
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleForgotPassword = () => setShowResetModal(true);
  const handleCloseResetModal = () => setShowResetModal(false);

  const footer = (
    <VStack spacing={3} w="full">
      <ModalButton
        variant="primary"
        onClick={handleSubmit}
        isLoading={isLoading}
        leftIcon={<FaSignInAlt />}
        w="full"
      >
        Sign In
      </ModalButton>
      
      <HStack spacing={3} w="full">
        <ModalButton variant="outline" onClick={handleForgotPassword} w="full">
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
        size="md"
        closeOnOverlayClick={false}
      >
        <VStack spacing={6} align="stretch">
          <Box
            textAlign="center"
            p={4}
            borderRadius="lg"
            bg={useColorModeValue("blue.50", "blue.900")}
            border="1px solid"
            borderColor={useColorModeValue("blue.200", "blue.700")}
          >
            <Text fontSize="md" color={useColorModeValue("blue.700", "blue.200")}>
              Sign in to continue your photo mapping journey
            </Text>
          </Box>

          <VStack spacing={3} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" color={textColor} textAlign="center">
              Or continue with
            </Text>
            <HStack spacing={3}>
              <ModalButton
                variant="outline"
                onClick={() => handleSocialLogin("Google")}
                leftIcon={<FaGoogle />}
                w="full"
                size="sm"
              >
                Google
              </ModalButton>
              <ModalButton
                variant="outline"
                onClick={() => handleSocialLogin("GitHub")}
                leftIcon={<FaGithub />}
                w="full"
                size="sm"
              >
                GitHub
              </ModalButton>
            </HStack>
          </VStack>

          <Divider />

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
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
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
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
                    }}
                  />
                  <InputRightElement>
                    <Box
                      cursor="pointer"
                      color="gray.500"
                      _hover={{ color: "gray.700" }}
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

          <Box
            p={3}
            borderRadius="lg"
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.400")} textAlign="center">
              🔒 Your data is encrypted and secure. We never store your password.
            </Text>
          </Box>
        </VStack>
      </BaseModal>

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={handleCloseResetModal}
        onReset={(data) => {
          handleCloseResetModal();
          toast({
            title: "Reset Email Sent",
            description: "Check your email for password reset instructions.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top-right",
          });
        }}
        isLoading={false}
        error={null}
        success={null}
      />
    </>
  );
};

export default LoginModal;
