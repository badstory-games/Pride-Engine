/**
 * @module components/TransformComponent
 * @description Компонент трансформации - позиция, поворот, масштаб
 */

import { Component } from '../core/Component.js';

/**
 * @class TransformComponent
 * @extends Component
 * @description Хранит данные о положении, повороте и масштабе сущности
 */
export class TransformComponent extends Component {
    /**
     * @param {number} x - Позиция по X
     * @param {number} y - Позиция по Y
     * @param {number} rotation - Поворот в радианах
     * @param {number} scaleX - Масштаб по X
     * @param {number} scaleY - Масштаб по Y
     */
    constructor(x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1) {
        super();
        
        /** @type {number} Позиция по оси X */
        this.x = x;
        
        /** @type {number} Позиция по оси Y */
        this.y = y;
        
        /** @type {number} Поворот в радианах */
        this.rotation = rotation;
        
        /** @type {number} Масштаб по оси X */
        this.scaleX = scaleX;
        
        /** @type {number} Масштаб по оси Y */
        this.scaleY = scaleY;
    }
    
    /**
     * Устанавливает позицию сущности
     * @param {number} x
     * @param {number} y
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Перемещает сущность на указанное расстояние
     * @param {number} dx
     * @param {number} dy
     */
    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    
    /**
     * Устанавливает поворот в градусах
     * @param {number} degrees - Угол в градусах
     */
    setRotationDegrees(degrees) {
        this.rotation = degrees * (Math.PI / 180);
    }
    
    /**
     * Получает поворот в градусах
     * @returns {number}
     */
    getRotationDegrees() {
        return this.rotation * (180 / Math.PI);
    }
}