// frontend/src/components/modals/EnhancedImageUploaderModal.jsx
import React, { useState, useContext, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  useToast,
  Divider,
  Badge,
  Icon,
  Collapse,
  useDisclosure,
  Select,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  ButtonGroup,
  Kbd,
  SimpleGrid,
  Tag,
  TagLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaCloudUploadAlt,
  FaCalendar,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import BaseModal from './BaseModal';
import { CountriesContext } from '../../context/CountriesContext';
import { buildApiUrl } from '../../utils/apiConfig';
import * as EXIF from 'exif-js';
import { extractPhotoMetadata as extractMetadata } from '../../utils/photoMetadataExtractor';

const CURRENT_YEAR = new Date().getFullYear();
const RECENT_YEARS = Array.from({ length: 16 }, (_, i) => CURRENT_YEAR - i); // 16 years grid
const MIN_YEAR = 1900;

const EnhancedImageUploaderModal = ({ isOpen, onClose, onUploadSuccess, countryId }) => {
  const toast = useToast();
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);
  const { isOpen: isAutoDetailsOpen, onToggle: onAutoDetailsToggle } = useDisclosure();

  // Files & EXIF
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [photoMetadata, setPhotoMetadata] = useState({}); // { [file.name]: { year, date, hasGPS, original } }
  const [isLoading, setIsLoading] = useState(false);
  const [fileProgress, setFileProgress] = useState({}); // Progresso individual de cada arquivo
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]); // Resultados detalhados do upload

  // Year strategy: 'auto' (per-photo EXIF) | 'manual' (one year for all)
  const [yearStrategy, setYearStrategy] = useState('auto');
  const [manualYear, setManualYear] = useState(''); // string to match NumberInput; validated on use

  // ----- helpers -----
  const cardBg = useColorModeValue('gray.50', 'gray.800');
  const subtleText = useColorModeValue('gray.600', 'gray.300');
  const borderCol = useColorModeValue('gray.200', 'gray.700');

  const showToast = useCallback(
    (title, description, status = 'info') => {
      toast({
        title,
        description,
        status,
        duration: 3500,
        isClosable: true,
      });
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
      // Usar nossa função melhorada de extração de metadados
      const metadata = await extractMetadata(file);
      return {
        year: metadata.year,
        date: metadata.photoDate,
        hasGPS: metadata.hasGPS,
        original: metadata.originalExif,
      };
    } catch (error) {
      console.error('Erro ao extrair metadados:', error);
      // Fallback para dados básicos do arquivo
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

  const getTotalFileSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  // ----- derived -----
  const detectedYears = useMemo(() => {
    if (selectedFiles.length === 0) return [];
    return selectedFiles
      .map((f) => photoMetadata[f.name]?.year)
      .filter((y) => y != null && !Number.isNaN(y));
  }, [selectedFiles, photoMetadata]);

  const uniqueYears = useMemo(
    () => Array.from(new Set(detectedYears)).sort((a, b) => b - a),
    [detectedYears]
  );

  const hasMultipleYears = uniqueYears.length > 1;

  const mostCommonYear = useMemo(() => {
    if (detectedYears.length === 0) return null;
    const counts = detectedYears.reduce((acc, y) => {
      acc[y] = (acc[y] || 0) + 1;
      return acc;
    }, {});
    return parseInt(
      Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0],
      10
    );
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
    if (selectedFiles.length === 0) return '';
    if (yearStrategy === 'manual') {
      return effectiveManualYear
        ? `${effectiveManualYear} (applied to all photos)`
        : 'Select a valid year (1900—current)';
    }
    if (hasMultipleYears) {
      return `${uniqueYears.join(', ')} (grouped automatically by year)`;
    }
    if (detectedYears.length > 0) {
      return `${detectedYears[0]} (auto-detected via EXIF/file)`;
    }
    return `${CURRENT_YEAR} (current year — no EXIF)`;
  }, [
    selectedFiles.length,
    yearStrategy,
    effectiveManualYear,
    hasMultipleYears,
    uniqueYears,
    detectedYears,
  ]);

  // ----- handlers -----
  const handleFileSelect = async (event) => {
    const incoming = Array.from(event.target.files || []);
    if (incoming.length === 0) return;

    const valid = incoming.filter((f) => f.type?.startsWith('image/'));
    if (valid.length !== incoming.length) {
      showToast('Some files were ignored', 'Only image files are allowed.', 'warning');
    }
    if (valid.length === 0) return;

    // Limit number of files to prevent memory issues on low memory VPS
    const MAX_FILES = 8;
    if (valid.length > MAX_FILES) {
      showToast('Too many files', `Please select no more than ${MAX_FILES} photos at once for better performance.`, 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const meta = await readAllExif(valid);
      setSelectedFiles(valid);
      setPhotoMetadata(meta);
      // Reset strategy on new selection
      setYearStrategy('auto');
      setManualYear('');
      setFileProgress({}); // Reset progress when new files are selected
      setUploadResults([]); // Reset upload results
      showToast('Photos analyzed', `${valid.length} photo(s) ready to upload.`, 'success');
    } catch {
      showToast('Analysis error', 'Could not read photo metadata.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPhotosWithYear = async (files, year) => {
    if (!countryId) {
      throw new Error('Please select a country before uploading.');
    }

    const token = localStorage.getItem('token');
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      throw new Error('You must be logged in to upload photos.');
    }

    // Initialize progress for all files in this batch
    const initialProgress = {};
    files.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setFileProgress(prev => ({ ...prev, ...initialProgress }));

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('year', year);
    formData.append('countryId', countryId);

    const uploadUrl = buildApiUrl('/api/images/upload');

    // Simulate progress for each file (since we can't get real progress from fetch)
    const progressInterval = setInterval(() => {
      setFileProgress(prev => {
        const newProgress = { ...prev };
        files.forEach((file) => {
          if (newProgress[file.name] < 90) {
            // More gradual progress for better UX with multiple files
            newProgress[file.name] = Math.min(newProgress[file.name] + Math.random() * 10, 90);
          }
        });
        return newProgress;
      });
    }, 300); // Slower updates for better performance

    try {
      // Create AbortController for timeout handling
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
      
      // Calculate success/failure based on backend response
      const successful = uploadedUrls.length;
      const failed = files.length - successful;
      
      // Set progress based on actual results
      setFileProgress(prev => {
        const newProgress = { ...prev };
        files.forEach((file, index) => {
          if (index < successful) {
            newProgress[file.name] = 100; // Success
          } else {
            newProgress[file.name] = 0; // Failed
          }
        });
        return newProgress;
      });

      // Create detailed results
      const results = files.map((file, index) => ({
        fileName: file.name,
        status: index < successful ? 'success' : 'error',
        message: index < successful ? 'Upload successful' : 'Upload failed - file not processed',
        imageUrl: index < successful ? uploadedUrls[index] : null
      }));

      return {
        successful,
        failed,
        results
      };

    } catch (error) {
      clearInterval(progressInterval);
      
      // Reset progress on error
      setFileProgress(prev => {
        const newProgress = { ...prev };
        files.forEach((file) => {
          newProgress[file.name] = 0;
        });
        return newProgress;
      });
      
      // Handle different error types
      let errorMessage = 'Upload failed';
      if (error.name === 'AbortError') {
        errorMessage = 'Upload timeout - please try with fewer photos or smaller file sizes';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Return all files as failed
      const results = files.map(file => ({
        fileName: file.name,
        status: 'error',
        message: errorMessage,
        imageUrl: null
      }));

      return {
        successful: 0,
        failed: files.length,
        results
      };
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
    const uploadResults = [];

    try {
      if (yearStrategy === 'manual') {
        if (!effectiveManualYear) {
          throw new Error('Provide a valid year (1900—current).');
        }
        const result = await uploadPhotosWithYear(selectedFiles, effectiveManualYear);
        totalUploaded = result.successful;
        totalFailed = result.failed;
        uploadResults.push(...result.results);
      } else {
        const entries = Object.entries(groupedFilesByYear);
        const results = await Promise.allSettled(entries.map(([y, files]) => uploadPhotosWithYear(files, parseInt(y, 10))));
        
        // Process results from all year groups
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            totalUploaded += result.value.successful;
            totalFailed += result.value.failed;
            uploadResults.push(...result.value.results);
          } else {
            // If entire year group failed, count all files as failed
            const yearFiles = entries[index][1];
            totalFailed += yearFiles.length;
            uploadResults.push(...yearFiles.map(file => ({
              fileName: file.name,
              status: 'error',
              message: result.reason?.message || 'Upload failed'
            })));
          }
        });
      }

      // Store upload results for display
      setUploadResults(uploadResults);

      // Refresh data if any uploads were successful
      if (totalUploaded > 0) {
        await refreshCountriesWithPhotos();
        onUploadSuccess?.();
      }

      // Show appropriate success/error message
      if (totalFailed === 0) {
        showToast('Upload complete', `${totalUploaded} photo(s) uploaded successfully.`, 'success');
        // Reset and close only if all uploads were successful
        setSelectedFiles([]);
        setPhotoMetadata({});
        setFileProgress({});
        setUploadResults([]);
        setYearStrategy('auto');
        setManualYear('');
        onClose();
      } else if (totalUploaded > 0) {
        showToast(
          'Upload completed with errors', 
          `${totalUploaded} photo(s) uploaded successfully, ${totalFailed} failed.`, 
          'warning'
        );
        // Don't close modal if there were failures - let user see results
      } else {
        showToast('Upload failed', 'No photos were uploaded successfully.', 'error');
        // Don't close modal if all failed - let user retry
      }

    } catch (error) {
      showToast('Upload error', error?.message || 'Try again.', 'error');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  // ----- UI bits -----
  const StepHeader = ({ index, label }) => (
    <HStack justify="center" spacing={2}>
      <Tag borderRadius="full" size="md" colorScheme="blue" variant="subtle">
        <TagLabel>{index}</TagLabel>
      </Tag>
      <Text fontSize="lg" fontWeight="bold">{label}</Text>
    </HStack>
  );

  const YearChip = ({ y, isActive, onClick }) => (
    <Button
      onClick={onClick}
      size="sm"
      variant={isActive ? 'solid' : 'outline'}
      colorScheme={isActive ? 'green' : 'gray'}
      borderRadius="full"
      px={4}
    >
      {y}
    </Button>
  );

  const YearQuickPicks = () => {
    // Merge detected years (prioritize) + recent years (no duplicates), cap to ~16–20
    const merged = Array.from(new Set([...(uniqueYears || []), ...RECENT_YEARS])).slice(0, 20);

    return (
      <VStack align="stretch" spacing={3}>
        <Text fontWeight="semibold">Quick picks</Text>
        <SimpleGrid columns={{ base: 3, md: 6, lg: 8, xl: 10 }} spacing={2}>
          {merged.map((y) => (
            <YearChip
              key={y}
              y={y}
              isActive={effectiveManualYear === y}
              onClick={() => setManualYear(String(y))}
            />
          ))}
        </SimpleGrid>
      </VStack>
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        setYearStrategy('auto');
        setManualYear('');
        setFileProgress({});
        setUploadResults([]);
        setIsUploading(false);
        onClose();
      }}
      title="Upload Photos"
      icon={FaCloudUploadAlt}
      size={{ base: "xl", lg: "2xl", xl: "4xl" }}
    >
      <VStack spacing={6} align="stretch">
        {/* Progress bar for flow perception */}
        <Progress value={selectedFiles.length === 0 ? 33 : yearStrategy === 'auto' && !hasMultipleYears ? 66 : 66} size="xs" borderRadius="full" />

        {/* STEP 1 – Files */}
        <Box>
          <StepHeader index={1} label="Choose your photos" />

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="photo-upload"
          />

          <Button
            as="label"
            htmlFor="photo-upload"
            colorScheme="blue"
            variant="outline"
            size="lg"
            leftIcon={<FaCloudUploadAlt />}
            isLoading={isLoading}
            w="full"
            h="56px"
            mt={3}
          >
            {selectedFiles.length === 0
              ? 'Click to select photos'
              : `Selected ${selectedFiles.length} photo(s)`}
          </Button>

          <Text fontSize="sm" color={subtleText} mt={2} textAlign="center">
            You can select up to 8 photos at once. For best performance on low memory servers, try uploading 3-5 photos per batch.
          </Text>
        </Box>

        {/* Selected previews */}
        {selectedFiles.length > 0 && (
          <Box>
            <HStack justify="space-between" mb={3}>
              <Text fontWeight="semibold">
                Selected ({selectedFiles.length}):
              </Text>
              <Badge colorScheme="teal" variant="solid" fontSize="sm">
                Total: {formatFileSize(getTotalFileSize())}
              </Badge>
            </HStack>
            <Box maxH="300px" overflowY="auto" borderWidth={1} borderRadius="md" p={3} borderColor={borderCol}>
              <VStack spacing={3}>
                {selectedFiles.map((file, idx) => (
                  <Box key={`${file.name}-${idx}`} w="full">
                    <HStack w="full" justify="space-between" mb={2}>
                      <HStack spacing={3}>
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx + 1}`}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {file.name}
                          </Text>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color={subtleText}>
                              {formatFileSize(file.size)}
                            </Text>
                            {photoMetadata[file.name] && (
                              <>
                                <Badge colorScheme="blue" size="sm">
                                  {photoMetadata[file.name].year}
                                </Badge>
                                {photoMetadata[file.name].hasGPS && (
                                  <Badge colorScheme="green" size="sm">
                                    GPS
                                  </Badge>
                                )}
                              </>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>
                    </HStack>
                    
                    {/* Individual progress bar for each file */}
                    {isUploading && fileProgress[file.name] !== undefined && (
                      <Box w="full">
                        <Progress
                          value={fileProgress[file.name]}
                          size="sm"
                          colorScheme="teal"
                          borderRadius="md"
                          mb={1}
                        />
                        <Text fontSize="xs" color={subtleText} textAlign="right">
                          {Math.round(fileProgress[file.name])}%
                        </Text>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>
        )}

        {selectedFiles.length > 0 && <Divider />}

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={3}>
              Upload Results:
            </Text>
            <Box maxH="200px" overflowY="auto" borderWidth={1} borderRadius="md" p={3} borderColor={borderCol}>
              <VStack spacing={2}>
                {uploadResults.map((result, index) => (
                  <HStack key={index} w="full" justify="space-between" p={2} borderRadius="md" 
                    bg={result.status === 'success' ? 'green.50' : 'red.50'}
                    _dark={{ bg: result.status === 'success' ? 'green.900' : 'red.900' }}
                  >
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {result.fileName}
                    </Text>
                    <Badge 
                      colorScheme={result.status === 'success' ? 'green' : 'red'} 
                      variant="solid"
                      size="sm"
                    >
                      {result.status === 'success' ? 'Success' : 'Failed'}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </Box>
        )}

        {uploadResults.length > 0 && <Divider />}

        {/* STEP 2 – Year strategy */}
        {selectedFiles.length > 0 && (
          <Box>
            <StepHeader index={2} label="Year strategy" />

            <ButtonGroup isAttached w="full" mt={3}>
              <Button
                onClick={() => setYearStrategy('auto')}
                flex={1}
                variant={yearStrategy === 'auto' ? 'solid' : 'outline'}
                colorScheme="blue"
                leftIcon={<FaCalendar />}
              >
                Auto-detect
              </Button>
              <Button
                onClick={() => setYearStrategy('manual')}
                flex={1}
                variant={yearStrategy === 'manual' ? 'solid' : 'outline'}
                colorScheme="green"
                leftIcon={<FaCalendar />}
              >
                Set year
              </Button>
            </ButtonGroup>

            <Text fontSize="sm" color={subtleText} mt={2} textAlign="center">
              {yearStrategy === 'auto'
                ? 'We use EXIF (or file date) per photo. If multiple years are found, uploads are grouped by year.'
                : 'Apply a single year to all selected photos.'}
            </Text>

            {/* AUTO details */}
            {yearStrategy === 'auto' && (
              <Box
                mt={4}
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg={cardBg}
                borderColor={borderCol}
              >
                <HStack justify="space-between" align="center">
                  <Text fontWeight="semibold">Auto-detection details</Text>
                  <Icon
                    as={isAutoDetailsOpen ? FaChevronUp : FaChevronDown}
                    cursor="pointer"
                    onClick={onAutoDetailsToggle}
                    color="blue.500"
                  />
                </HStack>

                <Collapse in={isAutoDetailsOpen}>
                  <VStack align="stretch" spacing={2} mt={3}>
                    <Text fontSize="sm">
                      Most common year: <strong>{mostCommonYear ?? 'N/A'}</strong>
                    </Text>
                    {hasMultipleYears ? (
                      <Text fontSize="sm">
                        Multiple years found:{' '}
                        <strong>{uniqueYears.join(', ')}</strong>. We’ll upload{' '}
                        <strong>{Object.keys(groupedFilesByYear).length}</strong> group(s):{' '}
                        {Object.entries(groupedFilesByYear)
                          .sort((a, b) => b[0] - a[0])
                          .map(([y, files]) => `${y} (${files.length})`)
                          .join(', ')}
                        .
                      </Text>
                    ) : (
                      <Text fontSize="sm">
                        Single year detected:{' '}
                        <strong>{detectedYears[0] ?? CURRENT_YEAR}</strong>
                      </Text>
                    )}
                  </VStack>
                </Collapse>
              </Box>
            )}

            {/* MANUAL picker */}
            {yearStrategy === 'manual' && (
              <Box
                mt={4}
                p={4}
                borderWidth={1}
                borderRadius="md"
                bg={cardBg}
                borderColor={borderCol}
              >
                <VStack align="stretch" spacing={4}>
                  <Text fontWeight="semibold">Pick a year for all photos</Text>

                  <YearQuickPicks />

                  <VStack align="stretch" spacing={2}>
                    <Text fontSize="sm" color={subtleText}>
                      Or type a precise year:
                    </Text>
                    <NumberInput
                      min={MIN_YEAR}
                      max={CURRENT_YEAR}
                      value={manualYear}
                      onChange={(_, num) => {
                        // Chakra passes (valueString, valueNumber)
                        if (!Number.isNaN(num)) setManualYear(String(num));
                        else setManualYear('');
                      }}
                      clampValueOnBlur
                      keepWithinRange
                      size="md"
                      w="full"
                    >
                      <NumberInputField placeholder={`e.g. ${CURRENT_YEAR}`} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color={subtleText}>
                      Allowed range: {MIN_YEAR}–{CURRENT_YEAR}. Press <Kbd>Enter</Kbd> to confirm.
                    </Text>
                  </VStack>

                  {effectiveManualYear ? (
                    <Alert status="success" variant="subtle" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        Selected year: <strong>{effectiveManualYear}</strong>
                      </Text>
                    </Alert>
                  ) : (
                    <Alert status="warning" variant="subtle" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        Please choose a valid year between {MIN_YEAR} and {CURRENT_YEAR}.
                      </Text>
                    </Alert>
                  )}
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* Summary */}
        {selectedFiles.length > 0 && (
          <Box p={4} bg={cardBg} borderRadius="md" borderWidth={1} borderColor={borderCol}>
            <VStack spacing={3} align="stretch">
              <HStack spacing={2} justify="center">
                <Icon as={FaCalendar} />
                <Text fontSize="md" fontWeight="semibold">
                  Upload Summary
                </Text>
              </HStack>
              <Box textAlign="center">
                <Text fontSize="sm">
                  <strong>Year strategy:</strong> {uploadSummaryText}
                </Text>
              </Box>
              {!countryId && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertTitle fontSize="sm">Country not selected.</AlertTitle>
                  <AlertDescription fontSize="sm">
                    Select a country to associate the photos before uploading.
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </Box>
        )}

        {/* STEP 3 – Upload */}
        {selectedFiles.length > 0 && (
          <Box>
            <StepHeader index={3} label="Upload" />
            <Button
              colorScheme="green"
              size="lg"
              onClick={handleUpload}
              isLoading={isLoading || isUploading}
              loadingText={isUploading ? "Uploading..." : "Processing..."}
              leftIcon={<FaCloudUploadAlt />}
              w="full"
              h="56px"
              fontSize="lg"
              mt={3}
              isDisabled={(yearStrategy === 'manual' && !effectiveManualYear) || isUploading}
            >
              {(() => {
                if (isUploading) {
                  return `Uploading ${selectedFiles.length} photo(s)...`;
                }
                if (yearStrategy === 'manual') {
                  return effectiveManualYear
                    ? `Upload ${selectedFiles.length} photo(s) with year ${effectiveManualYear}`
                    : 'Pick a valid year';
                }
                if (hasMultipleYears) {
                  return `Upload ${selectedFiles.length} photo(s) (grouped by year)`;
                }
                const y = detectedYears[0] ?? CURRENT_YEAR;
                return `Upload ${selectedFiles.length} photo(s) with year ${y}`;
              })()}
            </Button>

            <Text fontSize="xs" color={subtleText} mt={2} textAlign="center">
              {isUploading
                ? 'Please wait while your photos are being uploaded...'
                : yearStrategy === 'manual'
                ? effectiveManualYear
                  ? `All photos will be uploaded with year ${effectiveManualYear}.`
                  : 'Choose a year to continue.'
                : hasMultipleYears
                ? 'Photos will be automatically organized and uploaded by year.'
                : 'We will use the auto-detected year.'}
            </Text>
          </Box>
        )}

        {/* How it works */}
        <Box p={4} bg="blue.50" borderRadius="md" _dark={{ bg: 'blue.900' }}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={2} justify="center">
              <Icon as={FaInfoCircle} color="blue.500" />
              <Text fontSize="md" fontWeight="semibold" color="blue.700" _dark={{ color: 'blue.200' }}>
                How it works
              </Text>
            </HStack>

            <VStack spacing={2} align="start">
              <HStack spacing={2}>
                <Icon as={FaCloudUploadAlt} color="blue.500" />
                <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.200' }}>
                  <strong>Photo selection:</strong> pick multiple images at once.
                </Text>
              </HStack>

              <HStack spacing={2}>
                <Icon as={FaCalendar} color="blue.500" />
                <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.200' }}>
                  <strong>Auto-detect:</strong> EXIF (or file date) sets the year per photo.
                </Text>
              </HStack>

              <HStack spacing={2}>
                <Icon as={FaMapMarkerAlt} color="blue.500" />
                <Text fontSize="sm" color="blue.700" _dark={{ color: 'blue.200' }}>
                  <strong>Manual year:</strong> optionally apply one year to all photos.
                </Text>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </BaseModal>
  );
};

export default EnhancedImageUploaderModal;
