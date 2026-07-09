/**
 * @module components/PhysicsComponent
 * @description Компонент физики для сущности
 */

import { Component } from '../core/Component.js';

/**
 * @class PhysicsComponent
 * @extends Component
 * @description Хранит физические свойства сущности
 */
export class PhysicsComponent extends Component {
    /**
     * @param {Object} options - Параметры физики
     */
    constructor(options = {}) {
        super();
        
        /** @type {number} Масса (0 - статический объект) */
        this.mass = options.mass || 1;
        
        /** @type {boolean} Подвержен ли гравитации */
        this.useGravity = options.useGravity !== undefined ? options.useGravity : true;
        
        /** @type {boolean} Является ли твердым телом */
        this.isRigid = options.isRigid !== undefined ? options.isRigid : true;
        
        /** @type {boolean} Статический объект (не двигается) */
        this.isStatic = options.isStatic || false;
        
        /** @type {number} Эластичность (0-1) */
        this.restitution = options.restitution || 0.5;
        
        /** @type {number} Трение поверхности */
        this.friction = options.friction || 0.3;
        
        /** @type {{x: number, y: number}} Силы, действующие на объект */
        this.forces = { x: 0, y: 0 };
        
        /** @type {string} Тип коллайдера ('box', 'circle') */
        this.colliderType = options.colliderType || 'box';
        
        /** @type {number} Радиус коллайдера (для circle) */
        this.radius = options.radius || 50;
        
        /** @type {string[]} Группы коллизий */
        this.collisionGroups = options.collisionGroups || ['default'];
        
        /** @type {string[]} С какими группами проверять коллизии */
        this.collidesWith = options.collidesWith || ['default'];
        
        /** @type {boolean} Включены ли коллизии */
        this.collisionsEnabled = true;
    }
    
    /**
     * Применяет силу к объекту
     * @param {number} fx - Сила по X
     * @param {number} fy - Сила по Y
     */
    applyForce(fx, fy) {
        this.forces.x += fx;
        this.forces.y += fy;
    }
    
    /**
     * Сбрасывает приложенные силы
     */
    clearForces() {
        this.forces.x = 0;
        this.forces.y = 0;
    }
}