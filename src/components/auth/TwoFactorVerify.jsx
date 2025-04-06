import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import './TwoFactorAuth.css';

/**
 * İki Faktörlü Kimlik Doğrulama Giriş Bileşeni
 * Kullanıcı girişinde 2FA kodu doğrulama ekranı
 */
const TwoFactorVerify = () => {
  const { verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    if (error) setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await verifyTwoFactor(verificationCode, rememberDevice);
      
      if (result && result.success) {
        // Giriş başarılı - yönlendirme
        navigate('/dashboard');
      } else {
        setError('Doğrulama kodu yanlış. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('İki faktörlü doğrulama hatası:', err);
      setError(
        err.message || 
        'Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackupCodeClick = () => {
    navigate('/backup-code');
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          maxWidth: 400, 
          width: '100%',
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          İki Faktörlü Doğrulama
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Kimlik doğrulayıcı uygulamanızdaki 6 haneli kodu girin
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            autoFocus
            required
            label="Doğrulama Kodu"
            value={verificationCode}
            onChange={handleChange}
            margin="normal"
            inputProps={{
              maxLength: 6,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            autoComplete="one-time-code"
            variant="outlined"
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                color="primary"
              />
            }
            label="Bu cihazı hatırla (30 gün)"
            sx={{ mt: 1, mb: 2 }}
          />
          
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || verificationCode.length !== 6}
            sx={{ mt: 1, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Doğrula'}
          </Button>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              veya
            </Typography>
          </Divider>
          
          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={handleBackupCodeClick}
              underline="hover"
            >
              Yedek kod kullan
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TwoFactorVerify; 