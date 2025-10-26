import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Divider,
  Icon
} from "@chakra-ui/react";
import { 
  FaCrown, 
  FaCloud, 
  FaImages, 
  FaHeadset, 
  FaRocket,
  FaCheckCircle,
  FaStar
} from "react-icons/fa";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";

/**
 * Professional Premium Benefits Modal
 * Showcases premium features with attractive design
 */
const PremiumBenefitsModal = ({ isOpen, onClose, onUpgrade, isLoading = false, isPremium = false }) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  const benefits = [
    {
      icon: FaCloud,
      title: "100GB Photo Storage",
      description: "Unlimited cloud storage for your travel memories",
      color: "blue"
    },
    {
      icon: FaImages,
      title: "Create Albums",
      description: "Organize photos into beautiful collections",
      color: "purple"
    },
    {
      icon: FaHeadset,
      title: "Priority Support",
      description: "24/7 dedicated customer service",
      color: "green"
    },
    {
      icon: FaRocket,
      title: "Advanced Features",
      description: "Access to premium map tools and analytics",
      color: "orange"
    }
  ];

  const footer = (
    <VStack spacing={{ base: 2, sm: 3 }} w="full">
      {!isPremium ? (
        <>
          <HStack spacing={{ base: 2, sm: 3 }} w="full" flexDirection={{ base: "column", sm: "row" }}>
            <ModalButton
              variant="secondary"
              onClick={onClose}
              w="full"
              size={{ base: "md", sm: "lg" }}
            >
              Maybe Later
            </ModalButton>
            <ModalButton
              variant="primary"
              onClick={onUpgrade}
              isLoading={isLoading}
              rightIcon={<FaCrown />}
              w="full"
              size={{ base: "md", sm: "lg" }}
            >
              Upgrade to Premium
            </ModalButton>
          </HStack>
        </>
      ) : (
        <ModalButton
          variant="success"
          onClick={onClose}
          w="full"
          leftIcon={<FaCrown />}
          size={{ base: "md", sm: "lg" }}
        >
          You're Already Premium! 🎉
        </ModalButton>
      )}
    </VStack>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Premium Benefits"
      icon={FaCrown}
      footer={footer}
      size={{ base: "full", sm: "md", md: "lg", lg: "xl" }}
    >
      <VStack spacing={{ base: 4, sm: 5, md: 6 }} align="stretch">
        {/* Premium Header */}
        <Box
          textAlign="center"
          p={{ base: 4, sm: 5, md: 6 }}
          borderRadius="xl"
          bgGradient={useColorModeValue(
            "linear(to-r, yellow.100, orange.100)",
            "linear(to-r, yellow.900, orange.900)"
          )}
          border="1px solid"
          borderColor={useColorModeValue("yellow.200", "yellow.700")}
          position="relative"
          overflow="hidden"
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={0.1}
            backgroundImage={`url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="gold"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>')`}
          />
          
          <VStack spacing={{ base: 2, sm: 3 }} position="relative" zIndex={1}>
            <Box
              p={{ base: 2, sm: 3 }}
              borderRadius="full"
              bg={useColorModeValue("yellow.400", "yellow.600")}
              color="white"
              boxSize={{ base: "50px", sm: "60px" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaCrown size={28} />
            </Box>
            <Text fontSize={{ base: "xl", sm: "2xl" }} fontWeight="bold" color={textColor}>
              {isPremium ? "Premium Features Unlocked! 🎉" : "Unlock Premium Features"}
            </Text>
            <Text fontSize={{ base: "sm", sm: "md" }} color={useColorModeValue("gray.600", "gray.300")}>
              {isPremium 
                ? "You have access to all premium features. Enjoy your enhanced experience!"
                : "Take your photo mapping experience to the next level"
              }
            </Text>
          </VStack>
        </Box>

        <Divider />

        {/* Benefits List */}
        <VStack spacing={{ base: 3, sm: 4 }} align="stretch">
          {benefits.map((benefit, index) => (
            <Box
              key={index}
              p={{ base: 3, sm: 4 }}
              borderRadius="lg"
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              transition="all 0.2s ease"
              _hover={{
                transform: "translateX(4px)",
                borderColor: useColorModeValue(`${benefit.color}.300`, `${benefit.color}.600`),
                shadow: "md"
              }}
            >
              <HStack spacing={{ base: 3, sm: 4 }} align="flex-start">
                <Box
                  p={{ base: 1.5, sm: 2 }}
                  borderRadius="lg"
                  bg={useColorModeValue(`${benefit.color}.100`, `${benefit.color}.900`)}
                  color={useColorModeValue(`${benefit.color}.600`, `${benefit.color}.300`)}
                  flexShrink={0}
                >
                  <Icon as={benefit.icon} boxSize={{ base: 4, sm: 5 }} />
                </Box>
                <Box flex={1}>
                  <VStack spacing={1} align="start">
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontWeight="bold" fontSize={{ base: "md", sm: "lg" }} color={textColor}>
                        {benefit.title}
                      </Text>
                      <Badge
                        colorScheme={benefit.color}
                        variant="subtle"
                        fontSize="xs"
                        borderRadius="full"
                      >
                        PREMIUM
                      </Badge>
                    </HStack>
                    <Text fontSize={{ base: "xs", sm: "sm" }} color={useColorModeValue("gray.600", "gray.400")}>
                      {benefit.description}
                    </Text>
                  </VStack>
                </Box>
                <Box
                  color={useColorModeValue(`${benefit.color}.500`, `${benefit.color}.400`)}
                  display={{ base: "none", sm: "block" }}
                >
                  <FaCheckCircle size={20} />
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* Special Offer - Only show for non-premium users */}
        {!isPremium && (
          <Box
            p={{ base: 3, sm: 4 }}
            borderRadius="lg"
            bg={useColorModeValue("green.50", "green.900")}
            border="1px solid"
            borderColor={useColorModeValue("green.200", "green.700")}
            textAlign="center"
          >
            <HStack spacing={2} justify="center" mb={2} flexWrap="wrap">
              <FaStar color="#F59E0B" />
              <Text fontWeight="bold" fontSize={{ base: "sm", sm: "md" }} color={useColorModeValue("green.700", "green.200")}>
                Special Launch Offer
              </Text>
              <FaStar color="#F59E0B" />
            </HStack>
            <Text fontSize={{ base: "xs", sm: "sm" }} color={useColorModeValue("green.600", "green.300")}>
              Limited time: Get 50% off your first year of Premium!
            </Text>
          </Box>
        )}
      </VStack>
    </BaseModal>
  );
};

export default PremiumBenefitsModal;
