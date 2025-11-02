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
 * Premium Benefits Modal - unified with BaseModal “glass” style
 * Consistent with UserProfileModal: translucent cards, blurred layers, smooth borders.
 */
const PremiumBenefitsModal = ({
  isOpen,
  onClose,
  onUpgrade,
  onDeactivate,
  isLoading = false,
  isPremium = false
}) => {
  const textColor = useColorModeValue("gray.700", "gray.100");
  const bgCard = useColorModeValue("rgba(255,255,255,0.65)", "rgba(0,0,0,0.55)");
  const borderColor = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.12)");

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
          <HStack spacing={{ base: 1.5, sm: 2, md: 3 }} w="full" flexDir={{ base: "column", sm: "row" }}>
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
      <VStack spacing={{ base: 3, sm: 4, md: 6 }} align="stretch">

        {/* Header */}
        <Box
          textAlign="center"
          p={{ base: 4, sm: 5, md: 6 }}
          borderRadius="xl"
          bg={bgCard}
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor={borderColor}
          boxShadow={useColorModeValue(
            "0 1px 3px rgba(0,0,0,0.05)",
            "0 1px 3px rgba(255,255,255,0.05)"
          )}
          position="relative"
        >
          <VStack spacing={{ base: 2, sm: 3 }} position="relative" zIndex={1}>
            {/* Icon */}
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

            <VStack spacing={{ base: 1, sm: 1.5 }}>
              <Text
                fontSize={{ base: "xl", sm: "2xl" }}
                fontWeight="bold"
                color={useColorModeValue("gray.900", "gray.100")}
              >
                {isPremium ? "Premium Features Unlocked! " : "Unlock Premium Features"}
              </Text>
              <Text
                fontSize={{ base: "sm", sm: "md" }}
                color={useColorModeValue("gray.600", "gray.400")}
              >
                {isPremium
                  ? "You have access to all premium features. Enjoy your enhanced experience!"
                  : "Take your photo mapping experience to the next level"}
              </Text>
            </VStack>
          </VStack>
        </Box>

        <Divider />

        {/* Benefits */}
        <VStack spacing={{ base: 2.5, sm: 3.5, md: 4.5 }} align="stretch">
          {benefits.map((benefit, i) => (
            <Box
              key={i}
              p={{ base: 3, sm: 4 }}
              borderRadius="lg"
              bg={bgCard}
              backdropFilter="blur(8px)"
              border="1px solid"
              borderColor={borderColor}
              transition="all 0.25s ease"
              _hover={{
                transform: "translateY(-2px)",
                borderColor: useColorModeValue(
                  `${benefit.color}.300`,
                  `${benefit.color}.600`
                ),
                boxShadow: useColorModeValue(
                  "0 4px 10px rgba(0, 0, 0, 0.08)",
                  "0 4px 12px rgba(0, 0, 0, 0.5)"
                ),
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
                  <VStack align="start" spacing={0.5}>
                    <HStack spacing={1.5}>
                      <Text fontWeight="bold" fontSize={{ base: "sm", sm: "md" }} color={textColor}>
                        {benefit.title}
                      </Text>
                      <Badge
                        colorScheme={benefit.color}
                        variant="subtle"
                        fontSize={{ base: "2xs", sm: "xs" }}
                        borderRadius="full"
                        px={{ base: 1.5, sm: 2 }}
                      >
                        PREMIUM
                      </Badge>
                    </HStack>
                    <Text
                      fontSize={{ base: "xs", sm: "sm" }}
                      color={useColorModeValue("gray.600", "gray.400")}
                    >
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

        {/* Offer */}
        {!isPremium && (
          <Box
            p={{ base: 3, sm: 4 }}
            borderRadius="lg"
            bg={useColorModeValue("rgba(240,253,244,0.8)", "rgba(20,83,45,0.8)")}
            backdropFilter="blur(6px)"
            border="1px solid"
            borderColor={useColorModeValue("green.200", "green.900")}
            textAlign="center"
          >
            <HStack justify="center" spacing={1.5} mb={1.5}>
              <Icon as={HiStar} boxSize={4} color="#F59E0B" />
              <Text fontWeight="bold" fontSize="sm" color={useColorModeValue("green.700", "green.200")}>
                Special Launch Offer
              </Text>
              <Icon as={HiStar} boxSize={4} color="#F59E0B" />
            </HStack>
            <Text fontSize="xs" color={useColorModeValue("green.600", "green.300")}>
              Limited time: Get 50% off your first year of Premium!
            </Text>
          </Box>
        )}

      </VStack>
    </BaseModal>
  );
};

export default PremiumBenefitsModal;
