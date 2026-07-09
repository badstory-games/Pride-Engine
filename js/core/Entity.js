/**
 * @module core/Entity
 * @description Класс сущности в ECS архитектуре
 */

/**
 * @class Entity
 * @description Представляет игровой объект, который является контейнером для компонентов
 */
export class Entity {
    /** @type {number} */
    static nextId = 0;
    
    /**
     * @param {string} name - Имя сущности
     */
    constructor(name = 'Entity') {
        /** @type {number} */
        this.id = Entity.nextId++;
        
        /** @type {string} */
        this.name = name;
        
        /** @type {Map<string, Component>} */
        this.components = new Map();
        
        /** @type {boolean} */
        this.active = true;
    }
    
    /**
     * Добавляет компонент к сущности
     * @param {Component} component - Компонент для добавления
     */
    addComponent(component) {
        this.components.set(component.constructor.name, component);
        component.entity = this;
    }
    
    /**
     * Получает компонент по типу
     * @param {Function} componentType - Класс компонента
     * @returns {Component|undefined}
     */
    getComponent(componentType) {
        return this.components.get(componentType.name);
    }
    
    /**
     * Проверяет наличие компонента
     * @param {Function} componentType - Класс компонента
     * @returns {boolean}
     */
    hasComponent(componentType) {
        return this.components.has(componentType.name);
    }
    
    /**
     * Удаляет компонент
     * @param {Function} componentType - Класс компонента для удаления
     */
    removeComponent(componentType) {
        this.components.delete(componentType.name);
    }
}