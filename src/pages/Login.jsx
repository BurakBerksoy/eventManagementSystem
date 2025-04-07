import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
  Card,
  Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import { toast } from 'react-hot-toast';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100 
    }
  }
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -15, 0],
    transition: {
      repeat: Infinity,
      repeatType: "loop",
      duration: 3,
      ease: "easeInOut"
    }
  }
};

const fadeInOutVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();
  const { login, setAuthToken, setUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Özellikleri otomatik değiştir
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Giriş deneniyor:', email);
      
      // Email/password kontrolü
      if (!email || !email.trim()) {
        setError('E-posta adresi giriniz');
        setLoading(false);
        return;
      }
      
      if (!password || !password.trim()) {
        setError('Şifre giriniz');
        setLoading(false);
        return;
      }
      
      // AuthContext içindeki login fonksiyonu kullan
      const result = await login(email, password);
      console.log('Login yanıtı:', result);
      
      if (result && result.success) {
        toast.success('Giriş başarılı!');
        console.log('Giriş başarılı, etkinlikler sayfasına yönlendiriliyor');
        
        // Yönlendirmeyi gerçekleştir
        navigate('/events');
      } else {
        // Hata mesajını göster
        const errorMessage = result?.error || 'Giriş yapılamadı. Lütfen tekrar deneyin.';
        console.error('Giriş hatası:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Giriş sırasında beklenmeyen hata:', error);
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      toast.error('Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Sol taraftaki özellik listesi
  const features = [
    {
      icon: <EventIcon fontSize="large" />,
      title: "Etkinlik Yönetimi",
      description: "Tüm etkinliklerinizi kolayca planlayın, yönetin ve takip edin."
    },
    {
      icon: <SchoolIcon fontSize="large" />,
      title: "Öğrenci Takibi",
      description: "Öğrencilerin etkinliklere katılımını ve performansını izleyin."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      background: '#f8f9fa'
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Grid container spacing={0} sx={{ 
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
          height: {xs: 'auto', md: '550px'}
        }}>
          {/* Sol taraf - Bilgi ve Görsel */}
          {!isMobile && (
            <Grid 
              item 
              md={6} 
              sx={{ 
                background: '#2962ff',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: 'white',
                p: 5
              }}
            >
              <Box component={motion.div} 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                sx={{zIndex: 1}}
              >
                <motion.div variants={itemVariants}>
                  <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Etkinlik Yönetim
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography variant="h5" gutterBottom sx={{
                    opacity: 0.95,
                    mb: 5,
                  }}>
                    Tüm etkinlikleriniz için tek platform
                  </Typography>
                </motion.div>
                
                <Box sx={{mt: 5, position: 'relative', height: 150}}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      variants={fadeInOutVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      style={{
                        position: 'absolute',
                        width: '100%'
                      }}
                    >
                      <Card 
                        elevation={0}
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          p: 3,
                          mb: 2,
                          borderRadius: 2,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                          <Box sx={{
                            mr: 2, 
                            color: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            p: 1.5,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {features[activeFeature].icon}
                          </Box>
                          <Typography variant="h5" fontWeight="bold">
                            {features[activeFeature].title}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{opacity: 0.9}}>
                          {features[activeFeature].description}
                        </Typography>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </Box>
              </Box>
              
              {/* Dekoratif elementler */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -100,
                  right: -100,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 0
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -100,
                  left: -100,
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  zIndex: 0
                }}
              />
            </Grid>
          )}
          
          {/* Sağ taraf - Form */}
          <Grid 
            item 
            xs={12} 
            md={6}
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Box 
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 3, sm: 5, md: 6 },
                height: '100%',
                bgcolor: 'white'
              }}
            >
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  color="#2962ff" 
                  sx={{ 
                    mb: 4, 
                    textAlign: 'center'
                  }}
                >
                  Giriş Yap
                </Typography>
              </motion.div>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{width: '100%', marginBottom: 16}}
                  >
                    <Alert severity="error" sx={{mb: 2}}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form 
                style={{width: '100%'}}
                onSubmit={handleSubmit}
              >
                <TextField
                  label="E-posta"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  label="Şifre"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={toggleShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Box sx={{ mt: 1, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Checkbox color="primary" />}
                    label="Beni hatırla"
                  />
                  <Link 
                    to="/forgot-password" 
                    style={{ textDecoration: 'none', color: '#2962ff' }}
                  >
                    <Typography variant="body2">
                      Şifremi unuttum
                    </Typography>
                  </Link>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 1,
                    mb: 3,
                    bgcolor: '#2962ff',
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        component="span"
                        sx={{
                          width: 16,
                          height: 16,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid #fff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          mr: 1,
                          '@keyframes spin': {
                            '0%': {
                              transform: 'rotate(0deg)',
                            },
                            '100%': {
                              transform: 'rotate(360deg)',
                            },
                          },
                        }}
                      />
                      Giriş yapılıyor...
                    </Box>
                  ) : 'Giriş Yap'}
                </Button>
                
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Hesabınız yok mu?{' '}
                    <Link 
                      to="/register" 
                      style={{ 
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        color: '#2962ff' 
                      }}
                    >
                      Hemen kaydolun
                    </Link>
                  </Typography>
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Login; 