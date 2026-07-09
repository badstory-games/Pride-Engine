/**
 * @module renderer/WebGL2Renderer
 * @description Система рендеринга с использованием WebGL2
 */

import { System } from '../core/System.js';
import { TransformComponent } from '../components/TransformComponent.js';
import { RenderComponent } from '../components/RenderComponent.js';

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
        
        /** @type {boolean} */
        this.initialized = false;
    }
    
    /**
     * Инициализирует шейдеры и буферы
     * @param {WebGL2RenderingContext} gl - Контекст WebGL2
     */
    init(gl) {
        if (this.initialized) return;
        
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
            uniform float u_opacity;
            in vec2 v_texCoord;
            
            out vec4 outColor;
            
            void main() {
                outColor = u_color * u_opacity;
            }
        `;
        
        // Компилируем шейдеры
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
            console.error('Не удалось скомпилировать шейдеры');
            return;
        }
        
        // Создаем программу
        this.program = this.createProgram(gl, vertexShader, fragmentShader);
        
        if (!this.program) {
            console.error('Не удалось создать программу шейдеров');
            return;
        }
        
        // Получаем расположения uniforms
        this.uniforms = {
            resolution: gl.getUniformLocation(this.program, 'u_resolution'),
            translation: gl.getUniformLocation(this.program, 'u_translation'),
            scale: gl.getUniformLocation(this.program, 'u_scale'),
            rotation: gl.getUniformLocation(this.program, 'u_rotation'),
            color: gl.getUniformLocation(this.program, 'u_color'),
            opacity: gl.getUniformLocation(this.program, 'u_opacity')
        };
        
        // Создаем буфер вершин
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        // Вершины прямоугольника (два треугольника)
        const positions = [
            0, 0,   // Первый треугольник
            0, 1,
            1, 0,
            1, 0,   // Второй треугольник
            0, 1,
            1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Настраиваем атрибуты
        const positionAttributeLocation = gl.getAttribLocation(this.program, 'a_position');
        if (positionAttributeLocation !== -1) {
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        }
        
        this.initialized = true;
    }
    
    /**
     * Создает шейдер
     * @param {WebGL2RenderingContext} gl
     * @param {number} type - Тип шейдера
     * @param {string} source - Исходный код шейдера
     * @returns {WebGLShader|null}
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
     * @returns {WebGLProgram|null}
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
        if (!this.initialized) {
            this.init(gl);
        }
        
        if (!this.program) return;
        
        gl.useProgram(this.program);
        
        // Устанавливаем разрешение
        gl.uniform2f(this.uniforms.resolution, gl.canvas.width, gl.canvas.height);
        
        // Сортируем сущности по z-index
        const renderableEntities = entities
            .filter(entity => {
                if (!entity.active) return false;
                const render = entity.getComponent(RenderComponent);
                return render && render.visible;
            })
            .sort((a, b) => {
                const renderA = a.getComponent(RenderComponent);
                const renderB = b.getComponent(RenderComponent);
                return (renderA.zIndex || 0) - (renderB.zIndex || 0);
            });
        
        for (const entity of renderableEntities) {
            const transform = entity.getComponent(TransformComponent);
            const render = entity.getComponent(RenderComponent);
            
            if (!transform || !render) continue;
            
            // Устанавливаем uniforms для этой сущности
            gl.uniform2f(this.uniforms.translation, transform.x, transform.y);
            gl.uniform2f(
                this.uniforms.scale, 
                render.width * transform.scaleX, 
                render.height * transform.scaleY
            );
            gl.uniform1f(this.uniforms.rotation, transform.rotation);
            gl.uniform1f(this.uniforms.opacity, render.opacity);
            
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
            const r = parseInt(hex.substring(0, 2), 16) / 255;
            const g = parseInt(hex.substring(2, 4), 16) / 255;
            const b = parseInt(hex.substring(4, 6), 16) / 255;
            return { r, g, b, a: 1.0 };
        }
        
        // Поддержка rgb/rgba
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]) / 255,
                g: parseInt(rgbMatch[2]) / 255,
                b: parseInt(rgbMatch[3]) / 255,
                a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1.0
            };
        }
        
        // По умолчанию возвращаем красный
        return { r: 1, g: 0, b: 0, a: 1 };
    }
}