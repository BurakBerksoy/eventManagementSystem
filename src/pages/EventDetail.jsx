import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Tab,
  Tabs,
  Grid
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  VerifiedUser as VerifiedUserIcon,
  QrCode as QrCodeIcon,
  Error as ErrorIcon,
  Check as CheckIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Event as EventIcon,
  Restaurant as RestaurantIcon,
  Poll as PollIcon,
  Room as RoomIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { 
  getEventById, 
  joinEvent, 
  leaveEvent, 
  getEventSpeakers,
  getEventProgram,
  getCatering,
  getVenueReservations,
  getSurveys,
  addToWaitingList,
  removeFromWaitingList,
  getEventWaitingList
} from '../services/eventService';
import { formatDate, formatDateOnly, formatTimeOnly } from '../utils/dateUtils';

// TabPanel bileşeni
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [openWaitingListDialog, setOpenWaitingListDialog] = useState(false);
  const [joining, setJoining] = useState(false);
  const [speakers, setSpeakers] = useState([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState(false);
  const [waitingList, setWaitingList] = useState([]);
  const [loadingWaitingList, setLoadingWaitingList] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const data = await getEventById(id);
        setEvent(data);
      } catch (error) {
        setError(error.message || 'Etkinlik yüklenirken bir hata oluştu');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [id]);
  
  useEffect(() => {
    const fetchEventSpeakers = async () => {
      if (event) {
        try {
          setLoadingSpeakers(true);
          const data = await getEventSpeakers(id);
          setSpeakers(data);
        } catch (error) {
          console.error('Konuşmacılar yüklenirken hata oluştu:', error);
        } finally {
          setLoadingSpeakers(false);
        }
      }
    };
    
    fetchEventSpeakers();
  }, [id, event]);
  
  useEffect(() => {
    const fetchWaitingList = async () => {
      if (event) {
        try {
          setLoadingWaitingList(true);
          const data = await getEventWaitingList(id);
          setWaitingList(data);
        } catch (error) {
          console.error('Bekleme listesi yüklenirken hata oluştu:', error);
        } finally {
          setLoadingWaitingList(false);
        }
      }
    };
    
    fetchWaitingList();
  }, [id, event]);
  
  // Katılım oranı hesaplaması
  const getParticipationRate = (participants, capacity) => {
    return capacity > 0 ? (participants / capacity) * 100 : 0;
  };
  
  // Tab değişikliği
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Etkinliğe katılma işlemi
  const handleJoinEvent = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      setJoining(true);
      
      await joinEvent(id, currentUser.id);
      
      // Etkinliği yeniden yükle
      const updatedEvent = await getEventById(id);
      setEvent(updatedEvent);
      
      setOpenJoinDialog(false);
      setOpenWaitingListDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Etkinliğe başarıyla kaydoldunuz!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Etkinliğe katılırken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setJoining(false);
    }
  };
  
  // Etkinlikten ayrılma işlemi
  const handleLeaveEvent = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      setJoining(true);
      
      await leaveEvent(id, currentUser.id);
      
      // Etkinliği yeniden yükle
      const updatedEvent = await getEventById(id);
      setEvent(updatedEvent);
      
      setSnackbar({
        open: true,
        message: 'Etkinlikten ayrıldınız',
        severity: 'info'
      });
    } finally {
      setJoining(false);
    }
  };
  
  // Bekleme listesine ekleme
  const handleJoinWaitingList = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      setJoining(true);
      
      await addToWaitingList(id, currentUser.id);
      
      // Bekleme listesini güncelle
      const updatedWaitingList = await getEventWaitingList(id);
      setWaitingList(updatedWaitingList);
      
      setOpenWaitingListDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Bekleme listesine başarıyla eklendiz!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Bekleme listesine eklenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setJoining(false);
    }
  };
  
  // Snackbar'ı kapatma
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error || !event) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Etkinlik bulunamadı'}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/events')}>
            Etkinlikler Sayfasına Dön
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      {/* Başlık ve Durum Bilgisi */}
      <Grid container spacing={2} sx={{ mt: 3, mb: 4 }}>
        <Grid xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label={event.category}
              color="primary"
              variant={event.status === 'completed' ? 'outlined' : 'filled'}
            />
            {event.status === 'completed' ? (
              <Chip
                label="Tamamlandı"
                color="default"
                variant="outlined"
              />
            ) : (
              <Chip
                label="Yaklaşan Etkinlik"
                color="success"
                variant="outlined"
              />
            )}
            {event.hasCertificate && (
              <Chip
                label="Sertifikalı"
                color="secondary"
                icon={<VerifiedUserIcon />}
              />
            )}
          </Box>
        </Grid>
        <Grid xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center' }}>
          {event.status !== 'completed' && currentUser && (
            event.participants.includes(currentUser.id) ? (
              <Button 
                variant="outlined" 
                color="success" 
                size="large"
                startIcon={<CheckIcon />}
                onClick={handleLeaveEvent}
              >
                Katıldınız (İptal Et)
              </Button>
            ) : event.registeredParticipants < event.capacity ? (
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<PersonIcon />}
                onClick={() => setOpenJoinDialog(true)}
              >
                Etkinliğe Katıl
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                color="warning" 
                size="large"
                startIcon={<GroupIcon />}
                onClick={() => setOpenWaitingListDialog(true)}
              >
                Bekleme Listesine Katıl
              </Button>
            )
          )}
          {!currentUser && event.status !== 'completed' && (
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/login')}
            >
              Katılmak için Giriş Yap
            </Button>
          )}
        </Grid>
      </Grid>
      
      <Grid container spacing={4}>
        {/* Sol Bölüm - Etkinlik Detayları */}
        <Grid xs={12} md={8}>
          {/* Etkinlik Resmi */}
          <Paper sx={{ overflow: 'hidden', mb: 4 }}>
            <CardMedia
              component="img"
              height="400"
              image={event.imageUrl || 'https://source.unsplash.com/random?event'}
              alt={event.title}
            />
          </Paper>
          
          {/* Tabs */}
          <Paper sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="event tabs">
                <Tab label="Açıklama" icon={<InfoIcon />} iconPosition="start" />
                <Tab label="Konuşmacılar" icon={<RecordVoiceOverIcon />} iconPosition="start" />
                <Tab label="Program" icon={<EventIcon />} iconPosition="start" />
                <Tab label="Mekan" icon={<RoomIcon />} iconPosition="start" />
                <Tab label="İkram" icon={<RestaurantIcon />} iconPosition="start" />
                <Tab label="Anket" icon={<PollIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {/* Açıklama Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>
            </TabPanel>
            
            {/* Konuşmacılar Tab */}
            <TabPanel value={tabValue} index={1}>
              {loadingSpeakers ? (
                <CircularProgress />
              ) : speakers && speakers.length > 0 ? (
                <Grid container spacing={3}>
                  {speakers.map((speaker) => (
                    <Grid xs={12} sm={6} md={4} key={speaker.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Avatar
                              src={speaker.photoUrl}
                              alt={speaker.name}
                              sx={{ width: 80, height: 80, mb: 1 }}
                            />
                            <Typography variant="h6" align="center">
                              {speaker.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" align="center">
                              {speaker.title}
                            </Typography>
                          </Box>
                          <Typography variant="body2">
                            {speaker.bio}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1">
                  Bu etkinlik için henüz konuşmacı bilgisi girilmemiş.
                </Typography>
              )}
            </TabPanel>
            
            {/* Diğer tab içerikleri burada olacak */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="body1">Program bilgileri burada görüntülenecek.</Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Typography variant="body1">Mekan bilgileri burada görüntülenecek.</Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <Typography variant="body1">İkram bilgileri burada görüntülenecek.</Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={5}>
              <Typography variant="body1">Anket bilgileri burada görüntülenecek.</Typography>
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Sağ Bölüm - Yan Bilgiler */}
        <Grid xs={12} md={4}>
          {/* Etkinlik Detayları */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Etkinlik Bilgileri
            </Typography>
            <List sx={{ width: '100%' }}>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Tarih"
                  secondary={formatDateOnly(event.startDate)}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Saat"
                  secondary={`${formatTimeOnly(event.startDate)} - ${formatTimeOnly(event.endDate)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Konum"
                  secondary={event.location}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Katılımcı Sayısı"
                  secondary={`${event.registeredParticipants}/${event.capacity}`}
                />
              </ListItem>
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Doluluk Oranı:
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getParticipationRate(event.registeredParticipants, event.capacity)}
                color={event.registeredParticipants >= event.capacity ? "error" : "primary"}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Paper>
          
          {/* Organizatör Bilgileri */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Organizatör
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2 }}>
                {event.clubName?.charAt(0) || 'C'}
              </Avatar>
              <Box>
                <Typography variant="body1">
                  {event.clubName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.organizerInfo}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(`/clubs/${event.clubId}`)}
            >
              Organizatör İletişim Bilgileri
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetail;