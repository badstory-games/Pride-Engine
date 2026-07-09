/**
 * @module components/ScriptComponent
 * @description Компонент для пользовательских скриптов поведения
 */

import { Component } from '../core/Component.js';

/**
 * @class ScriptComponent
 * @extends Component
 * @description Позволяет прикреплять пользовательские скрипты к сущности
 */
export class ScriptComponent extends Component {
    constructor() {
        super();
        
        /** @type {Object} Контекст скрипта (данные) */
        this.data = {};
        
        /** @type {Function[]} Функции инициализации */
        this._initFunctions = [];
        
        /** @type {Function[]} Функции обновления */
        this._updateFunctions = [];
        
        /** @type {Function[]} Функции рендеринга */
        this._renderFunctions = [];
    }
    
    /**
     * Добавляет функцию инициализации
     * @param {Function} fn - Функция инициализации
     */
    onInit(fn) {
        this._initFunctions.push(fn);
    }
    
    /**
     * Добавляет функцию обновления
     * @param {Function} fn - Функция, вызываемая каждый кадр
     */
    onUpdate(fn) {
        this._updateFunctions.push(fn);
    }
    
    /**
     * Добавляет функцию рендеринга
     * @param {Function} fn - Функция рендеринга
     */
    onRender(fn) {
        this._renderFunctions.push(fn);
    }
    
    /**
     * Выполняет все функции инициализации
     */
    init() {
        for (const fn of this._initFunctions) {
            fn(this);
        }
    }
    
    /**
     * Выполняет все функции обновления
     * @param {number} dt - Дельта времени
     */
    update(dt) {
        for (const fn of this._updateFunctions) {
            fn(this, dt);
        }
    }
    
    /**
     * Выполняет все функции рендеринга
     * @param {WebGL2RenderingContext} gl - Контекст WebGL
     */
    render(gl) {
        for (const fn of this._renderFunctions) {
            fn(this, gl);
        }
    }
}