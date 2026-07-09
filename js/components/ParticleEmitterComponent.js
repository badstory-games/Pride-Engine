/**
 * @module components/ParticleEmitterComponent
 * @description Компонент системы частиц
 */

import { Component } from '../core/Component.js';

/**
 * @class ParticleEmitterComponent
 * @extends Component
 * @description Конфигурация эмиттера частиц
 */
export class ParticleEmitterComponent extends Component {
    /**
     * @param {Object} config - Конфигурация эмиттера
     */
    constructor(config = {}) {
        super();
        
        /** @type {boolean} Активен ли эмиттер */
        this.active = config.active !== undefined ? config.active : true;
        
        /** @type {number} Количество частиц в секунду */
        this.emissionRate = config.emissionRate || 10;
        
        /** @type {number} Максимальное количество частиц */
        this.maxParticles = config.maxParticles || 100;
        
        /** @type {number} Время жизни частицы в секундах */
        this.lifetime = config.lifetime || 2;
        
        /** @type {number} Начальная скорость */
        this.speed = config.speed || 100;
        
        /** @type {number} Разброс скорости */
        this.speedVariance = config.speedVariance || 50;
        
        /** @type {number} Угол разброса в радианах */
        this.spreadAngle = config.spreadAngle || Math.PI * 2;
        
        /** @type {string} Начальный цвет */
        this.startColor = config.startColor || '#ffffff';
        
        /** @type {string} Конечный цвет */
        this.endColor = config.endColor || '#ffffff00';
        
        /** @type {number} Начальный размер */
        this.startSize = config.startSize || 10;
        
        /** @type {number} Конечный размер */
        this.endSize = config.endSize || 0;
        
        /** @type {number} Гравитация частиц */
        this.gravity = config.gravity || 0;
        
        /** @type {number} Таймер эмиссии */
        this.emissionTimer = 0;
    }
}