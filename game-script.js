window.onload = () => {

    // --- CONSTANTES Y REFERENCIAS AL DOM ---
    const SAVE_KEY = 'dzmGameSaves', NUM_SLOTS = 3;
    const allModals = document.querySelectorAll('.modal-overlay');
    const notificationContainer = document.getElementById('notification-container');
    const energyValueUI = document.getElementById('energy-value'), energyBarUI = document.getElementById('energy-bar');
    const knowledgeValueUI = document.getElementById('knowledge-value'), knowledgeBarUI = document.getElementById('knowledge-bar');
    const subsValueUI = document.getElementById('subs-value'), moneyValueUI = document.getElementById('money-value');
    const dayValueUI = document.getElementById('day-value'), footageValueUI = document.getElementById('footage-value');
    
    // Modales
    const introModal = document.getElementById('intro-modal'), computerModal = document.getElementById('computer-modal'), recordingModal = document.getElementById('recording-modal'), editingModal = document.getElementById('editing-modal'), upgradePcModal = document.getElementById('upgrade-pc-modal'), gameShopModal = document.getElementById('game-shop-modal'), selectGameModal = document.getElementById('select-game-modal'), uploadVideoModal = document.getElementById('upload-video-modal'), workingModal = document.getElementById('working-modal'), examModal = document.getElementById('exam-modal');
    const playGamesModal = document.getElementById('play-games-modal'), snakeGameModal = document.getElementById('snake-game-modal'), penaltyGameModal = document.getElementById('penalty-game-modal');
    
    // Botones Principales
    const startGameButton = document.getElementById('start-game-button'), sleepButton = document.getElementById('sleep-button'), studyButton = document.getElementById('study-button'), computerButton = document.getElementById('computer-button'), workButton = document.getElementById('work-button'), playGamesButton = document.getElementById('play-games-button');
    
    // Botones de Modales
    const backToRoomButton = document.getElementById('back-to-room-button'), recordVideoButton = document.getElementById('record-video-button'), editVideoButton = document.getElementById('edit-video-button'), buyGamesButton = document.getElementById('buy-games-button'), upgradePcButton = document.getElementById('upgrade-pc-button'), uploadVideoButton = document.getElementById('upload-video-button');
    const buyUpgradeButton = document.getElementById('buy-upgrade-button'), confirmUploadButton = document.getElementById('confirm-upload-button');
    const closeExamModalButton = document.getElementById('close-exam-modal-button');
    const backToComputerButtonUpgrade = document.getElementById('back-to-computer-button-upgrade'), backToComputerButtonShop = document.getElementById('back-to-computer-button-shop'), backToComputerButtonSelect = document.getElementById('back-to-computer-button-select'), backToComputerButtonUpload = document.getElementById('back-to-computer-button-upload');
    const backToRoomFromPlaySelectButton = document.getElementById('back-to-room-from-play-select-button');
    const closeSnakeGameButton = document.getElementById('close-snake-game-button');

    // Elementos de Minijuegos
    const clickTarget = document.getElementById('click-target'), recordingProgressBarUI = document.getElementById('recording-progress-bar');
    const workClickTarget = document.getElementById('work-click-target'), workingProgressBarUI = document.getElementById('working-progress-bar');
    const examResultTextUI = document.getElementById('exam-result-text');
    const snakeCanvas = document.getElementById('snake-canvas'), snakeScoreUI = document.getElementById('snake-score'), snakeGameOverUI = document.getElementById('snake-game-over');
    const penaltyActionsContainer = document.getElementById('penalty-actions'), penaltyResultUI = document.getElementById('penalty-result');
    
    // --- DATOS DEL JUEGO ---
    const PC_UPGRADES = [ { level: 1, cost: 0, name: 'Patata PC', editSpeed: 1, recordBonus: 2 }, { level: 2, cost: 50, name: 'PC decente', editSpeed: 1.5, recordBonus: 5 }, { level: 3, cost: 250, name: 'Máquina de Gaming', editSpeed: 2.5, recordBonus: 10 }, ];
    const GAME_SHOP = [ { id: 'serpientePixelada', name: 'Serpiente Pixelada', cost: 10 }, { id: 'tiroDeGloria', name: 'Tiro de Gloria', cost: 15 }, ];

    let gameState = {}, currentSlotId = -1;
    let snakeGameInterval = null; // Variable para controlar el bucle del juego Snake

    // --- LÓGICA DE MODALES ---
    function showModal(modalId) { allModals.forEach(m => m.classList.add('hidden')); if (modalId) { const modal = document.getElementById(modalId); if (modal) modal.classList.remove('hidden'); } }
    function closeModal() { showModal(''); }

    // --- GUARDADO Y CARGA ---
    function createNewGameData() { return { isNew: true, date: new Date().toLocaleString('es-ES'), day: 1, energy: 100, knowledge: 0, subscribers: 0, money: 0, video: { rawFootage: 0, editedVideo: null }, pc: { level: 1 }, ownedGames: [] }; }
    function loadGame(slotId) { let allSavesText = localStorage.getItem(SAVE_KEY), allSaves = allSavesText ? JSON.parse(allSavesText) : Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null })); if (slotId >= 0 && slotId < allSaves.length) { let slot = allSaves[slotId]; if (slot.isEmpty) { slot.isEmpty = false; slot.data = createNewGameData(); localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves)); } gameState = slot.data; } else { showNotification("Error: Ranura de guardado no válida.", 'error'); window.location.href = 'menu.html'; } }
    function saveGame() { let allSavesText = localStorage.getItem(SAVE_KEY), allSaves = allSavesText ? JSON.parse(allSavesText) : Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null })); if (currentSlotId >= 0 && currentSlotId < allSaves.length) { allSaves[currentSlotId].data = gameState; allSaves[currentSlotId].isEmpty = false; localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves)); } }

    // --- SISTEMA DE NOTIFICACIONES ---
    function showNotification(message, type = 'info') { const notif = document.createElement('div'); notif.className = `notification ${type}`; notif.textContent = message; notificationContainer.appendChild(notif); setTimeout(() => notif.remove(), 4500); }

    // --- ACTUALIZACIÓN DE UI ---
    function updateUI() {
        energyValueUI.textContent = `${gameState.energy} / 100`; energyBarUI.style.width = `${gameState.energy}%`;
        knowledgeValueUI.textContent = `${gameState.knowledge} / 100`; knowledgeBarUI.style.width = `${gameState.knowledge}%`;
        subsValueUI.textContent = gameState.subscribers.toLocaleString('es-ES');
        moneyValueUI.textContent = `$${gameState.money.toLocaleString('es-ES')}`;
        dayValueUI.textContent = gameState.day;
        footageValueUI.textContent = gameState.video.rawFootage;

        studyButton.disabled = gameState.energy < 35 || gameState.knowledge >= 100;
        workButton.disabled = gameState.energy < 15;
        playGamesButton.disabled = gameState.energy < 5;
        computerButton.disabled = gameState.energy < 10;
        recordVideoButton.disabled = gameState.energy < 25;
        editVideoButton.disabled = gameState.video.rawFootage <= 0;
        uploadVideoButton.disabled = !gameState.video.editedVideo;
    }

    // --- ACCIONES PRINCIPALES ---
    function sleep() { if (gameState.energy === 100) { showNotification("Ya tienes la energía al máximo.", 'info'); return; } gameState.day += 1; if (gameState.day > 1 && gameState.day % 5 === 0) { triggerExam(); } else { gameState.energy = 100; showNotification("Duermes profundamente. ¡Comienza un nuevo día!", 'success'); updateUI(); saveGame(); } }
    function study() { const energyCost = 35; if (gameState.knowledge >= 100) { showNotification("Tu conocimiento ya está al máximo.", 'info'); return; } if (gameState.energy < energyCost) { showNotification("Estás demasiado cansado para estudiar.", 'error'); return; } gameState.energy -= energyCost; gameState.knowledge = Math.min(100, gameState.knowledge + 10); showNotification("Estudias intensamente. ¡Conocimiento +10!", 'info'); updateUI(); saveGame(); }
    function work() { const energyCost = 15; if (gameState.energy < energyCost) { showNotification("No tienes suficiente energía para trabajar.", 'error'); return; } gameState.energy -= energyCost; updateUI(); showModal('working-modal'); let progress = 0; workingProgressBarUI.style.width = '0%'; const handleWorkClick = () => { progress += 5; workingProgressBarUI.style.width = `${progress}%`; if (progress >= 100) { workClickTarget.removeEventListener('click', handleWorkClick); closeModal(); const moneyEarned = 5; gameState.money += moneyEarned; showNotification(`¡Trabajo completado! Ganaste $${moneyEarned}.`, 'success'); updateUI(); saveGame(); } }; workClickTarget.addEventListener('click', handleWorkClick); }
    
    // --- LÓGICA DE JUGAR VIDEOJUEGOS ---
    function openPlayGamesModal() {
        if (gameState.ownedGames.length === 0) { showNotification('Necesitas comprar un juego primero.', 'info'); return; }
        const container = document.getElementById('owned-games-to-play-container'); container.innerHTML = '';
        gameState.ownedGames.forEach(gameId => { const game = GAME_SHOP.find(g => g.id === gameId), item = document.createElement('div'); item.className = 'owned-game-item'; item.textContent = game.name; item.dataset.gameId = gameId; container.appendChild(item); });
        showModal('play-games-modal');
    }
    document.getElementById('owned-games-to-play-container').addEventListener('click', e => { if (e.target.classList.contains('owned-game-item')) { const gameId = e.target.dataset.gameId; if (gameState.energy < 5) { showNotification('No tienes energía ni para jugar.', 'error'); return; } gameState.energy -= 5; updateUI(); if (gameId === 'serpientePixelada') { startSnakeGame(); } else if (gameId === 'tiroDeGloria') { startPenaltyGame(); } } });
    
    // --- LÓGICA DEL EXAMEN ---
    function triggerExam() { let resultMessage = ''; if (gameState.knowledge >= 100) { const bonus = 20; gameState.money += bonus; resultMessage = `¡EXCELENTE! Has dominado la materia. Recibes un bono de $${bonus}.`; } else if (gameState.knowledge >= 60) { resultMessage = `APROBADO. Has pasado el examen, pero puedes mejorar.`; } else { const fee = 15; const amountPaid = Math.min(fee, gameState.money); gameState.money -= amountPaid; resultMessage = `DESAPROBADO. Necesitas esforzarte más. Pagas una multa de $${amountPaid}.`; } examResultTextUI.textContent = resultMessage; showModal('exam-modal'); }

    // --- LÓGICA DEL ORDENADOR ---
    function openComputer() { updateUI(); showModal('computer-modal'); }
    function openUpgradePcModal() { const currentLevel = gameState.pc.level; const currentUpgrade = PC_UPGRADES[currentLevel - 1]; const nextUpgrade = PC_UPGRADES.find(u => u.level === currentLevel + 1); const upgradeInfo = document.getElementById('upgrade-info'), buyBtn = document.getElementById('buy-upgrade-button'); if (nextUpgrade) { upgradeInfo.innerHTML = `<p>Nivel Actual: ${currentUpgrade.name}</p><p>Próxima Mejora: <strong>${nextUpgrade.name}</strong></p><p>Costo: <strong>$${nextUpgrade.cost}</strong></p><p style="color: var(--bar-energy);">Beneficios: Edita videos más rápido y graba metraje de mayor calidad.</p>`; buyBtn.textContent = `Comprar Mejora ($${nextUpgrade.cost})`; buyBtn.disabled = gameState.money < nextUpgrade.cost; } else { upgradeInfo.innerHTML = `<p>¡Ya tienes el mejor PC posible!</p><p>Nivel Actual: ${currentUpgrade.name}</p>`; buyBtn.textContent = 'Máximo Nivel Alcanzado'; buyBtn.disabled = true; } showModal('upgrade-pc-modal'); }
    function buyUpgrade() { const nextUpgrade = PC_UPGRADES.find(u => u.level === gameState.pc.level + 1); if (nextUpgrade && gameState.money >= nextUpgrade.cost) { gameState.money -= nextUpgrade.cost; gameState.pc.level++; showNotification('¡PC mejorado con éxito!', 'success'); openUpgradePcModal(); saveGame(); } else { showNotification('No tienes suficiente dinero.', 'error'); } }
    function openShopModal() { const container = document.getElementById('shop-items-container'); container.innerHTML = ''; GAME_SHOP.forEach(game => { const owned = gameState.ownedGames.includes(game.id); const item = document.createElement('div'); item.className = 'shop-item'; item.innerHTML = `<div class="shop-item-info"><h4>${game.name}</h4><p>Costo: $${game.cost}</p></div><button class="action-btn" data-game-id="${game.id}" ${owned ? 'disabled' : ''}>${owned ? 'Comprado' : 'Comprar'}</button>`; container.appendChild(item); }); showModal('game-shop-modal'); }
    document.getElementById('shop-items-container').addEventListener('click', e => { if (e.target.tagName === 'BUTTON') { const gameId = e.target.dataset.gameId, game = GAME_SHOP.find(g => g.id === gameId); if (game && gameState.money >= game.cost) { gameState.money -= game.cost; gameState.ownedGames.push(game.id); showNotification(`¡Has comprado ${game.name}!`, 'success'); openShopModal(); saveGame(); } else { showNotification('Dinero insuficiente.', 'error'); } } });
    function openSelectGameModal() { if (gameState.ownedGames.length === 0) { showNotification('Necesitas comprar un juego primero.', 'info'); return; } const container = document.getElementById('owned-games-container'); container.innerHTML = ''; gameState.ownedGames.forEach(gameId => { const game = GAME_SHOP.find(g => g.id === gameId), item = document.createElement('div'); item.className = 'owned-game-item'; item.textContent = game.name; item.dataset.gameId = gameId; container.appendChild(item); }); showModal('select-game-modal'); }
    document.getElementById('owned-games-container').addEventListener('click', e => { if (e.target.classList.contains('owned-game-item')) { startRecordingSession(e.target.dataset.gameId); } });
    function startRecordingSession(gameId) { if (gameState.energy < 25) { showNotification('No tienes suficiente energía para grabar.', 'error'); return; } gameState.energy -= 25; updateUI(); showModal('recording-modal'); let progress = 0; recordingProgressBarUI.style.width = '0%'; const handleRecordClick = () => { progress += 5; recordingProgressBarUI.style.width = `${progress}%`; if (progress >= 100) { clickTarget.removeEventListener('click', handleRecordClick); closeModal(); const footageGained = 10 + Math.floor(PC_UPGRADES[gameState.pc.level - 1].recordBonus); gameState.video.rawFootage += footageGained; showNotification(`¡Grabación completada! Metraje +${footageGained}`, 'success'); updateUI(); saveGame(); } }; clickTarget.addEventListener('click', handleRecordClick); }
    function startEditingSession() { if (gameState.video.rawFootage <= 0) { showNotification('No tienes metraje para editar.', 'error'); return; } const energyCost = 15; if (gameState.energy < energyCost) { showNotification('No tienes energía para editar.', 'error'); return; } gameState.energy -= energyCost; const footageToEdit = gameState.video.rawFootage; gameState.video.rawFootage = 0; showModal('editing-modal'); const pcBonus = PC_UPGRADES[gameState.pc.level - 1].editSpeed, knowledgeBonus = 1 + (gameState.knowledge / 100); const editTime = 10 / (pcBonus * knowledgeBonus); let progress = 0, progressBar = document.getElementById('editing-progress-bar'); progressBar.style.width = '0%'; const interval = setInterval(() => { progress += 100 / (editTime * 10); progressBar.style.width = `${progress}%`; if (progress >= 100) { clearInterval(interval); gameState.video.editedVideo = { quality: Math.round(footageToEdit * knowledgeBonus * pcBonus) }; showNotification('¡Video editado!', 'success'); closeModal(); updateUI(); saveGame(); } }, 100); }
    function openUploadModal() { if (!gameState.video.editedVideo) { showNotification('No tienes un video editado para subir.', 'error'); return; } document.getElementById('video-title-input').value = ''; showModal('upload-video-modal'); }
    function uploadVideo() { const title = document.getElementById('video-title-input').value.trim(); if (title === '') { showNotification('El video necesita un título.', 'error'); return; } const video = gameState.video.editedVideo; const views = Math.floor(video.quality * (1 + Math.random())), subs = Math.floor(views / (100 - gameState.knowledge)), money = Math.round(views / 50); gameState.subscribers += subs; gameState.money += money; gameState.video.editedVideo = null; showNotification(`¡Video "${title}" subido! Ganaste ${views} vistas, ${subs} subs y $${money}.`, 'success'); closeModal(); updateUI(); saveGame(); }

    // --- LÓGICA MINIJUEGOS ---
    function awardPlayBonus() { const energyGained = 10; gameState.energy = Math.min(100, gameState.energy + energyGained); showNotification(`¡Te has divertido! Energía +${energyGained}`, 'success'); updateUI(); saveGame(); }

    function startPenaltyGame() {
        showModal('penalty-game-modal');
        penaltyResultUI.textContent = '';
        const buttons = penaltyActionsContainer.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = false);

        const handleShot = (e) => {
            buttons.forEach(btn => btn.disabled = true);
            const shot = e.target.dataset.shot;
            const success = Math.random() > 0.4; // 60% de probabilidad de marcar
            if (success) {
                penaltyResultUI.textContent = "¡¡¡GOOOOL!!!";
                penaltyResultUI.style.color = 'var(--bar-energy)';
            } else {
                penaltyResultUI.textContent = "¡PARADO POR EL PORTERO!";
                penaltyResultUI.style.color = 'var(--accent-color)';
            }
            setTimeout(() => { closeModal(); awardPlayBonus(); }, 2000);
        };
        buttons.forEach(btn => { btn.onclick = handleShot; });
    }

    function startSnakeGame() {
        showModal('snake-game-modal');
        const ctx = snakeCanvas.getContext('2d');
        const gridSize = 20;
        let snake = [{ x: 10, y: 10 }];
        let food = {};
        let score = 0;
        let direction = 'right';
        let isGameOver = false;

        function generateFood() { food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; }
        function drawRect(x, y, color) { ctx.fillStyle = color; ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize); }
        
        function updateGame() {
            if (isGameOver) { clearInterval(snakeGameInterval); snakeGameOverUI.classList.remove('hidden'); return; }
            ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
            let head = { x: snake[0].x, y: snake[0].y };
            if (direction === 'right') head.x++; else if (direction === 'left') head.x--; else if (direction === 'up') head.y--; else if (direction === 'down') head.y++;
            if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || snake.some(segment => segment.x === head.x && segment.y === head.y)) { isGameOver = true; }
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) { score++; snakeScoreUI.textContent = score; generateFood(); } else { snake.pop(); }
            drawRect(food.x, food.y, 'var(--accent-color)');
            snake.forEach(segment => drawRect(segment.x, segment.y, 'var(--bar-energy)'));
        }

        function changeDirection(e) {
            const key = e.key;
            if ((key === 'ArrowUp' || key === 'w') && direction !== 'down') direction = 'up';
            else if ((key === 'ArrowDown' || key === 's') && direction !== 'up') direction = 'down';
            else if ((key === 'ArrowLeft' || key === 'a') && direction !== 'right') direction = 'left';
            else if ((key === 'ArrowRight' || key === 'd') && direction !== 'left') direction = 'right';
        }

        snakeGameOverUI.classList.add('hidden');
        snakeScoreUI.textContent = 0;
        generateFood();
        document.addEventListener('keydown', changeDirection);
        snakeGameInterval = setInterval(updateGame, 150);
    }
    
    // --- INICIALIZACIÓN ---
    function init() {
        const urlParams = new URLSearchParams(window.location.search), slotId = parseInt(urlParams.get('slot'), 10);
        if (isNaN(slotId)) { showNotification("Ranura de guardado no especificada.", 'error'); window.location.href = 'menu.html'; return; }
        currentSlotId = slotId;
        loadGame(currentSlotId);

        if (gameState.isNew) { showModal('intro-modal'); } else { updateUI(); }

        // Acciones principales
        startGameButton.addEventListener('click', () => { if (gameState.isNew) { gameState.isNew = false; saveGame(); } closeModal(); updateUI(); });
        sleepButton.addEventListener('click', sleep);
        studyButton.addEventListener('click', study);
        workButton.addEventListener('click', work);
        playGamesButton.addEventListener('click', openPlayGamesModal);
        computerButton.addEventListener('click', openComputer);
        
        // Acciones dentro del ordenador y otros modales
        recordVideoButton.addEventListener('click', openSelectGameModal);
        editVideoButton.addEventListener('click', startEditingSession);
        uploadVideoButton.addEventListener('click', openUploadModal);
        buyGamesButton.addEventListener('click', openShopModal);
        upgradePcButton.addEventListener('click', openUpgradePcModal);
        buyUpgradeButton.addEventListener('click', buyUpgrade);
        confirmUploadButton.addEventListener('click', uploadVideo);

        // Botones de cierre y "Volver"
        closeExamModalButton.addEventListener('click', () => { closeModal(); gameState.energy = 100; gameState.knowledge = 0; showNotification("Comienza un nuevo día, con nuevas lecciones.", 'info'); updateUI(); saveGame(); });
        backToRoomButton.addEventListener('click', closeModal); 
        backToComputerButtonUpgrade.addEventListener('click', openComputer);
        backToComputerButtonShop.addEventListener('click', openComputer);
        backToComputerButtonSelect.addEventListener('click', openComputer);
        backToComputerButtonUpload.addEventListener('click', openComputer);
        backToRoomFromPlaySelectButton.addEventListener('click', closeModal);
        closeSnakeGameButton.addEventListener('click', () => { if(snakeGameInterval) clearInterval(snakeGameInterval); closeModal(); awardPlayBonus(); });
    }
    
    init();
};