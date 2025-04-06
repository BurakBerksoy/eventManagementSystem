import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { userAPI } from '../services/api';

const Students = () => {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        console.log('API çağrısı yapılıyor...');
        const response = await userAPI.getAllUsers();
        console.log('API yanıtı:', response);
        
        // API yanıtı tipini ve yapısını kontrol et
        console.log('Yanıt tipi:', typeof response);
        if (response) {
          if (Array.isArray(response)) {
            // Yanıt doğrudan dizi
            console.log('Yanıt doğrudan dizi, uzunluk:', response.length);
            
            // success anahtarının olup olmadığını kontrol et ve temizle
            if ('success' in response) {
              console.log('Success anahtarı dizide bulundu, temizleniyor');
              const cleanStudents = [...response]; // Dizinin kopyasını oluştur
              delete cleanStudents.success; // success anahtarını kaldır
              setStudents(cleanStudents);
            } else {
              setStudents(response);
            }
          } else if (response.data && Array.isArray(response.data)) {
            // Yanıt içinde data alanı var ve dizi
            console.log('Yanıt data dizisi, uzunluk:', response.data.length);
            setStudents(response.data);
          } else if (response.success === true && response.data && Array.isArray(response.data)) {
            // Success true değeri ve data alanı olan obje
            console.log('Success ve data alanı olan obje bulundu');
            setStudents(response.data);
          } else {
            // Diğer senaryolar - obje içerisinde kullanıcılar olabilir
            console.log('Yanıt obje, alanlar:', Object.keys(response));
            
            // Obje içinde kullanıcı dizisi arıyoruz
            let userData = null;
            
            // Dizi olabilecek alanları ara
            for (const key in response) {
              if (Array.isArray(response[key])) {
                console.log(`Dizi içeren alan bulundu: ${key}, uzunluk:`, response[key].length);
                userData = response[key];
                break;
              }
            }
            
            if (userData) {
              setStudents(userData);
            } else {
              console.error('Kullanıcı dizisi bulunamadı:', response);
              setError('Kullanıcı verileri uygun formatta alınamadı');
              setStudents([]);
            }
          }
        } else {
          setError('Öğrenci verileri alınamadı');
          setStudents([]);
        }
      } catch (err) {
        console.error('Kullanıcılar yüklenirken hata:', err);
        setError('Kullanıcı bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredStudents = students && Array.isArray(students) ? students.filter(student => {
    if (!student) return false;
    
    // Eğer success anahtarı varsa bu bir veri değil, veri dizisinin bir üst metadatası
    if (student === 'success') return false;
    
    console.log('Student item:', student);
    
    const searchTerm = searchQuery.toLowerCase();
    const studentName = (student.name || '').toLowerCase();
    const studentEmail = (student.email || '').toLowerCase();
    const studentId = String(student.studentId || '').toLowerCase();
    const studentDept = (student.department || '').toLowerCase();
    
    return (
      studentName.includes(searchTerm) ||
      studentEmail.includes(searchTerm) ||
      studentId.includes(searchTerm) ||
      studentDept.includes(searchTerm)
    );
  }) : [];
  
  // Filtrelenmiş öğrencileri logla
  console.log('Filtrelenmiş öğrenci sayısı:', filteredStudents.length, 
    filteredStudents.length > 0 ? 'İlk öğrenci: ' + JSON.stringify(filteredStudents[0]) : 'Öğrenci yok');

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (students.length === 0) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom mt={2}>
          Öğrenciler
        </Typography>
        <Alert severity="info" sx={{ mt: 4 }}>
          Kayıtlı öğrenci bulunmamaktadır.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom mt={2}>
        Öğrenciler
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Öğrenci Ara"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredStudents.map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => handleStudentClick(student)}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={student.profileImage}
                  alt={student.name}
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" component="h2">
                    {student.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.studentId || 'Öğrenci No: Belirtilmemiş'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.department || 'Bölüm: Belirtilmemiş'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Öğrenci Detay Dialog'u */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedStudent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={selectedStudent.profileImage}
                  alt={selectedStudent.name}
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">{selectedStudent.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.studentId || 'Öğrenci No: Belirtilmemiş'}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Bölüm"
                    secondary={selectedStudent.department || 'Belirtilmemiş'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="E-posta"
                    secondary={selectedStudent.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Telefon"
                    secondary={selectedStudent.phoneNumber || 'Belirtilmemiş'}
                  />
                </ListItem>
                {selectedStudent.bio && (
                  <ListItem>
                    <ListItemText
                      primary="Hakkında"
                      secondary={selectedStudent.bio}
                    />
                  </ListItem>
                )}
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Katılım Tarihi"
                    secondary={selectedStudent.joinDate ? new Date(selectedStudent.joinDate).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Kapat</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Students;