import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  HourglassEmpty as HourglassEmptyIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { membershipAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

/**
 * Kulüp üyelik buton bileşeni
 * Kullanıcının kulübe katılmak için istek göndermesini, bekleyen isteğini iptal etmesini
 * veya kulüpten ayrılmasını sağlar
 */
const ClubMembershipButton = ({ clubId, clubName, membershipStatus, onMembershipChange }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [message, setMessage] = useState('');

  if (!currentUser) {
    return null;
  }

  // Admin rolü veya kulüp başkanı kontrolü
  const isAdmin = currentUser?.role === 'ADMIN';
  const isPresident = membershipStatus?.role === 'PRESIDENT';
  const isManager = membershipStatus?.role === 'MANAGER';

  // Güvenli kontrol - eğer membershipStatus yoksa, varsayılan değerleri kullan
  const isMember = membershipStatus?.isMember || false;
  const isPending = membershipStatus?.isPending || false;

  // Admin, kulüp başkanı veya yönetici rolündeyse, katılma butonu gösterilmez
  if (isAdmin || isPresident || isManager) {
    return (
      <Tooltip title={
        isAdmin ? "Admin rolünde olduğunuz için kulübe katılamazsınız" : 
        isPresident ? "Bu kulübün başkanı olduğunuz için katılma butonunu göremezsiniz" :
        "Bu kulübün yöneticisi olduğunuz için kulübe katılamazsınız"
      }>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<CheckCircleIcon />}
          size="small"
          sx={{ borderRadius: 2 }}
          disabled
        >
          {isAdmin ? "Admin" : isPresident ? "Başkan" : "Yönetici"}
        </Button>
      </Tooltip>
    );
  }

  const handleOpenJoinDialog = () => {
    setOpenJoinDialog(true);
  };

  const handleCloseJoinDialog = () => {
    setOpenJoinDialog(false);
    setMessage('');
  };

  const handleOpenLeaveDialog = () => {
    setOpenLeaveDialog(true);
  };

  const handleCloseLeaveDialog = () => {
    setOpenLeaveDialog(false);
  };

  const handleJoinClub = async () => {
    setLoading(true);
    try {
      const response = await membershipAPI.joinClub(clubId, message);
      
      if (response.success) {
        toast.success(`${clubName} kulübüne katılma talebiniz gönderildi!`);
        
        // Üyelik durumunu güncelle
        onMembershipChange({
          isMember: false,
          isPending: true,
          role: null
        });
      } else {
        toast.error('Kulübe katılma isteği gönderilemedi: ' + (response.error || 'Bilinmeyen bir hata oluştu'));
      }
    } catch (error) {
      console.error('Kulübe katılma sırasında hata:', error);
      
      // 403 hatası özel mesaj
      if (error.response?.status === 403) {
        toast.error('Bu kulübe katılmak için yetkiniz bulunmuyor. Bu, admin veya başka bir kulübün başkanı olmanızdan kaynaklanabilir.');
      } else {
        toast.error('Kulübe katılma isteği sırasında bir hata oluştu');
      }
    } finally {
      setLoading(false);
      handleCloseJoinDialog();
    }
  };

  const handleLeaveClub = async () => {
    setLoading(true);
    try {
      const response = await membershipAPI.leaveClub(clubId);
      
      if (response.success) {
        toast.success(`${clubName} kulübünden ayrıldınız`);
        
        // Üyelik durumunu güncelle
        onMembershipChange({
          isMember: false,
          isPending: false,
          role: null
        });
      } else {
        toast.error('Kulüpten ayrılma işlemi başarısız: ' + (response.error || 'Bilinmeyen bir hata oluştu'));
      }
    } catch (error) {
      console.error('Kulüpten ayrılma sırasında hata:', error);
      toast.error('Kulüpten ayrılma işlemi sırasında bir hata oluştu');
    } finally {
      setLoading(false);
      handleCloseLeaveDialog();
    }
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <Button
        variant="outlined"
        disabled
        startIcon={<CircularProgress size={20} />}
        sx={{ minWidth: 150 }}
      >
        İşleniyor...
      </Button>
    );
  }

  // Kullanıcı zaten üye
  if (isMember) {
    return (
      <>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ExitToAppIcon />}
          onClick={handleOpenLeaveDialog}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Ayrıl
        </Button>

        {/* Ayrılma onay diyaloğu */}
        <Dialog open={openLeaveDialog} onClose={handleCloseLeaveDialog}>
          <DialogTitle>Kulüpten Ayrılma Onayı</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {clubName} kulübünden ayrılmak istediğinize emin misiniz? Bu işlem geri alınamaz.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLeaveDialog} color="primary">
              Vazgeç
            </Button>
            <Button 
              onClick={handleLeaveClub} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Ayrıl'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Bekleyen üyelik isteği var
  if (isPending) {
    return (
      <Button
        variant="outlined"
        disabled
        startIcon={<HourglassEmptyIcon />}
        size="small"
        sx={{ borderRadius: 2 }}
      >
        İstek Bekliyor
      </Button>
    );
  }

  // Kullanıcı üye değil
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAddIcon />}
        onClick={handleOpenJoinDialog}
        size="small"
        sx={{ borderRadius: 2 }}
      >
        Katıl
      </Button>

      {/* Katılma diyaloğu */}
      <Dialog open={openJoinDialog} onClose={handleCloseJoinDialog}>
        <DialogTitle>Kulübe Katılma İsteği</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {clubName} kulübüne katılmak için istek gönderin. İsterseniz bir mesaj ekleyebilirsiniz.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="message"
            label="Mesajınız (isteğe bağlı)"
            type="text"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJoinDialog} color="primary">
            İptal
          </Button>
          <Button 
            onClick={handleJoinClub} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'İstek Gönder'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClubMembershipButton; 