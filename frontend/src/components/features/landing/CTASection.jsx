import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  useColorModeValue
} from '@chakra-ui/react';
import { FaRocket, FaBrain } from 'react-icons/fa';

const CTASection = ({ onOpenRegister }) => {
  const navigate = useNavigate();

  return (
    <Box
      bgGradient="linear(135deg, #1e40af 0%, #7c3aed 50%, #4338ca 100%)"
      color="white"
      py={{ base: 16, md: 24, lg: 32 }}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'url("data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M0 0h40v40H0V0zm40 40h40v40H40V40z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.5
      }}
    >
      {/* Decorative Elements */}
      <Box
        position="absolute"
        top="-50%"
        right="-20%"
        w="400px"
        h="400px"
        bgGradient={useColorModeValue('radial(circle, blackAlpha.100, transparent)', 'radial(circle, whiteAlpha.100, transparent)')}
        borderRadius="full"
        opacity={0.3}
      />
      <Box
        position="absolute"
        bottom="-30%"
        left="-15%"
        w="300px"
        h="300px"
        bgGradient={useColorModeValue('radial(circle, blackAlpha.100, transparent)', 'radial(circle, whiteAlpha.100, transparent)')}
        borderRadius="full"
        opacity={0.2}
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={12} textAlign="center">
          <VStack spacing={8} maxW="900px">
            <Badge
              bgGradient={useColorModeValue('linear(135deg, orange.500, red.500)', 'linear(135deg, yellow.400, orange.400)')}
              color="white"
              variant="solid"
              px={6}
              py={3}
              borderRadius="full"
              fontSize="lg"
              fontWeight="bold"
              letterSpacing="wide"
              boxShadow="lg"
              _before={{
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                bg: useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)'),
                borderRadius: 'full',
                zIndex: -1
              }}
              position="relative"
            >
              🚀 Ready to Start?
            </Badge>

            <Heading
              as="h2"
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' }}
              lineHeight={{ base: "1.2", md: "1.1" }}
              fontWeight="extrabold"
              letterSpacing="tight"
              color="white"
              textShadow="0 4px 20px rgba(0,0,0,0.2)"
            >
              Ready to Create Amazing Videos & Learn Globally?
            </Heading>

            <Text
              fontSize={{ base: 'md', sm: 'lg', md: 'xl', lg: '2xl' }}
              color="whiteAlpha.900"
              lineHeight={{ base: "1.6", md: "1.7" }}
              maxW="850px"
              fontWeight="medium"
              textShadow="0 2px 10px rgba(0,0,0,0.1)"
            >
              Join thousands of creators, learners, and travelers who are already
              transforming their travel memories into stunning videos and expanding their understanding of the world through data-driven exploration
            </Text>
          </VStack>

          <VStack spacing={{ base: 6, md: 8 }}>
            <HStack spacing={{ base: 3, md: 6 }} flexWrap="wrap" justify="center">
              <Button
                size={{ base: "md", md: "lg" }}
                bgGradient="linear(135deg, #10b981, #14b8a6)"
                color="white"
                variant="solid"
                _hover={{
                  bgGradient: "linear(135deg, #059669, #0d9488)",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)'
                }}
                _active={{ 
                  transform: 'translateY(0)',
                  boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)'
                }}
                leftIcon={<FaRocket />}
                onClick={onOpenRegister}
                px={{ base: 6, md: 10 }}
                py={{ base: 6, md: 8 }}
                fontSize={{ base: "md", md: "lg", lg: "xl" }}
                fontWeight="bold"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="xl"
                boxShadow="0 10px 30px rgba(16, 185, 129, 0.3)"
                flex={{ base: "1 1 100%", sm: "0 0 auto" }}
                minW={{ base: "full", sm: "200px" }}
              >
                Create Free Account
              </Button>

              <Button
                size={{ base: "md", md: "lg" }}
                variant="outline"
                borderColor="white"
                borderWidth="2px"
                color="white"
                bg="whiteAlpha.100"
                backdropFilter="blur(10px)"
                _hover={{
                  bg: 'whiteAlpha.200',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(255, 255, 255, 0.2)',
                  borderColor: 'whiteAlpha.900'
                }}
                _active={{ 
                  transform: 'translateY(0)',
                  bg: 'whiteAlpha.300'
                }}
                leftIcon={<FaBrain />}
                onClick={() => navigate('/map')}
                px={{ base: 6, md: 10 }}
                py={{ base: 6, md: 8 }}
                fontSize={{ base: "md", md: "lg", lg: "xl" }}
                fontWeight="bold"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="xl"
                flex={{ base: "1 1 100%", sm: "0 0 auto" }}
                minW={{ base: "full", sm: "200px" }}
              >
                Explore Now
              </Button>
            </HStack>

            <VStack spacing={4} pt={4}>
              <HStack spacing={8} flexWrap="wrap" justify="center" opacity={0.9}>
                <HStack spacing={2}>
                  <Box
                    w="8px"
                    h="8px"
                    bg="green.500"
                    borderRadius="full"
                    boxShadow={useColorModeValue(
                      '0 0 10px rgba(72, 187, 120, 0.3)',
                      '0 0 10px rgba(72, 187, 120, 0.5)'
                    )}
                  />
                  <Text fontSize="lg" fontWeight="medium" color={useColorModeValue('gray.800', 'white')}>
                    No credit card required
                  </Text>
                </HStack>

                <HStack spacing={2}>
                  <Box
                    w="8px"
                    h="8px"
                    bg="blue.500"
                    borderRadius="full"
                    boxShadow={useColorModeValue(
                      '0 0 10px rgba(66, 153, 225, 0.3)',
                      '0 0 10px rgba(66, 153, 225, 0.5)'
                    )}
                  />
                  <Text fontSize="lg" fontWeight="medium" color={useColorModeValue('gray.800', 'white')}>
                    Access to World Bank data
                  </Text>
                </HStack>

                <HStack spacing={2}>
                  <Box
                    w="8px"
                    h="8px"
                    bg="purple.500"
                    borderRadius="full"
                    boxShadow={useColorModeValue(
                      '0 0 10px rgba(128, 90, 213, 0.3)',
                      '0 0 10px rgba(128, 90, 213, 0.5)'
                    )}
                  />
                  <Text fontSize="lg" fontWeight="medium" color={useColorModeValue('gray.800', 'white')}>
                    24/7 Learning Support
                  </Text>
                </HStack>
              </HStack>

              <Text
                fontSize="lg"
                color={useColorModeValue('gray.700', 'white')}
                textAlign="center"
                fontStyle="italic"
                maxW="600px"
                opacity={useColorModeValue(0.9, 0.8)}
              >
                Start your educational journey today and discover the world through data-driven insights
              </Text>
            </VStack>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default CTASection;
