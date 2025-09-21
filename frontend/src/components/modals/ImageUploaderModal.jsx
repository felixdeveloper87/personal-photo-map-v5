/**
 * ImageUploaderModal.jsx
 *
 * Modal component for uploading images to a specific country and year.
 * Handles file selection, preview, HEIC conversion, and batch upload.
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
  Input
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
  FaUpload
} from 'react-icons/fa';
import { UploadButton } from "../ui/buttons/CustomButtons";
import BaseModal from './BaseModal';
import heic2any from 'heic2any';
import { showSuccessToast, showErrorToast } from "../ui/CustomToast";
import { buildApiUrl } from "../../utils/apiConfig";

// Motion components
const MotionVStack = motion.create(VStack);

const ImageUploaderModal = ({ countryId, onUpload, onUploadSuccess, isOpen: externalIsOpen, onOpen: externalOnOpen, onClose: externalOnClose }) => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const toast = useToast();
  
  // Use external state if provided, otherwise use internal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const finalIsOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const finalOnOpen = externalOnOpen || onOpen;
  const finalOnClose = externalOnClose || onClose;
  
  const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure();

  // Generate years array
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => 1900 + i);

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('teal.200', 'teal.600');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const textColor = useColorModeValue('gray.800', 'white');
  const selectBg = useColorModeValue('gray.50', 'gray.700');
  const selectColor = useColorModeValue('gray.800', 'white');
  const selectFocusBg = useColorModeValue('white', 'gray.600');
  const selectHoverBg = useColorModeValue('white', 'gray.600');
  const optionBg = useColorModeValue('white', 'gray.700');
  const optionColor = useColorModeValue('gray.800', 'white');

  const handleFileSelection = (event) => {
    const selectedFiles = event.target.files;
    setFiles(selectedFiles.length > 0 ? Array.from(selectedFiles) : []);
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

  const handleImageUpload = async () => {
   
    if (files.length === 0) {
      showErrorToast(toast, 'Please select at least one image.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('year', year);
      formData.append('countryId', countryId);

      setUploadProgress(25);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
          const convertedFile = await convertHeicToJpeg(file);
          formData.append('images', convertedFile);
        } else {
          formData.append('images', file);
        }
      }

      setUploadProgress(50);

      // Debug: Log the request details
      const uploadUrl = buildApiUrl('/api/images/upload');
      const authHeaders = getAuthHeaders();
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });


      setUploadProgress(75);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed. Status:', response.status, 'Response:', errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      const result = await response.json();

      setUploadProgress(100);
      
      try {
        showSuccessToast(toast, `Successfully uploaded ${files.length} image(s)!`);

        // Call the success callback if provided
        if (onUploadSuccess) {
          try {
            await onUploadSuccess();
          } catch (callbackError) {
            console.error('💥 Error in onUploadSuccess callback:', callbackError);
            console.error('💥 Callback error stack:', callbackError.stack);
          }
        } else {
          console.warn('⚠️ ImageUploaderModal: No onUploadSuccess callback provided!');
        }

        // Also dispatch global event as backup
        window.dispatchEvent(new CustomEvent('photo-upload'));
        localStorage.setItem('photo-upload-timestamp', Date.now().toString());

        // Reset form
        setFiles([]);
        setYear(currentYear);
        if (fileInputRef.current) fileInputRef.current.value = null;
        
        finalOnClose(); // Close modal after successful upload
        
      } catch (postUploadError) {
        console.error('💥 Error in post-upload processing:', postUploadError);
        console.error('Stack:', postUploadError.stack);
      }

    } catch (error) {
      console.error('💥 Upload error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        type: error.constructor.name
      });
      
      // Check if it's a network error
      if (error.message.includes('ERR_INTERNET_DISCONNECTED') || error.message.includes('Failed to fetch')) {
        showErrorToast(toast, 'Network connection issue. Please check your connection and try again.');
      } else {
        showErrorToast(toast, error.message || 'Failed to upload images. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
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
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  return (
    <>
      <BaseModal
        isOpen={finalIsOpen}
        onClose={finalOnClose}
        size="2xl"
        maxHeight="90vh"
        onCloseComplete={resetUploader}
      >
        <VStack spacing={6}>
          {/* Header */}
          <HStack spacing={4} align="center">
            <Icon as={FaCloudUploadAlt} color={accentColor} boxSize={6} />
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              Upload Your Memories
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
              onChange={(e) => setYear(e.target.value)}
              size="lg"
              bg={selectBg}
              color={selectColor}
              border="2px"
              borderColor={borderColor}
              _focus={{
                borderColor: accentColor,
                boxShadow: `0 0 0 1px ${accentColor}`,
                bg: selectFocusBg,
              }}
              _hover={{ 
                bg: selectHoverBg 
              }}
            >
              {years.map((yr) => (
                <option 
                  key={yr} 
                  value={yr}
                  style={{
                    backgroundColor: optionBg,
                    color: optionColor
                  }}
                >
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
            />
            
            <Button
              as="label"
              htmlFor="image-upload-input"
              cursor="pointer"
              colorScheme="teal"
              variant="outline"
              size="lg"
              w="full"
              h="60px"
              border="2px dashed"
              borderColor={useColorModeValue('teal.300', 'teal.400')}
              bg={useColorModeValue('transparent', 'gray.700')}
              color={useColorModeValue('teal.600', 'teal.200')}
              _hover={{
                borderColor: accentColor,
                bg: useColorModeValue('teal.50', 'gray.600'),
              }}
              leftIcon={<Icon as={FaCloudUploadAlt} boxSize={5} />}
            >
              Choose Files or Drag & Drop
            </Button>
          </VStack>

          {/* Progress Bar */}
          {isUploading && uploadProgress > 0 && (
            <VStack w="full" spacing={2}>
              <Progress 
                value={uploadProgress} 
                colorScheme="teal" 
                size="lg" 
                w="full"
                borderRadius="md"
              />
              <Text fontSize="sm" color={textColor}>
                Uploading... {uploadProgress}%
              </Text>
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
              
              <List spacing={2} w="full" maxH="200px" overflowY="auto">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <MotionVStack
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ListItem
                        p={3}
                        border="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        bg={cardBg}
                        w="full"
                      >
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <ListIcon as={FaFileImage} color="teal.500" />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                                {file.name}
                              </Text>
                              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                                {formatFileSize(file.size)}
                              </Text>
                            </VStack>
                          </HStack>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeFile(index)}
                            aria-label="Remove file"
                          >
                            <Icon as={FaTimes} />
                          </Button>
                        </HStack>
                      </ListItem>
                    </MotionVStack>
                  ))}
                </AnimatePresence>
              </List>
            </VStack>
          )}

          <Divider />

          {/* Action Buttons */}
          <VStack w="full" spacing={4}>
            <UploadButton
              isLoading={isUploading}
              loadingText="Uploading Memories..."
              onClick={handleImageUpload}
              disabled={files.length === 0}
              w="full"
              size="lg"
              colorScheme="teal"
              bgGradient="linear(to-r, teal.500, blue.500)"
              _hover={{
                bgGradient: 'linear(to-r, teal.600, blue.600)',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
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
            Upload Guidelines & Tips
          </Text>
          
          <VStack spacing={3} align="start">
            <Text><strong>Supported formats:</strong> JPEG, PNG, HEIC, WebP</Text>
            <Text><strong>Maximum file size:</strong> 10MB per image</Text>
            <Text><strong>Maximum files:</strong> 20 images per upload</Text>
            <Text><strong>HEIC files:</strong> Will be automatically converted to JPEG</Text>
            <Text><strong>Privacy:</strong> Your photos are private and only visible to you</Text>
            <Text><strong>Organization:</strong> Photos are automatically organized by country and year</Text>
          </VStack>

          <Divider />

          <VStack spacing={2} align="start">
            <Text fontWeight="semibold">Tips for best results:</Text>
            <List spacing={1} fontSize="sm">
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Use descriptive filenames for better organization
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Ensure photos are well-lit and in focus
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Upload in batches for faster processing
              </ListItem>
            </List>
          </VStack>
        </VStack>
      </BaseModal>
    </>
  );
};

export default ImageUploaderModal;