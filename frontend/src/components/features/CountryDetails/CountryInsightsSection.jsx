import { Box, Card, CardBody, Text, Flex, VStack, HStack, Button, Icon, useDisclosure, useColorModeValue, Badge, Divider, Tooltip, useToast } from '@chakra-ui/react';
import { FaCloudUploadAlt, FaGlobe, FaMapMarkerAlt, FaShare } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { buildApiUrl } from '../../../utils/apiConfig';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';

// Helper function to fetch user photos for a country
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function fetchUserPhotos(countryId) {
  const response = await fetch(buildApiUrl(`/api/images/${countryId}`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      return []; // Return empty array if not authenticated
    }
    throw new Error(`Error fetching photos: ${response.status}`);
  }
  return response.json();
}

const CountryInsightsSection = ({ countryInfo, cardBg, borderColor, countryId, onUploadSuccess }) => {
  const { isOpen: isImageUploaderOpen, onOpen: onImageUploaderOpen, onClose: onImageUploaderClose } = useDisclosure();
  const toast = useToast();
  const { isLoggedIn } = useContext(AuthContext);

  // Check if user has photos in this country
  const { data: userPhotos = [] } = useQuery({
    queryKey: ['userPhotos', countryId],
    queryFn: () => fetchUserPhotos(countryId),
    enabled: !!countryId && isLoggedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Color mode values for subtle design
  const subtleBg = useColorModeValue('gray.50', 'gray.800');
  const subtleBorder = useColorModeValue('gray.200', 'gray.600');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('gray.500', 'gray.400');
  // Precompute button theme values so hook order stays stable even if section returns null
  const addPhotoBtnBg = useColorModeValue('blue.50', 'blue.900');
  const addPhotoBtnColor = useColorModeValue('blue.600', 'blue.200');
  const addPhotoBtnHoverBg = useColorModeValue('blue.100', 'blue.800');
  const shareBtnBg = useColorModeValue('gray.100', 'gray.700');
  const shareBtnColor = useColorModeValue('gray.600', 'gray.300');
  const shareBtnHoverBg = useColorModeValue('gray.200', 'gray.600');
  
  // Share functionality - In development
  const handleShare = () => {
    toast({
      title: "Feature in Development",
      description: "Share functionality is coming soon!",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top"
    });
  };

  // Only render if user has photos in this country
  if (userPhotos.length === 0) {
    return null;
  }

  return (
    <Box mb={3}>
      <Card 
        bg={subtleBg} 
        border="1px solid" 
        borderColor={subtleBorder} 
        shadow="sm" 
        className="country-details-card card-entrance"
        borderRadius="lg"
        overflow="hidden"
      >
        <CardBody p={2} px={4}>
          <Flex 
            justify="space-between" 
            align="center" 
            gap={{ base: 2, sm: 3, md: 4 }}
            flexWrap="nowrap"
            overflow="hidden"
          >
            
            {/* Left: Icon + Text */}
            <HStack spacing={{ base: 1, sm: 2 }} flexShrink={0}>
              <Icon as={FaGlobe} color={iconColor} boxSize={{ base: 3.5, sm: 4 }} />
              <Text 
                fontSize={{ base: "xs", sm: "sm" }} 
                fontWeight="medium" 
                color={textSecondary}
                whiteSpace="nowrap"
              >
                Travel Hub
              </Text>
            </HStack>

            {/* Center: Action buttons */}
            <HStack spacing={{ base: 1, sm: 2 }} justifyContent="center">
              <Tooltip label="Share your travel memories" hasArrow>
                <Button
                  onClick={onImageUploaderOpen}
                  leftIcon={<Icon as={FaCloudUploadAlt} boxSize={{ base: 3, sm: 3.5 }} />}
                  variant="ghost"
                  colorScheme="blue"
                  size={{ base: "xs", sm: "sm" }}
                  bg={addPhotoBtnBg}
                  color={addPhotoBtnColor}
                  _hover={{
                    bg: addPhotoBtnHoverBg,
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  transition="all 0.2s ease"
                  borderRadius="md"
                  fontWeight="medium"
                  px={{ base: 2, sm: 3 }}
                  py={1.5}
                  fontSize={{ base: "xs", sm: "sm" }}
                  whiteSpace="nowrap"
                >
                  Add Photos
                </Button>
              </Tooltip>

              <Tooltip label="Coming soon - Share functionality" hasArrow>
                <Button
                  onClick={handleShare}
                  leftIcon={<Icon as={FaShare} boxSize={{ base: 3, sm: 3.5 }} />}
                  variant="ghost"
                  colorScheme="gray"
                  size={{ base: "xs", sm: "sm" }}
                  bg={shareBtnBg}
                  color={shareBtnColor}
                  _hover={{
                    bg: shareBtnHoverBg,
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  transition="all 0.2s ease"
                  borderRadius="md"
                  fontWeight="medium"
                  px={{ base: 2, sm: 3 }}
                  py={1.5}
                  fontSize={{ base: "xs", sm: "sm" }}
                  whiteSpace="nowrap"
                >
                  Share
                </Button>
              </Tooltip>
            </HStack>

            {/* Right: Badge */}
            <Badge 
              colorScheme="blue" 
              variant="subtle" 
              fontSize={{ base: "2xs", sm: "xs" }}
              px={{ base: 1.5, sm: 2 }}
              py={{ base: 0.5, sm: 1 }}
              borderRadius="md"
              flexShrink={0}
              whiteSpace="nowrap"
              display={{ base: "none", sm: "block" }}
            >
              Explore
            </Badge>

          </Flex>
        </CardBody>
        
        <EnhancedImageUploaderModal
          isOpen={isImageUploaderOpen}
          onClose={onImageUploaderClose}
          onUploadSuccess={onUploadSuccess}
          countryId={countryId}
        />
      </Card>
    </Box>
  );
};

export default CountryInsightsSection;
