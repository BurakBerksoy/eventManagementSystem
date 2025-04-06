import { Grid, Box, Alert, CircularProgress, Pagination } from '@mui/material';
import EventCard from './EventCard';

const EventList = ({
  events,
  loading,
  actionLoading,
  onJoin,
  onWaitingList,
  currentPage,
  pageCount,
  onPageChange
}) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 4 }}>
        Aradığınız kriterlere uygun etkinlik bulunamadı.
      </Alert>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <EventCard
              event={event}
              onJoin={onJoin}
              onWaitingList={onWaitingList}
              loading={actionLoading}
            />
          </Grid>
        ))}
      </Grid>
      
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={currentPage}
            onChange={onPageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </>
  );
};

export default EventList; 