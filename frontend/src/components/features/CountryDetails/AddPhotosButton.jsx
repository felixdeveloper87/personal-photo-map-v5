import { useContext } from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import { buildApiUrl } from '../../../utils/apiConfig';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';

async function fetchUserPhotos(countryId) {
  const token = localStorage.getItem('token');
  const response = await fetch(buildApiUrl(`/api/images/${countryId}`), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (response.status === 401) return [];
  if (!response.ok) throw new Error(`Error fetching photos: ${response.status}`);
  return response.json();
}

/**
 * "Add photos" action for the hero. Only shown once the user already has photos
 * here — the empty state (JourneyStarterSection) has its own upload call to action.
 */
export default function AddPhotosButton({ countryId, onUploadSuccess, ...buttonProps }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isLoggedIn } = useContext(AuthContext);

  const { data: userPhotos = [] } = useQuery({
    queryKey: ['userPhotos', countryId],
    queryFn: () => fetchUserPhotos(countryId),
    enabled: !!countryId && isLoggedIn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!isLoggedIn || userPhotos.length === 0) return null;

  return (
    <>
      <Button onClick={onOpen} leftIcon={<FaCloudUploadAlt />} {...buttonProps}>
        Add Photos
      </Button>
      <EnhancedImageUploaderModal
        isOpen={isOpen}
        onClose={onClose}
        onUploadSuccess={onUploadSuccess}
        countryId={countryId}
      />
    </>
  );
}
