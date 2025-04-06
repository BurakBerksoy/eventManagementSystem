import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { membershipAPI } from '../../../services/api';

const RequestsTab = ({ clubId, membershipRequests = [], isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(membershipRequests);

  // Arama işlemi
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filtrelenmiş istekler
  const filteredRequests = requests.filter(request =>
    request.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Üyelik isteğini onayla
  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      await membershipAPI.approveRequest(requestId);
      
      // İsteği listeden kaldır
      setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      
      toast.success('Üyelik isteği onaylandı');
    } catch (error) {
      console.error('Üyelik isteği onaylanırken hata oluştu:', error);
      toast.error('İstek onaylanırken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Üyelik isteğini reddet
  const handleRejectRequest = async (requestId) => {
    try {
      setLoading(true);
      await membershipAPI.rejectRequest(requestId);
      
      // İsteği listeden kaldır
      setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      
      toast.success('Üyelik isteği reddedildi');
    } catch (error) {
      console.error('Üyelik isteği reddedilirken hata oluştu:', error);
      toast.error('İstek reddedilirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info">
          Bu sayfayı görüntülemek için yetkiniz bulunmamaktadır.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Bekleyen Üyelik İstekleri
      </Typography>
      
      {/* Arama */}
      <TextField
        placeholder="İsim ile ara..."
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        size="small"
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {/* İstekler listesi */}
      <Paper variant="outlined" sx={{ mb: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <PersonAddIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? 'Arama kriterlerine uygun istek bulunamadı.' : 'Bekleyen üyelik isteği bulunmuyor.'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {filteredRequests.map(request => (
              <ListItem
                key={request.id}
                divider
                sx={{ 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  py: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar src={request.userProfileImage || null}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1">
                        {request.userName || 'İsimsiz Kullanıcı'}
                      </Typography>
                      <Chip
                        label={request.userDepartment || 'Bölüm Belirtilmemiş'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {request.message || 'Mesaj yok'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Talep tarihi: {new Date(request.requestDate).toLocaleString('tr-TR')}
                      </Typography>
                    </>
                  }
                  sx={{ mb: { xs: 2, sm: 0 } }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  ml: { xs: 0, sm: 2 },
                  width: { xs: '100%', sm: 'auto' } 
                }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckIcon />}
                    onClick={() => handleApproveRequest(request.id)}
                    disabled={loading}
                    fullWidth={window.innerWidth < 600}
                  >
                    Onayla
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={loading}
                    fullWidth={window.innerWidth < 600}
                  >
                    Reddet
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      
      {/* Bilgilendirme kartı */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Üyelik Talepleri Hakkında
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Kulüp yöneticisi olarak, üyelik taleplerini onaylayabilir veya reddedebilirsiniz. Onaylanan üyeler kulüp etkinliklerine katılabilir ve kulüp içeriğine erişebilir.
        </Typography>
        <Typography variant="body2">
          Not: Kullanıcı bilgileri, kullanıcının profilinden alınmaktadır. Eksik bilgiler olabilir.
        </Typography>
      </Box>
    </Box>
  );
};

export default RequestsTab; 