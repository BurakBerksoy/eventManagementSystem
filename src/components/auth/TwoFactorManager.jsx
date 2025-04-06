import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Stack,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';

import { twoFactorAuthService } from '../../services';
import TwoFactorSetup from './TwoFactorSetup';
import './TwoFactorAuth.css';

/**
 * İki Faktörlü Kimlik Doğrulama Yönetim Bileşeni
 * Kullanıcıların 2FA ayarlarını yönetmesini sağlar
 */
const TwoFactorManager = () => {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDisableDialog, setOpenDisableDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodesLoading, setBackupCodesLoading] = useState(false);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [showSecurityLogs, setShowSecurityLogs] = useState(false);

  // Kullanıcı ve 2FA durumunu yükle
  useEffect(() => {
    const loadUserSecurityData = async () => {
      try {
        setLoading(true);
        
        if (user && user.id) {
          // 2FA durumunu kontrol et
          const securityInfo = await twoFactorAuthService.getUserSecurityInfo(user.id);
          setTwoFactorEnabled(securityInfo.twoFactorEnabled);
          
          if (securityInfo.securityLog) {
            setSecurityLogs(securityInfo.securityLog);
          }
        }
      } catch (err) {
        console.error('Kullanıcı güvenlik bilgileri yüklenirken hata:', err);
        setError('Güvenlik bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserSecurityData();
  }, [user]);
  
  // 2FA durumunu değiştir
  const handleTwoFactorChange = (checked) => {
    if (checked) {
      // Etkinleştirmek için kurulum modalını göster
      setShowSetupModal(true);
    } else {
      // Devre dışı bırakmak için onay al
      setOpenDisableDialog(true);
    }
  };
  
  // 2FA kurulum tamamlandı
  const handleSetupComplete = (result) => {
    if (result && result.success) {
      setTwoFactorEnabled(true);
      setShowSetupModal(false);
      setSuccess('İki faktörlü kimlik doğrulama başarıyla etkinleştirildi!');
      
      // Güncel güvenlik bilgilerini yeniden yükle
      refreshSecurityData();
    }
  };
  
  // Güvenlik verilerini yenile
  const refreshSecurityData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const securityInfo = await twoFactorAuthService.getUserSecurityInfo(user.id);
      setTwoFactorEnabled(securityInfo.twoFactorEnabled);
      
      if (securityInfo.securityLog) {
        setSecurityLogs(securityInfo.securityLog);
      }
    } catch (err) {
      console.error('Güvenlik bilgileri yenilenirken hata:', err);
      setError('Güvenlik bilgileri yenilenemedi.');
    } finally {
      setLoading(false);
    }
  };
  
  // Yedek kodları getir
  const handleGetBackupCodes = async () => {
    try {
      setBackupCodesLoading(true);
      const response = await twoFactorAuthService.getBackupCodes(user.id);
      setBackupCodes(response.codes || []);
      setShowBackupCodes(true);
    } catch (err) {
      console.error('Yedek kodlar alınamadı:', err);
      setError('Yedek kodlar alınırken bir hata oluştu.');
    } finally {
      setBackupCodesLoading(false);
    }
  };
  
  // İki faktörlü doğrulamayı devre dışı bırak
  const handleDisableTwoFactor = async () => {
    try {
      setLoading(true);
      await twoFactorAuthService.disable(user.id);
      setTwoFactorEnabled(false);
      setOpenDisableDialog(false);
      setSuccess('İki faktörlü doğrulama devre dışı bırakıldı.');
      refreshSecurityData();
    } catch (err) {
      console.error('İki faktörlü doğrulama devre dışı bırakılamadı:', err);
      setError('İki faktörlü doğrulama devre dışı bırakılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Panoya kopyala
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSuccess('Panoya kopyalandı');
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch((err) => {
        console.error('Panoya kopyalama hatası:', err);
        setError('Panoya kopyalanamadı');
      });
  };
  
  // Yedek kodları indir
  const downloadBackupCodes = () => {
    if (backupCodes.length === 0) return;
    
    const content = 
      "İKİ FAKTÖRLÜ KİMLİK DOĞRULAMA YEDEK KODLARI\n" +
      "===========================================\n" +
      "Bu kodları güvenli bir yerde saklayın. Her kod yalnızca bir kez kullanılabilir.\n\n" +
      backupCodes.join('\n') + 
      "\n\nOluşturulma Tarihi: " + new Date().toLocaleString();
    
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "2FA_yedek_kodlari.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SecurityIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5">Hesap Güvenliği</Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography>İki Faktörlü Kimlik Doğrulama:</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={(e) => handleTwoFactorChange(e.target.checked)}
                color="primary"
              />
            }
            label=""
          />
          <Chip 
            label={twoFactorEnabled ? "Etkin" : "Devre Dışı"} 
            color={twoFactorEnabled ? "success" : "default"}
            size="small"
          />
        </Stack>
        
        {twoFactorEnabled ? (
          <Alert 
            severity="success" 
            sx={{ mt: 2 }}
            icon={<SecurityIcon />}
          >
            Hesabınız korunuyor. İki faktörlü kimlik doğrulama etkin. Giriş yaparken kimlik doğrulama uygulamanızdan kod girmeniz gerekecek.
          </Alert>
        ) : (
          <Alert 
            severity="warning" 
            sx={{ mt: 2 }}
            icon={<WarningIcon />}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setShowSetupModal(true)}
              >
                Etkinleştir
              </Button>
            }
          >
            <Typography variant="body2">
              İki faktörlü kimlik doğrulama, hesabınıza ek bir güvenlik katmanı ekler. Etkinleştirdiğinizde:
            </Typography>
            <Box component="ul" sx={{ mt: 1, pl: 2 }}>
              <li>Şifrenizi bilseler bile başkaları hesabınıza erişemez</li>
              <li>Giriş yaparken telefonunuzdaki uygulamadan bir kod girmeniz gerekir</li>
              <li>Telefonunuzu kaybetseniz bile yedek kodlarla hesabınıza erişebilirsiniz</li>
            </Box>
          </Alert>
        )}
      </Box>
      
      {twoFactorEnabled && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Güvenlik Seçenekleri
          </Typography>
          
          <List>
            <ListItem divider>
              <ListItemText
                primary="Yedek Kodları Görüntüle"
                secondary="Mevcut yedek kodlarınızı görüntüleyin veya yeni kodlar oluşturun."
              />
              <Button 
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleGetBackupCodes}
                disabled={backupCodesLoading}
              >
                {backupCodesLoading ? <CircularProgress size={24} /> : 'Yedek Kodlar'}
              </Button>
            </ListItem>
            
            <ListItem divider>
              <ListItemText
                primary="Güvenlik Aktiviteleri"
                secondary="Hesabınızla ilgili güvenlik olaylarını görüntüleyin."
              />
              <Button 
                variant="outlined"
                startIcon={<InfoIcon />}
                onClick={() => setShowSecurityLogs(true)}
              >
                Görüntüle
              </Button>
            </ListItem>
            
            <ListItem>
              <ListItemText
                primary="İki Faktörlü Doğrulamayı Devre Dışı Bırak"
                secondary="Hesabınızdan iki faktörlü kimlik doğrulamayı kaldırın (önerilmez)."
              />
              <Button 
                variant="outlined"
                color="error"
                onClick={() => setOpenDisableDialog(true)}
              >
                Devre Dışı Bırak
              </Button>
            </ListItem>
          </List>
        </>
      )}
      
      {/* 2FA Kurulum Modalı */}
      <Dialog
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          İki Faktörlü Kimlik Doğrulama Kurulumu
        </DialogTitle>
        <DialogContent>
          {user && (
            <TwoFactorSetup
              onComplete={handleSetupComplete}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSetupModal(false)}>İptal</Button>
        </DialogActions>
      </Dialog>
      
      {/* İki faktörlü doğrulamayı devre dışı bırakma onay penceresi */}
      <Dialog
        open={openDisableDialog}
        onClose={() => setOpenDisableDialog(false)}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">İki faktörlü doğrulamayı devre dışı bırak</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            İki faktörlü doğrulamayı devre dışı bırakmak hesabınızın güvenliğini azaltacaktır. Devam etmek istediğinizden emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDisableDialog(false)}>İptal</Button>
          <Button onClick={handleDisableTwoFactor} color="error">
            Devre Dışı Bırak
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Yedek kodlar penceresi */}
      <Dialog
        open={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yedek Kodlar</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bu kodları güvenli bir yerde saklayın. Her kod sadece bir kez kullanılabilir.
          </DialogContentText>
          
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              mb: 2
            }}
          >
            {backupCodes.map((code, index) => (
              <Typography 
                key={index} 
                variant="body2" 
                fontFamily="monospace"
                sx={{ mb: 1 }}
              >
                {code}
              </Typography>
            ))}
          </Box>
          
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
            >
              Kopyala
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadBackupCodes}
            >
              İndir
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupCodes(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      
      {/* Güvenlik günlüğü penceresi */}
      <Dialog
        open={showSecurityLogs}
        onClose={() => setShowSecurityLogs(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Güvenlik Aktiviteleri</DialogTitle>
        <DialogContent>
          {securityLogs.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {securityLogs.map((log, index) => (
                <ListItem key={index} divider={index < securityLogs.length - 1}>
                  <ListItemText
                    primary={log.activity}
                    secondary={`${new Date(log.timestamp).toLocaleString()} - ${log.ipAddress || 'Bilinmeyen IP'}`}
                  />
                  <Chip 
                    label={log.successful ? "Başarılı" : "Başarısız"}
                    color={log.successful ? "success" : "error"}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Henüz güvenlik aktivitesi bulunmuyor.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSecurityLogs(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TwoFactorManager; 