import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';

import { waitingListService } from '../services';
import { useAuth } from '../contexts/AuthContext';

/**
 * Kullanıcı Bekleme Listeleri Sayfası
 * Kullanıcının katıldığı tüm bekleme listelerini gösterir
 */
const UserWaitingListPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [waitingList, setWaitingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  
  // Bekleme listesini yükle
  useEffect(() => {
    const fetchWaitingList = async () => {
      try {
        setLoading(true);
        
        // Etkinlik detaylarını ve bekleme listesini al
        const event = await waitingListService.getEventDetails(eventId);
        setEventDetails(event);
        
        const list = await waitingListService.getUsersInWaitingList(eventId);
        setWaitingList(list);
        
      } catch (err) {
        console.error('Bekleme listesi yüklenirken hata:', err);
        setError('Bekleme listesi yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) {
      fetchWaitingList();
    }
  }, [eventId]);
  
  // Dialog açma işleyicisi
  const handleOpenDialog = (user, action) => {
    setSelectedUser(user);
    setDialogAction(action);
    setOpenConfirmDialog(true);
  };
  
  // Kullanıcıyı etkinliğe ekleme
  const handleAddToEvent = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      
      const result = await waitingListService.approveUserFromWaitingList(
        eventId, 
        selectedUser.id
      );
      
      if (result.success) {
        setSuccess(`${selectedUser.name} etkinliğe başarıyla eklendi.`);
        setWaitingList(prevList => prevList.filter(user => user.id !== selectedUser.id));
      } else {
        setError('Kullanıcı etkinliğe eklenemedi.');
      }
    } catch (err) {
      console.error('Kullanıcı etkinliğe eklenirken hata:', err);
      setError('İşlem sırasında bir hata oluştu.');
    } finally {
      setActionLoading(false);
      setOpenConfirmDialog(false);
    }
  };
  
  // Kullanıcıyı bekleme listesinden çıkarma
  const handleRemoveFromWaitingList = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      
      const result = await waitingListService.removeUserFromWaitingList(
        eventId, 
        selectedUser.id
      );
      
      if (result.success) {
        setSuccess(`${selectedUser.name} bekleme listesinden çıkarıldı.`);
        setWaitingList(prevList => prevList.filter(user => user.id !== selectedUser.id));
      } else {
        setError('Kullanıcı bekleme listesinden çıkarılamadı.');
      }
    } catch (err) {
      console.error('Kullanıcı listeden çıkarılırken hata:', err);
      setError('İşlem sırasında bir hata oluştu.');
    } finally {
      setActionLoading(false);
      setOpenConfirmDialog(false);
    }
  };
  
  // Kullanıcıya e-posta gönderme
  const handleEmailUser = (user) => {
    window.location.href = `mailto:${user.email}?subject=Etkinlik: ${eventDetails?.title || 'Etkinlik'} Bekleme Listesi`;
  };
  
  // Hata/başarı mesajını temizleme
  const handleClearAlert = () => {
    setError('');
    setSuccess('');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h5" gutterBottom>
        Etkinlik Bekleme Listesi
      </Typography>
      
      {eventDetails && (
        <Typography variant="h6" gutterBottom color="text.secondary">
          {eventDetails.title}
        </Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleClearAlert}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={handleClearAlert}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {waitingList.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Etkinlik için bekleme listesinde kimse yok.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="bekleme listesi tablosu">
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Katılım Tarihi</TableCell>
                  <TableCell>Durum</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waitingList.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell component="th" scope="row">
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.joinedAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.priority === 'high' ? 'Yüksek Öncelik' : 'Normal'} 
                        color={user.priority === 'high' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Etkinliğe Ekle">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenDialog(user, 'add')}
                          >
                            <PersonAddIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="E-posta Gönder">
                          <IconButton 
                            color="info" 
                            onClick={() => handleEmailUser(user)}
                          >
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Listeden Kaldır">
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDialog(user, 'remove')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Onay Diyalogları */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>
          {dialogAction === 'add' ? 'Etkinliğe Ekle' : 'Listeden Kaldır'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'add' 
              ? `${selectedUser?.name} kullanıcısını etkinliğe eklemek istediğinizden emin misiniz?`
              : `${selectedUser?.name} kullanıcısını bekleme listesinden kaldırmak istediğinizden emin misiniz?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenConfirmDialog(false)} 
            disabled={actionLoading}
          >
            İptal
          </Button>
          <Button 
            onClick={dialogAction === 'add' ? handleAddToEvent : handleRemoveFromWaitingList} 
            color={dialogAction === 'add' ? 'primary' : 'error'}
            disabled={actionLoading}
            autoFocus
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Onayla'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserWaitingListPage; 