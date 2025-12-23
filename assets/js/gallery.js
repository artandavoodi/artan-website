// Optional demo: subtle hover effect logging
document.querySelectorAll('.gallery-container img').forEach(img => {
    img.addEventListener('click', () => {
        console.log('Clicked image:', img.src);
    });
});