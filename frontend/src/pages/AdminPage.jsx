import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Table, TableContainer, Thead, Tbody, Tr, Th, Td, useToast, Text, VStack, HStack } from '@chakra-ui/react';
import { HiShieldCheck, HiUsers } from 'react-icons/hi2';
import { AuthContext } from '../context/AuthContext';
import { buildApiUrl } from '../utils/apiConfig';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DeleteButton } from '../components/ui/buttons/CustomButtons';
import { IconTile, ModalNotice, ModalState, Panel, ToneBadge } from '../components/modals/ModalKit';
import { color, font, type } from '../design/tokens';

const AdminPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAdmin, isLoggedIn } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null); // { id, email } awaiting confirmation

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
    setPendingDelete(null);
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
        let errorMessage = 'Failed to delete user';
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          } else {
            // If no error text, use status-based message
            if (response.status === 404) {
              errorMessage = 'User not found';
            } else if (response.status === 403) {
              errorMessage = 'Access denied. You do not have permission to delete users.';
            } else if (response.status === 401) {
              errorMessage = 'Unauthorized. Please log in again.';
            } else {
              errorMessage = `Failed to delete user (Status: ${response.status})`;
            }
          }
        } catch (e) {
          // If we can't read the error text, use status-based message
          if (response.status === 404) {
            errorMessage = 'User not found';
          } else {
            errorMessage = `Failed to delete user (Status: ${response.status})`;
          }
        }
        throw new Error(errorMessage);
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
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId,
        userEmail
      });
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete user. Please check the console for details.',
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

  const thStyle = { ...type.label, color: color.textMuted, borderColor: color.hairline, py: 3.5 };
  const tdStyle = { borderColor: color.hairline, color: color.textSoft, fontSize: 'sm', py: 3.5 };

  return (
    <Box bg={color.bg} minH="100vh">
      <Container maxW="container.xl" py={{ base: 8, md: 12 }}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack spacing={4}>
            <IconTile icon={HiShieldCheck} size="lg" />
            <Box>
              <Text {...type.eyebrow} color={color.primary}>
                Administration
              </Text>
              <Text {...type.displayLg} color={color.text}>
                Admin panel
              </Text>
              <Text color={color.textSoft} fontSize="sm">
                Manage users and their photos
              </Text>
            </Box>
          </HStack>

          {/* Users table */}
          <Panel p={0} overflow="hidden" bg={color.surface}>
            {loading ? (
              <ModalState kind="loading" title="Loading users…" />
            ) : users.length === 0 ? (
              <ModalState kind="empty" icon={HiUsers} title="No users found" />
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead bg="rgba(236,231,220,0.03)">
                    <Tr>
                      {['ID', 'Name', 'Email', 'Country', 'Photos', 'Actions'].map((h) => (
                        <Th key={h} {...thStyle}>
                          {h}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id} _hover={{ bg: color.surfaceHover }}>
                        <Td {...tdStyle} fontFamily={font.mono} color={color.textMuted}>
                          {user.id}
                        </Td>
                        <Td {...tdStyle} fontWeight="600" color={color.text}>
                          {user.fullname}
                        </Td>
                        <Td {...tdStyle}>{user.email}</Td>
                        <Td {...tdStyle}>{user.country || '—'}</Td>
                        <Td {...tdStyle}>
                          <ToneBadge tone="brand">{user.photoCount} photos</ToneBadge>
                        </Td>
                        <Td {...tdStyle}>
                          <DeleteButton
                            size="sm"
                            h="34px"
                            onClick={() => setPendingDelete({ id: user.id, email: user.email })}
                            isLoading={deleting === user.id}
                            loadingText="Deleting…"
                          >
                            Delete
                          </DeleteButton>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Panel>

          <ModalNotice tone="info" title="Admin actions">
            You can delete users and all their associated photos. This action cannot be undone.
          </ModalNotice>
        </VStack>
      </Container>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => handleDeleteUser(pendingDelete.id, pendingDelete.email)}
        title="Delete user?"
        confirmLabel="Delete user"
        message={
          pendingDelete
            ? `Are you sure you want to delete user "${pendingDelete.email}"? This will also delete all their photos. This action cannot be undone.`
            : ''
        }
      />
    </Box>
  );
};

export default AdminPage;

