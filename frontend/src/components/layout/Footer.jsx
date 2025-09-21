import React from 'react';
import { Box, Flex, Text, Link, HStack, Container, VStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaHeart, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

/**
 * The Footer component provides a modern and professional footer
 * with social links, navigation, and copyright information.
 *
 * @returns {JSX.Element} A responsive and modern footer section.
 */
const Footer = () => {
  // Cores adaptáveis ao tema
  const bgColor = useColorModeValue(
    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
  );
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.600", "blue.300");
  const linkColor = useColorModeValue("gray.600", "gray.300");
  const linkHoverColor = useColorModeValue("blue.600", "blue.300");
  const dividerColor = useColorModeValue("gray.300", "gray.600");
  const copyrightColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      as="footer"
      bg={bgColor}
      color={textColor}
      py={8}
      w="100%"
      mt={8}
      boxShadow={useColorModeValue("0 -4px 20px rgba(0, 0, 0, 0.05)", "0 -4px 20px rgba(0, 0, 0, 0.1)")}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        bgGradient: useColorModeValue(
          "linear-gradient(to-r, transparent, #60a5fa, transparent)",
          "linear-gradient(to-r, transparent, #3b82f6, transparent)"
        ),
        opacity: 0.6
      }}
    >
      <Container maxW="1400px" px={4}>
        <VStack spacing={6}>
          {/* Main Footer Content */}
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align={{ base: 'center', md: 'flex-start' }}
            w="full"
            spacing={6}
          >
            {/* Brand Section */}
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={3} mb={{ base: 4, md: 0 }}>
              <Text 
                fontSize="2xl" 
                fontWeight="800" 
                bgGradient={useColorModeValue(
                  "linear-gradient(to-r, #60a5fa, #3b82f6)",
                  "linear-gradient(to-r, #93c5fd, #60a5fa)"
                )}
                bgClip="text"
                letterSpacing="tight"
              >
                Photomap
              </Text>
              <Text 
                color={linkColor} 
                fontSize="sm" 
                textAlign={{ base: 'center', md: 'left' }}
                maxW="300px"
              >
                Capture your memories around the world and explore them through an interactive map experience.
              </Text>
            </VStack>

            {/* Navigation Links */}
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={3} mb={{ base: 4, md: 0 }}>
              <Text fontSize="lg" fontWeight="700" color={accentColor}>
                Navigation
              </Text>
              <VStack spacing={2} align={{ base: 'center', md: 'flex-start' }}>
                <Link
                  href="/about"
                  fontSize="md"
                  fontWeight="500"
                  color={linkColor}
                  _hover={{ 
                    color: linkHoverColor, 
                    textDecoration: "none",
                    transform: "translateX(5px)"
                  }}
                  transition="all 0.3s ease"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  fontSize="md"
                  fontWeight="500"
                  color={linkColor}
                  _hover={{ 
                    color: linkHoverColor, 
                    textDecoration: "none",
                    transform: "translateX(5px)"
                  }}
                  transition="all 0.3s ease"
                >
                  Contact
                </Link>
                <Link
                  href="/timeline"
                  fontSize="md"
                  fontWeight="500"
                  color={linkColor}
                  _hover={{ 
                    color: linkHoverColor, 
                    textDecoration: "none",
                    transform: "translateX(5px)"
                  }}
                  transition="all 0.3s ease"
                >
                  Timeline
                </Link>
              </VStack>
            </VStack>

            {/* Social Links */}
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Text fontSize="lg" fontWeight="700" color={accentColor}>
                Connect
              </Text>
              <HStack spacing={4}>
                <Link
                  href="https://github.com"
                  isExternal
                  color={linkColor}
                  _hover={{ 
                    color: linkHoverColor, 
                    transform: "scale(1.2)",
                    textDecoration: "none"
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={FaGithub} boxSize={6} />
                </Link>
                <Link
                  href="https://linkedin.com"
                  isExternal
                  color={linkColor}
                  _hover={{ 
                    color: linkHoverColor, 
                    transform: "scale(1.2)",
                    textDecoration: "none"
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={FaLinkedin} boxSize={6} />
                </Link>
                <Link
                  href="https://twitter.com"
                  isExternal
                  color={linkColor}
                  _hover={{ 
                    color: linkHoverColor, 
                    transform: "scale(1.2)",
                    textDecoration: "none"
                  }}
                  transition="all 0.3s ease"
                >
                  <Icon as={FaTwitter} boxSize={6} />
                </Link>
              </HStack>
            </VStack>
          </Flex>

          {/* Divider */}
          <Box 
            w="full" 
            h="1px" 
            bgGradient={useColorModeValue(
              "linear-gradient(to-r, transparent, #cbd5e1, transparent)",
              "linear-gradient(to-r, transparent, #475569, transparent)"
            )}
            opacity={0.5}
          />

          {/* Copyright Section */}
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            justify="space-between" 
            align="center" 
            w="full"
            spacing={4}
          >
            <Text 
              fontSize="sm" 
              color={copyrightColor}
              textAlign={{ base: 'center', md: 'left' }}
            >
              &copy; {new Date().getFullYear()} Photomap. All Rights Reserved.
            </Text>
            
            <HStack spacing={2} color={copyrightColor}>
              <Text fontSize="sm">Made with</Text>
              <Icon as={FaHeart} color="red.400" boxSize={4} />
              <Text fontSize="sm">by Leandro Felix</Text>
            </HStack>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Footer;
