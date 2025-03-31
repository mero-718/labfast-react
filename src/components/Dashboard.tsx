import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  styled,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  TablePagination,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useGetUsersQuery, useDeleteUserMutation, useRegisterMutation } from '../store/api/apiSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 280;

const StyledDrawer = styled(Drawer)({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#F2EAE1',
    color: '#000000',
    padding: '0 16px',
  },
});

const ProfileSection = styled(Box)({
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  '& .MuiAvatar-root': {
    width: 100,
    height: 100,
  },
});

const StyledTableContainer = styled(TableContainer)({
  marginTop: '1rem',
  '& .MuiTableCell-head': {
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
  },
  '& .MuiTableCell-body': {
    padding: '16px 8px',
  },
});

const TitleBar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1rem',
  '& .bar': {
    width: '4px',
    height: '24px',
    backgroundColor: '#FFA500',
    marginRight: '8px',
  },
});

const HeaderContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  marginTop: '2rem',
});

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#FFA500',
    },
  },
});

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
  backgroundColor: '#F8F8F8',
  minHeight: '100vh',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: '0 8px',
  borderRadius: '4px',
  color: '#000000',
  '&.Mui-selected': {
    backgroundColor: '#FEAF00',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#FEAF00',
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(254, 175, 0, 0.08)',
  },
}));

const LogoutButton = styled(ListItemButton)({
  margin: '0 8px',
  borderRadius: '4px',
  color: '#000000',
  '&:hover': {
    backgroundColor: 'rgba(254, 175, 0, 0.08)',
  },
});

const TitleContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem',
  marginTop: '1rem',
  '& .bar': {
    width: '4px',
    height: '24px',
    backgroundColor: '#FFA500',
    marginRight: '8px',
  },
});

const StyledTextField = styled(TextField)({
  marginBottom: '1rem',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#FFA500',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFA500',
    },
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  position: 'relative',
  '& .bar': {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '24px',
    backgroundColor: '#FFA500',
    marginRight: '8px',
  },
  paddingLeft: '24px',
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f8f9fa',
  },
  '&:hover': {
    backgroundColor: 'rgba(254, 175, 0, 0.04)',
    cursor: 'pointer',
  },
}));

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    padding: '1rem',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

// Add this interface near the top of the file, after imports
interface User {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  enrollNumber?: string | null;
  dateOfAdmission?: string | null;
}

export const Dashboard = () => {
  const { handleLogout, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newStudent, setNewStudent] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  const {
    data: users,
    isLoading,
    error: apiError,
    refetch
  } = useGetUsersQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [addUser, { isLoading: isAdding }] = useRegisterMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (users) {
      console.log('Fetched Users Data:', users);
      // Log the first user's data structure if it exists
      if (users.length > 0) {
        console.log('First User Data Structure:', {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          phone: users[0].phone,
          enrollNumber: users[0].enrollNumber,
          dateOfAdmission: users[0].dateOfAdmission,
          // Log all available fields
          allFields: users[0]
        });
      }
    }
  }, [users]);

  const filteredUsers = users?.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedUsers = filteredUsers?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const onDeleteClick = (user: User) => {
    setSelectedId(user.id);
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      try {
        await deleteUser(selectedId).unwrap();
        setDeleteDialogOpen(false);
        setSelectedId(null);
        toast.success('Student deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } catch (err) {
        console.error('Failed to delete user:', err);
        toast.error('Failed to delete student. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    }
  };

  const handleAddStudent = async () => {
    try {
      if (!newStudent.email || !newStudent.password || !newStudent.username) {
        setError('Please fill in all fields');
        return;
      }
      await addUser(newStudent).unwrap();
      setAddStudentOpen(false);
      setNewStudent({ email: '', password: '', username: '' });
      setError('');
      toast.success('Student created successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      setError('Failed to add student. Please try again.');
      toast.error('Failed to create student. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRowClick = (user: User) => {
    navigate(`/student/${user.id}`);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setViewMode(true);
    setAddStudentOpen(true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderSidebar = () => (
    <StyledDrawer variant="permanent" anchor="left">
      {/* <Typography
        variant="h6"
        sx={{
          textAlign: 'center',
          py: 2,
          fontWeight: 'bold',
          color: '#000000'
        }}
      >
        CRUD OPERATIONS
      </Typography> */}
      <TitleContainer>
        <div className="bar" />
        <Typography variant="h6" fontWeight="bold">
          CRUD OPERATIONS
        </Typography>
      </TitleContainer>
      <ProfileSection>
        <Avatar
          src="/avatar/man.png"
          alt="Karthi Madesh"
          sx={{ width: 100, height: 100 }}
        />
        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
          {user?.name || 'Karthi Madesh'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#000000' }}>
          Admin
        </Typography>
      </ProfileSection>
      <List>
        <StyledListItemButton selected>
          <ListItemText
            primary="Students"
            sx={{
              textAlign: 'center',
              '& .MuiTypography-root': {
                fontWeight: 'medium'
              }
            }}
          />
        </StyledListItemButton>
      </List>
      <Box sx={{ mt: 'auto', mb: 2 }}>
        <LogoutButton onClick={handleLogout}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'center' }}>
            <Typography>Logout</Typography>
            <LogoutIcon fontSize="small" />
          </Box>
        </LogoutButton>
      </Box>
    </StyledDrawer>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        {renderSidebar()}
        <MainContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </MainContent>
      </Box>
    );
  }

  if (apiError) {
    return (
      <Box sx={{ display: 'flex' }}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        {renderSidebar()}
        <MainContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading users. Please try again later.
          </Alert>
          <Button variant="contained" onClick={() => refetch()}>
            Retry
          </Button>
        </MainContent>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {renderSidebar()}
      <MainContent>
        <Container maxWidth="xl">
          <Paper sx={{ p: 3, borderRadius: 2, mt: 3 }}>
            <TitleBar>
              <Typography variant="h6" fontWeight="bold">
                Students List
              </Typography>
            </TitleBar>

            <HeaderContainer>
              <SearchField
                placeholder="Search..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <Button
                variant="contained"
                onClick={() => setAddStudentOpen(true)}
                sx={{
                  bgcolor: '#FFA500',
                  '&:hover': { bgcolor: '#FF8C00' },
                  borderRadius: '20px',
                  textTransform: 'none',
                }}
              >
                ADD NEW STUDENT
              </Button>
            </HeaderContainer>

            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Enroll Number</TableCell>
                    <TableCell>Date of admission</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers?.map((user) => (
                    <StyledTableRow
                      key={user.id}
                      onClick={() => handleRowClick(user)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src="/avatar/man.png" alt={user.username}>
                            {user.username?.charAt(0)}
                          </Avatar>
                        </Box>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {user.enrollNumber || `STU${String(user.id).padStart(4, '0')}`}
                      </TableCell>
                      <TableCell>
                        {user.dateOfAdmission || new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(user);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick(user);
                          }}
                          disabled={isDeleting}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                  {(!filteredUsers || filteredUsers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers?.length || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '.MuiTablePagination-select': {
                    borderRadius: '8px',
                  },
                  '.MuiTablePagination-selectIcon': {
                    color: '#666666',
                  },
                }}
              />
            </StyledTableContainer>
          </Paper>
        </Container>
      </MainContent>

      {/* Modify the Add/View Student Modal */}
      <Dialog
        open={addStudentOpen}
        onClose={() => {
          setAddStudentOpen(false);
          setError('');
          setNewStudent({ email: '', password: '', username: '' });
          setSelectedUser(null);
          setViewMode(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          sx={{
            mt: 2,
          }}
        >
          <StyledDialogTitle>
            <div className="bar" />
            <Typography variant="h5" fontWeight="bold">
              {viewMode ? 'Student Information' : 'Create a new Student'}
            </Typography>
          </StyledDialogTitle>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <StyledTextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={viewMode ? selectedUser?.email : newStudent.email}
            onChange={handleInputChange}
            disabled={viewMode}
          />
          {!viewMode && (
            <StyledTextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={newStudent.password}
              onChange={handleInputChange}
            />
          )}
          <StyledTextField
            fullWidth
            label="Username"
            name="username"
            value={viewMode ? selectedUser?.username : newStudent.username}
            onChange={handleInputChange}
            disabled={viewMode}
          />
          <StyledTextField
            fullWidth
            label="Phone"
            name="phone"
            value={viewMode ? selectedUser?.phone : null}
            onChange={handleInputChange}
            disabled={viewMode}
          />
          <StyledTextField
            fullWidth
            label="Enroll Number"
            name="enrollNumber"
            value={viewMode ? selectedUser?.enrollNumber || `STU${String(selectedUser?.id).padStart(4, '0')}` : null}
            onChange={handleInputChange}
            disabled={viewMode}
          />
          <StyledTextField
            fullWidth
            label="Date of Admission"
            name="dateOfAdmission"
            value={viewMode ? selectedUser?.dateOfAdmission || new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : null}
            onChange={handleInputChange}
            disabled={viewMode}
          />
          {!viewMode && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddStudent}
              disabled={isAdding}
              sx={{
                mt: 2,
                bgcolor: '#FFA500',
                '&:hover': { bgcolor: '#FF8C00' },
                textTransform: 'none',
              }}
            >
              {isAdding ? <CircularProgress size={24} /> : 'SAVE'}
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Update the delete dialog */}
      <StyledDialog
        open={deleteDialogOpen}
        onClose={() => {}}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown
        hideBackdrop={false}
        BackdropProps={{
          sx: { backdropFilter: 'blur(2px)' }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
          >
            <TitleContainer>
              <div className="bar" />
              <Typography variant="h5" fontWeight="bold">
                Delete student?
              </Typography>
            </TitleContainer>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Are you sure you want to delete <strong>{selectedUser?.email}</strong> student?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              sx={{
                color: '#9FA2B4',
                '&:hover': {
                  backgroundColor: 'rgba(159, 162, 180, 0.1)',
                },
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              sx={{
                bgcolor: '#FFA500',
                color: 'white',
                '&:hover': {
                  bgcolor: '#FF8C00',
                },
                textTransform: 'none',
                borderRadius: '8px',
                minWidth: '100px',
              }}
            >
              {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </Box>
        </Box>
      </StyledDialog>
    </Box>
  );
}; 