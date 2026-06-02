import React from 'react';
import { Flex, Heading, Image, Box, Text, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { logoStyles } from '../../../styles/headerStyles';

const HeaderLogo = ({ styles }) => {
  const navigate = useNavigate();

  // Single brand accent — "Refined Blue", no rainbow
  const mapColor = useColorModeValue("#2563EB", "#60A5FA");
  const mapHoverColor = useColorModeValue("#1D4ED8", "#93C5FD");

  return (
    <Flex
      {...logoStyles()}
      onClick={() => navigate("/")}
      align="center"
      role="group"
    >
      <Box position="relative" mr={{ base: 1.5, sm: 2.5, md: 3 }} flexShrink={0}>
        <Image
          src={logo}
          alt="Photomap Logo"
          h={{ base: "30px", sm: "40px", md: "46px" }}
          w={{ base: "30px", sm: "40px", md: "46px" }}
          transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
          _groupHover={{
            transform: "scale(1.08) rotate(8deg)",
            filter: "drop-shadow(0 0 8px rgba(56,189,248,0.6))"
          }}
        />
      </Box>
      <Box>
        <Heading
          as="h1"
          fontSize={{ base: "md", sm: "xl", md: "2xl" }}
          fontWeight="900"
          letterSpacing="-0.5px"
          lineHeight="1"
          display="flex"
          alignItems="center"
        >
          <Text as="span" color={styles.logoTextColor}>
            Photo
          </Text>
          <Text
            as="span"
            color={mapColor}
            transition="color 0.3s ease"
            _groupHover={{ color: mapHoverColor }}
          >
            map
          </Text>
        </Heading>
        <Text
          color={styles.logoSubtextColor}
          fontSize="9px"
          fontWeight="800"
          letterSpacing="1.8px"
          lineHeight="1"
          textTransform="uppercase"
          mt={1.5}
          display={{ base: "none", sm: "block" }}
          transition="all 0.3s ease"
          _groupHover={{ color: useColorModeValue("gray.700", "gray.300"), letterSpacing: "2px" }}
        >
          Journey through photos
        </Text>
      </Box>
    </Flex>
  );
};

export default React.memo(HeaderLogo);
