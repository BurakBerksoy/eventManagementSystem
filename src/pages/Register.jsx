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
  Paper,
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
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GroupsIcon from '@mui/icons-material/Groups';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArticleIcon from '@mui/icons-material/Article';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

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

const buttonVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    boxShadow: "0px 5px 20px rgba(0, 0, 150, 0.3)",
    transition: { 
      type: "spring", 
      stiffness: 400,
      damping: 10
    }
  },
  tap: { scale: 0.98 }
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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Özellikleri otomatik değiştir
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Girdi değiştiğinde o alanın hatasını temizle
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Genel hatayı temizle
    setGeneralError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Ad Soyad kontrolü
    if (!formData.name.trim()) {
      newErrors.name = 'Ad soyad gereklidir';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Ad soyad en az 3 karakter olmalıdır';
    }
    
    // E-posta kontrolü
    if (!formData.email) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    // Telefon numarası opsiyonel, ama girilmişse kontrol et
    if (formData.phoneNumber && !/^(05)[0-9]{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Telefon numarası 05 ile başlamalı ve 11 haneli olmalıdır';
    }
    
    // Şifre kontrolü
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Şifre en az 4 karakter olmalıdır';
    }
    
    // Şifre onayı kontrolü
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    // Kullanım şartları kontrolü
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Kullanım şartlarını kabul etmelisiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setGeneralError('Lütfen formdaki hataları düzeltin.');
      return;
    }
    
    setGeneralError('');
    setLoading(true);
    
    try {
      // Kayıt işlemi için gerekli verileri hazırla
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || '',
        role: 'STUDENT'
      };
      
      // Register işlemi
      const registerResult = await register(userData);
      
      if (registerResult.success) {
        console.log('Kayıt ve giriş başarılı, anasayfaya yönlendiriliyor...');
        navigate('/');
      } else {
        console.error('Kayıt başarısız:', registerResult.message);
        setGeneralError(registerResult.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setGeneralError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Sağ taraftaki özellik listesi
  const features = [
    {
      icon: <GroupsIcon fontSize="large" />,
      title: "Topluluk Oluşturma",
      description: "Kendi ilgi alanlarınızda topluluklar oluşturun ve yönetin."
    },
    {
      icon: <NotificationsIcon fontSize="large" />,
      title: "Etkinlik Bildirimleri",
      description: "Katılmak istediğiniz etkinlikler için anında bildirimler alın."
    },
    {
      icon: <ArticleIcon fontSize="large" />,
      title: "Etkinlik Raporları",
      description: "Katıldığınız etkinliklerin detaylı raporlarına erişin."
    },
    {
      icon: <CalendarMonthIcon fontSize="large" />,
      title: "Takvim Entegrasyonu",
      description: "Etkinlikleri takviminize otomatik olarak ekleyin ve yönetin."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4,
      background: 'radial-gradient(circle at top right, rgba(69, 104, 220, 0.05), transparent 400px), radial-gradient(circle at bottom left, rgba(176, 106, 179, 0.05), transparent 400px)'
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Grid container spacing={0} sx={{ 
          overflow: 'hidden',
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0, 0, 150, 0.15)',
          height: {xs: 'auto', md: '750px'}
        }}>
          {/* Sol taraf - Form */}
          <Grid 
            item 
            xs={12} 
            md={isMobile ? 12 : 6}
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
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 4, 
                    textAlign: 'center',
                    background: 'linear-gradient(90deg, #b06ab3, #4568dc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Hesap Oluştur
                </Typography>
              </motion.div>
              
              <AnimatePresence>
                {generalError && (
                  <motion.div 
                    variants={itemVariants}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    style={{width: '100%', marginBottom: 16}}
                  >
                    <Alert severity="error" sx={{mb: 2}}>
                      {generalError}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.form 
                variants={itemVariants} 
                style={{width: '100%'}}
                onSubmit={handleSubmit}
              >
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <TextField
                    label="Ad Soyad"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: '0 0 5px rgba(0, 0, 150, 0.05)'
                        },
                      }
                    }}
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <TextField
                    label="E-posta"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: '0 0 5px rgba(0, 0, 150, 0.05)'
                        },
                      }
                    }}
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <TextField
                    label="Telefon Numarası (İsteğe Bağlı)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    placeholder="05XXXXXXXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: '0 0 5px rgba(0, 0, 150, 0.05)'
                        },
                      }
                    }}
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <TextField
                    label="Şifre"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
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
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: '0 0 5px rgba(0, 0, 150, 0.05)'
                        },
                      }
                    }}
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <TextField
                    label="Şifre Tekrar"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: '0 0 5px rgba(0, 0, 150, 0.05)'
                        },
                      }
                    }}
                  />
                </motion.div>
                
                <Box sx={{ mt: 2, mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        color="primary"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        sx={{
                          '&.Mui-checked': {
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s'
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        <span>Kullanım şartlarını ve gizlilik politikasını kabul ediyorum</span>
                      </Typography>
                    }
                  />
                  {errors.acceptTerms && (
                    <Typography variant="caption" color="error">
                      {errors.acceptTerms}
                    </Typography>
                  )}
                </Box>
                
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      mb: 3,
                      background: 'linear-gradient(90deg, #b06ab3, #4568dc)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #a155ac, #3c5edb)',
                      }
                    }}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" strokeDasharray="50 20" />
                        </svg>
                      </motion.div>
                    ) : 'Kaydol'}
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Zaten bir hesabınız var mı?{' '}
                      <motion.span 
                        whileHover={{ 
                          scale: 1.1, 
                          color: theme.palette.primary.main 
                        }}
                        style={{ display: 'inline-block' }}
                      >
                        <Link 
                          to="/login" 
                          style={{ 
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            color: theme.palette.primary.main 
                          }}
                        >
                          Giriş yapın
                        </Link>
                      </motion.span>
                    </Typography>
                  </Box>
                </motion.div>
              </motion.form>
            </Box>
          </Grid>
          
          {/* Sağ taraf - Bilgi ve Görsel */}
          {!isMobile && (
            <Grid 
              item 
              md={6} 
              sx={{ 
                background: 'linear-gradient(135deg, #b06ab3 0%, #4568dc 100%)',
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
                  <Typography variant="h2" fontWeight="bold" gutterBottom sx={{
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}>
                    Bize Katılın
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Typography variant="h4" gutterBottom sx={{
                    opacity: 0.95,
                    mb: 5,
                    textShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    Benzersiz etkinliklerle dolu bir dünya
                  </Typography>
                </motion.div>
                
                <Box sx={{mt: 5, position: 'relative', height: 180}}>
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
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          transform: 'perspective(1000px) rotateX(2deg)',
                          overflow: 'visible'
                        }}
                      >
                        <motion.div
                          variants={floatingVariants}
                          initial="initial"
                          animate="animate"
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
                              justifyContent: 'center',
                              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
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
                        </motion.div>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </Box>
              </Box>
              
              {/* Dekoratif elementler */}
              <Box component={motion.div}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.2 }}
                sx={{
                  position: 'absolute',
                  top: -100,
                  right: -100,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                  zIndex: 0,
                  filter: 'blur(5px)'
                }}
              />
              <Box component={motion.div}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.4 }}
                sx={{
                  position: 'absolute',
                  bottom: -150,
                  left: -150,
                  width: 350,
                  height: 350,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)',
                  zIndex: 0,
                  filter: 'blur(5px)'
                }}
              />
              
              <Box component={motion.div}
                animate={{ 
                  rotate: 360,
                  transition: { 
                    repeat: Infinity, 
                    duration: 30,
                    ease: "linear" 
                  }
                }}
                sx={{
                  position: 'absolute',
                  top: '40%',
                  right: '10%',
                  width: 80,
                  height: 80,
                  opacity: 0.4,
                  zIndex: 0
                }}
              >
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" fill="none" />
                  <circle cx="50" cy="10" r="5" fill="white" />
                </svg>
              </Box>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Register; 