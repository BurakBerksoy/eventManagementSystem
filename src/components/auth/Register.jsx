import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  InputAdornment
} from '@mui/material';
import { PersonAdd as PersonAddIcon, Email as EmailIcon, Phone as PhoneIcon, Person as PersonIcon, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Animasyon tanımları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
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
  const [apiErrors, setApiErrors] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    
    // API hatalarını temizle
    setApiErrors([]);
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
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
    setApiErrors([]);
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
      
      // Register işlemi - AuthContext içinde otomatik login de yapılacak
      await register(userData);
      setShowSuccessMessage(true);
      
      // Kısa bir süre sonra ana sayfaya yönlendir
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      // API'den gelen hata mesajını işle
      console.error('Kayıt hatası:', error);
      
      if (error.response && error.response.data) {
        // Backend API'den gelen hata mesajı
        if (error.response.data.fieldErrors) {
          // Form doğrulama hataları
          const fieldErrors = error.response.data.fieldErrors;
          const newErrors = {};
          const apiErrorsArray = [];
          
          Object.keys(fieldErrors).forEach(field => {
            newErrors[field] = fieldErrors[field];
            apiErrorsArray.push(`${field}: ${fieldErrors[field]}`);
          });
          
          setErrors({...errors, ...newErrors});
          setApiErrors(apiErrorsArray);
          setGeneralError('Lütfen formdaki hataları düzeltin');
        } else {
          // Genel hata mesajı
          setGeneralError(error.response.data.message || 'Kayıt sırasında bir hata oluştu');
        }
      } else if (error.message) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Grid container spacing={0} sx={{ 
        overflow: 'hidden',
        borderRadius: 4,
        boxShadow: '0 10px 40px rgba(55, 81, 255, 0.1)',
        backgroundColor: '#FFFFFF'
      }}>
        {/* Sol taraf - form */}
        <Grid 
          item 
          xs={12} 
          md={isMobile ? 12 : 7} 
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
              p: { xs: 3, sm: 4, md: 5 },
              height: '100%',
            }}
          >
            <motion.div variants={itemVariants}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  mb: 2, 
                  backgroundColor: '#3751FF',
                  border: '3px solid rgba(55, 81, 255, 0.2)'
                }}
              >
                <PersonAddIcon />
              </Avatar>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  color: '#3751FF'
                }}
              >
                Hesap Oluştur
              </Typography>
            </motion.div>
            
            {generalError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  {generalError}
                </Alert>
              </motion.div>
            )}
            
            {apiErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                  <List dense disablePadding>
                    {apiErrors.map((err, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText primary={err} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              </motion.div>
            )}
            
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                  Kaydınız başarıyla tamamlandı! Ana sayfaya yönlendiriliyorsunuz...
                </Alert>
              </motion.div>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      name="name"
                      required
                      fullWidth
                      id="name"
                      label="Ad Soyad"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#3751FF' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#3751FF',
                            borderWidth: '2px'
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3751FF',
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="E-posta Adresi"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#3751FF' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#3751FF',
                            borderWidth: '2px'
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3751FF',
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      id="phoneNumber"
                      label="Telefon Numarası"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                      placeholder="05XXXXXXXXX"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: '#3751FF' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#3751FF',
                            borderWidth: '2px'
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3751FF',
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Şifre"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      helperText={errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#3751FF' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              aria-label="Şifre görünürlüğünü değiştir"
                              onClick={() => setShowPassword(!showPassword)}
                              sx={{ minWidth: 'auto', p: 0, color: '#3751FF' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#3751FF',
                            borderWidth: '2px'
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3751FF',
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Şifre Tekrar"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#3751FF' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              aria-label="Şifre tekrar görünürlüğünü değiştir"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              sx={{ minWidth: 'auto', p: 0, color: '#3751FF' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#3751FF',
                            borderWidth: '2px'
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#3751FF',
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
                
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          color="primary"
                          sx={{
                            color: '#3751FF',
                            '&.Mui-checked': {
                              color: '#3751FF',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" color="textSecondary">
                          Kullanım şartlarını ve gizlilik politikasını kabul ediyorum
                        </Typography>
                      }
                      sx={{ mt: 1 }}
                    />
                    {errors.acceptTerms && (
                      <FormHelperText error>{errors.acceptTerms}</FormHelperText>
                    )}
                  </motion.div>
                </Grid>
              </Grid>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ marginTop: '24px' }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    py: 1.5,
                    backgroundColor: '#3751FF',
                    boxShadow: '0 8px 25px -8px rgba(55, 81, 255, 0.5)',
                    '&:hover': {
                      backgroundColor: '#2A3FC9',
                      boxShadow: '0 8px 25px -5px rgba(55, 81, 255, 0.7)',
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Kayıt Ol'}
                </Button>
              </motion.div>
              
              <motion.div variants={itemVariants} style={{ width: '100%', marginTop: '24px' }}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Zaten hesabınız var mı?
                  </Typography>
                </Divider>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    py: 1.5,
                    borderColor: '#3751FF',
                    borderWidth: '2px',
                    color: '#3751FF',
                    '&:hover': {
                      borderColor: '#2A3FC9',
                      backgroundColor: 'rgba(55, 81, 255, 0.04)',
                      borderWidth: '2px'
                    }
                  }}
                >
                  Giriş Yap
                </Button>
              </motion.div>
            </Box>
          </Box>
        </Grid>
        
        {/* Sağ taraf - resimli kısım */}
        {!isMobile && (
          <Grid item xs={12} md={5} 
            component={motion.div}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #3751FF 0%, #5B70FF 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 6,
              color: 'white',
            }}
          >
            {/* Arka plan deseni */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0, 
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 30m15 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\' fill=\'%23FFFFFF\' fill-opacity=\'1\'/%3E%3C/svg%3E")',
              backgroundSize: '30px 30px',
              zIndex: 0,
            }}/>
            
            <Box 
              component={motion.div}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              sx={{ 
                width: '80%', 
                maxWidth: 320,
                height: 320,
                backgroundImage: 'url("https://img.freepik.com/free-vector/sign-concept-illustration_114360-125.jpg?w=740&t=st=1701234307~exp=1701234907~hmac=fa8ff36b0bf7f79927d34c71d5fc78e32a4f4f526c19e6344efa99da24f827e3")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                mb: 4,
                filter: 'brightness(1.1) contrast(1.1)',
                zIndex: 1,
              }}
            />
            
            <Typography
              component={motion.h1}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}  
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                textAlign: 'center',
                zIndex: 1,
              }}
            >
              Hemen Kayıt Olun
            </Typography>
            
            <Typography
              component={motion.p}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}  
              variant="body1" 
              sx={{ 
                textAlign: 'center',
                maxWidth: '80%',
                zIndex: 1,
              }}
            >
              Kayıt olarak tüm etkinliklerden anında haberdar olabilir ve katılım sağlayabilirsiniz
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Register; 