/**
 * @module systems/PlayerControlSystem
 * @description Система управления сущностью с клавиатуры
 */

import { System } from '../core/System.js';
import { MovementComponent } from '../components/MovementComponent.js';

/**
 * @class PlayerControlSystem
 * @extends System
 * @description Обрабатывает ввод игрока и управляет сущностью
 */
export class PlayerControlSystem extends System {
    /**
     * @param {InputSystem} inputSystem - Ссылка на систему ввода
     */
    constructor(inputSystem) {
        super();
        this.name = 'PlayerControlSystem';
        
        /** @type {InputSystem} */
        this.input = inputSystem;
    }
    
    /**
     * Обновляет управление игроком
     * @param {number} dt - Дельта времени
     * @param {Entity[]} entities - Список сущностей
     */
    update(dt, entities) {
        for (const entity of entities) {
            if (!entity.active) continue;
            
            const movement = entity.getComponent(MovementComponent);
            if (!movement) continue;
            
            // Сбрасываем скорость
            movement.velocityX = 0;
            movement.velocityY = 0;
            
            // Обрабатываем ввод
            if (this.input.isKeyDown('ArrowLeft') || this.input.isKeyDown('a') || this.input.isKeyDown('A')) {
                movement.velocityX = -movement.speed;
            }
            if (this.input.isKeyDown('ArrowRight') || this.input.isKeyDown('d') || this.input.isKeyDown('D')) {
                movement.velocityX = movement.speed;
            }
            if (this.input.isKeyDown('ArrowUp') || this.input.isKeyDown('w') || this.input.isKeyDown('W')) {
                movement.velocityY = -movement.speed;
            }
            if (this.input.isKeyDown('ArrowDown') || this.input.isKeyDown('s') || this.input.isKeyDown('S')) {
                movement.velocityY = movement.speed;
            }
            
            // Нормализуем диагональное движение
            if (movement.velocityX !== 0 && movement.velocityY !== 0) {
                const length = Math.sqrt(movement.velocityX * movement.velocityX + movement.velocityY * movement.velocityY);
                movement.velocityX = (movement.velocityX / length) * movement.speed;
                movement.velocityY = (movement.velocityY / length) * movement.speed;
            }
        }
    }
}