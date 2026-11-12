// src/components/ui/CustomToast.jsx — Atlas toasts (same look as the themed default toasts).
import { Box, Flex, Icon, Text } from '@chakra-ui/react';
import { HiCheckCircle, HiExclamationTriangle, HiXCircle } from 'react-icons/hi2';
import { color, radius, resolveTone, shadow } from '../../design/tokens';

const AtlasToast = ({ tone, icon, title, message }) => {
  const tn = resolveTone(tone);
  return (
    <Box
      bg={color.surfaceRaised}
      color={color.text}
      px={4}
      py={3.5}
      borderRadius={radius.md}
      border="1px solid"
      borderColor={tn.border}
      borderLeft="3px solid"
      borderLeftColor={tn.fg}
      boxShadow={shadow.lg}
      maxW="420px"
    >
      <Flex align="start" gap={3}>
        <Icon as={icon} boxSize={5} color={tn.fg} mt="1px" flexShrink={0} />
        <Box>
          <Text fontWeight="700" fontSize="sm">
            {title}
          </Text>
          <Text fontSize="sm" color={color.textSoft} mt={0.5}>
            {message}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

const show = (toast, props) =>
  toast({
    position: 'top',
    duration: 3000,
    isClosable: true,
    render: () => <AtlasToast {...props} />,
  });

export const showSuccessToast = (toast, message = 'Action completed successfully') =>
  show(toast, { tone: 'success', icon: HiCheckCircle, title: 'Success', message });

export const showErrorToast = (toast, message = 'Something went wrong') =>
  show(toast, { tone: 'danger', icon: HiXCircle, title: 'Error', message });

export const showWarningToast = (toast, message = 'Warning') =>
  show(toast, { tone: 'warning', icon: HiExclamationTriangle, title: 'Warning', message });
