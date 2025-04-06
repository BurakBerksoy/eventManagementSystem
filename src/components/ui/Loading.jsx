import { Box, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { loadingContainerVariants, loadingCircleVariants, loadingCircleTransition } from '../../utils/animations.jsx';

const Loading = ({ message = "Yükleniyor..." }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress size={60} thickness={4} color="primary" />
      </motion.div>
      
      <Typography 
        variant="h6" 
        sx={{ mt: 3, mb: 5, opacity: 0.8 }}
        component={motion.h6}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {message}
      </Typography>
      
      <motion.div
        style={{
          display: 'flex',
          width: '3rem',
          justifyContent: 'space-around',
          marginTop: '1rem',
        }}
        variants={loadingContainerVariants}
        initial="start"
        animate="end"
      >
        {[1, 2, 3].map((index) => (
          <motion.span
            key={index}
            style={{
              display: 'block',
              width: '0.8rem',
              height: '0.8rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(55, 81, 255, 0.75)',
            }}
            variants={loadingCircleVariants}
            transition={loadingCircleTransition}
          />
        ))}
      </motion.div>
    </Box>
  );
};

export default Loading; 