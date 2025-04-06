import { createTheme } from '@mui/material/styles';
import { trTR } from '@mui/material/locale';

// Özel yazı tiplerini import et
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';

// Modern renk teması - mavi ve beyaz
const primaryColor = '#3751FF';
const primaryLightColor = '#5B70FF';
const primaryDarkColor = '#2A3FC9';
const secondaryColor = '#FFFFFF';
const darkColor = '#253858';
const successColor = '#3751FF';
const warningColor = '#3751FF';
const errorColor = '#3751FF';
const infoColor = '#3751FF';
const bgColor = '#F7F8FC';
const paperColor = '#FFFFFF';

// Tema oluşturma
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3751FF',
      light: '#5B70FF',
      dark: '#2A3FC9',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFFFFF',
      light: '#FFFFFF',
      dark: '#F0F0F0',
      contrastText: '#3751FF',
    },
    error: {
      main: '#3751FF',
      light: '#5B70FF',
      dark: '#2A3FC9',
    },
    warning: {
      main: '#3751FF',
      light: '#5B70FF',
      dark: '#2A3FC9',
    },
    info: {
      main: '#3751FF',
      light: '#5B70FF',
      dark: '#2A3FC9',
    },
    success: {
      main: '#3751FF',
      light: '#5B70FF',
      dark: '#2A3FC9',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
      darker: '#F7F8FC',
    },
    text: {
      primary: '#253858',
      secondary: 'rgba(37, 56, 88, 0.7)',
      disabled: 'rgba(37, 56, 88, 0.5)',
    },
    divider: 'rgba(55, 81, 255, 0.1)',
    action: {
      active: 'rgba(55, 81, 255, 0.8)',
      hover: 'rgba(55, 81, 255, 0.05)',
      selected: 'rgba(55, 81, 255, 0.12)',
      disabled: 'rgba(55, 81, 255, 0.3)',
      disabledBackground: 'rgba(55, 81, 255, 0.08)',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    h4: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    h6: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    button: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: 600,
      fontSize: '0.75rem',
      lineHeight: 1.5,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(0, 0, 0, 0.15)',
    '0px 4px 16px rgba(0, 0, 0, 0.2)',
    '0px 6px 20px rgba(0, 0, 0, 0.25)',
    '0px 8px 24px rgba(0, 0, 0, 0.3)',
    '0px 10px 28px rgba(0, 0, 0, 0.35)',
    '0px 12px 32px rgba(0, 0, 0, 0.4)',
    '0px 14px 36px rgba(0, 0, 0, 0.45)',
    '0px 16px 40px rgba(0, 0, 0, 0.5)',
    '0px 18px 44px rgba(0, 0, 0, 0.55)',
    '0px 20px 48px rgba(0, 0, 0, 0.6)',
    '0px 22px 52px rgba(0, 0, 0, 0.65)',
    '0px 24px 56px rgba(0, 0, 0, 0.7)',
    '0px 26px 60px rgba(0, 0, 0, 0.75)',
    '0px 28px 64px rgba(0, 0, 0, 0.8)',
    '0px 30px 68px rgba(0, 0, 0, 0.85)',
    '0px 32px 72px rgba(0, 0, 0, 0.9)',
    '0px 34px 76px rgba(0, 0, 0, 0.95)',
    '0px 36px 80px rgba(0, 0, 0, 1)',
    '0px 38px 84px rgba(0, 0, 0, 1)',
    '0px 40px 88px rgba(0, 0, 0, 1)',
    '0px 42px 92px rgba(0, 0, 0, 1)',
    '0px 44px 96px rgba(0, 0, 0, 1)',
    '0px 46px 100px rgba(0, 0, 0, 1)',
    '0px 48px 104px rgba(0, 0, 0, 1)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "rgba(55, 81, 255, 0.5) rgba(240, 240, 240, 0.5)",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "rgba(240, 240, 240, 0.5)",
            width: "10px",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: "10px",
            backgroundColor: "rgba(55, 81, 255, 0.5)",
            border: "2px solid rgba(240, 240, 240, 0.5)",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "rgba(55, 81, 255, 0.8)",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "rgba(55, 81, 255, 0.8)",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(55, 81, 255, 0.8)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
          boxShadow: 'none',
        },
        contained: {
          backgroundColor: '#3751FF',
          boxShadow: '0 4px 20px rgba(55, 81, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(55, 81, 255, 0.5)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: 'rgba(142, 84, 233, 0.5)',
          '&:hover': {
            borderColor: '#8E54E9',
            backgroundColor: 'rgba(142, 84, 233, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(55, 81, 255, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(55, 81, 255, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 4px 16px rgba(55, 81, 255, 0.15)',
        },
        elevation3: {
          boxShadow: '0px 6px 20px rgba(55, 81, 255, 0.2)',
        },
        elevation4: {
          boxShadow: '0px 8px 24px rgba(55, 81, 255, 0.25)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        gutterBottom: {
          marginBottom: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& fieldset': {
            borderColor: 'rgba(55, 81, 255, 0.2)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(55, 81, 255, 0.4)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#3751FF',
          },
          backgroundColor: '#FFFFFF',
        },
        input: {
          padding: '12px 16px',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(55, 81, 255, 0.1)',
          padding: '16px 24px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(55, 81, 255, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(55, 81, 255, 0.9)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(55, 81, 255, 0.3)',
          fontSize: '0.75rem',
          padding: '8px 12px',
          borderRadius: 8,
          color: '#FFFFFF',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 46,
          height: 26,
          padding: 0,
          margin: 8,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(20px)',
            '& + .MuiSwitch-track': {
              opacity: 1,
              backgroundColor: '#3751FF',
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.5,
              backgroundColor: 'rgba(55, 81, 255, 0.5)',
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
        },
        track: {
          borderRadius: 13,
          border: 'none',
          backgroundColor: 'rgba(55, 81, 255, 0.2)',
          opacity: 1,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(55, 81, 255, 0.1)',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 42,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(55, 81, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(55, 81, 255, 0.15)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(55, 81, 255, 0.05)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: '0.65rem',
          minWidth: 18,
          height: 18,
          padding: '0 5px',
        },
      },
    },
  },
}, trTR);

export default theme; 