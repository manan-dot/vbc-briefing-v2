import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pear-green': '#4CAF50',
        'pear-dark': '#2E7D32',
        'priority-high': '#EF4444',
        'priority-medium': '#F59E0B',
        'priority-low': '#22C55E',
      },
    },
  },
  plugins: [],
}
export default config
