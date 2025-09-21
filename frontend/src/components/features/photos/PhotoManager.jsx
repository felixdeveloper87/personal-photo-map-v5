import React, { useContext, useState, useEffect, useMemo } from 'react';
import PhotoGallery from './PhotoGallery';
import JourneyStarterSection from './JourneyStarterSection';
import { CountriesContext } from '../../../context/CountriesContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import LoginModal from '../../modals/LoginModal';
import RegisterModal from '../../modals/RegisterModal';
import { buildApiUrl } from '../../../utils/apiConfig';
import '../../../styles/photoManagerAnimations.css';
import {
  Box,
  Button,
  Text,
  Flex,
  Wrap,
  WrapItem,
  Input,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from '../../ui/CustomToast';
import {
  DeleteAllByYearButton,
  CreateAlbumButton,
  DeleteAlbum,
  DeleteByYearButton,
} from '../../ui/buttons/CustomButtons';
import {
  ShowAllButton,
  YearSelectableButton,
  AlbumSelectableButton,
} from '../../ui/buttons/SelectableButtons';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ---------------- Fetchers ---------------- */
async function fetchYears(countryId, toast, handleAuthError) {
  const response = await fetch(buildApiUrl(`/api/images/${countryId}/available-years`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (await handleAuthError(response, toast)) return [];
    throw new Error(`Error fetching years: ${response.status}`);
  }
  return response.json();
}

async function fetchAlbums(countryId, toast, handleAuthError) {
  const response = await fetch(buildApiUrl(`/api/albums/${countryId}`), {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (await handleAuthError(response, toast)) return [];
    throw new Error(`Error fetching albums: ${response.status}`);
  }
  return response.json();
}

async function fetchImages(countryId, year, albumId, showAllSelected, toast, handleAuthError) {
  let url = buildApiUrl(`/api/images/${countryId}`);
  if (albumId) {
    url = buildApiUrl(`/api/albums/${albumId}/images`);
  } else if (year && !showAllSelected) {
    url += `/${year}`;
  }

  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    if (await handleAuthError(response, toast)) return [];
    throw new Error(`Error fetching images: ${response.status}`);
  }
  return response.json();
}

/**
 * PhotoManager
 */
const PhotoManager = ({ countryId, onUploadSuccess }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isPremium } = useContext(AuthContext);
  const { refreshCountriesWithPhotos, triggerMapUpdate } = useContext(CountriesContext);
  const navigate = useNavigate();

  // Trata 401/expiração de sessão
  const handleAuthError = async (response, toastInstance) => {
    if (response.status === 401) {
      toastInstance({
        title: 'Session Expired',
        description: 'Your login session has expired. Please log in again.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      localStorage.removeItem('token');
      localStorage.removeItem('fullname');
      localStorage.removeItem('email');
      localStorage.removeItem('premium');
      setTimeout(() => (window.location.href = '/'), 1500);
      return true;
    }
    return false;
  };

  // States
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showAllSelected, setShowAllSelected] = useState(false);

  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const loginModal = useDisclosure();
  const registerModal = useDisclosure();

  // Confirms
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: onDeleteConfirmOpen,
    onClose: onDeleteConfirmClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteAlbumOpen,
    onOpen: onDeleteAlbumOpen,
    onClose: onDeleteAlbumClose,
  } = useDisclosure();
  const {
    isOpen: isYearDeleteOpen,
    onOpen: onYearDeleteOpen,
    onClose: onYearDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isAllDeleteOpen,
    onOpen: onAllDeleteOpen,
    onClose: onAllDeleteClose,
  } = useDisclosure();

  // Login check
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (!token) loginModal.onOpen();
  }, [loginModal]);

  /* ---------------- Selection Logic ---------------- */
  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => {
      const next = !prev;
      if (!next) setSelectedImageIds([]); // limpa ao sair
      return next;
    });
  };

  const isImageSelected = (imageId) =>
    selectedImageIds.some((id) => String(id) === String(imageId));

  const handleImageSelection = (imageId) => {
    const key = String(imageId);
    setSelectedImageIds((prev) =>
      prev.some((id) => String(id) === key)
        ? prev.filter((id) => String(id) !== key)
        : [...prev, imageId]
    );
  };

  // helpers pro “select all” conforme conjunto atual
  const selectAllFrom = (list) => {
    const ids = list.map((img) => img.id);
    setSelectedImageIds(ids);
    if (!isSelectionMode) setIsSelectionMode(true);
  };
  const clearSelection = () => setSelectedImageIds([]);

  /* ---------------- useQuery ---------------- */
  const {
    data: yearsData = [],
    isLoading: isLoadingYears,
  } = useQuery({
    queryKey: ['years', countryId],
    queryFn: () => fetchYears(countryId, toast, handleAuthError),
    enabled: !!countryId && isLoggedIn,
  });

  const {
    data: albumsData = [],
  } = useQuery({
    queryKey: ['albums', countryId],
    queryFn: () => fetchAlbums(countryId, toast, handleAuthError),
    enabled: !!countryId && isLoggedIn,
  });

  const {
    data: allImagesData = [],
    isLoading: isLoadingAllImages,
  } = useQuery({
    queryKey: ['allImages', countryId],
    queryFn: () => fetchImages(countryId, null, null, true, toast, handleAuthError),
    enabled: !!countryId && !!isLoggedIn,
  });

  const {
    data: imagesData = [],
    isLoading: isLoadingImages,
  } = useQuery({
    queryKey: ['images', countryId, selectedYear, selectedAlbum, showAllSelected],
    queryFn: () => fetchImages(countryId, selectedYear, selectedAlbum, showAllSelected, toast, handleAuthError),
    enabled: !!countryId && !!isLoggedIn && !!(selectedYear || selectedAlbum || showAllSelected),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  /* ---------------- Mutations ---------------- */
  const queryInvalidations = async () => {
    await Promise.all([
      queryClient.invalidateQueries(['images']),
      queryClient.invalidateQueries(['years']),
      queryClient.invalidateQueries(['albums']),
      queryClient.invalidateQueries(['allImages']),
    ]);
    await refreshCountriesWithPhotos(true);
    triggerMapUpdate();
  };

  const deleteImagesMutation = useMutation({
    mutationFn: async (ids) => {
      const response = await fetch(buildApiUrl('/api/images/delete-multiple'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(ids),
      });
      if (!response.ok) throw new Error('Error deleting images.');
      return response;
    },
    onSuccess: async (_, ids) => {
      showSuccessToast(toast, `${ids.length} image(s) deleted successfully.`);
      triggerMapUpdate();
      try { await queryInvalidations(); } catch (e) { console.error('❌ Post-delete:', e); }
      setSelectedImageIds([]);
      setIsSelectionMode(false);
    },
    onError: () => showErrorToast(toast, 'There was an error deleting the images.'),
  });

  const createAlbumMutation = useMutation({
    mutationFn: async ({ countryId, albumName, imageIds }) => {
      const response = await fetch(buildApiUrl('/api/albums'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ countryId, albumName, imageIds }),
      });
      if (!response.ok) throw new Error('Error creating album.');
      return response.json();
    },
    onSuccess: () => {
      showSuccessToast(toast, 'The album was successfully created.');
      setNewAlbumName('');
      setSelectedImageIds([]);
      queryClient.invalidateQueries(['albums']);
    },
    onError: () => showErrorToast(toast, 'There was an error creating the album.'),
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: async (albumId) => {
      const response = await fetch(buildApiUrl(`/api/albums/${albumId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`Error deleting album: ${response.statusText}`);
      return response;
    },
    onSuccess: async () => {
      showSuccessToast(toast, 'The album was deleted successfully.');
      triggerMapUpdate();
      try { await queryInvalidations(); } catch (e) { console.error('❌ Album delete:', e); }
    },
    onError: () => showErrorToast(toast, 'There was an error deleting the album.'),
  });

  const deleteImagesByYearMutation = useMutation({
    mutationFn: async ({ countryId, year }) => {
      const response = await fetch(buildApiUrl(`/api/images/${countryId}/${year}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(`Error deleting images from year ${year}: ${response.status}`);
      return response;
    },
    onSuccess: async (_, { year }) => {
      showSuccessToast(toast, `All images from year ${year} were deleted successfully.`);
      triggerMapUpdate();
      try { await queryInvalidations(); } catch (e) { console.error('❌ Year delete:', e); }
      setSelectedYear(null);
    },
    onError: (_, { year }) =>
      showErrorToast(toast, `There was an error deleting images from year ${year}.`),
  });

  const deleteAllImagesByCountryMutation = useMutation({
    mutationFn: async (countryIdParam) => {
      const response = await fetch(buildApiUrl(`/api/images/delete-all-images/${countryIdParam}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error(`Error deleting all images of ${countryIdParam.toUpperCase()}: ${response.statusText}`);
      return response;
    },
    onSuccess: async () => {
      showSuccessToast(toast, 'All images were deleted successfully.');
      triggerMapUpdate();
      try { await queryInvalidations(); } catch (e) { console.error('❌ All delete:', e); }
      setShowAllSelected(false);
    },
    onError: () =>
      showErrorToast(toast, `Error deleting all images of ${countryId?.toUpperCase()}.`),
  });

  /* ---------------- Handlers ---------------- */
  const handleCreateAlbum = () => {
    if (!isPremium) return showWarningToast(toast, 'Album creation is available only for premium users.');
    if (!newAlbumName.trim()) return showWarningToast(toast, 'Please enter a name for the album.');
    if (selectedImageIds.length === 0) return showWarningToast(toast, 'Please select at least one image.');
    createAlbumMutation.mutate({ countryId, albumName: newAlbumName.trim(), imageIds: selectedImageIds });
  };

  const handleDeleteMultipleImages = (ids) => {
    if (!ids?.length) return showWarningToast(toast, 'Please select at least one image.');
    onDeleteConfirmOpen();
  };

  const handleDeleteAlbum = (albumId) => {
    if (!albumId) return;
    onDeleteAlbumOpen();
  };

  const handleDeleteImagesByYear = (year) => {
    if (!year) return;
    onYearDeleteOpen();
  };

  const toggleYearSelection = (year) => {
    setSelectedYear((prev) => (prev === year ? null : year));
    setSelectedAlbum(null);
    setShowAllSelected(false);
    setSelectedImageIds([]); // limpa seleção ao trocar o filtro
  };

  const toggleAlbumSelection = (albumId) => {
    setSelectedAlbum((prev) => (prev === albumId ? null : albumId));
    setSelectedYear(null);
    setShowAllSelected(false);
    setSelectedImageIds([]); // limpa seleção ao trocar o filtro
  };

  const toggleShowAll = () => {
    setShowAllSelected((prev) => !prev);
    setSelectedYear(null);
    setSelectedAlbum(null);
    setSelectedImageIds([]); // limpa seleção ao trocar o filtro
  };

  /* ---------------- Mappers ---------------- */
  const mapImageDto = (image) => ({
    url: image.filePath?.includes('s3.') ? image.filePath : buildApiUrl(image.filePath),
    id: image.id,
    year: image.year,
    countryId: image.countryId,
  });

  const allImages = useMemo(
    () => (Array.isArray(allImagesData) ? allImagesData.map(mapImageDto) : []),
    [allImagesData]
  );

  const images = useMemo(
    () => (Array.isArray(imagesData) ? imagesData.map(mapImageDto) : []),
    [imagesData]
  );

  const albumsWithImages = useMemo(
    () => (Array.isArray(albumsData) ? albumsData.filter((a) => a.images && a.images.length > 0) : []),
    [albumsData]
  );

  // qual lista está ativa no momento?
  const activeList = (selectedYear || selectedAlbum || showAllSelected) ? images : allImages;

  return (
    <Box>
      {/* Controles / Filtros */}
      <Box mb={4}>
        {isPremium && allImages.length > 0 && (
          <Flex mb={4} justify="center">
            <Input
              placeholder="Album Name"
              value={newAlbumName}
              border="1px"
              borderColor="teal.800"
              onChange={(e) => setNewAlbumName(e.target.value)}
              width="200px"
              mr={2}
            />
            <CreateAlbumButton onClick={handleCreateAlbum} isLoading={createAlbumMutation.isLoading}>
              Create Album
            </CreateAlbumButton>
          </Flex>
        )}

        {allImages.length === 0 && (
          <JourneyStarterSection countryId={countryId} onUploadSuccess={onUploadSuccess} />
        )}

        {allImages.length > 0 && (
          <Wrap
            spacing={{ base: 2, sm: 3, md: 3 }}
            justify="center"
            align="center"
            px={{ base: 2, sm: 3, md: 4 }}
          >
            {/* Anos */}
            {yearsData.map((year) => (
              <WrapItem key={year}>
                <YearSelectableButton
                  year={year}
                  isSelected={selectedYear === year}
                  onClick={() => toggleYearSelection(year)}
                />
              </WrapItem>
            ))}

            {/* Álbuns com fotos */}
            {albumsWithImages.map((album) => (
              <WrapItem key={album.id}>
                <AlbumSelectableButton
                  album={album}
                  isSelected={selectedAlbum === album.id}
                  onClick={() => toggleAlbumSelection(album.id)}
                />
              </WrapItem>
            ))}

            {(yearsData.length > 1 || (yearsData.length >= 1 && albumsWithImages.length >= 1)) && (
              <WrapItem>
                <ShowAllButton isSelected={showAllSelected} onClick={toggleShowAll} />
              </WrapItem>
            )}
          </Wrap>
        )}
      </Box>

      {/* Listagem de imagens */}
      {((selectedYear || selectedAlbum || showAllSelected) && isLoadingImages) ||
      (!(selectedYear || selectedAlbum || showAllSelected) && isLoadingAllImages) ? (
        <Text mt={1} mb={2} textAlign="center">
          Loading photos...
        </Text>
      ) : (selectedYear || selectedAlbum || showAllSelected) ? (
        images.length > 0 ? (
          <PhotoGallery
            images={images}
            onDeleteSelectedImages={() => onDeleteConfirmOpen()}
            selectedImageIds={selectedImageIds}
            isSelectionMode={isSelectionMode}
            toggleSelectionMode={toggleSelectionMode}
            handleImageSelection={handleImageSelection}
            isImageSelected={isImageSelected}
            onSelectAll={(list) => selectAllFrom(list)}     // NEW: select all (lista filtrada)
            onClearSelection={clearSelection}               // NEW: unselect all
          />
        ) : (
          <Box
            textAlign="center"
            py={6}
            px={4}
            bg="gray.50"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="lg" color="gray.600" mb={2}>
              📸 Nenhuma foto encontrada para os filtros selecionados
            </Text>
            <Text fontSize="sm" color="gray.500">Tente selecionar outro ano ou álbum</Text>
          </Box>
        )
      ) : (
        allImages.length > 0 && (
          <PhotoGallery
            images={allImages}
            onDeleteSelectedImages={() => onDeleteConfirmOpen()}
            selectedImageIds={selectedImageIds}
            isSelectionMode={isSelectionMode}
            toggleSelectionMode={toggleSelectionMode}
            handleImageSelection={handleImageSelection}
            isImageSelected={isImageSelected}
            onSelectAll={(list) => selectAllFrom(list)}     // NEW
            onClearSelection={clearSelection}               // NEW
          />
        )
      )}

      {/* Botões de ação contextual */}
      {(selectedYear || selectedAlbum) && (
        <Flex mt={2} justify="center" direction={{ base: 'column', sm: 'row' }} align="center" gap={3}>
          {selectedAlbum && (
            <DeleteAlbum onClick={() => handleDeleteAlbum(selectedAlbum)} isLoading={deleteAlbumMutation.isLoading} borderRadius="xl" />
          )}
          {selectedYear && (
            <DeleteByYearButton
              year={selectedYear}
              onClick={() => handleDeleteImagesByYear(selectedYear)}
              isLoading={deleteImagesByYearMutation.isLoading}
            />
          )}
        </Flex>
      )}

      {showAllSelected && (
        <Flex mt={2} justify="center">
          <DeleteAllByYearButton
            year={selectedYear}
            onClick={onAllDeleteOpen}
            isLoading={deleteAllImagesByCountryMutation.isLoading}
          />
        </Flex>
      )}

      {/* Confirmações */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={onDeleteConfirmClose}
        onConfirm={() => {
          deleteImagesMutation.mutate(selectedImageIds.map((id) => Number(id)));
          onDeleteConfirmClose();
        }}
        title="Delete Images"
        message={`Are you sure you want to delete ${selectedImageIds.length} image(s)? This action cannot be undone.`}
      />

      <ConfirmDialog
        isOpen={isDeleteAlbumOpen}
        onClose={onDeleteAlbumClose}
        onConfirm={() => {
          if (selectedAlbum) deleteAlbumMutation.mutate(selectedAlbum);
          onDeleteAlbumClose();
        }}
        title="Delete Album"
        message="Are you sure you want to delete this album and all of its images?"
      />

      <ConfirmDialog
        isOpen={isYearDeleteOpen}
        onClose={onYearDeleteClose}
        onConfirm={() => {
          if (selectedYear) deleteImagesByYearMutation.mutate({ countryId, year: selectedYear });
          onYearDeleteClose();
        }}
        title="Delete Images by Year"
        message={`Are you sure you want to delete all images from year ${selectedYear}? This action cannot be undone.`}
      />

      <ConfirmDialog
        isOpen={isAllDeleteOpen}
        onClose={onAllDeleteClose}
        onConfirm={() => {
          deleteAllImagesByCountryMutation.mutate(countryId);
          onAllDeleteClose();
        }}
        title="Delete All Images"
        message={`Are you sure you want to delete all images of ${countryId.toUpperCase()}? This action cannot be undone.`}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        onSwitchToRegister={() => {
          loginModal.onClose();
          registerModal.onOpen();
        }}
      />
      <RegisterModal
        isOpen={registerModal.isOpen}
        onClose={registerModal.onClose}
        onSwitchToLogin={() => {
          registerModal.onClose();
          loginModal.onOpen();
        }}
      />
    </Box>
  );
};

export default PhotoManager;
