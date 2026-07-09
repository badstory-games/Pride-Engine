/**
 * @module components/RenderComponent
 * @description Компонент для визуального отображения сущности
 */

import { Component } from '../core/Component.js';

/**
 * @class RenderComponent
 * @extends Component
 * @description Хранит данные для отрисовки спрайта или геометрической фигуры
 */
export class RenderComponent extends Component {
    /**
     * @param {string} color - Цвет в формате hex (#RRGGBB)
     * @param {number} width - Ширина спрайта
     * @param {number} height - Высота спрайта
     */
    constructor(color = '#e94560', width = 100, height = 100) {
        super();
        
        /** @type {string} Цвет заливки */
        this.color = color;
        
        /** @type {number} Ширина */
        this.width = width;
        
        /** @type {number} Высота */
        this.height = height;
        
        /** @type {boolean} Видимость */
        this.visible = true;
        
        /** @type {number} Прозрачность (0-1) */
        this.opacity = 1.0;
        
        /** @type {string|null} Путь к текстуре (если есть) */
        this.texture = null;
        
        /** @type {number} Порядок отрисовки (Z-order) */
        this.zIndex = 0;
    }
    
    /**
     * Устанавливает цвет компонента
     * @param {string} color - Цвет в формате hex
     */
    setColor(color) {
        this.color = color;
    }
    
    /**
     * Устанавливает размеры
     * @param {number} width
     * @param {number} height
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
}