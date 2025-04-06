import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Button, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  ListItemSecondaryAction, 
  Chip, 
  Divider, 
  TextField, 
  IconButton,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Badge,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Event as EventIcon,
  Group as GroupIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  CalendarMonth as CalendarMonthIcon,
  Upload as UploadIcon,
  Star as StarIcon,
  CameraAlt as CameraAltIcon,
  PhotoLibrary as PhotoLibraryIcon,
  ArrowForward as ArrowForwardIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { getEventsByParticipant } from '../services/eventService';
import { getUserClubs } from '../services/clubService';
import { useNavigate } from 'react-router-dom';

// Animasyon varyasyonları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5, 
      when: "beforeChildren",
      staggerChildren: 0.1
    } 
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      duration: 0.5,
      type: "spring",
      stiffness: 100
    }
  }
};

const listItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      type: "spring",
      stiffness: 100
    }
  }
};

// Tab panel için yardımcı bileşen
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <motion.div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </motion.div>
  );
}

// Özel stil bileşenleri
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(18),
  height: theme.spacing(18),
  marginBottom: theme.spacing(2),
  boxShadow: '0 10px 30px rgba(55, 81, 255, 0.2)',
  border: '4px solid white',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 15px 35px rgba(55, 81, 255, 0.3)',
  }
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 5px 20px rgba(55, 81, 255, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    boxShadow: '0 8px 25px rgba(55, 81, 255, 0.15)',
  }
}));

const TabButton = styled(Tab)(({ theme }) => ({
  fontWeight: 600,
  textTransform: 'none',
  minHeight: 48,
  borderRadius: '8px',
  marginRight: theme.spacing(1),
  '&.Mui-selected': {
    color: '#3751FF',
    fontWeight: 700,
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '2px',
    backgroundColor: '#3751FF',
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: 'flex-start'
  }
}));

const EventCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(55, 81, 255, 0.08)',
  height: '100%',
  cursor: 'pointer',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(55, 81, 255, 0.12)',
  },
  display: 'flex',
  flexDirection: 'column',
}));

const ClubBadge = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: '8px',
  '& .MuiChip-icon': {
    marginLeft: '8px',
  },
}));

const AnimatedListItem = motion.create(ListItem);

const StatCard = styled(Box)(({ theme }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 5px 15px rgba(55, 81, 255, 0.08)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(55, 81, 255, 0.12)',
  }
}));

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [userEvents, setUserEvents] = useState([]);
  const [userClubs, setUserClubs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/static/images/avatar/1.jpg');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    phoneNumber: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        phoneNumber: currentUser.phoneNumber || ''
      });

      if (currentUser.avatarUrl) {
        setAvatarUrl(currentUser.avatarUrl);
      }

      const fetchData = async () => {
        try {
          const events = await getEventsByParticipant(currentUser.id);
          setUserEvents(events || []);
          
          const clubs = await getUserClubs(currentUser.id);
          if (clubs && clubs.success && clubs.data) {
            const clubsData = Array.isArray(clubs.data) ? clubs.data : 
                           (clubs.data.data && Array.isArray(clubs.data.data)) ? clubs.data.data : [];
            console.log("Kullanıcı kulüpleri yüklendi:", clubsData);
            setUserClubs(clubsData);
          } else {
            console.warn("Kulüp verisi alınamadı veya boş:", clubs);
            setUserClubs([]);
          }
        } catch (error) {
          console.error('Veri yüklenirken hata oluştu:', error);
          setUserEvents([]);
          setUserClubs([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setProfileData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      bio: currentUser.bio || '',
      phoneNumber: currentUser.phoneNumber || ''
    });
    setEditMode(false);
    setErrorMessage('');
    setAvatarFile(null);
    setAvatarPreview('');
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (!profileData.name || !profileData.email) {
        setErrorMessage('Ad ve e-posta alanları zorunludur.');
        return;
      }

      setLoadingProfile(true);

      if (updateUserProfile) {
        const updatedData = { ...profileData };
        
        if (avatarFile) {
          updatedData.avatarFile = avatarFile;
          
          if (avatarPreview) {
            setAvatarUrl(avatarPreview);
          }
        }
        
        await updateUserProfile(updatedData);
        setEditMode(false);
        setSuccessMessage('Profil bilgileriniz başarıyla güncellendi!');
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        if (avatarPreview) {
          setAvatarUrl(avatarPreview);
        }
        
        setEditMode(false);
        setSuccessMessage('Profil bilgileriniz başarıyla güncellendi! (Demo modu)');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrorMessage('Profil güncellenirken bir hata oluştu: ' + error.message);
    } finally {
      setLoadingProfile(false);
      setAvatarFile(null);
      setAvatarPreview('');
    }
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4">Erişim Engellendi</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Bu sayfayı görüntülemek için giriş yapmanız gerekmektedir.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box 
          sx={{ 
            mt: 4, 
            mb: 6,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'space-between' 
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              color: '#253858',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#3751FF'
              }
            }}
          >
            Profil Sayfam
          </Typography>

          {!editMode ? (
            <Button 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="contained" 
              startIcon={<EditIcon />} 
              onClick={handleEdit}
              sx={{ 
                mt: { xs: 2, sm: 0 },
                backgroundColor: '#3751FF',
                '&:hover': {
                  backgroundColor: '#2A3FC9'
                },
                borderRadius: '10px',
                px: 3,
                py: 1
              }}
            >
              Düzenle
            </Button>
          ) : null}
        </Box>

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(55, 81, 255, 0.15)'
              }}
            >
              {successMessage}
            </Alert>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(255, 76, 76, 0.15)'
              }}
            >
              {errorMessage}
            </Alert>
          </motion.div>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress sx={{ color: '#3751FF' }} />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Sol Taraf - Profil Kartı */}
            <Grid item xs={12} md={4}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <ProfileCard elevation={0}>
                  <Box sx={{ 
                    position: 'relative', 
                    textAlign: 'center',
                    pb: 2
                  }}>
                    {/* Arka plan dekoratif element */}
                    <Box 
                      sx={{ 
                        height: 100, 
                        width: '100%', 
                        background: 'linear-gradient(135deg, #3751FF 0%, #5B70FF 100%)',
                        borderRadius: '12px 12px 0 0',
                        position: 'absolute',
                        top: -24,
                        left: 0,
                        zIndex: 0,
                        boxShadow: 'inset 0 -10px 20px rgba(255, 255, 255, 0.1)'
                      }} 
                    />
                    
                    {/* Avatar */}
                    <Box sx={{ 
                      position: 'relative',
                      zIndex: 1,
                      pt: 6
                    }}>
                      {editMode ? (
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                          <StyledAvatar 
                            src={avatarPreview || avatarUrl} 
                            alt={profileData.name} 
                          />
                          <Tooltip title="Profil fotoğrafı yükle">
                            <IconButton 
                              component="label"
                              sx={{
                                position: 'absolute',
                                bottom: 15,
                                right: 5,
                                backgroundColor: '#3751FF',
                                color: 'white',
                                boxShadow: '0 3px 10px rgba(55, 81, 255, 0.3)',
                                '&:hover': {
                                  backgroundColor: '#2A3FC9'
                                }
                              }}
                            >
                              <CameraAltIcon />
                              <input 
                                type="file" 
                                hidden 
                                accept="image/*" 
                                onChange={handleAvatarChange}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <StyledAvatar 
                          src={avatarUrl} 
                          alt={profileData.name} 
                        />
                      )}
                      
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          mt: 2,
                          fontWeight: 700,
                          color: '#253858'
                        }}
                      >
                        {profileData.name}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                        {profileData.email}
                      </Typography>
                    </Box>
                    
                    {/* İstatistikler */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <StatCard>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              color: '#3751FF', 
                              fontWeight: 700 
                            }}
                          >
                            {userEvents.length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            Etkinlik
                          </Typography>
                        </StatCard>
                      </Grid>
                      <Grid item xs={6}>
                        <StatCard>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              color: '#3751FF', 
                              fontWeight: 700 
                            }}
                          >
                            {userClubs.length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6B7280' }}>
                            Kulüp
                          </Typography>
                        </StatCard>
                      </Grid>
                    </Grid>
                    
                    {/* Bio kısmı */}
                    {!editMode && (
                      <Box sx={{ 
                        backgroundColor: 'rgba(55, 81, 255, 0.04)',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'left',
                        mb: 3
                      }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#253858',
                            mb: 1
                          }}
                        >
                          Hakkımda
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {profileData.bio || 'Henüz bir biyografi eklenmemiş.'}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Bio kısmı düzenleme */}
                    {editMode && (
                      <Box sx={{ 
                        backgroundColor: 'rgba(55, 81, 255, 0.04)',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'left',
                        mb: 3
                      }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#253858',
                            mb: 1
                          }}
                        >
                          Hakkımda
                        </Typography>
                        <TextField
                          fullWidth
                          name="bio"
                          value={profileData.bio}
                          onChange={handleInputChange}
                          multiline
                          rows={4}
                          variant="outlined"
                          placeholder="Kendiniz hakkında kısa bir bilgi ekleyin"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                              '&.Mui-focused fieldset': {
                                borderColor: '#3751FF',
                              },
                            },
                          }}
                        />
                      </Box>
                    )}
                    
                    {/* Düzenleme modundaki butonlar */}
                    {editMode && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button 
                          component={motion.button}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          variant="contained" 
                          color="primary" 
                          startIcon={loadingProfile ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
                          sx={{ 
                            mr: 1,
                            backgroundColor: '#3751FF',
                            '&:hover': {
                              backgroundColor: '#2A3FC9'
                            },
                            borderRadius: '10px',
                            px: 3
                          }}
                          onClick={handleSave}
                          disabled={loadingProfile}
                        >
                          {loadingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                        <Button 
                          component={motion.button}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          variant="outlined" 
                          color="error" 
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                          sx={{ 
                            borderRadius: '10px',
                            px: 3
                          }}
                        >
                          İptal
                        </Button>
                      </Box>
                    )}
                  </Box>
                </ProfileCard>
              </motion.div>
            </Grid>
            
            {/* Sağ Taraf - Tab ve İçerikler */}
            <Grid item xs={12} md={8}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <ProfileCard elevation={0}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <StyledTabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        variant="standard"
                      >
                        <TabButton 
                          label="Profil Bilgileri" 
                          icon={<AccountCircleIcon />} 
                          iconPosition="start"
                        />
                        <TabButton 
                          label="Etkinliklerim" 
                          icon={<EventIcon />} 
                          iconPosition="start"
                        />
                        <TabButton 
                          label="Kulüplerim" 
                          icon={<GroupIcon />} 
                          iconPosition="start"
                        />
                      </StyledTabs>
                    </Box>
                    
                    <TabPanel value={activeTab} index={0}>
                      {editMode ? (
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Ad Soyad"
                              name="name"
                              value={profileData.name}
                              onChange={handleInputChange}
                              required
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <AccountCircleIcon sx={{ mr: 1, color: '#3751FF' }} />
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#3751FF',
                                  },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#3751FF',
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="E-posta"
                              name="email"
                              value={profileData.email}
                              onChange={handleInputChange}
                              required
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <EmailIcon sx={{ mr: 1, color: '#3751FF' }} />
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#3751FF',
                                  },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#3751FF',
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Telefon Numarası"
                              name="phoneNumber"
                              value={profileData.phoneNumber}
                              onChange={handleInputChange}
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <PhoneIcon sx={{ mr: 1, color: '#3751FF' }} />
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#3751FF',
                                  },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                  color: '#3751FF',
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Paper 
                                elevation={0} 
                                sx={{ 
                                  p: 3, 
                                  borderRadius: 2,
                                  backgroundColor: 'white',
                                  boxShadow: '0 4px 15px rgba(55, 81, 255, 0.05)',
                                  border: '1px solid rgba(55, 81, 255, 0.1)'
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    mb: 3, 
                                    fontWeight: 600,
                                    color: '#253858',
                                    borderBottom: '1px solid rgba(55, 81, 255, 0.1)',
                                    pb: 1
                                  }}
                                >
                                  Kişisel Bilgiler
                                </Typography>
                                
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 3 }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 600, 
                                          mb: 1,
                                          color: '#6B7280',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <AccountCircleIcon sx={{ mr: 1, fontSize: 18, color: '#3751FF' }} />
                                        Ad Soyad
                                      </Typography>
                                      <Typography 
                                        variant="body1" 
                                        sx={{ 
                                          color: '#253858', 
                                          fontWeight: 500 
                                        }}
                                      >
                                        {profileData.name || 'Belirtilmemiş'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 3 }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 600, 
                                          mb: 1,
                                          color: '#6B7280',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <EmailIcon sx={{ mr: 1, fontSize: 18, color: '#3751FF' }} />
                                        E-posta
                                      </Typography>
                                      <Typography 
                                        variant="body1" 
                                        sx={{ 
                                          color: '#253858', 
                                          fontWeight: 500 
                                        }}
                                      >
                                        {profileData.email || 'Belirtilmemiş'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  
                                  <Grid item xs={12} sm={6}>
                                    <Box sx={{ mb: 3 }}>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 600, 
                                          mb: 1,
                                          color: '#6B7280',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <PhoneIcon sx={{ mr: 1, fontSize: 18, color: '#3751FF' }} />
                                        Telefon Numarası
                                      </Typography>
                                      <Typography 
                                        variant="body1" 
                                        sx={{ 
                                          color: '#253858', 
                                          fontWeight: 500 
                                        }}
                                      >
                                        {profileData.phoneNumber || 'Belirtilmemiş'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>
                          </Grid>
                        </motion.div>
                      )}
                    </TabPanel>
                    
                    <TabPanel value={activeTab} index={1}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#253858',
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <EventIcon sx={{ mr: 1, color: '#3751FF' }} />
                          Katıldığım Etkinlikler
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        
                        {userEvents.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Box 
                              sx={{ 
                                textAlign: 'center', 
                                p: 4, 
                                backgroundColor: 'rgba(55, 81, 255, 0.04)',
                                borderRadius: 2
                              }}
                            >
                              <CalendarMonthIcon sx={{ fontSize: 48, color: '#3751FF', opacity: 0.5, mb: 2 }} />
                              <Typography variant="h6" sx={{ color: '#253858', mb: 1 }}>
                                Henüz bir etkinliğe katılmadınız
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                                Etkinlikler sayfasından etkinlikleri inceleyebilir ve katılabilirsiniz
                              </Typography>
                              <Button
                                component={motion.button}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                variant="contained"
                                sx={{ 
                                  backgroundColor: '#3751FF',
                                  '&:hover': {
                                    backgroundColor: '#2A3FC9'
                                  },
                                  borderRadius: '10px'
                                }}
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate('/events')}
                              >
                                Etkinlikleri Keşfet
                              </Button>
                            </Box>
                          </motion.div>
                        ) : (
                          <Grid container spacing={3}>
                            {userEvents.map((event, index) => (
                              <Grid item xs={12} sm={6} key={event.id || index}>
                                <motion.div
                                  variants={listItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ y: -5 }}
                                >
                                  <EventCard onClick={() => navigate(`/events/${event.id}`)}>
                                    <CardMedia
                                      component="img"
                                      height="140"
                                      image={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1170&q=80"}
                                      alt={event.title}
                                    />
                                    <CardContent>
                                      <Typography 
                                        variant="h6" 
                                        sx={{ 
                                          fontWeight: 600,
                                          color: '#253858',
                                          mb: 1
                                        }}
                                      >
                                        {event.title}
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <CalendarMonthIcon sx={{ fontSize: 16, color: '#3751FF', mr: 1 }} />
                                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                          {new Date(event.date).toLocaleDateString('tr-TR')}
                                        </Typography>
                                      </Box>
                                      
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <LocationOnIcon sx={{ fontSize: 16, color: '#3751FF', mr: 1 }} />
                                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                          {event.location || 'Konum belirtilmemiş'}
                                        </Typography>
                                      </Box>
                                      
                                      <Chip 
                                        label={
                                          new Date(event.date) > new Date() 
                                            ? 'Gelecek Etkinlik' 
                                            : 'Geçmiş Etkinlik'
                                        }
                                        size="small"
                                        sx={{ 
                                          mt: 1,
                                          backgroundColor: new Date(event.date) > new Date() 
                                            ? 'rgba(55, 81, 255, 0.1)' 
                                            : 'rgba(107, 114, 128, 0.1)',
                                          color: new Date(event.date) > new Date() 
                                            ? '#3751FF' 
                                            : '#6B7280',
                                          fontWeight: 600
                                        }}
                                      />
                                    </CardContent>
                                  </EventCard>
                                </motion.div>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </Box>
                    </TabPanel>
                    
                    <TabPanel value={activeTab} index={2}>
                      <Box sx={{ mb: 3 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            color: '#253858',
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <GroupIcon sx={{ mr: 1, color: '#3751FF' }} />
                          Üye Olduğum Kulüpler
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        
                        {userClubs.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Box 
                              sx={{ 
                                textAlign: 'center', 
                                p: 4, 
                                backgroundColor: 'rgba(55, 81, 255, 0.04)',
                                borderRadius: 2
                              }}
                            >
                              <GroupIcon sx={{ fontSize: 48, color: '#3751FF', opacity: 0.5, mb: 2 }} />
                              <Typography variant="h6" sx={{ color: '#253858', mb: 1 }}>
                                Henüz bir kulübe üye değilsiniz
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                                Kulüpler sayfasından kulüpleri inceleyebilir ve üye olabilirsiniz
                              </Typography>
                              <Button
                                component={motion.button}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                variant="contained"
                                sx={{ 
                                  backgroundColor: '#3751FF',
                                  '&:hover': {
                                    backgroundColor: '#2A3FC9'
                                  },
                                  borderRadius: '10px'
                                }}
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate('/clubs')}
                              >
                                Kulüpleri Keşfet
                              </Button>
                            </Box>
                          </motion.div>
                        ) : (
                          <Box>
                            <List>
                              {Array.isArray(userClubs) && userClubs.map((club, index) => (
                                <motion.div
                                  key={club.id || index}
                                  variants={listItemVariants}
                                  initial="hidden"
                                  animate="visible"
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Paper 
                                    elevation={0} 
                                    sx={{ 
                                      mb: 2, 
                                      overflow: 'hidden',
                                      borderRadius: 2,
                                      border: '1px solid rgba(55, 81, 255, 0.1)',
                                      '&:hover': {
                                        boxShadow: '0 4px 20px rgba(55, 81, 255, 0.1)',
                                      },
                                      transition: 'box-shadow 0.3s ease',
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/clubs/${club.id}`)}
                                  >
                                    <ListItem 
                                      alignItems="flex-start"
                                      sx={{ px: 3, py: 2 }}
                                    >
                                      <ListItemAvatar sx={{ mr: 2 }}>
                                        <Avatar 
                                          src={club.logo} 
                                          alt={club.name}
                                          sx={{ 
                                            width: 56, 
                                            height: 56,
                                            boxShadow: '0 4px 10px rgba(55, 81, 255, 0.15)',
                                            border: '2px solid white'
                                          }}
                                        >
                                          {club.name ? club.name.charAt(0) : <GroupIcon />}
                                        </Avatar>
                                      </ListItemAvatar>
                                      
                                      <ListItemText
                                        primary={
                                          <Typography 
                                            variant="h6" 
                                            sx={{ 
                                              fontWeight: 600,
                                              color: '#253858'
                                            }}
                                          >
                                            {club.name}
                                          </Typography>
                                        }
                                        secondary={
                                          <>
                                            <Typography 
                                              variant="body2" 
                                              sx={{ 
                                                color: '#6B7280',
                                                mb: 1
                                              }}
                                            >
                                              {club.description || 'Açıklama bulunmuyor'}
                                            </Typography>
                                            
                                            <Box sx={{ mt: 1 }}>
                                              <ClubBadge
                                                label={club.memberCount || 'N/A'} 
                                                size="small"
                                                icon={<GroupIcon fontSize="small" />}
                                                sx={{ 
                                                  mr: 1,
                                                  backgroundColor: 'rgba(55, 81, 255, 0.1)',
                                                  color: '#3751FF',
                                                }}
                                              />
                                              
                                              <ClubBadge
                                                label={club.category || 'Kategori belirtilmemiş'} 
                                                size="small"
                                                sx={{ 
                                                  backgroundColor: 'rgba(55, 81, 255, 0.05)',
                                                  color: '#3751FF',
                                                }}
                                              />
                                            </Box>
                                          </>
                                        }
                                      />
                                      
                                      <ListItemSecondaryAction>
                                        <IconButton 
                                          edge="end" 
                                          color="primary"
                                          sx={{ 
                                            mr: 0
                                          }}
                                        >
                                          <ArrowForwardIcon sx={{ color: '#3751FF' }} />
                                        </IconButton>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  </Paper>
                                </motion.div>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </TabPanel>
                  </Box>
                </ProfileCard>
              </motion.div>
            </Grid>
          </Grid>
        )}
      </motion.div>
    </Container>
  );
};

export default Profile; 