import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  styled,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

// Styled components (reusing from Login)
const GradientBackground = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: 'linear-gradient(135deg, #FFA500 0%, #FFD700 100%)',
});

const StyledPaper = styled(Paper)({
  padding: '2rem',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
});

const TitleContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1.5rem',
  '& .bar': {
    width: '4px',
    height: '24px',
    backgroundColor: '#FFA500',
    marginRight: '8px',
  },
});

const StyledButton = styled(Button)({
  backgroundColor: '#FFA500',
  color: 'white',
  padding: '0.75rem',
  '&:hover': {
    backgroundColor: '#FF8C00',
  },
});

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { handleRegister } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log(email, password, username);
      await handleRegister(email, password, username);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <GradientBackground>
      <Container maxWidth="sm">
        <StyledPaper>
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
                CRUD OPERATIONS
              </Typography>
            </TitleContainer>
            <Typography variant="h6" gutterBottom>
              SIGN UP
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter your credentials to create your account.
            </Typography>
          </Box>


          <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ mb: 2 }}
            />

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
            >
              REGISTER
            </StyledButton>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#FFA500',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </GradientBackground>
  );
}; 