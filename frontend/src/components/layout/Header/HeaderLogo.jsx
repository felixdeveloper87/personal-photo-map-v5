import React from 'react';
import { Flex, Heading, Image, Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { logoStyles } from '../../../styles/headerStyles';

const HeaderLogo = ({ styles }) => {
  const navigate = useNavigate();

  return (
    <Flex
      {...logoStyles()}
      onClick={() => navigate("/")}
      _hover={{ transform: "translateY(-1px)", opacity: 0.85 }}
    >
      <Image
        src={logo}
        alt="Photomap Logo"
        h={{ base: "40px", sm: "44px", md: "48px" }}
        w={{ base: "40px", sm: "44px", md: "48px" }}
        mr={{ base: 2, sm: 2.5, md: 3 }}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
      />
      <Box>
        <Heading
          as="h1"
          size="lg"
          color={styles.logoTextColor}
          fontWeight="800"
          letterSpacing="tight"
          lineHeight="1.2"
        >
          Photomap
        </Heading>
        <Text
          color={styles.logoSubtextColor}
          fontSize="xs"
          fontWeight="500"
          letterSpacing="wide"
          lineHeight="1.1"
        >
          Journey through photos.
        </Text>
      </Box>
    </Flex>
  );
};

export default React.memo(HeaderLogo);
