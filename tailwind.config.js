/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f5f7ff',
					100: '#ebf0ff',
					200: '#d6e0ff',
					300: '#b8c9ff',
					400: '#94a8ff',
					500: '#667eea',
					600: '#5568d3',
					700: '#4653b8',
					800: '#3a4494',
					900: '#2f3775',
				},
				secondary: {
					500: '#764ba2',
					600: '#653d8a',
				},
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			animation: {
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'slide-up': 'slideUp 0.4s ease-out',
				'slide-down': 'slideDown 0.4s ease-out',
				'spin-slow': 'spin 3s linear infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
			},
		},
	},
	plugins: [require('@tailwindcss/forms')],
};
