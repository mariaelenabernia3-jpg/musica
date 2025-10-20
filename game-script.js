window.onload = () => {

    // --- CONSTANTES Y REFERENCIAS AL DOM ---
    const SAVE_KEY = 'dzmGameSaves', NUM_SLOTS = 3;
    const allModals = document.querySelectorAll('.modal-overlay');
    const notificationContainer = document.getElementById('notification-container');
    const energyValueUI = document.getElementById('energy-value'), energyBarUI = document.getElementById('energy-bar');
    const knowledgeValueUI = document.getElementById('knowledge-value'), knowledgeBarUI = document.getElementById('knowledge-bar');
    const subsValueUI = document.getElementById('subs-value'), moneyValueUI = document.getElementById('money-value');
    const dayValueUI = document.getElementById('day-value'), footageValueUI = document.getElementById('footage-value');
    const trendDisplay = document.getElementById('trend-display');
    const channelNameDisplay = document.getElementById('channel-name-display');
    const narrationText = document.getElementById('narration-text');
    
    let gameState = {}, currentSlotId = -1;
    let snakeGameInterval = null;

    // --- BASES DE DATOS DEL JUEGO ---
    const PC_UPGRADES = [ { level: 1, name: 'Patata PC', cost: 0, editSpeed: 1 }, { level: 2, name: 'PC Decente', cost: 50, editSpeed: 1.5 }, { level: 3, name: 'Máquina Gaming', cost: 250, editSpeed: 2.5 }, ];
    const CAM_UPGRADES = [ { level: 1, name: 'Webcam Borrosa', cost: 0, qualityBonus: 1 }, { level: 2, name: 'Cámara HD', cost: 40, qualityBonus: 1.2 }, { level: 3, name: 'Cámara 4K Profesional', cost: 200, qualityBonus: 1.5 }, ];
    const MIC_UPGRADES = [ { level: 1, name: 'Micrófono de Portátil', cost: 0, qualityBonus: 1 }, { level: 2, name: 'Micrófono de Mesa', cost: 30, qualityBonus: 1.2 }, { level: 3, name: 'Micrófono de Estudio', cost: 180, qualityBonus: 1.5 }, ];
    const CHAIR_UPGRADES = [ { level: 1, name: 'Silla de Cocina', cost: 0, energyDiscount: 0 }, { level: 2, name: 'Silla de Oficina', cost: 60, energyDiscount: 0.1 }, { level: 3, name: 'Silla Gamer RGB', cost: 300, energyDiscount: 0.25 }, ];
    const GAME_SHOP = [ { id: 'serpientePixelada', name: 'Serpiente Pixelada', cost: 10 }, { id: 'tiroDeGloria', name: 'Tiro de Gloria', cost: 15 }, { id: 'pixelCraft', name: 'PixelCraft', cost: 40 }, ];
    const RIVAL_CHANNELS = [ { name: 'GamerPro', subs: 500 }, { name: 'PixelPlayz', subs: 2500 }, { name: 'RetroRewind', subs: 12000 }, { name: 'LaZonaNerd', subs: 55000 }, { name: 'ComandoGaming', subs: 150000 }, { name: 'ViewTubeStar', subs: 500000 }, { name: 'ElReyDelGameplay', subs: 1000000 }, ];
    const COMMENTS = { positive: ["¡El mejor video que he visto hoy!", "¡Nuevo sub! Sigue así.", "Juegas increíble, me has enganchado.", "¡Me encanta tu energía!", "Este contenido es justo lo que buscaba."], neutral: ["No está mal.", "Interesante...", "Ok.", "Buen video.", "Gracias por subirlo."], negative: ["Me aburrí a la mitad.", "Podrías mejorar el audio.", "Hay youtubers mejores.", "¿Por qué el video es tan corto?", "No entendí nada."] };
    const RANDOM_EVENTS = [ { title: "¡Video Viral!", text: "¡Uno de tus videos antiguos se ha hecho viral! Ganas un montón de suscriptores.", effect: () => { const subs = Math.floor(50 + Math.random() * 200); gameState.subscribers += subs; return `¡Ganas ${subs} suscriptores!`; } }, { title: "Donación Generosa", text: "Un fan anónimo te ha donado dinero para que mejores tu equipo.", effect: () => { const money = Math.floor(25 + Math.random() * 50); gameState.money += money; return `¡Recibes $${money}!`; } }, { title: "Día Inspirado", text: "Te despiertas con una creatividad desbordante. Hoy, las acciones cuestan la mitad de energía.", effect: () => { gameState.modifiers.energyCostMultiplier = 0.5; return "Costes de energía reducidos al 50% hoy."; } }, { title: "Internet Lento", text: "Hay problemas con tu proveedor de internet. Hoy, editar videos tardará el doble.", effect: () => { gameState.modifiers.editTimeMultiplier = 2; return "El tiempo de edición se duplica hoy."; } }, { title: "Resfriado Matutino", text: "Te has levantado con un fuerte resfriado. No te sientes con fuerzas para dar el 100%.", effect: () => { gameState.modifiers.maxEnergyBonus = -25; return "Tu energía máxima se reduce en 25 hoy."; } } ];
    const STORY_STAGES = [ { title: "El Comienzo de un Sueño", text: 'Desde que eras un niño, te quedabas horas viendo videos en ViewTube...' }, { title: "La Inspiración", text: 'Un día, viendo a tu ídolo "ElReyDelGameplay", pensaste: "Yo también quiero hacer eso..."' }, { title: "Tu Oportunidad", text: 'Con tus ahorros, has conseguido un equipo básico. ¡Tu aventura comienza ahora!' } ];
    let currentStoryIndex = 0;

    // --- LÓGICA DE MODALES ---
    function showModal(modalId) { allModals.forEach(m => m.classList.add('hidden')); if (modalId) { document.getElementById(modalId)?.classList.remove('hidden'); } }
    function closeModal() { showModal(''); }

    // --- NARRACIÓN ---
    function narrateAction(message) { narrationText.innerHTML = message; }

    // --- GUARDADO Y CARGA ---
    function createNewGameData() { return { isNew: true, channelName: "Mi Canal", day: 1, energy: 100, knowledge: 0, subscribers: 0, money: 20, video: { rawFootage: 0, editedVideo: null, lastRecordedGameId: null }, pc: { level: 1 }, equipment: { cam: 1, mic: 1, chair: 1 }, ownedGames: [], pixelCraft: null, currentTrend: null, modifiers: { energyCostMultiplier: 1, editTimeMultiplier: 1, maxEnergyBonus: 0 } }; }
    function loadGame(slotId) { let allSavesText = localStorage.getItem(SAVE_KEY), allSaves = allSavesText ? JSON.parse(allSavesText) : Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null })); if (slotId >= 0 && slotId < allSaves.length) { let slot = allSaves[slotId]; if (slot.isEmpty) { slot.isEmpty = false; slot.data = createNewGameData(); localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves)); } gameState = slot.data; } else { window.location.href = 'menu.html'; } }
    function saveGame() { let allSavesText = localStorage.getItem(SAVE_KEY), allSaves = allSavesText ? JSON.parse(allSavesText) : Array(NUM_SLOTS).fill(null).map(() => ({ isEmpty: true, data: null })); if (currentSlotId >= 0 && currentSlotId < allSaves.length) { allSaves[currentSlotId].data = gameState; allSaves[currentSlotId].isEmpty = false; localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves)); } }

    // --- NOTIFICACIONES ---
    function showNotification(message, type = 'info') { const notif = document.createElement('div'); notif.className = `notification ${type}`; notif.textContent = message; notificationContainer.appendChild(notif); setTimeout(() => notif.remove(), 4500); }

    // --- ACTUALIZACIÓN DE UI ---
    function updateUI() {
        const maxEnergy = 100 + gameState.modifiers.maxEnergyBonus;
        channelNameDisplay.textContent = gameState.channelName;
        energyValueUI.textContent = `${gameState.energy} / ${maxEnergy}`; energyBarUI.style.width = `${(gameState.energy / maxEnergy) * 100}%`;
        knowledgeValueUI.textContent = `${gameState.knowledge} / 100`; knowledgeBarUI.style.width = `${gameState.knowledge}%`;
        subsValueUI.textContent = gameState.subscribers.toLocaleString('es-ES');
        moneyValueUI.textContent = `$${gameState.money.toLocaleString('es-ES')}`;
        dayValueUI.textContent = gameState.day;
        footageValueUI.textContent = gameState.video.rawFootage;
        const trendGame = GAME_SHOP.find(g => g.id === gameState.currentTrend);
        trendDisplay.textContent = trendGame ? trendGame.name : "Ninguna";
        const chair = CHAIR_UPGRADES[gameState.equipment.chair - 1];
        const energyDiscount = 1 - chair.energyDiscount;
        document.getElementById('study-button').disabled = gameState.energy < (35 * energyDiscount) || gameState.knowledge >= 100;
        document.getElementById('work-button').disabled = gameState.energy < (15 * energyDiscount);
        document.getElementById('play-games-button').disabled = gameState.energy < (5 * energyDiscount);
        document.getElementById('computer-button').disabled = gameState.energy < (10 * energyDiscount);
        document.getElementById('record-video-button').disabled = gameState.energy < (25 * energyDiscount);
        document.getElementById('edit-video-button').disabled = gameState.video.rawFootage <= 0;
        document.getElementById('upload-video-button').disabled = !gameState.video.editedVideo;
    }

    // --- LÓGICA DEL DÍA Y EVENTOS ---
    function resetModifiers() { gameState.modifiers = { energyCostMultiplier: 1, editTimeMultiplier: 1, maxEnergyBonus: 0 }; }
    function setNewTrend() { const availableGames = GAME_SHOP.map(g => g.id); gameState.currentTrend = availableGames.length > 0 ? availableGames[Math.floor(Math.random() * availableGames.length)] : null; }
    function startNewDay() {
        resetModifiers(); setNewTrend(); gameState.day += 1;
        if (Math.random() < 0.25) { const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)]; const effectMessage = event.effect(); document.getElementById('event-title').textContent = event.title; document.getElementById('event-text').textContent = `${event.text} ${effectMessage}`; showModal('event-modal'); } 
        else if (gameState.day > 1 && gameState.day % 5 === 0) { triggerExam(); } 
        else { finishDayStart(); }
    }
    function finishDayStart() { gameState.energy = 100 + gameState.modifiers.maxEnergyBonus; showNotification("Duermes profundamente. ¡Comienza un nuevo día!", 'success'); updateUI(); saveGame(); }
    function triggerExam() { let resultMessage = ''; if (gameState.knowledge >= 100) { const bonus = 20; gameState.money += bonus; resultMessage = `¡EXCELENTE! Has dominado la materia. Recibes un bono de $${bonus}.`; } else if (gameState.knowledge >= 60) { resultMessage = `APROBADO. Has pasado el examen, pero puedes mejorar.`; } else { const fee = 15; const amountPaid = Math.min(fee, gameState.money); gameState.money -= amountPaid; resultMessage = `DESAPROBADO. Necesitas esforzarte más. Pagas una multa de $${amountPaid}.`; } document.getElementById('exam-result-text').textContent = resultMessage; showModal('exam-modal'); }

    // --- ACCIONES PRINCIPALES ---
    function sleep() { if (gameState.energy >= (100 + gameState.modifiers.maxEnergyBonus)) { showNotification("Ya tienes la energía al máximo.", 'info'); return; } narrateAction("Te metes en la cama y el mundo se desvanecce. Mañana será un nuevo día."); startNewDay(); }
    function executeAction(baseEnergyCost, actionFn) {
        const chair = CHAIR_UPGRADES[gameState.equipment.chair - 1];
        const finalCost = Math.round(baseEnergyCost * gameState.modifiers.energyCostMultiplier * (1 - chair.energyDiscount));
        if (gameState.energy < finalCost) { showNotification("Estás demasiado cansado para hacer eso.", 'error'); return; }
        gameState.energy -= finalCost;
        actionFn();
        updateUI();
        saveGame();
    }
    function study() { executeAction(35, () => { if (gameState.knowledge >= 100) { showNotification("Tu conocimiento ya está al máximo.", 'info'); gameState.energy += 35; return; } narrateAction("Te sientas en tu escritorio, rodeado de libros y tutoriales..."); gameState.knowledge = Math.min(100, gameState.knowledge + 10); showNotification("Estudias intensamente. ¡Conocimiento +10!", 'info'); });}
    function work() { executeAction(15, () => {
        narrateAction("Sales de casa para tu trabajo de media jornada...");
        showModal('working-modal'); 
        let progress = 0; 
        document.getElementById('working-progress-bar').style.width = '0%';
        const workClickTarget = document.getElementById('work-click-target');
        const handleWorkClick = () => { 
            progress += 5; 
            document.getElementById('working-progress-bar').style.width = `${progress}%`; 
            if (progress >= 100) { 
                workClickTarget.removeEventListener('click', handleWorkClick); 
                closeModal(); 
                const moneyEarned = 10;
                gameState.money += moneyEarned; 
                showNotification(`¡Trabajo completado! Ganaste $${moneyEarned}.`, 'success'); 
                updateUI(); 
                saveGame(); 
            } 
        }; 
        workClickTarget.addEventListener('click', handleWorkClick);
    });}
    
    // --- LÓGICA DE JUGAR VIDEOJUEGOS ---
    function handlePlayGameSelection(gameId) {
        executeAction(5, () => {
            narrateAction("Decides tomarte un descanso y disfrutar de uno de tus videojuegos favoritos.");
            
            if (gameId === 'pixelCraft') { 
                saveGame(); 
                window.location.href = `pixelcraft.html?slot=${currentSlotId}&recording=false`; 
                return; 
            }
    
            closeModal(); // Cierra el modal de selección antes de abrir el del minijuego
            switch (gameId) {
                case 'serpientePixelada': startSnakeGame(); break;
                case 'tiroDeGloria': startPenaltyGame(); break;
            }
        });
    }

    function openPlayGamesModal() { 
        if (gameState.ownedGames.length === 0) { showNotification('Necesitas comprar un juego primero.', 'info'); return; }
        const container = document.getElementById('owned-games-to-play-container'); 
        container.innerHTML = ''; 
        gameState.ownedGames.forEach(gameId => { 
            const game = GAME_SHOP.find(g => g.id === gameId);
            const item = document.createElement('div'); item.className = 'owned-game-item'; item.textContent = game.name; item.dataset.gameId = gameId; 
            container.appendChild(item); 
        }); 
        showModal('play-games-modal'); 
    }
    
    // --- LÓGICA DEL ORDENADOR Y MEJORAS ---
    function openComputer() { narrateAction("Te sientas frente a tu ordenador, el centro de tu futuro imperio..."); updateUI(); showModal('computer-modal'); }
    function openUpgradePcModal() { const currentLevel = gameState.pc.level; const nextUpgrade = PC_UPGRADES.find(u => u.level === currentLevel + 1); const info = document.getElementById('upgrade-info'), btn = document.getElementById('buy-upgrade-button'); if (nextUpgrade) { info.innerHTML = `<p>Actual: ${PC_UPGRADES[currentLevel - 1].name}</p><p>Mejora: <strong>${nextUpgrade.name}</strong></p><p>Costo: <strong>$${nextUpgrade.cost}</strong></p><p class="benefits">Beneficio: Edita videos más rápido.</p>`; btn.textContent = `Comprar ($${nextUpgrade.cost})`; btn.disabled = gameState.money < nextUpgrade.cost; } else { info.innerHTML = `<p>¡Ya tienes el mejor PC posible!</p>`; btn.textContent = 'Máximo Nivel'; btn.disabled = true; } showModal('upgrade-pc-modal'); }
    function buyUpgrade() { const nextUpgrade = PC_UPGRADES.find(u => u.level === gameState.pc.level + 1); if (nextUpgrade && gameState.money >= nextUpgrade.cost) { gameState.money -= nextUpgrade.cost; gameState.pc.level++; showNotification('¡PC mejorado!', 'success'); openUpgradePcModal(); saveGame(); } }
    function openEquipmentModal() {
        const container = document.getElementById('equipment-items-container'); container.innerHTML = '';
        const equipmentTypes = [ { type: 'cam', upgrades: CAM_UPGRADES, title: 'Cámara', benefits: 'Mejora la calidad del metraje.' }, { type: 'mic', upgrades: MIC_UPGRADES, title: 'Micrófono', benefits: 'Mejora la calidad del metraje.' }, { type: 'chair', upgrades: CHAIR_UPGRADES, title: 'Silla', benefits: 'Reduce el gasto de energía.' } ];
        equipmentTypes.forEach(({ type, upgrades, title, benefits }) => {
            const currentLevel = gameState.equipment[type]; const nextUpgrade = upgrades.find(u => u.level === currentLevel + 1); const item = document.createElement('div'); item.className = 'equipment-item'; let content;
            if (nextUpgrade) { content = `<h4>${title} (Nivel ${currentLevel})</h4><p>Mejora a: <strong>${nextUpgrade.name}</strong></p><p>Costo: <strong>$${nextUpgrade.cost}</strong></p><p class="benefits">${benefits}</p><button class="action-btn buy-equipment-btn" data-type="${type}" ${gameState.money < nextUpgrade.cost ? 'disabled' : ''}>Comprar</button>`; } else { content = `<h4>${title} (Nivel Máximo)</h4><p>Actual: <strong>${upgrades[currentLevel-1].name}</strong></p><p>¡Ya tienes el mejor equipo!</p>`; }
            item.innerHTML = content; container.appendChild(item);
        });
        showModal('equipment-modal');
    }
    function buyEquipment(type) {
        const upgrades = { cam: CAM_UPGRADES, mic: MIC_UPGRADES, chair: CHAIR_UPGRADES }[type];
        const nextUpgrade = upgrades.find(u => u.level === gameState.equipment[type] + 1);
        if (nextUpgrade && gameState.money >= nextUpgrade.cost) { gameState.money -= nextUpgrade.cost; gameState.equipment[type]++; showNotification(`¡${type === 'cam' ? 'Cámara' : (type === 'mic' ? 'Micrófono' : 'Silla')} mejorado!`, 'success'); openEquipmentModal(); saveGame(); }
    }
    
    // --- LÓGICA DE GRABACIÓN, EDICIÓN Y SUBIDA ---
    function startRecordingSession(gameId) { executeAction(25, () => {
        narrateAction("Enciendes la cámara y el micrófono. ¡La luz roja parpadea!");
        gameState.video.lastRecordedGameId = gameId; closeModal(); showModal('recording-modal'); let progress = 0; const clickTarget = document.getElementById('click-target'); const recordingProgressBarUI = document.getElementById('recording-progress-bar'); recordingProgressBarUI.style.width = '0%';
        const handleRecordClick = () => {
            progress += 5; recordingProgressBarUI.style.width = `${progress}%`;
            if (progress >= 100) {
                clickTarget.removeEventListener('click', handleRecordClick); closeModal();
                const cam = CAM_UPGRADES[gameState.equipment.cam - 1]; const mic = MIC_UPGRADES[gameState.equipment.mic - 1]; const footageGained = Math.round(10 * cam.qualityBonus * mic.qualityBonus); gameState.video.rawFootage += footageGained;
                showNotification(`¡Grabación completada! Metraje +${footageGained}`, 'success'); updateUI(); saveGame();
            }
        };
        clickTarget.addEventListener('click', handleRecordClick);
    });}
    function startEditingSession() { if (gameState.video.rawFootage <= 0) { showNotification('No tienes metraje para editar.', 'error'); return; } executeAction(15, () => {
        narrateAction("Importas todo el metraje en bruto. Ahora empieza la verdadera magia...");
        const footageToEdit = gameState.video.rawFootage; const gameId = gameState.video.lastRecordedGameId; gameState.video.rawFootage = 0; showModal('editing-modal');
        const pc = PC_UPGRADES[gameState.pc.level - 1]; const knowledgeBonus = 1 + (gameState.knowledge / 100); const editTime = 10 / (pc.editSpeed * knowledgeBonus) * gameState.modifiers.editTimeMultiplier; let progress = 0; let progressBar = document.getElementById('editing-progress-bar'); progressBar.style.width = '0%';
        const interval = setInterval(() => {
            progress += 100 / (editTime * 10); progressBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval); gameState.video.editedVideo = { quality: Math.round(footageToEdit * knowledgeBonus * pc.editSpeed), gameId: gameId };
                showNotification('¡Video editado!', 'success'); closeModal(); updateUI(); saveGame();
            }
        }, 100);
    });}
    function uploadVideo() {
        const title = document.getElementById('video-title-input').value.trim(); if (title === '') { showNotification('El video necesita un título.', 'error'); return; }
        narrateAction(`El video está renderizado. Con nerviosismo, escribes <strong>"${title}"</strong> y pulsas 'Subir'.`);
        const video = gameState.video.editedVideo; let views = Math.floor(video.quality * (1 + Math.random() * 1.5));
        if (video.gameId === gameState.currentTrend) { views = Math.floor(views * 2); showNotification("¡Has subido un video en tendencia!", 'success'); }
        const subPotential = (views / 40) + (gameState.knowledge / 10); const baseSubs = Math.floor(subPotential * (0.5 + Math.random()));
        const money = Math.round(views / 50); gameState.subscribers += baseSubs; gameState.money += money; gameState.video.editedVideo = null;
        showNotification(`¡Video subido! ${views} vistas, ${baseSubs} subs y $${money}.`, 'success');
        generateAndShowComments(views); closeModal();
    }
    function generateAndShowComments(views) {
        const container = document.getElementById('comments-container'); container.innerHTML = ''; const numComments = 3 + Math.floor(Math.random() * 3); const goodVideo = views > 100;
        for (let i = 0; i < numComments; i++) {
            let commentText; const rand = Math.random();
            if (goodVideo) { if (rand < 0.7) commentText = COMMENTS.positive[Math.floor(Math.random() * COMMENTS.positive.length)]; else if (rand < 0.9) commentText = COMMENTS.neutral[Math.floor(Math.random() * COMMENTS.neutral.length)]; else commentText = COMMENTS.negative[Math.floor(Math.random() * COMMENTS.negative.length)];
            } else { if (rand < 0.5) commentText = COMMENTS.negative[Math.floor(Math.random() * COMMENTS.negative.length)]; else if (rand < 0.8) commentText = COMMENTS.neutral[Math.floor(Math.random() * COMMENTS.neutral.length)]; else commentText = COMMENTS.positive[Math.floor(Math.random() * COMMENTS.positive.length)]; }
            const commentUser = `User${Math.floor(Math.random()*1000)}`; const commentDiv = document.createElement('div'); commentDiv.className = 'comment-item'; commentDiv.innerHTML = `<p class="comment-user">${commentUser}</p><p class="comment-text">${commentText}</p>`; container.appendChild(commentDiv);
        }
        showModal('comments-modal');
    }
    
    // --- LÓGICA MINIJUEGOS ---
    function awardPlayBonus() { showNotification(`¡Te has divertido! Energía +5`, 'success'); gameState.energy = Math.min(100 + gameState.modifiers.maxEnergyBonus, gameState.energy + 5); updateUI(); saveGame(); }
    function startPenaltyGame() { showModal('penalty-game-modal'); const resultUI = document.getElementById('penalty-result'); const actionsContainer = document.getElementById('penalty-actions'); resultUI.textContent = ''; const buttons = actionsContainer.querySelectorAll('button'); buttons.forEach(btn => btn.disabled = false); const handleShot = (e) => { buttons.forEach(btn => btn.disabled = true); const success = Math.random() > 0.4; if (success) { resultUI.textContent = "¡¡¡GOOOOL!!!"; resultUI.style.color = 'var(--bar-energy)'; } else { resultUI.textContent = "¡PARADO POR EL PORTERO!"; resultUI.style.color = 'var(--accent-color)'; } setTimeout(() => { closeModal(); awardPlayBonus(); }, 2000); }; buttons.forEach(btn => { btn.onclick = handleShot; }); }
    
    function startSnakeGame() {
        showModal('snake-game-modal');
        const canvas = document.getElementById('snake-canvas');
        const scoreUI = document.getElementById('snake-score');
        const gameOverUI = document.getElementById('snake-game-over');
        const ctx = canvas.getContext('2d');
        const gridSize = 20;
        // --- INICIO DEL CÓDIGO CORREGIDO ---
        let snake = [{ x: 7, y: 7 }]; // Posición inicial centrada para un canvas de 300x300 (15x15 grid)
        // --- FIN DEL CÓDIGO CORREGIDO ---
        let food = {};
        let score = 0;
        let direction = 'right';
        let isGameOver = false;

        function generateFood() { food = { x: Math.floor(Math.random() * (canvas.width / gridSize)), y: Math.floor(Math.random() * (canvas.height / gridSize)) }; }
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            snake.forEach(segment => { ctx.fillStyle = 'var(--bar-energy)'; ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1); });
            ctx.fillStyle = 'var(--accent-color)'; ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        }
        
        function endGame() {
            isGameOver = true;
            gameOverUI.classList.remove('hidden');
            clearInterval(snakeGameInterval);
            document.removeEventListener('keydown', changeDirection);
        }

        function updateGame() {
            if (isGameOver) return;
            let head = { x: snake[0].x, y: snake[0].y };
            if (direction === 'right') head.x++; else if (direction === 'left') head.x--; else if (direction === 'up') head.y--; else if (direction === 'down') head.y++;
            
            if (head.x < 0 || head.x * gridSize >= canvas.width || head.y < 0 || head.y * gridSize >= canvas.height || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                endGame();
                return;
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score++; scoreUI.textContent = score; generateFood();
            } else {
                snake.pop();
            }
            draw();
        }

        const changeDirection = (e) => {
            const key = e.key;
            if ((key === 'ArrowUp' || key === 'w') && direction !== 'down') direction = 'up';
            else if ((key === 'ArrowDown' || key === 's') && direction !== 'up') direction = 'down';
            else if ((key === 'ArrowLeft' || key === 'a') && direction !== 'right') direction = 'left';
            else if ((key === 'ArrowRight' || key === 'd') && direction !== 'left') direction = 'right';
        };

        document.getElementById('snake-up').onclick = () => { if (direction !== 'down') direction = 'up'; };
        document.getElementById('snake-down').onclick = () => { if (direction !== 'up') direction = 'down'; };
        document.getElementById('snake-left').onclick = () => { if (direction !== 'right') direction = 'left'; };
        document.getElementById('snake-right').onclick = () => { if (direction !== 'left') direction = 'right'; };

        gameOverUI.classList.add('hidden');
        scoreUI.textContent = 0;
        generateFood();
        document.addEventListener('keydown', changeDirection);
        snakeGameInterval = setInterval(updateGame, 150);

        document.getElementById('close-snake-game-button').onclick = () => {
            if (snakeGameInterval) clearInterval(snakeGameInterval);
            document.removeEventListener('keydown', changeDirection);
            closeModal();
            awardPlayBonus();
        };
    }

    // --- INICIALIZACIÓN Y EVENT LISTENERS ---
    function init() {
        const urlParams = new URLSearchParams(window.location.search); const slotId = parseInt(urlParams.get('slot'), 10); if (isNaN(slotId)) { window.location.href = 'menu.html'; return; }
        currentSlotId = slotId; loadGame(currentSlotId);
        if (gameState.isNew) {
            showModal('story-modal');
            document.getElementById('next-story-btn').onclick = () => {
                currentStoryIndex++;
                if (currentStoryIndex < STORY_STAGES.length) { document.getElementById('story-title').textContent = STORY_STAGES[currentStoryIndex].title; document.getElementById('story-text').textContent = STORY_STAGES[currentStoryIndex].text; } else { showModal('intro-modal'); }
            };
            document.getElementById('story-title').textContent = STORY_STAGES[0].title; document.getElementById('story-text').textContent = STORY_STAGES[0].text;
        } else { if(!gameState.currentTrend) setNewTrend(); updateUI(); narrateAction("Estás en tu habitación, listo para continuar tu aventura."); }

        document.addEventListener('click', e => {
            const target = e.target;
            const targetId = target.id;
            const targetClass = target.classList;
            const targetDataset = target.dataset;

            if (targetId === 'sleep-button') sleep();
            else if (targetId === 'study-button') study();
            else if (targetId === 'work-button') work();
            else if (targetId === 'play-games-button') openPlayGamesModal();
            else if (targetId === 'computer-button') openComputer();
            else if (targetId === 'record-video-button') {
                const container = document.getElementById('owned-games-container'); container.innerHTML = '';
                gameState.ownedGames.forEach(gameId => { const game = GAME_SHOP.find(g => g.id === gameId); const item = document.createElement('div'); item.className = 'owned-game-item'; item.textContent = game.name; item.dataset.gameId = gameId; container.appendChild(item); });
                showModal('select-game-modal');
            }
            else if (targetId === 'edit-video-button') startEditingSession();
            else if (targetId === 'upload-video-button') showModal('upload-video-modal');
            else if (targetId === 'buy-games-button') {
                const container = document.getElementById('shop-items-container'); container.innerHTML = ''; GAME_SHOP.forEach(game => { const owned = gameState.ownedGames.includes(game.id); const item = document.createElement('div'); item.className = 'shop-item'; item.innerHTML = `<div class="shop-item-info"><h4>${game.name}</h4><p>Costo: $${game.cost}</p></div><button class="action-btn" data-game-id="${game.id}" ${owned ? 'disabled' : ''}>${owned ? 'Comprado' : 'Comprar'}</button>`; container.appendChild(item); }); showModal('game-shop-modal');
            }
            else if (targetId === 'upgrade-pc-button') openUpgradePcModal();
            else if (targetId === 'buy-equipment-button') openEquipmentModal();
            else if (targetId === 'leaderboard-button') {
                const leaderboardBody = document.getElementById('leaderboard-body'); leaderboardBody.innerHTML = ''; const allChannels = [...RIVAL_CHANNELS, { name: gameState.channelName, subs: gameState.subscribers, isPlayer: true }]; allChannels.sort((a, b) => b.subs - a.subs); allChannels.forEach((channel, index) => { const tr = document.createElement('tr'); if (channel.isPlayer) { tr.className = 'player-row'; } tr.innerHTML = `<td>${index + 1}</td><td>${channel.name}</td><td>${channel.subs.toLocaleString('es-ES')}</td>`; leaderboardBody.appendChild(tr); }); showModal('leaderboard-modal');
            }
            else if (targetId === 'buy-upgrade-button') buyUpgrade();
            else if (targetClass.contains('buy-equipment-btn')) buyEquipment(targetDataset.type);
            else if (targetId === 'confirm-upload-button') uploadVideo();
            else if (targetId === 'close-comments-modal-button') { closeModal(); updateUI(); saveGame(); }
            else if (targetId === 'start-game-button') { const channelNameInput = document.getElementById('channel-name-input'); const channelName = channelNameInput.value.trim(); gameState.channelName = channelName === '' ? 'YouTuber Novato' : channelName; gameState.isNew = false; setNewTrend(); saveGame(); closeModal(); updateUI(); narrateAction("Acabas de crear tu canal. ¡Es hora de empezar!"); }
            else if (targetId === 'close-exam-modal-button' || targetId === 'close-event-modal-button') { closeModal(); finishDayStart(); }
            else if (targetId === 'back-to-room-button') { narrateAction("Vuelves a tu habitación..."); closeModal(); }
            else if (targetClass.contains('modal-back-button') || targetId.startsWith('back-to-computer-button')) { openComputer(); }
            else if (targetClass.contains('owned-game-item')) {
                if (target.closest('#owned-games-container')) { startRecordingSession(targetDataset.gameId); } 
                else if (target.closest('#owned-games-to-play-container')) { handlePlayGameSelection(targetDataset.gameId); }
            }
        });
        
        document.getElementById('shop-items-container').addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON' && e.target.dataset.gameId) {
                const gameId = e.target.dataset.gameId; const game = GAME_SHOP.find(g => g.id === gameId);
                if (game && gameState.money >= game.cost) { gameState.money -= game.cost; gameState.ownedGames.push(game.id); showNotification(`¡Has comprado ${game.name}!`, 'success'); e.target.textContent = 'Comprado'; e.target.disabled = true; saveGame(); } else { showNotification('Dinero insuficiente.', 'error'); }
            }
        });
    }
    
    init();
};