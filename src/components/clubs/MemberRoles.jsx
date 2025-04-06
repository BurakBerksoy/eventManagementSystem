import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AccountBalance as AccountBalanceIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  LocalCafe as LocalCafeIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';

const roles = [
  {
    id: 'PRESIDENT',
    name: 'Başkan',
    description: 'Kulübün sorumlusudur, her şey elinin altındadır. Etkinlik oluşturabilir, üyelerin rollerini değiştirebilir.',
    icon: <SupervisorAccountIcon />
  },
  {
    id: 'ACCOUNTANT',
    name: 'Muhasebeci',
    description: 'Kulübün maddesel kısmı ile ilgilenir. Etkinlikler için para toplama ve bütçe yönetimi yapar.',
    icon: <AccountBalanceIcon />
  },
  {
    id: 'SECRETARY',
    name: 'Sekreter',
    description: 'Kulüp toplantılarında rapor yazar, gelişmeleri ve yapılacakları kaydeder.',
    icon: <DescriptionIcon />
  },
  {
    id: 'EXTERNAL_AFFAIRS',
    name: 'Dış İlişkiler',
    description: 'Dışarıdan uzman çağırma ve dış ilişkilerden sorumludur.',
    icon: <BusinessIcon />
  },
  {
    id: 'HOSPITALITY',
    name: 'İkram',
    description: 'Etkinliklerde ikram malzemeleri alma, hazırlama ve servis etmeden sorumludur.',
    icon: <LocalCafeIcon />
  },
  {
    id: 'DESIGNER',
    name: 'Dijital Tasarımcı',
    description: 'Etkinlik afişleri ve dijital tasarımlardan sorumludur.',
    icon: <PaletteIcon />
  }
];

const MemberRoles = ({ open, onClose, members, onUpdateRole, onRemoveMember }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [error, setError] = useState('');

  const handleRoleChange = async () => {
    if (!selectedMember || !newRole) {
      setError('Lütfen bir üye ve rol seçin.');
      return;
    }

    try {
      await onUpdateRole(selectedMember.id, newRole);
      setSelectedMember(null);
      setNewRole('');
      setError('');
    } catch (err) {
      setError('Rol güncellenirken bir hata oluştu.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await onRemoveMember(memberId);
    } catch (err) {
      setError('Üye kaldırılırken bir hata oluştu.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Üye Rolleri</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Rol Açıklamaları
          </Typography>
          <Grid container spacing={2}>
            {roles.map((role) => (
              <Grid item xs={12} sm={6} key={role.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {role.icon}
                  <Typography variant="subtitle1" sx={{ ml: 1 }}>
                    {role.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {role.description}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Üye Listesi
          </Typography>
          <List>
            {members.map((member) => (
              <ListItem key={member.id}>
                <ListItemText
                  primary={member.name}
                  secondary={roles.find(r => r.id === member.role)?.name || 'Üye'}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Rolü Düzenle">
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setSelectedMember(member);
                        setNewRole(member.role);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Üyeyi Kaldır">
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>

        {selectedMember && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rol Değiştir: {selectedMember.name}
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Yeni Rol</InputLabel>
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                label="Yeni Rol"
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {selectedMember && (
          <Button onClick={handleRoleChange} variant="contained" color="primary">
            Rolü Güncelle
          </Button>
        )}
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MemberRoles; 