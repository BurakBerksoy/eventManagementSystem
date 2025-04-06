import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Add as AddIcon,
  PhotoCamera as UploadIcon,
  Event as EventIcon,
  Place as PlaceIcon,
  Group as GroupIcon,
  Restaurant as FoodIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { clubAPI } from '../services/api';

const CreateEvent = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // URL'den event ID alınır
  const passedEventData = location.state?.eventData;
  
  // Durum değişkenleri
  const [clubInfo, setClubInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  
  // Form verileri
  const [formData, setFormData] = useState({
    title: passedEventData?.title || '',
    description: passedEventData?.description || '',
    ideaOwner: passedEventData?.ideaOwner || '',
    capacity: passedEventData?.capacity || '',
    startDate: passedEventData?.date ? new Date(passedEventData.date) : new Date(),
    endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // +2 saat
    location: passedEventData?.location || '',
    refreshments: passedEventData?.refreshments || '',
    speakers: passedEventData?.speakers ? passedEventData.speakers.split(',').map(s => s.trim()).filter(Boolean) : [],
    poster: null
  });

  // Sayfa URLsini kontrol et
  useEffect(() => {
    console.log('CreateEvent sayfası: ClubId =', clubId);
    console.log('Mevcut URL:', window.location.href);
    console.log('Geçirilen event verileri:', passedEventData);
  }, [clubId, passedEventData]);

  // Kulüp ve üye verilerini yükle
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setLoading(true);
        
        // Kulüp bilgilerini getir
        console.log('Kulüp bilgileri getiriliyor:', clubId);
        try {
          const clubResponse = await clubAPI.getClubById(clubId);
          setClubInfo(clubResponse.data);
        } catch (clubError) {
          console.error('Kulüp bilgisi alınamadı:', clubError);
          setError(`Kulüp bilgisi alınamadı: ${clubError.message || 'Bilinmeyen hata'}`);
          setClubInfo(null);
        }
        
        // Kulüp üyelerini getir
        console.log('Kulüp üyeleri getiriliyor:', clubId);
        try {
          const membersData = await clubAPI.getClubMembers(clubId);
          setMembers(membersData);
        } catch (memberError) {
          console.warn('Üye verileri alınamadı:', memberError);
          setMembers([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Veri yükleme sırasında bir hata oluştu:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };
    
    fetchClubData();
  }, [clubId]);

  // Form değişikliği işle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Tarih seçici değişikliği
  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Poster dosyası yükleme
  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        poster: file
      }));
    }
  };

  // Konuşmacı ekleme/çıkarma
  const handleSpeakersChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      speakers: newValue
    }));
  };

  // Önizleme
  const handlePreview = () => {
    setOpenPreviewDialog(true);
  };

  // Önizleme kapatma
  const handleClosePreview = () => {
    setOpenPreviewDialog(false);
  };

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.title || !formData.description || !formData.capacity || !formData.startDate || !formData.location) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('Etkinlik oluşturma işlemi başlatılıyor:', formData);
      
      // Form verilerini API formatına dönüştür - formatı backend gereksinimlere göre ayarla
      const apiData = {
        title: formData.title,
        description: formData.description,
        ideaOwner: formData.ideaOwner,
        capacity: parseInt(formData.capacity),
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        location: formData.location,
        refreshments: formData.refreshments || '',
        speakers: Array.isArray(formData.speakers) ? formData.speakers.join(', ') : formData.speakers,
        clubId: clubId
      };
      
      console.log('API Verisi:', apiData, 'ClubId:', clubId);
      
      // Etkinliği oluştur
      try {
        const response = await clubAPI.createEvent(clubId, apiData);
        console.log('Etkinlik oluşturma başarılı:', response);
        
        setSubmitSuccess(true);
        
        // Başarıyla oluşturulduktan sonra kulüp sayfasına yönlendir
        setTimeout(() => {
          navigate(`/clubs/${clubId}`);
        }, 2000);
      } catch (apiError) {
        console.error('API çağrısı sırasında hata:', apiError);
        const errorMessage = apiError.response?.data?.message || apiError.message || 'Bilinmeyen bir hata oluştu';
        setError(`Etkinlik oluşturulamadı: ${errorMessage}`);
      }
      
    } catch (err) {
      console.error('Etkinlik oluşturma sırasında bir hata oluştu:', err);
      setError('Etkinlik oluşturulurken bir hata meydana geldi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !clubInfo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(`/clubs/${clubId}`)}>
          Kulüp Sayfasına Dön
        </Button>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <EventIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
            <Typography variant="h5" component="h1">
              {clubInfo?.name || 'Kulüp'} için Yeni Etkinlik Oluştur
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Etkinlik başarıyla oluşturuldu! Kulüp sayfasına yönlendiriliyorsunuz...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Etkinlik Adı */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Etkinlik Adı"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              
              {/* Etkinlik Açıklaması */}
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Etkinlik Açıklaması"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  variant="outlined"
                  multiline
                  rows={4}
                />
              </Grid>
              
              {/* Fikir Sahibi */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Etkinlik Fikir Sahibi</InputLabel>
                  <Select
                    name="ideaOwner"
                    value={formData.ideaOwner}
                    onChange={handleInputChange}
                    label="Etkinlik Fikir Sahibi"
                  >
                    {members.map(member => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name} - {member.role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Kontenjan */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Etkinlik Kontenjanı"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Başlangıç Tarihi */}
              <Grid item xs={12} sm={6}>
                <MobileDateTimePicker
                  label="Başlangıç Tarihi ve Saati"
                  value={formData.startDate}
                  onChange={(newValue) => handleDateChange('startDate', newValue)}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              
              {/* Bitiş Tarihi */}
              <Grid item xs={12} sm={6}>
                <MobileDateTimePicker
                  label="Bitiş Tarihi ve Saati"
                  value={formData.endDate}
                  onChange={(newValue) => handleDateChange('endDate', newValue)}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              
              {/* İkram */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="İkram Bilgileri"
                  name="refreshments"
                  value={formData.refreshments}
                  onChange={handleInputChange}
                  variant="outlined"
                  placeholder="Etkinlikte sunulacak ikramları belirtiniz"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FoodIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Mekan */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Etkinlik Mekanı"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PlaceIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Konuşmacılar */}
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formData.speakers}
                  onChange={handleSpeakersChange}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        variant="outlined" 
                        label={option} 
                        {...getTagProps({ index })} 
                        icon={<PersonIcon />}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Konuşmacılar"
                      placeholder="Konuşmacı adı yazıp Enter'a basın"
                      helperText="Konuşmacıları tek tek ekleyebilirsiniz"
                    />
                  )}
                />
              </Grid>
              
              {/* Afiş Yükleme */}
              <Grid item xs={12}>
                <Box sx={{ border: '1px dashed grey', borderRadius: 1, p: 3, textAlign: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="poster-upload"
                    type="file"
                    onChange={handlePosterUpload}
                  />
                  <label htmlFor="poster-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                    >
                      Etkinlik Afişi Yükle
                    </Button>
                  </label>
                  
                  {formData.poster && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Seçilen Dosya: {formData.poster.name}
                      </Typography>
                      <img 
                        src={URL.createObjectURL(formData.poster)} 
                        alt="Afiş Önizleme" 
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              
              {/* Butonlar */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/clubs/${clubId}`)}
                  >
                    İptal
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={handlePreview}
                    disabled={isSubmitting}
                  >
                    Önizle
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Etkinliği Oluştur'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        {/* Önizleme Dialog */}
        <Dialog
          open={openPreviewDialog}
          onClose={handleClosePreview}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Etkinlik Önizleme</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {formData.title || 'Etkinlik Başlığı'}
              </Typography>
              
              {formData.poster && (
                <Box sx={{ my: 2, textAlign: 'center' }}>
                  <img 
                    src={URL.createObjectURL(formData.poster)} 
                    alt="Etkinlik Afişi" 
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </Box>
              )}
              
              <Box sx={{ my: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {formData.description || 'Etkinlik açıklaması henüz girilmedi.'}
                </Typography>
              </Box>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Tarih ve Saat
                      </Typography>
                      <Typography variant="body2">
                        {formData.startDate.toLocaleString('tr-TR')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PlaceIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Mekan
                      </Typography>
                      <Typography variant="body2">
                        {formData.location || 'Belirtilmedi'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <GroupIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Kontenjan
                      </Typography>
                      <Typography variant="body2">
                        {formData.capacity || 'Belirtilmedi'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FoodIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        İkram
                      </Typography>
                      <Typography variant="body2">
                        {formData.refreshments || 'Belirtilmedi'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              {formData.speakers.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Konuşmacılar
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.speakers.map((speaker, index) => (
                      <Chip 
                        key={index}
                        label={speaker}
                        color="primary"
                        variant="outlined"
                        icon={<PersonIcon />}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent; 