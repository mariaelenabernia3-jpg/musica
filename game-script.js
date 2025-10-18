window.onload = () => {

    // --- CONSTANTES Y REFERENCIAS AL DOM ---
    const SAVE_KEY = 'dzmGameSaves', NUM_SLOTS = 3;
    const allModals = document.querySelectorAll('.modal-overlay');
    const notificationContainer = document.getElementById('notification-container');
    const energyValueUI = document.getElementById('energy-value'), energyBarUI = document.getElementById('energy-bar');
    const knowledgeValueUI = document.getElementById('knowledge-value'), knowledgeBarUI = document.getElementById('knowledge-bar');
    const subsValueUI = document.getElementById('subs-value'), moneyValueUI = document.getElementById('money-value');
    const dayValueUI = document.getElementById('day-value'), footageValueUI = document.getElementById('footage-value');
    const introModal = document.getElementById('intro-modal'), computerModal = document.getElementById('computer-modal'), recordingModal = document.getElementById('recording-modal'), editingModal = document.getElementById('editing-modal'), upgradePcModal = document.getElementById('upgrade-pc-modal'), gameShopModal = document.getElementById('game-shop-modal'), selectGameModal = document.getElementById('select-game-modal'), uploadVideoModal = document.getElementById('upload-video-modal');
    const startGameButton = document.getElementById('start-game-button'), sleepButton = document.getElementById('sleep-button'), studyButton = document.getElementById('study-button'), computerButton = document.getElementById('computer-button'), backToRoomButton = document.getElementById('back-to-room-button'), recordVideoButton = document.getElementById('record-video-button'), editVideoButton = document.getElementById('edit-video-button'), buyGamesButton = document.getElementById('buy-games-button'), upgradePcButton = document.getElementById('upgrade-pc-button'), uploadVideoButton = document.getElementById('upload-video-button'), buyUpgradeButton = document.getElementById('buy-upgrade-button'), confirmUploadButton = document.getElementById('confirm-upload-button');
    const clickTarget = document.getElementById('click-target'), recordingProgressBarUI = document.getElementById('recording-progress-bar');
    
    // --- DATOS DEL JUEGO (tienda, mejoras) ---
    const PC_UPGRADES = [ { level: 1, cost: 0, name: 'Patata PC', editSpeed: 1, recordBonus: 2 }, { level: 2, cost: 50, name: 'PC decente', editSpeed: 1.5, recordBonus: 5 }, { level: 3, cost: 250, name: 'Máquina de Gaming', editSpeed: 2.5, recordBonus: 10 }, ];
    const GAME_SHOP = [ { id: 'serpientePixelada', name: 'Serpiente Pixelada', cost: 10 }, { id: 'tiroDeGloria', name: 'Tiro de Gloria', cost: 15 }, ];

    let gameState = {}, currentSlotId = -1;

    // --- SISTEMA DE NOTIFICACIONES ---
    function showNotification(message, type = 'info') { const notif = document.createElement('div'); notif.className = `notification ${type}`; notif.textContent = message; notificationContainer.appendChild(notif); setTimeout(() => notif.remove(), 4500); }
    
    // --- LÓGICA DE MODALES ---
    function showModal(modalId) { allModals.forEach(m => m.classList.add('hidden')); if (modalId) { const modal = document.getElementById(modalId); if (modal) modal.classList.remove('hidden'); } }
    function closeModal() { showModal(''); }

    // --- GUARDADO Y CARGA ---
    function createNewGameData() { return { isNew: true, date: new Date().toLocaleString('es-ES'), day: 1, energy: 100, knowledge: 0, subscribers: 0, money: 0, video: { rawFootage: 0, editedVideo: null }, pc: { level: 1 }, ownedGames: [] }; }
    function loadGame(slotId) { let allSavesText = localStorage.getItem(SAVE_KEY), allSaves = allSavesText ? JSON.parse(allSavesText) : Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null })); if (slotId >= 0 && slotId < allSaves.length) { let slot = allSaves[slotId]; if (slot.isEmpty) { slot.isEmpty = false; slot.data = createNewGameData(); localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves)); } gameState = slot.data; } else { showNotification("Error: Ranura de guardado no válida.", 'error'); window.location.href = 'menu.html'; } }
    function saveGame() { let allSavesText = localStorage.getItem(SAVE_KEY), allSaves = allSavesText ? JSON.parse(allSavesText) : Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null })); if (currentSlotId >= 0 && currentSlotId < allSaves.length) { allSaves[currentSlotId].data = gameState; allSaves[currentSlotId].isEmpty = false; localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves)); } }

    // --- ACTUALIZACIÓN DE UI ---
    function updateUI() {
        energyValueUI.textContent = `${gameState.energy} / 100`; energyBarUI.style.width = `${gameState.energy}%`;
        knowledgeValueUI.textContent = `${gameState.knowledge} / 100`; knowledgeBarUI.style.width = `${gameState.knowledge}%`;
        subsValueUI.textContent = gameState.subscribers.toLocaleString('es-ES');
        moneyValueUI.textContent = `$${gameState.money.toLocaleString('es-ES')}`;
        dayValueUI.textContent = gameState.day;
        footageValueUI.textContent = gameState.video.rawFootage;

        studyButton.disabled = gameState.energy < 20;
        computerButton.disabled = gameState.energy < 10;
        recordVideoButton.disabled = gameState.energy < 25;
        editVideoButton.disabled = gameState.video.rawFootage <= 0;
        uploadVideoButton.disabled = !gameState.video.editedVideo;
    }

    // --- ACCIONES PRINCIPALES ---
    function sleep() { if (gameState.energy === 100) { showNotification("Ya tienes la energía al máximo.", 'info'); return; } gameState.energy = 100; gameState.day += 1; showNotification("Duermes profundamente. ¡Comienza un nuevo día!", 'success'); updateUI(); saveGame(); }
    function study() { if (gameState.energy < 20) { showNotification("Estás demasiado cansado para estudiar.", 'error'); return; } gameState.energy -= 20; gameState.knowledge = Math.min(100, gameState.knowledge + 10); showNotification("Estudias un poco. ¡Conocimiento +10!", 'info'); updateUI(); }
    
    // --- LÓGICA DEL ORDENADOR ---
    function openComputer() { updateUI(); showModal('computer-modal'); }
    
    function openUpgradePcModal() { const currentLevel = gameState.pc.level, nextUpgrade = PC_UPGRADES.find(u => u.level === currentLevel + 1); const upgradeInfo = document.getElementById('upgrade-info'), buyBtn = document.getElementById('buy-upgrade-button'); if (nextUpgrade) { upgradeInfo.innerHTML = `<p>Nivel Actual: ${PC_UPGRADES[currentLevel - 1].name}</p><p>Próxima Mejora: <strong>${nextUpgrade.name}</strong></p><p>Costo: <strong>$${nextUpgrade.cost}</strong></p>`; buyBtn.textContent = `Comprar Mejora ($${nextUpgrade.cost})`; buyBtn.disabled = gameState.money < nextUpgrade.cost; } else { upgradeInfo.innerHTML = `<p>¡Ya tienes el mejor PC posible!</p>`; buyBtn.textContent = 'Máximo Nivel Alcanzado'; buyBtn.disabled = true; } showModal('upgrade-pc-modal'); }
    function buyUpgrade() { const nextUpgrade = PC_UPGRADES.find(u => u.level === gameState.pc.level + 1); if (nextUpgrade && gameState.money >= nextUpgrade.cost) { gameState.money -= nextUpgrade.cost; gameState.pc.level++; showNotification('¡PC mejorado con éxito!', 'success'); openUpgradePcModal(); saveGame(); } else { showNotification('No tienes suficiente dinero.', 'error'); } }
    
    function openShopModal() { const container = document.getElementById('shop-items-container'); container.innerHTML = ''; GAME_SHOP.forEach(game => { const owned = gameState.ownedGames.includes(game.id); const item = document.createElement('div'); item.className = 'shop-item'; item.innerHTML = `<div class="shop-item-info"><h4>${game.name}</h4><p>Costo: $${game.cost}</p></div><button class="action-btn" data-game-id="${game.id}" ${owned ? 'disabled' : ''}>${owned ? 'Comprado' : 'Comprar'}</button>`; container.appendChild(item); }); showModal('game-shop-modal'); }
    document.getElementById('shop-items-container').addEventListener('click', e => { if (e.target.tagName === 'BUTTON') { const gameId = e.target.dataset.gameId, game = GAME_SHOP.find(g => g.id === gameId); if (game && gameState.money >= game.cost) { gameState.money -= game.cost; gameState.ownedGames.push(game.id); showNotification(`¡Has comprado ${game.name}!`, 'success'); openShopModal(); saveGame(); } else { showNotification('Dinero insuficiente.', 'error'); } } });

    function openSelectGameModal() { if (gameState.ownedGames.length === 0) { showNotification('Necesitas comprar un juego primero.', 'info'); return; } const container = document.getElementById('owned-games-container'); container.innerHTML = ''; gameState.ownedGames.forEach(gameId => { const game = GAME_SHOP.find(g => g.id === gameId), item = document.createElement('div'); item.className = 'owned-game-item'; item.textContent = game.name; item.dataset.gameId = gameId; container.appendChild(item); }); showModal('select-game-modal'); }
    document.getElementById('owned-games-container').addEventListener('click', e => { if (e.target.classList.contains('owned-game-item')) { startRecordingSession(e.target.dataset.gameId); } });
    
    function startRecordingSession(gameId) { if (gameState.energy < 25) { showNotification('No tienes suficiente energía para grabar.', 'error'); return; } gameState.energy -= 25; updateUI(); showModal('recording-modal'); let progress = 0; recordingProgressBarUI.style.width = '0%'; const handleRecordClick = () => { progress += 5; recordingProgressBarUI.style.width = `${progress}%`; if (progress >= 100) { clickTarget.removeEventListener('click', handleRecordClick); closeModal(); const footageGained = 10 + Math.floor(PC_UPGRADES[gameState.pc.level - 1].recordBonus); gameState.video.rawFootage += footageGained; showNotification(`¡Grabación completada! Metraje +${footageGained}`, 'success'); updateUI(); saveGame(); } }; clickTarget.addEventListener('click', handleRecordClick); }
    
    function startEditingSession() { if (gameState.video.rawFootage <= 0) { showNotification('No tienes metraje para editar.', 'error'); return; } const energyCost = 15; if (gameState.energy < energyCost) { showNotification('No tienes energía para editar.', 'error'); return; } gameState.energy -= energyCost; const footageToEdit = gameState.video.rawFootage; gameState.video.rawFootage = 0; showModal('editing-modal'); const pcBonus = PC_UPGRADES[gameState.pc.level - 1].editSpeed, knowledgeBonus = 1 + (gameState.knowledge / 100); const editTime = 10 / (pcBonus * knowledgeBonus); let progress = 0, progressBar = document.getElementById('editing-progress-bar'); progressBar.style.width = '0%'; const interval = setInterval(() => { progress += 100 / (editTime * 10); progressBar.style.width = `${progress}%`; if (progress >= 100) { clearInterval(interval); gameState.video.editedVideo = { quality: Math.round(footageToEdit * knowledgeBonus * pcBonus) }; showNotification('¡Video editado!', 'success'); closeModal(); updateUI(); saveGame(); } }, 100); }
    
    function openUploadModal() { if (!gameState.video.editedVideo) { showNotification('No tienes un video editado para subir.', 'error'); return; } document.getElementById('video-title-input').value = ''; showModal('upload-video-modal'); }
    function uploadVideo() { const title = document.getElementById('video-title-input').value.trim(); if (title === '') { showNotification('El video necesita un título.', 'error'); return; } const video = gameState.video.editedVideo; const views = Math.floor(video.quality * (1 + Math.random())), subs = Math.floor(views / (100 - gameState.knowledge)), money = Math.round(views / 50); gameState.subscribers += subs; gameState.money += money; gameState.video.editedVideo = null; showNotification(`¡Video "${title}" subido! Ganaste ${views} vistas, ${subs} subs y $${money}.`, 'success'); closeModal(); updateUI(); saveGame(); }
    
    // --- INICIALIZACIÓN ---
    function init() {
        const urlParams = new URLSearchParams(window.location.search), slotId = parseInt(urlParams.get('slot'), 10);
        if (isNaN(slotId)) { showNotification("Ranura de guardado no especificada.", 'error'); window.location.href = 'menu.html'; return; }
        currentSlotId = slotId;
        loadGame(currentSlotId);

        if (gameState.isNew) { showModal('intro-modal'); } else { updateUI(); }

        startGameButton.addEventListener('click', () => { if (gameState.isNew) { gameState.isNew = false; saveGame(); } closeModal(); updateUI(); });
        sleepButton.addEventListener('click', sleep);
        studyButton.addEventListener('click', study);
        computerButton.addEventListener('click', openComputer);
        backToRoomButton.addEventListener('click', closeModal);
        upgradePcButton.addEventListener('click', openUpgradePcModal);
        buyUpgradeButton.addEventListener('click', buyUpgrade);
        buyGamesButton.addEventListener('click', openShopModal);
        recordVideoButton.addEventListener('click', openSelectGameModal);
        editVideoButton.addEventListener('click', startEditingSession);
        uploadVideoButton.addEventListener('click', openUploadModal);
        confirmUploadButton.addEventListener('click', uploadVideo);
        document.querySelectorAll('.modal-back-button').forEach(btn => btn.addEventListener('click', openComputer));
    }
    
    init();
};