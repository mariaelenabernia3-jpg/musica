// Se ejecuta cuando toda la página ha cargado
window.addEventListener('load', () => {

    const splashScreen = document.getElementById('splash-screen');
    const techScreen = document.getElementById('tech-screen');
    const storyScreen = document.getElementById('story-screen');

    // 1. A los 4 segundos, cambiar de LOGO a TECNOLOGÍAS
    setTimeout(() => {
        splashScreen.classList.remove('visible');
        splashScreen.classList.add('hidden');
        techScreen.classList.remove('hidden');
        techScreen.classList.add('visible');
    }, 4000);

    // 2. A los 9 segundos, cambiar de TECNOLOGÍAS a HISTORIA
    setTimeout(() => {
        techScreen.classList.remove('visible');
        techScreen.classList.add('hidden');
        storyScreen.classList.remove('hidden');
        storyScreen.classList.add('visible');
    }, 9000);

    // --- NUEVO Y CRUCIAL: Redirigir al menú principal ---
    // 3. A los 15 segundos (después de dar tiempo a leer la última frase)...
    setTimeout(() => {
        // ...cambiamos la página a 'menu.html'
        window.location.href = 'menu.html';
    }, 15000); // 15 segundos en total

});