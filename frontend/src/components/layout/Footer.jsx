import React from 'react';
import {
  Box,
  Flex,
  Text,
  Link,
  HStack,
  Container,
  VStack,
  Icon,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaHeart, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const textColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.600', 'blue.300');
  const linkColor = useColorModeValue('gray.600', 'gray.300');
  const linkHoverColor = useColorModeValue('blue.600', 'blue.300');
  const copyrightColor = useColorModeValue('gray.500', 'gray.400');

  const borderTop = useBreakpointValue({ base: '4px solid', md: '5px solid' });
  const borderTopColor = useColorModeValue('black', 'white');

  return (
    <Box
      as="footer"
      color={textColor}
      py={2}
      px={10}
      w="100%"
      borderTop={borderTop}
      borderTopColor={borderTop ? borderTopColor : undefined}
    >
      <Container maxW="2200px" px={1} position="relative" zIndex={2}>
        <VStack spacing={6}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'center', md: 'flex-start' }}
            w="full"
            spacing={6}
          >
            {/* Brand */}
            <VStack
              align={{ base: 'center', md: 'flex-start' }}
              spacing={3}
              mb={{ base: 4, md: 0 }}
            >
              <Text
                fontSize="2xl"
                fontWeight="800"
                bgGradient={useColorModeValue(
                  'linear-gradient(to-r, #60a5fa, #3b82f6)',
                  'linear-gradient(to-r, #93c5fd, #60a5fa)'
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
                Capture your memories around the world and explore them through
                an interactive map experience.
              </Text>
            </VStack>

            {/* Navigation */}
            <VStack
              align={{ base: 'center', md: 'flex-start' }}
              spacing={3}
              mb={{ base: 4, md: 0 }}
            >
              <Text fontSize="lg" fontWeight="700" color={accentColor}>
                Navigation
              </Text>
              <VStack spacing={2} align={{ base: 'center', md: 'flex-start' }}>
                {['About', 'Contact', 'Timeline'].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    fontSize="md"
                    fontWeight="500"
                    color={linkColor}
                    _hover={{
                      color: linkHoverColor,
                      textDecoration: 'none',
                      transform: 'translateX(5px)',
                    }}
                    transition="all 0.3s ease"
                  >
                    {item}
                  </Link>
                ))}
              </VStack>
            </VStack>

            {/* Social */}
            <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
              <Text fontSize="lg" fontWeight="700" color={accentColor}>
                Connect
              </Text>
              <HStack spacing={4}>
                {[
                  { icon: FaGithub, href: 'https://github.com' },
                  { icon: FaLinkedin, href: 'https://linkedin.com' },
                  { icon: FaTwitter, href: 'https://twitter.com' },
                ].map((s, i) => (
                  <Link
                    key={i}
                    href={s.href}
                    isExternal
                    color={linkColor}
                    _hover={{
                      color: linkHoverColor,
                      transform: 'scale(1.2)',
                      textDecoration: 'none',
                    }}
                    transition="all 0.3s ease"
                  >
                    <Icon as={s.icon} boxSize={6} />
                  </Link>
                ))}
              </HStack>
            </VStack>
          </Flex>

          {/* Copyright */}
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
