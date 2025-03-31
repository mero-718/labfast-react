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
  DialogActions,
  styled,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useGetUsersQuery, useDeleteUserMutation, useRegisterMutation } from '../store/api/apiSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  marginBottom: '1rem',
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

  const onDeleteClick = (id: number) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      try {
        await deleteUser(selectedId).unwrap();
        setDeleteDialogOpen(false);
        setSelectedId(null);
      } catch (err) {
        console.error('Failed to delete user:', err);
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
          <Paper sx={{ p: 3, borderRadius: 2 }}>
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
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {/* <Avatar src={user.avatar} alt={user.username}> */}
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
                        <IconButton color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => onDeleteClick(user.id)}
                          disabled={isDeleting}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </Paper>
        </Container>
      </MainContent>

      {/* Add Student Modal */}
      <Dialog
        open={addStudentOpen}
        onClose={() => {
          setAddStudentOpen(false);
          setError('');
          setNewStudent({ email: '', password: '', username: '' });
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
            <Typography variant="h5" fontWeight="bold">Create a new Student</Typography>
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
            value={newStudent.email}
            onChange={handleInputChange}
          />
          <StyledTextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={newStudent.password}
            onChange={handleInputChange}
          />
          <StyledTextField
            fullWidth
            label="Username"
            name="username"
            value={newStudent.username}
            onChange={handleInputChange}
          />
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
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this student?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 