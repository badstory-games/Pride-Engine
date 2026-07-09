/**
 * @module core/Component
 * @description Базовый класс для всех компонентов
 */

/**
 * @class Component
 * @description Базовый класс компонента, хранящего данные. 
 * Все компоненты наследуются от этого класса.
 */
export class Component {
    constructor() {
        /** @type {Entity|null} Ссылка на родительскую сущность */
        this.entity = null;
        
        /** @type {boolean} Активен ли компонент */
        this.enabled = true;
    }
    
    /**
     * Вызывается при добавлении компонента к сущности
     */
    onAttach() {
        // Переопределяется в наследниках
    }
    
    /**
     * Вызывается при удалении компонента из сущности
     */
    onDetach() {
        // Переопределяется в наследниках
    }
    
    /**
     * Получает компонент другого типа с той же сущности
     * @param {Function} componentType - Класс компонента
     * @returns {Component|null}
     */
    getComponent(componentType) {
        return this.entity ? this.entity.getComponent(componentType) : null;
    }
}