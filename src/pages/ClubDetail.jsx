import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CardHeader,
  Badge
} from '@mui/material';
import {
  Info as InfoIcon,
  Event as EventIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  AccessTime as TimeIcon,
  Place as PlaceIcon,
  Update as UpdateIcon,
  History as HistoryIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitToAppIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  AccountBalance as AccountBalanceIcon,
  BusinessCenter as BusinessCenterIcon,
  Handshake as HandshakeIcon,
  MoreVert as MoreVertIcon,
  Assessment as AssessmentIcon,
  ImageSearch as ImageSearchIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { clubAPI, userAPI, membershipAPI } from '../services/api';
import ClubMembershipButton from '../components/club/ClubMembershipButton';
import { InfoTab, EventsTab, MembersTab, RequestsTab } from '../components/club/detail';
import { toast, Toaster } from 'react-hot-toast';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [club, setClub] = useState(null);
  const [president, setPresident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [eventTab, setEventTab] = useState(0); // 0: Yapılacak, 1: Yapılmış
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [pastEvents, setPastEvents] = useState([]);
  const [members, setMembers] = useState([]); // Kulüp üyeleri
  const [membershipStatus, setMembershipStatus] = useState({ 
    isMember: false, 
    isPending: false, 
    role: null 
  });
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [updatedClub, setUpdatedClub] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Kulüp bilgilerini getir
        let clubResponse = null;
        try {
          const clubData = await clubAPI.getClubById(id);
          setClub(clubData);
          clubResponse = { data: clubData };
        } catch (err) {
          console.error('Kulüp bilgileri alınamadı:', err);
                // Hata durumunda kullanıcıya göstermek için demo veri
          const demoClub = {
            id: id,
            name: 'Demo Kulüp',
            logoUrl: 'https://via.placeholder.com/150',
            shortDescription: 'Kulüp bilgileri yüklenirken bir hata oluştu.',
            category: 'Genel'
          };
          setClub(demoClub);
          clubResponse = { data: demoClub };
        }
        
        // Kulüp üyelik durumunu ve rolleri kontrol et
        if (currentUser) {
          try {
            // Token'dan kullanıcı rolünü kontrol et
            const token = localStorage.getItem('token');
            if (token) {
              try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                setIsAdmin(tokenPayload.role === 'ADMIN');
              } catch (error) {
                console.error('Token decode edilemedi:', error);
              }
            }
            
            // Kullanıcının bu kulüpteki rolünü kontrol et
            // API'den alınacak - şimdilik demo
            const demoMembershipStatus = Math.random() > 0.7 ? {
              isMember: true,
              isPending: false,
              role: 'MEMBER'
            } : Math.random() > 0.5 ? {
              isMember: false,
              isPending: true,
              role: null
            } : {
              isMember: false,
              isPending: false,
              role: null
            };
            
            setMembershipStatus(demoMembershipStatus);
            
            // Kullanıcı kulüp yöneticisi mi kontrol et
            // Başkan veya yönetici ise true
            const userClubRole = demoMembershipStatus.role;
            setIsManager(userClubRole === 'PRESIDENT' || userClubRole === 'MANAGER' || isAdmin);
            
          } catch (err) {
            console.error('Kullanıcı rolü alınamadı:', err);
          }
        }
        
        // Etkinlikleri getir - demo için
        try {
          const demoEvents = [
            {
              id: '1',
              title: 'Demo Etkinlik 1',
              description: 'Bu bir demo etkinliktir. Gerçek veriler API bağlantısı sağlandığında gösterilecektir.',
              startDate: new Date(Date.now() + 86400000).toISOString(), // Yarın
              endDate: new Date(Date.now() + 90000000).toISOString(),
              location: 'A-304',
              status: 'ACTIVE',
              imageUrl: 'https://via.placeholder.com/300x200?text=Etkinlik+1'
            },
            {
              id: '2',
              title: 'Demo Etkinlik 2',
              description: 'Bu bir demo etkinliktir. Gerçek veriler API bağlantısı sağlandığında gösterilecektir.',
              startDate: new Date(Date.now() + 172800000).toISOString(), // 2 gün sonra
              location: 'Konferans Salonu',
              status: 'ACTIVE'
            }
          ];
          
          const demoPastEvents = [
            {
              id: '3',
              title: 'Geçmiş Demo Etkinlik',
              description: 'Bu geçmiş bir demo etkinliktir.',
              startDate: new Date(Date.now() - 86400000).toISOString(), // Dün
              location: 'B-Blok Amfi',
              imageUrl: 'https://via.placeholder.com/300x200?text=Etkinlik+Geçmiş'
            }
          ];
          
          setEvents(demoEvents);
          setPastEvents(demoPastEvents);
        } catch (err) {
          console.error('Kulüp üyeleri alınamadı:', err);
        }

        // Kullanıcının üyelik durumunu kontrol et
        if (currentUser) {
          try {
            const membershipResponse = await membershipAPI.checkMembership(id);
            
            // Üyelik yanıtını ve içindeki veriyi güvenli şekilde kontrol et
            if (membershipResponse && membershipResponse.success && membershipResponse.data) {
              // membershipResponse.data doğru formatta geldi mi kontrol et
              const memberData = membershipResponse.data;
              
              // Kullanıcı durum verilerini güvenli şekilde ayarla
              setMembershipStatus({
                isMember: memberData.isMember === true, 
                isPending: memberData.isPending === true,
                role: memberData.role || null
              });
              
              // Eğer kullanıcı başkan veya yönetici ise, bekleyen üyelik isteklerini getir
              if (memberData.isMember === true && 
                  (memberData.role === 'PRESIDENT' || memberData.role === 'MANAGER')) {
                await fetchMembershipRequests();
              }
            } else {
              console.log('Üyelik durumu başarıyla kontrol edilemedi. Varsayılan değerler kullanılıyor.');
              // Varsayılan değer ayarla
              setMembershipStatus({
                isMember: false,
                isPending: false,
                role: null
              });
            }
          } catch (error) {
            console.error('Üyelik durumu kontrol edilirken hata oluştu:', error);
            // Hata durumunda da varsayılan değerleri ayarla
            setMembershipStatus({
              isMember: false,
              isPending: false,
              role: null
            });
          }
        } else {
          // Kullanıcı giriş yapmamışsa varsayılan değerleri ayarla
          console.log('Kullanıcı giriş yapmamış, varsayılan üyelik durumu ayarlanıyor');
          setMembershipStatus({
            isMember: false,
            isPending: false,
            role: null
          });
        }

        // Kulüp verilerini düzenleme formu için de saklayalım
        if (clubResponse && clubResponse.data) {
          setUpdatedClub({
            name: clubResponse.data.name || '',
            description: clubResponse.data.description || '',
            maxMembers: clubResponse.data.maxMembers || 50,
            logo: null,
            category: clubResponse.data.category || '',
            presidentId: clubResponse.data.presidentId || '',
            contactEmail: clubResponse.data.contactEmail || '',
            contactPhone: clubResponse.data.contactPhone || '',
          });
        }
        
        setLoading(false);
      } catch (err) {
          console.error('Veri yükleme sırasında bir hata oluştu:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };
    
    fetchClub();
  }, [id, currentUser, isAdmin]);

  // Bekleyen üyelik isteklerini getir
  const fetchMembershipRequests = async () => {
    if (!currentUser || !id) return;
    
    setLoadingRequests(true);
    try {
      const response = await membershipAPI.getPendingRequests(id);
      if (response && response.data) {
        setMembershipRequests(response.data);
      }
    } catch (error) {
      console.error('Üyelik istekleri alınırken hata oluştu:', error);
      toast.error('Üyelik istekleri alınırken bir sorun oluştu');
    } finally {
      setLoadingRequests(false);
    }
  };
  
  // Üyelik isteğini onayla
  const handleApproveRequest = async (requestId) => {
    try {
      await membershipAPI.approveRequest(requestId);
      toast.success('Üyelik isteği onaylandı');
      
      // İstekleri yeniden yükle
      await fetchMembershipRequests();
    } catch (error) {
      console.error('Üyelik isteği onaylanırken hata oluştu:', error);
      toast.error('İstek onaylanırken bir sorun oluştu');
    }
  };
  
  // Üyelik isteğini reddet
  const handleRejectRequest = async (requestId) => {
    try {
      await membershipAPI.rejectRequest(requestId);
      toast.success('Üyelik isteği reddedildi');
      
      // İstekleri yeniden yükle
      await fetchMembershipRequests();
    } catch (error) {
      console.error('Üyelik isteği reddedilirken hata oluştu:', error);
      toast.error('İstek reddedilirken bir sorun oluştu');
    }
  };

  // Tab değişimi
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Üyelik durumu değişikliğini işle
  const handleMembershipChange = (newStatus) => {
    setMembershipStatus(newStatus);
    
    // Üyelik durumu değiştiğinde bildirim göster
    let message = '';
    let severity = 'info';
    
    if (newStatus.isMember && !membershipStatus.isMember) {
      message = 'Kulübe başarıyla katıldınız!';
      severity = 'success';
      
      // Üye listesini güncelle
      setMembers(prevMembers => {
        const userData = {
          id: currentUser?.id || 'temp-id',
          name: currentUser?.name || currentUser?.email || 'Yeni Üye',
          role: 'Üye',
          joinDate: new Date().toISOString().split('T')[0],
          department: currentUser?.department || 'Belirtilmemiş'
        };
        
        // Kullanıcı zaten listede mi kontrol et
        if (!prevMembers.find(m => m.id === userData.id)) {
          return [...prevMembers, userData];
        }
        return prevMembers;
      });
    } else if (newStatus.isPending && !membershipStatus.isPending) {
      message = 'Üyelik talebiniz başarıyla gönderildi. Onay bekleniyor.';
      severity = 'info';
    } else if (!newStatus.isMember && membershipStatus.isMember) {
      message = 'Kulüp üyeliğinden ayrıldınız.';
      severity = 'info';
      
      // Üye listesinden çıkar
      setMembers(prevMembers => {
        return prevMembers.filter(member => member.id !== currentUser?.id);
      });
    }
    
    setSnackbar({
      open: true,
      message,
      severity
    });

    // Eğer kullanıcı başkan veya yönetici ise, bekleyen üyelik isteklerini getir
    if (newStatus.isMember && 
        (newStatus.role === 'PRESIDENT' || newStatus.role === 'MANAGER')) {
      fetchMembershipRequests();
    }
  };

  // Snackbar kapat
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <>
        <Toaster position="top-right" />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 2 }}>
            <CircularProgress />
            <Typography variant="h6" color="text.secondary">
              Kulüp bilgileri yükleniyor...
            </Typography>
          </Box>
        </Container>
      </>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <>
        <Toaster position="top-right" />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clubs')}
          >
            Kulüpler Sayfasına Dön
          </Button>
        </Container>
      </>
    );
  }

  // Kulüp bulunamadı
  if (!club) {
    return (
      <>
        <Toaster position="top-right" />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Kulüp bulunamadı veya erişim izniniz yok.
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clubs')}
          >
            Kulüpler Sayfasına Dön
          </Button>
        </Container>
      </>
    );
  }

  // Bekleyen üyelik istekleri bölümü
  const renderMembershipRequests = () => {
    if (!membershipStatus.isMember || 
        (membershipStatus.role !== 'PRESIDENT' && membershipStatus.role !== 'MANAGER')) {
      return null;
    }
    
    return (
      <Card sx={{ mt: 4 }}>
        <CardHeader 
          title="Bekleyen Üyelik İstekleri" 
          avatar={<Badge badgeContent={membershipRequests.length} color="primary"><PersonAddIcon /></Badge>}
        />
        <Divider />
        <CardContent>
          {loadingRequests ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : membershipRequests.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Bekleyen üyelik isteği bulunmuyor
            </Typography>
          ) : (
            <List>
              {membershipRequests.map(request => (
                <ListItem key={request.id} divider>
                  <ListItemAvatar>
                    <Avatar src={request.userProfileImage}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={request.userName}
                    secondary={
                      <>
                        <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                          {request.message || 'Mesaj yok'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(request.requestDate).toLocaleString('tr-TR')}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      onClick={() => handleApproveRequest(request.id)}
                    >
                      Onayla
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Reddet
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Toaster position="top-right" />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Kulüp başlık kartı */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2, 
            boxShadow: 3,
            background: 'linear-gradient(to right, #f5f7fa, #e8ecf1)'
          }}
          elevation={3}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={3} md={2}>
              <Avatar
                src={club.logoUrl}
                alt={club.name}
                sx={{
                  width: { xs: 100, sm: 120, md: 150 },
                  height: { xs: 100, sm: 120, md: 150 },
                  mx: 'auto',
                  border: '4px solid #f0f0f0',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={9} md={10}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                flexWrap: 'wrap',
                mb: 1
              }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {club.name}
                </Typography>
                
                {currentUser && (
                  <Box sx={{ minWidth: 150 }}>
                    <ClubMembershipButton
                      clubId={id}
                      clubName={club.name}
                      membershipStatus={membershipStatus}
                      onMembershipChange={handleMembershipChange}
                    />
                  </Box>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label={`${members.length} Üye`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
                <Chip
                  label={`${events.length} Yaklaşan Etkinlik`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
                {club.category && (
                  <Chip
                    label={club.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 'medium' }}
                  />
                )}
              </Box>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 2,
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}
              >
                {club.shortDescription || club.description?.slice(0, 200) + '...' || 'Bu kulüp henüz bir açıklama eklememiş.'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Sekmeli içerik paneli */}
        <Paper sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab}
              onChange={handleTabChange}
              aria-label="club-tabs"
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab 
                icon={<InfoIcon />} 
                label="Bilgiler" 
                id="tab-0" 
                aria-controls="tabpanel-0" 
              />
              <Tab 
                icon={<EventIcon />} 
                label="Etkinlikler" 
                id="tab-1" 
                aria-controls="tabpanel-1" 
              />
              <Tab 
                icon={<PersonIcon />} 
                label="Üyeler" 
                id="tab-2" 
                aria-controls="tabpanel-2" 
              />
              {isManager && (
                <Tab 
                  icon={<PersonAddIcon />} 
                  label="İstekler" 
                  id="tab-3" 
                  aria-controls="tabpanel-3" 
                />
              )}
            </Tabs>
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 0} 
            id="tabpanel-0" 
            aria-labelledby="tab-0"
          >
            {activeTab === 0 && (
              <InfoTab 
                club={club} 
                isManager={isManager} 
              />
            )}
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 1} 
            id="tabpanel-1" 
            aria-labelledby="tab-1"
          >
            {activeTab === 1 && (
              <EventsTab 
                clubId={id} 
                events={events} 
                pastEvents={pastEvents} 
                isManager={isManager} 
              />
            )}
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 2} 
            id="tabpanel-2" 
            aria-labelledby="tab-2"
          >
            {activeTab === 2 && (
              <MembersTab 
                clubId={id} 
                members={members} 
                isAdmin={isAdmin || isManager} 
              />
            )}
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={activeTab !== 3} 
            id="tabpanel-3" 
            aria-labelledby="tab-3"
          >
            {activeTab === 3 && isManager && (
              <RequestsTab 
                clubId={id} 
                membershipRequests={membershipRequests} 
                isAdmin={isAdmin || isManager} 
              />
            )}
          </Box>
        </Paper>
        
        {/* Kullanıcı bildirimleri */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%', boxShadow: 4, borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default ClubDetail;