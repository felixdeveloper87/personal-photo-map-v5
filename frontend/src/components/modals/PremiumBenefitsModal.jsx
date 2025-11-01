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
  HiSparkles as HiCrown, 
  HiCloudArrowUp as HiCloud, 
  HiRectangleStack as HiImages, 
  HiChatBubbleLeftRight as HiHeadset, 
  HiRocketLaunch as HiRocket,
  HiCheckCircle,
  HiStar
} from "react-icons/hi2";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";

/**
 * Professional Premium Benefits Modal
 * Showcases premium features with attractive design
 */
const PremiumBenefitsModal = ({ isOpen, onClose, onUpgrade, onDeactivate, isLoading = false, isPremium = false }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "white");
  const bgColor = useColorModeValue("gray.50", "black");

  const benefits = [
    {
      icon: HiCloud,
      title: "100GB Photo Storage",
      description: "Unlimited cloud storage for your travel memories",
      color: "blue"
    },
    {
      icon: HiImages,
      title: "Create Albums",
      description: "Organize photos into beautiful collections",
      color: "purple"
    },
    {
      icon: HiHeadset,
      title: "Priority Support",
      description: "24/7 dedicated customer service",
      color: "green"
    },
    {
      icon: HiRocket,
      title: "Advanced Features",
      description: "Access to premium map tools and analytics",
      color: "orange"
    }
  ];

  const footer = (
    <VStack spacing={{ base: 1.5, sm: 2, md: 3 }} w="full">
      {!isPremium ? (
        <>
          <HStack spacing={{ base: 1.5, sm: 2, md: 3 }} w="full" flexDirection={{ base: "column", sm: "row" }}>
            <ModalButton
              variant="secondary"
              onClick={onClose}
              w="full"
              size={{ base: "sm", sm: "md", md: "lg" }}
            >
              Maybe Later
            </ModalButton>
            <ModalButton
              variant="primary"
              onClick={onUpgrade}
              isLoading={isLoading}
              rightIcon={<Icon as={HiCrown} />}
              w="full"
              size={{ base: "sm", sm: "md", md: "lg" }}
            >
              Upgrade to Premium
            </ModalButton>
          </HStack>
        </>
      ) : (
        <>
          <ModalButton
            variant="success"
            onClick={onClose}
            w="full"
            leftIcon={<Icon as={HiCrown} />}
            size={{ base: "sm", sm: "md", md: "lg" }}
          >
            You're Already Premium! 🎉
          </ModalButton>
          <ModalButton
            variant="danger"
            onClick={onDeactivate}
            isLoading={isLoading}
            w="full"
            size={{ base: "sm", sm: "md", md: "lg" }}
          >
            Deactivate Premium
          </ModalButton>
        </>
      )}
    </VStack>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Premium Benefits"
      icon={HiCrown}
      footer={footer}
      size={{ base: "full", sm: "md", md: "lg", lg: "xl" }}
    >
      <VStack spacing={{ base: 2.5, sm: 3, md: 5, lg: 6 }} align="stretch">
        {/* Premium Header */}
        <Box
          textAlign="center"
          p={{ base: 4, sm: 5, md: 6 }}
          borderRadius="xl"
          bg={useColorModeValue("gray.50", "black")}
          border="1px solid"
          borderColor={useColorModeValue("gray.200", "white")}
          position="relative"
        >
          <VStack spacing={{ base: 2, sm: 3 }} position="relative" zIndex={1}>
            {/* Premium Icon */}
            <Box
              p={{ base: 2, sm: 2.5 }}
              borderRadius="full"
              bg={useColorModeValue("blue.50", "blue.900")}
              color={useColorModeValue("blue.600", "blue.400")}
              boxSize={{ base: "48px", sm: "56px", md: "64px" }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="1px solid"
              borderColor={useColorModeValue("blue.200", "blue.700")}
            >
              <Icon as={HiCrown} boxSize={{ base: "20px", sm: "24px", md: "28px" }} />
            </Box>
            
            <VStack spacing={{ base: 1, sm: 1.5 }} w="full">
              <Text 
                fontSize={{ base: "xl", sm: "2xl", md: "2xl" }} 
                fontWeight="bold" 
                color={useColorModeValue("gray.900", "gray.100")}
                letterSpacing="tight"
              >
                {isPremium ? "Premium Features Unlocked! " : "Unlock Premium Features"}
              </Text>
              <Text 
                fontSize={{ base: "xs", sm: "sm", md: "md" }} 
                color={useColorModeValue("gray.600", "gray.400")}
                fontWeight="normal"
                maxW="90%"
              >
                {isPremium 
                  ? "You have access to all premium features. Enjoy your enhanced experience!"
                  : "Take your photo mapping experience to the next level"
                }
              </Text>
            </VStack>
          </VStack>
        </Box>

        <Divider />

        {/* Benefits List */}
        <VStack spacing={{ base: 2, sm: 2.5, md: 4 }} align="stretch">
          {benefits.map((benefit, index) => (
            <Box
              key={index}
              p={{ base: 2, sm: 2.5, md: 4 }}
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
              <HStack spacing={{ base: 2, sm: 2.5, md: 4 }} align="flex-start">
                <Box
                  p={{ base: 1, sm: 1.5, md: 2 }}
                  borderRadius="lg"
                  bg={useColorModeValue(`${benefit.color}.100`, `${benefit.color}.900`)}
                  color={useColorModeValue(`${benefit.color}.600`, `${benefit.color}.300`)}
                  flexShrink={0}
                >
                  <Icon as={benefit.icon} boxSize={{ base: 3.5, sm: 4, md: 5 }} />
                </Box>
                <Box flex={1}>
                  <VStack spacing={0.5} align="start">
                    <HStack spacing={1.5} flexWrap="wrap">
                      <Text fontWeight="bold" fontSize={{ base: "sm", sm: "md", md: "lg" }} color={textColor}>
                        {benefit.title}
                      </Text>
                      <Badge
                        colorScheme={benefit.color}
                        variant="subtle"
                        fontSize={{ base: "2xs", sm: "xs" }}
                        borderRadius="full"
                        px={{ base: 1, sm: 1.5 }}
                        py={0}
                      >
                        PREMIUM
                      </Badge>
                    </HStack>
                    <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={useColorModeValue("gray.600", "gray.400")}>
                      {benefit.description}
                    </Text>
                  </VStack>
                </Box>
                <Box
                  color={useColorModeValue(`${benefit.color}.500`, `${benefit.color}.400`)}
                  display={{ base: "none", sm: "block" }}
                >
                  <Icon as={HiCheckCircle} boxSize={{ base: "16px", sm: "18px", md: "20px" }} />
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* Special Offer - Only show for non-premium users */}
        {!isPremium && (
          <Box
            p={{ base: 2, sm: 2.5, md: 4 }}
            borderRadius="lg"
            bg={useColorModeValue("green.50", "green.900")}
            border="1px solid"
            borderColor={useColorModeValue("green.200", "green.700")}
            textAlign="center"
          >
            <HStack spacing={1.5} justify="center" mb={{ base: 1, sm: 1.5, md: 2 }} flexWrap="wrap">
              <Icon as={HiStar} boxSize={{ base: "12px", sm: "14px", md: "16px" }} color="#F59E0B" />
              <Text fontWeight="bold" fontSize={{ base: "xs", sm: "sm", md: "md" }} color={useColorModeValue("green.700", "green.200")}>
                Special Launch Offer
              </Text>
              <Icon as={HiStar} boxSize={{ base: "12px", sm: "14px", md: "16px" }} color="#F59E0B" />
            </HStack>
            <Text fontSize={{ base: "2xs", sm: "xs", md: "sm" }} color={useColorModeValue("green.600", "green.300")}>
              Limited time: Get 50% off your first year of Premium!
            </Text>
          </Box>
        )}
      </VStack>
    </BaseModal>
  );
};

export default PremiumBenefitsModal;
