import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Avatar,
  Button,
  Box,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  ListItemSecondaryAction,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Event as EventIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

import { notificationAPI, membershipAPI, api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistance, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

/**
 * Bildirim Merkezi Bileşeni
 * Kullanıcı bildirimlerini görüntüler ve yönetir
 */
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [activeDialog, setActiveDialog] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const anchorRef = useRef(null);

  // Bildirim özelliğinin kullanılabilirliğini kontrol et
  useEffect(() => {
    // Bildirim özelliğini etkinleştiriyorum
    setNotificationsEnabled(true);
    
    // İlk bildirim isteğini yap
    const checkNotificationsAccess = async () => {
      if (!currentUser) return;
      
      try {
        await fetchUnreadCount();
        // Başarılı olursa bildirimleri etkin tut
        setNotificationsEnabled(true);
        localStorage.removeItem('notificationsDisabled');
      } catch (error) {
        if (error.response?.status === 403) {
          // 403 hatası durumunda bildirimleri devam ettir, sadece sessizce log yap
          console.log('Bildirim erişim hatası, ancak bildirimleri etkin tutuyoruz');
          setNotificationsEnabled(true);
        }
      }
    };
    
    checkNotificationsAccess();
  }, [currentUser]);

  // Bildirimleri yükle
  const fetchNotifications = async () => {
    setLoading(true);
    console.log('Bildirimler getiriliyor...');
    
    try {
      // API servisinden bildirimleri getir
      const response = await notificationAPI.getNotifications();
      console.log('Bildirimler yanıtı:', response);
      
      if (response && response.data) {
        const notificationsData = response.data;
        console.log(`${notificationsData.length} bildirim alındı`);
        setNotifications(notificationsData);
        
        // Okunmamış bildirimleri hesapla
        const unreadCount = notificationsData.filter(n => !n.read).length;
        console.log(`${unreadCount} okunmamış bildirim var`);
        setUnreadCount(unreadCount);
      } else {
        console.error('Bildirim yanıtı beklenen formatta değil:', response);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Bildirimler alınırken hata oluştu:', error);
      
      // Hata durumunda alternatif API çağrısı dene
      try {
        console.log('Alternatif bildirim endpoint denemesi yapılıyor...');
        const response = await fetch('/api/notifications/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Alternatif bildirim sonuçları:', data);
          setNotifications(data);
          const unreadCount = data.filter(n => !n.read).length;
          setUnreadCount(unreadCount);
        } else {
          console.error('Alternatif bildirim isteği başarısız:', response.status);
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (fallbackError) {
        console.error('Alternatif bildirim isteği de başarısız oldu:', fallbackError);
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Bildirimleri formatlama yardımcı fonksiyonu
  const formatNotifications = (notifications) => {
    return notifications.map(notification => {
      // data alanı string ise JSON olarak parse et
      let parsedData = notification.data;
      if (typeof notification.data === 'string') {
        try {
          parsedData = JSON.parse(notification.data);
        } catch (e) {
          console.error(`Bildirim verisi (ID: ${notification.id}) JSON olarak ayrıştırılamadı:`, e);
          parsedData = {};
        }
      }
      
      // Dönüştürülmüş bildirimi döndür
      return {
        ...notification,
        data: parsedData,
        // Eksik alan varsa varsayılan değerler ekle
        type: notification.type || 'INFO',
        isRead: !!notification.isRead,
        createdAt: notification.createdAt || new Date().toISOString(),
        // Kulüp üyelik istekleri için entityId'yi clubId olarak ayarla
        entityId: (notification.type === 'CLUB_MEMBERSHIP_REQUEST' && parsedData && parsedData.clubId) 
          ? parsedData.clubId 
          : notification.entityId
      };
    });
  };

  const fetchUnreadCount = async () => {
    if (!currentUser || !notificationsEnabled) return;
    
    try {
      // Önce token'ı kontrol et
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('Token bulunamadı, bildirim sayısı alınamadı');
        setUnreadCount(0);
        return;
      }
      
      console.log('Okunmamış bildirim sayısı alınıyor...');
      const response = await notificationAPI.getUnreadCount();
      console.log('Bildirim sayısı yanıtı:', response);
      
      if (response) {
        let count = 0;
        
        // API yanıtı bir obje ise ve data alanı varsa, data'daki değeri kullan
        if (typeof response.data === 'object' && response.data.data !== undefined) {
          count = response.data.data;
        } 
        // API direkt sayı dönüyorsa o sayıyı kullan
        else if (typeof response.data === 'number') {
          count = response.data;
        }
        // API {data: sayı} şeklinde dönüyorsa
        else if (typeof response.data?.data === 'number') {
          count = response.data.data;
        }
        
        setUnreadCount(count);
        console.log(`Okunmamış bildirim sayısı: ${count}`);
      }
    } catch (error) {
      // 403 hatası durumunda sessizce işle
      if (error.response?.status === 403) {
        console.log('Bildirim sayısına erişim yetkisi yok - sessizce ele alınıyor');
        setNotificationsEnabled(false);
      } else if (error.response?.status === 401) {
        console.log('401 hatası - oturum geçersiz, bildirimler devre dışı');
        setNotificationsEnabled(false);
      } else {
        console.error('Okunmamış bildirim sayısı alınamadı:', error);
      }
      setUnreadCount(0);
    }
  };

  // Düzenli olarak okunmamış bildirim sayısını güncelle
  useEffect(() => {
    let isFirstRun = true;
    
    // İlk yükleme ve kullanıcı değişiminde çalışır
    const checkNotifications = async () => {
      if (!currentUser || !notificationsEnabled) return;
      
      // Bildirim durumunu kontrol et
      if (open) {
        await fetchNotifications();
      } else if (isFirstRun) {
        // İlk çalıştırmada okunmamış sayısını al
        await fetchUnreadCount();
        isFirstRun = false;
      }
    };
    
    // Eğer bildirimler devre dışıysa kontrol yapma
    if (notificationsEnabled) {
      checkNotifications();
    }
    
    // open durumu değiştiğinde tekrar çalıştır
    return () => {
      isFirstRun = false;
    };
  }, [open, currentUser, notificationsEnabled]);

  // 1 dakikada bir okunmamış bildirimleri kontrol et
  useEffect(() => {
    if (!currentUser || !notificationsEnabled) return;
    
    // Daha az sıklıkta kontrol edelim (30 saniye yerine 1 dakika)
    const interval = setInterval(() => {
      // Bildirim penceresi açık değilse, sadece sayıyı kontrol et
      if (!open) {
        fetchUnreadCount();
      }
    }, 60000); // 1 dakika
    
    return () => clearInterval(interval);
  }, [currentUser, open, notificationsEnabled]);

  // Bildirim türüne göre ikon döndür
  const getNotificationIcon = (notification) => {
    if (!notification || !notification.type) return <InfoIcon color="primary" />;
    
    switch (notification.type) {
      case 'CLUB_MEMBERSHIP_REQUEST':
        return <PersonAddIcon color="primary" />;
      case 'CLUB':
        return <GroupIcon color="success" />;
      case 'EVENT':
        return <EventIcon color="warning" />;
      case 'USER':
        return <PersonIcon color="secondary" />;
      default:
        return <InfoIcon color="primary" />;
    }
  };

  // Bildirime tıklandığında
  const handleNotificationClick = async (notification) => {
    // Bildirimi okundu olarak işaretle
    if (!notification.isRead) {
      try {
        await notificationAPI.markAsRead(notification.id);
        
        // Bildirimleri güncelle
        setNotifications(notifications.map(n => {
          if (n.id === notification.id) {
            return { ...n, isRead: true };
          }
          return n;
        }));
        
        // Okunmamış sayısını güncelle
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Bildirim okundu olarak işaretlenemedi:', error);
      }
    }
    
    // Bildirim verisi kontrolü
    let notificationData = notification.data || {};
    if (typeof notificationData === 'string') {
      try {
        notificationData = JSON.parse(notificationData);
      } catch (e) {
        console.error('Bildirim verisi parse edilemedi:', e);
        notificationData = {};
      }
    }
    
    // Daha ayrıntılı log
    console.log('Bildirime tıklandı. Tip:', notification.type);
    console.log('Bildirim verisi:', notificationData);
    console.log('Entity ID:', notification.entityId);
    
    // Bildirim tipine göre yönlendirme yap
    if (notification.type === 'CLUB_MEMBERSHIP_REQUEST') {
      // Üyelik isteği için clubId kullan - önce veri içinden sonra fallback olarak entityId'den
      const clubId = notificationData.clubId || notification.entityId;
      console.log('Üyelik isteği bildirimine tıklandı, kulüp sayfasına yönlendiriliyor. ClubId:', clubId);
      navigate(`/clubs/${clubId}`);
    } else if (notification.type === 'MEMBERSHIP_APPROVED' || notification.type === 'MEMBERSHIP_REJECTED') {
      navigate(`/clubs/${notification.entityId}`);
    } else if (notification.type === 'ROLE_CHANGED') {
      navigate(`/clubs/${notification.entityId}`);
    } else if (notification.type === 'CLUB') {
      navigate(`/clubs/${notification.entityId}`);
    } else if (notification.type === 'EVENT') {
      navigate(`/events/${notification.entityId}`);
    } else {
      // Bilinmeyen bildirim tipi - en azından detayları göster
      console.log('Bilinmeyen bildirim tipi:', notification.type);
      // Detaylı bilgileri göstermeye yakın bir yönlendirme yap
      if (notification.entityId) {
        // entityType varsa, o türe göre yönlendir
        if (notification.entityType === 'CLUB') {
          navigate(`/clubs/${notification.entityId}`);
        } else if (notification.entityType === 'EVENT') {
          navigate(`/events/${notification.entityId}`);
        } else if (notification.entityType === 'USER') {
          navigate(`/users/${notification.entityId}`);
        }
      }
    }
    
    setOpen(false);
  };

  // Tarih formatını düzenle
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true, locale: tr });
  };

  // Üyelik isteklerini işle
  const handleMembershipRequest = async (notification, action) => {
    if (!notification) return;
    
    setActionLoading(true);
    
    try {
      // Bildirim verisi kontrolü ve parse
      let notificationData = notification.data || {};
      if (typeof notificationData === 'string') {
        try {
          notificationData = JSON.parse(notificationData);
        } catch (e) {
          console.error('Bildirim verisi parse edilemedi:', e);
          toast.error('Bildirim verisi işlenemedi');
          setActionLoading(false);
          return;
        }
      }
      
      // İşlem detayları için log
      console.log(`Üyelik işlemi: ${action}, Bildirim ID: ${notification.id}`);
      console.log('İşlenecek bildirim verisi:', notificationData);
      
      // İstek ID ve kulüp ID bilgilerini al
      const requestId = notificationData.requestId;
      const clubId = notificationData.clubId || notification.entityId;
      
      if (!requestId || !clubId) {
        console.error('İstek veya kulüp ID bulunamadı:', notificationData);
        toast.error('İşlem için gerekli bilgiler eksik');
        setActionLoading(false);
        return;
      }
      
      console.log(`Üyelik isteği işleniyor: requestId=${requestId}, clubId=${clubId}, action=${action}`);
      
      let result;
      
      if (action === 'approve') {
        // Onaylama API'sini çağır
        result = await membershipAPI.approveRequest(requestId);
        if (result && result.success) {
          toast.success('Üyelik isteği onaylandı');
          console.log('Üyelik onaylandı, sonuç:', result);
        } else {
          throw new Error('Üyelik isteği onaylama işlemi başarısız');
        }
      } else if (action === 'reject') {
        // Reddetme API'sini çağır
        result = await membershipAPI.rejectRequest(requestId);
        if (result && result.success) {
          toast.success('Üyelik isteği reddedildi');
          console.log('Üyelik reddedildi, sonuç:', result);
        } else {
          throw new Error('Üyelik isteği reddetme işlemi başarısız');
        }
      }
      
      // Bildirimi okundu olarak işaretle
      await notificationAPI.markAsRead(notification.id);
      
      // Bildirimleri güncelle
      setNotifications(prevNotifications => 
        prevNotifications.map(n => {
          if (n.id === notification.id) {
            return { ...n, isRead: true, isProcessed: true };
          }
          return n;
        })
      );
      
      // Okunmamış sayısını güncelle
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Bildirimleri tekrar yükle
      fetchNotifications();
      
      // Aktif diyaloğu kapat
      setActiveDialog(null);
      
    } catch (error) {
      console.error('Üyelik isteği işlenirken hata:', error);
      toast.error(`İşlem sırasında bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Bildirim popover içeriği
  const notificationContent = (
    <Box sx={{ width: 350, maxHeight: 500, overflow: 'hidden' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Bildirimler</Typography>
        <Box>
          <Tooltip title="Tümünü okundu olarak işaretle">
            <span>
              <IconButton 
              size="small"
                onClick={() => notificationAPI.markAllAsRead()}
                disabled={unreadCount === 0}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Bildirim Ayarları">
            <IconButton size="small" onClick={() => navigate('/profile/settings')}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Tabs
        value={tabValue} 
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Tümü" />
        <Tab label={`Okunmamış (${unreadCount})`} />
      </Tabs>
      
      <Box sx={{ height: 350, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={40} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Bildirim bulunmuyor
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications
              .filter(notification => tabValue === 0 || (tabValue === 1 && !notification.isRead))
              .map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onAction={handleMembershipRequest}
                />
              ))}
          </List>
        )}
      </Box>
    </Box>
  );

  // Üyelik isteği diyaloğu
  const membershipRequestDialog = (
    <Dialog
      open={activeDialog === 'membershipRequest'}
      onClose={() => setActiveDialog(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Kulüp Üyelik İsteği</DialogTitle>
      <DialogContent>
        {selectedNotification && (
          <>
            <DialogContentText>
              {selectedNotification.message}
            </DialogContentText>
            {selectedNotification.data?.message && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2">
                  <strong>Kullanıcı Mesajı:</strong> {selectedNotification.data.message}
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setActiveDialog(null)} color="inherit">
          Kapat
        </Button>
        <Button 
          onClick={() => selectedNotification && handleMembershipRequest(
            selectedNotification, 
            'reject'
          )} 
          color="error"
          startIcon={<CloseIcon />}
        >
          Reddet
        </Button>
        <Button 
          onClick={() => selectedNotification && handleMembershipRequest(
            selectedNotification, 
            'approve'
          )} 
          color="primary"
          variant="contained"
          startIcon={<CheckIcon />}
        >
          Onayla
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Üyelik isteği için işlem butonları
  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveNotification(notification);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveNotification(null);
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await notificationAPI.markAsRead(notification.id);
      
      // Bildirimleri güncelle
      setNotifications(notifications.map(n => {
        if (n.id === notification.id) {
          return { ...n, isRead: true };
        }
        return n;
      }));
      
      // Okunmamış sayısını güncelle
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildirim okundu olarak işaretlenemedi:', error);
    }
    
    handleMenuClose();
  };

  const handleDeleteNotification = async (notification) => {
    try {
      await notificationAPI.deleteNotification(notification.id);
      
      // Bildirimleri güncelle
      setNotifications(notifications.filter(n => n.id !== notification.id));
      
      // Okunmamışsa sayacı güncelle
      if (!notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Bildirim silinemedi:', error);
    }
    
    handleMenuClose();
  };

  // Bildirim kartı bileşeni
  const NotificationItem = ({ notification, onAction }) => {
    const isClubMembershipRequest = notification.type === 'CLUB_MEMBERSHIP_REQUEST';
    
    // Bildirim verisini parse et
    let notificationData = {};
    if (notification.data) {
      try {
        notificationData = JSON.parse(notification.data);
      } catch (e) {
        console.error('Bildirim verisi parse edilemedi:', e);
      }
    }
    
    return (
      <ListItem 
        alignItems="flex-start" 
        sx={{ 
          bgcolor: notification.isRead ? 'inherit' : 'action.hover',
          borderRadius: 1,
          my: 0.5
        }}
      >
        <ListItemAvatar>
          <Avatar>
            {getNotificationIcon(notification)}
          </Avatar>
        </ListItemAvatar>
        
        <ListItemText
          primary={notification.title}
          secondary={
            <>
              <Typography
                component="span"
                variant="body2"
                color="textPrimary"
              >
                {notification.message}
              </Typography>
              <br />
              <Typography
                component="span"
                variant="caption"
                color="textSecondary"
              >
                {formatDate(notification.createdAt)}
              </Typography>
              
              {/* Üyelik isteği için onay/red butonları */}
              {isClubMembershipRequest && !notification.isProcessed && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(notification, 'reject');
                    }}
                  >
                    Reddet
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(notification, 'approve');
                    }}
                  >
                    Onayla
                  </Button>
                </Box>
              )}
            </>
          }
          onClick={() => handleNotificationClick(notification)}
          sx={{ cursor: 'pointer' }}
        />
        
        <ListItemSecondaryAction>
          <IconButton 
            edge="end" 
            size="small"
            onClick={(e) => {
              e.stopPropagation(); // Listem Item tıklamasını durdur
              handleMenuOpen(e, notification);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  if (!currentUser || !notificationsEnabled) return null;

  return (
    <>
      <IconButton
        color="inherit"
        ref={anchorRef}
        onClick={() => setOpen(!open)}
        size="large"
        sx={{ 
          color: '#6366F1',
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            transform: 'translateY(-2px)',
          }
        }}
      >
        <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="error" overlap="circular">
          {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
        </Badge>
      </IconButton>
      
    <Popover
      id="notifications-popover"
      open={open}
      anchorEl={anchorRef.current}
      onClose={() => setOpen(false)}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: '16px',
          width: { xs: '100%', sm: 400 },
          maxHeight: 500,
          overflow: 'hidden',
          mt: 1.5,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.1)',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
            borderTop: '1px solid rgba(99, 102, 241, 0.1)',
            borderLeft: '1px solid rgba(99, 102, 241, 0.1)',
          },
        },
      }}
    >
        {notificationContent}
    </Popover>
      
      {/* Dialoglar */}
      {membershipRequestDialog}
      
      {/* Menü */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {activeNotification && !activeNotification.isRead && (
          <MenuItem onClick={() => handleMarkAsRead(activeNotification)}>
            <CheckIcon fontSize="small" sx={{ mr: 1 }} />
            Okundu İşaretle
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDeleteNotification(activeNotification)}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Bildirimi Sil
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationCenter; 