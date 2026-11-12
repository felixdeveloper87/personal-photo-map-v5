// frontend/src/components/modals/EnhancedImageUploaderModal.jsx
import { useState, useContext, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Collapse,
  HStack,
  Icon,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  HiCalendarDays,
  HiCheckCircle,
  HiChevronDown,
  HiCloudArrowUp,
  HiMapPin,
  HiPhoto,
  HiSparkles,
  HiXCircle,
} from 'react-icons/hi2';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { Chip, ModalActions, ModalNotice, ModalSection, Panel, Segmented, ToneBadge, ToneProgress } from './ModalKit';
import { CountriesContext } from '../../context/CountriesContext';
import { buildApiUrl } from '../../utils/apiConfig';
import { extractPhotoMetadata as extractMetadata } from '../../utils/photoMetadataExtractor';
import { color, font, radius, tones, type } from '../../design/tokens';

const CURRENT_YEAR = new Date().getFullYear();
const RECENT_YEARS = Array.from({ length: 16 }, (_, i) => CURRENT_YEAR - i);
const MIN_YEAR = 1900;
const MAX_FILES = 20;

/** Numbered step marker + title. */
const Step = ({ index, title, children }) => (
  <Box>
    <HStack spacing={3} mb={3}>
      <Box
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        w="26px"
        h="26px"
        borderRadius="full"
        border="1px solid"
        borderColor={color.primarySoftBorder}
        bg={color.primarySoftBg}
        color={color.primary}
        fontFamily={font.mono}
        fontSize="12px"
        fontWeight="700"
        flexShrink={0}
      >
        {index}
      </Box>
      <Text fontSize="md" fontWeight="700" color={color.text}>
        {title}
      </Text>
    </HStack>
    {children}
  </Box>
);

const EnhancedImageUploaderModal = ({ isOpen, onClose, onUploadSuccess, countryId }) => {
  const toast = useToast();
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);
  const { isOpen: isAutoDetailsOpen, onToggle: onAutoDetailsToggle } = useDisclosure();
  const fileInputRef = useRef(null);

  // Files & EXIF
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [photoMetadata, setPhotoMetadata] = useState({}); // { [file.name]: { year, date, hasGPS, original } }
  const [isLoading, setIsLoading] = useState(false);
  const [fileProgress, setFileProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // Year strategy: 'auto' (per-photo EXIF) | 'manual' (one year for all)
  const [yearStrategy, setYearStrategy] = useState('auto');
  const [manualYear, setManualYear] = useState('');

  // Thumbnails: one object URL per file, revoked when the selection changes or the modal unmounts.
  const previews = useMemo(() => selectedFiles.map((f) => URL.createObjectURL(f)), [selectedFiles]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  // ----- helpers -----
  const showToast = useCallback(
    (title, description, status = 'info') => {
      toast({ title, description, status, duration: 3500, isClosable: true });
    },
    [toast]
  );

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      return {};
    }
    return { Authorization: `Bearer ${token}` }; // Do not set Content-Type with FormData
  };

  const extractPhotoMetadata = async (file) => {
    try {
      const metadata = await extractMetadata(file);
      return {
        year: metadata.year,
        date: metadata.photoDate,
        hasGPS: metadata.hasGPS,
        original: metadata.originalExif,
      };
    } catch (error) {
      console.error('Erro ao extrair metadados:', error);
      const fileDate = new Date(file.lastModified);
      return {
        year: fileDate.getFullYear(),
        date: fileDate.toISOString(),
        hasGPS: false,
        original: null,
      };
    }
  };

  const readAllExif = async (files) => {
    const meta = {};
    for (const f of files) {
      meta[f.name] = await extractPhotoMetadata(f);
    }
    return meta;
  };

  const asInt = (v) => {
    const n = typeof v === 'string' ? parseInt(v, 10) : v;
    return Number.isNaN(n) ? null : n;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalFileSize = selectedFiles.reduce((total, file) => total + file.size, 0);

  // ----- derived -----
  const detectedYears = useMemo(() => {
    if (selectedFiles.length === 0) return [];
    return selectedFiles.map((f) => photoMetadata[f.name]?.year).filter((y) => y != null && !Number.isNaN(y));
  }, [selectedFiles, photoMetadata]);

  const uniqueYears = useMemo(() => Array.from(new Set(detectedYears)).sort((a, b) => b - a), [detectedYears]);

  const hasMultipleYears = uniqueYears.length > 1;

  const mostCommonYear = useMemo(() => {
    if (detectedYears.length === 0) return null;
    const counts = detectedYears.reduce((acc, y) => {
      acc[y] = (acc[y] || 0) + 1;
      return acc;
    }, {});
    return parseInt(Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0], 10);
  }, [detectedYears]);

  const groupedFilesByYear = useMemo(() => {
    if (selectedFiles.length === 0) return {};
    const groups = {};
    for (const f of selectedFiles) {
      const y = photoMetadata[f.name]?.year ?? CURRENT_YEAR;
      groups[y] = groups[y] || [];
      groups[y].push(f);
    }
    return groups;
  }, [selectedFiles, photoMetadata]);

  const effectiveManualYear = useMemo(() => {
    const y = asInt(manualYear);
    if (!y) return null;
    if (y < MIN_YEAR || y > CURRENT_YEAR) return null;
    return y;
  }, [manualYear]);

  const uploadSummaryText = useMemo(() => {
    if (selectedFiles.length === 0) return 'No photos selected yet';
    if (yearStrategy === 'manual') {
      return effectiveManualYear ? `Year ${effectiveManualYear} for all photos` : 'Pick a valid year to continue';
    }
    if (hasMultipleYears) return `Grouped by year: ${uniqueYears.join(', ')}`;
    if (detectedYears.length > 0) return `Year ${detectedYears[0]} (auto-detected)`;
    return `Year ${CURRENT_YEAR} (no EXIF found)`;
  }, [selectedFiles.length, yearStrategy, effectiveManualYear, hasMultipleYears, uniqueYears, detectedYears]);

  const resetState = () => {
    setSelectedFiles([]);
    setPhotoMetadata({});
    setFileProgress({});
    setUploadResults([]);
    setYearStrategy('auto');
    setManualYear('');
  };

  // ----- handlers -----
  const handleFiles = async (incoming) => {
    if (incoming.length === 0) return;

    const valid = incoming.filter((f) => f.type?.startsWith('image/'));
    if (valid.length !== incoming.length) {
      showToast('Some files were ignored', 'Only image files are allowed.', 'warning');
    }
    if (valid.length === 0) return;

    // Limit number of files to prevent memory issues on low memory VPS
    if (valid.length > MAX_FILES) {
      showToast('Too many files', `Please select no more than ${MAX_FILES} photos at once for better performance.`, 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const meta = await readAllExif(valid);
      setSelectedFiles(valid);
      setPhotoMetadata(meta);
      setYearStrategy('auto');
      setManualYear('');
      setFileProgress({});
      setUploadResults([]);
      showToast('Photos analyzed', `${valid.length} photo(s) ready to upload.`, 'success');
    } catch {
      showToast('Analysis error', 'Could not read photo metadata.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    handleFiles(Array.from(event.target.files || []));
    // Allow re-selecting the same files after a reset.
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    handleFiles(Array.from(event.dataTransfer?.files || []));
  };

  const uploadPhotosWithYear = async (files, year) => {
    if (!countryId) {
      throw new Error('Please select a country before uploading.');
    }

    const token = localStorage.getItem('token');
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      throw new Error('You must be logged in to upload photos.');
    }

    const initialProgress = {};
    files.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setFileProgress((prev) => ({ ...prev, ...initialProgress }));

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('year', year);
    formData.append('countryId', countryId);

    const uploadUrl = buildApiUrl('/api/images/upload');

    // Simulated progress (fetch doesn't expose upload progress)
    const progressInterval = setInterval(() => {
      setFileProgress((prev) => {
        const newProgress = { ...prev };
        files.forEach((file) => {
          if (newProgress[file.name] < 90) {
            newProgress[file.name] = Math.min(newProgress[file.name] + Math.random() * 10, 90);
          }
        });
        return newProgress;
      });
    }, 300);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout for low memory VPS

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 403) {
          throw new Error('Access denied. Please log in and try again.');
        }
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const uploadedUrls = result.imageUrls || [];

      const successful = uploadedUrls.length;
      const failed = files.length - successful;

      setFileProgress((prev) => {
        const newProgress = { ...prev };
        files.forEach((file, index) => {
          newProgress[file.name] = index < successful ? 100 : 0;
        });
        return newProgress;
      });

      const results = files.map((file, index) => ({
        fileName: file.name,
        status: index < successful ? 'success' : 'error',
        message: index < successful ? 'Upload successful' : 'Upload failed - file not processed',
        imageUrl: index < successful ? uploadedUrls[index] : null,
      }));

      return { successful, failed, results };
    } catch (error) {
      clearInterval(progressInterval);

      setFileProgress((prev) => {
        const newProgress = { ...prev };
        files.forEach((file) => {
          newProgress[file.name] = 0;
        });
        return newProgress;
      });

      let errorMessage = 'Upload failed';
      if (error.name === 'AbortError') {
        errorMessage = 'Upload timeout - please try with fewer photos or smaller file sizes';
      } else if (error.message) {
        errorMessage = error.message;
      }

      const results = files.map((file) => ({
        fileName: file.name,
        status: 'error',
        message: errorMessage,
        imageUrl: null,
      }));

      return { successful: 0, failed: files.length, results };
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    if (!countryId) {
      showToast('Country required', 'Please select a country before uploading.', 'warning');
      return;
    }

    setIsLoading(true);
    setIsUploading(true);

    let totalUploaded = 0;
    let totalFailed = 0;
    const results = [];

    try {
      if (yearStrategy === 'manual') {
        if (!effectiveManualYear) {
          throw new Error('Provide a valid year (1900—current).');
        }
        const result = await uploadPhotosWithYear(selectedFiles, effectiveManualYear);
        totalUploaded = result.successful;
        totalFailed = result.failed;
        results.push(...result.results);
      } else {
        const entries = Object.entries(groupedFilesByYear);
        const settled = await Promise.allSettled(entries.map(([y, files]) => uploadPhotosWithYear(files, parseInt(y, 10))));

        settled.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            totalUploaded += result.value.successful;
            totalFailed += result.value.failed;
            results.push(...result.value.results);
          } else {
            const yearFiles = entries[index][1];
            totalFailed += yearFiles.length;
            results.push(
              ...yearFiles.map((file) => ({
                fileName: file.name,
                status: 'error',
                message: result.reason?.message || 'Upload failed',
              }))
            );
          }
        });
      }

      setUploadResults(results);

      if (totalUploaded > 0) {
        await refreshCountriesWithPhotos();
        onUploadSuccess?.();
      }

      if (totalFailed === 0) {
        showToast('Upload complete', `${totalUploaded} photo(s) uploaded successfully.`, 'success');
        resetState();
        onClose();
      } else if (totalUploaded > 0) {
        showToast('Upload completed with errors', `${totalUploaded} photo(s) uploaded successfully, ${totalFailed} failed.`, 'warning');
      } else {
        showToast('Upload failed', 'No photos were uploaded successfully.', 'error');
      }
    } catch (error) {
      showToast('Upload error', error?.message || 'Try again.', 'error');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setYearStrategy('auto');
    setManualYear('');
    setFileProgress({});
    setUploadResults([]);
    setIsUploading(false);
    onClose();
  };

  const quickPickYears = Array.from(new Set([...(uniqueYears || []), ...RECENT_YEARS])).slice(0, 16);
  const hasFiles = selectedFiles.length > 0;

  const uploadLabel = (() => {
    if (isUploading) return `Uploading ${selectedFiles.length}…`;
    if (!hasFiles) return 'Upload photos';
    if (yearStrategy === 'manual' && !effectiveManualYear) return 'Pick a year';
    return `Upload ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}`;
  })();

  const footer = (
    <VStack spacing={3} w="full" align="stretch">
      <HStack spacing={2} color={color.textMuted} justify={{ base: 'center', sm: 'flex-start' }}>
        <Icon as={HiCalendarDays} boxSize={3.5} />
        <Text fontSize="xs">{uploadSummaryText}</Text>
      </HStack>
      <ModalActions>
        <ModalButton variant="secondary" onClick={handleClose} isDisabled={isUploading}>
          Cancel
        </ModalButton>
        <ModalButton
          variant="primary"
          onClick={handleUpload}
          isLoading={isUploading}
          loadingText={uploadLabel}
          leftIcon={<HiCloudArrowUp />}
          isDisabled={!hasFiles || !countryId || (yearStrategy === 'manual' && !effectiveManualYear)}
        >
          {uploadLabel}
        </ModalButton>
      </ModalActions>
    </VStack>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      eyebrow="Add to your map"
      title="Upload photos"
      icon={HiCloudArrowUp}
      size={{ base: 'full', sm: 'xl', lg: '2xl' }}
      closeOnOverlayClick={!isUploading}
      footer={footer}
    >
      <VStack spacing={7} align="stretch">
        {/* STEP 1 – Files */}
        <Step index={1} title="Choose your photos">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <Box
            as="label"
            htmlFor="photo-upload"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            minH={hasFiles ? '96px' : '168px'}
            px={4}
            py={5}
            borderRadius={radius.lg}
            border="1.5px dashed"
            borderColor={isDragging ? color.primary : color.hairlineMid}
            bg={isDragging ? color.primarySoftBg : 'rgba(236,231,220,0.02)'}
            cursor={isLoading || isUploading ? 'progress' : 'pointer'}
            textAlign="center"
            transition="all .2s ease"
            _hover={{ borderColor: color.primarySoftBorder, bg: color.primarySoftBg }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            _focusVisible={{ outline: 'none', boxShadow: `0 0 0 3px ${color.focusRing}` }}
          >
            <Box
              display="inline-flex"
              p={hasFiles ? 2 : 3}
              borderRadius="full"
              bg={color.primarySoftBg}
              border="1px solid"
              borderColor={color.primarySoftBorder}
              color={color.primary}
            >
              <Icon as={isLoading ? HiSparkles : HiCloudArrowUp} boxSize={hasFiles ? 5 : 6} />
            </Box>
            <Text fontSize="sm" fontWeight="600" color={color.text}>
              {isLoading && !isUploading
                ? 'Reading photo details…'
                : hasFiles
                ? `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} selected · choose again`
                : 'Drop photos here or click to browse'}
            </Text>
            {!hasFiles && (
              <Text fontSize="xs" color={color.textMuted}>
                Up to {MAX_FILES} photos at once · 3–5 per batch uploads fastest
              </Text>
            )}
          </Box>
        </Step>

        {/* Selected previews */}
        {hasFiles && (
          <ModalSection
            title={`Selected · ${selectedFiles.length}`}
            action={
              <Text {...type.label} color={color.textMuted}>
                {formatFileSize(totalFileSize)}
              </Text>
            }
          >
            <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacing={2.5} maxH="300px" overflowY="auto" pr={1}>
              {selectedFiles.map((file, idx) => {
                const meta = photoMetadata[file.name];
                const progress = fileProgress[file.name];
                return (
                  <Box key={`${file.name}-${idx}`} position="relative" borderRadius={radius.md} overflow="hidden" border="1px solid" borderColor={color.hairline} bg={color.surfaceSubtle}>
                    <Image src={previews[idx]} alt={file.name} w="full" h="84px" objectFit="cover" />
                    <HStack position="absolute" top={1.5} left={1.5} spacing={1}>
                      {meta?.year && (
                        <Box px={1.5} py={0.5} borderRadius="6px" bg="rgba(5,7,11,0.78)" color={color.text} {...type.label} fontSize="9px">
                          {meta.year}
                        </Box>
                      )}
                      {meta?.hasGPS && (
                        <Box px={1} py={0.5} borderRadius="6px" bg="rgba(5,7,11,0.78)" color={tones.teal.fg} display="inline-flex">
                          <Icon as={HiMapPin} boxSize={2.5} />
                        </Box>
                      )}
                    </HStack>
                    <Box px={2} py={1.5}>
                      <Text fontSize="10px" color={color.textSoft} noOfLines={1}>
                        {file.name}
                      </Text>
                      {isUploading && progress !== undefined && <ToneProgress value={progress} h="3px" mt={1.5} />}
                    </Box>
                  </Box>
                );
              })}
            </SimpleGrid>
          </ModalSection>
        )}

        {/* Upload results */}
        {uploadResults.length > 0 && (
          <ModalSection title="Upload results">
            <VStack spacing={1.5} align="stretch" maxH="200px" overflowY="auto">
              {uploadResults.map((result, index) => {
                const ok = result.status === 'success';
                return (
                  <HStack
                    key={`${result.fileName}-${index}`}
                    justify="space-between"
                    px={3}
                    py={2}
                    borderRadius={radius.md}
                    bg={ok ? tones.success.softer : tones.danger.softer}
                    border="1px solid"
                    borderColor={ok ? tones.success.border : tones.danger.border}
                  >
                    <Text fontSize="sm" color={color.text} noOfLines={1}>
                      {result.fileName}
                    </Text>
                    <ToneBadge tone={ok ? 'success' : 'danger'} icon={ok ? HiCheckCircle : HiXCircle}>
                      {ok ? 'Uploaded' : 'Failed'}
                    </ToneBadge>
                  </HStack>
                );
              })}
            </VStack>
          </ModalSection>
        )}

        {/* STEP 2 – Year strategy */}
        {hasFiles && (
          <Step index={2} title="Which year are these from?">
            <Segmented
              value={yearStrategy}
              onChange={setYearStrategy}
              options={[
                { value: 'auto', label: 'Auto-detect', icon: HiSparkles },
                { value: 'manual', label: 'Set year', icon: HiCalendarDays },
              ]}
            />
            <Text fontSize="xs" color={color.textMuted} mt={2.5}>
              {yearStrategy === 'auto'
                ? 'We read each photo’s EXIF date (or file date). Multiple years are uploaded as separate groups.'
                : 'Apply a single year to all selected photos.'}
            </Text>

            {yearStrategy === 'auto' && (
              <Panel mt={4} p={0}>
                <HStack
                  as="button"
                  type="button"
                  w="full"
                  justify="space-between"
                  px={4}
                  py={3}
                  onClick={onAutoDetailsToggle}
                  aria-expanded={isAutoDetailsOpen}
                  color={color.text}
                >
                  <HStack spacing={2.5}>
                    <Text fontSize="sm" fontWeight="600">
                      {hasMultipleYears ? `${uniqueYears.length} years found` : `Year ${detectedYears[0] ?? CURRENT_YEAR}`}
                    </Text>
                    {hasMultipleYears && <ToneBadge tone="brand">Grouped</ToneBadge>}
                  </HStack>
                  <Icon as={HiChevronDown} transform={isAutoDetailsOpen ? 'rotate(180deg)' : 'none'} transition="transform .2s ease" color={color.textMuted} />
                </HStack>
                <Collapse in={isAutoDetailsOpen} animateOpacity>
                  <VStack align="stretch" spacing={2} px={4} pb={4} fontSize="sm" color={color.textSoft}>
                    <Text>
                      Most common year: <strong>{mostCommonYear ?? 'N/A'}</strong>
                    </Text>
                    {hasMultipleYears && (
                      <HStack spacing={2} flexWrap="wrap">
                        {Object.entries(groupedFilesByYear)
                          .sort((a, b) => b[0] - a[0])
                          .map(([y, files]) => (
                            <ToneBadge key={y} tone="neutral">
                              {y} · {files.length}
                            </ToneBadge>
                          ))}
                      </HStack>
                    )}
                  </VStack>
                </Collapse>
              </Panel>
            )}

            {yearStrategy === 'manual' && (
              <Panel mt={4}>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text {...type.label} color={color.textMuted} mb={2.5}>
                      Quick picks
                    </Text>
                    <SimpleGrid columns={{ base: 4, sm: 6, md: 8 }} spacing={2}>
                      {quickPickYears.map((y) => (
                        <Chip key={y} isActive={effectiveManualYear === y} onClick={() => setManualYear(String(y))} px={2}>
                          {y}
                        </Chip>
                      ))}
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Text {...type.label} color={color.textMuted} mb={2}>
                      Or type a year
                    </Text>
                    <NumberInput
                      min={MIN_YEAR}
                      max={CURRENT_YEAR}
                      value={manualYear}
                      onChange={(_, num) => setManualYear(Number.isNaN(num) ? '' : String(num))}
                      clampValueOnBlur
                      keepWithinRange
                    >
                      <NumberInputField placeholder={`e.g. ${CURRENT_YEAR}`} fontFamily={font.mono} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color={color.textMuted} mt={1.5}>
                      Allowed range: {MIN_YEAR}–{CURRENT_YEAR}
                    </Text>
                  </Box>

                  {!effectiveManualYear && (
                    <ModalNotice tone="warning">
                      Choose a year between {MIN_YEAR} and {CURRENT_YEAR}.
                    </ModalNotice>
                  )}
                </VStack>
              </Panel>
            )}
          </Step>
        )}

        {hasFiles && !countryId && (
          <ModalNotice tone="warning" title="Country not selected">
            Select a country to associate the photos before uploading.
          </ModalNotice>
        )}

        {/* Onboarding — only before anything is selected */}
        {!hasFiles && (
          <ModalNotice tone="info" title="How it works" icon={HiPhoto}>
            Pick several photos at once. We read each photo’s date to file it under the right year — or you can set one
            year for all of them.
          </ModalNotice>
        )}
      </VStack>
    </BaseModal>
  );
};

export default EnhancedImageUploaderModal;
