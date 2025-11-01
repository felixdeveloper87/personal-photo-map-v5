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

/**
 * Hook personalizado para buscar informações de storage do usuário
 */
const useStorageInfo = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return useQuery({
    queryKey: ['storage-usage'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');

      // Buscar informações de storage (tamanho dos arquivos)
      // TODO: Implementar endpoint no backend
      let storageData = { usedBytes: 0 };

      // Por enquanto, usar valor padrão até implementar o endpoint
      try {
        // Tentar buscar fotos do usuário para calcular storage
        const photosResponse = await fetch(buildApiUrl('/api/images/allPictures'), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (photosResponse.ok) {
          const photos = await photosResponse.json();
          // Calcular tamanho total baseado no número de fotos (estimativa)
          storageData.usedBytes = photos.length * 2 * 1024 * 1024; // 2MB por foto estimado
        }
      } catch (error) {
        console.warn('Could not fetch storage info:', error);
        storageData.usedBytes = 0;
      }

      // Calcular storage em GB
      const usedGB = storageData.usedBytes / (1024 * 1024 * 1024);

      // Determinar plano baseado no status premium
      const isPremium = localStorage.getItem('premium') === 'true';
      const totalGB = isPremium ? 100 : 5; // 100GB para premium, 5GB para free

      return {
        used: parseFloat(usedGB.toFixed(2)),
        total: totalGB,
        usedBytes: storageData.usedBytes || 0,
        lastUpdated: new Date().toISOString()
      };
    },
    enabled: isLoggedIn,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
    staleTime: 10000, // Dados ficam "frescos" por 10 segundos
    retry: 3,
    retryDelay: 1000
  });
};

/**
 * Professional Photo Storage Modal
 * Shows real-time storage usage and management options
 */
const PhotoStorageModal = ({ isOpen, onClose, onUpgrade }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.500", "gray.200");
  const bgColor = useColorModeValue("gray.50", "black");
  const toast = useToast();

  // Contextos - usando dados já disponíveis
  const { isLoggedIn, isPremium } = useContext(AuthContext);
  const { photoCount, refreshCountriesWithPhotos } = useContext(CountriesContext);

  // Hook para buscar informações de storage (apenas tamanho dos arquivos)
  const {
    data: storageData,
    isLoading,
    isError,
    error,
    refetch
  } = useStorageInfo();

  // Estado local para dados de storage
  const [localStorageData, setLocalStorageData] = useState({
    used: 0,
    total: 5,
    photos: 0,
    isPremium: false
  });

  // Atualizar dados locais quando os dados da API mudarem
  useEffect(() => {
    if (storageData) {
      setLocalStorageData(prev => ({
        ...prev,
        used: storageData.used,
        total: storageData.total
      }));
    }
  }, [storageData]);

  // Atualizar contagem de fotos do contexto (já disponível)
  useEffect(() => {
    if (photoCount !== undefined) {
      setLocalStorageData(prev => ({
        ...prev,
        photos: photoCount
      }));
    }
  }, [photoCount]);

  // Atualizar status premium do contexto (já disponível)
  useEffect(() => {
    if (isPremium !== undefined) {
      setLocalStorageData(prev => ({
        ...prev,
        isPremium,
        total: isPremium ? 100 : 5
      }));
    }
  }, [isPremium]);

  // Função para forçar atualização
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
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh storage information",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Calcular porcentagem de uso
  const usagePercentage = localStorageData.total > 0 ? (localStorageData.used / localStorageData.total) * 100 : 0;
  const isNearLimit = usagePercentage > 80;
  const isAtLimit = usagePercentage >= 100;

  const getStorageColor = () => {
    if (isAtLimit) return "red";
    if (isNearLimit) return "orange";
    return "green";
  };


  // Footer com botões
  const footer = (
    <Box w="full">
      <VStack spacing={{ base: 2, sm: 2.5, md: 3 }}>
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
        <ModalButton
          variant="secondary"
          onClick={onClose}
          w="full"
        >
          Close
        </ModalButton>
      </VStack>
    </Box>
  );

  // Loading state
  if (isLoading) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Photo Storage"
        icon={HiCloud}
        size={{ base: "full", sm: "md", md: "lg" }}
      >
        <VStack spacing={{ base: 4, sm: 6 }} align="center" py={{ base: 6, sm: 8 }}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize={{ base: "sm", sm: "md" }}>Loading storage information...</Text>
        </VStack>
      </BaseModal>
    );
  }

  // Error state
  if (isError) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Photo Storage"
        icon={HiCloud}
        size={{ base: "full", sm: "md" }}
      >
        <VStack spacing={{ base: 4, sm: 5 }} align="center" py={{ base: 6, sm: 8 }}>
          <Icon as={HiExclamationTriangle} color="red.500" boxSize={{ base: 6, sm: 8 }} />
          <Text color="red.500" fontSize={{ base: "sm", sm: "md" }}>Failed to load storage information</Text>
          <Text fontSize={{ base: "xs", sm: "sm" }} color="gray.500">{error?.message}</Text>
          <ModalButton
            variant="primary"
            onClick={handleRefresh}
            leftIcon={<Icon as={HiSync} />}
            size={{ base: "md", sm: "lg" }}
          >
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
      <VStack spacing={{ base: 4, sm: 5, md: 6 }} align="stretch">
        {/* Storage Overview */}
        <Box
          textAlign="center"
          p={{ base: 4, sm: 4.5, md: 6 }}
          borderRadius="xl"
          bg={useColorModeValue("gray.50", "black")}
          border="2px solid"
          borderColor={useColorModeValue("gray.500", "white")}
          position="relative"
        >
          <VStack spacing={{ base: 2, sm: 2.5, md: 3 }} position="relative" zIndex={1} w="full">
            {/* Linha superior: ícone + título */}
            <HStack spacing={{ base: 2, sm: 2.5, md: 3 }} align="center">
              <Box
                p={{ base: 2, sm: 2.5, md: 3 }}
                borderRadius="full"
                bg={useColorModeValue("blue.100", "blue.900")}
                color={useColorModeValue("blue.600", "blue.400")}
                boxSize={"48px"}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={HiCloud} boxSize={{ base: "20px", sm: "22px", md: "28px" }} />
              </Box>

              <Text
                fontSize="xl"
                fontWeight="bold"
                color={useColorModeValue("gray.900", "white")}
                letterSpacing="tight"
              >
                Storage Usage
              </Text>
            </HStack>

            {/* Linha inferior: texto de uso */}
            <Text
              fontSize="xs"
              color={useColorModeValue("gray.600", "gray.400")}
              fontWeight="normal"
              textAlign="center"
              maxW="90%"
            >
              {localStorageData.used} GB of {localStorageData.total} GB used
            </Text>
          </VStack>

        </Box>

        {/* Storage Progress */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="semibold" fontSize={"sm"} color={textColor} >
              Storage Used
            </Text>
            <Text fontSize={{ base: "xs", sm: "xs", md: "sm" }} color={useColorModeValue("gray.600", "gray.400")}>
              {usagePercentage.toFixed(1)}%
            </Text>
          </HStack>
          <Progress
            value={usagePercentage}
            colorScheme={getStorageColor()}
            size={{ base: "md", sm: "md", md: "lg" }}
            borderRadius="full"
            bg={useColorModeValue("gray.200", "gray.600")}
          />
          <HStack justify="space-between" mt={2}>
            <Text fontSize={{ base: "xs", sm: "xs", md: "sm" }} color={useColorModeValue("gray.500", "gray.400")}>
              {localStorageData.used} GB used
            </Text>
            <Text fontSize={{ base: "xs", sm: "xs", md: "sm" }} color={useColorModeValue("gray.500", "gray.400")}>
              {Math.max(0, localStorageData.total - localStorageData.used).toFixed(2)} GB free
            </Text>
          </HStack>
        </Box>

        {/* Warning if near limit */}
        {(isNearLimit || isAtLimit) && (
          <Box
            p={{ base: 3, sm: 3.5, md: 4 }}
            borderRadius="lg"
            bg={useColorModeValue("orange.50", "orange.900")}
            border="1px solid"
            borderColor={useColorModeValue("orange.200", "orange.700")}
          >
            <HStack spacing={{ base: 2, sm: 2.5, md: 3 }} align="flex-start">
              <Icon as={HiExclamationTriangle} color="orange.500" boxSize={{ base: 4, sm: 4.5, md: 5 }} flexShrink={0} />
              <Box>
                <Text fontWeight="bold" fontSize={{ base: "sm", sm: "sm", md: "md" }} color={useColorModeValue("orange.700", "orange.200")}>
                  {isAtLimit ? "Storage Full!" : "Storage Almost Full"}
                </Text>
                <Text fontSize={{ base: "xs", sm: "xs", md: "sm" }} color={useColorModeValue("orange.600", "orange.300")}>
                  {isAtLimit
                    ? "You cannot upload more photos. Please upgrade your storage plan."
                    : "Consider upgrading your storage plan to avoid interruptions."
                  }
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        {/* Storage Stats */}
        <VStack spacing={{ base: 3, sm: 3.5, md: 4 }} align="stretch">
          <Box
            p={{ base: 3, sm: 3.5, md: 4 }}
            borderRadius="lg"
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={{ base: 2, sm: 2.5, md: 3 }} mb={1}>
              <Text
                fontWeight="semibold"
                fontSize={{ base: "sm", sm: "sm", md: "sm" }}
                color={textColor}
              >
                Photos Stored
              </Text>
              <Text fontSize={{ base: "md", sm: "md", md: "xl" }} fontWeight="bold" color={textColor} border="1px solid" borderColor={borderColor} p={1} borderRadius="md" >
                {localStorageData.photos}
              </Text>
              <Text fontSize={{ base: "xs", sm: "xs", md: "sm" }} color={useColorModeValue("gray.600", "gray.400")}>
                Total photos in your collection
              </Text>
            </HStack>
          </Box>

          {/* Storage Plans */}
          <Box
            p={{ base: 3, sm: 3.5, md: 4 }}
            borderRadius="lg"
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <Text fontWeight="semibold" fontSize={{ base: "sm", sm: "sm", md: "md" }} color={textColor} mb={{ base: 2, sm: 2.5, md: 3 }}>
              Storage Plans
            </Text>
            <VStack spacing={{ base: 2, sm: 2.5, md: 3 }} align="stretch">
              <HStack justify="space-between" p={{ base: 2, sm: 2.5, md: 3 }} borderRadius="md" bg={useColorModeValue("yellow.50", "yellow.500")} border="1px solid" borderColor={borderColor}>
                <Text fontSize={{ base: "xs", sm: "xs", md: "sm" }} color={textColor}>Free Plan</Text>
                <Badge colorScheme="gray" variant="subtle" fontSize={{ base: "2xs", sm: "2xs", md: "xs" }}>5 GB</Badge>
              </HStack>
              <HStack justify="space-between" p={{ base: 2, sm: 2.5, md: 3 }} borderRadius="md" bg={useColorModeValue("yellow.50", "yellow.500")} border="1px solid" borderColor={useColorModeValue("yellow.200", "yellow.700")}>
                <Text fontSize={{ base: "xs", sm: "xs", md: "sm" }} color={textColor}>Premium Plan</Text>
                <Badge colorScheme="yellow" variant="solid" fontSize={{ base: "2xs", sm: "2xs", md: "xs" }}>100 GB</Badge>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </BaseModal>
  );
};

export default PhotoStorageModal;
