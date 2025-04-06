import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  LinearProgress,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  GroupWork as GroupWorkIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/dateUtils';

const EventCard = ({ event, onJoin, onWaitingList, loading = false }) => {
  const { currentUser } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  // Katılım oranı hesaplama
  const participationRate = event.capacity > 0 
    ? Math.min(Math.round((event.registeredParticipants / event.capacity) * 100), 100)
    : 0;
  
  // Etkinlik durumuna göre renk belirleme
  const getStatusColor = () => {
    switch (event.status) {
      case 'upcoming':
        return '#4caf50';
      case 'ongoing':
        return '#ff9800';
      case 'completed':
        return '#9e9e9e';
      case 'cancelled':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };
  
  // Etkinlik durumuna göre Türkçe metin
  const getStatusText = () => {
    switch (event.status) {
      case 'upcoming':
        return 'Yaklaşan';
      case 'ongoing':
        return 'Devam Ediyor';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };
  
  // Katılma butonunun durumunu belirleme
  const getJoinButtonText = () => {
    if (!currentUser) return 'Giriş Yap';
    if (event.participants && event.participants.includes(currentUser.id)) return 'Katıldınız';
    if (event.registeredParticipants >= event.capacity) return 'Bekleme Listesine Katıl';
    return 'Katıl';
  };
  
  // Katılma butonu devre dışı mı?
  const isJoinButtonDisabled = () => {
    return !currentUser || event.status === 'completed' || event.status === 'cancelled' || loading;
  };
  
  // Katılma butonu işleyicisi
  const handleJoinClick = () => {
    if (!currentUser) {
      // Login sayfasına yönlendir
      window.location.href = '/login';
      return;
    }
    
    // Kullanıcı zaten kayıtlı mı?
    if (event.participants && event.participants.includes(currentUser.id)) {
      return;
    }
    
    if (event.registeredParticipants >= event.capacity) {
      onWaitingList && onWaitingList(event.id);
    } else {
      onJoin && onJoin(event.id);
    }
  };
  
  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        transform: isHovered ? 'translateY(-8px)' : 'none',
        boxShadow: isHovered ? '0 12px 20px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Durum etiketi */}
      <Chip 
        label={getStatusText()}
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          backgroundColor: getStatusColor(),
          color: 'white',
          fontWeight: 'bold'
        }}
      />
      
      {/* Etkinlik resmi */}
      <CardMedia
        component="img"
        height="140"
        image={event.imageUrl || 'https://source.unsplash.com/random/?event'}
        alt={event.title}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div" noWrap>
          {event.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <GroupWorkIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {event.club || 'Kulüp Bilgisi Yok'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {formatDate(event.startDate)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {event.location || 'Yer Belirtilmemiş'}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
          {event.description}
        </Typography>
        
        {/* Katılım durumu */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {event.registeredParticipants}/{event.capacity}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {participationRate}% Doluluk
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={participationRate} 
          sx={{ 
            height: 8, 
            borderRadius: 5,
            bgcolor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: participationRate >= 90 ? 'error.main' : 'primary.main'
            }
          }}
        />
      </CardContent>
      
      <CardActions sx={{ padding: 2, justifyContent: 'space-between' }}>
        <Button 
          size="small" 
          component={Link} 
          to={`/events/${event.id}`}
          variant="outlined"
        >
          Detaylar
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          color={event.participants && currentUser && event.participants.includes(currentUser.id) ? "success" : event.registeredParticipants >= event.capacity ? "warning" : "primary"}
          disabled={isJoinButtonDisabled()}
          onClick={handleJoinClick}
        >
          {getJoinButtonText()}
          {loading && '...'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default EventCard; 