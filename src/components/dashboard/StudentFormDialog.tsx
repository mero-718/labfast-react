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
  onUserUpdate: (updatedUser: User) => void;
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
  onUserUpdate,
  isSubmitting,
}: StudentFormDialogProps) => {

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (viewMode && selectedUser) {
      try {
        // Update the selectedUser object directly
        const updatedUser = {
          ...selectedUser,
          [name]: value
        };

        // Update the parent component's state
        onUserUpdate(updatedUser);

      } catch (err) {
        console.error('Failed to update field:', err);
      }
    } else {
      onInputChange(e);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => { }}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      hideBackdrop={false}
      BackdropProps={{
        sx: { backdropFilter: 'blur(2px)' }
      }}
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
            {viewMode ? 'Edit Student Information' : 'Create a new Student'}
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
          disabled={false}
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
          onChange={handleInputChange}
          disabled={false}
        />
        {viewMode && (
          <StyledTextField
            fullWidth
            label="Phone"
            name="phone"
            value={selectedUser?.phone || '---'}
            onChange={handleInputChange}
            disabled={false}
          />
        )}
        {viewMode && (
          <StyledTextField
            fullWidth
            label="Enroll Number"
            name="enrollNumber"
            value={selectedUser?.enrollNumber || `STU${String(selectedUser?.id).padStart(4, '0')}`}
            onChange={handleInputChange}
            disabled={false}
          />
        )}
        {viewMode && (
          <StyledTextField
            fullWidth
            label="Date of Admission"
            name="dateOfAdmission"
            value={selectedUser?.dateOfAdmission || new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            onChange={handleInputChange}
            disabled={false}
          />
        )}
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              borderColor: '#FFA500',
              color: '#FFA500',
              '&:hover': {
                borderColor: '#FF8C00',
                backgroundColor: 'rgba(255, 165, 0, 0.04)',
              },
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={onSubmit}
            disabled={isSubmitting}
            sx={{
              bgcolor: '#FFA500',
              '&:hover': { bgcolor: '#FF8C00' },
              textTransform: 'none',
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : viewMode ? (
              'Update'
            ) : (
              'Save'
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 