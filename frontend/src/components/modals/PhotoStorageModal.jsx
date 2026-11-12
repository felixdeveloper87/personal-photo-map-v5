import { useContext, useEffect, useState } from 'react';
import { Box, HStack, SimpleGrid, Text, VStack, useToast } from '@chakra-ui/react';
import { HiArrowPath, HiCloudArrowUp, HiPhoto, HiSparkles } from 'react-icons/hi2';
import { useQuery } from '@tanstack/react-query';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { ModalActions, ModalNotice, ModalStat, ModalState, Panel, ToneBadge, ToneProgress } from './ModalKit';
import { AuthContext } from '../../context/AuthContext';
import { CountriesContext } from '../../context/CountriesContext';
import { buildApiUrl } from '../../utils/apiConfig';
import { color, resolveTone, type } from '../../design/tokens';

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
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const photos = await res.json();
          usedBytes = photos.length * 2 * 1024 * 1024;
        }
      } catch {
        /* network error — keep 0 */
      }

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

const PhotoStorageModal = ({ isOpen, onClose, onUpgrade }) => {
  const toast = useToast();
  const { isPremium } = useContext(AuthContext);
  const { photoCount, refreshCountriesWithPhotos } = useContext(CountriesContext);

  const { data: storageData, isLoading, isError, error, refetch, isFetching } = useStorageInfo();

  const [local, setLocal] = useState({ used: 0, total: 5, photos: 0, isPremium: false });

  useEffect(() => {
    if (storageData) setLocal((p) => ({ ...p, used: storageData.used, total: storageData.total }));
  }, [storageData]);
  useEffect(() => {
    if (photoCount !== undefined) setLocal((p) => ({ ...p, photos: photoCount }));
  }, [photoCount]);
  useEffect(() => {
    if (isPremium !== undefined) setLocal((p) => ({ ...p, isPremium, total: isPremium ? 100 : 5 }));
  }, [isPremium]);

  const pct = local.total > 0 ? (local.used / local.total) * 100 : 0;
  const isNear = pct > 80;
  const isAt = pct >= 100;
  const usageTone = isAt ? 'danger' : isNear ? 'warning' : 'teal';

  const handleRefresh = async () => {
    try {
      await refetch();
      await refreshCountriesWithPhotos();
      toast({ title: 'Storage refreshed', status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: 'Refresh failed', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const shell = {
    isOpen,
    onClose,
    eyebrow: 'Account',
    title: 'Photo storage',
    icon: HiCloudArrowUp,
    tone: 'teal',
    size: { base: 'full', sm: 'md', md: 'lg' },
  };

  if (isLoading) {
    return (
      <BaseModal {...shell}>
        <ModalState kind="loading" title="Loading storage…" />
      </BaseModal>
    );
  }

  if (isError) {
    return (
      <BaseModal {...shell}>
        <ModalState
          kind="error"
          title="Couldn't load storage"
          action={
            <ModalButton variant="secondary" onClick={handleRefresh} leftIcon={<HiArrowPath />} isLoading={isFetching}>
              Retry
            </ModalButton>
          }
        >
          {error?.message || 'Failed to load storage'}
        </ModalState>
      </BaseModal>
    );
  }

  const footer = (
    <ModalActions>
      <ModalButton variant="secondary" onClick={handleRefresh} leftIcon={<HiArrowPath />} isLoading={isFetching}>
        Refresh
      </ModalButton>
      {local.isPremium ? (
        <ModalButton variant="primary" onClick={onClose}>
          Done
        </ModalButton>
      ) : (
        <ModalButton variant="primary" onClick={onUpgrade} leftIcon={<HiSparkles />}>
          Upgrade storage
        </ModalButton>
      )}
    </ModalActions>
  );

  return (
    <BaseModal {...shell} footer={footer}>
      <VStack spacing={4} align="stretch">
        <Panel p={5}>
          <HStack justify="space-between" align="flex-start" mb={4}>
            <Box>
              <Text {...type.label} color={color.textMuted} mb={2}>
                Storage used
              </Text>
              <Text {...type.data} fontSize={{ base: '2xl', sm: '3xl' }} color={color.text}>
                {local.used}
                <Text as="span" fontSize="md" color={color.textSoft} fontWeight="500">
                  {' '}
                  / {local.total} GB
                </Text>
              </Text>
            </Box>
            <ToneBadge tone={local.isPremium ? 'brand' : 'neutral'}>{local.isPremium ? 'Premium' : 'Free plan'}</ToneBadge>
          </HStack>

          <ToneProgress value={pct} tone={usageTone} h="8px" />

          <HStack justify="space-between" mt={2.5}>
            <Text {...type.label} color={resolveTone(usageTone).fg}>
              {pct.toFixed(1)}% used
            </Text>
            <Text {...type.label} color={color.textMuted}>
              {Math.max(0, local.total - local.used).toFixed(2)} GB free
            </Text>
          </HStack>
        </Panel>

        <SimpleGrid columns={2} spacing={3}>
          <ModalStat icon={HiPhoto} value={local.photos} label="Photos" tone="teal" />
          <ModalStat icon={HiCloudArrowUp} value={local.isPremium ? 'Premium' : 'Free'} label="Plan" tone="brand" />
        </SimpleGrid>

        {(isNear || isAt) && (
          <ModalNotice tone={isAt ? 'danger' : 'warning'} title={isAt ? 'Storage full' : 'Almost full'}>
            {isAt ? 'Upgrade your plan to continue uploading photos.' : 'Consider upgrading before you run out of space.'}
          </ModalNotice>
        )}
      </VStack>
    </BaseModal>
  );
};

export default PhotoStorageModal;
