import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Container,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Text,
  Textarea,
  FormControl,
  FormErrorMessage,
  FormLabel,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { FaInstagram, FaTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa';
import {
  HiChatBubbleLeftRight,
  HiClock,
  HiEnvelope,
  HiMapPin,
  HiPaperAirplane,
  HiPhone,
  HiQuestionMarkCircle,
  HiRocketLaunch,
  HiUser,
  HiTag,
} from 'react-icons/hi2';
import ModalButton from '../components/modals/ModalButton';
import { IconTile, ModalField, ToneBadge } from '../components/modals/ModalKit';
import { Eyebrow, GlowCard } from '../components/features/landing/landingUI';
import { color, font, radius, type } from '../design/tokens';

const MotionBox = motion.create(Box);

const CONTACT_METHODS = [
  {
    icon: HiEnvelope,
    tone: 'brand',
    title: 'Email Support',
    description: 'Get help via email',
    contact: 'support@photomap.com',
    action: 'mailto:support@photomap.com',
    responseTime: 'Within 24 hours',
  },
  {
    icon: HiChatBubbleLeftRight,
    tone: 'teal',
    title: 'Live Chat',
    description: 'Chat with our team',
    contact: 'Available 9 AM - 6 PM GMT',
    action: '#',
    responseTime: 'Instant response',
  },
  {
    icon: HiPhone,
    tone: 'rose',
    title: 'Phone Support',
    description: 'Speak with an expert',
    contact: '+44 20 1234 5678',
    action: 'tel:+442012345678',
    responseTime: 'Mon-Fri 9-5 GMT',
  },
];

const FAQ = [
  {
    question: 'How do I upload photos to PhotoMap?',
    answer:
      'Simply go to the Countries page, select your destination, and use the upload button. You can upload multiple photos at once and organize them by year.',
  },
  {
    question: 'Is PhotoMap free to use?',
    answer:
      'PhotoMap offers both free and premium plans. Free users can upload photos and track their travels, while premium users get unlimited storage and advanced features.',
  },
  {
    question: 'Can I export my travel data?',
    answer:
      'Yes! Premium users can export their travel data, photos, and statistics in various formats including PDF reports and CSV files.',
  },
  {
    question: 'How do I reset my password?',
    answer:
      "Click the 'Forgot Password' link on the login page and follow the instructions. You'll receive an email with reset instructions.",
  },
  {
    question: 'Is my data secure on PhotoMap?',
    answer:
      'Absolutely! We use industry-standard encryption and security measures to protect your photos and personal data. Your privacy is our top priority.',
  },
];

const SOCIALS = [
  { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: FaTwitter, label: 'Twitter', href: 'https://twitter.com' },
  { icon: FaFacebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: FaLinkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.45 } } };

const SectionTitle = ({ eyebrow, title, subtitle }) => (
  <VStack spacing={3} textAlign="center" mb={{ base: 5, md: 6 }}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <Text {...type.display} fontSize={{ base: '1.9rem', md: '2.3rem' }} color={color.text}>
      {title}
    </Text>
    {subtitle && (
      <Text color={color.textSoft} maxW="560px" lineHeight="1.7">
        {subtitle}
      </Text>
    )}
  </VStack>
);

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
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
        title: 'Message sent successfully!',
        description: "We'll get back to you within 24 hours.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 2000);
  };

  return (
    <Box minH="100vh" bg={color.bg} py={{ base: 10, md: 16 }} position="relative">
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        pointerEvents="none"
        bg="radial-gradient(900px 480px at 15% -10%, rgba(235,181,114,0.10), transparent 60%), radial-gradient(700px 420px at 95% 20%, rgba(111,208,196,0.07), transparent 60%)"
      />
      <Container maxW="6xl" position="relative" zIndex={1} px={{ base: 4, md: 6 }}>
        <MotionBox variants={containerVariants} initial="hidden" animate="visible">
          {/* Hero */}
          <MotionBox variants={itemVariants} textAlign="center" mb={{ base: 10, md: 14 }}>
            <VStack spacing={5}>
              <Eyebrow>Contact</Eyebrow>
              <Text fontFamily={font.display} fontSize={{ base: '2.6rem', md: '3.6rem' }} lineHeight="1.02" color={color.text}>
                Get in{' '}
                <Text as="em" color={color.primary}>
                  touch
                </Text>
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} color={color.textSoft} maxW="2xl" lineHeight="1.7">
                Have questions about your travels or need support? We&apos;re here to help you make the most of your
                PhotoMap experience.
              </Text>
            </VStack>
          </MotionBox>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 8 }} mb={{ base: 10, md: 14 }}>
            {/* Contact form */}
            <MotionBox variants={itemVariants}>
              <GlowCard h="full">
                <VStack spacing={6} align="stretch">
                  <HStack spacing={3.5}>
                    <IconTile icon={HiPaperAirplane} />
                    <Box>
                      <Text {...type.display} fontSize="1.6rem" color={color.text}>
                        Send us a message
                      </Text>
                      <Text fontSize="sm" color={color.textSoft}>
                        Fill out the form below and we&apos;ll get back to you soon
                      </Text>
                    </Box>
                  </HStack>

                  <form onSubmit={handleSubmit} noValidate>
                    <VStack spacing={4}>
                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                        <ModalField
                          label="Name"
                          icon={HiUser}
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          error={errors.name}
                        />
                        <ModalField
                          label="Email"
                          icon={HiEnvelope}
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="you@example.com"
                          error={errors.email}
                        />
                      </SimpleGrid>
                      <ModalField
                        label="Subject"
                        icon={HiTag}
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What can we help you with?"
                        error={errors.subject}
                      />
                      <FormControl isInvalid={!!errors.message}>
                        <FormLabel variant="atlas">Message</FormLabel>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us more about your question or concern..."
                          rows={5}
                        />
                        <FormErrorMessage>{errors.message}</FormErrorMessage>
                      </FormControl>

                      <ModalButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        w="full"
                        leftIcon={<HiPaperAirplane />}
                        isLoading={isSubmitting}
                        loadingText="Sending…"
                      >
                        Send message
                      </ModalButton>
                    </VStack>
                  </form>
                </VStack>
              </GlowCard>
            </MotionBox>

            {/* Contact methods + HQ */}
            <MotionBox variants={itemVariants}>
              <VStack spacing={4} align="stretch" h="full">
                {CONTACT_METHODS.map((m) => (
                  <GlowCard key={m.title} p={5}>
                    <HStack spacing={4} align="start">
                      <IconTile icon={m.icon} tone={m.tone} />
                      <VStack align="start" spacing={1} flex={1} minW={0}>
                        <Text fontWeight="700" color={color.text}>
                          {m.title}
                        </Text>
                        <Text color={color.textSoft} fontSize="sm">
                          {m.description}
                        </Text>
                        <Link href={m.action} color={color.primary} fontWeight="600" fontSize="sm" _hover={{ color: color.primaryHover }}>
                          {m.contact}
                        </Link>
                        <ToneBadge tone={m.tone} icon={HiClock} mt={1}>
                          {m.responseTime}
                        </ToneBadge>
                      </VStack>
                    </HStack>
                  </GlowCard>
                ))}

                <GlowCard p={5}>
                  <HStack spacing={4} align="start">
                    <IconTile icon={HiMapPin} tone="neutral" />
                    <VStack align="start" spacing={0.5} color={color.textSoft} fontSize="sm">
                      <Text fontWeight="700" color={color.text} fontSize="md">
                        PhotoMap Headquarters
                      </Text>
                      <Text>PhotoMap Ltd.</Text>
                      <Text>123 Tech Street</Text>
                      <Text>London, UK, W1A 1AA</Text>
                      <ToneBadge tone="teal" icon={HiClock} mt={2}>
                        Mon-Fri 9AM-5PM GMT
                      </ToneBadge>
                    </VStack>
                  </HStack>
                </GlowCard>
              </VStack>
            </MotionBox>
          </SimpleGrid>

          {/* FAQ */}
          <MotionBox variants={itemVariants} mb={{ base: 10, md: 14 }}>
            <GlowCard>
              <SectionTitle eyebrow="FAQ" title="Frequently asked questions" subtitle="Find answers to common questions about PhotoMap" />
              <Accordion allowToggle w="full">
                {FAQ.map((faq) => (
                  <AccordionItem key={faq.question} border="none" mb={2}>
                    <AccordionButton
                      px={4}
                      py={3.5}
                      borderRadius={radius.md}
                      bg="rgba(236,231,220,0.03)"
                      border="1px solid"
                      borderColor={color.hairline}
                      _hover={{ bg: 'rgba(236,231,220,0.06)' }}
                      _expanded={{ bg: color.primarySoftBg, borderColor: color.primarySoftBorder }}
                      _focusVisible={{ boxShadow: `0 0 0 3px ${color.focusRing}` }}
                    >
                      <HStack flex="1" textAlign="left" spacing={3}>
                        <Icon as={HiQuestionMarkCircle} color={color.primary} boxSize={4} flexShrink={0} />
                        <Text fontWeight="600" color={color.text} fontSize="sm">
                          {faq.question}
                        </Text>
                      </HStack>
                      <AccordionIcon color={color.textMuted} />
                    </AccordionButton>
                    <AccordionPanel px={4} pt={3} pb={4}>
                      <Text color={color.textSoft} lineHeight="1.7" fontSize="sm">
                        {faq.answer}
                      </Text>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </GlowCard>
          </MotionBox>

          {/* Social + CTA */}
          <MotionBox variants={itemVariants}>
            <GlowCard textAlign="center">
              <SectionTitle
                eyebrow="Community"
                title="Stay connected"
                subtitle="Follow us on social media for travel inspiration, tips, and updates about new PhotoMap features."
              />
              <HStack spacing={3} justify="center" mb={8}>
                {SOCIALS.map((s) => (
                  <Link key={s.label} href={s.href} isExternal aria-label={s.label}>
                    <Box
                      w="44px"
                      h="44px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="full"
                      bg="rgba(236,231,220,0.04)"
                      border="1px solid"
                      borderColor={color.hairlineMid}
                      color={color.textSoft}
                      transition="all .2s ease"
                      _hover={{ color: color.primary, borderColor: color.primarySoftBorder, bg: color.primarySoftBg }}
                    >
                      <Icon as={s.icon} boxSize={4.5} />
                    </Box>
                  </Link>
                ))}
              </HStack>
              <Box h="1px" bg={color.hairline} mb={6} />
              <VStack spacing={3}>
                <Text color={color.textSoft}>Ready to start documenting your travels?</Text>
                <ModalButton variant="primary" size="lg" leftIcon={<HiRocketLaunch />}>
                  Start your journey
                </ModalButton>
              </VStack>
            </GlowCard>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Contact;
