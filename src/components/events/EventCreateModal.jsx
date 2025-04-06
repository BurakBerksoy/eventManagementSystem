import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { tr } from 'date-fns/locale';

const EventCreateModal = ({ open, onClose, clubId, clubMembers }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ideaOwner: '',
    maxParticipants: '',
    poster: null
  });
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        poster: file
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Form validasyonu
      if (!formData.title || !formData.description || !formData.ideaOwner || !formData.maxParticipants || !date || !time) {
        throw new Error('Lütfen tüm alanları doldurun.');
      }

      // API çağrısı burada yapılacak
      // const response = await createEvent({
      //   ...formData,
      //   date: date.toISOString(),
      //   time: time.toISOString(),
      //   clubId
      // });

      onClose();
    } catch (err) {
      setError(err.message || 'Etkinlik oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Etkinlik Adı"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Konum"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              showTimeSelect
              dateFormat="dd/MM/yyyy HH:mm"
              locale={tr}
              customInput={
                <TextField
                  fullWidth
                  label="Başlangıç Tarihi"
                  required
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date })}
              showTimeSelect
              dateFormat="dd/MM/yyyy HH:mm"
              locale={tr}
              customInput={
                <TextField
                  fullWidth
                  label="Bitiş Tarihi"
                  required
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Maksimum Katılımcı Sayısı"
              name="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Kategori</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Kategori"
              >
                <MenuItem value="sport">Spor</MenuItem>
                <MenuItem value="culture">Kültür</MenuItem>
                <MenuItem value="education">Eğitim</MenuItem>
                <MenuItem value="social">Sosyal</MenuItem>
                <MenuItem value="other">Diğer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Oluştur
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventCreateModal; 