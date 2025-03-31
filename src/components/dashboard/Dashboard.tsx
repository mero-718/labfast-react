import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  styled,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { useGetUsersQuery, useDeleteUserMutation, useRegisterMutation, useUpdateUserMutation } from '../../store/api/apiSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { StudentTable } from './StudentTable';
import { StudentFormDialog } from './StudentFormDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
  backgroundColor: '#F8F8F8',
  minHeight: '100vh',
  marginLeft: '280px',
}));

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

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  enrollNumber?: string | null;
  dateOfAdmission?: string | null;
}

export const Dashboard = () => {
  const navigate = useNavigate();
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
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (users) {
      console.log('Fetched Users Data:', users);
      if (users.length > 0) {
        console.log('First User Data Structure:', {
          id: users[0].id,
          username: users[0].username,
          email: users[0].email,
          phone: users[0].phone,
          enrollNumber: users[0].enrollNumber,
          dateOfAdmission: users[0].dateOfAdmission,
          allFields: users[0]
        });
      }
    }
  }, [users]);

  const filteredUsers = users?.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const totalCount = filteredUsers.length;
  const paginatedUsers = filteredUsers.slice(
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
      if (viewMode && selectedUser) {
        // Update existing user
        if (!selectedUser.username || !selectedUser.email) {
          setError('Please fill in all required fields');
          return;
        }
        await updateUser({
          id: selectedUser.id,
          username: selectedUser.username,
          email: selectedUser.email,
          phone: selectedUser.phone || '',
          enrollNumber: selectedUser.enrollNumber || '',
          dateOfAdmission: selectedUser.dateOfAdmission || '',
        }).unwrap();
        setAddStudentOpen(false);
        setSelectedUser(null);
        setViewMode(false);
        toast.success('Student updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } else {
        // Create new user
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
      }
    } catch (err) {
      setError(viewMode ? 'Failed to update student. Please try again.' : 'Failed to add student. Please try again.');
      toast.error(viewMode ? 'Failed to update student. Please try again.' : 'Failed to create student. Please try again.', {
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
        <Sidebar selected />
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
        <Sidebar selected />
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
      <Sidebar selected />
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
                onClick={() => {
                  setViewMode(false);
                  setSelectedUser(null);
                  setAddStudentOpen(true);
                }}
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

            <StudentTable
              users={paginatedUsers}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onRowClick={handleRowClick}
              onEditClick={handleEditClick}
              onDeleteClick={onDeleteClick}
              isDeleting={isDeleting}
            />
          </Paper>
        </Container>
      </MainContent>

      <StudentFormDialog
        open={addStudentOpen}
        onClose={() => {
          setAddStudentOpen(false);
          setError('');
          setNewStudent({ email: '', password: '', username: '' });
          setSelectedUser(null);
          setViewMode(false);
        }}
        onSubmit={handleAddStudent}
        error={error}
        viewMode={viewMode}
        selectedUser={selectedUser}
        newStudent={newStudent}
        onInputChange={handleInputChange}
        isSubmitting={isAdding || isUpdating}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        email={selectedUser?.email || ''}
        isDeleting={isDeleting}
      />
    </Box>
  );
}; 