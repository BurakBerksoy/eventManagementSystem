import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Place as PlaceIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Restaurant as RestaurantIcon,
  Mic as MicIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { clubAPI } from '../../../services/api';
import trLocale from 'date-fns/locale/tr';

const EventsTab = ({ clubId, events, pastEvents, isManager }) => {
  const [eventTab, setEventTab] = useState(0);
  const navigate = useNavigate();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    ideaOwner: '',
    capacity: '',
    eventHour: '',
    date: null,
    refreshments: '',
    location: '',
    speakers: '',
    poster: null
  });
  const [errors, setErrors] = useState({});

  // Kulüp üyelerini getir
  useEffect(() => {
    if (isManager && openCreateDialog) {
      const fetchClubMembers = async () => {
        try {
          setLoading(true);
          // API entegrasyonu: Gerçek veri için clubAPI.getClubMembers(clubId) kullanılacak
          // Şimdilik demo veriler kullanıyoruz
          const demoMembers = [
            { id: '1', name: 'Ahmet Yılmaz', role: 'MEMBER' },
            { id: '2', name: 'Ayşe Kaya', role: 'MEMBER' },
            { id: '3', name: 'Mehmet Demir', role: 'MEMBER' },
            { id: '4', name: 'Zeynep Çelik', role: 'MEMBER' }
          ];
          setClubMembers(demoMembers);
          setLoading(false);
        } catch (err) {
          console.error('Kulüp üyeleri yüklenirken hata:', err);
          setError('Kulüp üyeleri yüklenemedi');
          setLoading(false);
        }
      };

      fetchClubMembers();
    }
  }, [isManager, clubId, openCreateDialog]);

  const handleEventTabChange = (event, newValue) => {
    setEventTab(newValue);
  };

  // Etkinlik oluşturma modalını aç
  const handleCreateEventClick = () => {
    setOpenCreateDialog(true);
  };

  // Etkinlik oluşturma modalını kapat
  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setEventData({
      title: '',
      description: '',
      ideaOwner: '',
      capacity: '',
      eventHour: '',
      date: null,
      refreshments: '',
      location: '',
      speakers: '',
      poster: null
    });
    setErrors({});
    setError('');
    setSuccessMessage('');
  };

  // Form verilerini güncelle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value
    });
    
    // Hata durumunu temizle
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Tarih seçiciyi güncelle
  const handleDateChange = (newValue) => {
    setEventData({
      ...eventData,
      date: newValue
    });
    
    // Hata durumunu temizle
    if (errors.date) {
      setErrors({
        ...errors,
        date: ''
      });
    }
  };

  // Dosya yükleme işlemi
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setEventData({
        ...eventData,
        poster: e.target.files[0]
      });
      
      // Hata durumunu temizle
      if (errors.poster) {
        setErrors({
          ...errors,
          poster: ''
        });
      }
    }
  };

  // Form doğrulama işlemi
  const validateForm = () => {
    const newErrors = {};
    
    if (!eventData.title.trim()) newErrors.title = 'Etkinlik adı zorunludur';
    if (!eventData.description.trim()) newErrors.description = 'Etkinlik açıklaması zorunludur';
    if (!eventData.ideaOwner) newErrors.ideaOwner = 'Fikir sahibi seçilmelidir';
    if (!eventData.capacity) newErrors.capacity = 'Kontenjan belirtilmelidir';
    if (!eventData.eventHour) newErrors.eventHour = 'Etkinlik saati seçilmelidir';
    if (!eventData.date) newErrors.date = 'Tarih seçilmelidir';
    if (!eventData.location.trim()) newErrors.location = 'Mekan bilgisi zorunludur';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Etkinlik oluşturma işlemi
  const handleCreateEvent = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Form verilerini API'ye gönderilecek formata dönüştür
      const eventPayload = {
        title: eventData.title,
        description: eventData.description,
        ideaOwner: eventData.ideaOwner,
        capacity: parseInt(eventData.capacity),
        eventHour: eventData.eventHour,
        date: eventData.date ? eventData.date.toISOString() : '',
        refreshments: eventData.refreshments || '',
        location: eventData.location,
        speakers: eventData.speakers || ''
      };
      
      console.log('Etkinlik oluşturma isteği gönderiliyor:', clubId, eventPayload);
      
      try {
        // API çağrısı yapılmadan önce, varsayılan API URL'sini kontrol edelim
        console.log('API çağrısı için URL:', `clubs/${clubId}/events`);
        
        // Redirect yapabilmek için navigate kullanacağız
        const redirectUrl = `/clubs/${clubId}/events/create`;
        console.log('Oluşturma formuna yönlendiriliyor:', redirectUrl);
        
        // İlgili sayfaya yönlendir
        navigate(redirectUrl, { 
          state: { 
            eventData: eventPayload 
          }
        });
        
        return;
        
        // Bu kısım devre dışı bırakıldı - CreateEvent sayfası kullanılacak
        /*
        // Gerçek API çağrısını yap
        const response = await clubAPI.createEvent(clubId, eventPayload);
        console.log('Etkinlik oluşturma yanıtı:', response);
        
        setLoading(false);
        setSuccessMessage('Etkinlik başarıyla oluşturuldu! Sayfa yenilendiğinde etkinlikler listesinde görünecektir.');
        
        // 2 saniye sonra modalı kapat
        setTimeout(() => {
          handleCloseCreateDialog();
          // Sayfa yenilenerek etkinlikler tekrar yüklenir
          window.location.reload();
        }, 2000);
        */
      } catch (apiError) {
        console.error('API çağrısında hata:', apiError);
        console.error('Hata detayları:', apiError.response?.data);
        console.error('Hata durumu:', apiError.response?.status);
        setError(`Etkinlik oluşturulamadı (${apiError.response?.status || 'Hata'}): ${apiError.response?.data?.message || apiError.message || 'Bilinmeyen hata'}`);
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Etkinlik oluşturulurken genel hata:', err);
      setError('Etkinlik oluşturulamadı. Lütfen tekrar deneyin: ' + (err.message || 'Bilinmeyen hata'));
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={eventTab} 
          onChange={handleEventTabChange}
          variant="fullWidth"
        >
          <Tab label="Yaklaşan Etkinlikler" />
          <Tab label="Geçmiş Etkinlikler" />
        </Tabs>
      </Box>

      {eventTab === 0 && (
        <>
          {events && events.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {events.map((event) => (
                <Card key={event.id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Box
                          component="img"
                          sx={{
                            height: 140,
                            width: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                          alt={event.title}
                          src={event.imageUrl || 'https://via.placeholder.com/300x200?text=Etkinlik+Görseli'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" gutterBottom>
                            {event.title}
                          </Typography>
                          <Chip 
                            label={event.status === 'ACTIVE' ? 'Aktif' : 'Taslak'} 
                            color={event.status === 'ACTIVE' ? 'success' : 'default'} 
                            size="small" 
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {event.description && event.description.length > 150 
                            ? `${event.description.slice(0, 150)}...` 
                            : event.description}
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {new Date(event.startDate).toLocaleDateString('tr-TR')}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TimeIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {new Date(event.startDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PlaceIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {event.location || 'Belirtilmemiş'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        {isManager && (
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/events/${event.id}/edit`);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Yaklaşan etkinlik bulunmamaktadır
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bu kulübün şu anda planlanmış etkinliği yok.
              </Typography>
            </Box>
          )}
        </>
      )}

      {eventTab === 1 && (
        <>
          {pastEvents && pastEvents.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {pastEvents.map((event) => (
                <Card key={event.id} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => navigate(`/events/${event.id}`)}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Box
                          component="img"
                          sx={{
                            height: 140,
                            width: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                            filter: 'grayscale(40%)',
                          }}
                          alt={event.title}
                          src={event.imageUrl || 'https://via.placeholder.com/300x200?text=Etkinlik+Görseli'}
                        />
                      </Grid>
                      <Grid item xs={12} sm={9}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" gutterBottom>
                            {event.title}
                          </Typography>
                          <Chip 
                            label="Tamamlandı" 
                            color="default" 
                            size="small" 
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {event.description && event.description.length > 150 
                            ? `${event.description.slice(0, 150)}...` 
                            : event.description}
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {new Date(event.startDate).toLocaleDateString('tr-TR')}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TimeIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {new Date(event.startDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PlaceIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {event.location || 'Belirtilmemiş'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Geçmiş etkinlik bulunmamaktadır
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bu kulübün geçmiş etkinliği yok.
              </Typography>
            </Box>
          )}
        </>
      )}

      {isManager && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateEventClick}
            fullWidth
            size="large"
            sx={{ borderRadius: 2, py: 1.5 }}
          >
            Etkinlik Oluştur
          </Button>
        </Box>
      )}

      {/* Etkinlik Oluşturma Modal */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EventIcon sx={{ mr: 1 }} />
            Yeni Etkinlik Oluştur
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            {/* Etkinlik Adı */}
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Etkinlik Adı"
                fullWidth
                value={eventData.title}
                onChange={handleInputChange}
                error={!!errors.title}
                helperText={errors.title}
                required
                disabled={loading}
              />
            </Grid>
            
            {/* Etkinlik Açıklaması */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Etkinlik Açıklaması"
                fullWidth
                multiline
                rows={4}
                value={eventData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                required
                disabled={loading}
              />
            </Grid>
            
            {/* Etkinlik Fikir Sahibi */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.ideaOwner} required disabled={loading}>
                <InputLabel>Etkinlik Fikir Sahibi</InputLabel>
                <Select
                  name="ideaOwner"
                  value={eventData.ideaOwner}
                  onChange={handleInputChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  }
                >
                  {clubMembers.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.ideaOwner && <FormHelperText>{errors.ideaOwner}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Etkinlik Kontenjanı */}
            <Grid item xs={12} md={6}>
              <TextField
                name="capacity"
                label="Etkinlik Kontenjanı"
                type="number"
                fullWidth
                value={eventData.capacity}
                onChange={handleInputChange}
                error={!!errors.capacity}
                helperText={errors.capacity}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Etkinlik Saati */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.eventHour} required disabled={loading}>
                <InputLabel>Etkinlik Saati</InputLabel>
                <Select
                  name="eventHour"
                  value={eventData.eventHour}
                  onChange={handleInputChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <TimeIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="1">Etkinlik 1 (09:00 - 11:00)</MenuItem>
                  <MenuItem value="2">Etkinlik 2 (11:00 - 13:00)</MenuItem>
                  <MenuItem value="3">Etkinlik 3 (13:00 - 15:00)</MenuItem>
                  <MenuItem value="4">Etkinlik 4 (15:00 - 17:00)</MenuItem>
                  <MenuItem value="5">Etkinlik 5 (17:00 - 19:00)</MenuItem>
                </Select>
                {errors.eventHour && <FormHelperText>{errors.eventHour}</FormHelperText>}
              </FormControl>
            </Grid>
            
            {/* Etkinlik Tarihi */}
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={trLocale}>
                <DateTimePicker
                  label="Tarih"
                  value={eventData.date}
                  onChange={handleDateChange}
                  disabled={loading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.date,
                      helperText: errors.date,
                      disabled: loading
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* İkram */}
            <Grid item xs={12} md={6}>
              <TextField
                name="refreshments"
                label="İkram (opsiyonel)"
                fullWidth
                value={eventData.refreshments}
                onChange={handleInputChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RestaurantIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Mekan */}
            <Grid item xs={12} md={6}>
              <TextField
                name="location"
                label="Mekan"
                fullWidth
                value={eventData.location}
                onChange={handleInputChange}
                error={!!errors.location}
                helperText={errors.location}
                required
                disabled={loading}
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
              <TextField
                name="speakers"
                label="Konuşmacılar (opsiyonel)"
                fullWidth
                value={eventData.speakers}
                onChange={handleInputChange}
                disabled={loading}
                helperText="Birden fazla konuşmacı varsa virgülle ayırın"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MicIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            {/* Etkinlik Afişi */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  border: '1px dashed grey', 
                  p: 2, 
                  borderRadius: 1,
                  textAlign: 'center',
                  bgcolor: '#f9f9f9',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#f0f0f0'
                  }
                }}
                component="label"
              >
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <UploadIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Etkinlik Afişi Yükle
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {eventData.poster ? `Seçilen dosya: ${eventData.poster.name}` : 'Dosya seçmek için tıklayın veya sürükleyip bırakın'}
                  </Typography>
                </Box>
              </Box>
              {errors.poster && (
                <FormHelperText error>{errors.poster}</FormHelperText>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseCreateDialog} 
            disabled={loading}
          >
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateEvent}
            disabled={loading || !!successMessage}
            startIcon={loading ? <CircularProgress size={20} /> : <EventIcon />}
          >
            {loading ? 'Oluşturuluyor...' : 'Etkinliği Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsTab; 