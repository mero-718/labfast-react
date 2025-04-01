import {
  Box,
  Typography,
  styled,
  Avatar,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  ExitToApp as LogoutIcon,
  People as PeopleIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const DRAWER_WIDTH = 280;

const StyledDrawer = styled('div')(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  backgroundColor: '#F2EAE1',
  color: '#000000',
  padding: '0 16px',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    backgroundColor: '#F2EAE1',
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
}));

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
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
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

const LogoutContainer = styled(Box)({
  marginTop: 'auto',
  padding: '16px 0',
  width: '100%',
});

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: 26,
  left: 20,
  zIndex: 1200,
  '&:hover': {
    backgroundColor: '#F2EAE1',
  },
  [theme.breakpoints.up('sm')]: {
    display: 'none',
  },
}));

interface SidebarProps {
  selected?: boolean;
  onStudentsClick?: () => void;
  onClose?: () => void;
}

export const Sidebar = ({ selected = false, onStudentsClick, }: SidebarProps) => {
  const navigate = useNavigate();
  const { handleLogout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = () => {
    if (onStudentsClick) {
      onStudentsClick();
    } else {
      navigate('/dashboard');
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <>
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
        <StyledListItemButton 
          selected={selected} 
          onClick={handleNavigation}
        >
          <ListItemText
            primary="Students"
            sx={{
              textAlign: 'center',
              '& .MuiTypography-root': {
                fontWeight: 'medium'
              }
            }}
          />
          <PeopleIcon sx={{ mr: 1, color: selected ? 'white' : '#FEAF00' }} />
        </StyledListItemButton>
      </List>
      <LogoutContainer>
        <LogoutButton onClick={handleLogout}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'center' }}>
            <Typography>Logout</Typography>
            <LogoutIcon fontSize="small" />
          </Box>
        </LogoutButton>
      </LogoutContainer>
    </>
  );

  return (
    <>
      <MobileMenuButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
      >
        <MenuIcon />
      </MobileMenuButton>
      <StyledDrawer>
        {drawerContent}
      </StyledDrawer>
      <MobileDrawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawerContent}
      </MobileDrawer>
    </>
  );
}; 