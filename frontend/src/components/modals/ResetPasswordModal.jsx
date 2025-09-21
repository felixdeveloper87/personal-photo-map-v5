import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  Input,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash, FaLock, FaShieldAlt } from "react-icons/fa";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";

/**
 * Professional Reset Password Modal
 * Provides secure password reset functionality
 */
const ResetPasswordModal = ({ isOpen, onClose, onReset, isLoading, error, success }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
    currentPassword: ""
  });
  const [formErrors, setFormErrors] = useState({});

  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
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

    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onReset(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      newPassword: "",
      confirmPassword: "",
      currentPassword: ""
    });
    setFormErrors({});
    onClose();
  };

  const footer = (
    <Box w="full">
      <VStack spacing={3}>
        <ModalButton
          variant="primary"
          onClick={handleSubmit}
          isLoading={isLoading}
          leftIcon={<FaShieldAlt />}
          w="full"
        >
          Reset Password
        </ModalButton>
        <ModalButton
          variant="secondary"
          onClick={handleClose}
          w="full"
        >
          Cancel
        </ModalButton>
      </VStack>
    </Box>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset Password"
      icon={FaLock}
      footer={footer}
      size="md"
    >
      <VStack spacing={6} align="stretch">
        {/* Info Alert */}
        <Alert
          status="info"
          variant="subtle"
          borderRadius="lg"
          bg={useColorModeValue("blue.50", "blue.900")}
          border="1px solid"
          borderColor={useColorModeValue("blue.200", "blue.700")}
        >
          <AlertIcon />
          <Box>
            <AlertTitle>Password Reset</AlertTitle>
            <AlertDescription>
              Enter your current password and choose a new secure password.
            </AlertDescription>
          </Box>
        </Alert>

        {/* Success/Error Messages */}
        {success && (
          <Alert
            status="success"
            variant="subtle"
            borderRadius="lg"
            bg={useColorModeValue("green.50", "green.900")}
            border="1px solid"
            borderColor={useColorModeValue("green.200", "green.700")}
          >
            <AlertIcon />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Your password has been reset successfully.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert
            status="error"
            variant="subtle"
            borderRadius="lg"
            bg={useColorModeValue("red.50", "red.900")}
            border="1px solid"
            borderColor={useColorModeValue("red.200", "red.700")}
          >
            <AlertIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <VStack spacing={4} align="stretch">
          {/* Email */}
          <FormControl isInvalid={!!formErrors.email}>
            <FormLabel color={textColor} fontWeight="semibold">
              Email Address
            </FormLabel>
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
            <FormErrorMessage>{formErrors.email}</FormErrorMessage>
          </FormControl>

          {/* Current Password */}
          <FormControl isInvalid={!!formErrors.currentPassword}>
            <FormLabel color={textColor} fontWeight="semibold">
              Current Password
            </FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
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
            <FormErrorMessage>{formErrors.currentPassword}</FormErrorMessage>
          </FormControl>

          {/* New Password */}
          <FormControl isInvalid={!!formErrors.newPassword}>
            <FormLabel color={textColor} fontWeight="semibold">
              New Password
            </FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password (min. 8 characters)"
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
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
            <FormErrorMessage>{formErrors.newPassword}</FormErrorMessage>
          </FormControl>

          {/* Confirm Password */}
          <FormControl isInvalid={!!formErrors.confirmPassword}>
            <FormLabel color={textColor} fontWeight="semibold">
              Confirm New Password
            </FormLabel>
            <InputGroup>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </Box>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{formErrors.confirmPassword}</FormErrorMessage>
          </FormControl>
        </VStack>

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
            <Text>• Minimum 8 characters</Text>
            <Text>• Include uppercase and lowercase letters</Text>
            <Text>• Include numbers and special characters</Text>
          </VStack>
        </Box>
      </VStack>
    </BaseModal>
  );
};

export default ResetPasswordModal;
