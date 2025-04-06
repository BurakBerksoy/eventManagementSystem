import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  Grid,
  Badge,
  Chip,
  useScrollTrigger,
  Slide,
  Fab,
  InputBase,
  Zoom,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Event as EventIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  ExpandLess,
} from '@mui/icons-material';
import { fadeInUpVariants, fadeInLeftVariants, fadeInRightVariants, logoVariants, buttonVariants, cardVariants } from '../../utils/animations.jsx';
import { faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../Navbar';
import Footer from '../../components/Footer';

// Navbar'ın scroll durumunda gizlenme/gösterilme davranışı
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// Sayfa başına dön butonu
function ScrollTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Box
      position="fixed"
      bottom={20}
      right={20}
      zIndex={1000}
    >
      <Slide direction="up" in={trigger} mountOnEnter unmountOnExit>
        <Fab
          size="small"
          aria-label="scroll back to top"
          onClick={handleClick}
          component={motion.div}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          sx={{ 
            boxShadow: '0px 4px 10px rgba(55, 81, 255, 0.3)',
            background: '#3751FF',
            color: 'white',
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Slide>
    </Box>
  );
}

// Sayfa linkleri
const pages = [
  { name: 'Ana Sayfa', path: '/', icon: 'home' },
  { name: 'Etkinlikler', path: '/events', icon: 'calendar-alt' },
  { name: 'Kulüpler', path: '/clubs', icon: 'users' },
  { name: 'Öğrenciler', path: '/students', icon: 'user' },
];

const MainLayout = () => {
  // Auth context'ten user bilgisini alalım
  const { user, logout } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
  
  const handleNavigation = (path) => {
    setMobileOpen(false);
    navigate(path);
  };
  
  // Sayfa aşağı kaydırıldığında scroll-to-top butonunu göster
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const drawer = (
    <Box 
      onClick={handleDrawerToggle} 
      sx={{ 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        py: 2,
        backgroundColor: '#FFFFFF',
      }}
    >
      <Typography
        variant="h5"
        component={motion.h6}
        variants={logoVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        sx={{ 
          mb: 3,
          mt: 1,
          fontWeight: 800, 
          letterSpacing: '.2rem',
          color: '#3751FF',
        }}
      >
        EYS
      </Typography>
      <Divider sx={{ 
        mb: 3, 
        background: 'rgba(55, 81, 255, 0.1)',
        height: '1px'
      }} />
      <List sx={{ flex: 1 }}>
        {pages.map((page, index) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton 
              sx={{ 
                textAlign: 'left',
                borderRadius: '10px',
                mx: 1,
                my: 0.5,
                px: 2,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: location.pathname === page.path ? 'rgba(55, 81, 255, 0.08)' : 'transparent',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: '#3751FF',
                  opacity: location.pathname === page.path ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                },
              }}
              onClick={() => handleNavigation(page.path)}
              selected={location.pathname === page.path}
              component={motion.div}
              variants={fadeInLeftVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              whileHover={{ 
                scale: 1.03, 
                backgroundColor: 'rgba(55, 81, 255, 0.08)',
                x: 4
              }}
              whileTap={{ scale: 0.98 }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: location.pathname === page.path ? '#3751FF' : 'inherit',
                transition: 'color 0.3s ease'
              }}>
                <FontAwesomeIcon icon={page.icon} size="lg" />
              </ListItemIcon>
              <ListItemText 
                primary={page.name} 
                primaryTypographyProps={{
                  fontWeight: location.pathname === page.path ? 600 : 400,
                  sx: { 
                    transition: 'color 0.3s ease',
                    color: location.pathname === page.path ? '#111827' : '#6B7280'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {!user && (
        <Box sx={{ mt: 2, px: 2 }}>
          <Button
            fullWidth
            variant="contained"
            component={motion.button}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            sx={{ 
              mb: 1, 
              borderRadius: '10px',
              background: '#3751FF',
              boxShadow: '0 4px 14px 0 rgba(55, 81, 255, 0.4)',
              py: 1.2
            }}
            onClick={() => handleNavigation('/login')}
          >
            <FontAwesomeIcon icon="sign-in-alt" style={{ marginRight: '8px' }} />
            Giriş Yap
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            component={motion.button}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            sx={{ 
              borderRadius: '10px',
              borderColor: '#3751FF',
              borderWidth: '2px',
              color: '#3751FF',
              py: 1.2,
              '&:hover': {
                borderColor: '#2A3FC9',
                backgroundColor: 'rgba(55, 81, 255, 0.04)'
              }
            }}
            onClick={() => handleNavigation('/register')}
          >
            <FontAwesomeIcon icon="user-plus" style={{ marginRight: '8px' }} />
            Kayıt Ol
          </Button>
        </Box>
      )}
      
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Divider sx={{ 
          mb: 2, 
          background: 'linear-gradient(90deg, rgba(55, 81, 255, 0) 0%, rgba(55, 81, 255, 0.3) 50%, rgba(55, 81, 255, 0) 100%)',
          height: '1px'
        }} />
        <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', textAlign: 'center' }}>
          © {new Date().getFullYear()} EYS
        </Typography>
      </Box>
    </Box>
  );
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Navbar'ı yukarıda sabit tutmak için position sticky ekliyoruz */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1100, 
        backgroundColor: 'white',
        boxShadow: '0 4px 20px rgba(55, 81, 255, 0.08)',
      }}>
        <Navbar />
      </Box>
      
      <Box sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Box>

      {/* Footer'ı geri ekliyoruz */}
      <Footer />

      {/* Scroll to top button */}
      <Zoom in={showScrollTop}>
        <Box
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            p: 1,
            borderRadius: '50%',
            backgroundColor: '#3751FF',
            boxShadow: '0 4px 12px rgba(55, 81, 255, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#2A3FC9',
              transform: 'scale(1.1)'
            }
          }}
        >
          <ExpandLess sx={{ color: '#FFFFFF' }} />
        </Box>
      </Zoom>
    </Box>
  );
};

export default MainLayout; 