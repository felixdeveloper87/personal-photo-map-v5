import React from 'react';
import { Flex, Heading, Image, Box, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { logoStyles } from '../../../styles/headerStyles';

const HeaderLogo = ({ styles }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    // Sempre navega para a landing page, independente do status de login
    // Se o usuário estiver logado, o SmartHomeRoute irá redirecioná-lo para /map
    // Se não estiver logado, verá a landing page
    navigate("/");
  };

  return (
    <Flex
      {...logoStyles(styles)}
      onClick={handleLogoClick}
      align="center"
      cursor="pointer"
      userSelect="none"
      _hover={{ transform: "translateY(-1px)" }}
      transition="all 0.3s ease"
    >
      <Image
        src={logo}
        alt="Photomap Logo"
        h={{ base: "32px", sm: "40px", md: "48px" }}
        w={{ base: "32px", sm: "40px", md: "48px" }}
        mr={{ base: 1, sm: 2.5, md: 3 }}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
        transition="all 0.3s ease"
        _hover={{
          transform: "scale(1.05)",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
        }}
      />
      <Box>
        <Heading
          as="h1"
          size={{ base: "md", sm: "lg", md: "lg" }}
          color={styles.logoTextColor}
          fontWeight="800"
          letterSpacing="tight"
          lineHeight="1.2"
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
          transition="all 0.3s ease"
          _hover={{
            color: styles.accentColor,
            textShadow: "0 2px 4px rgba(0,0,0,0.15)"
          }}
        >
          Photomap
        </Heading>
        <Text
          color={styles.logoSubtextColor}
          fontSize={{ base: "2xs", sm: "xs", md: "xs" }}
          fontWeight="500"
          letterSpacing="wide"
          lineHeight="1.1"
          filter="drop-shadow(0 1px 1px rgba(0,0,0,0.1))"
          transition="all 0.3s ease"
          _hover={{
            color: styles.accentColorHover,
            textShadow: "0 1px 2px rgba(0,0,0,0.1)"
          }}
        >
          Journey through photos.
        </Text>
      </Box>
    </Flex>
  );
};

export default React.memo(HeaderLogo);
