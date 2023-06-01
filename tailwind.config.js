module.exports = {
    mode: 'jit',
    content: ["./public/**/*.{html,js}"],
    theme: {
        extend: {},
    },
    plugins: [
        require('tailwind-scrollbar')
    ],
}