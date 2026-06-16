import React, { useContext, useEffect, useState } from "react";
import {
  Box, Text, VStack, HStack, Icon, Spinner
} from "@chakra-ui/react";
import {
  HiCloudArrowUp as HiCloud,
  HiExclamationTriangle,
  HiArrowPath as HiSync,
  HiPhoto,
} from "react-icons/hi2";
import BaseModal from "./BaseModal";
import ModalButton from "./ModalButton";
import { AuthContext } from "../../context/AuthContext";
import { CountriesContext } from "../../context/CountriesContext";
import { buildApiUrl } from "../../utils/apiConfig";
import { useQuery } from "@tanstack/react-query";
import { useLandingTokens } from "../features/landing/landingUI";
import { useToast } from "@chakra-ui/react";

const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";

const useStorageInfo = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return useQuery({
    queryKey: ['storage-usage'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');

      let usedBytes = 0;
      try {
        const res = await fetch(buildApiUrl('/api/images/allPictures'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const photos = await res.json();
          usedBytes = photos.length * 2 * 1024 * 1024;
        }
      } catch { /* network error — keep 0 */ }

      const usedGB = usedBytes / (1024 * 1024 * 1024);
      const isPremium = localStorage.getItem('premium') === 'true';
      const totalGB = isPremium ? 100 : 5;

      return {
        used: parseFloat(usedGB.toFixed(2)),
        total: totalGB,
        usedBytes,
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled: isLoggedIn,
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 3,
    retryDelay: 1000,
  });
};

const StorageBar = ({ pct, isNear, isAt }) => {
  const fillColor = isAt ? '#E58A7B' : isNear ? '#EBB572' : '#6FD0C4';
  const bgColor = isAt
    ? 'rgba(229,138,123,0.12)'
    : isNear
    ? 'rgba(235,181,114,0.12)'
    : 'rgba(111,208,196,0.12)';

  return (
    <Box w="full" h="8px" borderRadius="full" bg={bgColor} overflow="hidden">
      <Box
        h="full"
        w={`${Math.min(pct, 100)}%`}
        borderRadius="full"
        bg={fillColor}
        boxShadow={`0 0 8px ${fillColor}66`}
        transition="width .6s ease"
      />
    </Box>
  );
};

const Stat = ({ label, value, icon, t }) => (
  <Box
    flex={1}
    p={4}
    borderRadius="14px"
    bg={t.surface}
    border="1px solid"
    borderColor={t.hairline}
    textAlign="center"
    transition="border-color .2s, transform .2s"
    _hover={{ borderColor: t.hairlineStrong, transform: 'translateY(-2px)' }}
  >
    <Icon as={icon} boxSize={5} color={t.primary} mb={2} />
    <Text fontFamily={MONO} fontSize="20px" fontWeight="700" color={t.text} lineHeight="1">
      {value}
    </Text>
    <Text fontFamily={MONO} fontSize="10px" color={t.textMuted} letterSpacing="0.08em" mt={1} textTransform="uppercase">
      {label}
    </Text>
  </Box>
);

const PhotoStorageModal = ({ isOpen, onClose, onUpgrade }) => {
  const t = useLandingTokens();
  const toast = useToast();
  const { isLoggedIn, isPremium } = useContext(AuthContext);
  const { photoCount, refreshCountriesWithPhotos } = useContext(CountriesContext);

  const { data: storageData, isLoading, isError, error, refetch } = useStorageInfo();

  const [local, setLocal] = useState({ used: 0, total: 5, photos: 0, isPremium: false });

  useEffect(() => { if (storageData) setLocal(p => ({ ...p, used: storageData.used, total: storageData.total })); }, [storageData]);
  useEffect(() => { if (photoCount !== undefined) setLocal(p => ({ ...p, photos: photoCount })); }, [photoCount]);
  useEffect(() => { if (isPremium !== undefined) setLocal(p => ({ ...p, isPremium, total: isPremium ? 100 : 5 })); }, [isPremium]);

  const pct = local.total > 0 ? (local.used / local.total) * 100 : 0;
  const isNear = pct > 80;
  const isAt = pct >= 100;

  const handleRefresh = async () => {
    try {
      await refetch();
      await refreshCountriesWithPhotos();
      toast({ title: 'Storage refreshed', status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: 'Refresh failed', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const footer = (
    <VStack spacing={2} w="full">
      {!local.isPremium && (
        <ModalButton variant="primary" onClick={onUpgrade} leftIcon={<Icon as={HiCloud} />} w="full">
          Upgrade Storage
        </ModalButton>
      )}
      <ModalButton variant="secondary" onClick={handleRefresh} leftIcon={<Icon as={HiSync} />} w="full" isLoading={isLoading}>
        Refresh
      </ModalButton>
      <ModalButton variant="secondary" onClick={onClose} w="full">
        Close
      </ModalButton>
    </VStack>
  );

  if (isLoading) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Photo Storage" icon={HiCloud}>
        <VStack py={10} spacing={4}>
          <Spinner size="xl" color={t.primary} thickness="3px" />
          <Text fontFamily={MONO} fontSize="12px" color={t.textMuted} letterSpacing="0.06em">
            Loading storage…
          </Text>
        </VStack>
      </BaseModal>
    );
  }

  if (isError) {
    return (
      <BaseModal isOpen={isOpen} onClose={onClose} title="Photo Storage" icon={HiCloud}>
        <VStack py={10} spacing={4}>
          <Box p={3} borderRadius="full" bg="rgba(229,138,123,0.12)" border="1px solid rgba(229,138,123,0.32)">
            <Icon as={HiExclamationTriangle} color="#E58A7B" boxSize={7} />
          </Box>
          <Text fontFamily={MONO} fontSize="12px" color="#E58A7B">{error?.message || 'Failed to load storage'}</Text>
          <ModalButton variant="primary" onClick={handleRefresh} leftIcon={<Icon as={HiSync} />}>
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

        {/* Cloud hero */}
        <Box
          p={6}
          borderRadius="16px"
          bg={t.surface}
          border="1px solid"
          borderColor={t.hairline}
          textAlign="center"
        >
          <Box
            display="inline-flex"
            p={3}
            borderRadius="full"
            bg={t.accentSoftBg}
            border="1px solid rgba(111,208,196,0.28)"
            mb={3}
          >
            <Icon as={HiCloud} boxSize={7} color={t.accent} />
          </Box>
          <Text fontFamily={MONO} fontSize="11px" color={t.textMuted} letterSpacing="0.10em" textTransform="uppercase" mb={1}>
            Storage Usage
          </Text>
          <Text fontFamily={MONO} fontSize="28px" fontWeight="700" color={t.text} lineHeight="1">
            {local.used}
            <Text as="span" fontSize="16px" color={t.textSoft}> / {local.total} GB</Text>
          </Text>
          {local.isPremium && (
            <Box
              display="inline-block"
              mt={2}
              px={3}
              py={1}
              borderRadius="full"
              bg="rgba(235,181,114,0.12)"
              border="1px solid rgba(235,181,114,0.28)"
            >
              <Text fontFamily={MONO} fontSize="10px" fontWeight="700" color={t.primary} letterSpacing="0.10em">
                PREMIUM · 100 GB
              </Text>
            </Box>
          )}
        </Box>

        {/* Progress bar */}
        <Box p={4} borderRadius="14px" bg={t.surface} border="1px solid" borderColor={t.hairline}>
          <HStack justify="space-between" mb={3}>
            <Text fontFamily={MONO} fontSize="11px" color={t.textMuted} textTransform="uppercase" letterSpacing="0.08em">
              Used
            </Text>
            <Text fontFamily={MONO} fontSize="13px" fontWeight="700" color={isAt ? '#E58A7B' : isNear ? t.primary : t.accent}>
              {pct.toFixed(1)}%
            </Text>
          </HStack>
          <StorageBar pct={pct} isNear={isNear} isAt={isAt} />
          <HStack justify="space-between" mt={2}>
            <Text fontFamily={MONO} fontSize="10px" color={t.textMuted}>{local.used} GB used</Text>
            <Text fontFamily={MONO} fontSize="10px" color={t.textMuted}>{(local.total - local.used).toFixed(2)} GB free</Text>
          </HStack>
        </Box>

        {/* Stats */}
        <HStack spacing={3}>
          <Stat label="Photos" value={local.photos} icon={HiPhoto} t={t} />
          <Stat label="Plan" value={local.isPremium ? 'Premium' : 'Free'} icon={HiCloud} t={t} />
        </HStack>

        {/* Warning */}
        {(isNear || isAt) && (
          <Box
            p={4}
            borderRadius="14px"
            bg="rgba(229,138,123,0.08)"
            border="1px solid rgba(229,138,123,0.32)"
          >
            <HStack spacing={3}>
              <Icon as={HiExclamationTriangle} color="#E58A7B" boxSize={5} flexShrink={0} />
              <Box>
                <Text fontFamily={MONO} fontSize="12px" fontWeight="700" color="#E58A7B" mb={0.5}>
                  {isAt ? 'Storage Full' : 'Almost Full'}
                </Text>
                <Text fontFamily={MONO} fontSize="11px" color="rgba(229,138,123,0.80)">
                  {isAt
                    ? 'Upgrade your plan to continue uploading photos.'
                    : 'Consider upgrading before you run out of space.'}
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

      </VStack>
    </BaseModal>
  );
};

export default PhotoStorageModal;
