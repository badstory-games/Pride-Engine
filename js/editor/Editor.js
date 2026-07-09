/**
 * @module editor/Editor
 * @description Визуальный редактор для Pride Engine
 */

import { Entity } from '../core/Entity.js';
import { TransformComponent } from '../components/TransformComponent.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { MovementComponent } from '../components/MovementComponent.js';

/**
 * @class Editor
 * @description Управляет интерфейсом редактора
 */
export class Editor {
    /**
     * @param {Engine} engine - Экземпляр движка
     * @param {InputSystem} inputSystem - Система ввода
     */
    constructor(engine, inputSystem) {
        /** @type {Engine} */
        this.engine = engine;
        
        /** @type {InputSystem} */
        this.inputSystem = inputSystem;
        
        /** @type {Entity} */
        this.selectedEntity = null;
        
        /** @type {Object} */
        this.ui = {};
        
        /** @type {boolean} */
        this.isDragging = false;
        
        /** @type {{x: number, y: number}} */
        this.dragOffset = { x: 0, y: 0 };
        
        /** @type {string[]} */
        this.logHistory = [];
        
        /** @type {number} */
        this.maxLogEntries = 100;
        
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
        this.ui.toolbar = document.getElementById('toolbar');
        this.ui.statusBar = this.createStatusBar();
    }
    
    /**
     * Создает строку состояния
     * @returns {HTMLElement}
     */
    createStatusBar() {
        const statusBar = document.createElement('div');
        statusBar.id = 'status-bar';
        statusBar.style.cssText = `
            background: #0f3460;
            padding: 5px 10px;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
        `;
        document.getElementById('app').appendChild(statusBar);
        return statusBar;
    }
    
    /**
     * Настраивает обработчики событий
     * @private
     */
    setupEventListeners() {
        // Кнопки управления
        document.getElementById('btn-play').addEventListener('click', () => {
            this.engine.start();
            this.log('▶ Игра запущена');
        });
        
        document.getElementById('btn-stop').addEventListener('click', () => {
            this.engine.stop();
            this.log('■ Игра остановлена');
        });
        
        document.getElementById('btn-pause').addEventListener('click', () => {
            this.engine.pause();
            this.log(this.engine.isPaused ? '⏸ Игра на паузе' : '▶ Пауза снята');
        });
        
        // Добавление разных типов сущностей
        document.getElementById('btn-add-entity').addEventListener('click', () => {
            this.showAddEntityMenu();
        });
        
        // Сохранение и загрузка
        document.getElementById('btn-save').addEventListener('click', () => {
            this.saveScene();
        });
        
        document.getElementById('btn-load').addEventListener('click', () => {
            this.loadScene();
        });
        
        // Canvas события для редактора
        this.ui.canvas.addEventListener('mousedown', (e) => {
            this.handleCanvasMouseDown(e);
        });
        
        this.ui.canvas.addEventListener('mousemove', (e) => {
            this.handleCanvasMouseMove(e);
        });
        
        this.ui.canvas.addEventListener('mouseup', (e) => {
            this.handleCanvasMouseUp(e);
        });
        
        // Горячие клавиши
        window.addEventListener('keydown', (e) => {
            this.handleHotkeys(e);
        });
        
        // Изменение размера canvas
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
        
        // Обновление редактора каждый кадр
        const updateEditorUI = () => {
            this.updateStatusBar();
            if (this.engine.isRunning) {
                this.updateEntityList();
                if (this.selectedEntity) {
                    this.updateInspector();
                }
            }
            requestAnimationFrame(updateEditorUI);
        };
        updateEditorUI();
    }
    
    /**
     * Обрабатывает горячие клавиши
     * @param {KeyboardEvent} e
     */
    handleHotkeys(e) {
        // Ctrl+S - сохранить
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveScene();
        }
        
        // Ctrl+Z - отмена (пока заглушка)
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this.log('Отмена (в разработке)');
        }
        
        // Delete - удалить выбранную сущность
        if (e.key === 'Delete' && this.selectedEntity) {
            e.preventDefault();
            this.deleteSelectedEntity();
        }
        
        // N - новая сущность
        if (e.key === 'n' && !e.ctrlKey) {
            e.preventDefault();
            this.createDefaultEntity();
        }
    }
    
    /**
     * Показывает меню добавления сущности
     */
    showAddEntityMenu() {
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            background: #16213e;
            border: 1px solid #e94560;
            border-radius: 4px;
            padding: 10px;
            z-index: 1000;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        `;
        
        const options = [
            { name: 'Пустая сущность', action: () => this.createEmptyEntity() },
            { name: 'Спрайт', action: () => this.createSpriteEntity() },
            { name: 'Игрок (с управлением)', action: () => this.createPlayerEntity() }
        ];
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.name;
            btn.style.cssText = `
                display: block;
                width: 100%;
                margin: 5px 0;
                background: #0f3460;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            `;
            btn.addEventListener('click', () => {
                opt.action();
                menu.remove();
            });
            menu.appendChild(btn);
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Отмена';
        closeBtn.style.cssText = `
            display: block;
            width: 100%;
            margin: 5px 0;
            background: #333;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        `;
        closeBtn.addEventListener('click', () => menu.remove());
        menu.appendChild(closeBtn);
        
        document.body.appendChild(menu);
    }
    
    /**
     * Создает пустую сущность
     */
    createEmptyEntity() {
        const entity = new Entity(`Empty_${Entity.nextId}`);
        entity.addComponent(new TransformComponent(200, 150));
        this.engine.addEntity(entity);
        this.selectEntity(entity);
        this.log(`Создана пустая сущность: ${entity.name}`);
    }
    
    /**
     * Создает сущность-спрайт
     */
    createSpriteEntity() {
        const entity = new Entity(`Sprite_${Entity.nextId}`);
        entity.addComponent(new TransformComponent(200, 150));
        entity.addComponent(new RenderComponent('#e94560', 100, 100));
        this.engine.addEntity(entity);
        this.selectEntity(entity);
        this.log(`Создан спрайт: ${entity.name}`);
    }
    
    /**
     * Создает сущность игрока
     */
    createPlayerEntity() {
        const entity = new Entity(`Player_${Entity.nextId}`);
        entity.addComponent(new TransformComponent(200, 150));
        entity.addComponent(new RenderComponent('#00ff00', 50, 50));
        entity.addComponent(new MovementComponent(300));
        this.engine.addEntity(entity);
        this.selectEntity(entity);
        this.log(`Создан игрок: ${entity.name}. Используйте WASD/стрелки для управления`);
    }
    
    /**
     * Создает сущность по умолчанию
     */
    createDefaultEntity() {
        this.createSpriteEntity();
    }
    
    /**
     * Удаляет выбранную сущность
     */
    deleteSelectedEntity() {
        if (!this.selectedEntity) return;
        
        const name = this.selectedEntity.name;
        this.engine.removeEntity(this.selectedEntity);
        this.selectedEntity = null;
        this.updateEntityList();
        this.updateInspector();
        this.log(`Удалена сущность: ${name}`);
    }
    
    /**
     * Обрабатывает нажатие мыши на canvas
     * @param {MouseEvent} e
     */
    handleCanvasMouseDown(e) {
        const rect = this.ui.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.ui.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.ui.canvas.height / rect.height);
        
        // Проверяем, попали ли по какой-то сущности
        let hitEntity = null;
        for (let i = this.engine.entities.length - 1; i >= 0; i--) {
            const entity = this.engine.entities[i];
            if (!entity.active) continue;
            
            const transform = entity.getComponent(TransformComponent);
            const render = entity.getComponent(RenderComponent);
            
            if (!transform || !render) continue;
            
            // Простая AABB проверка
            if (x >= transform.x && x <= transform.x + render.width * transform.scaleX &&
                y >= transform.y && y <= transform.y + render.height * transform.scaleY) {
                hitEntity = entity;
                break;
            }
        }
        
        if (hitEntity) {
            this.selectEntity(hitEntity);
            
            // Начинаем перетаскивание
            if (!this.engine.isRunning) {
                const transform = hitEntity.getComponent(TransformComponent);
                this.isDragging = true;
                this.dragOffset.x = x - transform.x;
                this.dragOffset.y = y - transform.y;
            }
        } else {
            this.selectedEntity = null;
            this.updateEntityList();
            this.updateInspector();
        }
    }
    
    /**
     * Обрабатывает движение мыши на canvas
     * @param {MouseEvent} e
     */
    handleCanvasMouseMove(e) {
        if (!this.isDragging || !this.selectedEntity) return;
        
        const rect = this.ui.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.ui.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.ui.canvas.height / rect.height);
        
        const transform = this.selectedEntity.getComponent(TransformComponent);
        if (transform) {
            transform.x = x - this.dragOffset.x;
            transform.y = y - this.dragOffset.y;
        }
    }
    
    /**
     * Обрабатывает отпускание мыши на canvas
     * @param {MouseEvent} e
     */
    handleCanvasMouseUp(e) {
        this.isDragging = false;
    }
    
    /**
     * Обновляет список сущностей в редакторе
     */
    updateEntityList() {
        if (!this.ui.entityList) return;
        
        this.ui.entityList.innerHTML = `
            <div style="padding: 5px; color: #666; font-size: 12px;">
                Сущностей: ${this.engine.entities.length}
            </div>
        `;
        
        for (const entity of this.engine.entities) {
            const element = document.createElement('div');
            element.className = 'entity-item';
            
            const transform = entity.getComponent(TransformComponent);
            const posInfo = transform ? 
                ` (${Math.round(transform.x)}, ${Math.round(transform.y)})` : '';
            
            element.innerHTML = `
                <span>${entity.name}</span>
                <span style="font-size: 10px; color: #999;">${posInfo}</span>
            `;
            
            if (entity === this.selectedEntity) {
                element.classList.add('selected');
            }
            
            element.addEventListener('click', () => {
                this.selectEntity(entity);
            });
            
            // Двойной клик для фокусировки
            element.addEventListener('dblclick', () => {
                this.focusOnEntity(entity);
            });
            
            this.ui.entityList.appendChild(element);
        }
    }
    
    /**
     * Фокусирует viewport на сущности
     * @param {Entity} entity
     */
    focusOnEntity(entity) {
        const transform = entity.getComponent(TransformComponent);
        if (transform) {
            this.log(`Фокус на ${entity.name} (${Math.round(transform.x)}, ${Math.round(transform.y)})`);
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
        
        if (!this.selectedEntity) {
            this.ui.componentList.innerHTML = '<p style="color: #666;">Выберите сущность для просмотра свойств</p>';
            return;
        }
        
        let html = `<h3>${this.selectedEntity.name}</h3>`;
        html += `<p style="font-size: 12px; color: #666;">ID: ${this.selectedEntity.id}</p>`;
        
        // Кнопки управления сущностью
        html += `
            <div style="margin: 10px 0;">
                <button class="small-btn" onclick="document.dispatchEvent(new CustomEvent('delete-entity', {detail: ${this.selectedEntity.id}}))">
                    🗑 Удалить
                </button>
                <button class="small-btn" onclick="document.dispatchEvent(new CustomEvent('duplicate-entity', {detail: ${this.selectedEntity.id}}))">
                    📋 Дублировать
                </button>
            </div>
        `;
        
        // Отображаем компоненты
        for (const [name, component] of this.selectedEntity.components) {
            html += '<div class="component-card">';
            html += `<h4>${name}</h4>`;
            
            // Отображаем свойства компонента
            for (const [key, value] of Object.entries(component)) {
                if (key === 'entity') continue;
                
                html += `
                    <div class="property-row">
                        <label>${key}:</label>
                        <input type="text" 
                               value="${value}" 
                               data-component="${name}"
                               data-property="${key}"
                               class="property-input"
                               ${this.engine.isRunning ? 'disabled' : ''}>
                    </div>
                `;
            }
            
            html += '</div>';
        }
        
        this.ui.componentList.innerHTML = html;
        
        // Добавляем обработчики для input'ов
        this.ui.componentList.querySelectorAll('.property-input').forEach(input => {
            input.addEventListener('change', (e) => {
                if (this.engine.isRunning) return;
                
                const componentName = e.target.dataset.component;
                const property = e.target.dataset.property;
                const component = this.selectedEntity.components.get(componentName);
                
                if (component) {
                    const oldValue = component[property];
                    let newValue = e.target.value;
                    
                    // Конвертируем тип
                    if (typeof oldValue === 'number') {
                        newValue = parseFloat(newValue);
                    } else if (typeof oldValue === 'boolean') {
                        newValue = newValue === 'true';
                    }
                    
                    component[property] = newValue;
                    this.log(`Изменено свойство ${componentName}.${property}: ${oldValue} → ${newValue}`);
                }
            });
        });
    }
    
    /**
     * Обновляет строку состояния
     */
    updateStatusBar() {
        if (!this.ui.statusBar) return;
        
        const fps = this.engine.isRunning ? Math.round(1 / this.engine.deltaTime) : 0;
        const entityCount = this.engine.entities.length;
        const mousePos = this.inputSystem.mouse;
        
        this.ui.statusBar.innerHTML = `
            <span>FPS: ${fps} | Сущностей: ${entityCount}</span>
            <span>Мышь: (${Math.round(mousePos.worldX)}, ${Math.round(mousePos.worldY)}) | 
                  ${this.engine.isRunning ? '▶ Игра запущена' : '■ Редактирование'}</span>
        `;
    }
    
    /**
     * Сохраняет текущую сцену
     */
    saveScene() {
        const sceneData = {
            version: '0.1.0',
            timestamp: Date.now(),
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
        
        try {
            localStorage.setItem('pride-engine-scene', JSON.stringify(sceneData));
            this.log('💾 Сцена сохранена в localStorage');
        } catch (e) {
            this.log('❌ Ошибка сохранения: ' + e.message);
        }
    }
    
    /**
     * Загружает сохраненную сцену
     */
    loadScene() {
        const saved = localStorage.getItem('pride-engine-scene');
        if (!saved) {
            this.log('❌ Нет сохраненной сцены');
            return;
        }
        
        try {
            // Очищаем текущую сцену
            this.engine.entities = [];
            this.selectedEntity = null;
            
            const sceneData = JSON.parse(saved);
            
            // Восстанавливаем сущности
            for (const entityData of sceneData.entities) {
                const entity = new Entity(entityData.name);
                
                for (const compData of entityData.components) {
                    let component;
                    
                    // Создаем компонент в зависимости от типа
                    switch (compData.type) {
                        case 'TransformComponent':
                            component = new TransformComponent(
                                compData.data.x,
                                compData.data.y,
                                compData.data.rotation,
                                compData.data.scaleX,
                                compData.data.scaleY
                            );
                            break;
                        case 'RenderComponent':
                            component = new RenderComponent(
                                compData.data.color,
                                compData.data.width,
                                compData.data.height
                            );
                            break;
                        case 'MovementComponent':
                            component = new MovementComponent(compData.data.speed);
                            if (compData.data.velocityX !== undefined) {
                                component.velocityX = compData.data.velocityX;
                            }
                            if (compData.data.velocityY !== undefined) {
                                component.velocityY = compData.data.velocityY;
                            }
                            break;
                    }
                    
                    if (component) {
                        entity.addComponent(component);
                    }
                }
                
                this.engine.addEntity(entity);
            }
            
            this.updateEntityList();
            this.updateInspector();
            this.log(`📂 Сцена загружена (${sceneData.entities.length} сущностей)`);
        } catch (e) {
            this.log('❌ Ошибка загрузки: ' + e.message);
        }
    }
    
    /**
     * Изменяет размер canvas
     */
    resizeCanvas() {
        if (!this.ui.canvas) return;
        
        const container = this.ui.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight) * 0.95;
        
        this.ui.canvas.width = size;
        this.ui.canvas.height = size;
        
        if (this.engine.gl) {
            this.engine.gl.viewport(0, 0, size, size);
        }
    }
    
    /**
     * Выводит сообщение в консоль редактора
     * @param {string} message
     */
    log(message) {
        console.log(message);
        
        if (!this.ui.consoleOutput) return;
        
        const time = new Date().toLocaleTimeString();
        this.logHistory.push(`[${time}] ${message}`);
        
        // Ограничиваем количество записей
        if (this.logHistory.length > this.maxLogEntries) {
            this.logHistory.shift();
        }
        
        this.ui.consoleOutput.innerHTML = this.logHistory.join('<br>');
        this.ui.consoleOutput.scrollTop = this.ui.consoleOutput.scrollHeight;
    }
}