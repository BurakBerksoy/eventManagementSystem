import React from 'react';
import { Box, Container, Typography, Grid, IconButton, TextField, Button, Divider, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faTwitter, faLinkedin, faDiscord } from '@fortawesome/free-brands-svg-icons';

// Özel stil bileşenleri
const BlueText = styled(Typography)(({ theme }) => ({
  color: '#3751FF',
  fontWeight: 700,
}));

const BlueButton = styled(Button)(({ theme }) => ({
  background: '#3751FF',
  color: 'white',
  fontWeight: 600,
  padding: '10px 20px',
  borderRadius: '8px',
  textTransform: 'none',
  boxShadow: '0 4px 10px rgba(55, 81, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#2A3FC9',
    boxShadow: '0 6px 15px rgba(55, 81, 255, 0.3)',
    transform: 'translateY(-2px)'
  }
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    background: '#F7F8FC',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    '&:hover': {
      borderColor: 'rgba(55, 81, 255, 0.3)',
    },
    '&.Mui-focused': {
      borderColor: '#3751FF',
      boxShadow: '0 0 0 2px rgba(55, 81, 255, 0.2)',
    },
  },
  '& .MuiInputBase-input': {
    padding: '12px 15px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
});

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: '#3751FF',
  background: 'rgba(55, 81, 255, 0.05)',
  margin: '0 8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#3751FF',
    color: '#FFFFFF',
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 15px rgba(55, 81, 255, 0.2)',
  },
}));

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: '#FFFFFF',
        color: '#253858',
        pt: 8,
        pb: 6,
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <BlueText variant="h5" gutterBottom>
                EventHub
              </BlueText>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.7 }}>
                EventHub, üniversite etkinlikleri ve kulüpleri için kapsamlı bir yönetim platformudur. Etkinlikleri keşfedin, kulüplere katılın ve kampüs yaşamını daha aktif hale getirin.
              </Typography>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <SocialIconButton aria-label="instagram">
                  <FontAwesomeIcon icon={faInstagram} size="lg" />
                </SocialIconButton>
                <SocialIconButton aria-label="twitter">
                  <FontAwesomeIcon icon={faTwitter} size="lg" />
                </SocialIconButton>
                <SocialIconButton aria-label="linkedin">
                  <FontAwesomeIcon icon={faLinkedin} size="lg" />
                </SocialIconButton>
                <SocialIconButton aria-label="discord">
                  <FontAwesomeIcon icon={faDiscord} size="lg" />
                </SocialIconButton>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: '#253858', fontWeight: 600 }}>
                Hızlı Linkler
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Link href="/" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#3751FF' } }}>
                  Ana Sayfa
                </Link>
                <Link href="/events" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#3751FF' } }}>
                  Etkinlikler
                </Link>
                <Link href="/clubs" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#3751FF' } }}>
                  Kulüpler
                </Link>
                <Link href="/students" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#3751FF' } }}>
                  Öğrenciler
                </Link>
                <Link href="/profile" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#3751FF' } }}>
                  Profil
                </Link>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: '#253858', fontWeight: 600 }}>
                Bültenimize Abone Olun
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Etkinlikler ve duyurulardan haberdar olmak için abone olun.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StyledTextField
                  variant="outlined"
                  placeholder="E-posta adresiniz"
                  fullWidth
                />
                <BlueButton>
                  Abone Ol
                </BlueButton>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4, borderColor: 'rgba(0, 0, 0, 0.05)' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} EventHub. Tüm hakları saklıdır.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" underline="hover" sx={{ color: 'text.secondary', fontSize: '0.875rem', '&:hover': { color: '#3751FF' } }}>
              Gizlilik Politikası
            </Link>
            <Link href="#" underline="hover" sx={{ color: 'text.secondary', fontSize: '0.875rem', '&:hover': { color: '#3751FF' } }}>
              Kullanım Şartları
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 