// ConfirmDialog.jsx
import React, { useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text
} from '@chakra-ui/react';

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  const cancelRef = useRef();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered initialFocusRef={cancelRef}>
      <ModalOverlay />
      <ModalContent bg="gray.900" color="white">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{message}</Text>
        </ModalBody>
        <ModalFooter>
          <Button ref={cancelRef} onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
