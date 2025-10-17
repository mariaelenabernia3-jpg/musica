document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const mainMenu = document.getElementById('main-menu');
    const dustContainer = document.getElementById('dust-container');
    const scene = document.getElementById('scene-container');
    const optionsButton = document.getElementById('options-button');
    const optionsMenu = document.getElementById('options-menu');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const mainNav = document.querySelector('.menu-nav');

    // --- CONFIGURACIÓN DE AJUSTES (SETTINGS) ---
    // Valores por defecto
    const defaultSettings = {
        masterVolume: 100,
        musicVolume: 75,
        sfxVolume: 85,
        retroFilter: false // El valor por defecto es 'No'
    };

    // Función para aplicar los ajustes visuales
    function applyVisualSettings(settings) {
        if (settings.retroFilter) {
            mainMenu.classList.add('retro-filter-active');
        } else {
            mainMenu.classList.remove('retro-filter-active');
        }
    }

    // Función para cargar los ajustes desde localStorage
    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('gameSettings')) || defaultSettings;
        
        // Aplicar ajustes a los controles de la UI
        document.getElementById('master-volume').value = savedSettings.masterVolume;
        document.getElementById('music-volume').value = savedSettings.musicVolume;
        document.getElementById('sfx-volume').value = savedSettings.sfxVolume;
        
        document.querySelectorAll('#retro-filter-toggle .option-btn').forEach(btn => {
            // Comparamos el valor del botón (string 'true' o 'false') con el ajuste (boolean)
            if (String(savedSettings.retroFilter) === btn.dataset.value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Aplicar los efectos visuales al cargar
        applyVisualSettings(savedSettings);

        return savedSettings;
    }

    // Función para guardar los ajustes en localStorage
    function saveSettings(settings) {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }
    
    // Cargar los ajustes al iniciar
    let currentSettings = loadSettings();

    // --- LÓGICA PARA MÓVILES ---
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const numberOfMotes = isMobile ? 30 : 50;

    // --- GENERADOR DE MOTAS DE POLVO ---
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

    // --- EFECTO PARALLAX (SOLO PARA DESKTOP) ---
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

    // --- LÓGICA DEL MENÚ DE OPCIONES ---
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
    
    // Listeners para los sliders de volumen
    document.querySelectorAll('.volume-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const optionKey = e.target.dataset.option;
            const value = e.target.value;
            currentSettings[optionKey] = parseInt(value, 10);
            console.log(`Opción cambiada: ${optionKey} = ${value}`);
            saveSettings(currentSettings);
        });
    });

    // Listeners para los botones del filtro retro
    const retroFilterButtons = document.querySelectorAll('#retro-filter-toggle .option-btn');
    retroFilterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            retroFilterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            const optionKey = e.target.dataset.option;
            // Convertir el valor del botón (string 'true'/'false') a un booleano real
            const value = e.target.dataset.value === 'true'; 
            currentSettings[optionKey] = value;
            console.log(`Opción cambiada: ${optionKey} = ${value}`);
            saveSettings(currentSettings);
            applyVisualSettings(currentSettings); // Aplicar cambio visual al instante
        });
    });

});