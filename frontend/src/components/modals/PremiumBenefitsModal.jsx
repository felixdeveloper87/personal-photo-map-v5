import React from "react";
import { Box, Text, VStack, HStack, Icon } from "@chakra-ui/react";
import {
  HiSparkles as HiCrown,
  HiCloudArrowUp as HiCloud,
  HiRectangleStack as HiImages,
  HiChatBubbleLeftRight as HiHeadset,
  HiRocketLaunch as HiRocket,
  HiCheckCircle,
  HiBolt,
} from "react-icons/hi2";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";
import { useLandingTokens } from "../features/landing/landingUI";

const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";
const SERIF = "'Instrument Serif', Georgia, serif";

const TONES = [
  { key: 'amber', icon: '#EBB572', soft: 'rgba(235,181,114,0.10)', border: 'rgba(235,181,114,0.32)' },
  { key: 'teal',  icon: '#6FD0C4', soft: 'rgba(111,208,196,0.10)', border: 'rgba(111,208,196,0.32)' },
  { key: 'rose',  icon: '#E58A7B', soft: 'rgba(229,138,123,0.10)', border: 'rgba(229,138,123,0.32)' },
  { key: 'amber', icon: '#EBB572', soft: 'rgba(235,181,114,0.10)', border: 'rgba(235,181,114,0.32)' },
];

const BENEFITS = [
  { icon: HiCloud,   title: '100 GB Photo Storage',   desc: 'Unlimited cloud storage for your travel memories' },
  { icon: HiImages,  title: 'Create Albums',           desc: 'Organise photos into curated collections' },
  { icon: HiHeadset, title: 'Priority Support',        desc: '24/7 dedicated support for every journey' },
  { icon: HiRocket,  title: 'Advanced Features',       desc: 'Premium map tools, analytics, and more' },
];

const PremiumBenefitsModal = ({
  isOpen, onClose, onUpgrade, onDeactivate, isLoading = false, isPremium = false
}) => {
  const t = useLandingTokens();

  const footer = (
    <VStack spacing={2} w="full">
      {!isPremium ? (
        <HStack spacing={3} w="full" flexDir={{ base: 'column', sm: 'row' }}>
          <ModalButton variant="secondary" onClick={onClose} w="full">
            Maybe Later
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={onUpgrade}
            isLoading={isLoading}
            rightIcon={<Icon as={HiCrown} />}
            w="full"
          >
            Upgrade to Premium
          </ModalButton>
        </HStack>
      ) : (
        <>
          <ModalButton variant="primary" onClick={onClose} w="full" leftIcon={<Icon as={HiCrown} />}>
            You&apos;re already Premium
          </ModalButton>
          <ModalButton variant="danger" onClick={onDeactivate} isLoading={isLoading} w="full">
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
      <VStack spacing={5} align="stretch">

        {/* Hero */}
        <Box
          p={6}
          borderRadius="16px"
          bg={t.surface}
          border="1px solid"
          borderColor={t.hairline}
          textAlign="center"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '160px',
            height: '160px',
            background: 'radial-gradient(circle, rgba(235,181,114,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        >
          <Box
            display="inline-flex"
            p={3}
            borderRadius="full"
            bg="rgba(235,181,114,0.12)"
            border="1px solid rgba(235,181,114,0.32)"
            mb={3}
          >
            <Icon as={HiCrown} boxSize={7} color={t.primary} />
          </Box>

          <Text
            fontFamily={SERIF}
            fontSize={{ base: '22px', md: '26px' }}
            fontWeight="400"
            color={t.text}
            lineHeight="1.1"
            mb={2}
          >
            {isPremium ? 'Premium unlocked' : 'Unlock Premium'}
          </Text>
          <Text fontFamily={MONO} fontSize="11px" color={t.textSoft} letterSpacing="0.04em">
            {isPremium
              ? 'You have access to all premium features. Enjoy the journey.'
              : 'Take your photo mapping experience to the next level.'}
          </Text>

          {isPremium && (
            <Box
              display="inline-block"
              mt={3}
              px={3}
              py={1}
              borderRadius="full"
              bg="rgba(235,181,114,0.14)"
              border="1px solid rgba(235,181,114,0.32)"
            >
              <Text fontFamily={MONO} fontSize="10px" fontWeight="700" color={t.primary} letterSpacing="0.12em">
                ACTIVE PLAN
              </Text>
            </Box>
          )}
        </Box>

        {/* Hairline divider */}
        <Box h="1px" bg={t.hairline} />

        {/* Benefits */}
        <VStack spacing={2.5} align="stretch">
          {BENEFITS.map((b, i) => {
            const tone = TONES[i % TONES.length];
            return (
              <Box
                key={i}
                p={4}
                borderRadius="14px"
                bg={t.surface}
                border="1px solid"
                borderColor={t.hairline}
                transition="all .2s ease"
                _hover={{ borderColor: tone.border, transform: 'translateY(-1px)' }}
              >
                <HStack spacing={3} align="flex-start">
                  <Box
                    p={2}
                    borderRadius="10px"
                    bg={tone.soft}
                    border={`1px solid ${tone.border}`}
                    color={tone.icon}
                    flexShrink={0}
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={b.icon} boxSize={4} />
                  </Box>

                  <Box flex={1}>
                    <Text
                      fontFamily={MONO}
                      fontSize="12px"
                      fontWeight="700"
                      color={t.text}
                      letterSpacing="0.02em"
                      mb={0.5}
                    >
                      {b.title}
                    </Text>
                    <Text fontFamily={MONO} fontSize="11px" color={t.textSoft}>
                      {b.desc}
                    </Text>
                  </Box>

                  <Box flexShrink={0} display="flex" alignItems="center" pt="2px">
                    <Icon as={HiCheckCircle} boxSize={4} color={tone.icon} />
                  </Box>
                </HStack>
              </Box>
            );
          })}
        </VStack>

        {/* Special offer */}
        {!isPremium && (
          <Box
            p={4}
            borderRadius="14px"
            bg="rgba(235,181,114,0.06)"
            border="1px solid rgba(235,181,114,0.24)"
            textAlign="center"
          >
            <HStack justify="center" spacing={2} mb={1.5}>
              <Icon as={HiBolt} boxSize={3.5} color={t.primary} />
              <Text fontFamily={MONO} fontSize="11px" fontWeight="700" color={t.primary} letterSpacing="0.08em">
                SPECIAL LAUNCH OFFER
              </Text>
              <Icon as={HiBolt} boxSize={3.5} color={t.primary} />
            </HStack>
            <Text fontFamily={MONO} fontSize="11px" color={t.textSoft}>
              Limited time: 50% off your first year of Premium.
            </Text>
          </Box>
        )}

      </VStack>
    </BaseModal>
  );
};

export default PremiumBenefitsModal;
