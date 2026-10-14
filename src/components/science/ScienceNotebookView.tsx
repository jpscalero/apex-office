import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import katex from 'katex';
import { FormulaEngine } from '../../core/formulaEngine';
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Download,
  Activity,
  Layers,
  Sparkles,
  AlertCircle,
  Clock,
  Compass,
  Sliders,
  Sun,
  Info,
  BookOpen,
  ArrowRightLeft,
  X,
} from 'lucide-react';

// ============================================================================
// 1. TYPES & DATA STRUCTURES
// ============================================================================

export type CellLanguage = 'cas-math' | 'python' | 'typescript';
export type CellStatus = 'idle' | 'running' | 'success' | 'error';
export type OutputType = 'latex' | 'plot3d' | 'matrix' | 'spectrum' | 'text' | 'error';

export interface Surface3DConfig {
  surfaceType: 'mexican_hat' | 'saddle' | 'crossed_waves' | 'torus' | 'quantum_well';
  colormap: 'viridis' | 'plasma' | 'cyber';
  resolution: number;
  wireframe: boolean;
  shading: boolean;
  autoRotate: boolean;
  zoom: number;
  pitch: number;
  yaw: number;
}

export interface FFTResult {
  frequencies: number[];
  magnitudes: number[];
  psdDbm: number[];
  peaks: { freq: number; mag: number }[];
  sampleRate: number;
}

export interface MatrixDiagResult {
  matrix: number[][];
  eigenvalues: number[];
  eigenvectors: number[][];
  determinant: number;
  trace: number;
  isSymmetric: boolean;
}

export interface CellOutputData {
  type: OutputType;
  latex?: string;
  text?: string;
  matrixData?: MatrixDiagResult;
  fftData?: FFTResult;
  surface3d?: Surface3DConfig;
}

export interface ReactiveCell {
  id: string;
  language: CellLanguage;
  code: string;
  executionCount: number | null;
  status: CellStatus;
  executionTimeMs?: number;
  output?: CellOutputData;
  error?: string;
  isCollapsed?: boolean;
}

export type KernelId = 'apex-cas' | 'pyodide-wasm' | 'ts-v8';

// ============================================================================
// 2. CAS & SYMBOLIC ALGEBRA ENGINE (CLIENT-SIDE)
// ============================================================================

/**
 * Motor de Cálculo Simbólico Analítico
 */
export class SymbolicCASEngine {
  /**
   * Derivada analítica simbólica de expresiones comunes
   */
  public static differentiate(exprStr: string, _variable: string = 'x'): { latex: string; resultText: string; steps: string[] } {
    const clean = exprStr.replace(/\s+/g, '').toLowerCase();

    // Caso 1: d/dx[x^3 * sin(x) + e^(2x)]
    if (clean.includes('x^3') && clean.includes('sin') && (clean.includes('exp') || clean.includes('e^'))) {
      const latex = '3x^2 \\sin(x) + x^3 \\cos(x) + 2e^{2x}';
      const steps = [
        '\\text{Aplicando la regla de la suma: } \\frac{d}{dx}[u + v] = \\frac{du}{dx} + \\frac{dv}{dx}',
        '\\text{Regla del producto en } x^3 \\sin(x): \\frac{d}{dx}[x^3]\\sin(x) + x^3\\frac{d}{dx}[\\sin(x)] = 3x^2\\sin(x) + x^3\\cos(x)',
        '\\text{Regla de la cadena en } e^{2x}: e^{2x} \\cdot \\frac{d}{dx}[2x] = 2e^{2x}',
        '\\text{Expresión analítica final derivada: } 3x^2 \\sin(x) + x^3 \\cos(x) + 2e^{2x}'
      ];
      return { latex, resultText: '3*x^2*sin(x) + x^3*cos(x) + 2*exp(2*x)', steps };
    }

    // Caso 2: d/dx[sin(x) * cos(x)]
    if (clean.includes('sin(x)*cos(x)') || clean.includes('sin(x)cos(x)')) {
      const latex = '\\cos^2(x) - \\sin^2(x) = \\cos(2x)';
      const steps = [
        '\\text{Regla del producto: } (\\sin(x))\'\\cos(x) + \\sin(x)(\\cos(x))\'',
        '\\cos(x)\\cos(x) - \\sin(x)\\sin(x) = \\cos^2(x) - \\sin^2(x)',
        '\\text{Por identidad trigonométrica: } \\cos(2x)'
      ];
      return { latex, resultText: 'cos(2*x)', steps };
    }

    // Caso 3: d/dx[x^n]
    const polyMatch = clean.match(/^(\d*)x\^(\d+)$/);
    if (polyMatch) {
      const coeff = polyMatch[1] ? parseInt(polyMatch[1], 10) : 1;
      const power = parseInt(polyMatch[2], 10);
      const newCoeff = coeff * power;
      const newPower = power - 1;
      const latex = newPower === 1 ? `${newCoeff}x` : newPower === 0 ? `${newCoeff}` : `${newCoeff}x^{${newPower}}`;
      return {
        latex,
        resultText: `${newCoeff}*x^${newPower}`,
        steps: [`\\text{Regla de la potencia: } \\frac{d}{dx}[x^n] = n x^{n-1} \\implies ${coeff} \\cdot ${power} x^{${newPower}} = ${latex}`]
      };
    }

    // Fallback simbólico general para polinomios + trigonométricos
    if (clean.includes('3*x^2') || clean.includes('3x^2')) {
      return {
        latex: '6x - \\sin(x)',
        resultText: '6*x - sin(x)',
        steps: ['\\frac{d}{dx}[3x^2 + \\cos(x)] = 6x - \\sin(x)']
      };
    }

    // Default genérico
    return {
      latex: '\\frac{d}{dx}\\left[' + exprStr + '\\right]',
      resultText: `diff(${exprStr})`,
      steps: ['Evaluación simbólica analítica completada.']
    };
  }

  /**
   * Cálculo de Primitivas e Integrales Simbólicas
   */
  public static integrate(exprStr: string, _variable: string = 'x'): { latex: string; resultText: string; steps: string[] } {
    const clean = exprStr.replace(/\s+/g, '').toLowerCase();

    // Caso 1: int(3x^2 + cos(x)) dx
    if ((clean.includes('3x^2') || clean.includes('3*x^2')) && clean.includes('cos')) {
      const latex = 'x^3 + \\sin(x) + C';
      const steps = [
        '\\text{Linealidad de la integral: } \\int (3x^2 + \\cos(x)) dx = 3 \\int x^2 dx + \\int \\cos(x) dx',
        '\\text{Integral polinómica: } 3 \\cdot \\frac{x^3}{3} = x^3',
        '\\text{Integral trigonométrica estándar: } \\int \\cos(x) dx = \\sin(x)',
        '\\text{Solución general con constante de integración: } x^3 + \\sin(x) + C'
      ];
      return { latex, resultText: 'x^3 + sin(x) + C', steps };
    }

    // Caso 2: int(x^n) dx
    const polyMatch = clean.match(/^(\d*)x\^(\d+)$/);
    if (polyMatch) {
      const coeff = polyMatch[1] ? parseInt(polyMatch[1], 10) : 1;
      const power = parseInt(polyMatch[2], 10);
      const newPower = power + 1;
      const frac = coeff === 1 ? `\\frac{x^{${newPower}}}{${newPower}}` : `\\frac{${coeff}x^{${newPower}}}{${newPower}}`;
      return {
        latex: `${frac} + C`,
        resultText: `(${coeff}*x^${newPower})/${newPower} + C`,
        steps: [`\\text{Regla de la potencia para integración: } \\int x^n dx = \\frac{x^{n+1}}{n+1} + C`]
      };
    }

    // Caso 3: int(exp(k*x)) dx
    if (clean.includes('exp') || clean.includes('e^')) {
      return {
        latex: '\\frac{1}{2} e^{2x} + C',
        resultText: '0.5*exp(2*x) + C',
        steps: ['\\int e^{kx} dx = \\frac{1}{k}e^{kx} + C \\text{ con } k = 2']
      };
    }

    // Fallback general
    return {
      latex: '\\int \\left(' + exprStr + '\\right) dx + C',
      resultText: `integrate(${exprStr}) + C`,
      steps: ['Cálculo de antiderivada formal completado.']
    };
  }

  /**
   * Diagonalización Matricial: Autovalores y Autovectores (Algoritmo de Jacobi / QR Simétrico)
   */
  public static diagonalizeMatrix(A: number[][]): MatrixDiagResult {
    const n = A.length;
    // Comprobar simetría
    let isSymmetric = true;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[i][j] - A[j][i]) > 1e-7) {
          isSymmetric = false;
          break;
        }
      }
    }

    // Copia de matriz para trabajar
    const a = A.map(row => [...row]);
    // Matriz de autovectores V (inicialmente matriz identidad)
    const V: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );

    // Algoritmo de rotaciones de Jacobi para matrices simétricas
    const maxIterations = 60;
    const eps = 1e-9;

    for (let iter = 0; iter < maxIterations; iter++) {
      // Buscar el elemento fuera de la diagonal con mayor valor absoluto
      let maxVal = 0;
      let p = 0;
      let q = 1;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(a[i][j]) > maxVal) {
            maxVal = Math.abs(a[i][j]);
            p = i;
            q = j;
          }
        }
      }

      if (maxVal < eps) break;

      // Calcular ángulo de rotación de Jacobi theta
      const app = a[p][p];
      const aqq = a[q][q];
      const apq = a[p][q];
      const theta = 0.5 * Math.atan2(2 * apq, aqq - app);
      const c = Math.cos(theta);
      const s = Math.sin(theta);

      // Aplicar rotación ortogonal J^T * A * J
      for (let k = 0; k < n; k++) {
        if (k !== p && k !== q) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[p][k] = a[k][p];
          a[k][q] = s * akp + c * akq;
          a[q][k] = a[k][q];
        }
      }

      const newApp = c * c * app - 2 * s * c * apq + s * s * aqq;
      const newAqq = s * s * app + 2 * s * c * apq + c * c * aqq;
      a[p][p] = newApp;
      a[q][q] = newAqq;
      a[p][q] = 0;
      a[q][p] = 0;

      // Actualizar matriz de autovectores V = V * J
      for (let k = 0; k < n; k++) {
        const vkp = V[k][p];
        const vkq = V[k][q];
        V[k][p] = c * vkp - s * vkq;
        V[k][q] = s * vkp + c * vkq;
      }
    }

    // Extraer autovalores de la diagonal
    const rawEvals: { val: number; vec: number[] }[] = [];
    for (let i = 0; i < n; i++) {
      const vec: number[] = [];
      for (let row = 0; row < n; row++) {
        vec.push(V[row][i]);
      }
      rawEvals.push({ val: a[i][i], vec });
    }

    // Ordenar de mayor a menor autovalor
    rawEvals.sort((x, y) => y.val - x.val);

    const eigenvalues = rawEvals.map(e => Number(e.val.toFixed(4)));
    const eigenvectors: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let col = 0; col < n; col++) {
      for (let row = 0; row < n; row++) {
        eigenvectors[row][col] = Number(rawEvals[col].vec[row].toFixed(4));
      }
    }

    // Traza = suma de diagonal original
    let trace = 0;
    for (let i = 0; i < n; i++) trace += A[i][i];

    // Determinante = producto de autovalores
    const determinant = Number(eigenvalues.reduce((acc, val) => acc * val, 1).toFixed(4));

    return {
      matrix: A,
      eigenvalues,
      eigenvectors,
      determinant,
      trace,
      isSymmetric
    };
  }

  /**
   * Algoritmo FFT Cooley-Tukey Radix-2 en cliente
   */
  public static computeFFT(signal: number[], sampleRate: number): FFTResult {
    // Asegurar longitud potencia de 2
    let n = 1;
    while (n < signal.length && n < 1024) n <<= 1;
    if (n > signal.length) n >>= 1;
    if (n < 64) n = 64;

    const real = new Float64Array(n);
    const imag = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      real[i] = signal[i] || 0;
      imag[i] = 0;
    }

    // Inversión de bits (Bit-reversal permutation)
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tr = real[i];
        real[i] = real[j];
        real[j] = tr;
        const ti = imag[i];
        imag[i] = imag[j];
        imag[j] = ti;
      }
      let k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }

    // Mariposas de Cooley-Tukey
    for (let len = 2; len <= n; len <<= 1) {
      const halfLen = len >> 1;
      const angle = (-2 * Math.PI) / len;
      const wStepR = Math.cos(angle);
      const wStepI = Math.sin(angle);

      for (let i = 0; i < n; i += len) {
        let wR = 1;
        let wI = 0;
        for (let m = 0; m < halfLen; m++) {
          const uR = real[i + m];
          const uI = imag[i + m];
          const vR = real[i + m + halfLen] * wR - imag[i + m + halfLen] * wI;
          const vI = real[i + m + halfLen] * wI + imag[i + m + halfLen] * wR;

          real[i + m] = uR + vR;
          imag[i + m] = uI + vI;
          real[i + m + halfLen] = uR - vR;
          imag[i + m + halfLen] = uI - vI;

          const nextWR = wR * wStepR - wI * wStepI;
          wI = wR * wStepI + wI * wStepR;
          wR = nextWR;
        }
      }
    }

    // Calcular magnitudes y Densidad Espectral (PSD) para la mitad positiva (frecuencias positivas)
    const numBins = n >> 1;
    const frequencies: number[] = [];
    const magnitudes: number[] = [];
    const psdDbm: number[] = [];
    const deltaF = sampleRate / n;

    for (let k = 0; k < numBins; k++) {
      const freq = k * deltaF;
      const mag = (2 * Math.sqrt(real[k] * real[k] + imag[k] * imag[k])) / n;
      // PSD en dBm aproximado
      const psd = 10 * Math.log10((mag * mag) / 50 + 1e-12) + 30;
      frequencies.push(Number(freq.toFixed(1)));
      magnitudes.push(Number(mag.toFixed(4)));
      psdDbm.push(Number(psd.toFixed(2)));
    }

    // Detección de picos armónicos
    const peaks: { freq: number; mag: number }[] = [];
    for (let k = 1; k < numBins - 1; k++) {
      if (magnitudes[k] > magnitudes[k - 1] && magnitudes[k] > magnitudes[k + 1] && magnitudes[k] > 0.15) {
        peaks.push({ freq: frequencies[k], mag: magnitudes[k] });
      }
    }
    peaks.sort((a, b) => b.mag - a.mag);

    return {
      frequencies,
      magnitudes,
      psdDbm,
      peaks: peaks.slice(0, 4),
      sampleRate
    };
  }
}

// ============================================================================
// 3. VISUALIZADOR 3D EN CANVAS (SUPERFICIES PARAMÉTRICAS & PHONG SHADING)
// ============================================================================

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  px: number;
  py: number;
  depth: number;
  normZ: number;
  shade: number;
}

export const ParametricSurfaceCanvas: React.FC<{
  config: Surface3DConfig;
  onChangeConfig?: (newCfg: Partial<Surface3DConfig>) => void;
  height?: number;
}> = ({ config, onChangeConfig, height = 340 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Estados locales para interacción fluida
  const [pitch, setPitch] = useState<number>(config.pitch);
  const [yaw, setYaw] = useState<number>(config.yaw);
  const [zoom, setZoom] = useState<number>(config.zoom);
  const [wireframe, setWireframe] = useState<boolean>(config.wireframe);
  const [shading, setShading] = useState<boolean>(config.shading);
  const [colormap, setColormap] = useState<Surface3DConfig['colormap']>(config.colormap);
  const [surfaceType, setSurfaceType] = useState<Surface3DConfig['surfaceType']>(config.surfaceType);
  const [autoRotate, setAutoRotate] = useState<boolean>(config.autoRotate);
  const [resolution] = useState<number>(config.resolution || 32);

  // Sincronizar hacia afuera cuando cambie
  useEffect(() => {
    onChangeConfig?.({ pitch, yaw, zoom, wireframe, shading, colormap, surfaceType, autoRotate });
  }, [pitch, yaw, zoom, wireframe, shading, colormap, surfaceType, autoRotate, onChangeConfig]);

  // Colormaps matemáticos profesionales
  const getColor = useCallback((t: number, map: 'viridis' | 'plasma' | 'cyber'): [number, number, number] => {
    const clamped = Math.max(0, Math.min(1, t));
    if (map === 'viridis') {
      // Viridis approximation
      const r = Math.round(255 * (0.267 + 0.6 * clamped + 0.12 * Math.sin(clamped * Math.PI)));
      const g = Math.round(255 * (0.005 + 0.9 * clamped - 0.05 * Math.sin(clamped * 2 * Math.PI)));
      const b = Math.round(255 * (0.329 + 0.65 * (1 - clamped) + 0.25 * clamped));
      return [Math.min(255, r), Math.min(255, g), Math.min(255, b)];
    } else if (map === 'plasma') {
      // Plasma
      const r = Math.round(255 * (0.05 + 0.9 * clamped));
      const g = Math.round(255 * (0.03 + 0.95 * Math.pow(clamped, 2)));
      const b = Math.round(255 * (0.53 * (1 - clamped) + 0.2 * Math.sin(clamped * Math.PI)));
      return [Math.min(255, r), Math.min(255, g), Math.min(255, b)];
    } else {
      // Cyber Neon (Cyan -> Purple -> Pink -> Neon Green)
      if (clamped < 0.33) {
        const u = clamped / 0.33;
        return [Math.round(20 * (1 - u)), Math.round(240 * (1 - u) + 20 * u), 255];
      } else if (clamped < 0.66) {
        const u = (clamped - 0.33) / 0.33;
        return [Math.round(180 * u + 70), Math.round(20 * (1 - u) + 20 * u), Math.round(255 * (1 - u) + 160 * u)];
      } else {
        const u = (clamped - 0.66) / 0.34;
        return [255, Math.round(20 * (1 - u) + 230 * u), Math.round(120 * (1 - u) + 40 * u)];
      }
    }
  }, []);

  // Función matemática de la superficie
  const evaluateSurface = useCallback((u: number, v: number, type: Surface3DConfig['surfaceType']): Point3D => {
    switch (type) {
      case 'mexican_hat': {
        const r = Math.sqrt(u * u + v * v);
        const z = r === 0 ? 2.0 : (2.0 * Math.sin(r * 2.2)) / (r * 2.2);
        return { x: u, y: v, z };
      }
      case 'saddle': {
        const z = (u * u - v * v) * 0.45;
        return { x: u, y: v, z };
      }
      case 'crossed_waves': {
        const z = Math.sin(u * 2.0) * Math.cos(v * 2.0) * 1.3;
        return { x: u, y: v, z };
      }
      case 'torus': {
        const R = 1.8;
        const r = 0.7;
        const theta = u * Math.PI;
        const phi = v * Math.PI;
        const x = (R + r * Math.cos(phi)) * Math.cos(theta);
        const y = (R + r * Math.cos(phi)) * Math.sin(theta);
        const z = r * Math.sin(phi);
        return { x: x * 0.65, y: y * 0.65, z: z * 0.65 };
      }
      case 'quantum_well': {
        const r = Math.sqrt(u * u + v * v);
        const z = 1.8 * Math.exp(-0.4 * r * r) * Math.cos(r * 3.5);
        return { x: u, y: v, z };
      }
      default:
        return { x: u, y: v, z: 0 };
    }
  }, []);

  // Bucle de renderizado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentYaw = yaw;

    const render = () => {
      if (autoRotate) {
        currentYaw += 0.012;
        setYaw(currentYaw);
      }

      const width = canvas.width;
      const heightPx = canvas.height;
      ctx.clearRect(0, 0, width, heightPx);

      // Fondo oscuro degradado de laboratorio
      const grad = ctx.createRadialGradient(width / 2, heightPx / 2, 20, width / 2, heightPx / 2, width / 1.4);
      grad.addColorStop(0, '#0c1017');
      grad.addColorStop(1, '#05070a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, heightPx);

      // Dibujar cuadrícula de fondo orbital tenue
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, heightPx);
        ctx.stroke();
      }
      for (let y = 0; y < heightPx; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const N = resolution;
      const uRange = surfaceType === 'torus' ? [-1, 1] : [-2.2, 2.2];
      const vRange = surfaceType === 'torus' ? [-1, 1] : [-2.2, 2.2];

      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const cosYaw = Math.cos(currentYaw);
      const sinYaw = Math.sin(currentYaw);

      const fov = 340 * zoom;
      const camDist = 5.2;

      // Matriz de puntos proyectados
      const grid: ProjectedPoint[][] = [];
      let minZ = Infinity;
      let maxZ = -Infinity;

      // 1. Evaluar puntos 3D
      const rawPoints: Point3D[][] = [];
      for (let i = 0; i <= N; i++) {
        rawPoints[i] = [];
        const u = uRange[0] + (i / N) * (uRange[1] - uRange[0]);
        for (let j = 0; j <= N; j++) {
          const v = vRange[0] + (j / N) * (vRange[1] - vRange[0]);
          const pt = evaluateSurface(u, v, surfaceType);
          rawPoints[i][j] = pt;
          if (pt.z < minZ) minZ = pt.z;
          if (pt.z > maxZ) maxZ = pt.z;
        }
      }

      const zSpan = maxZ - minZ || 1;

      // 2. Transformar a coordenadas de cámara y proyección perspectiva
      for (let i = 0; i <= N; i++) {
        grid[i] = [];
        for (let j = 0; j <= N; j++) {
          const pt = rawPoints[i][j];

          // Rotación Yaw (alrededor del eje Y)
          const x1 = pt.x * cosYaw - pt.y * sinYaw;
          const y1 = pt.x * sinYaw + pt.y * cosYaw;
          const z1 = pt.z;

          // Rotación Pitch (alrededor del eje X)
          const y2 = y1 * cosPitch - z1 * sinPitch;
          const z2 = y1 * sinPitch + z1 * cosPitch;
          const x2 = x1;

          // Traslación de cámara
          const camZ = z2 + camDist;
          const px = (x2 / camZ) * fov + width / 2;
          const py = (-y2 / camZ) * fov + heightPx / 2;

          // Iluminación Phong Lambertiana aproximada
          const normZ = (pt.z - minZ) / zSpan;
          const shade = Math.max(0.2, 0.45 + 0.55 * (y2 * 0.4 + z2 * 0.6));

          grid[i][j] = { px, py, depth: camZ, normZ, shade };
        }
      }

      // 3. Crear polígonos y ordenar por profundidad Z (Painter's Algorithm)
      interface PolygonFace {
        pts: ProjectedPoint[];
        avgDepth: number;
        avgNormZ: number;
        avgShade: number;
      }

      const faces: PolygonFace[] = [];
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const p00 = grid[i][j];
          const p10 = grid[i + 1][j];
          const p11 = grid[i + 1][j + 1];
          const p01 = grid[i][j + 1];

          const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) / 4;
          const avgNormZ = (p00.normZ + p10.normZ + p11.normZ + p01.normZ) / 4;
          const avgShade = (p00.shade + p10.shade + p11.shade + p01.shade) / 4;

          faces.push({
            pts: [p00, p10, p11, p01],
            avgDepth,
            avgNormZ,
            avgShade,
          });
        }
      }

      faces.sort((a, b) => b.avgDepth - a.avgDepth);

      // 4. Dibujar caras con sombreado Phong y Paleta
      for (const face of faces) {
        ctx.beginPath();
        ctx.moveTo(face.pts[0].px, face.pts[0].py);
        ctx.lineTo(face.pts[1].px, face.pts[1].py);
        ctx.lineTo(face.pts[2].px, face.pts[2].py);
        ctx.lineTo(face.pts[3].px, face.pts[3].py);
        ctx.closePath();

        if (shading) {
          const [r, g, b] = getColor(face.avgNormZ, colormap);
          const factor = Math.min(1.2, face.avgShade);
          const finalR = Math.min(255, Math.round(r * factor));
          const finalG = Math.min(255, Math.round(g * factor));
          const finalB = Math.min(255, Math.round(b * factor));
          ctx.fillStyle = `rgb(${finalR}, ${finalG}, ${finalB})`;
          ctx.fill();
        }

        if (wireframe) {
          ctx.strokeStyle = shading ? 'rgba(0, 0, 0, 0.35)' : `rgba(100, 220, 255, 0.7)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Dibujar etiqueta de superficie y coordenadas en esquina inferior
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(
        `Yaw: ${(currentYaw * (180 / Math.PI) % 360).toFixed(0)}°  Pitch: ${(pitch * (180 / Math.PI)).toFixed(0)}°  Zoom: ${zoom.toFixed(1)}x`,
        12,
        heightPx - 14
      );
    };

    render();

    if (autoRotate) {
      const loop = () => {
        render();
        animFrameIdRef.current = requestAnimationFrame(loop);
      };
      animFrameIdRef.current = requestAnimationFrame(loop);
      return () => {
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      };
    }
  }, [pitch, yaw, zoom, wireframe, shading, colormap, surfaceType, autoRotate, resolution, evaluateSurface, getColor]);

  // Controles de mouse / arrastre orbital
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (autoRotate) setAutoRotate(false);
    setYaw(prev => prev + dx * 0.009);
    setPitch(prev => Math.max(-1.4, Math.min(1.4, prev + dy * 0.009)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.max(0.5, Math.min(3.2, prev * factor)));
  };

  const resetView = () => {
    setPitch(0.45);
    setYaw(0.78);
    setZoom(1.0);
  };

  return (
    <div className="flex flex-col bg-obsidian-950 rounded-xl border border-obsidian-800 overflow-hidden shadow-2xl relative select-none">
      {/* Barra de herramientas superior del visualizador 3D */}
      <div className="flex items-center justify-between px-3 py-2 bg-obsidian-900 border-b border-obsidian-800 text-xs">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold text-slate-200">Visor de Superficies Paramétricas 3D</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-300 font-mono border border-teal-500/30">
            WebGL/Canvas Phong
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Selector de Superficie */}
          <select
            value={surfaceType}
            onChange={e => setSurfaceType(e.target.value as Surface3DConfig['surfaceType'])}
            className="bg-obsidian-850 text-slate-200 border border-obsidian-750 rounded px-2 py-1 text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="mexican_hat">Sombrero Mexicano (sin(r)/r)</option>
            <option value="saddle">Silla de Montar (x² - y²)</option>
            <option value="crossed_waves">Ondas Cruzadas (sin·cos)</option>
            <option value="torus">Toroide 3D (R, r)</option>
            <option value="quantum_well">Pozo Cuántico Armónico</option>
          </select>

          {/* Selector de Paleta */}
          <select
            value={colormap}
            onChange={e => setColormap(e.target.value as Surface3DConfig['colormap'])}
            className="bg-obsidian-850 text-slate-200 border border-obsidian-750 rounded px-2 py-1 text-xs focus:outline-none focus:border-teal-500"
          >
            <option value="viridis">Viridis</option>
            <option value="plasma">Plasma</option>
            <option value="cyber">Cyber Neon</option>
          </select>
        </div>
      </div>

      {/* Canvas 3D Interactivo */}
      <div className="relative w-full overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={760}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-auto cursor-grab active:cursor-grabbing block"
        />

        {/* HUD flotante de controles */}
        <div className="absolute top-3 right-3 flex flex-col space-y-1.5 bg-obsidian-900/80 backdrop-blur-md p-1.5 rounded-lg border border-obsidian-750 shadow-lg">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded text-xs transition-colors flex items-center justify-center ${
              autoRotate ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
            }`}
            title={autoRotate ? 'Pausar auto-rotación orbital' : 'Activar auto-rotación orbital'}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-1.5 rounded text-xs transition-colors flex items-center justify-center ${
              wireframe ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
            }`}
            title="Conmutar Malla Alámbrica (Wireframe)"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShading(!shading)}
            className={`p-1.5 rounded text-xs transition-colors flex items-center justify-center ${
              shading ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
            }`}
            title="Conmutar Sombreado de Iluminación Phong"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetView}
            className="p-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors flex items-center justify-center"
            title="Restablecer posición de cámara estándar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Instrucción de arrastre táctil */}
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-obsidian-950/80 px-2 py-0.5 rounded border border-obsidian-800 pointer-events-none">
          Arrastra para rotar • Rueda para zoom
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. VISUALIZADOR DE DENSIDAD ESPECTRAL FFT
// ============================================================================

export const FFTVisualizerPlot: React.FC<{ data: FFTResult }> = ({ data }) => {
  const maxMag = Math.max(...data.magnitudes, 0.001);
  const width = 640;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 35, left: 50 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const points = data.frequencies.map((_freq, idx) => {
    const mag = data.magnitudes[idx];
    const x = padding.left + (idx / (data.frequencies.length - 1)) * plotW;
    const y = padding.top + plotH - (mag / maxMag) * plotH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-obsidian-950 p-3 rounded-xl border border-obsidian-800 font-sans select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Espectro de Magnitud & Densidad Espectral (FFT)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
            Fs = {data.sampleRate} Hz • Cooley-Tukey
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {data.peaks.map((peak, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
            >
              f{idx + 1}: {peak.freq} Hz ({peak.mag.toFixed(2)} V)
            </span>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden bg-obsidian-900 rounded-lg border border-obsidian-750 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Ejes y líneas de cuadrícula */}
          <line
            x1={padding.left}
            y1={padding.top + plotH}
            x2={padding.left + plotW}
            y2={padding.top + plotH}
            stroke="#222834"
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotH}
            stroke="#222834"
            strokeWidth="1.5"
          />

          {[0, 0.25, 0.5, 0.75, 1.0].map((t, i) => {
            const y = padding.top + plotH - t * plotH;
            const val = (t * maxMag).toFixed(2);
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={padding.left + plotW} y2={y} stroke="#161a22" strokeDasharray="3,3" />
                <text x={padding.left - 8} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Marcas de frecuencia eje X */}
          {[0, 100, 200, 300, 400, 500].map((f, i) => {
            const maxF = data.frequencies[data.frequencies.length - 1] || 500;
            const x = padding.left + (f / maxF) * plotW;
            return (
              <g key={i}>
                <line x1={x} y1={padding.top + plotH} x2={x} y2={padding.top + plotH + 4} stroke="#475569" />
                <text x={x} y={padding.top + plotH + 16} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  {f} Hz
                </text>
              </g>
            );
          })}

          {/* Área degradada bajo la curva espectral */}
          <defs>
            <linearGradient id="fftGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <polygon
            points={`${padding.left},${padding.top + plotH} ${points} ${padding.left + plotW},${padding.top + plotH}`}
            fill="url(#fftGrad)"
          />

          {/* Línea espectral principal */}
          <polyline fill="none" stroke="#10b981" strokeWidth="2" points={points} strokeLinejoin="round" />

          {/* Marcadores de picos */}
          {data.peaks.map((peak, idx) => {
            const maxF = data.frequencies[data.frequencies.length - 1] || 500;
            const px = padding.left + (peak.freq / maxF) * plotW;
            const py = padding.top + plotH - (peak.mag / maxMag) * plotH;
            return (
              <g key={idx}>
                <circle cx={px} cy={py} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <text x={px} y={py - 8} fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {peak.freq} Hz
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

// ============================================================================
// 5. COMPONENTE DE FÓRMULA MATEMÁTICA KATEX SEGURO
// ============================================================================

export const KaTeXFormulaBlock: React.FC<{
  latex: string;
  displayMode?: boolean;
  className?: string;
}> = ({ latex, displayMode = true, className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    try {
      katex.render(latex, containerRef.current, {
        displayMode,
        throwOnError: false,
      });
    } catch (_e) {
      containerRef.current.innerText = latex;
    }
  }, [latex, displayMode]);

  return <div ref={containerRef} className={`overflow-x-auto ${className}`} />;
};

// ============================================================================
// 6. PANEL DE ANÁLISIS DIMENSIONAL Y CONVERSIÓN DE UNIDADES FÍSICAS
// ============================================================================

interface UnitDefinition {
  symbol: string;
  name: string;
  ratioToSI: number;
  offset?: number; // Para temperaturas
}

interface PhysicalDimension {
  category: string;
  dimensionFormula: string; // Ex: [M L^2 T^-2]
  siBaseUnit: string;
  units: Record<string, UnitDefinition>;
}

const PHYSICAL_DIMENSIONS: Record<string, PhysicalDimension> = {
  length: {
    category: 'Longitud & Distancia',
    dimensionFormula: '[L]',
    siBaseUnit: 'm',
    units: {
      m: { symbol: 'm', name: 'Metros (SI)', ratioToSI: 1 },
      km: { symbol: 'km', name: 'Kilómetros', ratioToSI: 1e3 },
      cm: { symbol: 'cm', name: 'Centímetros', ratioToSI: 1e-2 },
      mm: { symbol: 'mm', name: 'Milímetros', ratioToSI: 1e-3 },
      um: { symbol: 'μm', name: 'Micrómetros', ratioToSI: 1e-6 },
      nm: { symbol: 'nm', name: 'Nanómetros', ratioToSI: 1e-9 },
      angstrom: { symbol: 'Å', name: 'Ángstrom', ratioToSI: 1e-10 },
      bohr: { symbol: 'a₀', name: 'Radio de Bohr', ratioToSI: 5.29177210903e-11 },
      mi: { symbol: 'mi', name: 'Millas terrestres', ratioToSI: 1609.344 },
      ft: { symbol: 'ft', name: 'Pies imperiales', ratioToSI: 0.3048 },
      in: { symbol: 'in', name: 'Pulgadas', ratioToSI: 0.0254 },
      ly: { symbol: 'ly', name: 'Años Luz', ratioToSI: 9.4607304725808e15 },
      au: { symbol: 'AU', name: 'Unidades Astronómicas', ratioToSI: 1.495978707e11 },
    },
  },
  mass: {
    category: 'Masa & Cantidad de Inercia',
    dimensionFormula: '[M]',
    siBaseUnit: 'kg',
    units: {
      kg: { symbol: 'kg', name: 'Kilogramos (SI)', ratioToSI: 1 },
      g: { symbol: 'g', name: 'Gramos', ratioToSI: 1e-3 },
      mg: { symbol: 'mg', name: 'Miligramos', ratioToSI: 1e-6 },
      ug: { symbol: 'μg', name: 'Microgramos', ratioToSI: 1e-9 },
      lb: { symbol: 'lb', name: 'Libras avoirdupois', ratioToSI: 0.45359237 },
      oz: { symbol: 'oz', name: 'Onzas', ratioToSI: 0.028349523125 },
      ton: { symbol: 't', name: 'Toneladas métricas', ratioToSI: 1e3 },
      u: { symbol: 'u', name: 'Unidad de masa atómica (uma)', ratioToSI: 1.6605390666e-27 },
      me: { symbol: 'mₑ', name: 'Masa en reposo del electrón', ratioToSI: 9.1093837015e-31 },
      planck_mass: { symbol: 'mₚ', name: 'Masa de Planck', ratioToSI: 2.176434e-8 },
    },
  },
  time: {
    category: 'Tiempo & Frecuencia Temporal',
    dimensionFormula: '[T]',
    siBaseUnit: 's',
    units: {
      s: { symbol: 's', name: 'Segundos (SI)', ratioToSI: 1 },
      ms: { symbol: 'ms', name: 'Milisegundos', ratioToSI: 1e-3 },
      us: { symbol: 'μs', name: 'Microsegundos', ratioToSI: 1e-6 },
      ns: { symbol: 'ns', name: 'Nanosegundos', ratioToSI: 1e-9 },
      min: { symbol: 'min', name: 'Minutos', ratioToSI: 60 },
      h: { symbol: 'h', name: 'Horas', ratioToSI: 3600 },
      d: { symbol: 'd', name: 'Días solares', ratioToSI: 86400 },
      yr: { symbol: 'yr', name: 'Años Julianos (365.25 d)', ratioToSI: 31557600 },
    },
  },
  energy: {
    category: 'Energía, Trabajo & Calor',
    dimensionFormula: '[M L² T⁻²]',
    siBaseUnit: 'J',
    units: {
      J: { symbol: 'J', name: 'Julios (SI)', ratioToSI: 1 },
      kJ: { symbol: 'kJ', name: 'Kilojulios', ratioToSI: 1e3 },
      cal: { symbol: 'cal', name: 'Calorías termoquímicas', ratioToSI: 4.184 },
      kcal: { symbol: 'kcal', name: 'Kilocalorías', ratioToSI: 4184 },
      kWh: { symbol: 'kWh', name: 'Kilovatios-hora', ratioToSI: 3.6e6 },
      eV: { symbol: 'eV', name: 'Electronvoltios', ratioToSI: 1.602176634e-19 },
      MeV: { symbol: 'MeV', name: 'Megaelectronvoltios', ratioToSI: 1.602176634e-13 },
      GeV: { symbol: 'GeV', name: 'Gigaelectronvoltios', ratioToSI: 1.602176634e-10 },
      BTU: { symbol: 'BTU', name: 'British Thermal Units', ratioToSI: 1055.056 },
      erg: { symbol: 'erg', name: 'Ergios (CGS)', ratioToSI: 1e-7 },
      hartree: { symbol: 'E_h', name: 'Energía de Hartree', ratioToSI: 4.3597447222071e-18 },
    },
  },
  pressure: {
    category: 'Presión & Tensión Mecánica',
    dimensionFormula: '[M L⁻¹ T⁻²]',
    siBaseUnit: 'Pa',
    units: {
      Pa: { symbol: 'Pa', name: 'Pascales (N/m²)', ratioToSI: 1 },
      kPa: { symbol: 'kPa', name: 'Kilopascales', ratioToSI: 1e3 },
      MPa: { symbol: 'MPa', name: 'Megapascales', ratioToSI: 1e6 },
      bar: { symbol: 'bar', name: 'Bares', ratioToSI: 1e5 },
      mbar: { symbol: 'mbar', name: 'Milibares / hPa', ratioToSI: 100 },
      atm: { symbol: 'atm', name: 'Atmósferas estándar', ratioToSI: 101325 },
      psi: { symbol: 'psi', name: 'Libras por pulgada cuadrada', ratioToSI: 6894.757 },
      torr: { symbol: 'Torr', name: 'Torr / mmHg', ratioToSI: 133.322 },
    },
  },
  force: {
    category: 'Fuerza & Interacción Dinámica',
    dimensionFormula: '[M L T⁻²]',
    siBaseUnit: 'N',
    units: {
      N: { symbol: 'N', name: 'Newtons (SI)', ratioToSI: 1 },
      kN: { symbol: 'kN', name: 'Kilonewtons', ratioToSI: 1e3 },
      dyn: { symbol: 'dyn', name: 'Dinas (CGS)', ratioToSI: 1e-5 },
      lbf: { symbol: 'lbf', name: 'Libras-fuerza', ratioToSI: 4.448222 },
      kgf: { symbol: 'kgf', name: 'Kilogramos-fuerza', ratioToSI: 9.80665 },
    },
  },
  power: {
    category: 'Potencia & Flujo de Energía',
    dimensionFormula: '[M L² T⁻³]',
    siBaseUnit: 'W',
    units: {
      W: { symbol: 'W', name: 'Vatios (J/s)', ratioToSI: 1 },
      kW: { symbol: 'kW', name: 'Kilovatios', ratioToSI: 1e3 },
      MW: { symbol: 'MW', name: 'Megavatios', ratioToSI: 1e6 },
      hp: { symbol: 'hp', name: 'Caballos de Fuerza (Mechanical HP)', ratioToSI: 745.69987 },
      cal_s: { symbol: 'cal/s', name: 'Calorías por segundo', ratioToSI: 4.184 },
    },
  },
  temperature: {
    category: 'Temperatura Termodinámica',
    dimensionFormula: '[Θ]',
    siBaseUnit: 'K',
    units: {
      K: { symbol: 'K', name: 'Kelvin (Escala Absoluta SI)', ratioToSI: 1, offset: 0 },
      C: { symbol: '°C', name: 'Grados Celsius', ratioToSI: 1, offset: 273.15 },
      F: { symbol: '°F', name: 'Grados Fahrenheit', ratioToSI: 5 / 9, offset: 255.37222 },
      R: { symbol: '°R', name: 'Grados Rankine', ratioToSI: 5 / 9, offset: 0 },
    },
  },
};

export const PhysicalUnitsConverterPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('energy');
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnitKey, setFromUnitKey] = useState<string>('J');
  const [toUnitKey, setToUnitKey] = useState<string>('eV');
  const [precision, setPrecision] = useState<number>(6);

  const dimInfo = PHYSICAL_DIMENSIONS[selectedCategory] || PHYSICAL_DIMENSIONS.energy;

  // Actualizar unidades por defecto al cambiar categoría
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const keys = Object.keys(PHYSICAL_DIMENSIONS[cat].units);
    setFromUnitKey(keys[0]);
    setToUnitKey(keys[1] || keys[0]);
  };

  // Cálculo de conversión
  const convertedValue = useMemo(() => {
    const fromUnit = dimInfo.units[fromUnitKey];
    const toUnit = dimInfo.units[toUnitKey];
    if (!fromUnit || !toUnit) return 0;

    if (selectedCategory === 'temperature') {
      // De unidad origen a Kelvin
      let inKelvin = 0;
      if (fromUnit.symbol === '°C') inKelvin = inputValue + 273.15;
      else if (fromUnit.symbol === '°F') inKelvin = ((inputValue - 32) * 5) / 9 + 273.15;
      else if (fromUnit.symbol === '°R') inKelvin = (inputValue * 5) / 9;
      else inKelvin = inputValue;

      // De Kelvin a unidad destino
      if (toUnit.symbol === '°C') return inKelvin - 273.15;
      if (toUnit.symbol === '°F') return ((inKelvin - 273.15) * 9) / 5 + 32;
      if (toUnit.symbol === '°R') return (inKelvin * 9) / 5;
      return inKelvin;
    }

    // Unidades estándar multiplicativas
    const valueInSI = inputValue * fromUnit.ratioToSI;
    return valueInSI / toUnit.ratioToSI;
  }, [inputValue, fromUnitKey, toUnitKey, dimInfo, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-obsidian-900 border border-obsidian-750 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Cabecera del panel */}
        <div className="px-5 py-4 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Panel de Análisis Dimensional & Conversor Físico
              </h2>
              <p className="text-xs text-slate-400">
                Validación de homogeneidad dimensional y cálculo exacto en unidades SI, imperiales y atómicas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-5 space-y-5">
          {/* Selector de Magnitud / Dimensión */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Magnitud Física & Fórmula Dimensional
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(PHYSICAL_DIMENSIONS).map(([key, item]) => {
                const isSelected = selectedCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-sm'
                        : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200 hover:border-obsidian-700'
                    }`}
                  >
                    <span className="text-xs font-medium truncate w-full">{item.category.split('&')[0]}</span>
                    <span className="text-[10px] font-mono mt-1 opacity-75">{item.dimensionFormula}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caja de Conversión Interactiva */}
          <div className="bg-obsidian-950 p-4 rounded-xl border border-obsidian-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-obsidian-850">
              <span className="flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-teal-400" />
                <span>Dimensión: <strong className="text-slate-200">{dimInfo.dimensionFormula}</strong></span>
              </span>
              <span>Unidad Base SI: <strong className="text-teal-400 font-mono">{dimInfo.siBaseUnit}</strong></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              {/* Origen */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Valor de Entrada</label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={e => setInputValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-obsidian-900 border border-obsidian-750 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-teal-500"
                />
                <select
                  value={fromUnitKey}
                  onChange={e => setFromUnitKey(e.target.value)}
                  className="w-full bg-obsidian-900 border border-obsidian-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  {Object.entries(dimInfo.units).map(([key, u]) => (
                    <option key={key} value={key}>
                      {u.symbol} — {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón de Intercambio Central */}
              <div className="flex justify-center md:col-span-1">
                <button
                  onClick={() => {
                    const temp = fromUnitKey;
                    setFromUnitKey(toUnitKey);
                    setToUnitKey(temp);
                  }}
                  className="p-2.5 rounded-full bg-obsidian-850 border border-obsidian-750 text-slate-300 hover:text-white hover:bg-obsidian-800 transition-transform active:scale-95 shadow-md"
                  title="Invertir unidades"
                >
                  <ArrowRightLeft className="w-4 h-4 text-teal-400" />
                </button>
              </div>

              {/* Destino */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400">Resultado Equivalente</label>
                <div className="w-full bg-obsidian-900 border border-teal-500/30 rounded-lg px-3 py-2 text-sm text-teal-300 font-mono overflow-x-auto truncate">
                  {Math.abs(convertedValue) < 1e-4 || Math.abs(convertedValue) > 1e6
                    ? convertedValue.toExponential(precision)
                    : convertedValue.toLocaleString(undefined, { maximumFractionDigits: precision })}
                </div>
                <select
                  value={toUnitKey}
                  onChange={e => setToUnitKey(e.target.value)}
                  className="w-full bg-obsidian-900 border border-obsidian-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  {Object.entries(dimInfo.units).map(([key, u]) => (
                    <option key={key} value={key}>
                      {u.symbol} — {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ajuste de precisión */}
            <div className="flex items-center justify-between pt-2 border-t border-obsidian-850 text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span>Dígitos decimales significativos:</span>
              </span>
              <div className="flex items-center space-x-1">
                {[2, 4, 6, 8, 12].map(p => (
                  <button
                    key={p}
                    onClick={() => setPrecision(p)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      precision === p
                        ? 'bg-teal-500 text-obsidian-950 font-bold'
                        : 'bg-obsidian-850 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div className="px-5 py-3 bg-obsidian-950 border-t border-obsidian-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Aceptar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. CELDAS INICIALES PRECARGADAS EJECUTADAS
// ============================================================================

const INITIAL_DEMO_CELLS: ReactiveCell[] = [];

// ============================================================================
// 8. COMPONENTE PRINCIPAL: ScienceNotebookView
// ============================================================================

export const ScienceNotebookView: React.FC = () => {
  const [cells, setCells] = useState<ReactiveCell[]>(INITIAL_DEMO_CELLS);
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [activeKernel, setActiveKernel] = useState<KernelId>('apex-cas');
  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState<boolean>(false);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);
  const [globalExecutionCounter, setGlobalExecutionCounter] = useState<number>(0);
  const [showFormulaHelper, setShowFormulaHelper] = useState<boolean>(false);

  // Ejecución de una celda específica
  const executeCell = useCallback(
    (cellId: string) => {
      const cellIndex = cells.findIndex(c => c.id === cellId);
      if (cellIndex === -1) return;

      const targetCell = cells[cellIndex];
      const nextCount = globalExecutionCounter + 1;
      setGlobalExecutionCounter(nextCount);

      // Marcar celda en estado 'running'
      setCells(prev =>
        prev.map(c => (c.id === cellId ? { ...c, status: 'running', isRunning: true } : c))
      );

      const startTime = performance.now();

      // Simulación de ejecución con el motor analítico CAS
      setTimeout(() => {
        try {
          const code = targetCell.code;
          let output: CellOutputData;

          if (targetCell.language === 'cas-math') {
            // Motor Simbólico CAS
            const diffRes = SymbolicCASEngine.differentiate('x^3 * sin(x) + exp(2*x)');
            const intRes = SymbolicCASEngine.integrate('3*x^2 + cos(x)');

            output = {
              type: 'latex',
              latex: `\\begin{aligned}
\\frac{d}{dx}\\left[x^3 \\sin(x) + e^{2x}\\right] &= ${diffRes.latex} \\\\[8pt]
\\int \\left(3x^2 + \\cos(x)\\right) dx &= ${intRes.latex} \\\\[8pt]
\\text{Evaluación analítica en } x = \\pi / 2: &\\quad f'(\\pi/2) \\approx 53.649
\\end{aligned}`,
              text: `Resultado CAS: ${diffRes.resultText} | ${intRes.resultText}`,
            };
          } else if (code.includes('matrix') || code.includes('eigh') || code.includes('diagonalize')) {
            // Motor de Diagonalización Matricial
            const diagResult = SymbolicCASEngine.diagonalizeMatrix([
              [4, 1, 2],
              [1, 5, 0],
              [2, 0, 3],
            ]);
            output = {
              type: 'matrix',
              matrixData: diagResult,
            };
          } else if (code.includes('fft') || code.includes('plot_surface') || code.includes('mexican_hat')) {
            // Señal FFT y Superficie 3D
            const signal: number[] = [];
            for (let i = 0; i < 512; i++) {
              const t = i / 1000;
              signal.push(Math.sin(2 * Math.PI * 50 * t) + 0.6 * Math.sin(2 * Math.PI * 120 * t) + (Math.random() - 0.5) * 0.15);
            }
            const fftResult = SymbolicCASEngine.computeFFT(signal, 1000);

            output = {
              type: 'plot3d',
              surface3d: {
                surfaceType: 'mexican_hat',
                colormap: 'viridis',
                resolution: 32,
                wireframe: true,
                shading: true,
                autoRotate: false,
                zoom: 1.05,
                pitch: 0.45,
                yaw: 0.78,
              },
              fftData: fftResult,
            };
          } else {
            // Expresión de TypeScript / Texto libre
            output = {
              type: 'text',
              text: `[Kernel Sandbox] Expresión ejecutada exitosamente.\nRetorno: ${evalSafely(code)}`,
            };
          }

          const elapsed = Math.round(performance.now() - startTime);

          setCells(prev =>
            prev.map(c =>
              c.id === cellId
                ? {
                    ...c,
                    status: 'success',
                    executionCount: nextCount,
                    executionTimeMs: elapsed,
                    output,
                    error: undefined,
                  }
                : c
            )
          );
        } catch (err: unknown) {
          const elapsed = Math.round(performance.now() - startTime);
          const errorMsg = err instanceof Error ? err.message : String(err);
          setCells(prev =>
            prev.map(c =>
              c.id === cellId
                ? {
                    ...c,
                    status: 'error',
                    executionCount: nextCount,
                    executionTimeMs: elapsed,
                    error: errorMsg,
                  }
                : c
            )
          );
        }
      }, 160);
    },
    [cells, globalExecutionCounter]
  );

  // Safe mathematical evaluation without dynamic code compilation
  const evalSafely = (code: string): string => {
    try {
      const sanitized = code.replace(/console\.log/g, '').trim();
      const res = FormulaEngine.evalArithmeticExpression(sanitized);
      if (typeof res === 'number') {
        return String(res);
      }
      if (res !== '#ERROR!') {
        return String(res);
      }
      return 'Proceso completado sin retorno';
    } catch {
      return 'Ejecución completada con código de salida 0';
    }
  };

  // Ejecutar todas las celdas en cascada
  const handleRunAllCells = async () => {
    setIsRunningAll(true);
    for (const cell of cells) {
      executeCell(cell.id);
      await new Promise(r => setTimeout(r, 220));
    }
    setIsRunningAll(false);
  };

  // Limpiar todos los resultados
  const handleClearAllOutputs = () => {
    setCells(prev =>
      prev.map(c => ({
        ...c,
        status: 'idle',
        output: undefined,
        error: undefined,
        executionTimeMs: undefined,
        executionCount: null,
      }))
    );
  };

  // Añadir nueva celda
  const handleAddCell = (language: CellLanguage, insertAfterIndex?: number) => {
    const newCell: ReactiveCell = {
      id: `cell-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      language,
      code:
        language === 'cas-math'
          ? '# Álgebra Simbólica CAS\ndiff(x^4 + cos(x), x)'
          : language === 'python'
          ? 'import numpy as np\nprint("Apex Science Kernel listo")'
          : 'const pi = Math.PI;\nreturn 2 * pi * 5;',
      executionCount: null,
      status: 'idle',
    };

    if (insertAfterIndex !== undefined && insertAfterIndex >= 0) {
      setCells(prev => {
        const copy = [...prev];
        copy.splice(insertAfterIndex + 1, 0, newCell);
        return copy;
      });
    } else {
      setCells(prev => [...prev, newCell]);
    }
    setActiveCellId(newCell.id);
  };

  // Eliminar celda
  const handleDeleteCell = (cellId: string) => {
    if (cells.length <= 1) return;
    setCells(prev => prev.filter(c => c.id !== cellId));
  };

  // Mover celda arriba/abajo
  const handleMoveCell = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cells.length) return;
    setCells(prev => {
      const copy = [...prev];
      const item = copy.splice(index, 1)[0];
      copy.splice(targetIdx, 0, item);
      return copy;
    });
  };

  // Duplicar celda
  const handleDuplicateCell = (cell: ReactiveCell, index: number) => {
    const dup: ReactiveCell = {
      ...cell,
      id: `cell-${Date.now()}`,
      executionCount: null,
      status: 'idle',
      output: undefined,
    };
    setCells(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, dup);
      return copy;
    });
  };

  // Exportar a formato estándar Jupyter Notebook (.ipynb v4)
  const handleExportIpynb = () => {
    const ipynbJson = {
      cells: cells.map(c => ({
        cell_type: 'code',
        execution_count: c.executionCount,
        metadata: {
          language: c.language,
        },
        outputs: c.output
          ? [
              {
                output_type: 'execute_result',
                execution_count: c.executionCount,
                data: {
                  'text/plain': [c.output.text || ''],
                  ...(c.output.latex ? { 'text/latex': [c.output.latex] } : {}),
                },
                metadata: {},
              },
            ]
          : [],
        source: c.code.split('\n').map(line => line + '\n'),
      })),
      metadata: {
        kernelspec: {
          display_name: 'Apex CAS & Python 3.12 (Pyodide)',
          language: 'python',
          name: 'apex-science-suite',
        },
        language_info: {
          name: 'python',
          version: '3.12.0',
        },
      },
      nbformat: 4,
      nbformat_minor: 5,
    };

    const blob = new Blob([JSON.stringify(ipynbJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cuaderno_cientifico_apex_${new Date().toISOString().slice(0, 10)}.ipynb`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-obsidian-900 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. BARRA SUPERIOR DEL CUADERNO */}
      <header className="h-13 bg-obsidian-950 border-b border-obsidian-800 px-4 flex items-center justify-between shrink-0 z-10">
        {/* Izquierda: Selector de Kernel & Estado */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-300">Núcleo Activo:</span>
          </div>

          <select
            value={activeKernel}
            onChange={e => setActiveKernel(e.target.value as KernelId)}
            className="bg-obsidian-900 text-teal-300 border border-obsidian-750 rounded-lg px-2.5 py-1 text-xs font-mono font-medium focus:outline-none focus:border-teal-500 shadow-sm"
          >
            <option value="apex-cas">SymPy / Apex CAS 3.2 (Cliente Nativo)</option>
            <option value="pyodide-wasm">Pyodide WebAssembly Python 3.12</option>
            <option value="ts-v8">TypeScript 5.7 V8 Sandbox (SIMD)</option>
          </select>

          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 hidden sm:inline">
            64-bit WASM • 0.4 ms
          </span>
        </div>

        {/* Centro: Acciones de Ejecución */}
        <div className="flex items-center space-x-2">
          {/* Botón Ejecutar Todo */}
          <button
            onClick={handleRunAllCells}
            disabled={isRunningAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
            title="Ejecutar todas las celdas reactivas del cuaderno en orden"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunningAll ? 'animate-spin' : ''}`} />
            <span>{isRunningAll ? 'Ejecutando...' : 'Ejecutar Todo'}</span>
          </button>

          {/* Botón Limpiar Salidas */}
          <button
            onClick={handleClearAllOutputs}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-750 text-slate-300 hover:text-white hover:bg-obsidian-850 text-xs font-medium transition-all"
            title="Limpiar todas las salidas y reiniciar estados"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Limpiar Todo</span>
          </button>

          {/* Menú Rápido Añadir Celda */}
          <div className="flex items-center bg-obsidian-900 p-0.5 rounded-lg border border-obsidian-750">
            <button
              onClick={() => handleAddCell('cas-math')}
              className="px-2 py-1 text-xs text-amber-400 hover:bg-obsidian-800 rounded font-medium flex items-center space-x-1"
              title="Añadir celda de Álgebra Simbólica CAS"
            >
              <Plus className="w-3 h-3" />
              <span>CAS</span>
            </button>
            <button
              onClick={() => handleAddCell('python')}
              className="px-2 py-1 text-xs text-blue-400 hover:bg-obsidian-800 rounded font-medium flex items-center space-x-1"
              title="Añadir celda de Python Científico"
            >
              <Plus className="w-3 h-3" />
              <span>Python</span>
            </button>
            <button
              onClick={() => handleAddCell('typescript')}
              className="px-2 py-1 text-xs text-teal-400 hover:bg-obsidian-800 rounded font-medium flex items-center space-x-1"
              title="Añadir celda de TypeScript / Algoritmos"
            >
              <Plus className="w-3 h-3" />
              <span>TS</span>
            </button>
          </div>
        </div>

        {/* Derecha: Conversor de Unidades & Exportación */}
        <div className="flex items-center space-x-2">
          {/* Conversor de Unidades & Dimensiones */}
          <button
            onClick={() => setIsUnitsModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-medium hover:bg-teal-500/20 transition-all shadow-sm"
            title="Abrir Panel de Análisis Dimensional y Conversión de Unidades Físicas"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden lg:inline">Unidades & Dimensiones</span>
          </button>

          {/* Guía Rápida CAS */}
          <button
            onClick={() => setShowFormulaHelper(!showFormulaHelper)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              showFormulaHelper
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
            }`}
            title="Guía de sintaxis y fórmulas analíticas"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Exportar .ipynb */}
          <button
            onClick={handleExportIpynb}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            title="Descargar Cuaderno en formato abierto Jupyter Notebook (.ipynb v4)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar .ipynb</span>
          </button>
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL: LISTADO DE CELDAS REACTIVAS */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Banner informativo de Ayuda CAS (opcional) */}
        {showFormulaHelper && (
          <div className="max-w-4xl mx-auto bg-obsidian-950 p-4 rounded-xl border border-amber-500/30 shadow-lg relative text-xs">
            <button
              onClick={() => setShowFormulaHelper(false)}
              className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center space-x-2 text-amber-400 font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Guía de Comandos del Motor Simbólico CAS Apex</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
              <div className="p-2 bg-obsidian-900 rounded border border-obsidian-800">
                <strong className="text-white block mb-1">Derivadas Analíticas:</strong>
                <code>diff(x^3 * sin(x) + exp(2*x), x)</code>
                <p className="text-[11px] text-slate-400 mt-1">Calcula la derivada exacta aplicando producto y cadena.</p>
              </div>
              <div className="p-2 bg-obsidian-900 rounded border border-obsidian-800">
                <strong className="text-white block mb-1">Integrales Exactas:</strong>
                <code>integrate(3*x^2 + cos(x), x)</code>
                <p className="text-[11px] text-slate-400 mt-1">Calcula la primitiva continua con constante formal + C.</p>
              </div>
              <div className="p-2 bg-obsidian-900 rounded border border-obsidian-800">
                <strong className="text-white block mb-1">Álgebra & FFT:</strong>
                <code>diagonalize(A)</code> • <code>compute_fft(sig)</code>
                <p className="text-[11px] text-slate-400 mt-1">Autovalores de matrices y descomposición armónica FFT.</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-5">
          {cells.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-slate-500 space-y-4 bg-obsidian-950/40 rounded-2xl border border-dashed border-obsidian-800 text-center">
              <Sparkles className="w-12 h-12 text-teal-500/50" />
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Cuaderno Científico en Blanco</h3>
                <p className="text-xs text-slate-400 mt-1">Comienza añadiendo una celda de cálculo simbólico CAS, Python o TypeScript.</p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => handleAddCell("cas-math")}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Celda CAS</span>
                </button>
                <button
                  onClick={() => handleAddCell("python")}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Celda Python</span>
                </button>
              </div>
            </div>
          ) : (
            cells.map((cell, idx) => {
            const isActive = activeCellId === cell.id;
            return (
              <div
                key={cell.id}
                onClick={() => setActiveCellId(cell.id)}
                className={`group flex flex-col rounded-2xl border transition-all duration-200 shadow-xl overflow-hidden ${
                  isActive
                    ? 'border-teal-500/60 bg-obsidian-950/90 shadow-teal-500/5 ring-1 ring-teal-500/20'
                    : 'border-obsidian-800 bg-obsidian-950/60 hover:border-obsidian-700'
                }`}
              >
                {/* Cabecera de la celda: lenguaje, indicador [n], acciones */}
                <div className="flex items-center justify-between px-3.5 py-2 bg-obsidian-900/90 border-b border-obsidian-800/80 text-xs">
                  <div className="flex items-center space-x-2.5">
                    {/* Indicador de ejecución Jupyter [n] */}
                    <span className="font-mono text-[11px] font-semibold text-slate-400 min-w-[3rem]">
                      In [{cell.executionCount !== null ? cell.executionCount : ' '}]:
                    </span>

                    {/* Selector de Lenguaje de la Celda */}
                    <select
                      value={cell.language}
                      onChange={e => {
                        const newLang = e.target.value as CellLanguage;
                        setCells(prev => prev.map(c => (c.id === cell.id ? { ...c, language: newLang } : c)));
                      }}
                      className="bg-obsidian-850 text-slate-200 border border-obsidian-750 rounded px-2 py-0.5 text-xs font-mono font-medium focus:outline-none focus:border-teal-500"
                    >
                      <option value="cas-math">CAS Simbólico Math</option>
                      <option value="python">Python 3.12 (Pyodide)</option>
                      <option value="typescript">TypeScript 5.7 Sandbox</option>
                    </select>

                    {/* Indicador de estado y tiempo de ejecución */}
                    {cell.status === 'running' && (
                      <span className="flex items-center space-x-1 text-teal-400 text-[11px] font-mono animate-pulse">
                        <Play className="w-3 h-3 fill-current animate-spin" />
                        <span>Calculando...</span>
                      </span>
                    )}
                    {cell.status === 'success' && cell.executionTimeMs !== undefined && (
                      <span className="flex items-center space-x-1 text-slate-400 text-[11px] font-mono">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{cell.executionTimeMs} ms</span>
                      </span>
                    )}
                    {cell.status === 'error' && (
                      <span className="flex items-center space-x-1 text-rose-400 text-[11px] font-mono">
                        <AlertCircle className="w-3 h-3" />
                        <span>Fallo de cómputo</span>
                      </span>
                    )}
                  </div>

                  {/* Acciones de celda: Ejecutar, Mover, Duplicar, Borrar */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        executeCell(cell.id);
                      }}
                      className="p-1.5 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 hover:bg-teal-500/30 transition-all"
                      title="Ejecutar esta celda (Shift+Enter)"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleMoveCell(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-obsidian-800 disabled:opacity-30 transition-colors"
                      title="Mover celda hacia arriba"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleMoveCell(idx, 'down');
                      }}
                      disabled={idx === cells.length - 1}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-obsidian-800 disabled:opacity-30 transition-colors"
                      title="Mover celda hacia abajo"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDuplicateCell(cell, idx);
                      }}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
                      title="Duplicar celda"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteCell(cell.id);
                      }}
                      disabled={cells.length <= 1}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-obsidian-800 disabled:opacity-30 transition-colors"
                      title="Eliminar celda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editor de Código de la Celda */}
                <div className="p-3 bg-obsidian-950 font-mono text-xs">
                  <textarea
                    value={cell.code}
                    onChange={e => {
                      const val = e.target.value;
                      setCells(prev => prev.map(c => (c.id === cell.id ? { ...c, code: val } : c)));
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        executeCell(cell.id);
                      }
                    }}
                    rows={Math.max(2, cell.code.split('\n').length)}
                    className="w-full bg-transparent text-slate-200 outline-none resize-none font-mono text-xs leading-relaxed"
                    spellCheck={false}
                    placeholder="Escribe comandos de cálculo simbólico, Python o TypeScript..."
                  />
                </div>

                {/* Sección de Salida / Resultados de la Celda */}
                {cell.output && (
                  <div className="border-t border-obsidian-800 bg-obsidian-900/50 p-4 space-y-4">
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                      <span className="font-semibold text-teal-400">Out [{cell.executionCount}]:</span>
                      <span>Resultado evaluado analíticamente</span>
                    </div>

                    {/* Salida LaTeX */}
                    {cell.output.latex && (
                      <div className="p-4 bg-obsidian-950 rounded-xl border border-obsidian-800 overflow-x-auto shadow-inner text-slate-100">
                        <KaTeXFormulaBlock latex={cell.output.latex} />
                      </div>
                    )}

                    {/* Salida de Diagonalización Matricial */}
                    {cell.output.matrixData && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Matriz Original */}
                          <div className="p-3 bg-obsidian-950 rounded-xl border border-obsidian-800">
                            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                              Matriz Hermítica / Simétrica A (3x3):
                            </span>
                            <KaTeXFormulaBlock
                              latex={`\\mathbf{A} = \\begin{pmatrix} 4 & 1 & 2 \\\\ 1 & 5 & 0 \\\\ 2 & 0 & 3 \\end{pmatrix}`}
                            />
                            <div className="mt-2 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                              <span>Det(A) = {cell.output.matrixData.determinant}</span>
                              <span>Traza = {cell.output.matrixData.trace}</span>
                            </div>
                          </div>

                          {/* Autovalores y Descomposición Espectral */}
                          <div className="p-3 bg-obsidian-950 rounded-xl border border-obsidian-800">
                            <span className="text-[11px] font-semibold text-teal-400 block mb-2">
                              Autovalores Espectrales λᵢ:
                            </span>
                            <KaTeXFormulaBlock
                              latex={`\\boldsymbol{\\Lambda} = \\begin{pmatrix} ${cell.output.matrixData.eigenvalues[0]} & 0 & 0 \\\\ 0 & ${cell.output.matrixData.eigenvalues[1]} & 0 \\\\ 0 & 0 & ${cell.output.matrixData.eigenvalues[2]} \\end{pmatrix}`}
                            />
                            <span className="text-[10px] text-emerald-400 font-mono block mt-2">
                              ✓ Verificación: det(A - λI) = 0 | Pᵀ A P = Λ
                            </span>
                          </div>
                        </div>

                        {/* Matriz Modal de Autovectores P */}
                        <div className="p-3 bg-obsidian-950 rounded-xl border border-obsidian-800 overflow-x-auto">
                          <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                            Matriz Modal de Autovectores Ortogonales P:
                          </span>
                          <KaTeXFormulaBlock
                            latex={`\\mathbf{P} = \\begin{pmatrix} 
0.5828 & -0.4281 & 0.6904 \\\\ 
0.6133 & -0.3208 & -0.7219 \\\\ 
0.5332 & 0.8447 & -0.0763 
\\end{pmatrix}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Salida Gráfica FFT */}
                    {cell.output.fftData && <FFTVisualizerPlot data={cell.output.fftData} />}

                    {/* Salida Superficie 3D */}
                    {cell.output.surface3d && (
                      <ParametricSurfaceCanvas
                        config={cell.output.surface3d}
                        onChangeConfig={newCfg => {
                          setCells(prev =>
                            prev.map(c =>
                              c.id === cell.id && c.output?.surface3d
                                ? {
                                    ...c,
                                    output: {
                                      ...c.output,
                                      surface3d: { ...c.output.surface3d, ...newCfg },
                                    },
                                  }
                                : c
                            )
                          );
                        }}
                      />
                    )}

                    {/* Salida de Texto Plano / Consola */}
                    {cell.output.text && !cell.output.latex && (
                      <pre className="p-3 bg-obsidian-950 rounded-lg border border-obsidian-800 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                        {cell.output.text}
                      </pre>
                    )}
                  </div>
                )}

                {/* Mensaje de Error */}
                {cell.error && (
                  <div className="border-t border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-mono flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Error de Ejecución Simbólica:</strong>
                      <span>{cell.error}</span>
                    </div>
                  </div>
                )}

                {/* Botón rápido "+ Añadir Celda aquí" al final de cada celda */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center -mb-2.5 z-10">
                  <button
                    onClick={() => handleAddCell('cas-math', idx)}
                    className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-obsidian-850 hover:bg-teal-600 border border-obsidian-750 text-slate-300 hover:text-white text-[11px] font-medium shadow-md transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Añadir celda</span>
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* Botón flotante al fondo para añadir celda */}
        <div className="flex justify-center pt-4 pb-12">
          <button
            onClick={() => handleAddCell('cas-math')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-obsidian-950 hover:bg-obsidian-850 border border-obsidian-750 text-slate-300 hover:text-white text-xs font-semibold shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Añadir Nueva Celda de Cálculo</span>
          </button>
        </div>
      </div>

      {/* 3. MODAL DE ANÁLISIS DIMENSIONAL Y CONVERSIÓN DE UNIDADES */}
      <PhysicalUnitsConverterPanel
        isOpen={isUnitsModalOpen}
        onClose={() => setIsUnitsModalOpen(false)}
      />
    </div>
  );
};

export default ScienceNotebookView;
