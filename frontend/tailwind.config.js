/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          black: 'rgba(0,0,0,0.95)',
          white: '#ffffff',
          blue: '#0075de',
          'blue-active': '#005bab',
          'blue-focus': '#097fe8',
          'blue-link': '#0075de',
          'blue-link-light': '#62aef0',
        },
        warm: {
          50: '#f6f5f4',
          100: '#eeedec',
          200: '#e0dfdd',
          300: '#a39e98',
          400: '#7e7a75',
          500: '#615d59',
          600: '#4a4743',
          700: '#31302e',
          800: '#242321',
          900: '#1a1918',
        },
        badge: {
          blue: '#f2f9ff',
          'blue-text': '#097fe8',
        },
        accent: {
          teal: '#2a9d99',
          green: '#1aae39',
          orange: '#dd5b00',
          pink: '#ff64c8',
          purple: '#391c57',
          brown: '#523410',
        },
        deep: {
          navy: '#213183',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'ui-monospace', 'Menlo', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      fontSize: {
        'display-hero': ['64px', { lineHeight: '1.00', letterSpacing: '-2.125px', fontWeight: '700' }],
        'display-secondary': ['54px', { lineHeight: '1.04', letterSpacing: '-1.875px', fontWeight: '700' }],
        'section-heading': ['48px', { lineHeight: '1.00', letterSpacing: '-1.5px', fontWeight: '700' }],
        'subheading-large': ['40px', { lineHeight: '1.50', letterSpacing: '0px', fontWeight: '700' }],
        'subheading': ['26px', { lineHeight: '1.23', letterSpacing: '-0.625px', fontWeight: '700' }],
        'card-title': ['22px', { lineHeight: '1.27', letterSpacing: '-0.25px', fontWeight: '700' }],
        'body-large': ['20px', { lineHeight: '1.40', letterSpacing: '-0.125px', fontWeight: '600' }],
        'nav-button': ['15px', { lineHeight: '1.33', fontWeight: '600' }],
        'caption': ['14px', { lineHeight: '1.43', fontWeight: '500' }],
        'caption-light': ['14px', { lineHeight: '1.43', fontWeight: '400' }],
        'badge': ['12px', { lineHeight: '1.33', letterSpacing: '0.125px', fontWeight: '600' }],
        'micro': ['12px', { lineHeight: '1.33', letterSpacing: '0.125px', fontWeight: '400' }],
      },
      borderRadius: {
        'micro': '4px',
        'subtle': '5px',
        'standard': '8px',
        'comfortable': '12px',
        'large': '16px',
        'pill': '9999px',
      },
      boxShadow: {
        'whisper': '0 1px 2px rgba(0,0,0,0.02)',
        'card': '0px 4px 18px rgba(0,0,0,0.04), 0px 2.025px 7.84688px rgba(0,0,0,0.027), 0px 0.8px 2.925px rgba(0,0,0,0.02), 0px 0.175px 1.04062px rgba(0,0,0,0.01)',
        'card-hover': '0px 6px 24px rgba(0,0,0,0.06), 0px 3px 10px rgba(0,0,0,0.035), 0px 1.2px 4px rgba(0,0,0,0.025), 0px 0.3px 1.5px rgba(0,0,0,0.01)',
        'deep': '0px 1px 3px rgba(0,0,0,0.01), 0px 3px 7px rgba(0,0,0,0.02), 0px 7px 15px rgba(0,0,0,0.02), 0px 14px 28px rgba(0,0,0,0.04), 0px 23px 52px rgba(0,0,0,0.05)',
        'focus': '0px 0px 0px 2px rgba(9,127,232,0.3)',
      },
      borderColor: {
        whisper: 'rgba(0,0,0,0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
