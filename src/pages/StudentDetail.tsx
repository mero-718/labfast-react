import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  styled,
  Avatar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useGetUserQuery } from '../store/api/apiSlice';
import { useAuth } from '../hooks/useAuth';

const DRAWER_WIDTH = 280;

const StyledDrawer = styled(Drawer)({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    backgroundColor: '#F2EAE1',
    color: '#000000',
    padding: '0 16px',
  },
});

const ProfileSection = styled(Box)({
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  '& .MuiAvatar-root': {
    width: 100,
    height: 100,
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

const StyledListItemButton = styled(ListItemButton)({
  margin: '0 8px',
  borderRadius: '4px',
  color: '#000000',
  '&.Mui-selected': {
    backgroundColor: '#FEAF00',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#FEAF00',
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(254, 175, 0, 0.08)',
  },
});

const LogoutButton = styled(ListItemButton)({
  margin: '0 8px',
  borderRadius: '4px',
  color: '#000000',
  '&:hover': {
    backgroundColor: 'rgba(254, 175, 0, 0.08)',
  },
});

const DetailContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const DetailItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .label': {
    color: '#666',
    marginBottom: theme.spacing(0.5),
  },
  '& .value': {
    fontWeight: 500,
  },
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 300,
  '& .label': {
    color: '#666',
    fontSize: '0.875rem',
  },
  '& .value': {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: '#F8F8F8',
  minHeight: '100vh',
}));

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { handleLogout, user } = useAuth();
  const { data: studentData, isLoading, error } = useGetUserQuery(Number(id));

  const renderSidebar = () => (
    <StyledDrawer variant="permanent" anchor="left">
      <TitleContainer>
        <div className="bar" />
        <Typography variant="h6" fontWeight="bold">
          CRUD OPERATIONS
        </Typography>
      </TitleContainer>
      <ProfileSection>
        <Avatar
          src="/avatar/man.png"
          alt="Karthi Madesh"
          sx={{ width: 100, height: 100 }}
        />
        <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
          {user?.name || 'Karthi Madesh'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#000000' }}>
          Admin
        </Typography>
      </ProfileSection>
      <List>
        <StyledListItemButton selected onClick={() => navigate('/dashboard')}>
          <ListItemText
            primary="Students"
            sx={{
              textAlign: 'center',
              '& .MuiTypography-root': {
                fontWeight: 'medium'
              }
            }}
          />
        </StyledListItemButton>
      </List>
      <Box sx={{ mt: 'auto', mb: 2 }}>
        <LogoutButton onClick={handleLogout}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'center' }}>
            <Typography>Logout</Typography>
            <LogoutIcon fontSize="small" />
          </Box>
        </LogoutButton>
      </Box>
    </StyledDrawer>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex' }}>
        {renderSidebar()}
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" width="100%">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !studentData) {
    return (
      <Box sx={{ display: 'flex' }}>
        {renderSidebar()}
        <MainContent>
          <Container>
            <Box my={4}>
              <Typography variant="h6" color="error">
                Error loading student details. Please try again later.
              </Typography>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ mt: 2 }}
              >
                Go Back
              </Button>
            </Box>
          </Container>
        </MainContent>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {renderSidebar()}
      <MainContent>
        <Container>
          <Box mb={4}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{ mb: 3 }}
            >
              Back to Students List
            </Button>

            {/* Info Cards */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
              <InfoCard sx={{ backgroundColor: '#F0F9FF' }}>
                <Typography className="label">ID</Typography>
                <Typography className="value">{studentData.id}</Typography>
              </InfoCard>
              <InfoCard sx={{ backgroundColor: '#FEF6FB' }}>
                <Typography className="label">Email</Typography>
                <Typography className="value" sx={{ wordBreak: 'break-all' }}>{studentData.email}</Typography>
              </InfoCard>
              <InfoCard sx={{ backgroundColor: '#FEAF00' }}>
                <Typography className="label" sx={{ color: '#fff' }}>Username</Typography>
                <Typography className="value" sx={{ color: '#fff' }}>{studentData.username}</Typography>
              </InfoCard>
            </Box>
          </Box>
        </Container>
      </MainContent>
    </Box>
  );
};

export default StudentDetail; 