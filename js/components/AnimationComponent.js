/**
 * @module components/AnimationComponent
 * @description Компонент анимации для спрайтов
 */

import { Component } from '../core/Component.js';

/**
 * @class AnimationComponent
 * @extends Component
 * @description Хранит данные для спрайтовой анимации
 */
export class AnimationComponent extends Component {
    constructor() {
        super();
        
        /** @type {Map<string, Object>} Карта анимаций */
        this.animations = new Map();
        
        /** @type {string} Текущая проигрываемая анимация */
        this.currentAnimation = null;
        
        /** @type {number} Текущий кадр */
        this.currentFrame = 0;
        
        /** @type {number} Время с последней смены кадра */
        this.frameTimer = 0;
        
        /** @type {boolean} Проигрывается ли анимация */
        this.isPlaying = false;
        
        /** @type {boolean} Зациклена ли анимация */
        this.loop = true;
        
        /** @type {number} Скорость анимации (множитель) */
        this.speed = 1.0;
    }
    
    /**
     * Добавляет анимацию
     * @param {string} name - Название анимации
     * @param {Object} config - Конфигурация анимации
     * @param {number[]} config.frames - Массив индексов кадров
     * @param {number} config.frameTime - Время показа одного кадра в секундах
     * @param {boolean} config.loop - Зациклена ли анимация
     */
    addAnimation(name, config) {
        this.animations.set(name, {
            frames: config.frames || [0],
            frameTime: config.frameTime || 0.1,
            loop: config.loop !== undefined ? config.loop : true
        });
    }
    
    /**
     * Проигрывает указанную анимацию
     * @param {string} name - Название анимации
     */
    play(name) {
        if (!this.animations.has(name)) return;
        
        this.currentAnimation = name;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.isPlaying = true;
        
        const anim = this.animations.get(name);
        this.loop = anim.loop;
    }
    
    /**
     * Останавливает анимацию
     */
    stop() {
        this.isPlaying = false;
    }
    
    /**
     * Получает индекс текущего кадра
     * @returns {number}
     */
    getCurrentFrameIndex() {
        if (!this.currentAnimation || !this.animations.has(this.currentAnimation)) {
            return 0;
        }
        
        const anim = this.animations.get(this.currentAnimation);
        return anim.frames[this.currentFrame] || 0;
    }
}