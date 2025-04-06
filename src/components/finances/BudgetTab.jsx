import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  LinearProgress,
  MenuItem
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { budgetService } from '../../services';

const BudgetTab = ({ clubId, userRole, showSnackbar }) => {
  // State değişkenleri
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog state değişkenleri
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newBudget, setNewBudget] = useState({
    title: '',
    description: '',
    amount: '',
    deadlineDate: '',
    category: 'EVENT'
  });
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);
  
  // Bütçe düzenleme ve silme için state değişkenleri
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deletingBudgetId, setDeletingBudgetId] = useState(null);

  // Veri yükleme fonksiyonu
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);

        // Bütçe verilerini çek
        const budgetsResponse = await budgetService.getClubBudgets(clubId);
        setBudgets(budgetsResponse.data);

        setError(null);
      } catch (err) {
        console.error('Bütçe verileri yüklenirken hata oluştu:', err);
        setError('Bütçe verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [clubId]);

  // Dialog açma/kapama fonksiyonları
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    resetDialogFields();
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    resetDialogFields();
  };

  const resetDialogFields = () => {
    setNewBudget({
      title: '',
      description: '',
      amount: '',
      deadlineDate: '',
      category: 'EVENT'
    });
    setDialogError(null);
  };

  // Bütçe düzenleme dialogu
  const handleOpenEditDialog = (budget) => {
    setEditingBudget({
      ...budget,
      amount: budget.amount.toString()
    });
    setOpenEditDialog(true);
    setDialogError(null);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingBudget(null);
    setDialogError(null);
  };

  // Bütçe silme onay dialogu
  const handleOpenDeleteConfirm = (budgetId) => {
    setDeletingBudgetId(budgetId);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setDeletingBudgetId(null);
  };

  // Form değişiklik fonksiyonları
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount' && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    
    setNewBudget({
      ...newBudget,
      [name]: value
    });
  };
  
  // Düzenleme formu değişikliği
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount' && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    
    setEditingBudget({
      ...editingBudget,
      [name]: value
    });
  };

  // Bütçe ekleme işlemi
  const handleAddBudget = async () => {
    if (!validateBudget()) return;

    setDialogLoading(true);
    setDialogError(null);

    try {
      const budgetData = {
        ...newBudget,
        clubId,
        amount: parseFloat(newBudget.amount)
      };

      await budgetService.createBudget(budgetData);

      // State'i güncelle
      const budgetsResponse = await budgetService.getClubBudgets(clubId);
      setBudgets(budgetsResponse.data);

      // Dialog'u kapat
      setOpenAddDialog(false);
      
      // Başarı mesajı göster
      showSnackbar('Yeni bütçe başarıyla oluşturuldu.', 'success');
    } catch (err) {
      console.error('Bütçe ekleme işlemi başarısız:', err);
      setDialogError('Bütçe ekleme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      showSnackbar('Bütçe ekleme sırasında bir hata oluştu.', 'error');
    } finally {
      setDialogLoading(false);
    }
  };

  // Bütçe güncelleme işlemi
  const handleUpdateBudget = async () => {
    if (!validateEditingBudget()) return;

    setDialogLoading(true);
    setDialogError(null);

    try {
      const budgetData = {
        ...editingBudget,
        amount: parseFloat(editingBudget.amount)
      };

      await budgetService.updateBudget(editingBudget.id, budgetData);

      // State'i güncelle
      const budgetsResponse = await budgetService.getClubBudgets(clubId);
      setBudgets(budgetsResponse.data);

      // Dialog'u kapat
      setOpenEditDialog(false);
      
      // Başarı mesajı göster
      showSnackbar('Bütçe başarıyla güncellendi.', 'success');
    } catch (err) {
      console.error('Bütçe güncelleme işlemi başarısız:', err);
      setDialogError('Bütçe güncelleme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      showSnackbar('Bütçe güncelleme sırasında bir hata oluştu.', 'error');
    } finally {
      setDialogLoading(false);
    }
  };

  // Bütçe silme işlemi
  const handleDeleteBudget = async () => {
    setDialogLoading(true);

    try {
      await budgetService.deleteBudget(deletingBudgetId);

      // State'i güncelle
      setBudgets(budgets.filter(budget => budget.id !== deletingBudgetId));

      // Dialog'u kapat
      setOpenDeleteConfirm(false);
      
      // Başarı mesajı göster
      showSnackbar('Bütçe başarıyla silindi.', 'success');
    } catch (err) {
      console.error('Bütçe silme işlemi başarısız:', err);
      // Snackbar ile hata gösterilebilir
      showSnackbar('Bütçe silinirken bir hata oluştu.', 'error');
    } finally {
      setDialogLoading(false);
    }
  };

  // Form doğrulama
  const validateBudget = () => {
    if (!newBudget.title) {
      setDialogError('Lütfen bir başlık girin.');
      return false;
    }

    if (!newBudget.amount) {
      setDialogError('Lütfen bir miktar girin.');
      return false;
    }

    if (parseFloat(newBudget.amount) <= 0) {
      setDialogError('Miktar sıfırdan büyük olmalıdır.');
      return false;
    }

    return true;
  };

  const validateEditingBudget = () => {
    if (!editingBudget.title) {
      setDialogError('Lütfen bir başlık girin.');
      return false;
    }

    if (!editingBudget.amount) {
      setDialogError('Lütfen bir miktar girin.');
      return false;
    }

    if (parseFloat(editingBudget.amount) <= 0) {
      setDialogError('Miktar sıfırdan büyük olmalıdır.');
      return false;
    }

    return true;
  };

  // Tarih formatı
  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Bütçe kategorisine göre etiket
  const getBudgetCategoryLabel = (category) => {
    switch (category) {
      case 'EVENT': return 'Etkinlik';
      case 'MATERIAL': return 'Malzeme';
      case 'TRAVEL': return 'Seyahat';
      case 'OTHER': return 'Diğer';
      default: return 'Bilinmiyor';
    }
  };

  // Bütçe kategorisine göre renk
  const getBudgetCategoryColor = (category) => {
    switch (category) {
      case 'EVENT': return 'primary';
      case 'MATERIAL': return 'success';
      case 'TRAVEL': return 'warning';
      case 'OTHER': return 'default';
      default: return 'default';
    }
  };

  // Bütçe ilerleme durumu
  const getBudgetProgress = (budget) => {
    if (!budget.usedAmount) return 0;
    return Math.min(100, (budget.usedAmount / budget.amount) * 100);
  };

  // İlerleme çubuğu rengi
  const getProgressColor = (progress) => {
    if (progress < 60) return 'success';
    if (progress < 90) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  const canManageBudgets = ['Başkan', 'Muhasebeci', 'Yönetici'].includes(userRole);

  return (
    <Box sx={{ p: 2 }}>
      {canManageBudgets && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Yeni Bütçe Ekle
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const progress = getBudgetProgress(budget);
            const progressColor = getProgressColor(progress);
            
            return (
              <Grid item key={budget.id} xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {budget.title}
                      </Typography>
                      
                      <Chip
                        label={getBudgetCategoryLabel(budget.category)}
                        color={getBudgetCategoryColor(budget.category)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {budget.description || 'Açıklama bulunmamaktadır.'}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          Bütçe Kullanımı
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {budget.usedAmount?.toLocaleString('tr-TR') || '0'} ₺ / {budget.amount.toLocaleString('tr-TR')} ₺
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        color={progressColor}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachMoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Kalan Miktar
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {(budget.amount - (budget.usedAmount || 0)).toLocaleString('tr-TR')} ₺
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Son Tarih
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(budget.deadlineDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {canManageBudgets && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleOpenEditDialog(budget)}
                          sx={{ mr: 1 }}
                        >
                          Düzenle
                        </Button>
                        <Button 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteConfirm(budget.id)}
                        >
                          Sil
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Box sx={{ 
              textAlign: 'center', 
              py: 8, 
              px: 3, 
              borderRadius: 2, 
              bgcolor: 'background.paper', 
              boxShadow: 1 
            }}>
              <EventNoteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Henüz bütçe bulunmamaktadır
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                Kulüp aktiviteleri, malzeme alımları ve diğer harcamalar için bütçeler oluşturabilirsiniz.
              </Typography>
              
              {canManageBudgets && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                >
                  İlk Bütçeyi Oluştur
                </Button>
              )}
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Bütçe Ekleme Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Bütçe Ekle</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Başlık"
            type="text"
            fullWidth
            variant="outlined"
            value={newBudget.title}
            onChange={handleInputChange}
            disabled={dialogLoading}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Açıklama"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newBudget.description}
            onChange={handleInputChange}
            disabled={dialogLoading}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="amount"
                name="amount"
                label="Miktar (₺)"
                type="text"
                fullWidth
                variant="outlined"
                value={newBudget.amount}
                onChange={handleInputChange}
                disabled={dialogLoading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="deadlineDate"
                name="deadlineDate"
                label="Son Tarih"
                type="date"
                fullWidth
                variant="outlined"
                value={newBudget.deadlineDate}
                onChange={handleInputChange}
                disabled={dialogLoading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          
          <TextField
            select
            margin="dense"
            id="category"
            name="category"
            label="Kategori"
            fullWidth
            variant="outlined"
            value={newBudget.category}
            onChange={handleInputChange}
            disabled={dialogLoading}
            sx={{ mt: 2 }}
          >
            <MenuItem value="EVENT">Etkinlik</MenuItem>
            <MenuItem value="MATERIAL">Malzeme</MenuItem>
            <MenuItem value="TRAVEL">Seyahat</MenuItem>
            <MenuItem value="OTHER">Diğer</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} disabled={dialogLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleAddBudget} 
            variant="contained" 
            color="primary"
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bütçe Düzenleme Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Bütçe Düzenle</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          
          {editingBudget && (
            <>
              <TextField
                autoFocus
                margin="dense"
                id="edit-title"
                name="title"
                label="Başlık"
                type="text"
                fullWidth
                variant="outlined"
                value={editingBudget.title}
                onChange={handleEditInputChange}
                disabled={dialogLoading}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="dense"
                id="edit-description"
                name="description"
                label="Açıklama"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={editingBudget.description}
                onChange={handleEditInputChange}
                disabled={dialogLoading}
                sx={{ mb: 2 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="dense"
                    id="edit-amount"
                    name="amount"
                    label="Miktar (₺)"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={editingBudget.amount}
                    onChange={handleEditInputChange}
                    disabled={dialogLoading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="dense"
                    id="edit-deadlineDate"
                    name="deadlineDate"
                    label="Son Tarih"
                    type="date"
                    fullWidth
                    variant="outlined"
                    value={editingBudget.deadlineDate || ''}
                    onChange={handleEditInputChange}
                    disabled={dialogLoading}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              
              <TextField
                select
                margin="dense"
                id="edit-category"
                name="category"
                label="Kategori"
                fullWidth
                variant="outlined"
                value={editingBudget.category}
                onChange={handleEditInputChange}
                disabled={dialogLoading}
                sx={{ mt: 2 }}
              >
                <MenuItem value="EVENT">Etkinlik</MenuItem>
                <MenuItem value="MATERIAL">Malzeme</MenuItem>
                <MenuItem value="TRAVEL">Seyahat</MenuItem>
                <MenuItem value="OTHER">Diğer</MenuItem>
              </TextField>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={dialogLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleUpdateBudget} 
            variant="contained" 
            color="primary"
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bütçe Silme Onay Dialog */}
      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Bütçeyi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            Bu bütçeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} disabled={dialogLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleDeleteBudget} 
            variant="contained" 
            color="error"
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BudgetTab; 