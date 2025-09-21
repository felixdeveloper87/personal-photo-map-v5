import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  useToast,
  Icon,
  Card,
  CardBody,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Flex,
  Avatar,
  Divider,
} from '@chakra-ui/react';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaQuestionCircle,
  FaHeadset,
  FaBug,
  FaLightbulb,
  FaRocket,
  FaClock,
  FaGlobe,
  FaHeart,
  FaPaperPlane,
  FaCheckCircle,
} from 'react-icons/fa';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Theme colors
  const bgGradient = useColorModeValue(
    "linear(135deg, blue.50 0%, purple.50 25%, pink.50 50%, orange.50 75%, yellow.50 100%)",
    "linear(135deg, gray.900 0%, blue.900 25%, purple.900 50%, pink.900 75%, red.900 100%)"
  );
  
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");
  const cardBorder = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  const contactMethods = [
    {
      icon: FaEnvelope,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@photomap.com",
      action: "mailto:support@photomap.com",
      color: "blue",
      responseTime: "Within 24 hours"
    },
    {
      icon: FaHeadset,
      title: "Live Chat",
      description: "Chat with our team",
      contact: "Available 9 AM - 6 PM GMT",
      action: "#",
      color: "green",
      responseTime: "Instant response"
    },
    {
      icon: FaPhone,
      title: "Phone Support",
      description: "Speak with an expert",
      contact: "+44 20 1234 5678",
      action: "tel:+442012345678",
      color: "purple",
      responseTime: "Mon-Fri 9-5 GMT"
    }
  ];

  const faqData = [
    {
      question: "How do I upload photos to PhotoMap?",
      answer: "Simply go to the Countries page, select your destination, and use the upload button. You can upload multiple photos at once and organize them by year."
    },
    {
      question: "Is PhotoMap free to use?",
      answer: "PhotoMap offers both free and premium plans. Free users can upload photos and track their travels, while premium users get unlimited storage and advanced features."
    },
    {
      question: "Can I export my travel data?",
      answer: "Yes! Premium users can export their travel data, photos, and statistics in various formats including PDF reports and CSV files."
    },
    {
      question: "How do I reset my password?",
      answer: "Click the 'Forgot Password' link on the login page and follow the instructions. You'll receive an email with reset instructions."
    },
    {
      question: "Is my data secure on PhotoMap?",
      answer: "Absolutely! We use industry-standard encryption and security measures to protect your photos and personal data. Your privacy is our top priority."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

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
      <Container maxW="7xl" position="relative" zIndex={1}>
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <MotionBox variants={itemVariants} textAlign="center" mb={12}>
            <VStack spacing={6}>
              <Icon as={FaGlobe} w={20} h={20} color={accentColor} />
              <Heading
                size="2xl"
                color={headingColor}
                bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
                bgClip="text"
              >
                Get in Touch
              </Heading>
              <Text fontSize="xl" color={textColor} maxW="2xl">
                Have questions about your travels or need support? We're here to help you 
                make the most of your PhotoMap experience.
              </Text>
            </VStack>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} mb={12}>
            {/* Contact Form */}
            <MotionCard
              variants={itemVariants}
              bg={cardBg}
              backdropFilter="blur(20px)"
              borderRadius="2xl"
              border="1px solid"
              borderColor={cardBorder}
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.1)"
            >
              <CardBody p={8}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={2} textAlign="center">
                    <Icon as={FaPaperPlane} w={8} h={8} color={accentColor} />
                    <Heading size="lg" color={headingColor}>
                      Send us a Message
                    </Heading>
                    <Text color={textColor}>
                      Fill out the form below and we'll get back to you soon
                    </Text>
                  </VStack>

                  <form onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                      <FormControl isInvalid={errors.name}>
                        <FormLabel color={headingColor}>Name</FormLabel>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          bg="whiteAlpha.100"
                          border="1px solid"
                          borderColor={cardBorder}
                          _focus={{
                            borderColor: accentColor,
                            boxShadow: `0 0 0 1px ${accentColor}`
                          }}
                        />
                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.email}>
                        <FormLabel color={headingColor}>Email</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          bg="whiteAlpha.100"
                          border="1px solid"
                          borderColor={cardBorder}
                          _focus={{
                            borderColor: accentColor,
                            boxShadow: `0 0 0 1px ${accentColor}`
                          }}
                        />
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.subject}>
                        <FormLabel color={headingColor}>Subject</FormLabel>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="What can we help you with?"
                          bg="whiteAlpha.100"
                          border="1px solid"
                          borderColor={cardBorder}
                          _focus={{
                            borderColor: accentColor,
                            boxShadow: `0 0 0 1px ${accentColor}`
                          }}
                        />
                        <FormErrorMessage>{errors.subject}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.message}>
                        <FormLabel color={headingColor}>Message</FormLabel>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us more about your question or concern..."
                          rows={4}
                          bg="whiteAlpha.100"
                          border="1px solid"
                          borderColor={cardBorder}
                          _focus={{
                            borderColor: accentColor,
                            boxShadow: `0 0 0 1px ${accentColor}`
                          }}
                        />
                        <FormErrorMessage>{errors.message}</FormErrorMessage>
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        width="full"
                        leftIcon={isSubmitting ? undefined : <FaPaperPlane />}
                        isLoading={isSubmitting}
                        loadingText="Sending..."
                        _hover={{ transform: "translateY(-2px)" }}
                        transition="all 0.2s"
                      >
                        Send Message
                      </Button>
                    </VStack>
                  </form>
                </VStack>
              </CardBody>
            </MotionCard>

            {/* Contact Methods */}
            <VStack spacing={6}>
              <MotionBox variants={itemVariants} w="full">
                <Heading size="lg" color={headingColor} mb={6} textAlign="center">
                  <Icon as={FaHeadset} mr={3} color={accentColor} />
                  Contact Methods
                </Heading>
                <VStack spacing={4}>
                  {contactMethods.map((method, index) => (
                    <MotionCard
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      bg={cardBg}
                      backdropFilter="blur(20px)"
                      borderRadius="xl"
                      border="1px solid"
                      borderColor={cardBorder}
                      boxShadow="0 10px 25px rgba(0, 0, 0, 0.1)"
                      w="full"
                      cursor="pointer"
                      _hover={{ transform: "translateY(-2px)" }}
                    >
                      <CardBody p={6}>
                        <HStack spacing={4}>
                          <Box
                            p={3}
                            bg={`${method.color}.100`}
                            color={`${method.color}.600`}
                            borderRadius="xl"
                          >
                            <Icon as={method.icon} w={6} h={6} />
                          </Box>
                          <VStack align="start" spacing={1} flex={1}>
                            <Heading size="sm" color={headingColor}>
                              {method.title}
                            </Heading>
                            <Text color={textColor} fontSize="sm">
                              {method.description}
                            </Text>
                            <Link
                              href={method.action}
                              color={accentColor}
                              fontWeight="bold"
                              fontSize="sm"
                            >
                              {method.contact}
                            </Link>
                            <Badge
                              colorScheme={method.color}
                              size="sm"
                              borderRadius="full"
                            >
                              <Icon as={FaClock} mr={1} w={3} h={3} />
                              {method.responseTime}
                            </Badge>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </VStack>
              </MotionBox>

              {/* Company Info */}
              <MotionCard
                variants={itemVariants}
                bg={cardBg}
                backdropFilter="blur(20px)"
                borderRadius="xl"
                border="1px solid"
                borderColor={cardBorder}
                boxShadow="0 10px 25px rgba(0, 0, 0, 0.1)"
                w="full"
              >
                <CardBody p={6}>
                  <VStack spacing={4} textAlign="center">
                    <Icon as={FaMapMarkerAlt} w={8} h={8} color={accentColor} />
                    <Heading size="md" color={headingColor}>
                      PhotoMap Headquarters
                    </Heading>
                    <VStack spacing={2} color={textColor}>
                      <Text fontWeight="bold">PhotoMap Ltd.</Text>
                      <Text>123 Tech Street</Text>
                      <Text>London, UK, W1A 1AA</Text>
                      <Badge colorScheme="green" mt={2}>
                        <Icon as={FaClock} mr={1} w={3} h={3} />
                        Mon-Fri 9AM-5PM GMT
                      </Badge>
                    </VStack>
                  </VStack>
                </CardBody>
              </MotionCard>
            </VStack>
          </SimpleGrid>

          {/* FAQ Section */}
          <MotionBox variants={itemVariants} mb={12}>
            <Card
              bg={cardBg}
              backdropFilter="blur(20px)"
              borderRadius="2xl"
              border="1px solid"
              borderColor={cardBorder}
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.1)"
            >
              <CardBody p={8}>
                <VStack spacing={6}>
                  <VStack spacing={2} textAlign="center">
                    <Icon as={FaQuestionCircle} w={12} h={12} color={accentColor} />
                    <Heading size="xl" color={headingColor}>
                      Frequently Asked Questions
                    </Heading>
                    <Text color={textColor} fontSize="lg">
                      Find answers to common questions about PhotoMap
                    </Text>
                  </VStack>

                  <Accordion allowToggle w="full">
                    {faqData.map((faq, index) => (
                      <AccordionItem key={index} border="none">
                        <AccordionButton
                          bg="whiteAlpha.50"
                          borderRadius="lg"
                          mb={2}
                          _hover={{ bg: "whiteAlpha.100" }}
                          _expanded={{ bg: "whiteAlpha.100" }}
                        >
                          <Box flex="1" textAlign="left">
                            <Text fontWeight="bold" color={headingColor}>
                              {faq.question}
                            </Text>
                          </Box>
                          <AccordionIcon color={accentColor} />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Text color={textColor} lineHeight="1.7">
                            {faq.answer}
                          </Text>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>

          {/* Social Media & Final CTA */}
          <MotionBox variants={itemVariants}>
            <Card
              bg={cardBg}
              backdropFilter="blur(20px)"
              borderRadius="2xl"
              border="1px solid"
              borderColor={cardBorder}
              boxShadow="0 25px 50px rgba(0, 0, 0, 0.1)"
            >
              <CardBody p={8}>
                <VStack spacing={6} textAlign="center">
                  <Icon as={FaHeart} w={12} h={12} color="red.400" />
                  <Heading size="xl" color={headingColor}>
                    Stay Connected
                  </Heading>
                  <Text color={textColor} fontSize="lg" maxW="2xl">
                    Follow us on social media for travel inspiration, tips, and updates about new PhotoMap features.
                  </Text>

                  <HStack spacing={6}>
                    {[
                      { icon: FaInstagram, color: "pink.500", href: "https://instagram.com" },
                      { icon: FaTwitter, color: "blue.400", href: "https://twitter.com" },
                      { icon: FaFacebook, color: "blue.600", href: "https://facebook.com" },
                      { icon: FaLinkedin, color: "blue.700", href: "https://linkedin.com" }
                    ].map((social, index) => (
                      <Link key={index} href={social.href} isExternal>
                        <Box
                          p={3}
                          bg="whiteAlpha.100"
                          borderRadius="full"
                          _hover={{
                            bg: "whiteAlpha.200",
                            transform: "translateY(-2px)"
                          }}
                          transition="all 0.2s"
                        >
                          <Icon as={social.icon} w={6} h={6} color={social.color} />
                        </Box>
                      </Link>
                    ))}
                  </HStack>

                  <Divider />

                  <VStack spacing={3}>
                    <Text color={textColor}>
                      Ready to start documenting your travels?
                    </Text>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      leftIcon={<FaRocket />}
                      _hover={{ transform: "translateY(-2px)" }}
                      transition="all 0.2s"
                    >
                      Start Your Journey
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Contact;