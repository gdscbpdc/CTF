import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#9fef00',
              foreground: '#ffffff',
            },
            danger: {
              DEFAULT: '#ff3e3e',
            },
            success: {
              DEFAULT: '#9fef00',
            },
            warning: {
              DEFAULT: '#ffaf00',
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#9fef00',
              foreground: '#000000',
            },
            danger: {
              DEFAULT: '#ff3e3e',
            },
            success: {
              DEFAULT: '#9fef00',
            },
            warning: {
              DEFAULT: '#ffaf00',
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
