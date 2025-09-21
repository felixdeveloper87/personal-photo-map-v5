import React from 'react';
import { HStack } from '@chakra-ui/react';
import {
  ModernLoginButton,
  ModernRegisterButton,
} from '../../ui/buttons/HeaderButtons';

const HeaderAuth = ({ onLoginClick, onRegisterClick, display, size = "sm", ...props }) => {

  return (
    <HStack display={display} {...props} spacing={0}>
      <ModernLoginButton onClick={onLoginClick} size={size} mr={8} />
      <ModernRegisterButton onClick={onRegisterClick} size={size}  />
    </HStack>
  );
};

export default HeaderAuth;
