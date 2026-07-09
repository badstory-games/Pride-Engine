/**
 * @module components/MovementComponent
 * @description Компонент для движения сущности
 */

import { Component } from '../core/Component.js';

/**
 * @class MovementComponent
 * @extends Component
 * @description Хранит данные о скорости и направлении движения
 */
export class MovementComponent extends Component {
    /**
     * @param {number} speed - Базовая скорость движения в пикселях в секунду
     */
    constructor(speed = 200) {
        super();
        
        /** @type {number} Базовая скорость */
        this.speed = speed;
        
        /** @type {number} Текущая скорость по X */
        this.velocityX = 0;
        
        /** @type {number} Текущая скорость по Y */
        this.velocityY = 0;
        
        /** @type {number} Максимальная скорость */
        this.maxSpeed = 1000;
        
        /** @type {number} Ускорение */
        this.acceleration = 0;
        
        /** @type {number} Трение (0-1, где 1 - нет трения) */
        this.friction = 1.0;
        
        /** @type {boolean} Заблокировано ли движение */
        this.locked = false;
    }
    
    /**
     * Устанавливает скорость движения
     * @param {number} vx - Скорость по X
     * @param {number} vy - Скорость по Y
     */
    setVelocity(vx, vy) {
        if (this.locked) return;
        
        this.velocityX = vx;
        this.velocityY = vy;
        
        // Ограничиваем максимальную скорость
        const currentSpeed = Math.sqrt(vx * vx + vy * vy);
        if (currentSpeed > this.maxSpeed) {
            const ratio = this.maxSpeed / currentSpeed;
            this.velocityX *= ratio;
            this.velocityY *= ratio;
        }
    }
    
    /**
     * Останавливает движение
     */
    stop() {
        this.velocityX = 0;
        this.velocityY = 0;
    }
}