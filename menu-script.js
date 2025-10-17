document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const mainMenu = document.getElementById('main-menu');
    const dustContainer = document.getElementById('dust-container');
    const scene = document.getElementById('scene-container');
    const optionsButton = document.getElementById('options-button');
    const optionsMenu = document.getElementById('options-menu');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const mainNav = document.querySelector('.menu-nav');

    // --- CARGA DE SONIDOS ---
    const hoverSound = new Audio('audio/hover.mp3');
    const clickSound = new Audio('audio/click.mp3');
    // === NUEVO: Carga de la música de fondo ===
    const musicSound = new Audio('audio/background-music.mp3');

    hoverSound.preload = 'auto';
    clickSound.preload = 'auto';
    musicSound.preload = 'auto';
    musicSound.loop = true; // Hacemos que la música se repita indefinidamente


    // --- CONFIGURACIÓN DE AJUSTES (SETTINGS) ---
    const defaultSettings = {
        masterVolume: 100,
        musicVolume: 75,
        sfxVolume: 85,
        retroFilter: false,
        brightness: 100
    };
    
    let currentSettings; // La definimos aquí para que sea accesible globalmente en el script
    let musicHasStarted = false; // Flag para controlar el inicio de la música

    // --- FUNCIONES DE AJUSTES ---
    function applyVisualSettings(settings) {
        if (settings.retroFilter) {
            mainMenu.classList.add('retro-filter-active');
        } else {
            mainMenu.classList.remove('retro-filter-active');
        }
        const brightnessValue = settings.brightness / 100;
        mainMenu.style.setProperty('--brightness-level', brightnessValue);
    }

    // === NUEVO: Función para actualizar el volumen de la música en tiempo real ===
    function updateMusicVolume() {
        const finalVolume = (currentSettings.masterVolume / 100) * (currentSettings.musicVolume / 100);
        musicSound.volume = finalVolume;
    }

    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('gameSettings')) || defaultSettings;
        
        document.getElementById('master-volume').value = savedSettings.masterVolume;
        document.getElementById('music-volume').value = savedSettings.musicVolume;
        document.getElementById('sfx-volume').value = savedSettings.sfxVolume;
        document.getElementById('brightness-slider').value = savedSettings.brightness;
        
        document.querySelectorAll('#retro-filter-toggle .option-btn').forEach(btn => {
            if (String(savedSettings.retroFilter) === btn.dataset.value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        applyVisualSettings(savedSettings);
        return savedSettings;
    }

    function saveSettings(settings) {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }
    
    currentSettings = loadSettings(); // Cargar los ajustes al inicio

    // --- FUNCIONES DE AUDIO ---
    function playSfx(sound) {
        const finalVolume = (currentSettings.masterVolume / 100) * (currentSettings.sfxVolume / 100);
        sound.volume = finalVolume;
        sound.currentTime = 0;
        sound.play();
    }
    
    // === NUEVO: Función para iniciar la música tras la interacción del usuario ===
    function startMusicOnFirstInteraction() {
        if (musicHasStarted) return; // Si ya empezó, no hacer nada
        
        console.log("User interaction detected, starting music...");
        updateMusicVolume(); // Ajustar volumen inicial
        musicSound.play().catch(error => console.error("Music playback failed:", error));
        musicHasStarted = true;

        // Una vez que la música ha empezado, ya no necesitamos estos listeners
        document.removeEventListener('click', startMusicOnFirstInteraction);
        document.removeEventListener('mousemove', startMusicOnFirstInteraction);
    }

    // === NUEVO: Listeners para la primera interacción ===
    document.addEventListener('click', startMusicOnFirstInteraction);
    document.addEventListener('mousemove', startMusicOnFirstInteraction);


    // --- LÓGICA DE EFECTOS VISUALES DEL MENÚ ---
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const numberOfMotes = isMobile ? 30 : 50;

    for (let i = 0; i < numberOfMotes; i++) {
        let mote = document.createElement('div');
        mote.className = 'dust-mote';
        const size = Math.random() * 3 + 1;
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        mote.style.width = `${size}px`;
        mote.style.height = `${size}px`;
        mote.style.left = `${startX}%`;
        mote.style.top = `${startY}%`;
        mote.style.animationDuration = `${duration}s, ${Math.random() * 3 + 2}s`;
        mote.style.animationDelay = `${delay}s, ${Math.random() * 3}s`;
        dustContainer.appendChild(mote);
    }

    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            if (optionsMenu.classList.contains('hidden')) {
                const mouseX = e.clientX / window.innerWidth;
                const mouseY = e.clientY / window.innerHeight;
                const moveX = (mouseX - 0.5) * 15;
                const moveY = (mouseY - 0.5) * 15;
                scene.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });
    }

    // --- LÓGICA DEL MENÚ DE OPCIONES (VISIBILIDAD) ---
    if (optionsButton && optionsMenu && backToMenuButton) {
        optionsButton.addEventListener('click', (e) => {
            e.preventDefault();
            optionsMenu.classList.remove('hidden');
            mainNav.classList.add('hidden');
        });

        backToMenuButton.addEventListener('click', () => {
            optionsMenu.classList.add('hidden');
            mainNav.classList.remove('hidden');
        });
    }
    
    // --- MANEJO DE CAMBIOS EN LAS OPCIONES ---
    document.querySelectorAll('.volume-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const optionKey = e.target.dataset.option;
            const value = e.target.value;
            currentSettings[optionKey] = parseInt(value, 10);
            
            // === MODIFICADO: Actualizar el volumen de la música si es necesario ===
            if (optionKey === 'masterVolume' || optionKey === 'musicVolume') {
                updateMusicVolume();
            }
            
            saveSettings(currentSettings);
        });
    });

    const retroFilterButtons = document.querySelectorAll('#retro-filter-toggle .option-btn');
    retroFilterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            retroFilterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const value = e.target.dataset.value === 'true'; 
            currentSettings.retroFilter = value;
            saveSettings(currentSettings);
            applyVisualSettings(currentSettings);
        });
    });

    document.getElementById('brightness-slider').addEventListener('input', (e) => {
        const value = e.target.value;
        currentSettings.brightness = parseInt(value, 10);
        saveSettings(currentSettings);
        applyVisualSettings(currentSettings);
    });

    // --- AÑADIR SONIDOS A ELEMENTOS INTERACTIVOS ---
    const interactiveElements = document.querySelectorAll('.menu-nav a, .option-btn, #back-to-menu-button');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            playSfx(hoverSound);
        });
        
        element.addEventListener('click', () => {
            hoverSound.pause();
            hoverSound.currentTime = 0;
            playSfx(clickSound);
        });
    });

});