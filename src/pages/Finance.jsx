import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { clubAPI, userAPI } from '../services/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { FinanceTab, BudgetTab } from '../components/finances';

const Finance = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State değişkenleri
  const [club, setClub] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Veri yükleme fonksiyonu
  useEffect(() => {
    const fetchClubAndUserRole = async () => {
      try {
        setLoading(true);
        
        // Kulüp bilgilerini getir
        const clubData = await clubAPI.getClubById(clubId);
        setClub(clubData);
        
        // Kullanıcı rolünü kontrol et
        if (currentUser) {
          // Kullanıcının admin olup olmadığını kontrol et
          const userRoles = await userAPI.getUserRoles(currentUser.id);
          const isAdmin = userRoles.includes('admin');
          
          if (isAdmin) {
            setUserRole('admin');
          } else {
            // Kulüp üyeliğini kontrol et
            const membership = clubData.members.find(
              member => member.userId === currentUser.id
            );
            
            if (membership) {
              setUserRole(membership.role);
            }
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Kulüp bilgileri yüklenirken hata oluştu:', err);
        setError('Kulüp bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClubAndUserRole();
  }, [clubId, currentUser]);
  
  // Yetki kontrolü
  useEffect(() => {
    // Yükleme tamamlandıktan sonra yetki kontrolü yap
    if (!loading && !error) {
      const authorizedRoles = ['Başkan', 'Muhasebeci', 'Yönetici', 'admin'];
      
      if (!userRole || !authorizedRoles.includes(userRole)) {
        setError('Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır.');
      }
    }
  }, [loading, error, userRole]);
  
  // Tab değişimi
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Snackbar gösterme fonksiyonu (alt bileşenlere geçmek için)
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
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
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Kulüp bulunamadı.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/clubs')}>
          Kulüp Listesine Dön
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {club.name} - Finans Yönetimi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kulüp finansal durumunu takip edin, para işlemlerini yönetin ve bütçe planlaması yapın.
        </Typography>
      </Box>
      
      <Paper sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                py: 2
              }
            }}
          >
            <Tab 
              icon={<AccountBalanceIcon />} 
              label="Finansal İşlemler" 
              id="tab-0" 
              aria-controls="tabpanel-0" 
            />
            <Tab 
              icon={<EventNoteIcon />} 
              label="Bütçe Yönetimi" 
              id="tab-1" 
              aria-controls="tabpanel-1" 
            />
          </Tabs>
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {activeTab === 0 && <FinanceTab clubId={clubId} userRole={userRole} showSnackbar={showSnackbar} />}
        </Box>
        
        <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          {activeTab === 1 && <BudgetTab clubId={clubId} userRole={userRole} showSnackbar={showSnackbar} />}
        </Box>
      </Paper>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Finance; 