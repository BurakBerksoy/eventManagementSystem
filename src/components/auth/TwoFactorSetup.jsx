import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';

/**
 * İki Faktörlü Kimlik Doğrulama Kurulum Bileşeni
 * Kullanıcıların 2FA'yı kurmalarını sağlar
 */
const TwoFactorSetup = ({ onComplete }) => {
  const { setupTwoFactor, verifyTwoFactor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrData, setQrData] = useState(null);
  const [manualEntry, setManualEntry] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  const handleSetup = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await setupTwoFactor();
      
      if (data && data.qrCodeUrl) {
        setQrData(data.qrCodeUrl);
        setManualEntry(data.manualEntryKey || '');
      } else {
        setError('QR kodu alınamadı. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (err) {
      console.error('İki faktörlü doğrulama kurulumu sırasında hata:', err);
      setError('İki faktörlü doğrulama ayarlanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }
    
    try {
      setVerifying(true);
      setError('');
      
      const response = await verifyTwoFactor(verificationCode);
      
      if (response && response.success) {
        setSuccess('İki faktörlü doğrulama başarıyla etkinleştirildi!');
        
        // Ana bileşene bildirme (varsa)
        if (onComplete && typeof onComplete === 'function') {
          setTimeout(() => {
            onComplete(true);
          }, 1500);
        }
      } else {
        setError('Doğrulama kodu yanlış. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error('İki faktörlü doğrulama onayı sırasında hata:', err);
      setError('Kod doğrulanırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setVerifying(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        İki Faktörlü Doğrulama Kurulumu
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {!qrData ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" paragraph>
            Hesabınızı korumak için iki faktörlü doğrulamayı etkinleştirin.
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleSetup}
            disabled={loading}
          >
            Kuruluma Başla
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" paragraph>
            Kimlik doğrulayıcı uygulamanızla aşağıdaki QR kodunu tarayın:
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <img 
              src={qrData} 
              alt="QR Kodu" 
              style={{ 
                width: 180, 
                height: 180, 
                border: '1px solid #eee', 
                padding: 8,
                borderRadius: 4
              }} 
            />
          </Box>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              veya
            </Typography>
          </Divider>
          
          <Typography variant="body2" gutterBottom>
            QR kodu tarayamıyorsanız, bu anahtarı manuel olarak girin:
          </Typography>
          
          <TextField
            fullWidth
            value={manualEntry}
            variant="outlined"
            size="small"
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 3, fontFamily: 'monospace' }}
          />
          
          <Typography variant="body2" paragraph>
            Uygulamanızdan aldığınız 6 haneli doğrulama kodunu girin:
          </Typography>
          
          <Box component="form" onSubmit={handleVerify}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  required
                  label="Doğrulama Kodu"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  inputProps={{
                    maxLength: 6,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                  autoComplete="one-time-code"
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={verifying || verificationCode.length !== 6}
                  sx={{ height: '100%' }}
                >
                  {verifying ? <CircularProgress size={24} /> : 'Doğrula'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default TwoFactorSetup; 