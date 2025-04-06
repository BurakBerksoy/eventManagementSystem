import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Place as PlaceIcon,
  Update as UpdateIcon,
  AdminPanelSettings as AdminIcon,
  Article as ArticleIcon,
  Image as ImageIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { clubAPI } from '../../../services/api';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const InfoTab = ({ club, isManager }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedClub, setEditedClub] = useState({
    name: club?.name || '',
    description: club?.description || '',
    category: club?.category || '',
    location: club?.location || '',
    maxMembers: club?.maxMembers || 50
  });
  const [loading, setLoading] = useState(false);
  
  // Admin kontrolü
  const isAdmin = currentUser?.role === 'ADMIN';

  // Raporlar sayfasına yönlendirme
  const handleReportsClick = () => {
    navigate(`/clubs/${club.id}/reports`);
  };

  // Afişler sayfasına yönlendirme
  const handlePostersClick = () => {
    navigate(`/clubs/${club.id}/posters`);
  };

  // Etkinlik oluşturma sayfasına yönlendirme
  const handleCreateEventClick = () => {
    navigate(`/clubs/${club.id}/create-event`);
  };
  
  // Kulüp silme diyaloğunu aç
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  // Kulüp silme diyaloğunu kapat
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  // Kulüp düzenleme diyaloğunu aç
  const handleOpenEditDialog = () => {
    setEditedClub({
      name: club?.name || '',
      description: club?.description || '',
      category: club?.category || '',
      location: club?.location || '',
      maxMembers: club?.maxMembers || 50
    });
    setOpenEditDialog(true);
  };
  
  // Kulüp düzenleme diyaloğunu kapat
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  // Form değişikliklerini takip et
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedClub({
      ...editedClub,
      [name]: value
    });
  };
  
  // Kulüp silme işlemi
  const handleDeleteClub = async () => {
    setLoading(true);
    console.log(`Kulüp silme işlemi başlatılıyor, club ID: ${club.id}`);
    
    try {
      // Token kontrolü
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        setOpenDeleteDialog(false);
        navigate('/login');
        return;
      }
      
      // Kullanıcının admin olduğundan emin ol
      const userStr = localStorage.getItem('user');
      let isUserAdmin = false;
      
      if (!userStr) {
        toast.error('Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        setOpenDeleteDialog(false);
        navigate('/login');
        return;
      }
      
      try {
        const userData = JSON.parse(userStr);
        console.log('Kullanıcı bilgileri:', userData);
        isUserAdmin = userData.role === 'ADMIN';
        
        if (!isUserAdmin) {
          toast.error('Bu işlem için admin yetkiniz bulunmuyor.');
          setLoading(false);
          setOpenDeleteDialog(false);
          return;
        }
        
        console.log(`Kullanıcı rolü: ${userData.role}, Admin mi: ${isUserAdmin}`);
      } catch (e) {
        console.error('Kullanıcı bilgisi parse edilemedi:', e);
        toast.error('Kullanıcı bilgileri alınamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        setOpenDeleteDialog(false);
        navigate('/login');
        return;
      }
      
      // Silme işlemini gerçekleştir
      toast.loading('Kulüp siliniyor...', { id: 'delete-club' });
      
      // Doğrudan window.fetch kullanarak Spring Boot API'sine istek gönder
      const API_URL = 'http://localhost:8080';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-User-Role': 'ADMIN'
      };
      
      // DELETE isteği gönder
      const response = await fetch(`${API_URL}/api/clubs/${club.id}`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'include'
      });
      
      toast.dismiss('delete-club');
      
      if (response.ok) {
        // Başarılı silme işlemi
        toast.success('Kulüp başarıyla silindi');
        console.log('Kulüp başarıyla silindi, kulüpler sayfasına yönlendiriliyor...');
        
        // localStorage'dan token ve kullanıcı bilgilerini yenile
        const refreshToken = localStorage.getItem('auth_token');
        if (refreshToken) {
          console.log('Token yenileniyor...');
          localStorage.setItem('auth_token', refreshToken);
        }
        
        // Sayfayı yenile
        setTimeout(() => {
          navigate('/clubs');
        }, 1000);
      } else {
        // Hata durumu
        let errorMessage = 'Kulüp silinemedi';
        
        if (response.status === 401) {
          errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        } else if (response.status === 403) {
          errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
        } else if (response.status === 404) {
          errorMessage = 'Silinecek kulüp bulunamadı.';
        } else {
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            console.error('Hata yanıtı JSON olarak okunamadı:', e);
          }
        }
        
        console.error('Kulüp silme hatası:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Kulüp silinirken beklenmeyen hata oluştu:', error);
      toast.error('Kulüp silinemedi: ' + (error.message || 'Ağ hatası veya sunucu bağlantı sorunu'));
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };
  
  // Kulüp düzenleme işlemi
  const handleEditClub = async () => {
    setLoading(true);
    try {
      const response = await clubAPI.updateClub(club.id, editedClub);
      if (response) {
        toast.success('Kulüp bilgileri başarıyla güncellendi');
        // Sayfayı yeniden yükle
        window.location.reload();
      }
    } catch (error) {
      console.error('Kulüp güncellenirken hata oluştu:', error);
      toast.error('Kulüp güncellenemedi: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
      setOpenEditDialog(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Yönetim Paneli (Başkan, Admin ve ilgili roller için) */}
      {isManager && (
        <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AdminIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Yönetim Paneli</Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Kulübünüzü yönetmek için aşağıdaki işlemleri gerçekleştirebilirsiniz:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  startIcon={<ArticleIcon />}
                  onClick={handleReportsClick}
                  sx={{ 
                    py: 1.5, 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Raporlar
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  startIcon={<ImageIcon />}
                  onClick={handlePostersClick}
                  sx={{ 
                    py: 1.5, 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Afişler
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  startIcon={<EventIcon />}
                  onClick={handleCreateEventClick}
                  sx={{ 
                    py: 1.5, 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Etkinlik Oluştur
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Admin için kulüp silme ve düzenleme butonları */}
      {isAdmin && (
        <Card sx={{ mb: 3, bgcolor: 'error.light', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AdminIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Admin Yönetim Paneli</Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Admin olarak bu kulüp için aşağıdaki özel işlemleri gerçekleştirebilirsiniz:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleOpenEditDialog}
                  sx={{ 
                    py: 1.5, 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Kulübü Düzenle
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenDeleteDialog}
                  sx={{ 
                    py: 1.5, 
                    bgcolor: 'white', 
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Kulübü Sil
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kulüp Hakkında
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {club.description || 'Kulüp açıklaması bulunmamaktadır.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kulüp Bilgileri
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2">
                  <strong>Kuruluş Tarihi:</strong> {club.foundingDate || 'Belirtilmemiş'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PlaceIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2">
                  <strong>Lokasyon:</strong> {club.location || 'Belirtilmemiş'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <UpdateIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="body2">
                  <strong>Son Güncelleme:</strong> {
                    club.updatedAt 
                      ? new Date(club.updatedAt).toLocaleDateString('tr-TR')
                      : 'Belirtilmemiş'
                  }
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Etiketler
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip size="small" label={club.category || 'Kategori'} color="primary" />
                {club.tags && club.tags.map((tag) => (
                  <Chip key={tag} size="small" label={tag} />
                ))}
                {(!club.tags || club.tags.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    Etiket bulunmamaktadır.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Kulüp Silme Diyaloğu */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Kulübü Silmek İstediğinize Emin Misiniz?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <strong>{club?.name}</strong> kulübünü silmek üzeresiniz. Bu işlem geri alınamaz ve tüm kulüp verileri (üyeler, etkinlikler vb.) kalıcı olarak silinecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog} 
            color="primary"
            disabled={loading}
          >
            İptal
          </Button>
          <Button 
            onClick={handleDeleteClub} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <DeleteIcon />}
            autoFocus
          >
            {loading ? "Siliniyor..." : "Kulübü Sil"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kulüp Düzenleme Diyaloğu */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="form-dialog-title">Kulüp Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Kulüp Adı"
                fullWidth
                value={editedClub.name}
                onChange={handleEditChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Kulüp Açıklaması"
                fullWidth
                multiline
                rows={4}
                value={editedClub.description}
                onChange={handleEditChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Kategori"
                fullWidth
                value={editedClub.category}
                onChange={handleEditChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="location"
                label="Lokasyon"
                fullWidth
                value={editedClub.location}
                onChange={handleEditChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="maxMembers"
                label="Maksimum Üye Sayısı"
                type="number"
                fullWidth
                value={editedClub.maxMembers}
                onChange={handleEditChange}
                disabled={loading}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseEditDialog} 
            color="primary"
            disabled={loading}
          >
            İptal
          </Button>
          <Button 
            onClick={handleEditClub} 
            color="primary" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <EditIcon />}
          >
            {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfoTab; 