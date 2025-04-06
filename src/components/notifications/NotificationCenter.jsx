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

import { notificationAPI, membershipAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistance, format } from 'date-fns';
import { tr } from 'date-fns/locale';

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
    if (!currentUser || !notificationsEnabled) return;
    
    setLoading(true);
    try {
      const response = await notificationAPI.getNotifications();
      if (response && response.data) {
        setNotifications(response.data);
        
        // Okunmamış bildirimleri say
        const unread = response.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      // 403 hatası durumunda sessizce işle
      if (error.response?.status === 403) {
        console.log('Bildirimlere erişim yetkisi yok - sessizce ele alınıyor');
        setNotificationsEnabled(false);
      } else {
        console.error('Bildirimler alınamadı:', error);
      }
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!currentUser || !notificationsEnabled) return;
    
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response && response.data !== undefined) {
        // API yanıtı bir obje ise ve data alanı varsa, data'daki değeri kullan
        if (typeof response.data === 'object' && response.data.data !== undefined) {
          setUnreadCount(response.data.data);
        } 
        // API direkt sayı dönüyorsa o sayıyı kullan
        else if (typeof response.data === 'number') {
          setUnreadCount(response.data);
        }
        // Diğer durumlarda 0 olarak ayarla
        else {
          setUnreadCount(0);
        }
      }
    } catch (error) {
      // 403 hatası durumunda sessizce işle
      if (error.response?.status === 403) {
        console.log('Bildirim sayısına erişim yetkisi yok - sessizce ele alınıyor');
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
    }
    
    // Bildirim tipine göre yönlendirme yap
    if (notification.type === 'MEMBERSHIP_REQUEST') {
      navigate(`/clubs/${notification.relatedId}`);
    } else if (notification.type === 'MEMBERSHIP_APPROVED' || notification.type === 'MEMBERSHIP_REJECTED') {
      navigate(`/clubs/${notification.relatedId}`);
    } else if (notification.type === 'ROLE_CHANGED') {
      navigate(`/clubs/${notification.relatedId}`);
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
  const handleMembershipRequest = async (requestId, action) => {
    setActionLoading(true);
    
    try {
      if (action === 'approve') {
        // İsteği onayla
        await membershipAPI.approveRequest(requestId);
        console.log(`Üyelik isteği onaylandı: ${requestId}`);
        
        // Bildirimleri güncelle
        setSnackbar({
          open: true,
          message: 'Üyelik isteği başarıyla onaylandı',
          severity: 'success'
        });
      } else if (action === 'reject') {
        // İsteği reddet
        await membershipAPI.rejectRequest(requestId);
        console.log(`Üyelik isteği reddedildi: ${requestId}`);
        
        // Bildirimleri güncelle
        setSnackbar({
          open: true,
          message: 'Üyelik isteği reddedildi',
          severity: 'info'
        });
      }
      
      // Bildirimleri yeniden yükle
      fetchNotifications();
    } catch (error) {
      console.error('Üyelik isteği işlenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'İşlem sırasında bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setActionLoading(false);
      setActiveDialog(null);
      setSelectedNotification(null);
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
            selectedNotification.data?.requestId, 
            'reject'
          )} 
          color="error"
          startIcon={<CloseIcon />}
        >
          Reddet
        </Button>
        <Button 
          onClick={() => selectedNotification && handleMembershipRequest(
            selectedNotification.data?.requestId, 
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
            <React.Fragment>
              <Typography variant="body2" component="span" color="text.primary">
                {notification.message}
              </Typography>
              
              {/* Üyelik isteği için onay/red butonları */}
              {isClubMembershipRequest && notificationData.requestId && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => onAction(notificationData.requestId, 'approve')}
                    disabled={actionLoading}
                  >
                    Onayla
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => onAction(notificationData.requestId, 'reject')}
                    disabled={actionLoading}
                  >
                    Reddet
                  </Button>
                </Box>
              )}
              
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {formatDate(notification.createdAt)}
              </Typography>
            </React.Fragment>
          }
        />
        
        <ListItemSecondaryAction>
          <IconButton 
            edge="end" 
            aria-label="daha fazla"
            onClick={(event) => handleMenuOpen(event, notification)}
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