document.addEventListener('DOMContentLoaded', () => {

    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const mainMenu = document.getElementById('main-menu');
    const dustContainer = document.getElementById('dust-container');
    const scene = document.getElementById('scene-container');
    const optionsButton = document.getElementById('options-button');
    const optionsMenu = document.getElementById('options-menu');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const mainNav = document.querySelector('.menu-nav');
    
    // === Elementos para guardado/carga ===
    const startButton = document.getElementById('start-button');
    const continueButton = document.getElementById('continue-button');
    const saveSlotsMenu = document.getElementById('save-slots-menu');
    const slotsContainer = document.getElementById('slots-container');
    const backToMainMenuButton = document.getElementById('back-to-main-menu-button');

    // --- CARGA DE SONIDOS ---
    const hoverSound = new Audio('audio/hover.mp3');
    const clickSound = new Audio('audio/click.mp3');
    const musicSound = new Audio('audio/background-music.mp3');
    hoverSound.preload = 'auto';
    clickSound.preload = 'auto';
    musicSound.preload = 'auto';
    musicSound.loop = true; // <--- AQUÍ ESTÁ LA MAGIA DEL BUCLE

    // --- SISTEMA DE GUARDADO ---
    const NUM_SLOTS = 3;
    const SAVE_KEY = 'dzmGameSaves';
    let saveSlotsData;

    function loadSaveData() {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            saveSlotsData = JSON.parse(savedData);
        } else {
            saveSlotsData = Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null }));
            saveGameData();
        }
        updateContinueButtonState();
    }

    function saveGameData() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveSlotsData));
        updateContinueButtonState();
    }
    
    function updateContinueButtonState() {
        const hasSaveData = saveSlotsData.some(slot => !slot.isEmpty);
        if (hasSaveData) {
            continueButton.classList.remove('disabled');
        } else {
            continueButton.classList.add('disabled');
        }
    }

    // --- CONFIGURACIÓN DE AJUSTES (SETTINGS) ---
    const defaultSettings = { masterVolume: 100, musicVolume: 75, sfxVolume: 85, retroFilter: false, brightness: 100 };
    let currentSettings;
    let musicHasStarted = false;

    // --- FUNCIONES DE AJUSTES ---
    function applyVisualSettings(settings) {
        mainMenu.classList.toggle('retro-filter-active', settings.retroFilter);
        mainMenu.style.setProperty('--brightness-level', settings.brightness / 100);
    }

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
            btn.classList.toggle('active', String(savedSettings.retroFilter) === btn.dataset.value);
        });
        applyVisualSettings(savedSettings);
        return savedSettings;
    }

    function saveSettings(settings) {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }

    // --- INICIALIZACIÓN ---
    currentSettings = loadSettings();
    loadSaveData();

    // --- FUNCIONES DE AUDIO ---
    function playSfx(sound) {
        const finalVolume = (currentSettings.masterVolume / 100) * (currentSettings.sfxVolume / 100);
        sound.volume = finalVolume;
        sound.currentTime = 0;
        sound.play();
    }

    function startMusicOnFirstInteraction() {
        if (musicHasStarted) return;
        updateMusicVolume();
        musicSound.play().catch(error => console.error("Music playback failed:", error));
        musicHasStarted = true;
        document.removeEventListener('click', startMusicOnFirstInteraction);
        document.removeEventListener('mousemove', startMusicOnFirstInteraction);
    }
    document.addEventListener('click', startMusicOnFirstInteraction);
    document.addEventListener('mousemove', startMusicOnFirstInteraction);

    // --- LÓGICA DE EFECTOS VISUALES DEL MENÚ ---
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const numberOfMotes = isMobile ? 30 : 50;
    for (let i = 0; i < numberOfMotes; i++) {
        let mote = document.createElement('div');
        mote.className = 'dust-mote';
        const size = Math.random() * 3 + 1, startX = Math.random() * 100, startY = Math.random() * 100;
        const duration = Math.random() * 20 + 10, delay = Math.random() * 10;
        Object.assign(mote.style, {
            width: `${size}px`, height: `${size}px`, left: `${startX}%`, top: `${startY}%`,
            animationDuration: `${duration}s, ${Math.random() * 3 + 2}s`, animationDelay: `${delay}s, ${Math.random() * 3}s`
        });
        dustContainer.appendChild(mote);
    }
    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            if (optionsMenu.classList.contains('hidden') && saveSlotsMenu.classList.contains('hidden')) {
                const moveX = (e.clientX / window.innerWidth - 0.5) * 15;
                const moveY = (e.clientY / window.innerHeight - 0.5) * 15;
                scene.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });
    }

    // --- LÓGICA DE VISIBILIDAD DE PANELES ---
    function showPanel(panelToShow) {
        [optionsMenu, saveSlotsMenu].forEach(p => p.classList.add('hidden'));
        if (panelToShow) panelToShow.classList.remove('hidden');
        mainNav.classList.toggle('hidden', !!panelToShow);
    }

    optionsButton.addEventListener('click', (e) => { e.preventDefault(); showPanel(optionsMenu); });
    backToMenuButton.addEventListener('click', () => showPanel(null));

    // --- Lógica para el panel de guardado ---
    function populateSaveSlots() {
        slotsContainer.innerHTML = '';
        saveSlotsData.forEach((slot, index) => {
            const slotElement = document.createElement('div');
            slotElement.classList.add('save-slot');
            slotElement.dataset.slotId = index;
            let statusText, titleText = `RANURA DE GUARDADO ${index + 1}`;
            if (slot.isEmpty) {
                slotElement.classList.add('empty');
                statusText = 'Partida Vacía';
            } else {
                slotElement.classList.add('occupied');
                statusText = `Guardado: ${slot.data.date}`;
            }
            slotElement.innerHTML = `<div class="slot-title">${titleText}</div><div class="slot-status">${statusText}</div>`;
            slotsContainer.appendChild(slotElement);
        });
    }

    function handleSlotClick(event) {
        const clickedSlot = event.target.closest('.save-slot');
        if (!clickedSlot) return;
        const slotId = parseInt(clickedSlot.dataset.slotId, 10);
        const slot = saveSlotsData[slotId];
        if (slot.isEmpty) {
            slot.isEmpty = false;
            slot.data = { date: new Date().toLocaleString('es-ES'), level: 1, score: 0 };
            saveGameData();
            populateSaveSlots();
            alert(`Nueva partida iniciada en la Ranura ${slotId + 1}.`);
        } else {
            alert(`Cargando partida desde la Ranura ${slotId + 1}.\nDatos: ${JSON.stringify(slot.data, null, 2)}`);
        }
    }
    
    startButton.addEventListener('click', (e) => { e.preventDefault(); populateSaveSlots(); showPanel(saveSlotsMenu); });
    continueButton.addEventListener('click', (e) => { e.preventDefault(); if (!continueButton.classList.contains('disabled')) { populateSaveSlots(); showPanel(saveSlotsMenu); } });
    backToMainMenuButton.addEventListener('click', () => showPanel(null));
    slotsContainer.addEventListener('click', handleSlotClick);

    // --- MANEJO DE CAMBIOS EN LAS OPCIONES ---
    document.querySelectorAll('.volume-slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const { option } = e.target.dataset;
            currentSettings[option] = parseInt(e.target.value, 10);
            if (option === 'masterVolume' || option === 'musicVolume') updateMusicVolume();
            saveSettings(currentSettings);
        });
    });

    document.querySelectorAll('#retro-filter-toggle .option-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('#retro-filter-toggle .option-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentSettings.retroFilter = e.target.dataset.value === 'true';
            saveSettings(currentSettings);
            applyVisualSettings(currentSettings);
        });
    });

    document.getElementById('brightness-slider').addEventListener('input', (e) => {
        currentSettings.brightness = parseInt(e.target.value, 10);
        saveSettings(currentSettings);
        applyVisualSettings(currentSettings);
    });

    // --- AÑADIR SONIDOS A ELEMENTOS INTERACTIVOS ---
    const interactiveElements = document.querySelectorAll('.menu-nav a, .option-btn, button');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => playSfx(hoverSound));
        element.addEventListener('click', () => {
            hoverSound.pause();
            hoverSound.currentTime = 0;
            playSfx(clickSound);
        });
    });
});