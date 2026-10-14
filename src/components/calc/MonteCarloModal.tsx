import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  X,
  RotateCcw,
  BarChart2,
  FileSpreadsheet,
  CheckCircle2,
  Activity,
  Zap,
  Target,
  Download,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { CellData } from '../../types';
import { SecuritySanitizer } from '../../core/securitySanitizer';

export type DistributionType = 'normal' | 'triangular' | 'uniform';

export interface MonteCarloModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBaseValue?: number;
  initialCoord?: string;
}

interface HoveredBinInfo {
  x0: number;
  x1: number;
  count: number;
  pct: number;
  cumulativePct: number;
  xPos: number;
  yPos: number;
}

export const MonteCarloModal: React.FC<MonteCarloModalProps> = ({
  isOpen,
  onClose,
  initialBaseValue,
  initialCoord,
}) => {
  const { spreadsheets, activeSpreadsheetId, activeCellCoord, addSheetToActiveSpreadsheet } =
    useOfficeStore();

  const currentBook = spreadsheets.find((s) => s.id === activeSpreadsheetId) || spreadsheets[0];
  const currentSheet =
    currentBook?.sheets.find((sh) => sh.id === currentBook.activeSheetId) || currentBook?.sheets[0];

  const targetCoord = initialCoord || activeCellCoord || 'B2';
  const activeCellVal = useMemo(() => {
    if (!currentSheet || !currentSheet.cells[targetCoord]) return 75000;
    const computed = currentSheet.cells[targetCoord].computed;
    if (typeof computed === 'number' && !isNaN(computed) && computed !== 0) {
      return computed;
    }
    const parsed = parseFloat(String(computed).replace(/[^0-9.-]+/g, ''));
    return !isNaN(parsed) && parsed !== 0 ? parsed : 75000;
  }, [currentSheet, targetCoord]);

  // Parameters
  const [baseValue, setBaseValue] = useState<number>(initialBaseValue ?? activeCellVal);
  const [iterations, setIterations] = useState<number>(10000);
  const [distribution, setDistribution] = useState<DistributionType>('normal');
  const [volatilityPercent, setVolatilityPercent] = useState<number>(18);
  const [targetHurdle, setTargetHurdle] = useState<number>(baseValue);
  const [hurdleType, setHurdleType] = useState<'profit' | 'cost'>('profit'); // profit: >= target, cost: <= target
  const [seed, setSeed] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [hoveredBin, setHoveredBin] = useState<HoveredBinInfo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync default base value when activeCellVal changes
  React.useEffect(() => {
    if (initialBaseValue !== undefined) {
      setBaseValue(initialBaseValue);
      setTargetHurdle(initialBaseValue);
    } else {
      setBaseValue(activeCellVal);
      setTargetHurdle(activeCellVal);
    }
  }, [activeCellVal, initialBaseValue]);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Box-Muller Transform for standard normal variate
  const sampleNormal = (mean: number, stdDev: number): number => {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  };

  // Triangular distribution sampler
  const sampleTriangular = (min: number, mode: number, max: number): number => {
    const u = Math.random();
    const f = (mode - min) / (max - min);
    if (u <= f) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    }
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  };

  // Uniform distribution sampler
  const sampleUniform = (min: number, max: number): number => {
    return min + Math.random() * (max - min);
  };

  // Run Stochastic Simulation
  const results = useMemo(() => {
    // depend on seed to trigger rerun
    if (seed < 0) return null;

    const stdDevParam = (baseValue * volatilityPercent) / 100;
    const count = Math.min(Math.max(iterations, 1000), 100000);
    const data = new Float64Array(count);

    if (distribution === 'normal') {
      for (let i = 0; i < count; i++) {
        data[i] = sampleNormal(baseValue, stdDevParam);
      }
    } else if (distribution === 'triangular') {
      const min = baseValue - stdDevParam * 2;
      const max = baseValue + stdDevParam * 2;
      const mode = baseValue;
      for (let i = 0; i < count; i++) {
        data[i] = sampleTriangular(min, mode, max);
      }
    } else {
      // uniform
      const min = baseValue - stdDevParam * Math.sqrt(3);
      const max = baseValue + stdDevParam * Math.sqrt(3);
      for (let i = 0; i < count; i++) {
        data[i] = sampleUniform(min, max);
      }
    }

    // Sort typed array
    data.sort();

    // Summary Statistics
    let sum = 0;
    for (let i = 0; i < count; i++) {
      sum += data[i];
    }
    const mean = sum / count;

    let varSum = 0;
    for (let i = 0; i < count; i++) {
      const diff = data[i] - mean;
      varSum += diff * diff;
    }
    const variance = varSum / (count - 1);
    const empiricalStdDev = Math.sqrt(variance);

    // Percentiles
    const p10 = data[Math.floor(count * 0.1)];
    const p25 = data[Math.floor(count * 0.25)];
    const p50 = data[Math.floor(count * 0.5)]; // Median
    const p75 = data[Math.floor(count * 0.75)];
    const p90 = data[Math.floor(count * 0.9)];
    const p95 = data[Math.floor(count * 0.95)];
    const minVal = data[0];
    const maxVal = data[count - 1];

    // Probability of Success
    let successCount = 0;
    for (let i = 0; i < count; i++) {
      if (hurdleType === 'profit' ? data[i] >= targetHurdle : data[i] <= targetHurdle) {
        successCount++;
      }
    }
    const successProbability = (successCount / count) * 100;

    // Value at Risk (VaR 90% and 95%)
    const var90 = mean - p10;
    const var95 = mean - data[Math.floor(count * 0.05)];

    // Bins for SVG Histogram (40 bins)
    const binCount = 40;
    const span = maxVal - minVal;
    const binWidth = span > 0 ? span / binCount : 1;
    const bins = Array.from({ length: binCount }, (_, idx) => ({
      index: idx,
      x0: minVal + idx * binWidth,
      x1: minVal + (idx + 1) * binWidth,
      mid: minVal + (idx + 0.5) * binWidth,
      count: 0,
      pct: 0,
      cumulativePct: 0,
    }));

    for (let i = 0; i < count; i++) {
      const val = data[i];
      let bIdx = Math.floor((val - minVal) / binWidth);
      if (bIdx >= binCount) bIdx = binCount - 1;
      if (bIdx < 0) bIdx = 0;
      bins[bIdx].count++;
    }

    let runningSum = 0;
    let maxBinCount = 0;
    bins.forEach((b) => {
      b.pct = (b.count / count) * 100;
      runningSum += b.count;
      b.cumulativePct = (runningSum / count) * 100;
      if (b.count > maxBinCount) maxBinCount = b.count;
    });

    // Generate theoretical Gaussian curve points for overlay
    const curvePoints: { x: number; y: number }[] = [];
    if (empiricalStdDev > 0) {
      const steps = 60;
      for (let s = 0; s <= steps; s++) {
        const xVal = minVal + (span * s) / steps;
        const z = (xVal - mean) / empiricalStdDev;
        // Normal probability density: (1 / (sigma * sqrt(2*pi))) * exp(-0.5 * z^2)
        const density = (1 / (empiricalStdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
        // Scale to histogram count
        const expectedCount = density * count * binWidth;
        curvePoints.push({ x: xVal, y: expectedCount });
      }
    }

    return {
      count,
      mean,
      variance,
      stdDev: empiricalStdDev,
      p10,
      p25,
      p50,
      p75,
      p90,
      p95,
      minVal,
      maxVal,
      successProbability,
      var90,
      var95,
      bins,
      maxBinCount,
      curvePoints,
    };
  }, [baseValue, iterations, distribution, volatilityPercent, targetHurdle, hurdleType, seed]);

  const handleRerun = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSeed((prev) => prev + 1);
      setIsSimulating(false);
    }, 120);
  };

  const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Insert full summary report into a new sheet
  const handleInsertReportToSheet = () => {
    if (!results) return;

    const cells: Record<string, CellData> = {};
    const title = `Informe Simulación Monte Carlo (${iterations.toLocaleString()} iteraciones)`;

    // Header banner
    cells['A1'] = {
      raw: title,
      computed: title,
      style: { bold: true, bg: '#312e81', color: '#e0e7ff' },
    };
    cells['B1'] = {
      raw: `Distribución: ${distribution.toUpperCase()}`,
      computed: `Distribución: ${distribution.toUpperCase()}`,
      style: { bold: true, bg: '#312e81', color: '#c7d2fe', align: 'center' },
    };

    // Parámetros de Entrada
    cells['A3'] = { raw: 'PARÁMETROS DE ENTRADA', computed: 'PARÁMETROS DE ENTRADA', style: { bold: true, bg: '#1e293b', color: '#f8fafc' } };
    cells['B3'] = { raw: 'VALOR', computed: 'VALOR', style: { bold: true, bg: '#1e293b', color: '#f8fafc', align: 'right' } };

    cells['A4'] = { raw: 'Valor Base Estimado', computed: 'Valor Base Estimado' };
    cells['B4'] = { raw: String(baseValue), computed: baseValue, style: { format: 'currency', align: 'right' } };

    cells['A5'] = { raw: 'Volatilidad / Desviación', computed: 'Volatilidad / Desviación' };
    cells['B5'] = { raw: `${volatilityPercent}%`, computed: `${volatilityPercent}%`, style: { align: 'right' } };

    cells['A6'] = { raw: 'Iteraciones Estocásticas', computed: 'Iteraciones Estocásticas' };
    cells['B6'] = { raw: String(iterations), computed: iterations, style: { format: 'number', align: 'right' } };

    cells['A7'] = { raw: 'Umbral de Éxito / Hurdle', computed: 'Umbral de Éxito / Hurdle' };
    cells['B7'] = { raw: String(targetHurdle), computed: targetHurdle, style: { format: 'currency', align: 'right' } };

    // Métricas Estadísticas
    cells['A9'] = { raw: 'ESTADÍSTICAS DEL MOTOR', computed: 'ESTADÍSTICAS DEL MOTOR', style: { bold: true, bg: '#1e293b', color: '#f8fafc' } };
    cells['B9'] = { raw: 'RESULTADO', computed: 'RESULTADO', style: { bold: true, bg: '#1e293b', color: '#f8fafc', align: 'right' } };

    cells['A10'] = { raw: 'Media Esperada (μ)', computed: 'Media Esperada (μ)' };
    cells['B10'] = { raw: String(results.mean), computed: results.mean, style: { format: 'currency', bold: true, color: '#38bdf8', align: 'right' } };

    cells['A11'] = { raw: 'Desviación Estándar (σ)', computed: 'Desviación Estándar (σ)' };
    cells['B11'] = { raw: String(results.stdDev), computed: results.stdDev, style: { format: 'currency', align: 'right' } };

    cells['A12'] = { raw: 'Varianza (s²)', computed: 'Varianza (s²)' };
    cells['B12'] = { raw: String(Math.round(results.variance)), computed: Math.round(results.variance), style: { format: 'number', align: 'right' } };

    cells['A13'] = { raw: 'Mínimo Simulado', computed: 'Mínimo Simulado' };
    cells['B13'] = { raw: String(results.minVal), computed: results.minVal, style: { format: 'currency', align: 'right' } };

    cells['A14'] = { raw: 'Máximo Simulado', computed: 'Máximo Simulado' };
    cells['B14'] = { raw: String(results.maxVal), computed: results.maxVal, style: { format: 'currency', align: 'right' } };

    // Percentiles de Riesgo
    cells['A16'] = { raw: 'PERCENTILES DE RIESGO', computed: 'PERCENTILES DE RIESGO', style: { bold: true, bg: '#064e3b', color: '#a7f3d0' } };
    cells['B16'] = { raw: 'VALOR', computed: 'VALOR', style: { bold: true, bg: '#064e3b', color: '#a7f3d0', align: 'right' } };

    cells['A17'] = { raw: 'P10 (Escenario Pesimista)', computed: 'P10 (Escenario Pesimista)' };
    cells['B17'] = { raw: String(results.p10), computed: results.p10, style: { format: 'currency', bold: true, color: '#f43f5e', align: 'right' } };

    cells['A18'] = { raw: 'P25 (Cuartil Inferior)', computed: 'P25 (Cuartil Inferior)' };
    cells['B18'] = { raw: String(results.p25), computed: results.p25, style: { format: 'currency', align: 'right' } };

    cells['A19'] = { raw: 'P50 (Mediana / 50%)', computed: 'P50 (Mediana / 50%)' };
    cells['B19'] = { raw: String(results.p50), computed: results.p50, style: { format: 'currency', bold: true, color: '#38bdf8', align: 'right' } };

    cells['A20'] = { raw: 'P75 (Cuartil Superior)', computed: 'P75 (Cuartil Superior)' };
    cells['B20'] = { raw: String(results.p75), computed: results.p75, style: { format: 'currency', align: 'right' } };

    cells['A21'] = { raw: 'P90 (Escenario Optimista)', computed: 'P90 (Escenario Optimista)' };
    cells['B21'] = { raw: String(results.p90), computed: results.p90, style: { format: 'currency', bold: true, color: '#10b981', align: 'right' } };

    cells['A22'] = { raw: 'Probabilidad de Éxito / Rentabilidad', computed: 'Probabilidad de Éxito / Rentabilidad' };
    cells['B22'] = { raw: `${results.successProbability.toFixed(1)}%`, computed: `${results.successProbability.toFixed(1)}%`, style: { bold: true, color: '#34d399', align: 'right' } };

    cells['A23'] = { raw: 'Value at Risk (VaR 90%)', computed: 'Value at Risk (VaR 90%)' };
    cells['B23'] = { raw: String(results.var90), computed: results.var90, style: { format: 'currency', color: '#fbbf24', align: 'right' } };

    const sheetName = `MonteCarlo-${Date.now().toString().slice(-4)}`;
    addSheetToActiveSpreadsheet(sheetName, cells);
    setToastMessage(`✓ Informe de Simulación guardado en nueva hoja "${sheetName}"`);
  };

  // Export report as CSV
  const handleExportCSV = () => {
    if (!results) return;

    const rows: string[][] = [
      ['INFORME DE RIESGO ESTOCÁSTICO MONTE CARLO - APEX CALC'],
      ['Fecha', new Date().toISOString()],
      ['Iteraciones', String(results.count)],
      ['Distribución', distribution],
      ['Valor Base (€)', String(baseValue)],
      ['Volatilidad (%)', `${volatilityPercent}%`],
      [''],
      ['MÉTRICAS ESTADÍSTICAS', 'VALOR'],
      ['Media Esperada (μ)', SecuritySanitizer.sanitizeCsvExportCell(String(results.mean))],
      ['Desviación Estándar (σ)', SecuritySanitizer.sanitizeCsvExportCell(String(results.stdDev))],
      ['Varianza', SecuritySanitizer.sanitizeCsvExportCell(String(results.variance))],
      ['Mínimo', SecuritySanitizer.sanitizeCsvExportCell(String(results.minVal))],
      ['Máximo', SecuritySanitizer.sanitizeCsvExportCell(String(results.maxVal))],
      [''],
      ['PERCENTILES DE RIESGO', 'VALOR'],
      ['P10 (Pesimista)', SecuritySanitizer.sanitizeCsvExportCell(String(results.p10))],
      ['P25', SecuritySanitizer.sanitizeCsvExportCell(String(results.p25))],
      ['P50 (Mediana)', SecuritySanitizer.sanitizeCsvExportCell(String(results.p50))],
      ['P75', SecuritySanitizer.sanitizeCsvExportCell(String(results.p75))],
      ['P90 (Optimista)', SecuritySanitizer.sanitizeCsvExportCell(String(results.p90))],
      ['P95', SecuritySanitizer.sanitizeCsvExportCell(String(results.p95))],
      ['Probabilidad de Éxito', `${results.successProbability.toFixed(2)}%`],
      ['VaR 90%', SecuritySanitizer.sanitizeCsvExportCell(String(results.var90))],
      ['VaR 95%', SecuritySanitizer.sanitizeCsvExportCell(String(results.var95))],
    ];

    const csvText = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monte_carlo_informe_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage('✓ Informe CSV descargado con éxito');
  };

  if (!isOpen || !results) return null;

  // SVG dimensions
  const svgWidth = 760;
  const svgHeight = 220;
  const chartBottom = 185;
  const chartTop = 25;
  const chartHeight = chartBottom - chartTop;
  const span = results.maxVal - results.minVal;

  const getSvgX = (val: number) => {
    if (span <= 0) return svgWidth / 2;
    return ((val - results.minVal) / span) * svgWidth;
  };

  // Build Gaussian curve SVG path
  let curvePathD = '';
  if (results.curvePoints.length > 0 && results.maxBinCount > 0) {
    results.curvePoints.forEach((pt, idx) => {
      const x = getSvgX(pt.x);
      const y = chartBottom - (pt.y / results.maxBinCount) * chartHeight;
      if (idx === 0) {
        curvePathD += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        curvePathD += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    });
  }

  const p10X = getSvgX(results.p10);
  const p50X = getSvgX(results.p50);
  const p90X = getSvgX(results.p90);
  const meanX = getSvgX(results.mean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-obsidian-900 border border-obsidian-750 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <header className="p-4 bg-obsidian-950 border-b border-obsidian-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Simulador de Riesgo Monte Carlo • Apex Calc
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  {iterations.toLocaleString()} iteraciones
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  V8 JIT TypedArray
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Modelado cuantitativo estocástico de incertidumbre, distribución de probabilidad y percentiles de riesgo
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 border border-obsidian-700 text-xs transition-colors"
              title="Descargar informe completo en CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar</span>
            </button>
            <button
              onClick={handleInsertReportToSheet}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition-all"
              title="Insertar informe en una nueva pestaña de hoja"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Insertar en Hoja</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 text-xs px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* CONFIGURATION TOOLBAR */}
        <div className="p-4 bg-obsidian-950/80 border-b border-obsidian-800 grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs shrink-0">
          {/* Base Value & Presets */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
              <span>Valor Base (€):</span>
              <span className="text-slate-500 font-mono">[{targetCoord}]</span>
            </div>
            <input
              type="number"
              value={baseValue}
              onChange={(e) => setBaseValue(Number(e.target.value) || 0)}
              className="w-full bg-obsidian-900 border border-obsidian-750 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex items-center space-x-1 pt-0.5">
              <button
                onClick={() => setBaseValue(activeCellVal)}
                className="text-[9px] text-indigo-400 hover:text-indigo-300 underline"
              >
                Usar celda ({formatCurrency(activeCellVal)})
              </button>
            </div>
          </div>

          {/* Iterations Selector */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Iteraciones:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[1000, 10000, 50000].map((num) => (
                <button
                  key={num}
                  onClick={() => setIterations(num)}
                  className={`py-1.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                    iterations === num
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-obsidian-900 text-slate-400 hover:bg-obsidian-800 border border-obsidian-750'
                  }`}
                >
                  {num >= 1000 ? `${num / 1000}k` : num}
                </button>
              ))}
            </div>
            <span className="text-[9px] text-slate-500 block">
              {iterations === 50000 ? 'Alta precisión estocástica' : 'Convergencia rápida'}
            </span>
          </div>

          {/* Distribution Type */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              Distribución:
            </label>
            <select
              value={distribution}
              onChange={(e) => setDistribution(e.target.value as DistributionType)}
              className="w-full bg-obsidian-900 border border-obsidian-750 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="normal">Normal (Gaussiana)</option>
              <option value="triangular">Triangular (Asimétrica)</option>
              <option value="uniform">Uniforme (Caja plana)</option>
            </select>
            <span className="text-[9px] text-slate-500 block truncate">
              {distribution === 'normal'
                ? 'Box-Muller empírico'
                : distribution === 'triangular'
                ? 'PERT presupuestario'
                : 'Incertidumbre uniforme'}
            </span>
          </div>

          {/* Volatility % Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
              <span>Volatilidad (σ):</span>
              <span className="text-indigo-400 font-mono font-semibold">±{volatilityPercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={volatilityPercent}
              onChange={(e) => setVolatilityPercent(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-obsidian-800 rounded-lg cursor-pointer"
            />
            <span className="text-[9px] text-slate-500 block font-mono">
              σ ≈ ±{formatCurrency((baseValue * volatilityPercent) / 100)}
            </span>
          </div>

          {/* Hurdle / Target Threshold */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
              <span>Umbral Éxito:</span>
              <button
                onClick={() => setHurdleType(hurdleType === 'profit' ? 'cost' : 'profit')}
                className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 underline"
              >
                {hurdleType === 'profit' ? '≥ Ingreso' : '≤ Coste'}
              </button>
            </div>
            <input
              type="number"
              value={targetHurdle}
              onChange={(e) => setTargetHurdle(Number(e.target.value) || 0)}
              className="w-full bg-obsidian-900 border border-obsidian-750 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[9px] text-slate-500 block">
              Calcula probabilidad de alcanzar meta
            </span>
          </div>
        </div>

        {/* MAIN BODY: KPIS & HISTOGRAM */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* KPI CARDS: P10, P50, P90, SUCCESS PROBABILITY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            {/* P10 (Pessimistic Scenario) */}
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    Caso Pesimista (P10)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <p className="text-xl font-extrabold text-rose-300">
                  {formatCurrency(results.p10)}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                90% probabilidad de superar este valor (Downside VaR)
              </span>
            </div>

            {/* P50 (Median) */}
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Mediana Esperada (P50)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <p className="text-xl font-extrabold text-indigo-200">
                  {formatCurrency(results.p50)}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                Punto central de probabilidad equilibrada (50/50)
              </span>
            </div>

            {/* P90 (Optimistic Scenario) */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Caso Optimista (P90)
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-xl font-extrabold text-emerald-300">
                  {formatCurrency(results.p90)}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                Escenario altamente favorable (Percentil top 10%)
              </span>
            </div>

            {/* Probability of Success / Profit */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Prob. {hurdleType === 'profit' ? '≥' : '≤'} Umbral
                  </span>
                  <Target className="w-3 h-3 text-amber-400" />
                </div>
                <p className="text-xl font-extrabold text-amber-300">
                  {results.successProbability.toFixed(1)}%
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">
                Media: {formatCurrency(results.mean)} | σ: ±{formatCurrency(results.stdDev)}
              </span>
            </div>
          </div>

          {/* INTERACTIVE SVG GAUSSIAN BELL HISTOGRAM CANVAS */}
          <div className="bg-obsidian-950 p-4 rounded-xl border border-obsidian-800 space-y-3 relative">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-200">
                  Histograma de Frecuencias Gaussiana con Curva Teórica Superpuesta
                </span>
              </div>

              {/* Legends */}
              <div className="flex items-center space-x-4 text-[11px] font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500" />
                  <span className="text-slate-300">P10 Pesimista</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                  <span className="text-slate-300">P50 Mediana</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                  <span className="text-slate-300">P90 Optimista</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 bg-indigo-300" />
                  <span className="text-indigo-300 font-sans">Campana Gauss</span>
                </div>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full relative bg-obsidian-900/60 rounded-lg p-2 border border-obsidian-850">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-56 overflow-visible select-none"
                onMouseLeave={() => setHoveredBin(null)}
              >
                <defs>
                  {/* Rose gradient for downside */}
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#881337" stopOpacity="0.4" />
                  </linearGradient>
                  {/* Indigo gradient for confidence */}
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#312e81" stopOpacity="0.4" />
                  </linearGradient>
                  {/* Emerald gradient for upside */}
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#064e3b" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                {[0.25, 0.5, 0.75].map((lvl) => {
                  const y = chartBottom - lvl * chartHeight;
                  return (
                    <line
                      key={lvl}
                      x1="0"
                      y1={y}
                      x2={svgWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="3 3"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Bottom Baseline */}
                <line
                  x1="0"
                  y1={chartBottom}
                  x2={svgWidth}
                  y2={chartBottom}
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Bins Frequency Bars */}
                {results.bins.map((bin) => {
                  const barWidth = Math.max(1, svgWidth / results.bins.length - 2);
                  const x = (bin.index * svgWidth) / results.bins.length + 1;
                  const height =
                    results.maxBinCount > 0 ? (bin.count / results.maxBinCount) * chartHeight : 0;
                  const y = chartBottom - height;

                  const isP10 = bin.x1 <= results.p10;
                  const isP90 = bin.x0 >= results.p90;
                  const fill = isP10
                    ? 'url(#roseGrad)'
                    : isP90
                    ? 'url(#emeraldGrad)'
                    : 'url(#indigoGrad)';

                  return (
                    <rect
                      key={bin.index}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      fill={fill}
                      rx={2}
                      className="cursor-pointer hover:opacity-100 transition-opacity"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredBin({
                          x0: bin.x0,
                          x1: bin.x1,
                          count: bin.count,
                          pct: bin.pct,
                          cumulativePct: bin.cumulativePct,
                          xPos: rect.left + rect.width / 2,
                          yPos: rect.top,
                        });
                      }}
                    />
                  );
                })}

                {/* Theoretical Smooth Gaussian Bell Path */}
                {curvePathD && (
                  <path
                    d={curvePathD}
                    fill="none"
                    stroke="#a5b4fc"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                )}

                {/* Vertical Percentile Lines */}
                {/* P10 Indicator */}
                <line
                  x1={p10X}
                  y1={chartTop}
                  x2={p10X}
                  y2={chartBottom}
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <circle cx={p10X} cy={chartTop} r="3" fill="#f43f5e" />
                <text
                  x={p10X}
                  y={chartTop - 6}
                  fill="#f43f5e"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  P10
                </text>

                {/* P50 Median Indicator */}
                <line
                  x1={p50X}
                  y1={chartTop}
                  x2={p50X}
                  y2={chartBottom}
                  stroke="#818cf8"
                  strokeWidth="2"
                />
                <circle cx={p50X} cy={chartTop} r="3" fill="#818cf8" />
                <text
                  x={p50X}
                  y={chartTop - 6}
                  fill="#818cf8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  P50 Mediana
                </text>

                {/* P90 Indicator */}
                <line
                  x1={p90X}
                  y1={chartTop}
                  x2={p90X}
                  y2={chartBottom}
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
                <circle cx={p90X} cy={chartTop} r="3" fill="#10b981" />
                <text
                  x={p90X}
                  y={chartTop - 6}
                  fill="#10b981"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  P90
                </text>

                {/* Mean Indicator */}
                <line
                  x1={meanX}
                  y1={chartTop + 15}
                  x2={meanX}
                  y2={chartBottom}
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />

                {/* X-Axis Labels */}
                <text
                  x="5"
                  y={chartBottom + 16}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {formatCurrency(results.minVal)}
                </text>
                <text
                  x={p10X}
                  y={chartBottom + 16}
                  fill="#f43f5e"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {formatCurrency(results.p10)}
                </text>
                <text
                  x={p50X}
                  y={chartBottom + 16}
                  fill="#818cf8"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {formatCurrency(results.p50)}
                </text>
                <text
                  x={p90X}
                  y={chartBottom + 16}
                  fill="#10b981"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {formatCurrency(results.p90)}
                </text>
                <text
                  x={svgWidth - 5}
                  y={chartBottom + 16}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {formatCurrency(results.maxVal)}
                </text>
              </svg>

              {/* Hover Tooltip Float */}
              {hoveredBin && (
                <div className="absolute top-3 left-4 bg-obsidian-950/95 border border-indigo-500/40 p-2.5 rounded-lg shadow-xl text-xs font-mono space-y-1 z-30 pointer-events-none">
                  <div className="text-slate-200 font-semibold border-b border-obsidian-800 pb-1">
                    Intervalo: {formatCurrency(hoveredBin.x0)} — {formatCurrency(hoveredBin.x1)}
                  </div>
                  <div className="flex justify-between space-x-4 text-slate-300">
                    <span>Frecuencia:</span>
                    <span className="text-indigo-400 font-bold">{hoveredBin.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between space-x-4 text-slate-300">
                    <span>% de la Muestra:</span>
                    <span className="text-emerald-400 font-bold">{hoveredBin.pct.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between space-x-4 text-slate-400">
                    <span>Prob. Acumulada:</span>
                    <span>{hoveredBin.cumulativePct.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RISK & VALUE AT RISK (VaR) ANALYSIS SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-1.5 font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span>Parámetros Estadísticos</span>
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Media Aritmética (μ):</span>
                <span className="font-semibold text-white">{formatCurrency(results.mean)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Desviación Estándar (σ):</span>
                <span className="font-semibold text-white">{formatCurrency(results.stdDev)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Varianza (s²):</span>
                <span className="font-semibold text-slate-400">{Math.round(results.variance).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-1.5 font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Value at Risk (VaR)</span>
              </span>
              <div className="flex justify-between text-slate-300">
                <span>VaR al 90% de Confianza:</span>
                <span className="font-semibold text-rose-300">{formatCurrency(results.var90)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>VaR al 95% de Confianza:</span>
                <span className="font-semibold text-rose-400">{formatCurrency(results.var95)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Pérdida máxima esperada:</span>
                <span className="font-semibold text-slate-400">{formatCurrency(results.mean - results.minVal)}</span>
              </div>
            </div>

            <div className="p-3 bg-obsidian-950 rounded-xl border border-obsidian-800 space-y-1.5 font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rango de Confianza (80%)</span>
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Límite Inferior (P10):</span>
                <span className="font-semibold text-rose-300">{formatCurrency(results.p10)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Límite Superior (P90):</span>
                <span className="font-semibold text-emerald-300">{formatCurrency(results.p90)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Amplitud del Intervalo:</span>
                <span className="font-semibold text-white">{formatCurrency(results.p90 - results.p10)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION BAR */}
        <footer className="p-4 bg-obsidian-950 border-t border-obsidian-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Motor probabilístico ejecutado en hilo local V8 (0 ms de latencia de red)</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleRerun}
              disabled={isSimulating}
              className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-obsidian-700 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Re-simular Muestra</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              Aceptar & Cerrar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MonteCarloModal;
