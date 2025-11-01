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
    },
  },
  plugins: [formPlugin, typographyPlugin],
};

export default config;
