/**
 * @module core/Engine
 * @description Главный класс игрового движка Pride Engine
 */

/**
 * @class Engine
 * @description Управляет основным игровым циклом, сущностями и системами
 */
export class Engine {
    /**
     * @param {HTMLCanvasElement} canvas - Элемент canvas для рендеринга
     */
    constructor(canvas) {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;
        
        /** @type {WebGL2RenderingContext} */
        this.gl = null;
        
        /** @type {Entity[]} */
        this.entities = [];
        
        /** @type {System[]} */
        this.systems = [];
        
        /** @type {boolean} */
        this.isRunning = false;
        
        /** @type {boolean} */
        this.isPaused = false;
        
        /** @type {number} */
        this.lastTime = 0;
        
        /** @type {number} */
        this.deltaTime = 0;
        
        this.init();
    }
    
    /**
     * Инициализирует WebGL2 контекст
     * @private
     */
    init() {
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            throw new Error('WebGL2 не поддерживается');
        }
        
        // Базовые настройки WebGL2
        this.gl.clearColor(0.1, 0.1, 0.2, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
    
    /**
     * Запускает игровой цикл
     */
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    /**
     * Останавливает игровой цикл
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Ставит игру на паузу
     */
    pause() {
        this.isPaused = !this.isPaused;
    }
    
    /**
     * Главный игровой цикл
     * @private
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            this.update(this.deltaTime);
            this.render();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Обновляет все системы
     * @param {number} dt - Дельта времени
     */
    update(dt) {
        for (const system of this.systems) {
            system.update(dt, this.entities);
        }
    }
    
    /**
     * Рендерит сцену
     */
    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        for (const system of this.systems) {
            if (system.render) {
                system.render(this.gl, this.entities);
            }
        }
    }
    
    /**
     * Добавляет сущность в движок
     * @param {Entity} entity - Сущность для добавления
     */
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    /**
     * Удаляет сущность из движка
     * @param {Entity} entity - Сущность для удаления
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }
    
    /**
     * Добавляет систему в движок
     * @param {System} system - Система для добавления
     */
    addSystem(system) {
        this.systems.push(system);
    }
}