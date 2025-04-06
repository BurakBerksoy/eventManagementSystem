import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia,
  useMediaQuery,
  Chip,
  Avatar,
  IconButton,
  Divider
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faUsers, 
  faArrowRight, 
  faMapMarkerAlt, 
  faClock,
  faChartBar,
  faCheckCircle,
  faTicketAlt,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 12,
      duration: 0.5 
    }
  },
  hover: {
    y: -10,
    boxShadow: "0px 10px 25px rgba(55, 81, 255, 0.2)",
    transition: { duration: 0.3 }
  },
  tap: {
    y: -5,
    boxShadow: "0px 5px 15px rgba(55, 81, 255, 0.2)",
    transition: { duration: 0.2 }
  }
};

// Modern bileşen stilleri
const BlueButton = styled(Button)(({ theme }) => ({
  background: '#3751FF',
  color: 'white',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '12px',
  textTransform: 'none',
  boxShadow: '0 4px 14px rgba(55, 81, 255, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: '#2A3FC9',
    boxShadow: '0 6px 20px rgba(55, 81, 255, 0.35)',
  }
}));

const OutlinedButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  color: '#3751FF',
  borderRadius: '12px',
  border: '2px solid #3751FF',
  fontWeight: 600,
  padding: '12px 24px',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(55, 81, 255, 0.04)',
    borderColor: '#2A3FC9',
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  boxShadow: '0 5px 20px rgba(55, 81, 255, 0.1)',
  border: '1px solid rgba(55, 81, 255, 0.05)',
  height: '100%',
  '&:hover': {
    boxShadow: '0 10px 30px rgba(55, 81, 255, 0.15)',
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  height: '100%',
  boxShadow: '0 5px 15px rgba(55, 81, 255, 0.08)',
  border: '1px solid rgba(55, 81, 255, 0.03)',
  backgroundColor: 'white',
}));

const EventCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  overflow: 'hidden',
  height: '100%',
  boxShadow: '0 5px 15px rgba(55, 81, 255, 0.08)',
  border: '1px solid rgba(55, 81, 255, 0.05)',
  backgroundColor: 'white',
  position: 'relative',
}));

const IconBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(55, 81, 255, 0.1)',
  borderRadius: '50%',
  width: 64,
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  color: '#3751FF',
}));

// Global stil için
const GlobalStyles = () => {
  return (
    <Box
      sx={{
        '@global': {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: '#FFFFFF',
          },
          '*::-webkit-scrollbar-thumb': {
            background: '#3751FF',
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: '#2A3FC9',
          },
        },
      }}
    />
  );
};

// Ana bileşen
const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const featuredEvents = [
    {
      id: 1,
      title: "Dijital Dönüşüm Konferansı",
      date: "15 Haziran 2023",
      time: "10:00 - 16:30",
      location: "İstanbul Kongre Merkezi",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1170&q=80",
      category: "Konferans"
    },
    {
      id: 2,
      title: "Tasarım Zirvesi",
      date: "22 Haziran 2023",
      time: "09:00 - 18:00",
      location: "Tasarım Merkezi",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1170&q=80",
      category: "Workshop"
    },
    {
      id: 3,
      title: "Müzik Festivali",
      date: "30 Haziran 2023",
      time: "16:00 - 23:00",
      location: "Açık Hava Sahnesi",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1170&q=80",
      category: "Festival"
    }
  ];

  const features = [
    {
      title: "Etkinlik Planlaması",
      description: "Etkinliklerinizi kolayca planlayın, yönetin ve takip edin.",
      icon: faCalendarAlt
    },
    {
      title: "Bilet Yönetimi",
      description: "Bilet satışlarını düzenleyin, kontrol edin ve raporlayın.",
      icon: faTicketAlt
    },
    {
      title: "Katılımcı Analizi",
      description: "Etkinliklerinize katılımı gerçek zamanlı olarak analiz edin.",
      icon: faChartBar
    },
    {
      title: "Kolay Kayıt",
      description: "QR kod ile hızlı ve güvenli kayıt süreci sağlayın.",
      icon: faCheckCircle
    }
  ];

  return (
    <Box sx={{ pb: 10, backgroundColor: '#FFFFFF' }}>
      <GlobalStyles />
      {/* Hero Bölümü */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: 8,
          pb: 10,
          backgroundColor: 'rgba(55, 81, 255, 0.02)'
        }}
      >
        {/* Dekoratif Unsurlar */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(55, 81, 255, 0.05)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(55, 81, 255, 0.05)',
            zIndex: 0,
          }}
        />
        
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h2"
                    sx={{ 
                      mb: 1,
                      fontWeight: 800,
                      color: '#253858',
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                      lineHeight: 1.2
                    }}
                  >
                    Etkinliklerinizi <span style={{ color: '#3751FF' }}>Modern</span> Şekilde Yönetin
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 4, 
                      color: '#6B7280',
                      fontWeight: 400,
                      lineHeight: 1.6,
                      fontSize: { xs: '1rem', md: '1.15rem' }
                    }}
                  >
                    Tüm etkinliklerinizi tek platformda kolayca planlayın, yönetin ve analiz edin. Daha etkili ve başarılı organizasyonlar için ihtiyacınız olan tüm araçlar burada.
                  </Typography>
                </motion.div>
                
                <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <BlueButton
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/events')}
                    startIcon={<FontAwesomeIcon icon={faCalendarAlt} />}
                    size={isMobile ? 'medium' : 'large'}
                  >
                    Etkinlikleri Keşfet
                  </BlueButton>
                  
                  <OutlinedButton
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/register')}
                    startIcon={<FontAwesomeIcon icon={faUsers} />}
                    size={isMobile ? 'medium' : 'large'}
                  >
                    Hesap Oluştur
                  </OutlinedButton>
                </motion.div>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                sx={{ 
                  position: 'relative',
                  height: { xs: '300px', md: '450px' },
                  width: '100%',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(55, 81, 255, 0.15)',
                  border: '1px solid rgba(55, 81, 255, 0.1)',
                }}
              >
                <Box
                  component="img"
                  src="https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg?w=1380&t=st=1687601592~exp=1687602192~hmac=39e7b4db0a48d10a2494b2c37a0eaf343a282d9bd7abc16931e576128eddc9bf"
                  alt="Modern Etkinlik Yönetimi"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* İstatistikler Bölümü */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={10} lg={8} textAlign="center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: '#253858'
                }}
              >
                Rakamlarla <span style={{ color: '#3751FF' }}>Etkinlik Sistemimiz</span>
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: '#6B7280',
                  mb: 6,
                  maxWidth: '700px',
                  mx: 'auto',
                  fontSize: '1.1rem'
                }}
              >
                Etkinlik yönetim sistemimizin gerçek istatistiklerine göz atın
              </Typography>
            </motion.div>
          </Grid>
        </Grid>
        
        <Grid container spacing={3} justifyContent="center">
          {[
            { icon: faCalendarAlt, count: "104", label: "Etkinlik Düzenlendi" },
            { icon: faUsers, count: "87", label: "Aktif Kullanıcı" },
            { icon: faTicketAlt, count: "250", label: "Katılımcı" },
            { icon: faCheckCircle, count: "92%", label: "Kullanıcı Memnuniyeti" }
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <StatsCard>
                  <IconBox>
                    <FontAwesomeIcon icon={stat.icon} size="lg" />
                  </IconBox>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#3751FF', mb: 1 }}>
                    {stat.count}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6B7280', textAlign: 'center' }}>
                    {stat.label}
                  </Typography>
                </StatsCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Öne Çıkan Etkinlikler */}
      <Box sx={{ backgroundColor: 'rgba(55, 81, 255, 0.02)', py: 10 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: '#253858'
                }}
              >
                Öne Çıkan <span style={{ color: '#3751FF' }}>Etkinlikler</span>
              </Typography>
              
              <Typography
                variant="body1"
                sx={{ color: '#6B7280', fontSize: '1.1rem' }}
              >
                Yaklaşan popüler etkinlikleri keşfedin
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              sx={{
                color: '#3751FF',
                borderColor: '#3751FF',
                borderRadius: '10px',
                fontWeight: 600,
                mt: { xs: 2, md: 0 }
              }}
              endIcon={<FontAwesomeIcon icon={faArrowRight} />}
              onClick={() => navigate('/events')}
            >
              Tümünü Gör
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {featuredEvents.map((event, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover="hover"
                  whileTap="tap"
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: index * 0.1 }}
                  style={{ height: '100%' }}
                >
                  <EventCard 
                    onClick={() => navigate(`/events/${event.id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.image}
                      alt={event.title}
                    />
                    <Chip 
                      label={event.category} 
                      sx={{ 
                        position: 'absolute', 
                        top: 16, 
                        right: 16,
                        backgroundColor: '#3751FF',
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#253858', mb: 2 }}>
                        {event.title}
                      </Typography>
                      
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#3751FF', width: 16, marginRight: 10 }} />
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {event.date} • {event.time}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#3751FF', width: 16, marginRight: 10 }} />
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                          {event.location}
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="contained" 
                        fullWidth
                        sx={{ 
                          backgroundColor: '#3751FF',
                          fontWeight: 600,
                          py: 1.2,
                          borderRadius: '10px',
                          '&:hover': {
                            backgroundColor: '#2A3FC9',
                          }
                        }}
                        endIcon={<FontAwesomeIcon icon={faArrowRight} />}
                      >
                        İncele
                      </Button>
                    </CardContent>
                  </EventCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Özellikler Bölümü */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={10} lg={8} textAlign="center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: '#253858'
                }}
              >
                Neden <span style={{ color: '#3751FF' }}>Bizi Seçmelisiniz?</span>
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: '#6B7280',
                  mb: 6,
                  maxWidth: '700px',
                  mx: 'auto',
                  fontSize: '1.1rem'
                }}
              >
                En modern etkinlik yönetim platformumuz ile etkinliklerinizi yönetmek hiç bu kadar kolay olmamıştı
              </Typography>
            </motion.div>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ height: '100%' }}
              >
                <FeatureCard>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <IconBox sx={{ mb: 2 }}>
                      <FontAwesomeIcon icon={feature.icon} size="lg" />
                    </IconBox>
                    
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#253858', mb: 2 }}>
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ color: '#6B7280', mb: 'auto' }}>
                      {feature.description}
                    </Typography>
                    
                    <Button 
                      variant="text" 
                      sx={{ 
                        color: '#3751FF',
                        p: 0,
                        alignSelf: 'flex-start',
                        mt: 2,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'transparent',
                          opacity: 0.8
                        }
                      }}
                      endIcon={<FontAwesomeIcon icon={faArrowRight} />}
                    >
                      Daha Fazla
                    </Button>
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* CTA Bölümü */}
      <Box sx={{ py: 10, backgroundColor: '#3751FF' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Grid container spacing={4} alignItems="center" justifyContent="center">
              <Grid item xs={12} md={8} textAlign="center">
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    color: 'white'
                  }}
                >
                  Etkinlik Yönetiminde Yeni Nesil Dönem
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 400,
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.5
                  }}
                >
                  Hemen ücretsiz denemeye başlayın ve sistemimizin sağladığı avantajları deneyimleyin
                </Typography>
                
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: '#3751FF',
                    fontWeight: 700,
                    py: 1.5,
                    px: 4,
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                  onClick={() => navigate('/register')}
                >
                  Hemen Başla
                </Button>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 