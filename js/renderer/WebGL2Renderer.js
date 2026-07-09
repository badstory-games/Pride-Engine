/**
 * @module renderer/WebGL2Renderer
 * @description Система рендеринга с использованием WebGL2
 */

import { System } from '../core/System.js';
import { TransformComponent, RenderComponent } from '../core/Component.js';

/**
 * @class WebGL2Renderer
 * @extends System
 * @description Система рендеринга спрайтов через WebGL2
 */
export class WebGL2Renderer extends System {
    constructor() {
        super();
        this.name = 'WebGL2Renderer';
        
        /** @type {WebGLProgram} */
        this.program = null;
        
        /** @type {Object} */
        this.uniforms = {};
    }
    
    /**
     * Инициализирует шейдеры и буферы
     * @param {WebGL2RenderingContext} gl - Контекст WebGL2
     */
    init(gl) {
        // Вершинный шейдер
        const vertexShaderSource = `#version 300 es
            in vec2 a_position;
            in vec2 a_texCoord;
            
            uniform vec2 u_resolution;
            uniform vec2 u_translation;
            uniform vec2 u_scale;
            uniform float u_rotation;
            
            out vec2 v_texCoord;
            
            void main() {
                // Применяем трансформации
                vec2 scaledPosition = a_position * u_scale;
                
                float cosAngle = cos(u_rotation);
                float sinAngle = sin(u_rotation);
                vec2 rotatedPosition = vec2(
                    scaledPosition.x * cosAngle - scaledPosition.y * sinAngle,
                    scaledPosition.x * sinAngle + scaledPosition.y * cosAngle
                );
                
                vec2 position = rotatedPosition + u_translation;
                
                // Преобразуем в координаты WebGL
                vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                
                v_texCoord = a_texCoord;
            }
        `;
        
        // Фрагментный шейдер
        const fragmentShaderSource = `#version 300 es
            precision mediump float;
            
            uniform vec4 u_color;
            in vec2 v_texCoord;
            
            out vec4 outColor;
            
            void main() {
                outColor = u_color;
            }
        `;
        
        // Компилируем шейдеры
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        // Создаем программу
        this.program = this.createProgram(gl, vertexShader, fragmentShader);
        
        // Получаем расположения uniforms
        this.uniforms = {
            resolution: gl.getUniformLocation(this.program, 'u_resolution'),
            translation: gl.getUniformLocation(this.program, 'u_translation'),
            scale: gl.getUniformLocation(this.program, 'u_scale'),
            rotation: gl.getUniformLocation(this.program, 'u_rotation'),
            color: gl.getUniformLocation(this.program, 'u_color')
        };
        
        // Создаем буфер вершин
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Вершины прямоугольника (два треугольника)
        const positions = [
            0, 0,
            0, 1,
            1, 0,
            1, 0,
            0, 1,
            1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Настраиваем атрибуты
        const positionAttributeLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }
    
    /**
     * Создает шейдер
     * @param {WebGL2RenderingContext} gl
     * @param {number} type - Тип шейдера
     * @param {string} source - Исходный код шейдера
     * @returns {WebGLShader}
     */
    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Ошибка компиляции шейдера:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    /**
     * Создает программу шейдеров
     * @param {WebGL2RenderingContext} gl
     * @param {WebGLShader} vertexShader
     * @param {WebGLShader} fragmentShader
     * @returns {WebGLProgram}
     */
    createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Ошибка линковки программы:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        
        return program;
    }
    
    /**
     * Рендерит все сущности с RenderComponent
     * @param {WebGL2RenderingContext} gl
     * @param {Entity[]} entities
     */
    render(gl, entities) {
        if (!this.program) {
            this.init(gl);
        }
        
        gl.useProgram(this.program);
        
        // Устанавливаем разрешение
        gl.uniform2f(this.uniforms.resolution, gl.canvas.width, gl.canvas.height);
        
        for (const entity of entities) {
            if (!entity.active) continue;
            
            const transform = entity.getComponent(TransformComponent);
            const render = entity.getComponent(RenderComponent);
            
            if (!transform || !render || !render.visible) continue;
            
            // Устанавливаем uniforms для этой сущности
            gl.uniform2f(this.uniforms.translation, transform.x, transform.y);
            gl.uniform2f(this.uniforms.scale, render.width * transform.scaleX, render.height * transform.scaleY);
            gl.uniform1f(this.uniforms.rotation, transform.rotation);
            
            // Парсим цвет
            const color = this.parseColor(render.color);
            gl.uniform4f(this.uniforms.color, color.r, color.g, color.b, color.a);
            
            // Рисуем
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }
    
    /**
     * Парсит цвет из разных форматов
     * @param {string} color - Цвет в формате hex или rgba
     * @returns {{r: number, g: number, b: number, a: number}}
     */
    parseColor(color) {
        // Поддержка hex цветов
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            return {
                r: parseInt(hex.substr(0, 2), 16) / 255,
                g: parseInt(hex.substr(2, 2), 16) / 255,
                b: parseInt(hex.substr(4, 2), 16) / 255,
                a: 1.0
            };
        }
        
        // По умолчанию возвращаем красный
        return { r: 1, g: 0, b: 0, a: 1 };
    }
}