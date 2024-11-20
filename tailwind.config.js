import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: '#0A0A0A',
            foreground: '#FFFFFF',
            primary: {
              DEFAULT: '#10B981',
              foreground: '#000000',
            },
            secondary: {
              DEFAULT: '#6366F1',
              foreground: '#FFFFFF',
            },
          },
        },
      },
    }),
  ],
};

//  colors: {
//     whiteColor: 'var(--white-color)',
//     greenColor: 'var(--green-color)',
//     grayColor: 'var(--gray-color)',
//     redColor: 'var(--red-color)',
//     yellowColor: 'var(--yellow-color)',
//     backgroundRoot: 'var(--background-root)',
//     backgroundNavbar: 'var(--background-navbar)',
//     backgroundContainer: 'var(--background-container)',
//     backgroundGreen: 'var(--background-green)',
//     backgroundGreenHover: 'var(--background-green-hover)',
//     backgroundRed: 'var(--background-red)',
//     backgroundRedHover: 'var(--background-red-hover)',
//     backgroundYellow: 'var(--background-yellow)',
//     borderColor: 'var(--border-color)',
//   },
