/**
 * @module editor/Editor
 * @description Визуальный редактор для Pride Engine
 */

import { Entity } from '../core/Entity.js';
import { TransformComponent, RenderComponent } from '../core/Component.js';

/**
 * @class Editor
 * @description Управляет интерфейсом редактора
 */
export class Editor {
    /**
     * @param {Engine} engine - Экземпляр движка
     */
    constructor(engine) {
        /** @type {Engine} */
        this.engine = engine;
        
        /** @type {Entity} */
        this.selectedEntity = null;
        
        /** @type {Object} */
        this.ui = {};
        
        this.initUI();
        this.setupEventListeners();
    }
    
    /**
     * Инициализирует элементы интерфейса
     * @private
     */
    initUI() {
        this.ui.entityList = document.getElementById('entity-list');
        this.ui.componentList = document.getElementById('component-list');
        this.ui.consoleOutput = document.getElementById('console-output');
        this.ui.canvas = document.getElementById('game-canvas');
    }
    
    /**
     * Настраивает обработчики событий
     * @private
     */
    setupEventListeners() {
        // Кнопки управления
        document.getElementById('btn-play').addEventListener('click', () => {
            this.engine.start();
            this.log('Игра запущена');
        });
        
        document.getElementById('btn-stop').addEventListener('click', () => {
            this.engine.stop();
            this.log('Игра остановлена');
        });
        
        document.getElementById('btn-pause').addEventListener('click', () => {
            this.engine.pause();
            this.log(this.engine.isPaused ? 'Игра на паузе' : 'Пауза снята');
        });
        
        // Добавление сущности
        document.getElementById('btn-add-entity').addEventListener('click', () => {
            this.createDefaultEntity();
        });
        
        // Сохранение сцены
        document.getElementById('btn-save').addEventListener('click', () => {
            this.saveScene();
        });
        
        // Загрузка сцены
        document.getElementById('btn-load').addEventListener('click', () => {
            this.loadScene();
        });
        
        // Изменение размера canvas
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }
    
    /**
     * Создает сущность по умолчанию
     */
    createDefaultEntity() {
        const entity = new Entity(`Entity_${Entity.nextId}`);
        entity.addComponent(new TransformComponent(
            Math.random() * 400,
            Math.random() * 300
        ));
        entity.addComponent(new RenderComponent('#e94560', 100, 100));
        
        this.engine.addEntity(entity);
        this.updateEntityList();
        this.log(`Создана сущность: ${entity.name}`);
    }
    
    /**
     * Обновляет список сущностей в редакторе
     */
    updateEntityList() {
        if (!this.ui.entityList) return;
        
        this.ui.entityList.innerHTML = '';
        
        for (const entity of this.engine.entities) {
            const element = document.createElement('div');
            element.className = 'entity-item';
            element.textContent = entity.name;
            
            if (entity === this.selectedEntity) {
                element.classList.add('selected');
            }
            
            element.addEventListener('click', () => {
                this.selectEntity(entity);
            });
            
            this.ui.entityList.appendChild(element);
        }
    }
    
    /**
     * Выбирает сущность для редактирования
     * @param {Entity} entity
     */
    selectEntity(entity) {
        this.selectedEntity = entity;
        this.updateEntityList();
        this.updateInspector();
        this.log(`Выбрана сущность: ${entity.name}`);
    }
    
    /**
     * Обновляет инспектор свойств
     */
    updateInspector() {
        if (!this.ui.componentList) return;
        
        this.ui.componentList.innerHTML = '';
        
        if (!this.selectedEntity) return;
        
        // Отображаем компоненты
        for (const [name, component] of this.selectedEntity.components) {
            const componentElement = document.createElement('div');
            componentElement.className = 'entity-item';
            componentElement.innerHTML = `<strong>${name}</strong>`;
            
            // Отображаем свойства компонента
            const properties = document.createElement('div');
            properties.style.marginTop = '5px';
            
            for (const [key, value] of Object.entries(component)) {
                if (key === 'entity') continue; // Пропускаем ссылку на entity
                
                const propElement = document.createElement('div');
                propElement.style.fontSize = '12px';
                propElement.textContent = `${key}: ${value}`;
                properties.appendChild(propElement);
            }
            
            componentElement.appendChild(properties);
            this.ui.componentList.appendChild(componentElement);
        }
    }
    
    /**
     * Сохраняет текущую сцену
     */
    saveScene() {
        const sceneData = {
            entities: this.engine.entities.map(entity => ({
                name: entity.name,
                components: Array.from(entity.components.entries()).map(([name, component]) => ({
                    type: name,
                    data: Object.fromEntries(
                        Object.entries(component).filter(([key]) => key !== 'entity')
                    )
                }))
            }))
        };
        
        localStorage.setItem('pride-engine-scene', JSON.stringify(sceneData));
        this.log('Сцена сохранена');
    }
    
    /**
     * Загружает сохраненную сцену
     */
    loadScene() {
        const saved = localStorage.getItem('pride-engine-scene');
        if (!saved) {
            this.log('Нет сохраненной сцены');
            return;
        }
        
        // Очищаем текущую сцену
        this.engine.entities = [];
        this.selectedEntity = null;
        
        const sceneData = JSON.parse(saved);
        
        // Восстанавливаем сущности
        for (const entityData of sceneData.entities) {
            const entity = new Entity(entityData.name);
            
            for (const compData of entityData.components) {
                // Создаем компонент в зависимости от типа
                if (compData.type === 'TransformComponent') {
                    entity.addComponent(new TransformComponent(
                        compData.data.x,
                        compData.data.y,
                        compData.data.rotation,
                        compData.data.scaleX,
                        compData.data.scaleY
                    ));
                } else if (compData.type === 'RenderComponent') {
                    entity.addComponent(new RenderComponent(
                        compData.data.color,
                        compData.data.width,
                        compData.data.height
                    ));
                }
            }
            
            this.engine.addEntity(entity);
        }
        
        this.updateEntityList();
        this.updateInspector();
        this.log('Сцена загружена');
    }
    
    /**
     * Изменяет размер canvas
     */
    resizeCanvas() {
        if (!this.ui.canvas) return;
        
        const container = this.ui.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight) * 0.9;
        
        this.ui.canvas.width = size;
        this.ui.canvas.height = size;
        this.engine.gl.viewport(0, 0, size, size);
    }
    
    /**
     * Выводит сообщение в консоль редактора
     * @param {string} message
     */
    log(message) {
        console.log(message);
        
        if (!this.ui.consoleOutput) return;
        
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.textContent = `[${time}] ${message}`;
        this.ui.consoleOutput.appendChild(entry);
        this.ui.consoleOutput.scrollTop = this.ui.consoleOutput.scrollHeight;
    }
}