/**
 * @module main
 * @description Точка входа в приложение Pride Engine
 */

import { Engine } from './core/Engine.js';
import { WebGL2Renderer } from './renderer/WebGL2Renderer.js';
import { Editor } from './editor/Editor.js';

/**
 * Инициализирует движок и редактор при загрузке страницы
 */
window.addEventListener('DOMContentLoaded', () => {
    console.log('Pride Engine запускается...');
    
    // Получаем canvas
    const canvas = document.getElementById('game-canvas');
    
    // Создаем движок
    const engine = new Engine(canvas);
    
    // Добавляем систему рендеринга
    const renderer = new WebGL2Renderer();
    engine.addSystem(renderer);
    
    // Создаем редактор
    const editor = new Editor(engine);
    
    // Создаем тестовую сущность
    editor.createDefaultEntity();
    
    console.log('Pride Engine готов к работе!');
});