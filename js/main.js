/**
 * @module main
 * @description Точка входа в приложение Pride Engine
 */

import { Engine } from './core/Engine.js';
import { WebGL2Renderer } from './renderer/WebGL2Renderer.js';
import { InputSystem } from './input/InputSystem.js';
import { MovementSystem } from './systems/MovementSystem.js';
import { PlayerControlSystem } from './systems/PlayerControlSystem.js';
import { Editor } from './editor/Editor.js';

/**
 * Инициализирует движок и редактор при загрузке страницы
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Pride Engine запускается...');
    
    // Получаем canvas
    const canvas = document.getElementById('game-canvas');
    
    // Создаем движок
    const engine = new Engine(canvas);
    
    // Создаем и инициализируем систему ввода
    const inputSystem = new InputSystem();
    inputSystem.init(canvas);
    
    // Добавляем системы в правильном порядке
    const renderer = new WebGL2Renderer();
    const movementSystem = new MovementSystem();
    const playerControlSystem = new PlayerControlSystem(inputSystem);
    
    engine.addSystem(inputSystem);        // Сначала ввод
    engine.addSystem(playerControlSystem); // Потом управление
    engine.addSystem(movementSystem);      // Потом движение
    engine.addSystem(renderer);            // Рендеринг последним
    
    // Создаем редактор
    const editor = new Editor(engine, inputSystem);
    
    // Сохраняем ссылки для отладки
    window.__prideEngine = {
        engine,
        inputSystem,
        editor,
        systems: {
            renderer,
            movementSystem,
            playerControlSystem
        }
    };
    
    // Создаем тестовые сущности после небольшой задержки
    setTimeout(() => {
        editor.createPlayerEntity();
        editor.createSpriteEntity();
        
        // Создаем еще несколько спрайтов для демонстрации
        const colors = ['#e94560', '#0f3460', '#533483', '#00ff00', '#ffaa00'];
        for (let i = 0; i < 3; i++) {
            const entity = new Entity(`Sprite_${Entity.nextId}`);
            entity.addComponent(new TransformComponent(
                100 + i * 120,
                300
            ));
            entity.addComponent(new RenderComponent(
                colors[i],
                80,
                80
            ));
            engine.addEntity(entity);
        }
        
        editor.updateEntityList();
        editor.log('🎮 Pride Engine готов к работе! Нажмите ▶ для запуска');
        editor.log('💡 Совет: Используйте WASD/стрелки для управления зеленым квадратом');
        editor.log('💡 Совет: Перетаскивайте сущности мышью в режиме редактирования');
        editor.log('💡 Совет: Нажмите Delete чтобы удалить выбранную сущность');
        editor.log('💡 Совет: Нажмите N для создания новой сущности');
    }, 100);
});