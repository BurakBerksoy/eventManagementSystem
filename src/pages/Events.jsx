import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Alert,
  Snackbar,
  Box
} from '@mui/material';
import { EventList, EventFilter } from '../components/events';
import {
  getAllEvents,
  getAllCategories,
  joinEvent,
  addToWaitingList
} from '../services/eventService';

const Events = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    // Etkinlikler burada yüklenmeyecek, boş bir array olarak kalacak
    setEvents([]);
    setFilteredEvents([]);
    
    // Kategorileri yükle
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        setError('Kategoriler yüklenirken bir hata oluştu');
        console.error(error);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  // Feedback snackbar'ı kapat
  const handleCloseFeedback = () => {
    setFeedback({ ...feedback, open: false });
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom mt={2}>
        Etkinlikler
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <EventFilter 
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        categories={categories}
        tabValue={tabValue}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onTabChange={handleTabChange}
      />
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="body1">Etkinlik bulunmamaktadır.</Typography>
      </Box>
      
      {/* Geri Bildirim Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity={feedback.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Events; 