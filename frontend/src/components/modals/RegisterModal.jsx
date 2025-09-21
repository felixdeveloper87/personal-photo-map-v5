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
  CheckboxGroup,
  useToast,
  InputLeftElement,
  Select
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaUserPlus, FaUser, FaLock, FaEnvelope, FaGoogle, FaGithub, FaCheck, FaGlobe } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';

/**
 * Professional Register Modal
 * Provides a modern and secure registration experience
 */
const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Form states
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // Theme-aware colors
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  // Countries list
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
    { code: 'other', name: 'Other' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullname) {
      errors.fullname = "Full name is required";
    } else if (formData.fullname.length < 2) {
      errors.fullname = "Full name must be at least 2 characters";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.country) {
      errors.country = "Please select your country";
    }

    if (!acceptedTerms) {
      errors.terms = "You must accept the terms and conditions";
    }

    if (!acceptedPrivacy) {
      errors.privacy = "You must accept the privacy policy";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Use o proxy do Vite quando VITE_BACKEND_URL não estiver definido
      const url = import.meta.env.VITE_BACKEND_URL 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`
        : '/api/auth/register';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
          country: formData.country
        }),
      });


      if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
          const responseText = await response.text();
          
          // Try to parse as JSON
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If not JSON, use the text directly
            errorMessage = responseText || errorMessage;
          }
        } catch (readError) {
          console.error('❌ Error reading response:', readError);
        }
        
        // Handle specific HTTP status codes
        if (response.status === 409) {
          // 409 Conflict means the email is already in use
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid registration data. Please check your information and try again.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        console.error('❌ Registration error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Handle the response - it might be JSON or plain text
      let data;
      try {
        const responseText = await response.text();        
        // Try to parse as JSON first
        try {
          data = JSON.parse(responseText);
        } catch {
          // If not JSON, treat as plain text success message
          data = { message: responseText };
        }
      } catch (readError) {
        console.error('❌ Error reading success response:', readError);
        data = { message: 'Registration successful' };
      }
      
      toast({
        title: "Account created successfully! 🎉",
        description: "Welcome to Photomap! You can now sign in with your new account.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      
      onClose();
      // Switch to login modal
      onSwitchToLogin();
    } catch (error) {
      console.error('💥 Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different information.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    toast({
      title: "Coming Soon! 🚀",
      description: `${provider} registration will be available in the next update.`,
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const footer = (
    <VStack spacing={3} w="full">
      <ModalButton
        variant="primary"
        onClick={handleSubmit}
        isLoading={isLoading}
        leftIcon={<FaUserPlus />}
        w="full"
      >
        Create Account
      </ModalButton>
      
      <HStack spacing={3} w="full">
        <ModalButton
          variant="secondary"
          onClick={onSwitchToLogin}
          w="full"
        >
          Already have an account? Sign In
        </ModalButton>
      </HStack>
    </VStack>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Photomap"
      icon={FaUserPlus}
      footer={footer}
      size="lg"
      closeOnOverlayClick={false}
    >
      <VStack spacing={6} align="stretch">
        {/* Welcome Message */}
        <Box
          textAlign="center"
          p={4}
          borderRadius="lg"
          bg={useColorModeValue("green.50", "green.900")}
          border="1px solid"
          borderColor={useColorModeValue("green.200", "green.700")}
        >
          <Text fontSize="md" color={useColorModeValue("green.700", "green.200")}>
            Start your photo mapping adventure today! 📸🌍
          </Text>
        </Box>

        {/* Social Registration Options */}
        <VStack spacing={3} align="stretch">
          <Text fontSize="sm" fontWeight="semibold" color={textColor} textAlign="center">
            Or register with
          </Text>
          <HStack spacing={3}>
            <ModalButton
              variant="outline"
              onClick={() => handleSocialRegister("Google")}
              leftIcon={<FaGoogle />}
              w="full"
              size="sm"
            >
              Google
            </ModalButton>
            <ModalButton
              variant="outline"
              onClick={() => handleSocialRegister("GitHub")}
              leftIcon={<FaGithub />}
              w="full"
              size="sm"
            >
              GitHub
            </ModalButton>
          </HStack>
        </VStack>

        <Divider />

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            {/* Full Name */}
            <FormControl isInvalid={!!formErrors.fullname}>
              <FormLabel color={textColor} fontWeight="semibold">
                Full Name
              </FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <FaUser color="gray.400" />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)}
                  borderRadius="lg"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: "green.400",
                    boxShadow: "0 0 0 1px rgba(72, 187, 120, 0.6)"
                  }}
                />
              </InputGroup>
              <FormErrorMessage>{formErrors.fullname}</FormErrorMessage>
            </FormControl>

            {/* Email */}
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
                    borderColor: "green.400",
                    boxShadow: "0 0 0 1px rgba(72, 187, 120, 0.6)"
                  }}
                />
              </InputGroup>
              <FormErrorMessage>{formErrors.email}</FormErrorMessage>
            </FormControl>

            {/* Country */}
            <FormControl isInvalid={!!formErrors.country}>
              <FormLabel color={textColor} fontWeight="semibold">
                Country
              </FormLabel>
              <HStack spacing={3}>
                <Box color="gray.400" width="40px" display="flex" justifyContent="center" alignItems="center">
                  <FaGlobe />
                </Box>
                <Select
                  placeholder="Select your country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  borderRadius="lg"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: "green.400",
                    boxShadow: "0 0 0 1px rgba(72, 187, 120, 0.6)"
                  }}
                  flex="1"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </Select>
              </HStack>
              <FormErrorMessage>{formErrors.country}</FormErrorMessage>
            </FormControl>

            {/* Password */}
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
                  placeholder="Create a password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  borderRadius="lg"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: "green.400",
                    boxShadow: "0 0 0 1px rgba(72, 187, 120, 0.6)"
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

            {/* Confirm Password */}
            <FormControl isInvalid={!!formErrors.confirmPassword}>
              <FormLabel color={textColor} fontWeight="semibold">
                Confirm Password
              </FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <FaLock color="gray.400" />
                </InputLeftElement>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  borderRadius="lg"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: "green.400",
                    boxShadow: "0 0 0 1px rgba(72, 187, 120, 0.6)"
                  }}
                />
                <InputRightElement>
                  <Box
                    cursor="pointer"
                    color="gray.500"
                    _hover={{ color: "gray.700" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </Box>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
            </FormControl>
          </VStack>
        </form>

        {/* Password Requirements */}
        <Box
          p={4}
          borderRadius="lg"
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
        >
          <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
            Password Requirements:
          </Text>
          <VStack spacing={1} align="start" fontSize="xs" color={useColorModeValue("gray.600", "gray.400")}>
            <HStack spacing={2}>
              <FaCheck color={formData.password.length >= 6 ? "green" : "gray"} />
              <Text>Minimum 6 characters</Text>
            </HStack>
            <HStack spacing={2}>
              <FaCheck color="green" />
              <Text>Simple and easy to remember!</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Terms and Privacy */}
        <VStack spacing={3} align="stretch">
          <FormControl isInvalid={!!formErrors.terms}>
            <Checkbox
              isChecked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              colorScheme="green"
            >
              <Text fontSize="sm" color={textColor}>
                I accept the{' '}
                <Text as="span" color="green.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                  Terms and Conditions
                </Text>
              </Text>
            </Checkbox>
            <FormErrorMessage>{formErrors.terms}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!formErrors.privacy}>
            <Checkbox
              isChecked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              colorScheme="green"
            >
              <Text fontSize="sm" color={textColor}>
                I accept the{' '}
                <Text as="span" color="green.500" cursor="pointer" _hover={{ textDecoration: "underline" }}>
                  Privacy Policy
                </Text>
              </Text>
            </Checkbox>
            <FormErrorMessage>{formErrors.privacy}</FormErrorMessage>
          </FormControl>
        </VStack>

        {/* Security Note */}
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
  );
};

export default RegisterModal;
