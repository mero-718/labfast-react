import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: '#F8F8F8',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex' }}>
      <MainContent>
        <Container>
          <Box
            sx={{
              textAlign: 'center',
              '& h1': {
                fontSize: '8rem',
                fontWeight: 'bold',
                color: '#FFA500',
                marginBottom: '1rem',
              },
              '& h2': {
                fontSize: '2rem',
                color: '#666',
                marginBottom: '2rem',
              },
            }}
          >
            <Typography variant="h1">404</Typography>
            <Typography variant="h2">Page Not Found</Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
              The page you are looking for doesn't exist or has been moved.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              sx={{
                bgcolor: '#FFA500',
                '&:hover': { bgcolor: '#FF8C00' },
                borderRadius: '20px',
                textTransform: 'none',
                px: 4,
                py: 1,
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Container>
      </MainContent>
    </Box>
  );
};