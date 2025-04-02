import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Box,
  TablePagination,
  styled,
  Paper,
  useTheme,
  useMediaQuery,
  Typography,
  TableSortLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useUploadUserPhotoMutation } from '@/store/api/apiSlice';
import { toast } from 'react-toastify';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
    cursor: 'pointer',
  },
}));

const ResponsiveTableCell = styled(TableCell)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const MobileTableCell = styled(TableCell)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}));

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  enrollNumber?: string | null;
  dateOfAdmission?: string | null;
  photo_url?: string | null;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof User | '';

interface StudentTableProps {
  users: User[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRowClick: (user: User) => void;
  onEditClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
  isDeleting: boolean;
  order: Order;
  orderBy: OrderBy;
  onRequestSort: (property: keyof User) => void;
}

export const StudentTable = ({
  users,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  onEditClick,
  onDeleteClick,
  isDeleting,
  order,
  orderBy,
  onRequestSort,
}: StudentTableProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [uploadPhoto] = useUploadUserPhotoMutation();

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, userId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and GIF files are allowed');
      return;
    }

    try {
      await uploadPhoto({ userId, file }).unwrap();
      toast.success('Photo uploaded successfully');
    } catch (error: any) {
      toast.error(error.data?.detail || 'Failed to upload photo');
    }
  };

  const createSortHandler = (property: keyof User) => () => {
    onRequestSort(property);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'username'}
                direction={orderBy === 'username' ? order : 'asc'}
                onClick={createSortHandler('username')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <ResponsiveTableCell>
              <TableSortLabel
                active={orderBy === 'email'}
                direction={orderBy === 'email' ? order : 'asc'}
                onClick={createSortHandler('email')}
              >
                Email
              </TableSortLabel>
            </ResponsiveTableCell>
            <ResponsiveTableCell>
              <TableSortLabel
                active={orderBy === 'phone'}
                direction={orderBy === 'phone' ? order : 'asc'}
                onClick={createSortHandler('phone')}
              >
                Phone
              </TableSortLabel>
            </ResponsiveTableCell>
            <ResponsiveTableCell>
              <TableSortLabel
                active={orderBy === 'enrollNumber'}
                direction={orderBy === 'enrollNumber' ? order : 'asc'}
                onClick={createSortHandler('enrollNumber')}
              >
                Enroll Number
              </TableSortLabel>
            </ResponsiveTableCell>
            <ResponsiveTableCell>
              <TableSortLabel
                active={orderBy === 'dateOfAdmission'}
                direction={orderBy === 'dateOfAdmission' ? order : 'asc'}
                onClick={createSortHandler('dateOfAdmission')}
              >
                Date of admission
              </TableSortLabel>
            </ResponsiveTableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <StyledTableRow
              key={user.id}
              onClick={() => onRowClick(user)}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar 
                      src={user.photo_url ? `http://localhost:8000${user.photo_url}` : "/avatar/man.png"} 
                      alt={user.username}
                      sx={{ width: 40, height: 40 }}
                    >
                      {user.username?.charAt(0)}
                    </Avatar>
                    <label htmlFor={`photo-upload-${user.id}`}>
                      <input
                        id={`photo-upload-${user.id}`}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handlePhotoUpload(e, user.id)}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    </label>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{user.username}</TableCell>
              <ResponsiveTableCell>{user.email}</ResponsiveTableCell>
              <ResponsiveTableCell>{user.phone || '---'}</ResponsiveTableCell>
              <ResponsiveTableCell>
                {user.enrollNumber || `STU${String(user.id).padStart(4, '0')}`}
              </ResponsiveTableCell>
              <ResponsiveTableCell>
                {user.dateOfAdmission || new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </ResponsiveTableCell>
              <MobileTableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.phone || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.enrollNumber || `STU${String(user.id).padStart(4, '0')}`}
                  </Typography>
                </Box>
              </MobileTableCell>
              <TableCell align="right">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick(user);
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
          {(!users || users.length === 0) && (
            <TableRow>
              <TableCell colSpan={isMobile ? 3 : 7} align="center">
                No students found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 7, 10]}
      />
    </TableContainer>
  );
}; 