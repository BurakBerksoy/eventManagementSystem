import React, { useState, useEffect } from 'react';
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
import { membershipAPI, joinClub } from '../../services/api';
import { toast } from 'react-hot-toast';
import { requestJoinClub, membershipService, cancelRequest } from '../../services/membershipService';
import notificationAPI from '../../services/notificationAPI';
import { STORAGE_KEYS, NOTIFICATION_TYPES } from '../../config/config';

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
  const [alertVariant, setAlertVariant] = useState('success');
  const [showAlert, setShowAlert] = useState(false);

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
      console.log(`Kulübe katılma isteği gönderiliyor. Kullanıcı: ${currentUser.id}, Kulüp: ${clubId}, Kulüp Adı: ${clubName}`);
      
      // Kullanıcı ve kulüp bilgileri için ekstra kontrol
      if (!currentUser || !currentUser.id) {
        toast.error('Kullanıcı bilgileriniz eksik. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }
      
      if (!clubId) {
        toast.error('Kulüp bilgisi eksik. Lütfen sayfayı yenileyin.');
        setLoading(false);
        return;
      }
      
      // Kulüp ve başkan bilgilerini sayfadan al
      let presidentInfo = null;
      if (membershipStatus && membershipStatus.presidentId) {
        presidentInfo = {
          id: membershipStatus.presidentId,
          name: membershipStatus.presidentName || 'Kulüp Başkanı'
        };
        console.log('Mevcut membershipStatus üzerinden başkan bilgisi bulundu:', presidentInfo);
      } else {
        // Sayfada zaten gösterilen kulüp bilgilerini bulmaya çalış
        try {
          const clubInfoElements = document.querySelectorAll('.club-detail-header, .club-info');
          if (clubInfoElements.length > 0) {
            // DOM'dan kulüp bilgilerini çıkarmayı dene
            const presidentElement = document.querySelector('[data-president-id]');
            if (presidentElement) {
              presidentInfo = {
                id: presidentElement.getAttribute('data-president-id'),
                name: presidentElement.getAttribute('data-president-name') || 'Kulüp Başkanı'
              };
              console.log('DOM üzerinden başkan bilgisi alındı:', presidentInfo);
            }
          }
        } catch (domError) {
          console.warn('DOM\'dan başkan bilgisi alınamadı:', domError);
        }
      }
      
      // İsteği localStorage'a da kaydet (token problemi olma ihtimaline karşı)
      try {
        const pendingRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS) || '[]');
        const existingRequest = pendingRequests.find(req => req.clubId == clubId);
        
        if (!existingRequest) {
          pendingRequests.push({
            clubId: clubId,
            clubName: clubName,
            userId: currentUser.id,
            userName: currentUser.name,
            requestDate: new Date().toISOString(),
            presidentId: presidentInfo?.id,
            requestId: `local-${Date.now()}`
          });
          
          localStorage.setItem(STORAGE_KEYS.PENDING_REQUESTS, JSON.stringify(pendingRequests));
          console.log('İstek localStorage\'a kaydedildi');
        }
      } catch (storageError) {
        console.warn('İstek localStorage\'a kaydedilemedi:', storageError);
      }
      
      // MembershipService üzerinden katılma isteği gönder (başkan bilgisini ekstra parametre olarak geçerek)
      const extraParams = presidentInfo ? { presidentInfo } : {};
      const result = await requestJoinClub(clubId, extraParams);
      console.log('Katılma isteği sonucu:', result);
      
      if (result.success) {
        // Başarılı katılma isteği
        onMembershipChange({
          isMember: false,
          isPending: true,
          role: null,
          clubId: clubId,
          clubName: clubName,
          presidentId: result.presidentId || (presidentInfo ? presidentInfo.id : null),
        });
        
        // Kullanıcıya başarılı mesajı göster ve diyaloğu kapat
        toast.success('Kulübe katılma isteğiniz başarıyla gönderildi');
        handleCloseJoinDialog();
        
        // Kulüp başkanına bildirim gönder - artık result içindeki presidentId'yi kullan
        try {
          const targetPresidentId = result.presidentId || 
                                  (presidentInfo ? presidentInfo.id : null) || 
                                  (membershipStatus ? membershipStatus.presidentId : null);
                                  
          if (targetPresidentId) {
            console.log(`Bildirim gönderilecek başkan ID: ${targetPresidentId}`);
            
            const notificationData = {
              title: 'Yeni Üyelik İsteği',
              message: `${currentUser.name} kulübünüze katılmak istiyor`,
              type: NOTIFICATION_TYPES.CLUB_JOIN_REQUEST,
              receiverId: targetPresidentId,
              senderId: currentUser.id,
              data: JSON.stringify({
                requestId: result.request ? result.request.requestId : `req-${Date.now()}`,
                clubId: clubId,
                userId: currentUser.id,
                userName: currentUser.name,
                clubName: clubName,
                requestDate: new Date().toISOString()
              })
            };
            
            // NotificationAPI ile bildirim gönder
            try {
              const notificationResult = await notificationAPI.createNotification(notificationData);
              console.log('Bildirim gönderme sonucu:', notificationResult);
              
              if (notificationResult && notificationResult.success) {
                console.log('Bildirim başarıyla gönderildi');
              } else {
                console.warn('Bildirim gönderilemedi:', notificationResult);
                
                // API ile bildirim gönderilemediyse localStorage'a kaydet
                try {
                  const notificationsInStorage = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
                  const notificationWithId = {
                    ...notificationData,
                    id: `local-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    read: false
                  };
                  
                  notificationsInStorage.push(notificationWithId);
                  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsInStorage));
                  console.log('Bildirim localStorage\'a eklendi');
                } catch (storageError) {
                  console.error('localStorage bildirim hatası:', storageError);
                }
              }
            } catch (notificationError) {
              console.error('Bildirim gönderirken hata oluştu:', notificationError);
              
              // Hata durumunda localStorage'a kaydet
              try {
                const notificationsInStorage = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
                const notificationWithId = {
                  ...notificationData,
                  id: `local-${Date.now()}`,
                  createdAt: new Date().toISOString(),
                  read: false
                };
                
                notificationsInStorage.push(notificationWithId);
                localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsInStorage));
                console.log('Bildirim localStorage\'a eklendi');
              } catch (storageError) {
                console.error('localStorage bildirim hatası:', storageError);
              }
            }
          } else {
            console.warn('Kulüp başkanı bilgisi bulunamadı (presidentId yok). Bildirim gönderilemedi.');
          }
        } catch (error) {
          console.error('Bildirim gönderme süreci sırasında hata:', error);
          // Bildirim hatası kullanıcı üyelik isteğini etkilememeli
        }
      } else {
        // Başarısız katılma isteği
        toast.error(result.message || 'Kulübe katılma isteği gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (error) {
      console.error('Kulübe katılma isteği sırasında hata:', error);
      toast.error('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
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

  const handleCancelRequest = async () => {
    setLoading(true);
    try {
      console.log(`Kulüp katılma isteğini iptal ediyorum, clubId: ${clubId}`);
      
      // MembershipService üzerinden isteği iptal et
      const result = await cancelRequest(clubId);
      console.log('İptal isteği sonucu:', result);
      
      if (result.success) {
        // İstek başarıyla iptal edildi
        toast.success('Kulüp katılma isteğiniz iptal edildi');
        
        onMembershipChange({
          isMember: false,
          isPending: false,
          role: null
        });
        
        // LocalStorage'dan isteği sil
        try {
          const pendingRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REQUESTS) || '[]');
          const filteredRequests = pendingRequests.filter(req => req.clubId != clubId);
          localStorage.setItem(STORAGE_KEYS.PENDING_REQUESTS, JSON.stringify(filteredRequests));
        } catch (storageError) {
          console.warn('localStorage istek silme hatası:', storageError);
        }
      } else {
        // İstek iptal edilemedi
        toast.error(result.message || 'İstek iptal edilemedi, lütfen daha sonra tekrar deneyin');
      }
    } catch (error) {
      console.error('İstek iptal edilirken hata:', error);
      toast.error('İstek iptal edilirken bir hata oluştu');
    } finally {
      setLoading(false);
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

  // Kullanıcı zaten üye değil
  return (
    <>
      {isPending ? (
        // Bekleyen üyelik isteği var
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<HourglassEmptyIcon />}
          onClick={handleCancelRequest}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          İsteği İptal Et
        </Button>
      ) : (
        // Kullanıcı üye değil ve bekleyen isteği yok
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
      )}

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