import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import {
  HiBolt,
  HiChatBubbleLeftRight,
  HiCheckCircle,
  HiCloudArrowUp,
  HiRectangleStack,
  HiRocketLaunch,
  HiSparkles,
} from 'react-icons/hi2';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { IconTile, ModalActions, ModalNotice, Panel, ToneBadge } from './ModalKit';
import { color, resolveTone } from '../../design/tokens';

const BENEFITS = [
  { icon: HiCloudArrowUp, tone: 'brand', title: '100 GB Photo Storage', desc: 'Unlimited cloud storage for your travel memories' },
  { icon: HiRectangleStack, tone: 'teal', title: 'Create Albums', desc: 'Organise photos into curated collections' },
  { icon: HiChatBubbleLeftRight, tone: 'rose', title: 'Priority Support', desc: '24/7 dedicated support for every journey' },
  { icon: HiRocketLaunch, tone: 'brand', title: 'Advanced Features', desc: 'Premium map tools, analytics, and more' },
];

const PremiumBenefitsModal = ({ isOpen, onClose, onUpgrade, onDeactivate, isLoading = false, isPremium = false }) => {
  const footer = isPremium ? (
    <ModalActions>
      <ModalButton variant="danger" onClick={onDeactivate} isLoading={isLoading}>
        Deactivate Premium
      </ModalButton>
      <ModalButton variant="primary" onClick={onClose} leftIcon={<HiSparkles />}>
        You&apos;re already Premium
      </ModalButton>
    </ModalActions>
  ) : (
    <ModalActions>
      <ModalButton variant="secondary" onClick={onClose}>
        Maybe later
      </ModalButton>
      <ModalButton variant="primary" onClick={onUpgrade} isLoading={isLoading} rightIcon={<HiSparkles />}>
        Upgrade to Premium
      </ModalButton>
    </ModalActions>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={isPremium ? 'Active plan' : 'Premium'}
      title={isPremium ? 'Premium unlocked' : 'Unlock Premium'}
      subtitle={
        isPremium
          ? 'You have access to all premium features. Enjoy the journey.'
          : 'Take your photo mapping experience to the next level.'
      }
      icon={HiSparkles}
      footer={footer}
      size={{ base: 'full', sm: 'md', md: 'lg' }}
    >
      <VStack spacing={4} align="stretch">
        {isPremium && (
          <HStack>
            <ToneBadge tone="brand" icon={HiSparkles}>
              Premium · 100 GB
            </ToneBadge>
          </HStack>
        )}

        <VStack spacing={2.5} align="stretch">
          {BENEFITS.map((b) => (
            <Panel key={b.title} interactive py={3.5}>
              <HStack spacing={3.5} align="center">
                <IconTile icon={b.icon} tone={b.tone} />
                <Box flex={1} minW={0}>
                  <Text fontSize="sm" fontWeight="700" color={color.text}>
                    {b.title}
                  </Text>
                  <Text fontSize="xs" color={color.textSoft} mt={0.5}>
                    {b.desc}
                  </Text>
                </Box>
                <Icon as={HiCheckCircle} boxSize={5} color={resolveTone(b.tone).fg} flexShrink={0} />
              </HStack>
            </Panel>
          ))}
        </VStack>

        {!isPremium && (
          <ModalNotice tone="brand" icon={HiBolt} title="Special launch offer">
            Limited time: 50% off your first year of Premium.
          </ModalNotice>
        )}
      </VStack>
    </BaseModal>
  );
};

export default PremiumBenefitsModal;
