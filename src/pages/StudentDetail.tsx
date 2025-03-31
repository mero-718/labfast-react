import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  styled,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useGetUserQuery } from '../store/api/apiSlice';
import { Sidebar } from '../components/common/Sidebar';

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
  marginLeft: '280px',
}));

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentData, isLoading, error } = useGetUserQuery(Number(id));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar selected />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" width="100%">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !studentData) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar selected />
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
      <Sidebar selected />
      <MainContent>
        <Container maxWidth="xl">
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
                <BadgeIcon sx={{ fontSize: 40, color: '#0EA5E9', mb: 1 }} />
                <Typography className="label">ID</Typography>
                <Typography className="value">{studentData.id}</Typography>
              </InfoCard>
              <InfoCard sx={{ backgroundColor: '#FEF6FB' }}>
                <EmailIcon sx={{ fontSize: 40, color: '#EC4899', mb: 1 }} />
                <Typography className="label">Email</Typography>
                <Typography className="value" sx={{ wordBreak: 'break-all' }}>{studentData.email}</Typography>
              </InfoCard>
              <InfoCard sx={{ backgroundColor: '#FEAF00' }}>
                <PersonIcon sx={{ fontSize: 40, color: '#fff', mb: 1 }} />
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