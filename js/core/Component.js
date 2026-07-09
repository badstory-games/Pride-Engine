/**
 * @module core/Component
 * @description Базовый класс для компонентов в ECS
 */

/**
 * @class Component
 * @description Базовый класс компонента, хранящего данные
 */
export class Component {
    constructor() {
        /** @type {Entity} */
        this.entity = null;
    }
}

/**
 * @class TransformComponent
 * @extends Component
 * @description Компонент трансформации - позиция, поворот, масштаб
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
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
    }
}

/**
 * @class RenderComponent
 * @extends Component
 * @description Компонент для отрисовки спрайта
 */
export class RenderComponent extends Component {
    /**
     * @param {string} color - Цвет в формате RGBA
     * @param {number} width - Ширина
     * @param {number} height - Высота
     */
    constructor(color = '#e94560', width = 100, height = 100) {
        super();
        this.color = color;
        this.width = width;
        this.height = height;
        this.visible = true;
    }
}