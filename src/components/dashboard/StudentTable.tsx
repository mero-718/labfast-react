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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#f8f9fa',
  },
  '&:hover': {
    backgroundColor: 'rgba(254, 175, 0, 0.04)',
    cursor: 'pointer',
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
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  onEditClick,
  onDeleteClick,
  isDeleting,
}: StudentTableProps) => {
  return (
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
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
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
  );
}; 