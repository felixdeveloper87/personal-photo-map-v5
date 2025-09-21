import React from 'react';
import { Box } from '@chakra-ui/react';
import { ModernHeaderUserButton } from '../../ui/buttons/HeaderButtons';

const HeaderUser = ({ 
  styles, 
  fullname, 
  isPremium, 
  onProfileClick,
  size = "sm"
}) => {
  return (
    <Box my={2}>
      <ModernHeaderUserButton
        onClick={onProfileClick}
        fullname={fullname}
        isPremium={isPremium}
        styles={styles}
        size={size}
      />
    </Box>
  );
};

export default React.memo(HeaderUser);
