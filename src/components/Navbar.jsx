import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Slide,
  Badge,
  Tooltip,
  Avatar,
  Stack,
  ListItemButton,
  ListItemIcon,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Menu as MenuIcon, Close as CloseIcon, Notifications as NotificationsIcon, Person as PersonIcon, FormatListBulleted as FormatListBulletedIcon, Settings as SettingsIcon, Logout as LogoutIcon, Login as LoginIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCalendarAlt, faUsers, faUserGraduate } from '@fortawesome/free-solid-svg-icons';
import NotificationCenter from './notifications/NotificationCenter';

// Özel stillendirilmiş bileşenler
const NavbarContainer = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(to right, #ffffff, #f9faff)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  borderBottom: '1px solid rgba(55, 81, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  position: 'sticky',
  top: 0,
  zIndex: 1100,
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#303551',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  padding: '8px 16px',
  borderRadius: '12px',
  fontFamily: '"Montserrat", sans-serif',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    color: '#6366F1',
    background: 'rgba(99, 102, 241, 0.08)',
    transform: 'translateY(-2px)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '5px',
    left: '50%',
    width: '0%',
    height: '2px',
    backgroundColor: '#6366F1',
    transition: 'all 0.3s ease',
    transform: 'translateX(-50%)',
    opacity: 0,
  },
  '&:hover::after': {
    width: '40%',
    opacity: 1,
  },
  '&.active': {
    color: '#6366F1',
    '&::after': {
      width: '60%',
      opacity: 1,
    }
  }
}));

const BlueButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  color: '#ffffff',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: '0 5px 15px rgba(99, 102, 241, 0.3)',
  transition: 'all 0.3s ease',
  fontFamily: '"Poppins", sans-serif',
  '&:hover': {
    background: 'linear-gradient(135deg, #7577F5 0%, #5A52E7 100%)',
    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
    transform: 'translateY(-3px)',
  },
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  color: '#6366F1',
  fontWeight: 600,
  padding: '10px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '0.95rem',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  fontFamily: '"Poppins", sans-serif',
  border: '2px solid',
  borderColor: 'rgba(99, 102, 241, 0.5)',
  backdropFilter: 'blur(8px)',
  '&:hover': {
    borderColor: '#6366F1',
    background: 'rgba(99, 102, 241, 0.08)',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
    transform: 'translateY(-3px)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 900,
  letterSpacing: '0.05em',
  fontFamily: '"Poppins", "Montserrat", sans-serif',
  textShadow: '0 2px 10px rgba(99, 102, 241, 0.2)',
}));

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Scroll olayını dinle
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleNavigation = (path) => {
    handleCloseNavMenu();
    navigate(path);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      handleCloseUserMenu();
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  const menuItems = [
    { text: 'Ana Sayfa', path: '/', icon: faHome },
    { text: 'Etkinlikler', path: '/events', icon: faCalendarAlt },
    { text: 'Kulüpler', path: '/clubs', icon: faUsers },
    { text: 'Öğrenciler', path: '/students', icon: faUserGraduate },
  ];

  const drawer = (
    <Box
      sx={{ 
        width: 270, 
        height: '100%',
        background: 'linear-gradient(160deg, #ffffff 0%, #f9faff 100%)',
        color: '#253858',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 0',
      }}
      role="presentation"
      onClick={() => setDrawerOpen(false)}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
      }}>
        <LogoText variant="h5" sx={{ fontSize: '1.7rem', fontWeight: 800 }}>
          YEB
        </LogoText>
        <IconButton onClick={() => setDrawerOpen(false)} sx={{ 
          color: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          borderRadius: '10px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            transform: 'scale(1.05)'
          }
        }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ flexGrow: 1, px: 1, mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={Link} 
            to={item.path}
            disablePadding
            sx={{ 
              mb: 1,
            }}
          >
            <ListItemButton
              selected={location.pathname === item.path}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: '12px',
                backgroundColor: location.pathname === item.path 
                  ? 'rgba(99, 102, 241, 0.1)' 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                },
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&::before': location.pathname === item.path ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '60%',
                  backgroundColor: '#6366F1',
                  borderRadius: '0 4px 4px 0',
                } : {},
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? '#6366F1' : '#64748B' }}>
                <FontAwesomeIcon icon={item.icon} />
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  color: location.pathname === item.path ? '#6366F1' : '#64748B',
                  fontSize: '0.95rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2, mx: 2, backgroundColor: 'rgba(99, 102, 241, 0.1)' }} />
      <Box sx={{ p: 2 }}>
        {isAuthenticated && user ? (
          <>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3, 
              p: 2,
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.05)'
            }}>
              <Avatar 
                alt={user?.name || 'Kullanıcı'} 
                src={user?.profileImageUrl} 
                sx={{ 
                  backgroundColor: user?.profileImageUrl ? 'transparent' : '#6366F1', 
                  width: 42, 
                  height: 42,
                  border: '2px solid rgba(99, 102, 241, 0.3)',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                }}
              >
                {!user?.profileImageUrl && (user?.name?.charAt(0) || 'K')}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user?.name || 'Kullanıcı'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || ''}
                </Typography>
              </Box>
            </Box>
            <Button
              fullWidth
              component={Link}
              to="/profile"
              variant="outlined"
              color="primary"
              startIcon={<PersonIcon />}
              sx={{ 
                mb: 2, 
                py: 1.2, 
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)'
                }
              }}
            >
              Profilim
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogout}
              color="primary"
              startIcon={<LogoutIcon />}
              sx={{ 
                py: 1.2, 
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              }}
            >
              Çıkış Yap
            </Button>
          </>
        ) : (
          <Stack spacing={2}>
            <Button 
              fullWidth 
              component={Link} 
              to="/login"
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              sx={{
                py: 1.2,
                borderRadius: '10px',
                fontFamily: '"Poppins", sans-serif',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              }}
            >
              Giriş Yap
            </Button>
            <Button 
              fullWidth 
              component={Link} 
              to="/register"
              variant="outlined"
              color="primary"
              startIcon={<PersonAddIcon />}
              sx={{
                py: 1.2,
                borderRadius: '10px',
                fontFamily: '"Poppins", sans-serif',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                }
              }}
            >
              Kayıt Ol
            </Button>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <NavbarContainer position="sticky" elevation={scrolled ? 2 : 0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo - Her zaman görünür */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LogoText 
                variant="h5" 
                component={Link} 
                to="/" 
                sx={{ 
                  textDecoration: 'none',
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  fontSize: "1.8rem"
                }}
              >
                YEB
              </LogoText>
            </Box>
          </motion.div>

          {/* Mobil menü */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              aria-label="mobil menü aç"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                color: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{
                sx: {
                  borderRadius: '0 16px 16px 0',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              {drawer}
            </Drawer>
          </Box>

          {/* Mobil ekranda logo - ortada */}
          <LogoText 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: "1.5rem"
            }}
          >
            YEB
          </LogoText>

          {/* Masaüstü Menü */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {menuItems.map((item) => (
              <NavButton
                key={item.text}
                component={Link}
                to={item.path}
                onClick={handleCloseNavMenu}
                className={location.pathname === item.path ? 'active' : ''}
                sx={{ 
                  mx: 1.5,
                  background: location.pathname === item.path ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  color: location.pathname === item.path ? '#6366F1' : '#303551',
                }}
              >
                {item.text}
              </NavButton>
            ))}
          </Box>

          {/* Kullanıcı menüsü veya giriş/kayıt butonları */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isAuthenticated && user ? (
              <>
                <Tooltip title="Bildirimler">
                  <Box 
                    sx={{ 
                      mr: 2,
                      cursor: 'pointer',
                      display: 'flex'
                    }}
                  >
                    <NotificationCenter />
                  </Box>
                </Tooltip>
                
                <Tooltip title="Kullanıcı menüsü">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ 
                      p: 0,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    <Avatar 
                      alt={user?.name || 'Kullanıcı'} 
                      src={user?.profileImageUrl} 
                      sx={{ 
                        backgroundColor: user?.profileImageUrl ? 'transparent' : '#6366F1', 
                        width: 40, 
                        height: 40,
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)',
                      }}
                    >
                      {!user?.profileImageUrl && (user?.name?.charAt(0) || 'K')}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      borderRadius: '16px',
                      minWidth: 220,
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.1))',
                      mt: 1.5,
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  }}
                >
                  <Box sx={{ 
                    px: 2, 
                    py: 1.5,
                    borderBottom: '1px solid rgba(0,0,0,0.08)'
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {user?.name || 'Kullanıcı'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                      {user?.email || ''}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      display: 'inline-block', 
                      mt: 0.5,
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 'medium'
                    }}>
                      {user?.role || 'Öğrenci'}
                    </Typography>
                  </Box>
                  
                  <MenuItem onClick={() => {
                    handleCloseUserMenu();
                    navigate('/profile');
                  }}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    borderRadius: '8px',
                    mx: 1,
                    mt: 1,
                    '&:hover': { 
                      backgroundColor: 'rgba(99, 102, 241, 0.08)'
                    }
                  }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" sx={{ color: '#6366F1' }} />
                    </ListItemIcon>
                    <ListItemText primary="Profil" />
                  </MenuItem>
                  
                  <MenuItem onClick={() => {
                    handleCloseUserMenu();
                    navigate('/waiting-list');
                  }}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    borderRadius: '8px',
                    mx: 1,
                    '&:hover': { 
                      backgroundColor: 'rgba(99, 102, 241, 0.08)'
                    }
                  }}>
                    <ListItemIcon>
                      <FormatListBulletedIcon fontSize="small" sx={{ color: '#6366F1' }} />
                    </ListItemIcon>
                    <ListItemText primary="Katılım Listelerim" />
                  </MenuItem>
                  
                  <MenuItem onClick={handleLogout}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    borderRadius: '8px',
                    mx: 1,
                    mb: 1,
                    '&:hover': { 
                      backgroundColor: 'rgba(244, 67, 54, 0.08)'
                    }
                  }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: '#f44336' }} />
                    </ListItemIcon>
                    <ListItemText primary="Çıkış Yap" primaryTypographyProps={{ sx: { '&:hover': { color: '#f44336' }}}} />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' }}}>
                <OutlinedButton 
                  component={Link} 
                  to="/login"
                  variant="outlined"
                  startIcon={<LoginIcon />}
                >
                  Giriş Yap
                </OutlinedButton>
                <BlueButton
                  component={Link}
                  to="/register"
                  variant="contained"
                  disableElevation
                  startIcon={<PersonAddIcon />}
                >
                  Kaydol
                </BlueButton>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </Container>
    </NavbarContainer>
  );
};

export default Navbar; 