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
      bgGradient={useColorModeValue(
        'linear(135deg, blue.600 0%, purple.700 50%, indigo.800 100%)',
        'linear(135deg, blue.700 0%, purple.800 50%, indigo.900 100%)'
      )}
      color="white"
      py={32}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: useColorModeValue(
          'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        ),
        opacity: useColorModeValue(0.3, 0.4)
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
              size="2xl"
              lineHeight="1.1"
              fontWeight="extrabold"
              letterSpacing="tight"
              color={useColorModeValue('gray.900', 'white')}
              filter={useColorModeValue('none', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')}
            >
              Ready to Start Your Global Learning Journey?
            </Heading>

            <Text
              fontSize="2xl"
              color={useColorModeValue('gray.800', 'white')}
              lineHeight="1.5"
              maxW="800px"
              fontWeight="medium"
              textShadow={useColorModeValue('none', '0 2px 4px rgba(0,0,0,0.3)')}
            >
              Join thousands of learners, researchers, and travelers who have already
              transformed their understanding of the world through data-driven exploration
            </Text>
          </VStack>

          <VStack spacing={8}>
            <HStack spacing={8} flexWrap="wrap" justify="center">
              <Button
                size="xl"
                bgGradient={useColorModeValue('linear(135deg, green.600, teal.600)', 'linear(135deg, green.500, teal.500)')}
                color="white"
                variant="solid"
                _hover={{
                  bgGradient: useColorModeValue('linear(135deg, green.700, teal.700)', 'linear(135deg, green.600, teal.600)'),
                  transform: 'translateY(-3px)',
                  boxShadow: '2xl'
                }}
                _active={{ transform: 'translateY(-1px)' }}
                leftIcon={<FaRocket />}
                onClick={onOpenRegister}
                px={10}
                py={8}
                fontSize="xl"
                fontWeight="bold"
                transition="all 0.3s ease"
                borderRadius="xl"
                boxShadow="xl"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  right: '-2px',
                  bottom: '-2px',
                  bg: useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)'),
                  borderRadius: 'xl',
                  zIndex: -1
                }}
                position="relative"
              >
                Create Free Account
              </Button>

              <Button
                size="xl"
                variant="outline"
                borderColor={useColorModeValue('gray.600', 'whiteAlpha.400')}
                borderWidth="3px"
                color={useColorModeValue('gray.800', 'white')}
                _hover={{
                  bg: useColorModeValue('gray.100', 'whiteAlpha.200'),
                  borderColor: useColorModeValue('gray.800', 'white'),
                  transform: 'translateY(-3px)',
                  boxShadow: '2xl'
                }}
                _active={{ transform: 'translateY(-1px)' }}
                leftIcon={<FaBrain />}
                onClick={() => navigate('/map')}
                px={10}
                py={8}
                fontSize="xl"
                fontWeight="bold"
                transition="all 0.3s ease"
                borderRadius="xl"
                boxShadow="xl"
              >
                Start Learning
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
