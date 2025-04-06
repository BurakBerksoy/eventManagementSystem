import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  Button,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormHelperText,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import {
  getAllClubs,
  getCategories,
  getClubsByCategory,
  searchClubs,
  joinClub
} from '../services/clubService';
import { userAPI, clubAPI } from '../services/api'; // Kullanıcı API'si
import axios from 'axios';

// Günün tarihini alan yardımcı fonksiyon
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Clubs = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(['Tümü']);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  
  // Kulüp ekleme diyaloğu için state'ler
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newClub, setNewClub] = useState({
    name: '',
    logo: null,
    description: '',
    maxMembers: 50,
    presidentId: '',
    foundingDate: getTodayDate()
  });
  const [clubErrors, setClubErrors] = useState({});
  const [previewLogo, setPreviewLogo] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  
  useEffect(() => {
    // Kullanıcı giriş yapmamış ise login sayfasına yönlendir
    if (!currentUser) {
      console.log('Kullanıcı oturumu bulunamadı, login sayfasına yönlendiriliyor');
      navigate('/login');
      return;
    }

    // Kullanıcı bilgilerini localStorage'a kaydet
    if (currentUser) {
      try {
        localStorage.setItem('userData', JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role
        }));
      } catch (e) {
        console.error('Kullanıcı bilgileri localStorage\'a kaydedilemedi:', e);
      }
    }
    
    const fetchCategories = async () => {
      try {
        console.log('Kategoriler getiriliyor...');
        const response = await getCategories();
        console.log('Kategoriler yüklendi:', response.data);
        
        // Veri kontrolü
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          // Tümü kategorisini default olarak içermeli
          setCategories(response.data);
          
          // İlk kategoriyi (Tümü) seçili olarak ayarla
          setSelectedCategory("Tümü");
        } else {
          // API yanıtı başarısız veya veri eksikse varsayılan kategorileri kullan
          const defaultCategories = ["Tümü", "Spor", "Kültür", "Sanat", "Bilim", "Teknoloji", "Diğer"];
          console.warn('API kategorileri döndürmedi, varsayılan kategoriler kullanılıyor');
          setCategories(defaultCategories);
          
          // İlk kategoriyi (Tümü) seçili olarak ayarla
          setSelectedCategory("Tümü");
        }
      } catch (error) {
        console.error('Kategoriler yüklenirken hata:', error);
        // Hata durumunda da varsayılan kategorileri kullan
        const defaultCategories = ["Tümü", "Spor", "Kültür", "Sanat", "Bilim", "Teknoloji", "Diğer"];
        setCategories(defaultCategories);
        setSelectedCategory("Tümü");
      }
    };
    
    const fetchUsers = async () => {
      try {
        console.log("Kullanıcılar getiriliyor...");
        const response = await userAPI.getAllUsers();
        if (response && Array.isArray(response.data)) {
          setUsers(response.data);
          console.log("Kullanıcılar yüklendi:", response.data.length);
        } else {
          console.log("Kullanıcı verisi bulunamadı veya boş");
          setUsers([]);
        }
      } catch (err) {
        console.error('Kullanıcılar yüklenirken hata:', err);
        // Bu hatayı görmezden geliyoruz çünkü yalnızca adminler kullanıcı listesini görebilir
        console.log('Bu hatayı görmezden geliyoruz çünkü yalnızca adminler kullanıcı listesini görebilir');
        setUsers([]);
      }
    };
    
    const fetchClubs = async () => {
      try {
        setLoading(true);
        console.log("Kulüpler getiriliyor...");
        const response = await getAllClubs();
        
        console.log("getAllClubs yanıtı:", response);
        
        if (response.success) {
          // API yanıtı doğru bir şekilde işlendi
          let clubsArray = [];
          
          if (Array.isArray(response.data)) {
            clubsArray = response.data;
            console.log("Kulüp dizisi doğrudan alındı:", clubsArray.length);
          } else {
            // Veri bir array değilse (bu durumda gelmemeli ama kontrol edelim)
            console.warn("Kulüp verisi bir dizi değil:", response.data);
            clubsArray = [];
          }
          
          console.log("İşlenen kulüpler:", clubsArray);
          console.log("Kulüpler yüklendi:", clubsArray.length);
          setClubs(clubsArray);
        } else {
          console.log("Kulüp verisi bulunamadı veya hata:", response);
          setClubs([]);
          setError("Kulüp verileri yüklenemedi. Backend bağlantısını kontrol edin.");
        }
      } catch (error) {
        console.error('Kulüpler yüklenirken hata:', error);
        setClubs([]);
        setError("Kulüp verileri yüklenirken bir hata oluştu. Backend bağlantısını kontrol edin.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
    fetchClubs();
    fetchUsers(); // Yetki kontrolü ile kullanıcıları çek
  }, [currentUser, navigate]);
  
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  // Feedback snackbar'ı kapat
  const handleCloseFeedback = () => {
    setFeedback({ ...feedback, open: false });
  };
  
  // Kulüp ekleme diyaloğunu aç
  const handleOpenAddDialog = () => {
    console.log("Mevcut kullanıcı:", currentUser);
    console.log("Kullanıcı rolü:", currentUser?.role);
    console.log("Admin kontrolü:", currentUser?.role === 'ADMIN');
    
    setOpenAddDialog(true);
  };
  
  // Kulüp ekleme diyaloğunu kapat
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewClub({
      name: '',
      logo: null,
      description: '',
      maxMembers: 50,
      presidentId: '',
      foundingDate: getTodayDate()
    });
    setClubErrors({});
    setPreviewLogo(null);
  };
  
  // Kulüp formunda değişiklik
  const handleNewClubChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'logo' && files && files[0]) {
      // Logo dosyası seçildi
      const file = files[0];
      setNewClub({
        ...newClub,
        logo: file
      });
      
      // Önizleme URL'si oluştur
      const previewUrl = URL.createObjectURL(file);
      setPreviewLogo(previewUrl);
      
      // Hata varsa temizle
      if (clubErrors.logo) {
        setClubErrors({
          ...clubErrors,
          logo: ''
        });
      }
    } else {
      // Diğer form alanları
      setNewClub({
        ...newClub,
        [name]: value
      });
      
      // Hata varsa temizle
      if (clubErrors[name]) {
        setClubErrors({
          ...clubErrors,
          [name]: ''
        });
      }
    }
  };
  
  // Kulüp formu doğrulama
  const validateClubForm = () => {
    const errors = {};
    
    if (!newClub.name.trim()) {
      errors.name = 'Kulüp adı gereklidir';
    }
    
    if (!newClub.description.trim()) {
      errors.description = 'Kulüp açıklaması gereklidir';
    }
    
    if (!newClub.maxMembers || newClub.maxMembers < 1) {
      errors.maxMembers = 'Geçerli bir maksimum üye sayısı girin';
    }
    
    if (!newClub.presidentId) {
      errors.presidentId = 'Kulüp başkanı seçmelisiniz';
    }
    
    if (!newClub.foundingDate) {
      errors.foundingDate = 'Kuruluş tarihi gereklidir';
    }
    
    setClubErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Kulüp ekleme formu gönderimi
  const handleSubmitClub = async () => {
    // Formun geçerliliğini kontrol et
    const isValid = validateClubForm();
    if (!isValid) return;

    // localStorage'daki kullanıcı yetkisini kontrol et
    try {
      const storedUserDataStr = localStorage.getItem('user');
      if (!storedUserDataStr) {
        console.log('LocalStorage user verisi bulunamadı, userData kontrolü yapılıyor...');
        const oldUserDataStr = localStorage.getItem('userData');
        if (!oldUserDataStr) {
          console.log('LocalStorage userData verisi de bulunamadı!');
          setFeedback({
            open: true,
            message: 'Oturum bilgisi bulunamadı. Lütfen giriş yapın.',
            severity: 'error'
          });
          
          // Kullanıcıyı login sayfasına yönlendir
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          
          return;
        }
        console.log('Eski userData verisi bulundu, user anahtarına kopyalanıyor');
        localStorage.setItem('user', oldUserDataStr);
      }
      
      const storedUserData = JSON.parse(storedUserDataStr || localStorage.getItem('userData'));
      if (!storedUserData || storedUserData.role !== 'ADMIN') {
        setFeedback({
          open: true,
          message: 'Kulüp eklemek için admin yetkisine sahip olmanız gerekiyor.',
          severity: 'error'
        });
        return;
      }
      console.log('LocalStorage yetki kontrolü başarılı:', storedUserData);
    } catch (e) {
      console.error('LocalStorage kullanıcı bilgisi çözümlenemedi:', e);
      setFeedback({
        open: true,
        message: 'Oturum bilgisi hatalı. Lütfen tekrar giriş yapın.',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Token kontrolü - düzeltme: 'token' yerine 'auth_token' kullanılmalı
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('Token bulunamadı! (auth_token kontrol edildi)');
        
        // Oturumu yenileme ihtiyacını kullanıcıya bildir
        setFeedback({
          open: true,
          message: 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.',
          severity: 'error'
        });
        
        // Kullanıcıyı login sayfasına yönlendir
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
        return;
      }
      
      console.log('Kulüp oluşturma işlemi başlatılıyor...');
      console.log('Token durumu:', token ? 'Token mevcut' : 'Token yok', 'Token uzunluğu:', token?.length || 0);
      console.log('Kullanıcı rolü:', currentUser?.role);

      // Axios header'larını güncelle
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header ayarlandı');

      // Değerleri string'e dönüştür
      const maxMembersValue = newClub.maxMembers ? Number(newClub.maxMembers) : null;
      console.log('maxMembers (number):', maxMembersValue, 'tip:', typeof maxMembersValue);

      // FormData oluştur
      const formData = new FormData();
      formData.append('name', newClub.name);
      formData.append('description', newClub.description);
      
      // maxMembers null değilse ve geçerli bir sayıysa ekle
      if (maxMembersValue !== null && !isNaN(maxMembersValue)) {
        formData.append('maxMembers', String(maxMembersValue));
      }
      
      formData.append('presidentId', String(newClub.presidentId));
      
      // foundingDate varsa ekle
      if (newClub.foundingDate) {
        formData.append('foundationDate', newClub.foundingDate);
      }
      
      // Kategori seçilmişse ekle
      if (newClub.category) {
        formData.append('category', newClub.category);
      }
      
      // Logo varsa ekle
      if (newClub.logo) {
        formData.append('logo', newClub.logo);
        console.log('Logo eklendi:', newClub.logo.name, newClub.logo.size, 'bytes', 'Dosya tipi:', newClub.logo.type);
      } else {
        console.log('Logo eklenmedi');
      }

      // FormData içeriğini kontrol et
      console.log('FormData içeriği:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'logo' ? `[Dosya: ${pair[1].name}, Tip: ${pair[1].type}]` : pair[1]));
      }

      // İstek öncesi log
      console.log('API çağrısı yapılıyor: POST /api/clubs');
      console.log('Backend URL:', 'http://localhost:8080');
      
      // clubService.js'den createClub fonksiyonunu dinamik import et
      const { createClub } = await import('../services/clubService');
      
      // createClub fonksiyonunu kullanarak API çağrısı yap
      const result = await createClub(formData);
      console.log('API yanıtı:', result);
      
      if (result.success) {
        console.log('Kulüp başarıyla oluşturuldu:', result.data);
        setFeedback({
          open: true,
          message: 'Kulüp başarıyla oluşturuldu!',
          severity: 'success'
        });
        
        // Kulüpler listesini güncelle
        const { getAllClubs } = await import('../services/clubService');
        const clubsResult = await getAllClubs();
        if (clubsResult.success && clubsResult.data) {
          setClubs(clubsResult.data);
        }
        
        // Formu sıfırla ve diyaloğu kapat
        handleCloseAddDialog();
      } else {
        // Hata durumu
        throw new Error(result.error || result.message || 'Kulüp oluşturulamadı');
      }
    } catch (error) {
      console.error('Kulüp oluşturulurken hata:', error);
      
      // Daha detaylı hata ayıklama
      if (error.response) {
        console.error('Hata detayları:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: JSON.stringify(error.response.data),
          headers: error.response.headers && typeof error.response.headers.toJSON === 'function' 
            ? JSON.stringify(error.response.headers.toJSON()) 
            : JSON.stringify(error.response.headers)
        });
        
        // Yetki hatası için özel mesaj
        if (error.response.status === 403) {
          // Request headers'ı kontrol et
          const reqHeaders = error.config?.headers;
          console.log('İstek başlıkları:', reqHeaders ? JSON.stringify(reqHeaders) : 'Başlık bilgisi yok');
          
          setFeedback({
            open: true,
            message: 'Yetkilendirme hatası: Bu işlem için yetkiniz yok. Spring Boot SecurityConfig yapılandırması kontrol edilmeli. (HTTP 403)',
            severity: 'error'
          });
          return;
        } else if (error.response.status === 400) {
          setFeedback({
            open: true,
            message: `Geçersiz veri: ${error.response.data?.message || 'Form verileri hatalı. Lütfen girişleri kontrol edin.'}`,
            severity: 'error'
          });
          return;
        }
      } else if (error.request) {
        console.error('Sunucudan yanıt alınamadı:', error.request);
        setFeedback({
          open: true,
          message: 'Sunucu ile iletişim kurulamadı. Lütfen internet bağlantınızı kontrol edin.',
          severity: 'error'
        });
        return;
      } else {
        console.error('İstek yapılandırılırken hata:', error.message);
      }
      
      let errorMessage = 'Kulüp oluşturulurken bir hata oluştu.';
      
      if (error.message) {
        errorMessage = `Hata: ${error.message}`;
      }
      
      setFeedback({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Kulüpler filtreleme işlemi - null/undefined kontrolü ekliyoruz
  const filteredClubs = useMemo(() => {
    if (!Array.isArray(clubs) || clubs.length === 0) {
      console.log("Filtreleme için kulüp verisi bulunamadı");
      return [];
    }
    
    // Filtreleme işlemi
    return clubs.filter(club => {
      // Kategori ve arama filtreleri
      const matchesCategory = selectedCategory === 'Tümü' || 
                             (club.category && club.category === selectedCategory);
      
      const searchText = searchQuery.toLowerCase();
      const matchesSearch = (club.name && club.name.toLowerCase().includes(searchText)) || 
                            (club.description && club.description.toLowerCase().includes(searchText));
      
      return matchesCategory && matchesSearch;
    });
  }, [clubs, selectedCategory, searchQuery]);

  // Debug için filtrelenen kulüpleri logla
  useEffect(() => {
    console.log("Filtrelenmiş kulüpler:", filteredClubs.length);
  }, [filteredClubs]);

  return (
    <>
      <Container maxWidth="lg" sx={{ minHeight: 'calc(100vh - 200px)', py: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h4" component="h1" sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '40%',
              height: 4,
              bgcolor: 'secondary.main',
              borderRadius: 2
            }
          }}>
            Kulüpler
          </Typography>
          
          {currentUser && currentUser.role === 'ADMIN' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: 3,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 5
                }
              }}
            >
              Kulüp Ekle
            </Button>
          )}
        </Box>
        
        {/* Arama ve Filtreleme */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Kulüp Ara"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.2)',
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl variant="outlined" className="category-filter">
                <InputLabel id="category-select-label">Kategori</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={selectedCategory || ''} // Eğer selectedCategory null/undefined ise boş string kullan
                  onChange={handleCategoryChange}
                  label="Kategori"
                  displayEmpty={categories.length === 0}
                >
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">
                      <em>Kategori yok</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                Kulüpler Yükleniyor...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%', py: 2 }}>{error}</Alert>
          ) : filteredClubs.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', width: '100%', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary">Kulüp bulunmamaktadır.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchQuery ? 'Arama kriterlerinize uygun kulüp bulunamadı.' : 'Henüz hiç kulüp oluşturulmamış.'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={4}>
              {filteredClubs.map((club) => (
                <Grid item xs={12} sm={6} md={4} key={club.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: 3,
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/clubs/${club.id}`)}
                  >
                    <Box 
                      sx={{ 
                        height: 220, 
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {club.logo ? (
                        <Box 
                          component="img"
                          src={club.logo}
                          alt={club.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #64B5F6 0%, #1976D2 100%)',
                            color: 'white'
                          }}
                        >
                          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            {club.name.substring(0, 2).toUpperCase()}
                          </Typography>
                        </Box>
                      )}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                          padding: '30px 16px 16px',
                          transition: 'opacity 0.3s',
                          opacity: 0.9,
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                          }}
                        >
                          {club.name}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {club.description ? (
                          club.description.length > 120 
                            ? `${club.description.substring(0, 120)}...` 
                            : club.description
                        ) : 'Açıklama bulunmamaktadır.'}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mt: 'auto',
                        pt: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Typography variant="body2" sx={{ 
                          bgcolor: 'primary.light', 
                          color: 'white', 
                          px: 1.5, 
                          py: 0.5, 
                          borderRadius: 5,
                          fontSize: '0.75rem'
                        }}>
                          {club.maxMembers || 0} Üye Limiti
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="primary"
                          sx={{ 
                            borderRadius: 5,
                            minWidth: 'auto'
                          }}
                        >
                          Detaylar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Kulüp Ekleme Dialog'u */}
        <Dialog 
          open={openAddDialog} 
          onClose={handleCloseAddDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 10
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">Yeni Kulüp Ekle</Typography>
            <IconButton onClick={handleCloseAddDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Kulüp Adı"
                  name="name"
                  value={newClub.name}
                  onChange={handleNewClubChange}
                  error={!!clubErrors.name}
                  helperText={clubErrors.name}
                  required
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Kulüp Açıklaması"
                  name="description"
                  value={newClub.description}
                  onChange={handleNewClubChange}
                  multiline
                  rows={4}
                  error={!!clubErrors.description}
                  helperText={clubErrors.description}
                  required
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Maksimum Üye Sayısı"
                  name="maxMembers"
                  type="number"
                  value={newClub.maxMembers}
                  onChange={handleNewClubChange}
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!clubErrors.maxMembers}
                  helperText={clubErrors.maxMembers}
                  required
                />
                
                <FormControl 
                  fullWidth 
                  error={!!clubErrors.presidentId}
                  sx={{ mt: 2 }}
                >
                  <InputLabel id="president-select-label">Kulüp Başkanı</InputLabel>
                  <Select
                    labelId="president-select-label"
                    id="president-select"
                    name="presidentId"
                    value={newClub.presidentId}
                    onChange={handleNewClubChange}
                    label="Kulüp Başkanı"
                  >
                    {users.length > 0 ? (
                      users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        <em>Kullanıcı bulunamadı</em>
                      </MenuItem>
                    )}
                  </Select>
                  {clubErrors.presidentId && (
                    <FormHelperText>{clubErrors.presidentId}</FormHelperText>
                  )}
                </FormControl>
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Kuruluş Tarihi"
                  name="foundingDate"
                  type="date"
                  value={newClub.foundingDate}
                  onChange={handleNewClubChange}
                  error={!!clubErrors.foundingDate}
                  helperText={clubErrors.foundingDate}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Kulüp Logosu
                  </Typography>
                  
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      border: '1px dashed grey',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mb: 2,
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {previewLogo ? (
                      <Box component="img" src={previewLogo} alt="Logo Önizleme" sx={{ maxWidth: '100%', maxHeight: '100%' }} />
                    ) : (
                      <ImageIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                    )}
                  </Box>
                  
                  <Button
                    variant="outlined"
                    component="label"
                  >
                    Logo Seç
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      hidden
                      onChange={handleNewClubChange}
                    />
                  </Button>
                  
                  {clubErrors.logo && (
                    <FormHelperText error>{clubErrors.logo}</FormHelperText>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddDialog}>İptal</Button>
            <Button 
              onClick={handleSubmitClub} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kulüp Oluştur'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar */}
        <Snackbar
          open={feedback.open}
          autoHideDuration={6000}
          onClose={handleCloseFeedback}
          message={feedback.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseFeedback} 
            severity={feedback.severity} 
            sx={{ width: '100%' }}
          >
            {feedback.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Clubs; 