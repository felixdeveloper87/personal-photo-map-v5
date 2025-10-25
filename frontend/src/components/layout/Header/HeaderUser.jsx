import React from 'react';
import { Box } from '@chakra-ui/react';
import { UserProfileButton } from '../../ui/buttons/HeaderButtons';

const HeaderUser = ({ 
  styles, 
  fullname, 
  isPremium, 
  onProfileClick,
  size = "sm"
}) => {
  return (
    <Box my={2}>
      <UserProfileButton
        onClick={onProfileClick}
        size={size}
      />
    </Box>
  );
};

export default React.memo(HeaderUser);
