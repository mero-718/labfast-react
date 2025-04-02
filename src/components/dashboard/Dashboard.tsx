import { useState, useEffect, useMemo } from 'react';
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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { useGetUsersQuery, useDeleteUserMutation, useRegisterMutation, useUpdateUserMutation } from '@/store/api/apiSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/common/Sidebar';
import { StudentTable } from '@/components/dashboard/StudentTable';
import { StudentFormDialog } from '@/components/dashboard/StudentFormDialog';
import { DeleteConfirmationDialog } from '@/components/dashboard/DeleteConfirmationDialog';
import { useDebounce } from '@/hooks/useDebounce';

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(1),
  backgroundColor: '#F8F8F8',
  minHeight: '100vh',
  marginLeft: '280px',
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    padding: theme.spacing(1),
  },
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

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  marginTop: '2rem',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'stretch',
  },
}));

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

const toastConfig = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light" as const,
};

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  enrollNumber?: string | null;
  dateOfAdmission?: string | null;
  photo_url?: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof User | ''>('');

  const {
    data: users,
    isLoading,
    error: Error,
    refetch
  } = useGetUsersQuery({ skip: 0, limit: 100 }, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [addUser, { isLoading: isAdding }] = useRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    if (!debouncedSearchTerm) return users;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return users.filter((user) => {
      const searchableFields = [
        user.username,
        user.email,
      ].filter(Boolean).map(String);

      return searchableFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
    });
  }, [users, debouncedSearchTerm]);

  const totalCount = filteredUsers.length;

  const sortUsers = (users: User[]) => {
    if (!orderBy) return users;

    return [...users].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle date strings
      if (orderBy === 'dateOfAdmission') {
        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        return order === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      // Handle numbers
      return order === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  };

  // Apply sorting to filtered users
  const sortedUsers = useMemo(() => sortUsers(filteredUsers), [filteredUsers, order, orderBy]);

  // Apply pagination to sorted users
  const paginatedUsers = useMemo(() => {
    return sortedUsers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedUsers, page, rowsPerPage]);

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
        toast.success('Student deleted successfully!', toastConfig);
        refetch();
      } catch (err) {
        console.error('Failed to delete user:', err);
        toast.error('Failed to delete student. Please try again.', toastConfig);
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
          data: {
            username: selectedUser.username,
            email: selectedUser.email,
          }
        }).unwrap();
        setAddStudentOpen(false);
        setSelectedUser(null);
        setViewMode(false);
        toast.success('Student updated successfully!', toastConfig);
        refetch();
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
        toast.success('Student created successfully!', toastConfig);
        // Refetch the users list to update the table
        refetch();
      }
    } catch (err: any) {
      const errorMessage = err.data?.detail || (viewMode ? 'Failed to update student. Please try again.' : 'Failed to create student. Please try again.');
      setError(errorMessage);
      toast.error(errorMessage, toastConfig);
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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setSelectedUser(updatedUser);
  };

  const handleRequestSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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
        <Sidebar />
        <MainContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </MainContent>
      </Box>
    );
  }

  if (Error) {
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
        <Sidebar />
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
      <Sidebar />
      <MainContent>
        <Container maxWidth="xl" sx={{ padding: 0 }}>
          <Paper sx={{ p: 3, borderRadius: 2, mt: isMobile ? 0 : 3 }}>
            <TitleBar sx={{ marginLeft: isMobile ? 2 : 0 }}>
              <Typography variant="h6" fontWeight="bold">
                Students List
              </Typography>
            </TitleBar>

            <HeaderContainer>
              <SearchField
                placeholder="Search by name, email, phone, or enrollment number..."
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
                sx={{ width: isMobile ? '100%' : 300 }}
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
                  width: isMobile ? '100%' : 'auto',
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
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
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
        onUserUpdate={handleUserUpdate}
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

export default Dashboard; 