export const siteConfig = {
  name: 'CekKirim',
  description:
    'Lacak paket dan cek ongkir semua ekspedisi Indonesia dengan mudah, cepat, dan akurat.',
  url: 'https://cekkirim.com',
  ogImage: 'https://cekkirim.com/og.jpg',
  theme: {
    // Tailwind Color Palette (Blue-Sky based)
    // You can generate these using tools like https://uicolors.app/create
    primary: {
      DEFAULT: '#0ea5e9', // 500
      Foreground: '#ffffff',
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    secondary: {
      DEFAULT: '#a855f7', // 500
      Foreground: '#ffffff',
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
  },
  links: {
    twitter: 'https://twitter.com/cekkirim',
    github: 'https://github.com/cekkirim',
    instagram: 'https://instagram.com/cekkirim',
    whatsapp: 'https://wa.me/6281234567890',
    email: 'support@cekkirim.com',
  },
  features: {
    showAds: true,
    showBlog: true,
    showCommunity: true,
  },
  creator: 'CekKirim Team',
  keywords: [
    'cek resi',
    'cek ongkir',
    'tracking paket',
    'lacak paket',
    'jne',
    'jnt',
    'sicepat',
    'shopee express',
  ],
};

export type SiteConfig = typeof siteConfig;
