import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Progress,
  useColorModeValue,
  Badge,
  Icon,
  Spinner,
  useToast
} from "@chakra-ui/react";
import {
  HiCloudArrowUp as HiCloud,
  HiArrowUpTray as HiUpload,
  HiExclamationTriangle,
  HiArrowPath as HiSync
} from "react-icons/hi2";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";
import { AuthContext } from "../../context/AuthContext";
import { CountriesContext } from "../../context/CountriesContext";
import { buildApiUrl } from "../../utils/apiConfig";
import { useQuery } from "@tanstack/react-query";

const useStorageInfo = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return useQuery({
    queryKey: ['storage-usage'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');

      let storageData = { usedBytes: 0 };
      try {
        const photosResponse = await fetch(buildApiUrl('/api/images/allPictures'), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (photosResponse.ok) {
          const photos = await photosResponse.json();
          storageData.usedBytes = photos.length * 2 * 1024 * 1024;
        }
      } catch {
        storageData.usedBytes = 0;
      }

      const usedGB = storageData.usedBytes / (1024 * 1024 * 1024);
      const isPremium = localStorage.getItem('premium') === 'true';
      const totalGB = isPremium ? 100 : 5;

      return {
        used: parseFloat(usedGB.toFixed(2)),
        total: totalGB,
        usedBytes: storageData.usedBytes,
        lastUpdated: new Date().toISOString()
      };
    },
    enabled: isLoggedIn,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 3,
    retryDelay: 1000
  });
};

const PhotoStorageModal = ({ isOpen, onClose, onUpgrade }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.12)");
  const bgCard = useColorModeValue("rgba(255,255,255,0.65)", "rgba(0,0,0,0.55)");
  const toast = useToast();

  const { isLoggedIn, isPremium } = useContext(AuthContext);
  const { photoCount, refreshCountriesWithPhotos } = useContext(CountriesContext);

  const { data: storageData, isLoading, isError, error, refetch } = useStorageInfo();

  const [localStorageData, setLocalStorageData] = useState({
    used: 0, total: 5, photos: 0, isPremium: false
  });

  useEffect(() => {
    if (storageData) {
      setLocalStorageData(prev => ({ ...prev, used: storageData.used, total: storageData.total }));
    }
  }, [storageData]);

  useEffect(() => {
    if (photoCount !== undefined) {
      setLocalStorageData(prev => ({ ...prev, photos: photoCount }));
    }
  }, [photoCount]);

  useEffect(() => {
    if (isPremium !== undefined) {
      setLocalStorageData(prev => ({ ...prev, isPremium, total: isPremium ? 100 : 5 }));
    }
  }, [isPremium]);

  const handleRefresh = async () => {
    try {
      await refetch();
      await refreshCountriesWithPhotos();
      toast({
        title: "Storage Updated",
        description: "Storage information has been refreshed",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "Failed to refresh storage information",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const usagePercentage = localStorageData.total > 0
    ? (localStorageData.used / localStorageData.total) * 100
    : 0;
  const isNearLimit = usagePercentage > 80;
  const isAtLimit = usagePercentage >= 100;

  const getStorageColor = () => {
    if (isAtLimit) return "red";
    if (isNearLimit) return "orange";
    return "green";
  };

  const footer = (
    <Box w="full">
      <VStack spacing={2.5}>
        {!localStorageData.isPremium && (
          <ModalButton
            variant="primary"
            onClick={onUpgrade}
            leftIcon={<Icon as={HiCloud} />}
            w="full"
          >
            Upgrade Storage
          </ModalButton>
        )}
        <ModalButton
          variant="secondary"
          onClick={handleRefresh}
          leftIcon={<Icon as={HiSync} />}
          w="full"
          isLoading={isLoading}
        >
          Refresh Storage Info
        </ModalButton>
        <ModalButton variant="secondary" onClick={onClose} w="full">
          Close
        </ModalButton>
      </VStack>
    </Box>
  );

  if (isLoading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Photo Storage" icon={HiCloud}>
        <VStack py={8} spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="md">Loading storage information...</Text>
        </VStack>
      </BaseModal>
    );
  }

  if (isError) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Photo Storage" icon={HiCloud}>
        <VStack py={8} spacing={4}>
          <Icon as={HiExclamationTriangle} color="red.500" boxSize={8} />
          <Text color="red.500">Failed to load storage information</Text>
          <Text fontSize="sm" color="gray.500">{error?.message}</Text>
          <ModalButton variant="primary" onClick={handleRefresh} leftIcon={<HiSync />}>
            Retry
          </ModalButton>
        </VStack>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Photo Storage"
      icon={HiCloud}
      footer={footer}
      size={{ base: "full", sm: "md", md: "lg" }}
    >
      <VStack spacing={5} align="stretch">

        {/* Storage Summary */}
        <Box
          p={5}
          borderRadius="xl"
          bg={bgCard}
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor={borderColor}
          boxShadow={useColorModeValue(
            "0 1px 3px rgba(0,0,0,0.05)",
            "0 1px 3px rgba(255,255,255,0.05)"
          )}
          textAlign="center"
        >
          <VStack spacing={3}>
            <Box
              p={3}
              borderRadius="full"
              bg={useColorModeValue("blue.100", "blue.900")}
              color={useColorModeValue("blue.600", "blue.400")}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={HiCloud} boxSize={6} />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Storage Usage
            </Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              {localStorageData.used} GB of {localStorageData.total} GB used
            </Text>
          </VStack>
        </Box>

        {/* Progress */}
        <Box bg={bgCard} borderRadius="lg" border="1px solid" borderColor={borderColor} p={4} backdropFilter="blur(8px)">
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="semibold" color={textColor}>Storage Used</Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              {usagePercentage.toFixed(1)}%
            </Text>
          </HStack>
          <Progress
            value={usagePercentage}
            colorScheme={getStorageColor()}
            borderRadius="full"
            size="lg"
          />
          <HStack justify="space-between" mt={2}>
            <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
              {localStorageData.used} GB used
            </Text>
            <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")}>
              {(localStorageData.total - localStorageData.used).toFixed(2)} GB free
            </Text>
          </HStack>
        </Box>

        {/* Warning */}
        {(isNearLimit || isAtLimit) && (
          <Box
            p={4}
            borderRadius="lg"
            bg={useColorModeValue("rgba(255,237,213,0.8)", "rgba(154,52,18,0.6)")}
            border="1px solid"
            borderColor={useColorModeValue("orange.200", "orange.700")}
            backdropFilter="blur(6px)"
          >
            <HStack spacing={3}>
              <Icon as={HiExclamationTriangle} color="orange.500" boxSize={5} />
              <Box>
                <Text fontWeight="bold" color={useColorModeValue("orange.700", "orange.200")}>
                  {isAtLimit ? "Storage Full!" : "Storage Almost Full"}
                </Text>
                <Text fontSize="sm" color={useColorModeValue("orange.600", "orange.300")}>
                  {isAtLimit
                    ? "You cannot upload more photos. Please upgrade your storage plan."
                    : "Consider upgrading your plan to avoid interruptions."}
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        {/* Stats */}
        <Box
          p={4}
          borderRadius="lg"
          bg={bgCard}
          border="1px solid"
          borderColor={borderColor}
          backdropFilter="blur(8px)"
        >
          <HStack spacing={3}>
            <Text fontWeight="semibold" color={textColor}>Photos Stored</Text>
            <Text fontWeight="bold" border="1px solid" borderColor={borderColor} p={1} borderRadius="md">
              {localStorageData.photos}
            </Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              Total photos in your collection
            </Text>
          </HStack>
        </Box>

      </VStack>
    </BaseModal>
  );
};

export default PhotoStorageModal;
