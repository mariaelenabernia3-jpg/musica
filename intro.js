window.onload = () => {
    const splashScreen = document.getElementById('splash-screen');
    const techScreen = document.getElementById('tech-screen');
    const storyScreen = document.getElementById('story-screen');

    // Secuencia de la introducción
    setTimeout(() => {
        splashScreen.classList.remove('visible');
        splashScreen.classList.add('hidden');
        techScreen.classList.add('visible');
    }, 4000); // Duración de la pantalla del logo

    setTimeout(() => {
        techScreen.classList.remove('visible');
        techScreen.classList.add('hidden');
        storyScreen.classList.add('visible');
    }, 8000); // Duración total hasta que aparece la historia

    setTimeout(() => {
        window.location.href = 'menu.html';
    }, 13000); // Duración total de la intro antes de ir al menú
};