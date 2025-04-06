import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

const MembersTab = ({ clubId, members, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openMemberDialog, setOpenMemberDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [newRole, setNewRole] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
  };

  const handleOpenMemberDialog = (member) => {
    setSelectedMember(member);
    setNewRole(member.role);
    setOpenMemberDialog(true);
  };

  const handleCloseMemberDialog = () => {
    setOpenMemberDialog(false);
    setSelectedMember(null);
  };

  const handleRoleChange = () => {
    // API çağrısı yapılacak
    console.log(`Kullanıcı ${selectedMember.id} için rol değiştirildi: ${newRole}`);
    handleCloseMemberDialog();
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <Box sx={{ p: 2 }}>
      {/* Arama ve filtreleme */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <TextField
          placeholder="Üye ara..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ width: { xs: '100%', sm: '60%' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="role-filter-label">Rol Filtresi</InputLabel>
          <Select
            labelId="role-filter-label"
            value={roleFilter}
            onChange={handleRoleFilterChange}
            label="Rol Filtresi"
            endAdornment={
              <InputAdornment position="end">
                <FilterListIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="Başkan">Başkan</MenuItem>
            <MenuItem value="Başkan Yardımcısı">Başkan Yardımcısı</MenuItem>
            <MenuItem value="Yönetici">Yönetici</MenuItem>
            <MenuItem value="Üye">Üye</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Üyeler listesi */}
      {filteredMembers.length > 0 ? (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {filteredMembers.map((member) => (
            <ListItem
              key={member.id}
              alignItems="center"
              secondaryAction={
                isAdmin && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpenMemberDialog(member)}
                  >
                    Rol Değiştir
                  </Button>
                )
              }
              sx={{ 
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar 
                  alt={member.name} 
                  src={member.avatar || "/static/images/avatar/default.jpg"}
                  sx={{ 
                    width: 50, 
                    height: 50,
                    border: '2px solid',
                    borderColor: 
                      member.role === 'Başkan' ? 'primary.main' :
                      member.role === 'Başkan Yardımcısı' ? 'secondary.main' :
                      member.role === 'Yönetici' ? 'warning.main' :
                      'grey.300'
                  }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {member.name}
                    </Typography>
                    <Chip 
                      label={member.role} 
                      size="small"
                      color={
                        member.role === 'Başkan' ? 'primary' :
                        member.role === 'Başkan Yardımcısı' ? 'secondary' :
                        member.role === 'Yönetici' ? 'warning' :
                        'default'
                      }
                      sx={{ ml: 1, borderRadius: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bölüm: {member.department || 'Belirtilmemiş'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Katılım: {member.joinDate || 'Belirtilmemiş'}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || roleFilter !== 'all' 
              ? 'Arama kriterlerine uygun üye bulunamadı.' 
              : 'Bu kulübün henüz üyesi bulunmamaktadır.'}
          </Typography>
        </Box>
      )}
      
      {/* Rol değiştirme diyaloğu */}
      <Dialog open={openMemberDialog} onClose={handleCloseMemberDialog}>
        <DialogTitle>Üye Rolü Değiştir</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {selectedMember?.name} için yeni bir rol seçin:
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="new-role-label">Yeni Rol</InputLabel>
            <Select
              labelId="new-role-label"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="Yeni Rol"
            >
              <MenuItem value="Başkan">Başkan</MenuItem>
              <MenuItem value="Başkan Yardımcısı">Başkan Yardımcısı</MenuItem>
              <MenuItem value="Yönetici">Yönetici</MenuItem>
              <MenuItem value="Üye">Üye</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMemberDialog} color="inherit">
            İptal
          </Button>
          <Button onClick={handleRoleChange} color="primary" variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembersTab; 