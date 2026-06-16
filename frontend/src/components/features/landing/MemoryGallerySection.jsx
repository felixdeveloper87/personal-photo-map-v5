/* eslint-disable react/prop-types */
import { Box, Container, HStack, Text, VStack } from '@chakra-ui/react';
import { HiMapPin } from 'react-icons/hi2';
import { SectionHeading, MotionBox, fadeInUp, useLandingTokens } from './landingUI';

const CITY_PHOTOS = [
  {
    city: 'Lisbon',
    country: 'Portugal',
    meta: '38.7223 N / 9.1393 W',
    src: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    meta: '35.6762 N / 139.6503 E',
    src: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'Barcelona',
    country: 'Spain',
    meta: '41.3874 N / 2.1686 E',
    src: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'New York',
    country: 'United States',
    meta: '40.7128 N / 74.0060 W',
    src: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'Rio de Janeiro',
    country: 'Brazil',
    meta: '22.9068 S / 43.1729 W',
    src: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'Paris',
    country: 'France',
    meta: '48.8566 N / 2.3522 E',
    src: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'Marrakech',
    country: 'Morocco',
    meta: '31.6295 N / 7.9811 W',
    src: 'https://images.unsplash.com/photo-1637531114994-ef00c3f54387?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'Santorini',
    country: 'Greece',
    meta: '36.3932 N / 25.4615 E',
    src: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'London',
    country: 'United Kingdom',
    meta: '51.5072 N / 0.1276 W',
    src: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
  },
  {
    city: 'Dubai',
    country: 'United Arab Emirates',
    meta: '25.2048 N / 55.2708 E',
    src: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80',
  },
];

const PhotoCard = ({ item, rotate = -2 }) => {
  const t = useLandingTokens();

  return (
    <Box
      className="memory-card"
      flex="0 0 auto"
      w={{ base: '238px', md: '292px' }}
      h={{ base: '316px', md: '374px' }}
      borderRadius="8px"
      overflow="hidden"
      position="relative"
      bg={t.surface}
      border="1px solid"
      borderColor={t.hairline}
      transform={`rotate(${rotate}deg)`}
      boxShadow="0 24px 60px rgba(0,0,0,0.32)"
    >
      <Box
        as="img"
        src={item.src}
        alt={`${item.city}, ${item.country}`}
        loading="lazy"
        w="full"
        h="full"
        objectFit="cover"
      />
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-t, rgba(5,8,12,0.86), rgba(5,8,12,0.18) 52%, transparent)"
      />
      <VStack position="absolute" left={4} right={4} bottom={4} align="start" spacing={1}>
        <Text color={t.text} fontSize={{ base: 'lg', md: 'xl' }} fontWeight="700">
          {item.city}
        </Text>
        <Text color={t.textSoft} fontSize="sm">
          {item.country}
        </Text>
        <Text
          color={t.primary}
          fontFamily="'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace"
          fontSize="10px"
          letterSpacing="0"
          textTransform="uppercase"
        >
          {item.meta}
        </Text>
      </VStack>
    </Box>
  );
};

const GalleryRow = ({ items, reverse = false }) => (
  <HStack
    className="gallery-row"
    spacing={{ base: 4, md: 6 }}
    w="max-content"
    animation={`${reverse ? 'galleryReverse' : 'galleryForward'} ${reverse ? 58 : 52}s linear infinite`}
  >
    {[...items, ...items].map((item, index) => (
      <PhotoCard key={`${item.city}-${index}`} item={item} rotate={index % 2 === 0 ? -2 : 2} />
    ))}
  </HStack>
);

const MemoryGallerySection = () => {
  const t = useLandingTokens();
  const rowA = CITY_PHOTOS.slice(0, 5);
  const rowB = CITY_PHOTOS.slice(5);

  return (
    <Box
      id="gallery"
      as="section"
      py={{ base: 16, md: 24 }}
      overflow="hidden"
      bg={t.bg}
      scrollMarginTop="110px"
      sx={{
        '@keyframes galleryForward': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        '@keyframes galleryReverse': {
          from: { transform: 'translateX(-50%)' },
          to: { transform: 'translateX(0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '.gallery-row': { animation: 'none' },
        },
        '.gallery-row:hover': { animationPlayState: 'paused' },
      }}
    >
      <Container maxW="container.xl" mb={{ base: 10, md: 14 }}>
        <MotionBox {...fadeInUp}>
          <SectionHeading
            eyebrow="Places become memory"
            eyebrowIcon={HiMapPin}
            title="Real cities, real photos, mapped back to your journey"
            subtitle="These example places become your own trips once photos are uploaded, grouped by country and organized by year."
          />
        </MotionBox>
      </Container>

      <VStack spacing={{ base: 5, md: 7 }} align="stretch">
        <GalleryRow items={rowA} />
        <GalleryRow items={rowB} reverse />
      </VStack>
    </Box>
  );
};

export default MemoryGallerySection;
