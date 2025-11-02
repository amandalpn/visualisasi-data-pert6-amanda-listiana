import type { Config } from 'tailwindcss';
import formPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.65)',
          dark: 'rgba(17, 25, 40, 0.65)',
        },
      },
      backdropBlur: {
        xl: '24px',
      },
      backgroundImage: {
        'liquid-glass':
          'radial-gradient(circle at top left, rgba(14, 165, 233, 0.25), transparent 45%), radial-gradient(circle at bottom right, rgba(244, 63, 94, 0.15), transparent 55%), radial-gradient(circle at top right, rgba(139, 92, 246, 0.15), transparent 65%)',
      },
      boxShadow: {
        glass: '0 24px 45px rgba(15, 23, 42, 0.14)',
      },
      fontFamily: {
        sans: [
          '"Poppins"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        heading: [
          '"Poppins"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      typography: ({ theme }: { theme: any }) => ({
        DEFAULT: {
          css: {
            fontFamily: theme('fontFamily.sans').join(', '),
            color: theme('colors.slate.700'),
            a: {
              color: theme('colors.sky.600'),
              fontWeight: '500',
              textDecoration: 'none',
              '&:hover': {
                color: theme('colors.sky.500'),
              },
            },
            h1: {
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '600',
              color: theme('colors.slate.900'),
              letterSpacing: '-0.025em',
            },
            h2: {
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '600',
              color: theme('colors.slate.900'),
              letterSpacing: '-0.02em',
            },
            h3: {
              fontFamily: theme('fontFamily.heading').join(', '),
              fontWeight: '600',
              color: theme('colors.slate.900'),
            },
            strong: {
              color: theme('colors.slate.900'),
            },
            p: {
              marginTop: '0.75em',
              marginBottom: '0.75em',
              lineHeight: '1.7',
              textAlign: 'justify',
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.slate.200'),
            a: {
              color: theme('colors.sky.300'),
              '&:hover': {
                color: theme('colors.sky.200'),
              },
            },
            h1: { color: theme('colors.slate.50') },
            h2: { color: theme('colors.slate.100') },
            h3: { color: theme('colors.slate.100') },
            strong: { color: theme('colors.slate.50') },
            p: { color: theme('colors.slate.200'), textAlign: 'justify' },
          },
        },
      }),
    },
  },
  plugins: [formPlugin, typographyPlugin],
};

export default config;
