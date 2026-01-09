/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode backgrounds
        'surface-primary': '#FFFFFF',
        'surface-secondary': '#F9FAFB',

        // Dark mode backgrounds
        'dark-primary': '#0F172A',
        'dark-secondary': '#1E293B',

        // Borders
        'border-light': '#E5E7EB',
        'border-dark': '#334155',

        // Text
        'text-primary-light': '#111827',
        'text-secondary-light': '#6B7280',
        'text-primary-dark': '#F9FAFB',
        'text-secondary-dark': '#9CA3AF',

        // Accent colors
        'accent-light': '#2563EB',
        'accent-dark': '#3B82F6',
        'accent-hover-light': '#EFF6FF',
        'accent-hover-dark': '#1E3A8A',

        // File type colors
        'file-folder': '#FBBF24',
        'file-image': '#38BDF8',
        'file-video': '#818CF8',
        'file-audio': '#F472B6',
        'file-document': '#FB923C',
        'file-archive': '#A78BFA',
        'file-code': '#34D399',
      },
    },
  },
  plugins: [],
};
