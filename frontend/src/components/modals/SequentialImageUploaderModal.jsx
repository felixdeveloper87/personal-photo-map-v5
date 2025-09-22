/**
 * SequentialImageUploaderModal.jsx
 *
 * Enhanced modal component for sequential image uploads with real-time progress feedback.
 * Uploads images one by one to prevent memory issues and provide better user experience.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  useToast,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Badge,
  Progress,
  Button,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Divider,
  Select,
  Input,
  Box,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCloudUploadAlt, 
  FaCalendarAlt, 
  FaImages, 
  FaFileImage, 
  FaCheckCircle,
  FaInfoCircle,
  FaTimes,
  FaUpload,
  FaSpinner,
  FaExclamationTriangle,
  FaPause,
  FaPlay
} from 'react-icons/fa';
import { UploadButton } from "../ui/buttons/CustomButtons";
import BaseModal from './BaseModal';
import heic2any from 'heic2any';
import { showSuccessToast, showErrorToast } from "../ui/CustomToast";
import { buildApiUrl } from "../../utils/apiConfig";

// Motion components
const MotionVStack = motion.create(VStack);
const MotionBox = motion.create(Box);

const SequentialImageUploaderModal = ({ 
  countryId, 
  onUpload, 
  onUploadSuccess, 
  isOpen: externalIsOpen, 
  onOpen: externalOnOpen, 
  onClose: externalOnClose 
}) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [uploadResults, setUploadResults] = useState([]);
  const [totalUploaded, setTotalUploaded] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const uploadAbortController = useRef(null);
  
  // Use external state if provided, otherwise use internal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const finalIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const finalOnOpen = externalOnOpen || onOpen;
  const finalOnClose = externalOnClose || onClose;
  
  const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure();

  // Generate years array
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('teal.200', 'teal.600');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const selectBg = useColorModeValue('gray.50', 'gray.700');
  const selectColor = useColorModeValue('gray.800', 'white');
  const successColor = useColorModeValue('green.500', 'green.300');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const warningColor = useColorModeValue('orange.500', 'orange.300');

  const handleFileSelection = (event) => {
    const selectedFiles = event.target.files;
    setFiles(selectedFiles.length > 0 ? Array.from(selectedFiles) : []);
    // Reset upload state when new files are selected
    resetUploadState();
  };

  const resetUploadState = () => {
    setUploadProgress(0);
    setCurrentFileIndex(0);
    setCurrentFileName('');
    setUploadResults([]);
    setTotalUploaded(0);
    setTotalFailed(0);
    setIsUploading(false);
    setIsPaused(false);
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
      uploadAbortController.current = null;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const convertHeicToJpeg = async (file) => {
    try {
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9,
      });
      return new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
        type: 'image/jpeg',
      });
    } catch (error) {
      console.error('Error converting HEIC file:', error);
      throw new Error(`Failed to convert HEIC file: ${file.name}`);
    }
  };

  const uploadSingleFile = async (file, index, total) => {
    const controller = new AbortController();
    uploadAbortController.current = controller;

    try {
      // Convert HEIC if needed
      let fileToUpload = file;
      if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        setCurrentFileName(`Converting ${file.name}...`);
        fileToUpload = await convertHeicToJpeg(file);
      }

      setCurrentFileName(file.name);
      setCurrentFileIndex(index);

      const formData = new FormData();
      formData.append('image', fileToUpload);
      formData.append('year', year);
      formData.append('countryId', countryId);
      formData.append('current', (index + 1).toString());
      formData.append('total', total.toString());

      const uploadUrl = buildApiUrl('/api/images/upload-single');
      const authHeaders = getAuthHeaders();
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Success
      setTotalUploaded(prev => prev + 1);
      setUploadResults(prev => [...prev, {
        fileName: file.name,
        status: 'success',
        message: 'Upload successful',
        imageUrl: result.imageUrl
      }]);

      return result;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw error; // Re-throw abort errors
      }
      
      // Handle upload error
      setTotalFailed(prev => prev + 1);
      setUploadResults(prev => [...prev, {
        fileName: file.name,
        status: 'error',
        message: error.message
      }]);
      
      throw error;
    }
  };

  const handleSequentialUpload = async () => {
    if (files.length === 0) {
      showErrorToast(toast, 'Please select at least one image.');
      return;
    }

    setIsUploading(true);
    resetUploadState();
    
    const total = files.length;
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        // Check if upload was paused
        while (isPaused && !uploadAbortController.current?.signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Check if upload was cancelled
        if (uploadAbortController.current?.signal.aborted) {
          break;
        }

        const file = files[i];
        const progressPercentage = Math.round(((i + 1) / total) * 100);
        
        try {
          await uploadSingleFile(file, i, total);
          successCount++;
          setUploadProgress(progressPercentage);
          
          // Small delay between uploads to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          if (error.name === 'AbortError') {
            break; // Upload was cancelled
          }
          errorCount++;
          console.error(`Failed to upload ${file.name}:`, error);
          // Continue with next file even if this one failed
        }
      }

      // Upload completed (or cancelled)
      const wasCompleted = !uploadAbortController.current?.signal.aborted;
      
      if (wasCompleted) {
        if (successCount > 0) {
          showSuccessToast(toast, 
            `Upload completed! ${successCount} of ${total} images uploaded successfully.`
          );

          // Call success callback
          if (onUploadSuccess) {
            try {
              await onUploadSuccess();
            } catch (callbackError) {
              console.error('Error in onUploadSuccess callback:', callbackError);
            }
          }

          // Dispatch global event
          window.dispatchEvent(new CustomEvent('photo-upload'));
          localStorage.setItem('photo-upload-timestamp', Date.now().toString());
        }

        if (errorCount > 0) {
          showErrorToast(toast, 
            `${errorCount} images failed to upload. Check the results below.`
          );
        }

        // Auto-close modal if all uploads were successful
        if (errorCount === 0 && successCount > 0) {
          setTimeout(() => {
            resetUploader();
            finalOnClose();
          }, 2000);
        }
      }

    } catch (error) {
      console.error('Upload error:', error);
      showErrorToast(toast, 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setCurrentFileName('');
      uploadAbortController.current = null;
    }
  };

  const pauseUpload = () => {
    setIsPaused(true);
  };

  const resumeUpload = () => {
    setIsPaused(false);
  };

  const cancelUpload = () => {
    if (uploadAbortController.current) {
      uploadAbortController.current.abort();
    }
    setIsUploading(false);
    setIsPaused(false);
    showErrorToast(toast, 'Upload cancelled.');
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    resetUploadState();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetUploader = () => {
    setFiles([]);
    setYear(currentYear);
    resetUploadState();
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Icon as={FaCheckCircle} color={successColor} />;
      case 'error':
        return <Icon as={FaExclamationTriangle} color={errorColor} />;
      default:
        return <Icon as={FaFileImage} color="gray.400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return successColor;
      case 'error':
        return errorColor;
      default:
        return 'gray.400';
    }
  };

  return (
    <>
      <BaseModal
        isOpen={finalIsOpen}
        onClose={finalOnClose}
        size="3xl"
        maxHeight="95vh"
        onCloseComplete={resetUploader}
      >
        <VStack spacing={6}>
          {/* Header */}
          <HStack spacing={4} align="center">
            <Icon as={FaCloudUploadAlt} color={accentColor} boxSize={6} />
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Sequential Photo Upload
            </Text>
          </HStack>

          {/* Year Selection */}
          <VStack w="full" spacing={3}>
            <HStack spacing={4} align="center">
              <Icon as={FaCalendarAlt} color={accentColor} w={5} h={5} />
              <Text fontWeight="semibold" color={textColor}>
                When was this photo taken?
              </Text>
            </HStack>
            <Select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              size="lg"
              bg={selectBg}
              color={selectColor}
              border="2px"
              borderColor={borderColor}
              _focus={{
                borderColor: accentColor,
                boxShadow: `0 0 0 1px ${accentColor}`,
              }}
              disabled={isUploading}
            >
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </Select>
          </VStack>

          {/* File Selection */}
          <VStack w="full" spacing={4}>
            <HStack spacing={4} align="center">
              <Icon as={FaImages} color={accentColor} w={5} h={5} />
              <Text fontWeight="semibold" color={textColor}>
                Select Your Photos
              </Text>
            </HStack>
            
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.heic"
              onChange={handleFileSelection}
              display="none"
              id="image-upload-input"
              disabled={isUploading}
            />
            
            <Button
              as="label"
              htmlFor="image-upload-input"
              cursor={isUploading ? "not-allowed" : "pointer"}
              colorScheme="teal"
              variant="outline"
              size="lg"
              w="full"
              h="60px"
              border="2px dashed"
              borderColor={borderColor}
              bg="transparent"
              color={accentColor}
              _hover={!isUploading ? {
                borderColor: accentColor,
                bg: useColorModeValue('teal.50', 'gray.600'),
              } : {}}
              leftIcon={<Icon as={FaCloudUploadAlt} boxSize={5} />}
              disabled={isUploading}
            >
              {isUploading ? "Upload in Progress..." : "Choose Files or Drag & Drop"}
            </Button>
          </VStack>

          {/* Upload Progress */}
          {isUploading && (
            <VStack w="full" spacing={4}>
              <Box w="full" p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                <VStack spacing={3}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                      Progress: {currentFileIndex + 1} of {files.length}
                    </Text>
                    <Badge colorScheme="teal">
                      {uploadProgress}%
                    </Badge>
                  </HStack>
                  
                  <Progress 
                    value={uploadProgress} 
                    colorScheme="teal" 
                    size="lg" 
                    w="full"
                    borderRadius="md"
                  />
                  
                  {currentFileName && (
                    <HStack spacing={2} w="full">
                      <Icon 
                        as={isPaused ? FaPause : FaSpinner} 
                        color={accentColor} 
                        className={!isPaused ? "fa-spin" : ""}
                      />
                      <Text fontSize="sm" color={textColor} noOfLines={1}>
                        {isPaused ? "Paused: " : "Uploading: "}{currentFileName}
                      </Text>
                    </HStack>
                  )}

                  {/* Upload Stats */}
                  <HStack spacing={6} justify="center" w="full">
                    <HStack spacing={1}>
                      <Icon as={FaCheckCircle} color={successColor} />
                      <Text fontSize="sm" color={successColor} fontWeight="semibold">
                        {totalUploaded} success
                      </Text>
                    </HStack>
                    {totalFailed > 0 && (
                      <HStack spacing={1}>
                        <Icon as={FaExclamationTriangle} color={errorColor} />
                        <Text fontSize="sm" color={errorColor} fontWeight="semibold">
                          {totalFailed} failed
                        </Text>
                      </HStack>
                    )}
                  </HStack>

                  {/* Upload Controls */}
                  <HStack spacing={3} justify="center">
                    {!isPaused ? (
                      <Button size="sm" colorScheme="orange" variant="outline" onClick={pauseUpload}>
                        <Icon as={FaPause} mr={2} />
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" colorScheme="green" variant="outline" onClick={resumeUpload}>
                        <Icon as={FaPlay} mr={2} />
                        Resume
                      </Button>
                    )}
                    <Button size="sm" colorScheme="red" variant="outline" onClick={cancelUpload}>
                      Cancel
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          )}

          {/* Selected Files List */}
          {files.length > 0 && (
            <VStack w="full" spacing={3}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="semibold" color={textColor}>
                  Selected Files ({files.length})
                </Text>
                <Badge colorScheme="teal" variant="solid">
                  {files.reduce((acc, file) => acc + file.size, 0) > 1024 * 1024
                    ? `${(files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(1)} MB`
                    : `${(files.reduce((acc, file) => acc + file.size, 0) / 1024).toFixed(1)} KB`}
                </Badge>
              </HStack>
              
              <Box w="full" maxH="300px" overflowY="auto">
                <List spacing={2}>
                  <AnimatePresence>
                    {files.map((file, index) => {
                      const result = uploadResults.find(r => r.fileName === file.name);
                      const isCurrentlyUploading = isUploading && index === currentFileIndex;
                      
                      return (
                        <MotionBox
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ListItem
                            p={3}
                            border="1px"
                            borderColor={result ? getStatusColor(result.status) : borderColor}
                            borderRadius="md"
                            bg={isCurrentlyUploading ? useColorModeValue('blue.50', 'blue.900') : cardBg}
                            w="full"
                          >
                            <HStack justify="space-between">
                              <HStack spacing={3} flex={1}>
                                {isCurrentlyUploading ? (
                                  <Icon as={FaSpinner} color={accentColor} className="fa-spin" />
                                ) : (
                                  getStatusIcon(result?.status)
                                )}
                                <VStack align="start" spacing={0} flex={1}>
                                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                    {file.name}
                                  </Text>
                                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                    {formatFileSize(file.size)}
                                  </Text>
                                  {result?.message && (
                                    <Text fontSize="xs" color={getStatusColor(result.status)} noOfLines={1}>
                                      {result.message}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                              {!isUploading && !result && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => removeFile(index)}
                                  aria-label="Remove file"
                                >
                                  <Icon as={FaTimes} />
                                </Button>
                              )}
                            </HStack>
                          </ListItem>
                        </MotionBox>
                      );
                    })}
                  </AnimatePresence>
                </List>
              </Box>
            </VStack>
          )}

          {/* Upload Results Summary */}
          {uploadResults.length > 0 && !isUploading && (
            <Alert status={totalFailed > 0 ? "warning" : "success"} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Upload Complete!</AlertTitle>
                <AlertDescription>
                  {totalUploaded} of {files.length} images uploaded successfully.
                  {totalFailed > 0 && ` ${totalFailed} failed.`}
                </AlertDescription>
              </Box>
            </Alert>
          )}

          <Divider />

          {/* Action Buttons */}
          <VStack w="full" spacing={4}>
            <UploadButton
              isLoading={isUploading}
              loadingText={isPaused ? "Upload Paused..." : "Uploading Memories..."}
              onClick={handleSequentialUpload}
              disabled={files.length === 0 || isUploading}
              w="full"
              size="lg"
              colorScheme="teal"
              bgGradient="linear(to-r, teal.500, blue.500)"
              _hover={!isUploading ? {
                bgGradient: 'linear(to-r, teal.600, blue.600)',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              } : {}}
              _active={{
                transform: 'translateY(0)',
              }}
              fontWeight="bold"
              fontSize="lg"
              py={6}
              borderRadius="xl"
            />

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Icon as={FaInfoCircle} />}
              onClick={onInfoOpen}
              color={accentColor}
              _hover={{ bg: `${accentColor}10` }}
              disabled={isUploading}
            >
              Upload Guidelines & Tips
            </Button>
          </VStack>
        </VStack>
      </BaseModal>

      {/* Info Modal */}
      <BaseModal isOpen={isInfoOpen} onClose={onInfoClose} size="md">
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Sequential Upload Guidelines & Tips
          </Text>
          
          <VStack spacing={3} align="start">
            <Text><strong>Supported formats:</strong> JPEG, PNG, HEIC, WebP</Text>
            <Text><strong>Maximum file size:</strong> 50MB per image</Text>
            <Text><strong>Upload method:</strong> Images are processed one by one</Text>
            <Text><strong>HEIC files:</strong> Automatically converted to JPEG</Text>
            <Text><strong>Privacy:</strong> Your photos are private and only visible to you</Text>
            <Text><strong>Reliability:</strong> If one image fails, others continue uploading</Text>
          </VStack>

          <Divider />

          <VStack spacing={2} align="start">
            <Text fontWeight="semibold">Benefits of Sequential Upload:</Text>
            <List spacing={1} fontSize="sm">
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Real-time progress for each image
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                No memory overflow issues
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Pause and resume capability
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Detailed success/failure reporting
              </ListItem>
            </List>
          </VStack>
        </VStack>
      </BaseModal>
    </>
  );
};

export default SequentialImageUploaderModal;
