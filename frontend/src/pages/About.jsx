import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Icon,
  useColorModeValue,
  Button,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';
import {
  FaCompass,
  FaHeart,
  FaGlobe,
  FaCamera,
  FaUserCircle,
  FaEnvelope,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MotionBox = motion.create(Box);

const About = () => {
  const { isLoggedIn, fullname, email, isPremium } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Theme colors
  const bgGradient = useColorModeValue(
    "linear(135deg, blue.50 0%, purple.50 25%, pink.50 50%, orange.50 75%, yellow.50 100%)",
    "linear(135deg, gray.900 0%, blue.900 25%, purple.900 50%, pink.900 75%, red.900 100%)"
  );
  
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  if (!isLoggedIn) {
    return (
      <Box
        minH="100vh"
        bgGradient={bgGradient}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4
        }}
      >
        <Container maxW="md" position="relative" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            textAlign="center"
            bg={cardBg}
            p={10}
            borderRadius="2xl"
            boxShadow="0 25px 50px rgba(0, 0, 0, 0.15)"
          >
            <Icon as={FaCompass} w={16} h={16} color={accentColor} mb={6} />
            <Heading size="xl" mb={4} color={headingColor}>
              Welcome to PhotoMap
            </Heading>
            <Text fontSize="lg" color={textColor} mb={8}>
              Your personal travel companion for capturing and mapping memories around the world.
            </Text>
            <Button
              colorScheme="blue"
              size="lg"
              leftIcon={<FaUserCircle />}
              onClick={() => navigate('/')}
            >
              Get Started
            </Button>
          </MotionBox>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      py={10}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        opacity: 0.4
      }}
    >
      <Container maxW="4xl" position="relative" zIndex={1}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* User Profile Section */}
          <VStack spacing={8} align="stretch">
            <Card bg={cardBg} boxShadow="xl" borderRadius="2xl">
              <CardBody p={8}>
                <VStack spacing={6} textAlign="center">
                  <Avatar
                    size="2xl"
                    name={fullname}
                    bg={isPremium ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : accentColor}
                    color="white"
                    ring="4px"
                    ringColor={isPremium ? "yellow.400" : accentColor}
                    filter="drop-shadow(0 10px 20px rgba(0,0,0,0.2))"
                  />
                  
                  <VStack spacing={2}>
                    <Heading color={headingColor} size="xl">
                      {fullname}
                    </Heading>
                    <HStack spacing={2}>
                      <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                        Travel Explorer
                      </Badge>
                      {isPremium && (
                        <Badge colorScheme="yellow" px={3} py={1} borderRadius="full">
                          Premium Member
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                  
                  <HStack spacing={2} color={textColor}>
                    <Icon as={FaEnvelope} />
                    <Text>{email}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* About PhotoMap Section */}
            <Card bg={cardBg} boxShadow="xl" borderRadius="2xl">
              <CardBody p={8}>
                <VStack spacing={6} align="stretch">
                  <Heading color={headingColor} size="lg" textAlign="center">
                    <Icon as={FaHeart} mr={3} color="red.400" />
                    About PhotoMap
                  </Heading>
                  
                  <Text color={textColor} fontSize="lg" textAlign="center" lineHeight="1.8">
                    PhotoMap is your personal travel companion that helps you document and visualize 
                    your journey around the world. Upload photos from your adventures and watch as 
                    your travel map comes to life, creating a beautiful visual story of your experiences.
                  </Text>
                  
                  <Divider />
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <VStack spacing={3} textAlign="center">
                      <Icon as={FaCamera} w={8} h={8} color="blue.400" />
                      <Heading size="md" color={headingColor}>
                        Capture Memories
                      </Heading>
                      <Text color={textColor} fontSize="sm">
                        Upload photos from your travels and organize them by country and year
                      </Text>
                    </VStack>
                    
                    <VStack spacing={3} textAlign="center">
                      <Icon as={FaGlobe} w={8} h={8} color="green.400" />
                      <Heading size="md" color={headingColor}>
                        Explore the World
                      </Heading>
                      <Text color={textColor} fontSize="sm">
                        Visualize your travels on an interactive world map and track your progress
                      </Text>
                    </VStack>
                    
                    <VStack spacing={3} textAlign="center">
                      <Icon as={FaCompass} w={8} h={8} color="purple.400" />
                      <Heading size="md" color={headingColor}>
                        Plan Adventures
                      </Heading>
                      <Text color={textColor} fontSize="sm">
                        Discover new destinations and plan your next adventure
                      </Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Call to Action */}
            <Card bg={cardBg} boxShadow="xl" borderRadius="2xl">
              <CardBody p={8}>
                <VStack spacing={4} textAlign="center">
                  <Heading color={headingColor} size="lg">
                    Ready for Your Next Adventure?
                  </Heading>
                  <Text color={textColor} fontSize="lg">
                    Start exploring the world and documenting your journey today!
                  </Text>
                  <HStack spacing={4}>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      leftIcon={<FaGlobe />}
                      onClick={() => navigate('/countries')}
                    >
                      View Countries
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="blue"
                      size="lg"
                      leftIcon={<FaCamera />}
                      onClick={() => navigate('/timeline')}
                    >
                      View Timeline
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default About;