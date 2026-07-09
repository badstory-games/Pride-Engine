/**
 * @module systems/MovementSystem
 * @description Система движения сущностей
 */

import { System } from '../core/System.js';
import { TransformComponent } from '../components/TransformComponent.js';
import { MovementComponent } from '../components/MovementComponent.js';

/**
 * @class MovementSystem
 * @extends System
 * @description Обновляет позиции сущностей на основе их скорости
 */
export class MovementSystem extends System {
    constructor() {
        super();
        this.name = 'MovementSystem';
    }
    
    /**
     * Обновляет позиции сущностей
     * @param {number} dt - Дельта времени
     * @param {Entity[]} entities - Список сущностей
     */
    update(dt, entities) {
        for (const entity of entities) {
            if (!entity.active) continue;
            
            const transform = entity.getComponent(TransformComponent);
            const movement = entity.getComponent(MovementComponent);
            
            if (!transform || !movement || movement.locked) continue;
            
            // Применяем трение
            if (movement.friction < 1.0) {
                movement.velocityX *= movement.friction;
                movement.velocityY *= movement.friction;
                
                // Останавливаем если скорость очень маленькая
                if (Math.abs(movement.velocityX) < 0.1) movement.velocityX = 0;
                if (Math.abs(movement.velocityY) < 0.1) movement.velocityY = 0;
            }
            
            // Обновляем позицию на основе скорости
            transform.x += movement.velocityX * dt;
            transform.y += movement.velocityY * dt;
        }
    }
}