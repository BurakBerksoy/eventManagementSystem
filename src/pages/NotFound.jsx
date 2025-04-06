import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  const location = useLocation();
  const path = location.pathname;
  
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 2,
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'error.main' }} />
        
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" color="error.main">
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          Sayfa Bulunamadı
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 2 }}>
          Aradığınız sayfa ({path}) mevcut değil veya taşınmış olabilir. 
          Lütfen URL'yi kontrol edin veya ana sayfaya geri dönün.
        </Typography>
        
        <Box sx={{ width: '100%', maxWidth: 500, mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'left' }}>
            Bu hata, genellikle şu sebeplerden kaynaklanmaktadır:
          </Typography>
          <Box component="ul" sx={{ textAlign: 'left', pl: 3 }}>
            <li>Yanlış yazılmış bir URL</li>
            <li>Silinmiş veya taşınmış bir sayfa</li>
            <li>API bağlantı sorunu</li>
            <li>Yetersiz kullanıcı izinleri</li>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            component={RouterLink}
            to="/"
            size="large"
          >
            Ana Sayfaya Dön
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => window.history.back()}
          >
            Geri Git
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 