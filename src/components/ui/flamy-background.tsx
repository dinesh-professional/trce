'use client';

import React, { useEffect, useRef } from 'react';

export interface FlamyBackgroundProps {
  theme?: 'dark' | 'light';
  className?: string;
  intensity?: 'subtle' | 'medium' | 'vivid';
}

/**
 * 60fps WebGL Real Flaming Engine with Procedural Fluid Convection & Ember Physics.
 * Uses high-performance GLSL fractional Brownian motion (fBm) fluid turbulence
 * to create authentic licking flame spires, incandescent white-hot cores,
 * blazing golden-orange fire mantles, and flying spark embers.
 */
export function FlamyBackground({
  theme = 'dark',
  className = '',
  intensity = 'vivid',
}: FlamyBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const emberCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try WebGL
    const gl = (canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    }) || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) {
      console.warn('WebGL not supported, falling back to 2D canvas.');
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader - Real Fluid Flame Simulation
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_is_light;
      uniform float u_intensity;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(cos(0.55), sin(0.55), -sin(0.55), cos(0.55));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.1 + vec2(23.4, 15.7);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;

        // Upward thermal draft speed
        float flameSpeed = 1.15;
        float wind = (u_mouse.x / u_resolution.x - 0.5) * 0.45;

        // Convective flame coordinates
        vec2 p = vec2(uv.x * aspect - wind * (1.0 - uv.y) * 0.6, uv.y - u_time * flameSpeed);

        // Multi-layered turbulent flame distortion
        float q = fbm(p * 2.8 + vec2(0.0, -u_time * 0.5));
        float r = fbm(p * 3.8 + q * 2.5 + vec2(1.8, 4.3));
        float f = fbm(p * 3.2 + r * 3.2);

        // Real licking flame spires across the screen
        float wave1 = sin(uv.x * 12.0 + u_time * 2.8) * 0.14;
        float wave2 = cos(uv.x * 24.0 - u_time * 3.5) * 0.08;
        float wave3 = sin(uv.x * 6.0 + u_time * 1.5) * 0.18;
        float wave4 = cos(uv.x * 38.0 + u_time * 4.2) * 0.05;

        // Vertical envelope: Fire is hottest & widest at the bottom, tapering off as it ascends
        float flameTaper = (1.0 - uv.y) * 1.65;
        flameTaper += (wave1 + wave2 + wave3 + wave4) * (1.0 - uv.y * 0.85);

        float flame = f * flameTaper * 2.2 * u_intensity;
        flame = clamp(flame - uv.y * 0.95, 0.0, 1.0);

        float intensity = pow(flame, 1.15) * 1.6;

        vec3 col = vec3(0.0);

        if (u_is_light < 0.5) {
          // ===================================================================
          // DARK MODE: REAL INCANDESCENT BLACK & WHITE FLAMING FIRE
          // ===================================================================
          vec3 colCore    = vec3(1.0, 1.0, 1.0);     // Searing white-hot plasma
          vec3 colSilver  = vec3(0.92, 0.95, 0.99);  // Brilliant platinum / silver flame
          vec3 colAsh     = vec3(0.62, 0.68, 0.78);  // Luminous ash gray mantle
          vec3 colSmoke   = vec3(0.24, 0.28, 0.35);  // Deep charcoal smoke tips
          vec3 colEmber   = vec3(0.08, 0.09, 0.12);  // Smoldering dark base
          vec3 colVoid    = vec3(0.02, 0.02, 0.03);  // Pitch background void

          if (intensity > 0.80) {
            col = mix(colSilver, colCore, (intensity - 0.80) / 0.20);
          } else if (intensity > 0.48) {
            col = mix(colAsh, colSilver, (intensity - 0.48) / 0.32);
          } else if (intensity > 0.20) {
            col = mix(colSmoke, colAsh, (intensity - 0.20) / 0.28);
          } else if (intensity > 0.04) {
            col = mix(colEmber, colSmoke, (intensity - 0.04) / 0.16);
          } else {
            col = mix(colVoid, colEmber, intensity / 0.04);
          }

          // Ambient Furnace Floor Glow (Searing White/Silver)
          float floorGlow = pow(1.0 - uv.y, 2.2) * 0.45;
          col += vec3(0.90, 0.94, 1.0) * floorGlow;

          gl_FragColor = vec4(col, 1.0);
        } else {
          // ===================================================================
          // LIGHT MODE: MONOCHROME SLATE/CHARCOAL FLAMES ON LIGHT DASHBOARD
          // ===================================================================
          vec3 bg = vec3(0.972, 0.98, 0.988); // #F8FAFC
          vec3 flameCol = vec3(0.20, 0.25, 0.32); // Charcoal smoke/flame
          float alpha = clamp(intensity * 0.30 + pow(1.0 - uv.y, 2.8) * 0.16, 0.0, 0.45);
          col = mix(bg, flameCol, alpha);
          gl_FragColor = vec4(col, 1.0);
        }
      }
    `;

    // Shader compilation helper
    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen Quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uIsLight = gl.getUniformLocation(program, 'u_is_light');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');

    const intensityVal =
      intensity === 'subtle' ? 0.75 : intensity === 'medium' ? 1.0 : 1.25;

    // Mouse coordinates
    let mouseX = width / 2;
    let targetMouseX = width / 2;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResizeAll = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gl.viewport(0, 0, width, height);
    };

    handleResizeAll();
    window.addEventListener('resize', handleResizeAll);

    // =========================================================================
    // 2. 60FPS CRACKLING EMBERS & FLYING ASH PARTICLES OVERLAY
    // =========================================================================
    const emberCanvas = emberCanvasRef.current;
    let emberCtx: CanvasRenderingContext2D | null = null;
    if (emberCanvas) {
      emberCanvas.width = width;
      emberCanvas.height = height;
      emberCtx = emberCanvas.getContext('2d');
    }

    interface Ember {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      flicker: number;
      color: 'white' | 'silver' | 'ash';
    }

    const emberCount = theme === 'dark' ? 70 : 35;
    const embers: Ember[] = [];

    const spawnEmber = (bottomOnly = false): Ember => {
      const colors: ('white' | 'silver' | 'ash')[] = ['white', 'silver', 'ash'];
      return {
        x: Math.random() * width,
        y: bottomOnly ? height + 10 : Math.random() * height,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -(Math.random() * 4.2 + 2.0),
        size: Math.random() * 2.8 + 1.0,
        alpha: Math.random() * 0.9 + 0.3,
        flicker: Math.random() * 0.15 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    for (let i = 0; i < emberCount; i++) {
      embers.push(spawnEmber(false));
    }

    // =========================================================================
    // 3. MAIN RENDER LOOP (GPU SHADER + EMBER OVERLAY)
    // =========================================================================
    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      // Mouse smoothing
      mouseX += (targetMouseX - mouseX) * 0.05;

      // WebGL Shader Draw
      gl.useProgram(program);
      gl.uniform2f(uResolution, width, height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseX, height / 2);
      gl.uniform1f(uIsLight, theme === 'light' ? 1.0 : 0.0);
      gl.uniform1f(uIntensity, intensityVal);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Draw Crackling Embers
      if (emberCtx && emberCanvas) {
        emberCtx.clearRect(0, 0, width, height);
        emberCtx.globalCompositeOperation = theme === 'dark' ? 'lighter' : 'source-over';

        for (const e of embers) {
          e.y += e.vy;
          e.x += e.vx + Math.sin(elapsed * 4.0 + e.y * 0.03) * 1.4;

          // Flicker
          e.alpha += (Math.random() - 0.5) * e.flicker * 5.0;
          e.alpha = Math.max(0.15, Math.min(1.0, e.alpha));

          if (e.y < -15) {
            const fresh = spawnEmber(true);
            e.x = fresh.x;
            e.y = fresh.y;
            e.vx = fresh.vx;
            e.vy = fresh.vy;
            e.alpha = fresh.alpha;
          }

          if (theme === 'dark') {
            if (e.color === 'white') {
              emberCtx.fillStyle = `rgba(255, 255, 255, ${e.alpha})`;
            } else if (e.color === 'silver') {
              emberCtx.fillStyle = `rgba(226, 232, 240, ${e.alpha})`;
            } else {
              emberCtx.fillStyle = `rgba(160, 175, 200, ${e.alpha})`;
            }
          } else {
            emberCtx.fillStyle = `rgba(30, 41, 59, ${e.alpha * 0.7})`;
          }

          emberCtx.beginPath();
          emberCtx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          emberCtx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResizeAll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [theme, intensity]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* 60fps GPU WebGL Real Fluid Flame Shader Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 60fps Crackling Embers & Flying Sparks Canvas */}
      <canvas ref={emberCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Atmospheric Soft Vignette & Content Protection Shadow */}
      {theme === 'dark' ? (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(3, 5, 7, 0.8) 0%, rgba(3, 5, 7, 0.45) 35%, transparent 65%), radial-gradient(circle at 50% 40%, transparent 35%, rgba(2, 3, 5, 0.65) 75%, #020305 100%)',
          }}
        />
      ) : (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, transparent 50%, rgba(248, 250, 252, 0.6) 80%, #F8FAFC 98%)',
          }}
        />
      )}
    </div>
  );
}
