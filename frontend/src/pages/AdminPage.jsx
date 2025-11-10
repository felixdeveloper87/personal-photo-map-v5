import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Spinner,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { FaTrash, FaUserShield, FaUsers } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { buildApiUrl } from '../utils/apiConfig';

const AdminPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAdmin, isLoggedIn } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
      return;
    }

    fetchUsers();
  }, [isLoggedIn, isAdmin, navigate, toast]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(buildApiUrl('/api/admin/users'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user "${userEmail}"? This will also delete all their photos. This action cannot be undone.`)) {
      return;
    }

    setDeleting(userId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(buildApiUrl(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete user');
      }

      toast({
        title: 'User Deleted',
        description: `User "${userEmail}" has been deleted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleting(null);
    }
  };

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack spacing={3} mb={2}>
            <FaUserShield size={32} />
            <Heading size="lg">Admin Panel</Heading>
          </HStack>
          <Text color="gray.500">Manage users and their photos</Text>
        </Box>

        {/* Users Table */}
        <Box
          bg={bgColor}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          boxShadow="md"
        >
          {loading ? (
            <Box p={8} textAlign="center">
              <Spinner size="xl" />
              <Text mt={4}>Loading users...</Text>
            </Box>
          ) : users.length === 0 ? (
            <Box p={8} textAlign="center">
              <FaUsers size={48} style={{ margin: '0 auto', opacity: 0.3 }} />
              <Text mt={4} color="gray.500">No users found</Text>
            </Box>
          ) : (
            <Table variant="simple">
              <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                <Tr>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Country</Th>
                  <Th>Photos</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.id}</Td>
                    <Td fontWeight="medium">{user.fullname}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.country || '-'}</Td>
                    <Td>
                      <Badge colorScheme="blue" fontSize="sm">
                        {user.photoCount} photos
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="red"
                        leftIcon={<FaTrash />}
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        isLoading={deleting === user.id}
                        loadingText="Deleting..."
                      >
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

        {/* Info Alert */}
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Admin Actions</AlertTitle>
            <AlertDescription>
              You can delete users and all their associated photos. This action cannot be undone.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Container>
  );
};

export default AdminPage;

