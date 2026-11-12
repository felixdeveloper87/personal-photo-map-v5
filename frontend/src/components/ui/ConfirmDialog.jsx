// ConfirmDialog.jsx — Atlas confirmation dialog (destructive by default).
import { useRef } from 'react';
import { Text } from '@chakra-ui/react';
import { HiExclamationTriangle } from 'react-icons/hi2';
import BaseModal from '../modals/BaseModal';
import ModalButton from '../modals/ModalButton';
import { ModalActions } from '../modals/ModalKit';
import { color } from '../../design/tokens';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  icon = HiExclamationTriangle,
  isLoading = false,
}) => {
  // Focus the safe option first so Enter never confirms a destructive action by accident.
  const cancelRef = useRef(null);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      tone={tone}
      eyebrow={tone === 'danger' ? 'Confirm action' : undefined}
      size="md"
      initialFocusRef={cancelRef}
      footer={
        <ModalActions>
          <ModalButton ref={cancelRef} variant="secondary" onClick={onClose}>
            {cancelLabel}
          </ModalButton>
          <ModalButton variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </ModalButton>
        </ModalActions>
      }
    >
      <Text fontSize="sm" color={color.textSoft} lineHeight="1.65">
        {message}
      </Text>
    </BaseModal>
  );
};

export default ConfirmDialog;
