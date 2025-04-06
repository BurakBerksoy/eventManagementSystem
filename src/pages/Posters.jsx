import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { clubAPI } from '../services/api';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Chip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Modal,
  InputBase,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Event as EventIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const Posters = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State değişkenleri
  const [club, setClub] = useState(null);
  const [posters, setPosters] = useState([]);
  const [filteredPosters, setFilteredPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog ve modal state değişkenleri
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageModal, setOpenImageModal] = useState(false);
  
  const [newPoster, setNewPoster] = useState({
    title: '',
    description: '',
    eventId: '',
    type: 'EVENT' // EVENT, ANNOUNCEMENT, OTHER
  });
  
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Veri yükleme fonksiyonu
  useEffect(() => {
    const fetchClubAndPosters = async () => {
      try {
        setLoading(true);
        
        // Kulüp bilgilerini çek
        const clubResponse = await clubAPI.getClubById(clubId);
        setClub(clubResponse.data);
        
        // Kulüpteki rolü belirle
        if (currentUser) {
          const members = clubResponse.data.members || [];
          const userMembership = members.find(member => member.userId === currentUser.id);
          setUserRole(userMembership ? userMembership.role : null);
        }
        
        // Afişleri çek
        const postersResponse = await clubAPI.getClubPosters(clubId);
        setPosters(postersResponse.data);
        setFilteredPosters(postersResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Afişler yüklenirken hata oluştu:', err);
        setError('Afişler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClubAndPosters();
  }, [clubId, currentUser]);
  
  // Afiş türünü görsel metne dönüştürme
  const getPosterTypeLabel = (type) => {
    switch (type) {
      case 'EVENT': return 'Etkinlik Afişi';
      case 'ANNOUNCEMENT': return 'Duyuru';
      case 'OTHER': return 'Diğer';
      default: return 'Bilinmiyor';
    }
  };
  
  // Afiş türüne göre renk belirleme
  const getPosterTypeColor = (type) => {
    switch (type) {
      case 'EVENT': return 'primary';
      case 'ANNOUNCEMENT': return 'warning';
      case 'OTHER': return 'default';
      default: return 'default';
    }
  };
  
  // Tarih formatı
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Dialog açma/kapama fonksiyonları
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    setNewPoster({
      title: '',
      description: '',
      eventId: '',
      type: 'EVENT'
    });
    setSelectedFile(null);
    setDialogError(null);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  // Form değişiklik yönetimi
  const handlePosterChange = (e) => {
    const { name, value } = e.target;
    setNewPoster(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Dosya seçimi
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      setDialogError('Lütfen bir resim dosyası seçin (JPG, PNG, GIF).');
      return;
    }
    setSelectedFile(file);
    setDialogError(null);
  };
  
  // Afiş görüntüleme modal kontrolleri
  const handleOpenImageModal = (poster) => {
    setSelectedImage(poster);
    setOpenImageModal(true);
  };
  
  const handleCloseImageModal = () => {
    setOpenImageModal(false);
  };
  
  // Afiş yükleme
  const handleSubmitPoster = async () => {
    if (!newPoster.title || !selectedFile) {
      setDialogError('Lütfen başlık ve afiş görseli seçtiğinizden emin olun.');
      return;
    }
    
    setDialogLoading(true);
    setDialogError(null);
    
    try {
      const posterData = {
        ...newPoster,
        clubId: clubId
      };
      
      await clubAPI.createPoster(posterData, selectedFile);
      
      // State'i güncelle
      const postersResponse = await clubAPI.getClubPosters(clubId);
      setPosters(postersResponse.data);
      setFilteredPosters(postersResponse.data);
      
      // Dialog'u kapat
      setOpenAddDialog(false);
      
      // Bildirim göster
      setSnackbar({
        open: true,
        message: 'Afiş başarıyla yüklendi.',
        severity: 'success'
      });
    } catch (err) {
      console.error('Afiş yüklenirken hata:', err);
      setDialogError('Afiş yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setDialogLoading(false);
    }
  };
  
  // Afiş indirme
  const handleDownloadPoster = async (posterId) => {
    try {
      const response = await clubAPI.downloadPoster(posterId);
      
      // Dosya adını bulma
      const poster = posters.find(p => p.id === posterId);
      const filename = poster ? poster.filename : `afiş-${posterId}.jpg`;
      
      // Blob oluşturup indirme
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Afiş indirilirken hata:', err);
      setSnackbar({
        open: true,
        message: 'Afiş indirilirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };
  
  // Afiş silme
  const handleDeletePoster = async (posterId) => {
    if (!window.confirm('Bu afişi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      await clubAPI.deletePoster(posterId);
      
      // State'i güncelle
      setPosters(posters.filter(poster => poster.id !== posterId));
      setFilteredPosters(filteredPosters.filter(poster => poster.id !== posterId));
      
      // Bildirim göster
      setSnackbar({
        open: true,
        message: 'Afiş başarıyla silindi.',
        severity: 'success'
      });
    } catch (err) {
      console.error('Afiş silinirken hata:', err);
      setSnackbar({
        open: true,
        message: 'Afiş silinirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };
  
  // Snackbar kapatma
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Yetki kontrolü
  const canManagePosters = ['PRESIDENT', 'VICE_PRESIDENT', 'ADMIN'].includes(userRole);
  
  // Arama fonksiyonu
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosters(posters);
    } else {
      const filtered = posters.filter(poster => 
        poster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poster.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poster.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosters(filtered);
    }
  }, [searchTerm, posters]);
  
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error && !canManagePosters) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Container>
    );
  }
  
  if (!club) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>Kulüp bulunamadı.</Alert>
        <Button variant="contained" onClick={() => navigate('/clubs')}>
          Kulüpler Sayfasına Dön
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <ImageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Afişler
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kulüp etkinliklerine ait afişleri görüntüleyebilir ve yönetebilirsiniz. Dijital tasarımcı rolüne sahip kişiler yeni afiş yükleyebilir.
        </Typography>
      </Box>
      
      {/* Arama ve Filtre Bölümü */}
      <Paper
        sx={{
          p: 2,
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: 500 }}>
          <IconButton sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Afiş ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Yeni Afiş Yükle
        </Button>
      </Paper>
      
      {/* Afişler Grid */}
      <Box sx={{ mb: 4 }}>
        {filteredPosters.length === 0 ? (
          <Alert severity="info">
            {searchTerm ? 'Aramanızla eşleşen afiş bulunamadı.' : 'Henüz hiç afiş yüklenmemiş.'}
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredPosters.map((poster) => (
              <Grid item key={poster.id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={poster.imageUrl}
                    alt={poster.title}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => handleOpenImageModal(poster)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {poster.title}
                    </Typography>
                    
                    {poster.eventName && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Etkinlik: {poster.eventName}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary">
                      Yükleyen: {poster.uploadedBy}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatDate(poster.uploadDate)}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      startIcon={<VisibilityIcon />} 
                      size="small"
                      onClick={() => handleOpenImageModal(poster)}
                    >
                      Görüntüle
                    </Button>
                    
                    <Button 
                      startIcon={<DownloadIcon />} 
                      size="small"
                      onClick={() => handleDownloadPoster(poster.id)}
                    >
                      İndir
                    </Button>
                    
                    {canManagePosters && (
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleDeletePoster(poster.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Yeni Afiş Ekleme Dialog'u */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Afiş Ekle</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Afiş Başlığı"
            type="text"
            fullWidth
            variant="outlined"
            value={newPoster.title}
            onChange={handlePosterChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Açıklama"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newPoster.description}
            onChange={handlePosterChange}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="poster-type-label">Afiş Türü</InputLabel>
            <Select
              labelId="poster-type-label"
              id="type"
              name="type"
              value={newPoster.type}
              label="Afiş Türü"
              onChange={handlePosterChange}
            >
              <MenuItem value="EVENT">Etkinlik Afişi</MenuItem>
              <MenuItem value="ANNOUNCEMENT">Duyuru</MenuItem>
              <MenuItem value="OTHER">Diğer</MenuItem>
            </Select>
          </FormControl>
          
          {newPoster.type === 'EVENT' && (
            <TextField
              margin="dense"
              id="eventId"
              name="eventId"
              label="Etkinlik ID (opsiyonel)"
              type="text"
              fullWidth
              variant="outlined"
              value={newPoster.eventId}
              onChange={handlePosterChange}
              helperText="Etkinlik varsa, etkinlik ID'sini ekleyebilirsiniz."
              sx={{ mb: 3 }}
            />
          )}
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ mb: 2 }}
          >
            Afiş Görseli Seç
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept="image/*"
            />
          </Button>
          
          {selectedFile && (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'rgba(106, 17, 203, 0.08)', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <ImageIcon sx={{ mr: 1, color: '#6a11cb' }} />
              <Typography variant="body2">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </Typography>
              
              {/* Seçilen dosya önizleme */}
              {selectedFile && (
                <Box sx={{ mt: 2, width: '100%' }}>
                  <img 
                    src={URL.createObjectURL(selectedFile)}
                    alt="Afiş önizleme"
                    style={{ 
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      marginTop: '8px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={dialogLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleSubmitPoster} 
            variant="contained" 
            disabled={dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={20} /> : null}
          >
            {dialogLoading ? 'Yükleniyor...' : 'Afişi Yükle'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Afiş Görüntüleme Modal */}
      <Modal
        open={openImageModal}
        onClose={handleCloseImageModal}
        aria-labelledby="poster-modal-title"
        aria-describedby="poster-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 2 
          }}>
            <Box>
              <Typography id="poster-modal-title" variant="h6" component="h2">
                {selectedImage?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedImage?.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Chip 
                  label={selectedImage ? getPosterTypeLabel(selectedImage.type) : ''} 
                  size="small" 
                  color={selectedImage ? getPosterTypeColor(selectedImage.type) : 'default'}
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {selectedImage ? formatDate(selectedImage.uploadDate) : ''}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={handleCloseImageModal}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center',
            mb: 2 
          }}>
            <img
              src={selectedImage?.imageUrl || 'https://via.placeholder.com/600x900?text=Afiş+Görseli'}
              alt={selectedImage?.title}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {selectedImage && selectedImage.eventId && (
              <Button
                variant="outlined"
                startIcon={<EventIcon />}
                onClick={() => {
                  handleCloseImageModal();
                  navigate(`/events/${selectedImage.eventId}`);
                }}
              >
                Etkinliğe Git
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => selectedImage && handleDownloadPoster(selectedImage.id)}
            >
              İndir
            </Button>
            {canManagePosters && selectedImage && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  if (selectedImage) {
                    handleDeletePoster(selectedImage.id);
                    handleCloseImageModal();
                  }
                }}
              >
                Sil
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
      
      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Posters; 