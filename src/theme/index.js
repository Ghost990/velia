import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    wedding: {
      50: '#fef7f0',
      100: '#feeee0',
      200: '#fcd9c1',
      300: '#fab896',
      400: '#f78e69',
      500: '#f56565',
      600: '#e53e3e',
      700: '#c53030',
      800: '#9c2626',
      900: '#7a1f1f',
    },
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    rose: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    }
  },
  fonts: {
    heading: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'rose',
      },
      variants: {
        wedding: {
          bg: 'linear-gradient(135deg, #f472b6, #ec4899)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, #ec4899, #db2777)',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s',
        },
        gold: {
          bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          _hover: {
            bg: 'linear-gradient(135deg, #d97706, #b45309)',
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: 'xl',
          boxShadow: 'sm',
          _hover: {
            boxShadow: 'md',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s',
        },
      },
    },
  },
});

export default theme;