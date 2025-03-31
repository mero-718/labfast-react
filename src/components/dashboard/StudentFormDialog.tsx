import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  Typography,
  styled,
} from '@mui/material';

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

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  enrollNumber?: string | null;
  dateOfAdmission?: string | null;
}

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  error: string;
  viewMode: boolean;
  selectedUser: User | null;
  newStudent: {
    email: string;
    password: string;
    username: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
}

export const StudentFormDialog = ({
  open,
  onClose,
  onSubmit,
  error,
  viewMode,
  selectedUser,
  newStudent,
  onInputChange,
  isSubmitting,
}: StudentFormDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          onChange={onInputChange}
          disabled={viewMode}
        />
        {!viewMode && (
          <StyledTextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={newStudent.password}
            onChange={onInputChange}
          />
        )}
        <StyledTextField
          fullWidth
          label="Username"
          name="username"
          value={viewMode ? selectedUser?.username : newStudent.username}
          onChange={onInputChange}
          disabled={viewMode}
        />
        {viewMode && (
          <StyledTextField
            fullWidth
            label="Phone"
            name="phone"
            value={viewMode ? selectedUser?.phone : ''}
            onChange={onInputChange}
            disabled={viewMode}
          />
        )}
        {viewMode && (
          <StyledTextField
            fullWidth
            label="Enroll Number"
            name="enrollNumber"
            value={viewMode ? selectedUser?.enrollNumber : ''}
            onChange={onInputChange}
            disabled={viewMode}
          />
        )}
        {viewMode && (
          <StyledTextField
            fullWidth
            label="Date of Admission"
            name="dateOfAdmission"
            value={viewMode ? selectedUser?.dateOfAdmission : ''}
            onChange={onInputChange}
            disabled={viewMode}
          />
        )}
        {!viewMode && (
          <Button
            fullWidth
            variant="contained"
            onClick={onSubmit}
            disabled={isSubmitting}
            sx={{
              mt: 2,
              bgcolor: '#FFA500',
              '&:hover': { bgcolor: '#FF8C00' },
              textTransform: 'none',
            }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'SAVE'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}; 