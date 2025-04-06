import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

const EventFilter = ({
  searchQuery,
  selectedCategory,
  categories,
  tabValue,
  onSearchChange,
  onCategoryChange,
  onTabChange
}) => {
  return (
    <Box sx={{ mb: 4, p: 2, borderRadius: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
      <Grid container spacing={3} alignItems="center">
        {/* Arama */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Etkinlik Ara"
            variant="outlined"
            value={searchQuery}
            onChange={onSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        {/* Kategori Filtresi */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="category-select-label">Kategori</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={selectedCategory}
              onChange={onCategoryChange}
              label="Kategori"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="Tümü">Tümü</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Sekmeler: Tümü, Yaklaşan, Tamamlanmış */}
      <Box sx={{ mt: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={onTabChange} 
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 'bold',
              color: 'text.secondary'
            },
            '& .Mui-selected': { 
              color: 'primary.main' 
            }
          }}
        >
          <Tab label="Tümü" />
          <Tab label="Yaklaşan" />
          <Tab label="Tamamlanmış" />
        </Tabs>
      </Box>
    </Box>
  );
};

export default EventFilter; 