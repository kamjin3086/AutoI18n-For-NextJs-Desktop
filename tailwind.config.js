/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.{html,vue,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
