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
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useLoginMutation } from '@/store/api/apiSlice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

// Styled components
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

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { handleLogin } = useAuth();
  const [, { isLoading, error }] = useLoginMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      return;
    }

    // Format the credentials
    const credentials = {
      username: username.trim(),
      password: password.trim(),
    };

    try {
      await handleLogin(credentials);
    } catch (err) {
      // Error is handled by RTK Query
    }
  };

  const getErrorMessage = (error: FetchBaseQueryError | SerializedError) => {
    if ('data' in error) {
      return error.data as string;
    }
    return 'Login failed. Please try again.';
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
              SIGN IN
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter your credentials to access your account.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {getErrorMessage(error)}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Email"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              sx={{ mb: 2 }}
            />

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 2, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'SIGN IN'}
            </StyledButton>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: '#FFA500',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Register
                </Link>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>
      </Container>
    </GradientBackground>
  );
}; 