/**
 * @module components/AudioComponent
 * @description Компонент для звуковых эффектов
 */

import { Component } from '../core/Component.js';

/**
 * @class AudioComponent
 * @extends Component
 * @description Управляет звуками сущности
 */
export class AudioComponent extends Component {
    constructor() {
        super();
        
        /** @type {Map<string, AudioBuffer>} Аудио буферы */
        this.sounds = new Map();
        
        /** @type {number} Громкость (0-1) */
        this.volume = 1.0;
        
        /** @type {boolean} Пространственный звук */
        this.spatial = false;
        
        /** @type {number} Дистанция слышимости */
        this.maxDistance = 100;
        
        /** @type {number} Минимальная дистанция */
        this.refDistance = 10;
        
        /** @type {boolean} На повтор */
        this.loop = false;
        
        /** @type {AudioContext} Аудио контекст */
        this.audioContext = null;
    }
    
    /**
     * Добавляет звук
     * @param {string} name - Название звука
     * @param {AudioBuffer} buffer - Аудио буфер
     */
    addSound(name, buffer) {
        this.sounds.set(name, buffer);
    }
    
    /**
     * Воспроизводит звук
     * @param {string} name - Название звука
     */
    play(name) {
        if (!this.audioContext || !this.sounds.has(name)) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds.get(name);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = this.volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.loop = this.loop;
        source.start(0);
    }
}