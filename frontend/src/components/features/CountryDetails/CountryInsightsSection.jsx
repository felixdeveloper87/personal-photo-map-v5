import { Box, Card, CardBody, Text, Flex, HStack, Button, Icon, useDisclosure, Tooltip, useToast } from '@chakra-ui/react';
import { FaCloudUploadAlt, FaGlobe, FaShare } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { buildApiUrl } from '../../../utils/apiConfig';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';
import { useLandingTokens } from '../landing/landingUI';

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

const CountryInsightsSection = ({ countryId, onUploadSuccess }) => {
  const { isOpen: isImageUploaderOpen, onOpen: onImageUploaderOpen, onClose: onImageUploaderClose } = useDisclosure();
  const toast = useToast();
  const { isLoggedIn } = useContext(AuthContext);
  const t = useLandingTokens();

  // Check if user has photos in this country
  const { data: userPhotos = [] } = useQuery({
    queryKey: ['userPhotos', countryId],
    queryFn: () => fetchUserPhotos(countryId),
    enabled: !!countryId && isLoggedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

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
    <Box mb={{ base: 3, md: 4 }}>
      <Card 
        bg={t.surface}
        border="1px solid" 
        borderColor={t.hairline} 
        shadow="none" 
        className="country-details-card card-entrance"
        borderRadius="14px"
        overflow="hidden"
      >
        <CardBody p={{ base: 3, md: 3.5 }} px={{ base: 3, md: 4 }}>
          <Flex 
            justify="space-between" 
            align="center" 
            gap={{ base: 2, sm: 3, md: 4 }}
            flexWrap={{ base: 'wrap', sm: 'nowrap' }}
            overflow="hidden"
          >
            
            {/* Left: Icon + Text */}
            <HStack spacing={{ base: 1, sm: 2 }} flexShrink={0}>
              <Box display="inline-flex" p={2} borderRadius="10px" bg={t.primarySoftBg} color={t.primary}>
                <Icon as={FaGlobe} boxSize={{ base: 3.5, sm: 4 }} />
              </Box>
              <Text 
                fontSize={{ base: "xs", sm: "sm" }} 
                fontWeight="700" 
                color={t.text}
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
                  size={{ base: "xs", sm: "sm" }}
                  bg={t.primary}
                  color="white"
                  _hover={{
                    bg: t.primaryHover,
                    transform: "translateY(-1px)",
                    boxShadow: t.shadowMd,
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  transition="all 0.2s ease"
                  borderRadius="10px"
                  fontWeight="600"
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
                  size={{ base: "xs", sm: "sm" }}
                  bg="transparent"
                  color={t.textSoft}
                  border="1px solid"
                  borderColor={t.hairlineStrong}
                  _hover={{
                    bg: t.primarySoftBg,
                    color: t.primary,
                    borderColor: t.primary,
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  transition="all 0.2s ease"
                  borderRadius="10px"
                  fontWeight="600"
                  px={{ base: 2, sm: 3 }}
                  py={1.5}
                  fontSize={{ base: "xs", sm: "sm" }}
                  whiteSpace="nowrap"
                >
                  Share
                </Button>
              </Tooltip>
            </HStack>

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
