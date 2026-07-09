/**
 * @module core/System
 * @description Базовый класс для систем в ECS
 */

/**
 * @class System
 * @description Базовый класс системы, содержащей логику
 */
export class System {
    constructor() {
        /** @type {string} */
        this.name = 'System';
    }
    
    /**
     * Обновляет систему
     * @param {number} dt - Дельта времени
     * @param {Entity[]} entities - Список всех сущностей
     */
    update(dt, entities) {
        // Базовая реализация, переопределяется в наследниках
    }
    
    /**
     * Рендерит систему (если нужно)
     * @param {WebGL2RenderingContext} gl - Контекст WebGL2
     * @param {Entity[]} entities - Список всех сущностей
     */
    render(gl, entities) {
        // Базовая реализация, переопределяется в наследниках
    }
}