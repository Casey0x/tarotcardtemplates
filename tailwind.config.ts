import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f4f1ea',
        parchment: '#ede6d8',
        charcoal: '#1f1f1d',
        mutedGold: '#9a875e'
      }
    }
  },
  plugins: []
};

export default config;
