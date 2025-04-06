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
  Divider
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { budgetService } from '../../services';

const FinanceTab = ({ clubId, userRole, showSnackbar }) => {
  // State değişkenleri
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtreleme için state değişkenleri
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Dialog state değişkenleri
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState(null);

  // Veri yükleme fonksiyonu
  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);

        // Finansal verileri çek
        const balanceResponse = await budgetService.getClubBalance(clubId);
        setBalance(balanceResponse.data.balance);

        const transactionsResponse = await budgetService.getClubTransactions(clubId);
        setTransactions(transactionsResponse.data);

        setError(null);
      } catch (err) {
        console.error('Finansal veriler yüklenirken hata oluştu:', err);
        setError('Finansal veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, [clubId]);

  // İşlemleri filtrele
  useEffect(() => {
    if (transactions.length > 0) {
      let filtered = [...transactions];
      
      // İşlem türüne göre filtrele
      if (activeFilter === 'DEPOSIT') {
        filtered = filtered.filter(transaction => transaction.type === 'DEPOSIT');
      } else if (activeFilter === 'WITHDRAW') {
        filtered = filtered.filter(transaction => transaction.type === 'WITHDRAW');
      }
      
      // Tarih aralığına göre filtrele
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.createdAt);
          return transactionDate >= startDate;
        });
      }
      
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Günün sonuna ayarla
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.createdAt);
          return transactionDate <= endDate;
        });
      }
      
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions([]);
    }
  }, [transactions, activeFilter, dateRange]);

  // Filtre değişim fonksiyonu
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  // Tarih aralığı değişimi
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Filtreleri sıfırla
  const handleResetFilters = () => {
    setActiveFilter('ALL');
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  // Dialog açma/kapama fonksiyonları
  const handleOpenDepositDialog = () => {
    setOpenDepositDialog(true);
    resetDialogFields();
  };

  const handleCloseDepositDialog = () => {
    setOpenDepositDialog(false);
    resetDialogFields();
  };

  const handleOpenWithdrawDialog = () => {
    setOpenWithdrawDialog(true);
    resetDialogFields();
  };

  const handleCloseWithdrawDialog = () => {
    setOpenWithdrawDialog(false);
    resetDialogFields();
  };

  const resetDialogFields = () => {
    setAmount('');
    setDescription('');
    setDialogError(null);
  };

  // Form değişiklik fonksiyonları
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Sadece sayı girişine izin ver
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Para yatırma işlemi
  const handleDeposit = async () => {
    if (!validateTransaction()) return;

    setDialogLoading(true);
    setDialogError(null);

    try {
      const depositData = {
        clubId,
        amount: parseFloat(amount),
        description: description || 'Para yatırma',
        type: 'DEPOSIT'
      };

      await budgetService.addTransaction(clubId, depositData);

      // State'i güncelle
      const balanceResponse = await budgetService.getClubBalance(clubId);
      setBalance(balanceResponse.data.balance);

      const transactionsResponse = await budgetService.getClubTransactions(clubId);
      setTransactions(transactionsResponse.data);

      // Dialog'u kapat
      setOpenDepositDialog(false);
      
      // Başarı mesajı göster
      showSnackbar(`${amount} ₺ başarıyla hesaba yatırıldı.`, 'success');
    } catch (err) {
      console.error('Para yatırma işlemi başarısız:', err);
      setDialogError('Para yatırma işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      showSnackbar('Para yatırma işlemi sırasında bir hata oluştu.', 'error');
    } finally {
      setDialogLoading(false);
    }
  };

  // Para çekme işlemi
  const handleWithdraw = async () => {
    if (!validateTransaction()) return;

    // Bakiyeyi kontrol et
    if (parseFloat(amount) > balance) {
      setDialogError('Yetersiz bakiye. Çekilecek miktar mevcut bakiyeden büyük olamaz.');
      return;
    }

    setDialogLoading(true);
    setDialogError(null);

    try {
      const withdrawData = {
        clubId,
        amount: parseFloat(amount),
        description: description || 'Para çekme',
        type: 'WITHDRAW'
      };

      await budgetService.addTransaction(clubId, withdrawData);

      // State'i güncelle
      const balanceResponse = await budgetService.getClubBalance(clubId);
      setBalance(balanceResponse.data.balance);

      const transactionsResponse = await budgetService.getClubTransactions(clubId);
      setTransactions(transactionsResponse.data);

      // Dialog'u kapat
      setOpenWithdrawDialog(false);
      
      // Başarı mesajı göster
      showSnackbar(`${amount} ₺ başarıyla hesaptan çekildi.`, 'success');
    } catch (err) {
      console.error('Para çekme işlemi başarısız:', err);
      setDialogError('Para çekme işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      showSnackbar('Para çekme işlemi sırasında bir hata oluştu.', 'error');
    } finally {
      setDialogLoading(false);
    }
  };

  // Form doğrulama
  const validateTransaction = () => {
    if (!amount) {
      setDialogError('Lütfen bir miktar girin.');
      return false;
    }

    if (parseFloat(amount) <= 0) {
      setDialogError('Miktar sıfırdan büyük olmalıdır.');
      return false;
    }

    return true;
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

  // İşlem türüne göre stil belirleme
  const getTransactionStyle = (type) => {
    return {
      color: type === 'DEPOSIT' ? 'success.main' : 'error.main',
      icon: type === 'DEPOSIT' ? <TrendingUpIcon /> : <TrendingDownIcon />,
      text: type === 'DEPOSIT' ? 'Yatırılan' : 'Çekilen',
      prefix: type === 'DEPOSIT' ? '+' : '-'
    };
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

  const canManageFinances = ['Başkan', 'Muhasebeci', 'Yönetici'].includes(userRole);

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Bakiye Kartı */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalanceIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                <Typography variant="h5" component="div">
                  Kulüp Bakiyesi
                </Typography>
              </Box>

              <Typography variant="h3" component="div" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                {balance.toLocaleString('tr-TR')} ₺
              </Typography>

              {canManageFinances && (
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDepositDialog}
                  >
                    Para Yatır
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RemoveIcon />}
                    onClick={handleOpenWithdrawDialog}
                    disabled={balance <= 0}
                  >
                    Para Çek
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* İşlem Geçmişi */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                İşlem Geçmişi
              </Typography>

              <Divider sx={{ my: 2 }} />
              
              {/* Filtreleme Kontrolü */}
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={7}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant={activeFilter === 'ALL' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => handleFilterChange('ALL')}
                        sx={{ minWidth: 100 }}
                      >
                        Tümü
                      </Button>
                      <Button 
                        variant={activeFilter === 'DEPOSIT' ? 'contained' : 'outlined'}
                        size="small"
                        color="success"
                        onClick={() => handleFilterChange('DEPOSIT')}
                        sx={{ minWidth: 100 }}
                      >
                        Yatırılan
                      </Button>
                      <Button 
                        variant={activeFilter === 'WITHDRAW' ? 'contained' : 'outlined'}
                        size="small"
                        color="error"
                        onClick={() => handleFilterChange('WITHDRAW')}
                        sx={{ minWidth: 100 }}
                      >
                        Çekilen
                      </Button>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={5}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField
                        label="Başlangıç"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateRangeChange}
                        sx={{ flex: 1 }}
                      />
                      <Typography variant="body2" sx={{ mx: 0.5 }}>-</Typography>
                      <TextField
                        label="Bitiş"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateRangeChange}
                        sx={{ flex: 1 }}
                      />
                      <Button 
                        size="small" 
                        onClick={handleResetFilters}
                      >
                        Sıfırla
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {filteredTransactions.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>İşlem Türü</TableCell>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Açıklama</TableCell>
                        <TableCell align="right">Miktar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransactions.map((transaction) => {
                        const style = getTransactionStyle(transaction.type);
                        
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <Chip
                                icon={style.icon}
                                label={style.text}
                                color={transaction.type === 'DEPOSIT' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell align="right" sx={{ color: style.color, fontWeight: 'bold' }}>
                              {style.prefix}{transaction.amount.toLocaleString('tr-TR')} ₺
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : transactions.length > 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Seçilen filtrelere uygun işlem bulunamadı.
                  </Typography>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={handleResetFilters}
                    sx={{ mt: 1 }}
                  >
                    Filtreleri Temizle
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Henüz işlem kaydı bulunmamaktadır.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Para Yatırma Dialog */}
      <Dialog open={openDepositDialog} onClose={handleCloseDepositDialog}>
        <DialogTitle>Para Yatır</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="amount"
            label="Miktar (₺)"
            type="text"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={handleAmountChange}
            disabled={dialogLoading}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="description"
            label="Açıklama (Opsiyonel)"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={handleDescriptionChange}
            disabled={dialogLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDepositDialog} disabled={dialogLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleDeposit} 
            variant="contained" 
            color="success"
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Para Yatır'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Para Çekme Dialog */}
      <Dialog open={openWithdrawDialog} onClose={handleCloseWithdrawDialog}>
        <DialogTitle>Para Çek</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="amount"
            label="Miktar (₺)"
            type="text"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={handleAmountChange}
            disabled={dialogLoading}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="description"
            label="Açıklama (Opsiyonel)"
            type="text"
            fullWidth
            variant="outlined"
            value={description}
            onChange={handleDescriptionChange}
            disabled={dialogLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWithdrawDialog} disabled={dialogLoading}>
            İptal
          </Button>
          <Button 
            onClick={handleWithdraw} 
            variant="contained" 
            color="error"
            disabled={dialogLoading}
          >
            {dialogLoading ? <CircularProgress size={24} /> : 'Para Çek'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinanceTab; 