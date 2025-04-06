import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Link, 
  Paper, 
  Divider, 
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Card
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import GroupsIcon from '@mui/icons-material/Groups';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  
  const { login, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  // Yönlendirme için önceki sayfa
  const from = location.state?.from?.pathname || '/';
  
  // Özellikleri otomatik değiştir
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Sayfa yüklendiğinde oturum kontrolü yap
  useEffect(() => {
    const checkAuthOnLoad = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Token varsa kullanıcı bilgilerini kontrol et
          const userData = await getCurrentUser();
          if (userData) {
            // Kullanıcı bilgileri varsa ana sayfaya yönlendir
            navigate('/');
          }
        } catch (err) {
          // Token geçersizse localStorage'dan temizle
          localStorage.removeItem('auth_token');
          console.error('Oturum kontrolü hatası:', err);
        }
      }
    };
    
    checkAuthOnLoad();
  }, [getCurrentUser, navigate]);
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'E-posta adresi gereklidir';
    if (!re.test(email)) return 'Geçerli bir e-posta adresi girin';
    return '';
  };
  
  const validatePassword = (password) => {
    if (!password) return 'Şifre gereklidir';
    if (password.length < 6) return 'Şifre en az 6 karakter olmalıdır';
    return '';
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setEmail(value);
      if (touched.email) {
        setErrors({
          ...errors,
          email: validateEmail(value)
        });
      }
    } else if (name === 'password') {
      setPassword(value);
      if (touched.password) {
        setErrors({
          ...errors,
          password: validatePassword(value)
        });
      }
    }
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched({
      ...touched,
      [name]: true
    });
    
    if (name === 'email') {
      setErrors({
        ...errors,
        email: validateEmail(value)
      });
    } else if (name === 'password') {
      setErrors({
        ...errors,
        password: validatePassword(value)
      });
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError
      });
      setTouched({
        email: true,
        password: true
      });
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log('Giriş denemesi yapılıyor...');
      
      // Login işlemini gerçekleştir
      const result = await login(email, password);
      
      if (!result || !result.success) {
        const errorMsg = result?.message || 'Giriş başarısız oldu';
        console.error('Giriş başarısız:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('Giriş başarılı, yönlendiriliyor:', from);
      
      // Başarılı girişten sonra yönlendir
      navigate(from, { replace: true });
      
    } catch (err) {
      console.error('Giriş hatası:', err);
      
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'E-posta veya şifre hatalı';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Animasyonlar için varyantlar
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
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
    hover: { 
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
      transition: { 
        type: "spring", 
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };
  
  const floatingVariants = {
    hidden: { y: 0 },
    visible: {
      y: [0, -15, 0],
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 5,
        ease: "easeInOut"
      }
    }
  };
  
  const bubbleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.1, 1],
      opacity: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      }
    }
  };

  // Özellik metinleri
  const features = [
    { 
      icon: <EventIcon fontSize="large" />, 
      title: "Dijital Etkinlik Yönetimi", 
      description: "Etkinliklerinizi artık dijital ortamda kolayca planlayın, düzenleyin ve takip edin." 
    },
    { 
      icon: <GroupsIcon fontSize="large" />, 
      title: "Online Katılımcı Yönetimi", 
      description: "Katılımcı listelerinizi oluşturun, davetiyeler gönderin ve katılımları takip edin." 
    },
    { 
      icon: <SchoolIcon fontSize="large" />, 
      title: "Raporlama ve Analiz", 
      description: "Etkinliklerinizin performansını ölçün, analiz edin ve gelecek planlarınızı geliştirin." 
    },
  ];

  return (
    <Container maxWidth="lg" ref={ref}>
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <Grid 
          container 
          sx={{ 
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Arka plan animasyon öğeleri */}
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: -1,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 - 50 + "%", 
                  y: -20,
                  opacity: 0.3 + Math.random() * 0.4,
                  scale: 0.5 + Math.random() * 0.5
                }}
                animate={{ 
                  y: ["0%", "100%"],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 15 + Math.random() * 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                style={{
                  position: 'absolute',
                  width: 30 + Math.random() * 40,
                  height: 30 + Math.random() * 40,
                  background: `rgba(${theme.palette.primary.main.replace(/[^\d,]/g, '')}, 0.1)`,
                  borderRadius: '50%',
                  filter: 'blur(8px)'
                }}
              />
            ))}
          </Box>
          
          {/* Sol taraftaki resim alanı */}
          {!isMobile && (
            <Grid item xs={12} md={6} sx={{ p: 3 }}>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 50, delay: 0.3 }}
                style={{ position: 'relative' }}
              >
                <Box
                  component="div"
                  sx={{
                    width: "100%",
                    height: 600,
                    borderRadius: 4,
                    backgroundImage: "url('/assets/digital_events.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: "0 8px 40px rgba(0, 0, 0, 0.15)",
                    position: 'relative',
                    overflow: 'hidden',
                    "&::before": {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))`,
                      zIndex: 1
                    }
                  }}
                />
                
                {/* Özellik kartları */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 40, 
                  left: 0, 
                  right: 0, 
                  zIndex: 2,
                  px: 3
                }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Paper
                        elevation={8}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          backdropFilter: 'blur(10px)',
                          background: 'rgba(255, 255, 255, 0.9)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center'
                        }}
                      >
                        <motion.div
                          variants={floatingVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <Box sx={{ 
                            color: theme.palette.primary.main,
                            mb: 1
                          }}>
                            {features[activeFeature].icon}
                          </Box>
                        </motion.div>
                        <Typography 
                          variant="h6" 
                          component="h3" 
                          fontWeight="bold"
                          gutterBottom
                        >
                          {features[activeFeature].title}
                        </Typography>
                        <Typography variant="body2">
                          {features[activeFeature].description}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* İndikatör noktaları */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    mt: 2,
                    gap: 1
                  }}>
                    {features.map((_, index) => (
                      <Box
                        component={motion.div}
                        key={index}
                        initial={{ scale: 1 }}
                        animate={{ 
                          scale: activeFeature === index ? [1, 1.3, 1] : 1,
                          opacity: activeFeature === index ? 1 : 0.6
                        }}
                        transition={{ duration: 0.5 }}
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: activeFeature === index 
                            ? 'white' 
                            : 'rgba(255, 255, 255, 0.6)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setActiveFeature(index)}
                      />
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          )}
          
          {/* Sağ taraftaki login formu */}
          <Grid item xs={12} md={isMobile ? 12 : 6}>
            <Box sx={{ px: isMobile ? 2 : 5 }}>
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
              >
                <Paper
                  elevation={10}
                  sx={{ 
                    p: { xs: 3, md: 4 }, 
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Animasyonlu dekoratif halkalar */}
                  {[...Array(3)].map((_, i) => (
                    <Box
                      component={motion.div}
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 0.03 + (i * 0.01), 
                        scale: 1,
                        x: [-10, 10, -10],
                        y: [5, -5, 5]
                      }}
                      transition={{ 
                        duration: 8 + (i * 2),
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                      sx={{
                        position: 'absolute',
                        top: -50 - (i * 100),
                        right: -50 - (i * 50),
                        width: 300 + (i * 100),
                        height: 300 + (i * 100),
                        borderRadius: '50%',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        zIndex: 0
                      }}
                    />
                  ))}
                  
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <motion.div variants={itemVariants}>
                      <Box sx={{ mb: 3, textAlign: 'center' }}>
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 260, 
                            damping: 20, 
                            delay: 0.5 
                          }}
                        >
                          <Typography 
                            variant="h4" 
                            component="h1" 
                            fontWeight="bold"
                            sx={{ 
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              mb: 1
                            }}
                          >
                            Giriş Yap
                          </Typography>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                            Etkinlik yönetim sistemine hoş geldiniz
                          </Typography>
                        </motion.div>
                      </Box>
                    </motion.div>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Alert severity="error" sx={{ mb: 3 }}>
                          {error}
                        </Alert>
                      </motion.div>
                    )}
                    
                    <Box 
                      component="form" 
                      onSubmit={handleSubmit} 
                      noValidate 
                      sx={{ mt: 1 }}
                    >
                      <motion.div variants={itemVariants}>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="email"
                          label="E-posta Adresi"
                          name="email"
                          autoComplete="email"
                          autoFocus
                          value={email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          disabled={loading}
                          sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s',
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                              },
                            },
                          }}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          name="password"
                          label="Şifre"
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.password && Boolean(errors.password)}
                          helperText={touched.password && errors.password}
                          disabled={loading}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="Şifreyi göster/gizle"
                                  onClick={toggleShowPassword}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{ 
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s',
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.main,
                              },
                            },
                          }}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          mb: 2 
                        }}>
                          <Link 
                            component={RouterLink} 
                            to="/forgot-password" 
                            variant="body2"
                            sx={{ 
                              color: theme.palette.primary.main,
                              transition: 'color 0.2s',
                              '&:hover': {
                                color: theme.palette.primary.dark,
                              }
                            }}
                          >
                            Şifrenizi mi unuttunuz?
                          </Link>
                        </Box>
                      </motion.div>
                      
                      <motion.div 
                        variants={itemVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button
                          component={motion.button}
                          variants={buttonVariants}
                          type="submit"
                          fullWidth
                          variant="contained"
                          startIcon={!loading && <LoginIcon />}
                          sx={{ 
                            mt: 2, 
                            mb: 3, 
                            py: 1.8,
                            borderRadius: 3,
                            fontWeight: 600,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                              background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            },
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          disabled={loading}
                        >
                          {/* Buton arka plan efekti */}
                          <Box
                            component={motion.div}
                            initial={{ scale: 0, opacity: 0 }}
                            whileHover={{ 
                              scale: 1.5, 
                              opacity: 1,
                              transition: { duration: 0.4 } 
                            }}
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '120%',
                              height: '200%',
                              background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                              zIndex: 0
                            }}
                          />
                          <Box sx={{ position: 'relative', zIndex: 1 }}>
                            {loading ? <CircularProgress size={24} /> : 'Giriş Yap'}
                          </Box>
                        </Button>
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <Box sx={{ 
                          mt: 2,
                          textAlign: 'center'
                        }}>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Hesabınız yok mu?
                          </Typography>
                          <motion.div whileHover={{ scale: 1.05 }}>
                            <Link 
                              component={RouterLink} 
                              to="/register" 
                              variant="body2"
                              sx={{ 
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                position: 'relative',
                                display: 'inline-block',
                                '&:hover': {
                                  color: theme.palette.primary.dark,
                                },
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  width: '100%',
                                  height: '2px',
                                  bottom: -2,
                                  left: 0,
                                  backgroundColor: theme.palette.primary.main,
                                  transformOrigin: 'bottom left',
                                  transition: 'transform 0.3s ease-out',
                                  transform: 'scaleX(0)',
                                },
                                '&:hover::after': {
                                  transform: 'scaleX(1)',
                                }
                              }}
                            >
                              Hemen Kayıt Ol
                            </Link>
                          </motion.div>
                        </Box>
                      </motion.div>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Box sx={{ 
                  mt: 3, 
                  textAlign: 'center'
                }}>
                  <Typography variant="body2" color="textSecondary">
                    &copy; {new Date().getFullYear()} Etkinlik Yönetim Sistemi
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Login; 