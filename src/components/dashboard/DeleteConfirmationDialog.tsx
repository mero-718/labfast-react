import {
  Dialog,
  Box,
  Typography,
  Button,
  CircularProgress,
  styled,
} from '@mui/material';

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    padding: '1rem',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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

interface DeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  email: string;
  isDeleting: boolean;
}

export const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  email,
  isDeleting,
}: DeleteConfirmationDialogProps) => {
  return (
    <StyledDialog
      open={open}
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
          Are you sure you want to delete <strong>{email}</strong> student?
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            onClick={onClose}
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
            onClick={onConfirm}
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
  );
}; 