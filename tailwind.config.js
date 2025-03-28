module.exports = {
    content: [
        // Tells Tailwind where to look for classes:
        './layouts/**/*.html',
        './content/**/*.{md,html}',
        './assets/css/**/*.css',
    ],
    darkMode: 'media', // or 'class' if you want a manual toggle
    theme: {
        extend: {
            // Customize your colors, fonts, etc. here
        },
    },
    plugins: [
        // For more advanced typography in Markdown:
        require('@tailwindcss/typography'),
    ],
};
