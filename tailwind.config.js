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
            secondary: {
              50: '#dfedfd',
              100: '#b3d4fa',
              200: '#86bbf7',
              300: '#59a1f4',
              400: '#2d88f1',
              500: '#006fee',
              600: '#005cc4',
              700: '#00489b',
              800: '#003571',
              900: '#002147',
              foreground: '#fff',
              DEFAULT: '#006fee',
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
            background: {
              DEFAULT: '#080305',
            },
            foreground: {
              DEFAULT: '#f3f3f3',
            },
            primary: {
              DEFAULT: '#A90200',
              foreground: '#f3f3f3',
            },
            secondary: {
              50: '#dfedfd',
              100: '#b3d4fa',
              200: '#86bbf7',
              300: '#59a1f4',
              400: '#2d88f1',
              500: '#006fee',
              600: '#005cc4',
              700: '#00489b',
              800: '#003571',
              900: '#002147',
              foreground: '#fff',
              DEFAULT: '#006fee',
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
