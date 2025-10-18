window.onload = () => {
    // --- CONSTANTES GLOBALES Y REFERENCIAS AL DOM ---
    const SAVE_KEY = 'dzmGameSaves';
    let currentSlotId = -1;
    let mainGameState = {};
    let pcState = {}; // Estado del minijuego PixelCraft

    // --- DOM Elements ---
    const logMessages = document.getElementById('log-messages');
    // ... (El resto de referencias al DOM se declaran dentro de init para asegurar que existen)

    // --- BASE DE DATOS DEL JUEGO (ITEMS, RECETAS, ENEMIGOS) ---
    const ITEMS = {
        // Herramientas
        'wooden_pickaxe': { name: 'Pico de Madera', type: 'tool', power: 1, durability: 10 },
        'stone_pickaxe': { name: 'Pico de Piedra', type: 'tool', power: 2, durability: 20 },
        'iron_pickaxe': { name: 'Pico de Hierro', type: 'tool', power: 3, durability: 40 },
        // Armas
        'wooden_sword': { name: 'Espada de Madera', type: 'weapon', damage: 4 },
        'stone_sword': { name: 'Espada de Piedra', type: 'weapon', damage: 6 },
        'iron_sword': { name: 'Espada de Hierro', type: 'weapon', damage: 8 },
        'diamond_sword': { name: 'Espada de Diamante', type: 'weapon', damage: 12 },
        // Armaduras
        'iron_helmet': { name: 'Casco de Hierro', type: 'helmet', defense: 3 },
        'iron_chestplate': { name: 'Pechera de Hierro', type: 'chestplate', defense: 5 },
        'iron_leggings': { name: 'Pantalones de Hierro', type: 'leggings', defense: 4 },
        'iron_boots': { name: 'Botas de Hierro', type: 'boots', defense: 2 },
        // Consumibles
        'raw_meat': { name: 'Carne Cruda', type: 'food', restores: 20 },
        // Especiales
        'boss_summoner': { name: 'Invocador del Golem', type: 'special' }
    };
    const RECIPES = {
        'wooden_pickaxe': { materials: { wood: 5 }, requires: null, description: 'Permite minar piedra.' },
        'stone_pickaxe': { materials: { stone: 5, wood: 2 }, requires: 'wooden_pickaxe', description: 'Permite minar hierro.' },
        'iron_pickaxe': { materials: { iron_ingot: 5, wood: 2 }, requires: 'stone_pickaxe', description: 'Permite minar oro y diamantes.' },
        'wooden_sword': { materials: { wood: 3 }, requires: null, description: 'Un arma básica.' },
        'stone_sword': { materials: { stone: 3, wood: 1 }, requires: null, description: 'Un arma decente.' },
        'iron_sword': { materials: { iron_ingot: 3, wood: 1 }, requires: null, description: 'Un arma poderosa.' },
        'diamond_sword': { materials: { diamond: 2, wood: 1 }, requires: null, description: 'El arma definitiva.' },
        'iron_helmet': { materials: { iron_ingot: 5 }, requires: null, description: 'Protección para la cabeza.' },
        'iron_chestplate': { materials: { iron_ingot: 8 }, requires: null, description: 'Protección para el torso.' },
        'iron_leggings': { materials: { iron_ingot: 7 }, requires: null, description: 'Protección para las piernas.' },
        'iron_boots': { materials: { iron_ingot: 4 }, requires: null, description: 'Protección para los pies.' },
        'boss_summoner': { materials: { gold_ingot: 10, diamond: 5, stone: 20 }, requires: null, description: 'Invoca al jefe final.' },
    };
    const ENEMIES = {
        'zombie': { name: 'Zombie', health: 20, damage: 5, loot: { 'raw_meat': 0.5 } },
        'skeleton': { name: 'Esqueleto', health: 15, damage: 8, loot: {} },
        'spider': { name: 'Araña Gigante', health: 18, damage: 6, loot: {} },
        'creeper': { name: 'Creeper', health: 10, damage: 20, loot: {} },
        'boss': { name: 'Golem Ancestral', health: 250, damage: 15, loot: { 'diamond': 1 } }
    };

    // --- LÓGICA DEL JUEGO ---

    function logMessage(msg) {
        const li = document.createElement('li');
        li.textContent = msg;
        logMessages.prepend(li);
        if (logMessages.children.length > 50) {
            logMessages.lastChild.remove();
        }
    }

    function updateUI() {
        // Actualizar inventario de materiales
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = '';
        const materialOrder = ['wood', 'stone', 'coal', 'iron_ore', 'iron_ingot', 'gold_ore', 'gold_ingot', 'diamond', 'raw_meat'];
        materialOrder.forEach(mat => {
            if (pcState.inventory.materials[mat] > 0) {
                const li = document.createElement('li');
                li.textContent = `${mat.replace('_', ' ')}: ${pcState.inventory.materials[mat]}`;
                inventoryList.appendChild(li);
            }
        });

        // Actualizar equipo
        document.getElementById('equip-weapon').textContent = pcState.equipment.weapon ? ITEMS[pcState.equipment.weapon].name : 'Ninguna';
        document.getElementById('equip-helmet').textContent = pcState.equipment.helmet ? ITEMS[pcState.equipment.helmet].name : 'Ninguno';
        document.getElementById('equip-chestplate').textContent = pcState.equipment.chestplate ? ITEMS[pcState.equipment.chestplate].name : 'Ninguna';
        document.getElementById('equip-leggings').textContent = pcState.equipment.leggings ? ITEMS[pcState.equipment.leggings].name : 'Ningunos';
        document.getElementById('equip-boots').textContent = pcState.equipment.boots ? ITEMS[pcState.equipment.boots].name : 'Ningunas';
        
        // Actualizar barras de estado
        document.getElementById('health-bar').style.width = `${pcState.stats.health}%`;
        document.getElementById('health-value').textContent = `${pcState.stats.health}/100`;
        document.getElementById('hunger-bar').style.width = `${pcState.stats.hunger}%`;
        document.getElementById('hunger-value').textContent = `${pcState.stats.hunger}/100`;

        // Actualizar tiempo
        document.getElementById('day-counter').textContent = pcState.time.day;
        const timeOfDay = ['Madrugada', 'Mañana', 'Tarde', 'Noche'][Math.floor(pcState.time.hour / 6)];
        document.getElementById('time-of-day').textContent = timeOfDay;
        document.getElementById('time-icon').textContent = (pcState.time.hour >= 6 && pcState.time.hour < 18) ? '☀️' : '🌙';

        // Habilitar/deshabilitar botones de acción
        document.getElementById('action-mine-stone').disabled = !pcState.inventory.tools.includes('wooden_pickaxe');
        document.getElementById('action-mine-deep').disabled = !pcState.inventory.tools.includes('iron_pickaxe');
        document.getElementById('action-hunt').disabled = !pcState.inventory.weapons.length > 0;
        document.getElementById('summon-boss-btn').disabled = !pcState.inventory.special.includes('boss_summoner') || pcState.bossDefeated;
        if(pcState.bossDefeated) document.getElementById('summon-boss-btn').textContent = "JEFE DERROTADO";
    }

    function advanceTime(hours) {
        pcState.time.hour += hours;
        const hungerLost = hours * 2;
        pcState.stats.hunger = Math.max(0, pcState.stats.hunger - hungerLost);
        if (pcState.time.hour >= 24) {
            pcState.time.hour -= 24;
            pcState.time.day++;
            logMessage(`Comienza el día ${pcState.time.day}.`);
        }
        if (pcState.stats.hunger === 0) {
            pcState.stats.health = Math.max(0, pcState.stats.health - 5);
            logMessage('¡Estás muriendo de hambre!', 'error');
            if (pcState.stats.health === 0) gameOver();
        }
        updateUI();
    }
    
    function gameOver() {
        document.getElementById('game-over-modal').classList.remove('hidden');
        // Reducir materiales a la mitad
        for(const mat in pcState.inventory.materials){
            pcState.inventory.materials[mat] = Math.floor(pcState.inventory.materials[mat] / 2);
        }
    }

    // --- LÓGICA DE ACCIONES ---
    function chopWood() {
        const woodGained = Math.floor(Math.random() * 3) + 1;
        pcState.inventory.materials.wood += woodGained;
        logMessage(`Talas y consigues ${woodGained} de madera.`);
        advanceTime(1);
        checkForCombat(0.05); // 5% de probabilidad de encuentro
    }

    function mineStone() {
        const stoneGained = Math.floor(Math.random() * 4) + 2;
        pcState.inventory.materials.stone += stoneGained;
        logMessage(`Picas y obtienes ${stoneGained} de piedra.`);
        if(Math.random() < 0.3) {
            pcState.inventory.materials.coal++;
            logMessage(`¡Encontraste 1 de carbón!`);
        }
        if(Math.random() < 0.15) {
            pcState.inventory.materials.iron_ore++;
            logMessage(`¡Encontraste 1 de mena de hierro!`);
        }
        advanceTime(2);
        checkForCombat(0.1); // 10% de probabilidad
    }
    
    function mineDeep() {
        logMessage("Te adentras en las profundidades...");
        if(Math.random() < 0.2) {
            const goldGained = Math.floor(Math.random() * 2) + 1;
            pcState.inventory.materials.gold_ore += goldGained;
            logMessage(`¡Encontraste ${goldGained} de mena de oro!`);
        }
         if(Math.random() < 0.08) {
            pcState.inventory.materials.diamond++;
            logMessage(`¡Has encontrado un diamante brillante!`);
        }
        advanceTime(4);
        checkForCombat(0.25); // 25% de probabilidad
    }
    
    function hunt() {
        logMessage("Sales de caza...");
        if(Math.random() < 0.6) {
            const meatGained = Math.floor(Math.random() * 2) + 1;
            pcState.inventory.materials.raw_meat += meatGained;
            logMessage(`Cazas un animal y obtienes ${meatGained} de carne cruda.`);
        } else {
            logMessage("No encontraste ninguna presa.");
        }
        advanceTime(3);
        checkForCombat(0.15);
    }

    // --- LÓGICA DE CRAFTEO ---
    function openCraftingModal() {
        const craftingGrid = document.getElementById('crafting-grid');
        craftingGrid.innerHTML = '';
        for (const itemId in RECIPES) {
            const recipe = RECIPES[itemId];
            const item = ITEMS[itemId];
            const canCraft = canAfford(recipe.materials);
            const hasRequirement = !recipe.requires || pcState.inventory.tools.includes(recipe.requires) || pcState.inventory.weapons.includes(recipe.requires);

            const div = document.createElement('div');
            div.className = 'crafting-item';
            let materialsList = '<ul>';
            for (const mat in recipe.materials) {
                materialsList += `<li>${mat.replace('_', ' ')}: ${recipe.materials[mat]}</li>`;
            }
            materialsList += '</ul>';

            div.innerHTML = `
                <h4>${item.name}</h4>
                <p>${recipe.description}</p>
                <p><strong>Materiales:</strong></p>
                ${materialsList}
                <button class="craft-btn" data-item-id="${itemId}" ${(!canCraft || !hasRequirement) ? 'disabled' : ''}>Fabricar</button>
            `;
            craftingGrid.appendChild(div);
        }

        document.getElementById('crafting-modal').classList.remove('hidden');
    }

    function canAfford(materials) {
        for (const mat in materials) {
            if (pcState.inventory.materials[mat] < materials[mat]) {
                return false;
            }
        }
        return true;
    }

    function craftItem(itemId) {
        const recipe = RECIPES[itemId];
        const item = ITEMS[itemId];

        if (!canAfford(recipe.materials)) {
            logMessage('No tienes suficientes materiales.', 'error');
            return;
        }

        // Deducir materiales
        for (const mat in recipe.materials) {
            pcState.inventory.materials[mat] -= recipe.materials[mat];
        }

        // Añadir item
        if (item.type === 'tool') pcState.inventory.tools.push(itemId);
        else if (item.type === 'weapon') {
            pcState.inventory.weapons.push(itemId);
            if (!pcState.equipment.weapon) pcState.equipment.weapon = itemId;
        } else if (['helmet', 'chestplate', 'leggings', 'boots'].includes(item.type)) {
            pcState.inventory.armor.push(itemId);
             if (!pcState.equipment[item.type]) pcState.equipment[item.type] = itemId;
        }
        else if (item.type === 'special') pcState.inventory.special.push(itemId);


        logMessage(`Has fabricado: ¡${item.name}!`);
        updateUI();
        openCraftingModal(); // Refrescar modal
    }
    
    // --- LÓGICA DE COMBATE ---
    function checkForCombat(baseChance) {
        const isNight = pcState.time.hour >= 18 || pcState.time.hour < 6;
        const finalChance = isNight ? baseChance * 3 : baseChance;
        if (Math.random() < finalChance) {
            const enemyPool = ['zombie', 'skeleton', 'spider'];
            const randomEnemyId = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            startCombat(JSON.parse(JSON.stringify(ENEMIES[randomEnemyId])));
        }
    }

    function startCombat(enemy) {
        const combatModal = document.getElementById('combat-modal');
        const playerHealthUI = document.getElementById('combat-player-health');
        const enemyHealthUI = document.getElementById('combat-enemy-health');
        const attackBtn = document.getElementById('combat-attack-btn');
        const eatBtn = document.getElementById('combat-eat-btn');
        const fleeBtn = document.getElementById('combat-flee-btn');
        const resultText = document.getElementById('combat-result-text');

        let playerHealth = pcState.stats.health;
        let enemyHealth = enemy.health;
        resultText.textContent = '';
        
        function updateCombatUI() {
            playerHealthUI.textContent = playerHealth;
            enemyHealthUI.textContent = enemyHealth;
            eatBtn.disabled = pcState.inventory.materials.raw_meat < 1 || playerHealth === 100;
        }

        function endCombat(win) {
            attackBtn.onclick = null;
            eatBtn.onclick = null;
            fleeBtn.onclick = null;
            setTimeout(() => {
                combatModal.classList.add('hidden');
                pcState.stats.health = playerHealth;
                if (!win && playerHealth <= 0) {
                   gameOver();
                } else {
                   updateUI();
                }
            }, 2000);

            if (win) {
                resultText.textContent = `¡Has derrotado a ${enemy.name}!`;
                logMessage(`Has derrotado a ${enemy.name}.`);
                // Dar loot
                for(const item in enemy.loot) {
                    if (Math.random() < enemy.loot[item]) {
                        pcState.inventory.materials[item]++;
                        logMessage(`Obtuviste 1 de ${item.replace('_', ' ')}.`);
                    }
                }
            }
        }
        
        function playerTurn(action) {
            // Deshabilitar botones
            attackBtn.disabled = true; eatBtn.disabled = true; fleeBtn.disabled = true;
            
            if (action === 'attack') {
                const playerDamage = pcState.equipment.weapon ? ITEMS[pcState.equipment.weapon].damage : 2;
                enemyHealth = Math.max(0, enemyHealth - playerDamage);
                resultText.textContent = `Atacas y haces ${playerDamage} de daño.`;
                updateCombatUI();
                if (enemyHealth <= 0) {
                    endCombat(true);
                    return;
                }
            } else if (action === 'eat') {
                 pcState.inventory.materials.raw_meat--;
                 const restoredHealth = ITEMS['raw_meat'].restores;
                 playerHealth = Math.min(100, playerHealth + restoredHealth);
                 resultText.textContent = `Comes carne y recuperas ${restoredHealth} de vida.`;
                 updateCombatUI();
            } else if (action === 'flee') {
                 if (Math.random() < 0.5) { // 50% de éxito
                     resultText.textContent = "¡Lograste escapar!";
                     endCombat(false);
                     return;
                 } else {
                     resultText.textContent = "¡El escape falló!";
                 }
            }
            
            setTimeout(enemyTurn, 1500);
        }
        
        function enemyTurn() {
            let totalDefense = 0;
            if(pcState.equipment.helmet) totalDefense += ITEMS[pcState.equipment.helmet].defense;
            if(pcState.equipment.chestplate) totalDefense += ITEMS[pcState.equipment.chestplate].defense;
            if(pcState.equipment.leggings) totalDefense += ITEMS[pcState.equipment.leggings].defense;
            if(pcState.equipment.boots) totalDefense += ITEMS[pcState.equipment.boots].defense;
            
            const damageTaken = Math.max(1, enemy.damage - totalDefense);
            playerHealth = Math.max(0, playerHealth - damageTaken);
            resultText.textContent = `${enemy.name} te ataca y recibes ${damageTaken} de daño.`;
            updateCombatUI();
             if (playerHealth <= 0) {
                resultText.textContent = `¡Has sido derrotado!`;
                endCombat(false);
                return;
            }
            // Habilitar botones para el siguiente turno
            attackBtn.disabled = false; eatBtn.disabled = pcState.inventory.materials.raw_meat < 1 || playerHealth === 100; fleeBtn.disabled = false;
        }

        document.getElementById('combat-title').textContent = `¡Un ${enemy.name} salvaje apareció!`;
        updateCombatUI();
        combatModal.classList.remove('hidden');

        attackBtn.onclick = () => playerTurn('attack');
        eatBtn.onclick = () => playerTurn('eat');
        fleeBtn.onclick = () => playerTurn('flee');
        attackBtn.disabled = false; fleeBtn.disabled = false;
    }


    // --- GUARDADO Y CARGA ---
    function saveAndExit() {
        if (pcState.isRecording) {
            // Calcular calidad de la grabación basado en el progreso
            let footageQuality = 0;
            footageQuality += pcState.inventory.materials.wood * 1;
            footageQuality += pcState.inventory.materials.stone * 2;
            footageQuality += pcState.inventory.materials.iron_ingot * 5;
            footageQuality += pcState.inventory.materials.diamond * 20;
            footageQuality += pcState.bossDefeated ? 500 : 0;
            mainGameState.video.rawFootage += Math.round(footageQuality);
        }
        
        mainGameState.pixelCraft = pcState;
        
        // Guardar todo el estado del juego principal
        let allSavesText = localStorage.getItem(SAVE_KEY);
        let allSaves = allSavesText ? JSON.parse(allSavesText) : [];
        if (allSaves[currentSlotId]) {
            allSaves[currentSlotId].data = mainGameState;
            localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
        }
        
        // Volver al juego principal
        window.location.href = `game.html?slot=${currentSlotId}`;
    }

    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        currentSlotId = parseInt(urlParams.get('slot'), 10);
        const isRecording = urlParams.get('recording') === 'true';

        if (isNaN(currentSlotId)) {
            document.body.innerHTML = '<h1>Error: Falta la ranura de guardado.</h1>';
            return;
        }

        // Cargar datos del juego principal
        let allSavesText = localStorage.getItem(SAVE_KEY);
        let allSaves = allSavesText ? JSON.parse(allSavesText) : [];
        mainGameState = allSaves[currentSlotId]?.data;

        if (!mainGameState) {
            document.body.innerHTML = '<h1>Error: No se pudo cargar la partida.</h1>';
            return;
        }

        // Inicializar el estado de PixelCraft si no existe
        if (!mainGameState.pixelCraft) {
            mainGameState.pixelCraft = {
                stats: { health: 100, hunger: 100 },
                time: { day: 1, hour: 8 }, // Empieza a las 8 AM
                inventory: {
                    materials: { wood: 0, stone: 0, coal: 0, iron_ore: 0, iron_ingot: 0, gold_ore: 0, gold_ingot: 0, diamond: 0, raw_meat: 0 },
                    tools: [],
                    weapons: [],
                    armor: [],
                    special: []
                },
                equipment: { weapon: null, helmet: null, chestplate: null, leggings: null, boots: null },
                bossDefeated: false
            };
        }
        pcState = mainGameState.pixelCraft;
        pcState.isRecording = isRecording;

        // --- Event Listeners ---
        document.getElementById('action-chop-wood').addEventListener('click', chopWood);
        document.getElementById('action-mine-stone').addEventListener('click', mineStone);
        document.getElementById('action-mine-deep').addEventListener('click', mineDeep);
        document.getElementById('action-hunt').addEventListener('click', hunt);
        document.getElementById('open-crafting-btn').addEventListener('click', openCraftingModal);
        document.getElementById('close-crafting-btn').addEventListener('click', () => document.getElementById('crafting-modal').classList.add('hidden'));
        document.getElementById('crafting-grid').addEventListener('click', (e) => {
            if (e.target.classList.contains('craft-btn')) {
                craftItem(e.target.dataset.itemId);
            }
        });
        document.getElementById('summon-boss-btn').addEventListener('click', () => {
            logMessage("¡Invocas al Golem Ancestral!");
            startCombat(JSON.parse(JSON.stringify(ENEMIES['boss'])));
        });
        document.getElementById('game-over-btn').addEventListener('click', saveAndExit);
        document.getElementById('save-exit-btn').addEventListener('click', saveAndExit);
        
        logMessage(isRecording ? '¡Comienza la grabación! Tu progreso se guardará como metraje.' : 'Has entrado a PixelCraft para pasar el rato.');
        updateUI();
    }

    init();
};