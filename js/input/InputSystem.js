/**
 * @module input/InputSystem
 * @description Система обработки ввода с клавиатуры и мыши
 */

import { System } from '../core/System.js';

/**
 * @class InputSystem
 * @extends System
 * @description Обрабатывает пользовательский ввод и сохраняет его состояние
 */
export class InputSystem extends System {
    constructor() {
        super();
        this.name = 'InputSystem';
        
        /** @type {Map<string, boolean>} Состояние клавиш */
        this.keys = new Map();
        
        /** @type {Map<string, boolean>} Клавиши, нажатые в этом кадре */
        this.keysDown = new Map();
        
        /** @type {Map<string, boolean>} Клавиши, отпущенные в этом кадре */
        this.keysUp = new Map();
        
        /** @type {{x: number, y: number, isDown: boolean, button: number}} Состояние мыши */
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            button: -1,
            worldX: 0,
            worldY: 0
        };
        
        /** @type {{x: number, y: number, isDown: boolean, button: number}} Предыдущее состояние мыши */
        this.mouseDown = false;
        this.mouseClicked = false;
        
        /** @type {HTMLCanvasElement} */
        this.canvas = null;
        
        /** @type {Function[]} */
        this._boundHandlers = [];
    }
    
    /**
     * Инициализирует систему ввода
     * @param {HTMLCanvasElement} canvas - Целевой canvas
     */
    init(canvas) {
        this.canvas = canvas;
        
        // Обработчики клавиатуры
        const keyDownHandler = (e) => {
            if (!this.keys.get(e.key)) {
                this.keysDown.set(e.key, true);
            }
            this.keys.set(e.key, true);
        };
        
        const keyUpHandler = (e) => {
            this.keys.set(e.key, false);
            this.keysUp.set(e.key, true);
        };
        
        // Обработчики мыши
        const mouseMoveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            
            // Конвертируем в мировые координаты (пока просто масштабируем)
            this.mouse.worldX = (this.mouse.x / rect.width) * this.canvas.width;
            this.mouse.worldY = (this.mouse.y / rect.height) * this.canvas.height;
        };
        
        const mouseDownHandler = (e) => {
            this.mouse.isDown = true;
            this.mouse.button = e.button;
            this.mouseClicked = true;
        };
        
        const mouseUpHandler = (e) => {
            this.mouse.isDown = false;
            this.mouse.button = -1;
        };
        
        // Предотвращаем стандартное поведение для canvas
        const preventDefaultHandler = (e) => {
            e.preventDefault();
        };
        
        // Привязываем обработчики
        window.addEventListener('keydown', keyDownHandler);
        window.addEventListener('keyup', keyUpHandler);
        this.canvas.addEventListener('mousemove', mouseMoveHandler);
        this.canvas.addEventListener('mousedown', mouseDownHandler);
        this.canvas.addEventListener('mouseup', mouseUpHandler);
        this.canvas.addEventListener('contextmenu', preventDefaultHandler);
        
        // Сохраняем для возможной очистки
        this._boundHandlers = [
            { target: window, type: 'keydown', handler: keyDownHandler },
            { target: window, type: 'keyup', handler: keyUpHandler },
            { target: this.canvas, type: 'mousemove', handler: mouseMoveHandler },
            { target: this.canvas, type: 'mousedown', handler: mouseDownHandler },
            { target: this.canvas, type: 'mouseup', handler: mouseUpHandler },
            { target: this.canvas, type: 'contextmenu', handler: preventDefaultHandler }
        ];
    }
    
    /**
     * Проверяет, удерживается ли клавиша
     * @param {string} key - Название клавиши
     * @returns {boolean}
     */
    isKeyDown(key) {
        return this.keys.get(key) || false;
    }
    
    /**
     * Проверяет, была ли клавиша нажата в этом кадре
     * @param {string} key - Название клавиши
     * @returns {boolean}
     */
    isKeyPressed(key) {
        return this.keysDown.get(key) || false;
    }
    
    /**
     * Проверяет, была ли клавиша отпущена в этом кадре
     * @param {string} key - Название клавиши
     * @returns {boolean}
     */
    isKeyReleased(key) {
        return this.keysUp.get(key) || false;
    }
    
    /**
     * Проверяет, был ли клик мыши в этом кадре
     * @returns {boolean}
     */
    isMouseClicked() {
        return this.mouseClicked;
    }
    
    /**
     * Обновляет систему ввода (сбрасывает состояния одного кадра)
     * @param {number} dt - Дельта времени
     * @param {Entity[]} entities - Сущности
     */
    update(dt, entities) {
        // Сбрасываем состояния одного кадра
        this.keysDown.clear();
        this.keysUp.clear();
        this.mouseClicked = false;
    }
    
    /**
     * Очищает все обработчики событий
     */
    destroy() {
        for (const { target, type, handler } of this._boundHandlers) {
            target.removeEventListener(type, handler);
        }
        this._boundHandlers = [];
    }
}