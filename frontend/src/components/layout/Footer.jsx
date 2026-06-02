import React from 'react';
import { Box, Flex, Text, Link, HStack, Container, VStack, Icon } from '@chakra-ui/react';
import { FaHeart, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { useLandingTokens } from '../features/landing/landingUI';

const NAV = ['About', 'Contact', 'Timeline'];
const SOCIAL = [
  { icon: FaGithub, href: 'https://github.com', label: 'GitHub' },
  { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter' },
];

const ColumnTitle = ({ children, color }) => (
  <Text fontSize="xs" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase" color={color}>
    {children}
  </Text>
);

const Footer = () => {
  const t = useLandingTokens();

  return (
    <Box as="footer" bg={t.surfaceSubtle} borderTop="1px solid" borderColor={t.hairline}>
      <Container maxW="container.xl" py={{ base: 12, md: 14 }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          gap={{ base: 10, md: 8 }}
        >
          {/* Brand */}
          <VStack
            align={{ base: 'center', md: 'flex-start' }}
            spacing={3}
            maxW="340px"
            textAlign={{ base: 'center', md: 'left' }}
          >
            <Text fontFamily="heading" fontSize="2xl" fontWeight="900" letterSpacing="-0.02em" lineHeight="1">
              <Box as="span" color={t.text}>Photo</Box>
              <Box as="span" color={t.primary}>map</Box>
            </Text>
            <Text fontSize="sm" color={t.textSoft} lineHeight="1.7">
              Travel photos that teach you the world — mapped by country and enriched with
              real economic and social data.
            </Text>
          </VStack>

          {/* Navigation */}
          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
            <ColumnTitle color={t.textMuted}>Navigation</ColumnTitle>
            <VStack spacing={2.5} align={{ base: 'center', md: 'flex-start' }}>
              {NAV.map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  fontSize="sm"
                  fontWeight="500"
                  color={t.textSoft}
                  _hover={{ color: t.primary, textDecoration: 'none' }}
                  transition="color .2s ease"
                >
                  {item}
                </Link>
              ))}
            </VStack>
          </VStack>

          {/* Connect */}
          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={4}>
            <ColumnTitle color={t.textMuted}>Connect</ColumnTitle>
            <HStack spacing={2.5}>
              {SOCIAL.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  isExternal
                  aria-label={s.label}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="38px"
                  h="38px"
                  borderRadius="10px"
                  bg={t.surface}
                  border="1px solid"
                  borderColor={t.hairline}
                  color={t.textSoft}
                  _hover={{ color: t.primary, borderColor: t.primary, transform: 'translateY(-2px)', textDecoration: 'none' }}
                  transition="all .2s ease"
                >
                  <Icon as={s.icon} boxSize={4} />
                </Link>
              ))}
            </HStack>
          </VStack>
        </Flex>

        {/* Divider */}
        <Box h="1px" bg={t.hairline} my={8} />

        {/* Bottom row */}
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align="center"
          gap={3}
        >
          <Text fontSize="sm" color={t.textMuted}>
            © {new Date().getFullYear()} Photomap. All rights reserved.
          </Text>
          <HStack spacing={1.5} color={t.textMuted}>
            <Text fontSize="sm">Made with</Text>
            <Icon as={FaHeart} color="#EF4444" boxSize={3.5} />
            <Text fontSize="sm">by Leandro Felix</Text>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
