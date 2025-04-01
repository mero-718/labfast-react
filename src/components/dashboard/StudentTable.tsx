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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

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
}

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
}: StudentTableProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Name</TableCell>
            <ResponsiveTableCell>Email</ResponsiveTableCell>
            <ResponsiveTableCell>Phone</ResponsiveTableCell>
            <ResponsiveTableCell>Enroll Number</ResponsiveTableCell>
            <ResponsiveTableCell>Date of admission</ResponsiveTableCell>
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
                  <Avatar src="/avatar/man.png" alt={user.username}>
                    {user.username?.charAt(0)}
                  </Avatar>
                </Box>
              </TableCell>
              <TableCell>{user.username}</TableCell>
              <ResponsiveTableCell>{user.email}</ResponsiveTableCell>
              <ResponsiveTableCell>{user.phone || '-'}</ResponsiveTableCell>
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