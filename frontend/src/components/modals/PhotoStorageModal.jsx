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
import { FaCloud, FaUpload, FaDownload, FaTrash, FaExclamationTriangle, FaSync } from "react-icons/fa";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";
import { AuthContext } from "../../context/AuthContext";
import { CountriesContext } from "../../context/CountriesContext";
import { buildApiUrl } from "../../utils/apiConfig";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
      const storageResponse = await fetch(buildApiUrl('/api/images/storage-usage'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let storageData = { usedBytes: 0 };
      if (storageResponse.ok) {
        storageData = await storageResponse.json();
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
const PhotoStorageModal = ({ isOpen, onClose, storageInfo, onUpgrade }) => {
  const textColor = useColorModeValue("gray.700", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const toast = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Formatar tamanho de arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Footer com botões
  const footer = (
    <Box w="full">
      <VStack spacing={3}>
        {!localStorageData.isPremium && (
          <ModalButton
            variant="primary"
            onClick={onUpgrade}
            leftIcon={<FaCloud />}
            w="full"
          >
            Upgrade Storage
          </ModalButton>
        )}
        <ModalButton
          variant="secondary"
          onClick={handleRefresh}
          leftIcon={<FaSync />}
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
        icon={FaCloud}
        size="md"
      >
        <VStack spacing={6} align="center" py={8}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading storage information...</Text>
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
        icon={FaCloud}
        size="md"
      >
        <VStack spacing={6} align="center" py={8}>
          <Icon as={FaExclamationTriangle} color="red.500" boxSize={8} />
          <Text color="red.500">Failed to load storage information</Text>
          <Text fontSize="sm" color="gray.500">{error?.message}</Text>
          <ModalButton
            variant="primary"
            onClick={handleRefresh}
            leftIcon={<FaSync />}
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
      icon={FaCloud}
      footer={footer}
      size="md"
    >
      <VStack spacing={6} align="stretch">
        {/* Storage Overview */}
        <Box
          p={6}
          borderRadius="xl"
          bg={useColorModeValue("blue.50", "blue.900")}
          border="1px solid"
          borderColor={useColorModeValue("blue.200", "blue.700")}
          textAlign="center"
        >
          <Box
            p={3}
            borderRadius="full"
            bg={useColorModeValue("blue.500", "blue.400")}
            color="white"
            w="fit-content"
            mx="auto"
            mb={3}
          >
            <FaCloud size={24} />
          </Box>
          <Text fontSize="xl" fontWeight="bold" color={textColor} mb={2}>
            Storage Usage
          </Text>
          <Text fontSize="md" color={useColorModeValue("gray.600", "gray.300")}>
            {localStorageData.used} GB of {localStorageData.total} GB used
          </Text>
          <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} mt={1}>
            Raw size: {formatFileSize(localStorageData.usedBytes)}
          </Text>
        </Box>

        {/* Storage Progress */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="semibold" color={textColor}>
              Storage Used
            </Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              {usagePercentage.toFixed(1)}%
            </Text>
          </HStack>
          <Progress
            value={usagePercentage}
            colorScheme={getStorageColor()}
            size="lg"
            borderRadius="full"
            bg={useColorModeValue("gray.200", "gray.600")}
          />
          <HStack justify="space-between" mt={2}>
            <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
              {localStorageData.used} GB used
            </Text>
            <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
              {Math.max(0, localStorageData.total - localStorageData.used).toFixed(2)} GB free
            </Text>
          </HStack>
        </Box>

        {/* Warning if near limit */}
        {(isNearLimit || isAtLimit) && (
          <Box
            p={4}
            borderRadius="lg"
            bg={useColorModeValue("orange.50", "orange.900")}
            border="1px solid"
            borderColor={useColorModeValue("orange.200", "orange.700")}
          >
            <HStack spacing={3}>
              <Icon as={FaExclamationTriangle} color="orange.500" />
              <Box>
                <Text fontWeight="bold" color={useColorModeValue("orange.700", "orange.200")}>
                  {isAtLimit ? "Storage Full!" : "Storage Almost Full"}
                </Text>
                <Text fontSize="sm" color={useColorModeValue("orange.600", "orange.300")}>
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
        <VStack spacing={4} align="stretch">
          <Box
            p={4}
            borderRadius="lg"
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3} mb={2}>
              <Box
                p={2}
                borderRadius="md"
                bg={useColorModeValue("purple.100", "purple.900")}
                color={useColorModeValue("purple.600", "purple.300")}
              >
                <FaUpload size={16} />
              </Box>
              <Text fontWeight="semibold" color={textColor}>
                Photos Stored
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              {localStorageData.photos}
            </Text>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
              Total photos in your collection
            </Text>
            {storageData?.lastUpdated && (
              <Text fontSize="xs" color={useColorModeValue("gray.500", "gray.400")} mt={2}>
                Last updated: {new Date(storageData.lastUpdated).toLocaleTimeString()}
              </Text>
            )}
          </Box>

          {/* Storage Plans */}
          <Box
            p={4}
            borderRadius="lg"
            bg={bgColor}
            border="1px solid"
            borderColor={borderColor}
          >
            <Text fontWeight="semibold" color={textColor} mb={3}>
              Storage Plans
            </Text>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between" p={3} borderRadius="md" bg="white" border="1px solid" borderColor={borderColor}>
                <Text fontSize="sm" color={textColor}>Free Plan</Text>
                <Badge colorScheme="gray" variant="subtle">5 GB</Badge>
              </HStack>
              <HStack justify="space-between" p={3} borderRadius="md" bg={useColorModeValue("yellow.50", "yellow.900")} border="1px solid" borderColor={useColorModeValue("yellow.200", "yellow.700")}>
                <Text fontSize="sm" color={textColor}>Premium Plan</Text>
                <Badge colorScheme="yellow" variant="solid">100 GB</Badge>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </VStack>
    </BaseModal>
  );
};

export default PhotoStorageModal;
