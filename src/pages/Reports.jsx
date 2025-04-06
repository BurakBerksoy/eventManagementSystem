import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { clubAPI } from '../services/api';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Divider,
  Chip,
  Tabs,
  Tab,
  Stack,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatColorText as ColorTextIcon,
  FormatColorFill as ColorFillIcon,
  FormatSize as SizeIcon,
  Image as ImageIcon,
  Square as SquareIcon,
  Circle as CircleIcon,
  Save as SaveIcon,
  TextFormat as FontIcon
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MobileDateTimePicker } from '@mui/x-date-pickers';

// Zengin metin editörü ayarları
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'font',
  'align',
  'list', 'bullet',
  'link', 'image'
];

const Reports = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // State değişkenleri
  const [club, setClub] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Rapor oluşturma state değişkenleri
  const [reportContent, setReportContent] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // Dialog state değişkenleri
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    type: 'ACTIVITY', // ACTIVITY, FINANCIAL, MEETING, OTHER
  });
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  
  // Renk seçici
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Kullanıcı rollerini kontrol et
  const canEditReports = userRole === 'ADMIN' || userRole === 'PRESIDENT' || userRole === 'REPORTER';
  
  // Veri yükleme fonksiyonu
  useEffect(() => {
    const fetchClubAndReports = async () => {
      try {
        setLoading(true);
        
        // Kullanıcının rolünü kontrol et
        // Demo amaçlı - gerçekte API'den alınmalıdır
        const demoUserRoles = ['ADMIN', 'PRESIDENT', 'REPORTER'];
        const hasAccess = demoUserRoles.includes(currentUser?.role);
        
        if (!hasAccess) {
          setError('Bu sayfaya erişim izniniz bulunmamaktadır. Sadece Başkan, Admin ve Raporcu rolüne sahip kullanıcılar bu sayfayı görüntüleyebilir.');
          setLoading(false);
          return;
        }
        
        // Demo raporlar - gerçekte API'den alınmalıdır
        setReports([
          {
            id: 1,
            title: 'Mayıs Ayı Etkinlik Raporu',
            createdAt: '2023-05-30T10:00:00',
            type: 'ACTIVITY',
            createdBy: 'Ahmet Yılmaz',
            fileUrl: '/reports/1.pdf'
          },
          {
            id: 2,
            title: 'Haziran Ayı Finansal Raporu',
            createdAt: '2023-06-15T14:30:00',
            type: 'FINANCIAL',
            createdBy: 'Mehmet Demir',
            fileUrl: '/reports/2.pdf'
          },
          {
            id: 3,
            title: 'Yönetim Kurulu Toplantı Tutanağı',
            createdAt: '2023-07-01T09:00:00',
            type: 'MEETING',
            createdBy: 'Ayşe Kaya',
            fileUrl: '/reports/3.pdf'
          }
        ]);
        
        // Kullanıcı rolünü ayarla
        setUserRole(currentUser?.role || 'MEMBER');
        
        setError(null);
      } catch (err) {
        console.error('Raporlar yüklenirken hata oluştu:', err);
        setError('Raporlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClubAndReports();
  }, [clubId, currentUser]);
  
  // Tab değişikliği
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Rapor türünü görsel metne dönüştürme
  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'ACTIVITY': return 'Etkinlik Raporu';
      case 'FINANCIAL': return 'Finansal Rapor';
      case 'MEETING': return 'Toplantı Tutanağı';
      case 'OTHER': return 'Diğer';
      default: return 'Bilinmiyor';
    }
  };
  
  // Rapor türüne göre renk belirleme
  const getReportTypeColor = (type) => {
    switch (type) {
      case 'ACTIVITY': return 'primary';
      case 'FINANCIAL': return 'success';
      case 'MEETING': return 'info';
      case 'OTHER': return 'default';
      default: return 'default';
    }
  };
  
  // Tarih formatı
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Resim yükleme
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          url: e.target.result,
          name: file.name
        };
        setUploadedImages([...uploadedImages, newImage]);
        
        // Editöre resmi ekle
        const imgTag = `<img src="${e.target.result}" alt="${file.name}" style="max-width: 100%; margin: 10px 0;" />`;
        setReportContent(reportContent + imgTag);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Şekil ekleme fonksiyonları
  const addSquare = () => {
    const squareHTML = `<div style="width: 100px; height: 100px; background-color: ${currentColor}; margin: 10px 0;"></div>`;
    setReportContent(reportContent + squareHTML);
  };
  
  const addCircle = () => {
    const circleHTML = `<div style="width: 100px; height: 100px; border-radius: 50%; background-color: ${currentColor}; margin: 10px 0;"></div>`;
    setReportContent(reportContent + circleHTML);
  };
  
  // Rapor kaydetme
  const handleSaveReport = async () => {
    if (!reportTitle.trim()) {
      setSnackbar({
        open: true,
        message: 'Lütfen rapor için bir başlık girin.',
        severity: 'error'
      });
      return;
    }
    
    setDialogLoading(true);
    
    try {
      // API entegrasyonu burada olacak
      // await clubAPI.createReportWithHTML(clubId, { title: reportTitle, content: reportContent });
      
      // Demo amaçlı
      setTimeout(() => {
        // Yeni rapor ekleyerek UI'ı güncelle
        const newReport = {
          id: Date.now(),
          title: reportTitle,
          createdAt: new Date().toISOString(),
          type: 'ACTIVITY',
          createdBy: currentUser?.name || 'Kullanıcı',
          fileUrl: '#'
        };
        
        setReports([newReport, ...reports]);
        
        // Formu temizle
        setReportTitle('');
        setReportContent('');
        setUploadedImages([]);
        
        // Tamamlandı mesajı göster
        setSnackbar({
          open: true,
          message: 'Rapor başarıyla kaydedildi.',
          severity: 'success'
        });
        
        // Liste sekmesine geç
        setActiveTab(0);
        
        setDialogLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Rapor kaydedilirken hata:', err);
      setSnackbar({
        open: true,
        message: 'Rapor kaydedilirken bir hata oluştu.',
        severity: 'error'
      });
      setDialogLoading(false);
    }
  };
  
  // Snackbar kapatma
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error && !canEditReports) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Raporlar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kulüp raporlarını görüntüleyebilir ve yönetebilirsiniz. Raporcu rolüne sahip kişiler yeni rapor oluşturabilir.
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Rapor Listesi" />
          {canEditReports && <Tab label="Rapor Oluştur" />}
        </Tabs>
        
        <Divider />
        
        {/* Rapor Listesi Sekmesi */}
        {activeTab === 0 && (
          <Box p={3}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Tüm Raporlar ({reports.length})
              </Typography>
              
              {canEditReports && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={() => setActiveTab(1)}
                >
                  Yeni Rapor Oluştur
                </Button>
              )}
            </Box>
            
            {reports.length === 0 ? (
              <Alert severity="info">
                Henüz rapor bulunmamaktadır.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {reports.map(report => (
                  <Grid item xs={12} md={6} lg={4} key={report.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                            {report.title}
                          </Typography>
                          <Chip 
                            label={getReportTypeLabel(report.type)} 
                            color={getReportTypeColor(report.type)}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Oluşturan: {report.createdBy}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          Tarih: {formatDate(report.createdAt)}
                        </Typography>
                      </CardContent>
                      
                      <CardActions>
                        <Button 
                          startIcon={<VisibilityIcon />} 
                          size="small"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          Görüntüle
                        </Button>
                        
                        <Button 
                          startIcon={<DownloadIcon />} 
                          size="small"
                          onClick={() => window.open(report.fileUrl, '_blank')}
                        >
                          İndir
                        </Button>
                        
                        {canEditReports && (
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => {
                              if (window.confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
                                setReports(reports.filter(r => r.id !== report.id));
                                setSnackbar({
                                  open: true,
                                  message: 'Rapor başarıyla silindi.',
                                  severity: 'success'
                                });
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {/* Rapor Oluşturma Sekmesi */}
        {activeTab === 1 && canEditReports && (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Yeni Rapor Oluştur
            </Typography>
            
            <TextField
              label="Rapor Başlığı"
              variant="outlined"
              fullWidth
              margin="normal"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              required
            />
            
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Rapor İçeriği
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Tooltip title="Resim Ekle">
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<ImageIcon />}
                    onClick={() => fileInputRef.current.click()}
                  >
                    Resim
                  </Button>
                </Tooltip>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                
                <Tooltip title="Kare Ekle">
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<SquareIcon />}
                    onClick={addSquare}
                  >
                    Kare
                  </Button>
                </Tooltip>
                
                <Tooltip title="Daire Ekle">
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<CircleIcon />}
                    onClick={addCircle}
                  >
                    Daire
                  </Button>
                </Tooltip>
                
                <Tooltip title="Renk Seç">
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<ColorFillIcon />}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    style={{ backgroundColor: showColorPicker ? '#f1f1f1' : 'transparent' }}
                  >
                    Renk
                  </Button>
                </Tooltip>
              </Box>
              
              {showColorPicker && (
                <Box sx={{ mb: 2 }}>
                  <SketchPicker
                    color={currentColor}
                    onChangeComplete={(color) => setCurrentColor(color.hex)}
                  />
                </Box>
              )}
              
              <ReactQuill
                value={reportContent}
                onChange={setReportContent}
                modules={modules}
                formats={formats}
                placeholder="Rapor içeriğini buraya yazın..."
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button 
                variant="outlined"
                onClick={() => setActiveTab(0)}
              >
                İptal
              </Button>
              
              <Button 
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveReport}
                disabled={dialogLoading}
              >
                {dialogLoading ? <CircularProgress size={24} /> : 'Raporu Kaydet'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Reports; 