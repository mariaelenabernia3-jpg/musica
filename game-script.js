window.onload = () => {

    // --- CONSTANTES Y REFERENCIAS AL DOM ---
    const SAVE_KEY = 'dzmGameSaves', NUM_SLOTS = 3;
    const allModals = document.querySelectorAll('.modal-overlay');
    const notificationContainer = document.getElementById('notification-container');
    const energyValueUI = document.getElementById('energy-value'), energyBarUI = document.getElementById('energy-bar');
    const knowledgeValueUI = document.getElementById('knowledge-value'), knowledgeBarUI = document.getElementById('knowledge-bar');
    const subsValueUI = document.getElementById('subs-value'), moneyValueUI = document.getElementById('money-value');
    const dayValueUI = document.getElementById('day-value'), footageValueUI = document.getElementById('footage-value');
    const channelNameDisplay = document.getElementById('channel-name-display');
    const storyModal = document.getElementById('story-modal'), storyTitle = document.getElementById('story-title'), storyText = document.getElementById('story-text'), nextStoryBtn = document.getElementById('next-story-btn');
    const narrationText = document.getElementById('narration-text'); // NARRADOR
    
    // Modales y Botones (el resto de referencias)
    const introModal = document.getElementById('intro-modal'), computerModal = document.getElementById('computer-modal'), recordingModal = document.getElementById('recording-modal'), editingModal = document.getElementById('editing-modal'), upgradePcModal = document.getElementById('upgrade-pc-modal'), gameShopModal = document.getElementById('game-shop-modal'), selectGameModal = document.getElementById('select-game-modal'), uploadVideoModal = document.getElementById('upload-video-modal'), workingModal = document.getElementById('working-modal'), examModal = document.getElementById('exam-modal'), leaderboardModal = document.getElementById('leaderboard-modal');
    const playGamesModal = document.getElementById('play-games-modal'), snakeGameModal = document.getElementById('snake-game-modal'), penaltyGameModal = document.getElementById('penalty-game-modal');
    const startGameButton = document.getElementById('start-game-button'), sleepButton = document.getElementById('sleep-button'), studyButton = document.getElementById('study-button'), computerButton = document.getElementById('computer-button'), workButton = document.getElementById('work-button'), playGamesButton = document.getElementById('play-games-button');
    const backToRoomButton = document.getElementById('back-to-room-button'), recordVideoButton = document.getElementById('record-video-button'), editVideoButton = document.getElementById('edit-video-button'), buyGamesButton = document.getElementById('buy-games-button'), upgradePcButton = document.getElementById('upgrade-pc-button'), uploadVideoButton = document.getElementById('upload-video-button'), leaderboardButton = document.getElementById('leaderboard-button');
    const buyUpgradeButton = document.getElementById('buy-upgrade-button'), confirmUploadButton = document.getElementById('confirm-upload-button');
    const closeExamModalButton = document.getElementById('close-exam-modal-button');
    const backToComputerButtonUpgrade = document.getElementById('back-to-computer-button-upgrade'), backToComputerButtonShop = document.getElementById('back-to-computer-button-shop'), backToComputerButtonSelect = document.getElementById('back-to-computer-button-select'), backToComputerButtonUpload = document.getElementById('back-to-computer-button-upload'), backToComputerButtonLeaderboard = document.getElementById('back-to-computer-button-leaderboard');
    const backToRoomFromPlaySelectButton = document.getElementById('back-to-room-from-play-select-button');
    const closeSnakeGameButton = document.getElementById('close-snake-game-button');
    const clickTarget = document.getElementById('click-target'), recordingProgressBarUI = document.getElementById('recording-progress-bar');
    const workClickTarget = document.getElementById('work-click-target'), workingProgressBarUI = document.getElementById('working-progress-bar');
    const examResultTextUI = document.getElementById('exam-result-text');
    const snakeCanvas = document.getElementById('snake-canvas'), snakeScoreUI = document.getElementById('snake-score'), snakeGameOverUI = document.getElementById('snake-game-over');
    const penaltyActionsContainer = document.getElementById('penalty-actions'), penaltyResultUI = document.getElementById('penalty-result');
    
    // --- DATOS DEL JUEGO ---
    const PC_UPGRADES = [ { level: 1, cost: 0, name: 'Patata PC', editSpeed: 1, recordBonus: 2 }, { level: 2, cost: 50, name: 'PC decente', editSpeed: 1.5, recordBonus: 5 }, { level: 3, cost: 250, name: 'Máquina de Gaming', editSpeed: 2.5, recordBonus: 10 }, ];
    const GAME_SHOP = [ { id: 'serpientePixelada', name: 'Serpiente Pixelada', cost: 10 }, { id: 'tiroDeGloria', name: 'Tiro de Gloria', cost: 15 }, { id: 'pixelCraft', name: 'PixelCraft', cost: 40 }, ];
    const RIVAL_CHANNELS = [ { name: 'GamerPro', subs: 500 }, { name: 'PixelPlayz', subs: 2500 }, { name: 'RetroRewind', subs: 12000 }, { name: 'LaZonaNerd', subs: 55000 }, { name: 'ComandoGaming', subs: 150000 }, { name: 'ViewTubeStar', subs: 500000 }, { name: 'ElReyDelGameplay', subs: 1000000 }, ];

    let gameState = {}, currentSlotId = -1;
    let snakeGameInterval = null;

    // --- HISTORIA DE INTRODUCCIÓN ---
    const STORY_STAGES = [
        { title: "El Comienzo de un Sueño", text: 'Desde que eras un niño, te quedabas horas viendo videos en ViewTube. Te fascinaba cómo una persona podía entretener y conectar con millones...' },
        { title: "La Inspiración", text: 'Un día, viendo a tu ídolo "ElReyDelGameplay", pensaste: "Yo también quiero hacer eso. Quiero crear, divertir y construir mi propia comunidad".' },
        { title: "Tu Oportunidad", text: 'Con tus ahorros y la ayuda de tus padres, has conseguido un equipo básico. Es hora de dejar de soñar y empezar a crear. ¡Tu aventura como YouTuber comienza ahora!' }
    ];
    let currentStoryIndex = 0;

    // --- LÓGICA DE MODALES ---
    function showModal(modalId) { allModals.forEach(m => m.classList.add('hidden')); if (modalId) { const modal = document.getElementById(modalId); if (modal) modal.classList.remove('hidden'); } }
    function closeModal() { showModal(''); }

    // --- NUEVA FUNCIÓN DE NARRACIÓN ---
    function narrateAction(message) {
        narrationText.innerHTML = message;
    }

    // --- GUARDADO Y CARGA ---
    function createNewGameData() { return { isNew: true, channelName: "Mi Canal", date: new Date().toLocaleString('es-ES'), day: 1, energy: 100, knowledge: 0, subscribers: 0, money: 20, video: { rawFootage: 0, editedVideo: null }, pc: { level: 1 }, ownedGames: [], pixelCraft: null }; }
    function loadGame(slotId) { let allSavesText = localStorage.getItem(SAVE_KEY), allSaves = allSavesText ? JSON.parse(allSavesText) : Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null })); if (slotId >= 0 && slotId < allSaves.length) { let slot = allSaves[slotId]; if (slot.isEmpty) { slot.isEmpty = false; slot.data = createNewGameData(); localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves)); } gameState = slot.data; if (!gameState.channelName) gameState.channelName = "Mi Canal"; } else { showNotification("Error: Ranura de guardado no válida.", 'error'); window.location.href = 'menu.html'; } }
    function saveGame() { let allSavesText = localStorage.getItem(SAVE_KEY), allSaves = allSavesText ? JSON.parse(allSavesText) : Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null })); if (currentSlotId >= 0 && currentSlotId < allSaves.length) { allSaves[currentSlotId].data = gameState; allSaves[currentSlotId].isEmpty = false; localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves)); } }

    // --- SISTEMA DE NOTIFICACIONES ---
    function showNotification(message, type = 'info') { const notif = document.createElement('div'); notif.className = `notification ${type}`; notif.textContent = message; notificationContainer.appendChild(notif); setTimeout(() => notif.remove(), 4500); }

    // --- ACTUALIZACIÓN DE UI ---
    function updateUI() {
        channelNameDisplay.textContent = gameState.channelName;
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
    function sleep() { 
        if (gameState.energy === 100) { 
            showNotification("Ya tienes la energía al máximo.", 'info'); 
            return; 
        } 
        // Narración
        narrateAction("Te metes en la cama y el mundo se desvanece. Mañana será un nuevo día para seguir tu sueño.");
        gameState.day += 1; 
        if (gameState.day > 1 && gameState.day % 5 === 0) { 
            triggerExam(); 
        } else { 
            gameState.energy = 100; 
            showNotification("Duermes profundamente. ¡Comienza un nuevo día!", 'success'); 
            updateUI(); 
            saveGame(); 
        } 
    }

    function study() { 
        const energyCost = 35; 
        if (gameState.knowledge >= 100) { showNotification("Tu conocimiento ya está al máximo.", 'info'); return; } 
        if (gameState.energy < energyCost) { showNotification("Estás demasiado cansado para estudiar.", 'error'); return; } 
        // Narración
        narrateAction("Te sientas en tu escritorio, rodeado de libros y tutoriales. Cada página te acerca más a entender cómo triunfar en ViewTube.");
        gameState.energy -= energyCost; 
        gameState.knowledge = Math.min(100, gameState.knowledge + 10); 
        showNotification("Estudias intensamente. ¡Conocimiento +10!", 'info'); 
        updateUI(); 
        saveGame(); 
    }

    function work() { 
        const energyCost = 15; 
        if (gameState.energy < energyCost) { showNotification("No tienes suficiente energía para trabajar.", 'error'); return; } 
        // Narración
        narrateAction("Sales de casa para tu trabajo de media jornada. No es glamuroso, pero paga las facturas y financia tu sueño de ser YouTuber.");
        gameState.energy -= energyCost; 
        updateUI(); 
        showModal('working-modal'); 
        let progress = 0; 
        workingProgressBarUI.style.width = '0%'; 
        const handleWorkClick = () => { 
            progress += 5; 
            workingProgressBarUI.style.width = `${progress}%`; 
            if (progress >= 100) { 
                workClickTarget.removeEventListener('click', handleWorkClick); 
                closeModal(); 
                const moneyEarned = 5; 
                gameState.money += moneyEarned; 
                showNotification(`¡Trabajo completado! Ganaste $${moneyEarned}.`, 'success'); 
                updateUI(); 
                saveGame(); 
            } 
        }; 
        workClickTarget.addEventListener('click', handleWorkClick); 
    }
    
    // --- LÓGICA DE JUGAR VIDEOJUEGOS ---
    function handleGameSelection(gameId, isRecording) {
        const energyCost = isRecording ? 25 : 5;
        if (gameState.energy < energyCost) { showNotification(isRecording ? 'No tienes suficiente energía para grabar.' : 'No tienes energía ni para jugar.', 'error'); return; }
        
        if (!isRecording) {
            // Narración
            narrateAction("Decides tomarte un descanso y disfrutar de uno de tus videojuegos favoritos. ¡Incluso los futuros YouTubers necesitan relajarse!");
        }
        
        gameState.energy -= energyCost;
        updateUI();

        if (gameId === 'pixelCraft') { saveGame(); window.location.href = `pixelcraft.html?slot=${currentSlotId}&recording=${isRecording}`; return; }
        switch (gameId) {
            case 'serpientePixelada': startSnakeGame(); break;
            case 'tiroDeGloria': startPenaltyGame(); break;
        }
    }

    function openPlayGamesModal() { if (gameState.ownedGames.length === 0) { showNotification('Necesitas comprar un juego primero.', 'info'); return; } const container = document.getElementById('owned-games-to-play-container'); container.innerHTML = ''; gameState.ownedGames.forEach(gameId => { const game = GAME_SHOP.find(g => g.id === gameId), item = document.createElement('div'); item.className = 'owned-game-item'; item.textContent = game.name; item.dataset.gameId = gameId; container.appendChild(item); }); showModal('play-games-modal'); }
    document.getElementById('owned-games-to-play-container').addEventListener('click', e => { if (e.target.classList.contains('owned-game-item')) { handleGameSelection(e.target.dataset.gameId, false); } });
    
    // --- LÓGICA DEL EXAMEN ---
    function triggerExam() { let resultMessage = ''; if (gameState.knowledge >= 100) { const bonus = 20; gameState.money += bonus; resultMessage = `¡EXCELENTE! Has dominado la materia. Recibes un bono de $${bonus}.`; } else if (gameState.knowledge >= 60) { resultMessage = `APROBADO. Has pasado el examen, pero puedes mejorar.`; } else { const fee = 15; const amountPaid = Math.min(fee, gameState.money); gameState.money -= amountPaid; resultMessage = `DESAPROBADO. Necesitas esforzarte más. Pagas una multa de $${amountPaid}.`; } examResultTextUI.textContent = resultMessage; showModal('exam-modal'); }

    // --- LÓGICA DEL ORDENADOR ---
    function openComputer() { 
        // Narración
        narrateAction("Te sientas frente a tu ordenador, el centro de operaciones de tu futuro imperio en ViewTube. ¿Qué harás ahora?");
        updateUI(); 
        showModal('computer-modal'); 
    }

    function openUpgradePcModal() { const currentLevel = gameState.pc.level; const currentUpgrade = PC_UPGRADES[currentLevel - 1]; const nextUpgrade = PC_UPGRADES.find(u => u.level === currentLevel + 1); const upgradeInfo = document.getElementById('upgrade-info'), buyBtn = document.getElementById('buy-upgrade-button'); if (nextUpgrade) { upgradeInfo.innerHTML = `<p>Nivel Actual: ${currentUpgrade.name}</p><p>Próxima Mejora: <strong>${nextUpgrade.name}</strong></p><p>Costo: <strong>$${nextUpgrade.cost}</strong></p><p style="color: var(--bar-energy);">Beneficios: Edita videos más rápido y graba metraje de mayor calidad.</p>`; buyBtn.textContent = `Comprar Mejora ($${nextUpgrade.cost})`; buyBtn.disabled = gameState.money < nextUpgrade.cost; } else { upgradeInfo.innerHTML = `<p>¡Ya tienes el mejor PC posible!</p><p>Nivel Actual: ${currentUpgrade.name}</p>`; buyBtn.textContent = 'Máximo Nivel Alcanzado'; buyBtn.disabled = true; } showModal('upgrade-pc-modal'); }
    function buyUpgrade() { const nextUpgrade = PC_UPGRADES.find(u => u.level === gameState.pc.level + 1); if (nextUpgrade && gameState.money >= nextUpgrade.cost) { gameState.money -= nextUpgrade.cost; gameState.pc.level++; showNotification('¡PC mejorado con éxito!', 'success'); openUpgradePcModal(); saveGame(); } else { showNotification('No tienes suficiente dinero.', 'error'); } }
    function openShopModal() { const container = document.getElementById('shop-items-container'); container.innerHTML = ''; GAME_SHOP.forEach(game => { const owned = gameState.ownedGames.includes(game.id); const item = document.createElement('div'); item.className = 'shop-item'; item.innerHTML = `<div class="shop-item-info"><h4>${game.name}</h4><p>Costo: $${game.cost}</p></div><button class="action-btn" data-game-id="${game.id}" ${owned ? 'disabled' : ''}>${owned ? 'Comprado' : 'Comprar'}</button>`; container.appendChild(item); }); showModal('game-shop-modal'); }
    document.getElementById('shop-items-container').addEventListener('click', e => { if (e.target.tagName === 'BUTTON') { const gameId = e.target.dataset.gameId, game = GAME_SHOP.find(g => g.id === gameId); if (game && gameState.money >= game.cost) { gameState.money -= game.cost; gameState.ownedGames.push(game.id); showNotification(`¡Has comprado ${game.name}!`, 'success'); openShopModal(); saveGame(); } else { showNotification('Dinero insuficiente.', 'error'); } } });
    function openSelectGameModal() { if (gameState.ownedGames.length === 0) { showNotification('Necesitas comprar un juego primero.', 'info'); return; } const container = document.getElementById('owned-games-container'); container.innerHTML = ''; gameState.ownedGames.forEach(gameId => { const game = GAME_SHOP.find(g => g.id === gameId), item = document.createElement('div'); item.className = 'owned-game-item'; item.textContent = game.name; item.dataset.gameId = gameId; container.appendChild(item); }); showModal('select-game-modal'); }
    document.getElementById('owned-games-container').addEventListener('click', e => { if (e.target.classList.contains('owned-game-item')) { const gameId = e.target.dataset.gameId; if (gameId === 'pixelCraft') { handleGameSelection(gameId, true); } else { startRecordingSession(gameId); } } });

    function openLeaderboardModal() { const leaderboardBody = document.getElementById('leaderboard-body'); leaderboardBody.innerHTML = ''; const allChannels = [...RIVAL_CHANNELS, { name: gameState.channelName, subs: gameState.subscribers, isPlayer: true }]; allChannels.sort((a, b) => b.subs - a.subs); allChannels.forEach((channel, index) => { const tr = document.createElement('tr'); if (channel.isPlayer) { tr.className = 'player-row'; } tr.innerHTML = `<td>${index + 1}</td><td>${channel.name}</td><td>${channel.subs.toLocaleString('es-ES')}</td>`; leaderboardBody.appendChild(tr); }); showModal('leaderboard-modal'); }
    function startRecordingSession(gameId) { 
        if (gameState.energy < 25) { showNotification('No tienes suficiente energía para grabar.', 'error'); return; } 
        // Narración
        narrateAction("Enciendes la cámara y el micrófono. ¡Es hora de grabar! La luz roja parpadea, indicando que la magia está a punto de comenzar.");
        gameState.energy -= 25; 
        updateUI(); 
        showModal('recording-modal'); 
        let progress = 0; 
        recordingProgressBarUI.style.width = '0%'; 
        const handleRecordClick = () => { 
            progress += 5; 
            recordingProgressBarUI.style.width = `${progress}%`; 
            if (progress >= 100) { 
                clickTarget.removeEventListener('click', handleRecordClick); 
                closeModal(); 
                const footageGained = 10 + Math.floor(PC_UPGRADES[gameState.pc.level - 1].recordBonus); 
                gameState.video.rawFootage += footageGained; 
                showNotification(`¡Grabación completada! Metraje +${footageGained}`, 'success'); 
                updateUI(); 
                saveGame(); 
            } 
        }; 
        clickTarget.addEventListener('click', handleRecordClick); 
    }

    function startEditingSession() { 
        if (gameState.video.rawFootage <= 0) { showNotification('No tienes metraje para editar.', 'error'); return; } 
        const energyCost = 15; 
        if (gameState.energy < energyCost) { showNotification('No tienes energía para editar.', 'error'); return; } 
        // Narración
        narrateAction("Importas todo el metraje en bruto. Ahora empieza la verdadera magia: cortar, añadir música y efectos para crear el video perfecto.");
        gameState.energy -= energyCost; 
        const footageToEdit = gameState.video.rawFootage; 
        gameState.video.rawFootage = 0; 
        showModal('editing-modal'); 
        const pcBonus = PC_UPGRADES[gameState.pc.level - 1].editSpeed, knowledgeBonus = 1 + (gameState.knowledge / 100); 
        const editTime = 10 / (pcBonus * knowledgeBonus); 
        let progress = 0, progressBar = document.getElementById('editing-progress-bar'); 
        progressBar.style.width = '0%'; 
        const interval = setInterval(() => { 
            progress += 100 / (editTime * 10); 
            progressBar.style.width = `${progress}%`; 
            if (progress >= 100) { 
                clearInterval(interval); 
                gameState.video.editedVideo = { quality: Math.round(footageToEdit * knowledgeBonus * pcBonus) }; 
                showNotification('¡Video editado!', 'success'); 
                closeModal(); 
                updateUI(); 
                saveGame(); 
            } 
        }, 100); 
    }

    function openUploadModal() { if (!gameState.video.editedVideo) { showNotification('No tienes un video editado para subir.', 'error'); return; } document.getElementById('video-title-input').value = ''; showModal('upload-video-modal'); }
    function uploadVideo() { 
        const title = document.getElementById('video-title-input').value.trim(); 
        if (title === '') { showNotification('El video necesita un título.', 'error'); return; } 
        // Narración
        narrateAction(`El video está renderizado. Con nerviosismo, escribes el título <strong>"${title}"</strong> y pulsas el botón de 'Subir'. Ahora solo queda esperar...`);
        const video = gameState.video.editedVideo; 
        const views = Math.floor(video.quality * (1 + Math.random())), subs = Math.floor(views / (100 - gameState.knowledge)), money = Math.round(views / 50); 
        gameState.subscribers += subs; 
        gameState.money += money; 
        gameState.video.editedVideo = null; 
        showNotification(`¡Video "${title}" subido! Ganaste ${views} vistas, ${subs} subs y $${money}.`, 'success'); 
        closeModal(); 
        updateUI(); 
        saveGame(); 
    }

    // --- LÓGICA MINIJUEGOS ---
    function awardPlayBonus() { const energyGained = 10; gameState.energy = Math.min(100, gameState.energy + energyGained); showNotification(`¡Te has divertido! Energía +${energyGained}`, 'success'); updateUI(); saveGame(); }
    function startPenaltyGame() { showModal('penalty-game-modal'); penaltyResultUI.textContent = ''; const buttons = penaltyActionsContainer.querySelectorAll('button'); buttons.forEach(btn => btn.disabled = false); const handleShot = (e) => { buttons.forEach(btn => btn.disabled = true); const shot = e.target.dataset.shot; const success = Math.random() > 0.4; if (success) { penaltyResultUI.textContent = "¡¡¡GOOOOL!!!"; penaltyResultUI.style.color = 'var(--bar-energy)'; } else { penaltyResultUI.textContent = "¡PARADO POR EL PORTERO!"; penaltyResultUI.style.color = 'var(--accent-color)'; } setTimeout(() => { closeModal(); awardPlayBonus(); }, 2000); }; buttons.forEach(btn => { btn.onclick = handleShot; }); }
    function startSnakeGame() { showModal('snake-game-modal'); const ctx = snakeCanvas.getContext('2d'); const gridSize = 20; let snake = [{ x: 10, y: 10 }]; let food = {}; let score = 0; let direction = 'right'; let isGameOver = false; function generateFood() { food = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; } function drawRect(x, y, color) { ctx.fillStyle = color; ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize); } function updateGame() { if (isGameOver) { clearInterval(snakeGameInterval); snakeGameOverUI.classList.remove('hidden'); return; } ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height); let head = { x: snake[0].x, y: snake[0].y }; if (direction === 'right') head.x++; else if (direction === 'left') head.x--; else if (direction === 'up') head.y--; else if (direction === 'down') head.y++; if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize || snake.some(segment => segment.x === head.x && segment.y === head.y)) { isGameOver = true; } snake.unshift(head); if (head.x === food.x && head.y === food.y) { score++; snakeScoreUI.textContent = score; generateFood(); } else { snake.pop(); } drawRect(food.x, food.y, 'var(--accent-color)'); snake.forEach(segment => drawRect(segment.x, segment.y, 'var(--bar-energy)')); } function changeDirection(e) { const key = e.key; if ((key === 'ArrowUp' || key === 'w') && direction !== 'down') direction = 'up'; else if ((key === 'ArrowDown' || key === 's') && direction !== 'up') direction = 'down'; else if ((key === 'ArrowLeft' || key === 'a') && direction !== 'right') direction = 'left'; else if ((key === 'ArrowRight' || key === 'd') && direction !== 'left') direction = 'right'; } const upButton = document.getElementById('snake-up'); const downButton = document.getElementById('snake-down'); const leftButton = document.getElementById('snake-left'); const rightButton = document.getElementById('snake-right'); upButton.addEventListener('click', () => { if (direction !== 'down') direction = 'up'; }); downButton.addEventListener('click', () => { if (direction !== 'up') direction = 'down'; }); leftButton.addEventListener('click', () => { if (direction !== 'right') direction = 'left'; }); rightButton.addEventListener('click', () => { if (direction !== 'left') direction = 'right'; }); snakeGameOverUI.classList.add('hidden'); snakeScoreUI.textContent = 0; generateFood(); document.addEventListener('keydown', changeDirection); snakeGameInterval = setInterval(updateGame, 150); }
    
    // --- INICIALIZACIÓN ---
    function init() {
        const urlParams = new URLSearchParams(window.location.search), slotId = parseInt(urlParams.get('slot'), 10);
        if (isNaN(slotId)) { showNotification("Ranura de guardado no especificada.", 'error'); window.location.href = 'menu.html'; return; }
        currentSlotId = slotId;
        loadGame(currentSlotId);

        if (gameState.isNew) {
            showModal('story-modal');
            function showNextStory() {
                if(currentStoryIndex < STORY_STAGES.length) {
                    storyTitle.textContent = STORY_STAGES[currentStoryIndex].title;
                    storyText.textContent = STORY_STAGES[currentStoryIndex].text;
                    currentStoryIndex++;
                } else {
                    showModal('intro-modal');
                }
            }
            nextStoryBtn.onclick = showNextStory;
            showNextStory();
        } else {
            updateUI();
            narrateAction("Estás en tu habitación, listo para continuar tu aventura como YouTuber. ¿Qué harás hoy?");
        }

        startGameButton.addEventListener('click', () => {
            const channelNameInput = document.getElementById('channel-name-input');
            const channelName = channelNameInput.value.trim();
            gameState.channelName = channelName === '' ? 'YouTuber Novato' : channelName;
            gameState.isNew = false;
            saveGame();
            closeModal();
            updateUI();
            narrateAction("Acabas de crear tu canal. Estás en tu habitación, con un futuro incierto pero emocionante por delante. ¡Es hora de empezar!");
        });
        
        sleepButton.addEventListener('click', sleep);
        studyButton.addEventListener('click', study);
        workButton.addEventListener('click', work);
        playGamesButton.addEventListener('click', openPlayGamesModal);
        computerButton.addEventListener('click', openComputer);
        recordVideoButton.addEventListener('click', openSelectGameModal);
        editVideoButton.addEventListener('click', startEditingSession);
        uploadVideoButton.addEventListener('click', openUploadModal);
        buyGamesButton.addEventListener('click', openShopModal);
        upgradePcButton.addEventListener('click', openUpgradePcModal);
        leaderboardButton.addEventListener('click', openLeaderboardModal);
        buyUpgradeButton.addEventListener('click', buyUpgrade);
        confirmUploadButton.addEventListener('click', uploadVideo);

        closeExamModalButton.addEventListener('click', () => { closeModal(); gameState.knowledge = 0; showNotification("Comienza un nuevo ciclo de estudio.", 'info'); updateUI(); saveGame(); });
        backToRoomButton.addEventListener('click', () => {
            narrateAction("Vuelves a tu habitación y piensas en tu próximo movimiento.");
            closeModal();
        }); 
        backToComputerButtonUpgrade.addEventListener('click', openComputer);
        backToComputerButtonShop.addEventListener('click', openComputer);
        backToComputerButtonSelect.addEventListener('click', openComputer);
        backToComputerButtonUpload.addEventListener('click', openComputer);
        backToComputerButtonLeaderboard.addEventListener('click', openComputer);
        backToRoomFromPlaySelectButton.addEventListener('click', closeModal);
        closeSnakeGameButton.addEventListener('click', () => { if(snakeGameInterval) clearInterval(snakeGameInterval); closeModal(); awardPlayBonus(); });
    }
    
    init();
};