import React, { useState } from 'react';
import {
  DollarSign,
  Percent,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ShieldCheck,
  TrendingUp,
  Calculator,
  BarChart3,
  LineChart,
  PieChart,
  AreaChart,
  Filter,
  ArrowUpAZ,
  ArrowDownZA,
  ZoomIn,
  ZoomOut,
  Table,
  Link2,
  Hash,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  Palette,
  X,
  Plus,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { CellStyle } from '../../types';
import { PivotTableView } from './PivotTableView';
import { MonteCarloModal } from './MonteCarloModal';

export const GridCalcView: React.FC = () => {
  const {
    spreadsheets,
    activeSpreadsheetId,
    updateCell,
    activeCellCoord,
    setActiveCellCoord,
    setActiveSheetId,
    addSheetToActiveSpreadsheet,
  } = useOfficeStore();

  const currentBook = spreadsheets.find((s) => s.id === activeSpreadsheetId) || spreadsheets[0];
  const currentSheet =
    currentBook?.sheets.find((sh) => sh.id === currentBook.activeSheetId) ||
    currentBook?.sheets[0] || {
      id: 's1',
      name: 'Hoja 1',
      rowCount: 30,
      colCount: 12,
      cells: {},
    };

  const selectedCoord = activeCellCoord || 'B2';
  const activeCellData = currentSheet.cells[selectedCoord];
  const [formulaInput, setFormulaInput] = useState(activeCellData ? activeCellData.raw : '');

  // Ribbon state
  const [activeRibbonTab, setActiveRibbonTab] = useState<'inicio' | 'insertar' | 'formulas' | 'datos' | 'vista'>('inicio');

  // Chart state
  const [showChartPanel, setShowChartPanel] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area'>('bar');
  const [showPivotTable, setShowPivotTable] = useState(false);
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);

  // View state
  const [showGridlines, setShowGridlines] = useState(true);
  const [showHeaders, setShowHeaders] = useState(true);
  const [showFormulaBar, setShowFormulaBar] = useState(true);
  const [showFormulasMode, setShowFormulasMode] = useState(false); // If true, displays raw formula instead of computed
  const [zoomLevel, setZoomLevel] = useState(100);

  // Palettes dropdowns
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Font choices
  const fontFamilies = [
    { name: 'Predeterminada (Inter)', value: 'font-sans' },
    { name: 'JetBrains Mono', value: 'font-mono' },
    { name: 'Calibri / Segoe UI', value: 'font-sans tracking-tight' },
    { name: 'Times / Serif', value: 'font-serif' },
  ];
  const [selectedFont, setSelectedFont] = useState(fontFamilies[0].value);

  // Columns A - L
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const rows = Array.from({ length: 28 }, (_, i) => i + 1);

  const handleCellClick = (coord: string) => {
    setActiveCellCoord(coord);
    const data = currentSheet.cells[coord];
    setFormulaInput(data ? data.raw : '');
  };

  const handleFormulaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormulaInput(val);
    updateCell(selectedCoord, val);
  };

  const applyStyle = (stylePatch: Partial<CellStyle>) => {
    const currentStyle = activeCellData?.style || {};
    const updatedStyle = { ...currentStyle, ...stylePatch };
    updateCell(selectedCoord, activeCellData?.raw || '', updatedStyle);
  };

  const insertFormulaTemplate = (template: string) => {
    setFormulaInput(template);
    updateCell(selectedCoord, template);
  };

  // Color options
  const textColors = [
    { label: 'Predeterminado', value: '#e2e8f0' },
    { label: 'Blanco Puro', value: '#ffffff' },
    { label: 'Azul Apex', value: '#60a5fa' },
    { label: 'Esmeralda', value: '#34d399' },
    { label: 'Ámbar', value: '#fbbf24' },
    { label: 'Coral', value: '#f87171' },
    { label: 'Púrpura', value: '#c084fc' },
  ];

  const bgColors = [
    { label: 'Transparente', value: '' },
    { label: 'Azul Noche', value: '#1e293b' },
    { label: 'Verde Éxito', value: '#064e3b' },
    { label: 'Ámbar Alerta', value: '#78350f' },
    { label: 'Rojo Peligro', value: '#7f1d1d' },
    { label: 'Púrpura', value: '#4c1d95' },
    { label: 'Gris Oscuro', value: '#334155' },
  ];

  // Quick cell style presets
  const applyPresetStyle = (preset: 'normal' | 'good' | 'bad' | 'neutral' | 'header' | 'total') => {
    switch (preset) {
      case 'normal':
        applyStyle({ bold: false, italic: false, underline: false, bg: '', color: '#e2e8f0' });
        break;
      case 'good':
        applyStyle({ bold: true, bg: '#064e3b', color: '#6ee7b7' });
        break;
      case 'bad':
        applyStyle({ bold: true, bg: '#7f1d1d', color: '#fca5a5' });
        break;
      case 'neutral':
        applyStyle({ bold: false, bg: '#78350f', color: '#fde68a' });
        break;
      case 'header':
        applyStyle({ bold: true, bg: '#1e293b', color: '#ffffff', align: 'center' });
        break;
      case 'total':
        applyStyle({ bold: true, underline: true, bg: '#0f172a', color: '#818cf8' });
        break;
    }
  };

  // Compute live summary stats across all non-empty numeric cells in current sheet
  const numericValues: number[] = [];
  const chartDataPoints: { label: string; value: number }[] = [];

  // Extract pairs from rows where col A is label and col B (or C) is number
  rows.forEach((r) => {
    const labelCell = currentSheet.cells[`A${r}`];
    const valCell = currentSheet.cells[`B${r}`] || currentSheet.cells[`C${r}`];
    if (labelCell && valCell && typeof valCell.computed === 'number' && !isNaN(valCell.computed)) {
      chartDataPoints.push({
        label: String(labelCell.computed),
        value: valCell.computed,
      });
    }
  });

  Object.values(currentSheet.cells).forEach((c) => {
    if (typeof c.computed === 'number' && !isNaN(c.computed)) {
      numericValues.push(c.computed);
    }
  });

  const sumTotal = numericValues.reduce((a, b) => a + b, 0);
  const avgVal = numericValues.length ? (sumTotal / numericValues.length).toFixed(2) : '0';
  const maxVal = numericValues.length ? Math.max(...numericValues) : 0;
  const minVal = numericValues.length ? Math.min(...numericValues) : 0;

  // Fallback demo chart data if sheet doesn't have pairs yet
  const effectiveChartData = chartDataPoints.length >= 2 ? chartDataPoints : [
    { label: 'Ene', value: 12000 },
    { label: 'Feb', value: 18500 },
    { label: 'Mar', value: 15400 },
    { label: 'Abr', value: 24200 },
    { label: 'May', value: 29800 },
    { label: 'Jun', value: 34500 },
  ];

  const maxChartVal = Math.max(...effectiveChartData.map((d) => d.value), 1);

  // Sorting columns
  const handleSortCol = (ascending: boolean) => {
    // Determine target column letter
    const colLetter = selectedCoord.charAt(0);
    const colCells: { row: number; raw: string; computed: any; style?: CellStyle }[] = [];

    rows.forEach((r) => {
      const coord = `${colLetter}${r}`;
      const cell = currentSheet.cells[coord];
      if (cell && cell.raw) {
        colCells.push({ row: r, raw: cell.raw, computed: cell.computed, style: cell.style });
      }
    });

    if (colCells.length <= 1) return;

    colCells.sort((a, b) => {
      const valA = a.computed;
      const valB = b.computed;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return ascending ? valA - valB : valB - valA;
      }
      return ascending
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    colCells.forEach((item, index) => {
      const targetRow = colCells[0].row + index;
      updateCell(`${colLetter}${targetRow}`, item.raw, item.style);
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-900 overflow-hidden select-none">
      {/* ========================================================= */}
      {/* 1. MEGA-RIBBON TAB HEADER (Inicio, Insertar, Fórmulas, Datos, Vista) */}
      {/* ========================================================= */}
      <div className="bg-obsidian-950 border-b border-obsidian-800 flex items-center justify-between px-3 h-9 shrink-0">
        <div className="flex items-center space-x-1">
          <span className="flex items-center space-x-1 px-2 py-0.5 mr-2 rounded text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CALC</span>
          </span>

          <button
            onClick={() => setActiveRibbonTab('inicio')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'inicio'
                ? 'bg-obsidian-900 text-emerald-300 border-t-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveRibbonTab('insertar')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'insertar'
                ? 'bg-obsidian-900 text-emerald-300 border-t-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Insertar Gráficos
          </button>
          <button
            onClick={() => setActiveRibbonTab('formulas')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'formulas'
                ? 'bg-obsidian-900 text-emerald-300 border-t-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Fórmulas & Funciones
          </button>
          <button
            onClick={() => setActiveRibbonTab('datos')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'datos'
                ? 'bg-obsidian-900 text-emerald-300 border-t-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Datos & Análisis
          </button>
          <button
            onClick={() => setActiveRibbonTab('vista')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'vista'
                ? 'bg-obsidian-900 text-emerald-300 border-t-2 border-emerald-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Vista & Zoom
          </button>
        </div>

        {/* Security Formula Protection Badge */}
        <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Grafo DAG Aislado • DDE Protegido</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MEGA-RIBBON CONTENT PANEL (Packed with Tools) */}
      {/* ========================================================= */}
      <div className="min-h-[58px] bg-obsidian-900 border-b border-obsidian-800 px-3 py-1 flex items-center space-x-4 overflow-x-auto shrink-0 shadow-inner text-xs">
        {/* TAB 1: INICIO */}
        {activeRibbonTab === 'inicio' && (
          <>
            {/* Clipboard Group */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    if (activeCellData) {
                      navigator.clipboard.writeText(String(activeCellData.computed));
                    }
                  }}
                  className="px-2 py-1 rounded hover:bg-obsidian-800 text-slate-300 hover:text-white transition-colors"
                  title="Copiar celda"
                >
                  Copiar
                </button>
                <button
                  onClick={() => updateCell(selectedCoord, '')}
                  className="px-2 py-1 rounded hover:bg-obsidian-800 text-rose-300 hover:text-rose-200 transition-colors"
                  title="Borrar celda"
                >
                  Limpiar
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Portapapeles</span>
            </div>

            {/* Typography & Font Formatting */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                {/* Font Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowFontPicker(!showFontPicker)}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-obsidian-950 border border-obsidian-750 text-slate-200 text-xs hover:border-obsidian-600 w-28 justify-between"
                  >
                    <span className="truncate">{fontFamilies.find((f) => f.value === selectedFont)?.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {showFontPicker && (
                    <div className="absolute top-full left-0 mt-1 w-44 bg-obsidian-950 border border-obsidian-750 rounded shadow-xl py-1 z-30">
                      {fontFamilies.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => {
                            setSelectedFont(f.value);
                            setShowFontPicker(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bold, Italic, Underline */}
                <button
                  onClick={() => applyStyle({ bold: !activeCellData?.style?.bold })}
                  className={`p-1.5 rounded transition-colors ${
                    activeCellData?.style?.bold ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400 hover:bg-obsidian-850 hover:text-white'
                  }`}
                  title="Negrita"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyStyle({ italic: !activeCellData?.style?.italic })}
                  className={`p-1.5 rounded transition-colors ${
                    activeCellData?.style?.italic ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400 hover:bg-obsidian-850 hover:text-white'
                  }`}
                  title="Cursiva"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyStyle({ underline: !activeCellData?.style?.underline })}
                  className={`p-1.5 rounded transition-colors ${
                    activeCellData?.style?.underline ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400 hover:bg-obsidian-850 hover:text-white'
                  }`}
                  title="Subrayado"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                {/* Text Color Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    className="p-1.5 rounded text-slate-400 hover:bg-obsidian-850 hover:text-white transition-colors flex items-center"
                    title="Color de texto"
                  >
                    <span className="font-bold underline text-xs text-indigo-400 mr-0.5">A</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                  {showTextColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-obsidian-950 border border-obsidian-750 rounded p-2 z-30 shadow-xl grid grid-cols-4 gap-1 w-32">
                      {textColors.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => {
                            applyStyle({ color: c.value });
                            setShowTextColorPicker(false);
                          }}
                          className="w-6 h-6 rounded border border-obsidian-700 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Cell Background Fill */}
                <div className="relative">
                  <button
                    onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                    className="p-1.5 rounded text-slate-400 hover:bg-obsidian-850 hover:text-white transition-colors flex items-center"
                    title="Color de relleno de celda"
                  >
                    <Palette className="w-3.5 h-3.5 text-amber-400 mr-0.5" />
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                  {showBgColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-obsidian-950 border border-obsidian-750 rounded p-2 z-30 shadow-xl grid grid-cols-4 gap-1 w-32">
                      {bgColors.map((c) => (
                        <button
                          key={c.value || 'trans'}
                          onClick={() => {
                            applyStyle({ bg: c.value });
                            setShowBgColorPicker(false);
                          }}
                          className="w-6 h-6 rounded border border-obsidian-700 hover:scale-110 transition-transform flex items-center justify-center text-[10px]"
                          style={{ backgroundColor: c.value || 'transparent' }}
                          title={c.label}
                        >
                          {!c.value && '✕'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Fuente & Estilo</span>
            </div>

            {/* Alignment Group */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => applyStyle({ align: 'left' })}
                  className={`p-1.5 rounded transition-colors ${
                    activeCellData?.style?.align === 'left' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400 hover:bg-obsidian-850 hover:text-white'
                  }`}
                  title="Alinear izquierda"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyStyle({ align: 'center' })}
                  className={`p-1.5 rounded transition-colors ${
                    activeCellData?.style?.align === 'center' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400 hover:bg-obsidian-850 hover:text-white'
                  }`}
                  title="Centrar"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyStyle({ align: 'right' })}
                  className={`p-1.5 rounded transition-colors ${
                    activeCellData?.style?.align === 'right' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400 hover:bg-obsidian-850 hover:text-white'
                  }`}
                  title="Alinear derecha"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Alineación</span>
            </div>

            {/* Number Formatting Group */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => applyStyle({ format: activeCellData?.style?.format === 'currency' ? 'text' : 'currency', align: 'right' })}
                  className={`px-2 py-1 rounded transition-colors flex items-center space-x-1 ${
                    activeCellData?.style?.format === 'currency' ? 'bg-emerald-600/30 text-emerald-300 font-semibold' : 'text-slate-400 hover:bg-obsidian-850 hover:text-white'
                  }`}
                  title="Moneda Euro (€)"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="text-[11px]">€ EUR</span>
                </button>
                <button
                  onClick={() => applyStyle({ format: activeCellData?.style?.format === 'percent' ? 'text' : 'percent', align: 'right' })}
                  className={`p-1.5 rounded transition-colors ${
                    activeCellData?.style?.format === 'percent' ? 'bg-blue-600/30 text-blue-300' : 'text-slate-400 hover:bg-obsidian-850 hover:text-white'
                  }`}
                  title="Formato Porcentaje (%)"
                >
                  <Percent className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => applyStyle({ format: 'number', align: 'right' })}
                  className="px-1.5 py-1 rounded text-slate-400 hover:bg-obsidian-850 hover:text-white font-mono text-xs"
                  title="Separador de millares con decimales (.00)"
                >
                  ,00
                </button>
                <button
                  onClick={() => applyStyle({ format: 'text' })}
                  className="px-1.5 py-1 rounded text-slate-400 hover:bg-obsidian-850 hover:text-white text-xs"
                  title="Texto estándar"
                >
                  General
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Número & Moneda</span>
            </div>

            {/* Quick Cell Presets */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => applyPresetStyle('header')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold border border-slate-700"
                  title="Estilo Encabezado"
                >
                  Encabezado
                </button>
                <button
                  onClick={() => applyPresetStyle('good')}
                  className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 text-[11px] font-semibold border border-emerald-700/50"
                  title="Estilo Bueno / Positivo"
                >
                  Bueno
                </button>
                <button
                  onClick={() => applyPresetStyle('bad')}
                  className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-300 text-[11px] font-semibold border border-rose-700/50"
                  title="Estilo Alerta / Malo"
                >
                  Alerta
                </button>
                <button
                  onClick={() => applyPresetStyle('total')}
                  className="px-2 py-1 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[11px] font-semibold border border-indigo-700/50"
                  title="Estilo Total / Suma"
                >
                  Total
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Estilos de Celda</span>
            </div>
          </>
        )}

        {/* TAB 2: INSERTAR */}
        {activeRibbonTab === 'insertar' && (
          <>
            {/* Charts Generator Group */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setChartType('bar');
                    setShowChartPanel(true);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                    showChartPanel && chartType === 'bar'
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-obsidian-950 text-slate-300 hover:bg-obsidian-800 border border-obsidian-750'
                  }`}
                  title="Insertar Gráfico de Barras / Columnas"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Columnas</span>
                </button>

                <button
                  onClick={() => {
                    setChartType('line');
                    setShowChartPanel(true);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                    showChartPanel && chartType === 'line'
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                      : 'bg-obsidian-950 text-slate-300 hover:bg-obsidian-800 border border-obsidian-750'
                  }`}
                  title="Insertar Gráfico de Tendencia Lineal"
                >
                  <LineChart className="w-3.5 h-3.5 text-blue-400" />
                  <span>Líneas</span>
                </button>

                <button
                  onClick={() => {
                    setChartType('pie');
                    setShowChartPanel(true);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                    showChartPanel && chartType === 'pie'
                      ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                      : 'bg-obsidian-950 text-slate-300 hover:bg-obsidian-800 border border-obsidian-750'
                  }`}
                  title="Insertar Gráfico Circular / Tarta"
                >
                  <PieChart className="w-3.5 h-3.5 text-amber-400" />
                  <span>Circular</span>
                </button>

                <button
                  onClick={() => {
                    setChartType('area');
                    setShowChartPanel(true);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                    showChartPanel && chartType === 'area'
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'bg-obsidian-950 text-slate-300 hover:bg-obsidian-800 border border-obsidian-750'
                  }`}
                  title="Insertar Gráfico de Área"
                >
                  <AreaChart className="w-3.5 h-3.5 text-purple-400" />
                  <span>Áreas</span>
                </button>

                <button
                  onClick={() => setShowChartPanel(!showChartPanel)}
                  className="px-2 py-1 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 font-medium"
                >
                  {showChartPanel ? 'Ocultar Panel' : 'Ver Gráfico'}
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Gráficos SVG en Tiempo Real</span>
            </div>

            {/* Objects & Tables Group */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setShowPivotTable(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold"
                  title="Abrir Diseñador de Tablas Dinámicas (Pivot Tables)"
                >
                  <Table className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tabla Dinámica</span>
                </button>

                <button
                  onClick={() => {
                    // Quick demo table insertion
                    updateCell('A1', 'Categoría', { bold: true, bg: '#1e293b', align: 'center' });
                    updateCell('B1', 'Total Ventas (€)', { bold: true, bg: '#1e293b', align: 'right' });
                    updateCell('A2', 'Servicios Cloud');
                    updateCell('B2', '45200', { format: 'currency', align: 'right' });
                    updateCell('A3', 'Licencias Pro');
                    updateCell('B3', '78400', { format: 'currency', align: 'right' });
                    updateCell('A4', 'Soporte 24/7');
                    updateCell('B4', '23100', { format: 'currency', align: 'right' });
                    updateCell('A5', 'Total General', { bold: true, bg: '#0f172a', color: '#818cf8' });
                    updateCell('B5', '=SUM(B2:B4)', { bold: true, format: 'currency', align: 'right', bg: '#0f172a' });
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Insertar Plantilla de Tabla Financiera"
                >
                  <Table className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Plantilla Tabla</span>
                </button>

                <button
                  onClick={() => {
                    const url = prompt('Introduce la URL del hipervínculo seguro:');
                    if (url) {
                      updateCell(selectedCoord, url, { color: '#60a5fa', underline: true });
                    }
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Insertar Hipervínculo"
                >
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Vínculo</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Tablas & Vínculos</span>
            </div>
          </>
        )}

        {/* TAB 3: FÓRMULAS */}
        {activeRibbonTab === 'formulas' && (
          <>
            {/* AutoSum & Mathematical functions */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => insertFormulaTemplate('=SUM(B2:B5)')}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-emerald-300 font-mono text-xs border border-obsidian-750"
                  title="Suma automática =SUM(rango)"
                >
                  Σ =SUM()
                </button>
                <button
                  onClick={() => insertFormulaTemplate('=AVERAGE(B2:B5)')}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-blue-300 font-mono text-xs border border-obsidian-750"
                  title="Promedio =AVERAGE(rango)"
                >
                  =AVERAGE()
                </button>
                <button
                  onClick={() => insertFormulaTemplate('=MAX(B2:B5)')}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-amber-300 font-mono text-xs border border-obsidian-750"
                  title="Valor Máximo =MAX(rango)"
                >
                  =MAX()
                </button>
                <button
                  onClick={() => insertFormulaTemplate('=MIN(B2:B5)')}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-amber-300 font-mono text-xs border border-obsidian-750"
                  title="Valor Mínimo =MIN(rango)"
                >
                  =MIN()
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">AutoSuma & Estadísticas</span>
            </div>

            {/* Logical & Text Functions */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => insertFormulaTemplate('=IF(B2>1000, "Superado", "Pendiente")')}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-indigo-300 font-mono text-xs border border-obsidian-750"
                  title="Condicional =IF(cond, si_verdadero, si_falso)"
                >
                  =IF()
                </button>
                <button
                  onClick={() => insertFormulaTemplate('=ROUND(B2, 2)')}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 font-mono text-xs border border-obsidian-750"
                  title="Redondear =ROUND(num, decimales)"
                >
                  =ROUND()
                </button>
                <button
                  onClick={() => insertFormulaTemplate('=SQRT(B2)')}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 font-mono text-xs border border-obsidian-750"
                  title="Raíz Cuadrada =SQRT(num)"
                >
                  =SQRT()
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Lógicas & Matemáticas</span>
            </div>

            {/* Formula Audit & Calculation */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setShowFormulasMode(!showFormulasMode)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                    showFormulasMode ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30' : 'bg-obsidian-950 text-slate-300 hover:bg-obsidian-800 border border-obsidian-750'
                  }`}
                  title="Alternar entre ver fórmulas crudas o valores computados"
                >
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showFormulasMode ? 'Ocultar Fórmulas' : 'Mostrar Fórmulas'}</span>
                </button>
                <button
                  onClick={() => {
                    // Force refresh DAG recalculation
                    updateCell(selectedCoord, activeCellData?.raw || '');
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-emerald-300 border border-obsidian-750"
                  title="Recalcular todo el grafo (F9)"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recalcular (F9)</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Auditoría & Cálculo</span>
            </div>

            {/* Advanced Analytics & Monte Carlo */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setShowMonteCarlo(true)}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold"
                  title="Simulación Estocástica de Riesgos Monte Carlo (10.000 iteraciones)"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Simulación Monte Carlo</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Modelado Estocástico</span>
            </div>
          </>
        )}

        {/* TAB 4: DATOS */}
        {activeRibbonTab === 'datos' && (
          <>
            {/* Sorting */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleSortCol(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750"
                  title="Ordenar columna actual de menor a mayor (A → Z)"
                >
                  <ArrowUpAZ className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ordenar A → Z</span>
                </button>
                <button
                  onClick={() => handleSortCol(false)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750"
                  title="Ordenar columna actual de mayor a menor (Z → A)"
                >
                  <ArrowDownZA className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Ordenar Z → A</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Ordenar Columnas</span>
            </div>

            {/* Filter & Analysis */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                    showFilterDropdown ? 'bg-cyan-600/30 text-cyan-300' : 'bg-obsidian-950 text-slate-300 hover:bg-obsidian-800 border border-obsidian-750'
                  }`}
                  title="Filtro automático de encabezados"
                >
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Filtro de Encabezado</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Filtros & Validación</span>
            </div>

            {/* Advanced Analytics: Pivot Table & Monte Carlo */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setShowPivotTable(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold"
                  title="Abrir Diseñador de Tablas Dinámicas (Pivot Tables)"
                >
                  <Table className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tabla Dinámica</span>
                </button>
                <button
                  onClick={() => setShowMonteCarlo(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold"
                  title="Simulación Estocástica de Riesgos Monte Carlo (10.000 iteraciones)"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Monte Carlo</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Análisis Cuantitativo</span>
            </div>
          </>
        )}

        {/* TAB 5: VISTA */}
        {activeRibbonTab === 'vista' && (
          <>
            {/* Show / Hide */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-1 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGridlines}
                    onChange={(e) => setShowGridlines(e.target.checked)}
                    className="rounded bg-obsidian-950 border-obsidian-750 text-emerald-500 focus:ring-0"
                  />
                  <span>Cuadrícula</span>
                </label>
                <label className="flex items-center space-x-1 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHeaders}
                    onChange={(e) => setShowHeaders(e.target.checked)}
                    className="rounded bg-obsidian-950 border-obsidian-750 text-emerald-500 focus:ring-0"
                  />
                  <span>Encabezados (A/1)</span>
                </label>
                <label className="flex items-center space-x-1 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFormulaBar}
                    onChange={(e) => setShowFormulaBar(e.target.checked)}
                    className="rounded bg-obsidian-950 border-obsidian-750 text-emerald-500 focus:ring-0"
                  />
                  <span>Barra Fx</span>
                </label>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Mostrar / Ocultar</span>
            </div>

            {/* Zoom Controls */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                  className="p-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Reducir Zoom"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-slate-200 text-xs w-10 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                  className="p-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-1.5 py-0.5 text-[11px] rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-400 border border-obsidian-750"
                >
                  100%
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Zoom de Cuadrícula</span>
            </div>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE SVG CHART PANEL (When Inserted / Activated) */}
      {/* ========================================================= */}
      {showChartPanel && (
        <div className="bg-obsidian-950 border-b border-obsidian-800 p-3 shrink-0 relative animate-fadeIn transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Gráfico Dinámico: {chartType === 'bar' ? 'Barras Comparativas' : chartType === 'line' ? 'Tendencia Temporal' : chartType === 'pie' ? 'Distribución Porcentual' : 'Área Acumulada'}
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                (Calculado en vivo desde celdas con datos)
              </span>
            </div>
            <button
              onClick={() => setShowChartPanel(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-obsidian-800"
              title="Cerrar panel de gráfico"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-44 w-full bg-obsidian-900/90 rounded-lg border border-obsidian-800 p-2 flex items-center justify-center">
            {/* SVG BAR CHART */}
            {chartType === 'bar' && (
              <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="20" x2="580" y2="20" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="580" y2="60" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="580" y2="100" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="115" x2="580" y2="115" stroke="#475569" strokeWidth="1.5" />

                {effectiveChartData.map((d, idx) => {
                  const barWidth = 40;
                  const spacing = (540 - effectiveChartData.length * barWidth) / (effectiveChartData.length + 1);
                  const x = 50 + idx * (barWidth + spacing);
                  const height = Math.max(8, (d.value / maxChartVal) * 90);
                  const y = 115 - height;

                  return (
                    <g key={idx} className="cursor-pointer group">
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        rx="4"
                        fill="url(#emeraldGrad)"
                        className="transition-all duration-300 group-hover:brightness-125"
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        textAnchor="middle"
                        fill="#34d399"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y="130"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="10"
                        fontWeight="500"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {/* SVG LINE CHART */}
            {chartType === 'line' && (
              <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                <line x1="40" y1="20" x2="580" y2="20" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="580" y2="60" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="580" y2="100" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="115" x2="580" y2="115" stroke="#475569" strokeWidth="1.5" />

                {/* Polyline */}
                {(() => {
                  const points = effectiveChartData
                    .map((d, idx) => {
                      const spacing = 520 / Math.max(1, effectiveChartData.length - 1);
                      const x = 50 + idx * spacing;
                      const y = 115 - Math.max(10, (d.value / maxChartVal) * 90);
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                      {effectiveChartData.map((d, idx) => {
                        const spacing = 520 / Math.max(1, effectiveChartData.length - 1);
                        const x = 50 + idx * spacing;
                        const y = 115 - Math.max(10, (d.value / maxChartVal) * 90);
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                            <text x={x} y={y - 6} textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">
                              {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                            </text>
                            <text x={x} y="130" textAnchor="middle" fill="#94a3b8" fontSize="10">
                              {d.label}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            )}

            {/* SVG PIE CHART */}
            {chartType === 'pie' && (
              <div className="flex items-center space-x-8">
                <svg width="120" height="120" viewBox="-60 -60 120 120">
                  {(() => {
                    const total = effectiveChartData.reduce((acc, d) => acc + d.value, 0) || 1;
                    const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#38bdf8'];
                    let cumulativeAngle = 0;

                    return effectiveChartData.map((d, idx) => {
                      const sliceAngle = (d.value / total) * 2 * Math.PI;
                      const startX = Math.cos(cumulativeAngle) * 50;
                      const startY = Math.sin(cumulativeAngle) * 50;
                      cumulativeAngle += sliceAngle;
                      const endX = Math.cos(cumulativeAngle) * 50;
                      const endY = Math.sin(cumulativeAngle) * 50;
                      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
                      const pathData = `M 0 0 L ${startX} ${startY} A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

                      return (
                        <path
                          key={idx}
                          d={pathData}
                          fill={colors[idx % colors.length]}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {effectiveChartData.map((d, idx) => {
                    const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#38bdf8'];
                    return (
                      <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                        <span className="font-medium">{d.label}:</span>
                        <span className="font-mono text-slate-400">{d.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SVG AREA CHART */}
            {chartType === 'area' && (
              <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                <line x1="40" y1="20" x2="580" y2="20" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="60" x2="580" y2="60" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="580" y2="100" stroke="#334155" strokeDasharray="3 3" />
                <line x1="40" y1="115" x2="580" y2="115" stroke="#475569" strokeWidth="1.5" />

                {(() => {
                  const pts = effectiveChartData.map((d, idx) => {
                    const spacing = 520 / Math.max(1, effectiveChartData.length - 1);
                    const x = 50 + idx * spacing;
                    const y = 115 - Math.max(10, (d.value / maxChartVal) * 90);
                    return { x, y, label: d.label, value: d.value };
                  });

                  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(' ');
                  const areaPoints = `50,115 ${linePoints} ${pts[pts.length - 1].x},115`;

                  return (
                    <>
                      <polygon points={areaPoints} fill="url(#areaPurpleGrad)" opacity="0.4" />
                      <polyline
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={linePoints}
                      />
                      {pts.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="3.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
                          <text x={p.x} y="130" textAnchor="middle" fill="#94a3b8" fontSize="10">
                            {p.label}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}

                <defs>
                  <linearGradient id="areaPurpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. FORMULA BAR (fx) */}
      {/* ========================================================= */}
      {showFormulaBar && (
        <div className="h-9 bg-obsidian-900 border-b border-obsidian-800 px-3 flex items-center space-x-2 shrink-0">
          <div className="w-14 h-6 bg-obsidian-950 border border-obsidian-750 rounded flex items-center justify-center text-xs font-mono font-bold text-emerald-400 shadow-inner">
            {selectedCoord}
          </div>
          <div className="text-slate-400 font-serif italic text-sm select-none px-1">
            fx
          </div>
          <div className="w-[1px] h-4 bg-obsidian-750" />
          <input
            type="text"
            value={formulaInput}
            onChange={handleFormulaInputChange}
            placeholder="Escribe un valor o fórmula reactiva (ej. =SUM(B2:D2), =IF(B2>100, 1, 0) o 14500)"
            className="flex-1 bg-transparent text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SPREADSHEET VIRTUAL GRID */}
      {/* ========================================================= */}
      <div
        className="flex-1 overflow-auto bg-obsidian-950"
        style={{ fontSize: `${(zoomLevel / 100) * 12}px` }}
      >
        <table className={`w-full border-collapse ${selectedFont}`}>
          {/* Column Header Row */}
          {showHeaders && (
            <thead>
              <tr className="bg-obsidian-900/90 sticky top-0 z-10 border-b border-obsidian-750 shadow-sm">
                <th className="w-12 h-7 border-r border-obsidian-750 bg-obsidian-950 text-slate-400 font-mono text-[10px] text-center select-none">
                  #
                </th>
                {cols.map((col) => (
                  <th
                    key={col}
                    className="min-w-[130px] px-2 h-7 border-r border-obsidian-750 text-slate-300 font-mono text-[11px] font-semibold text-center select-none relative group"
                  >
                    <span>{col}</span>
                    {showFilterDropdown && (
                      <button
                        onClick={() => handleSortCol(true)}
                        className="ml-1 text-[9px] text-slate-400 hover:text-white"
                        title="Ordenar por esta columna"
                      >
                        ▼
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* Grid Rows */}
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-b border-obsidian-800/80 hover:bg-obsidian-900/30">
                {/* Row Number Header */}
                {showHeaders && (
                  <td className="w-12 h-7 border-r border-obsidian-750 bg-obsidian-950 text-slate-400 font-mono text-[10px] text-center select-none sticky left-0 z-0">
                    {row}
                  </td>
                )}

                {/* Row Cells */}
                {cols.map((col) => {
                  const coord = `${col}${row}`;
                  const cell = currentSheet.cells[coord];
                  const isSelected = coord === selectedCoord;

                  let displayVal = cell ? String(showFormulasMode && cell.raw ? cell.raw : cell.computed) : '';
                  if (!showFormulasMode) {
                    if (cell?.style?.format === 'currency' && typeof cell.computed === 'number') {
                      displayVal = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cell.computed);
                    } else if (cell?.style?.format === 'percent' && typeof cell.computed === 'number') {
                      displayVal = `${(cell.computed * 100).toFixed(1)}%`;
                    }
                  }

                  const alignClass =
                    cell?.style?.align === 'right'
                      ? 'text-right'
                      : cell?.style?.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                  return (
                    <td
                      key={coord}
                      onClick={() => handleCellClick(coord)}
                      className={`h-7 px-2 text-slate-200 cursor-cell transition-all font-mono truncate max-w-[160px] ${
                        showGridlines ? 'border-r border-obsidian-800' : ''
                      } ${alignClass} ${
                        isSelected
                          ? 'bg-emerald-600/20 ring-2 ring-emerald-500 z-10 text-white font-semibold'
                          : cell?.style?.bg
                          ? ''
                          : ''
                      }`}
                      style={{
                        fontWeight: cell?.style?.bold ? 'bold' : 'normal',
                        fontStyle: cell?.style?.italic ? 'italic' : 'normal',
                        textDecoration: cell?.style?.underline ? 'underline' : 'none',
                        color: cell?.style?.color || undefined,
                        backgroundColor: cell?.style?.bg || undefined,
                      }}
                    >
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* 5.5 SPREADSHEET SHEET TABS BAR */}
      {/* ========================================================= */}
      <div className="h-8 bg-obsidian-950 border-t border-obsidian-800 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-1 overflow-x-auto py-1 max-w-[80vw]">
          {currentBook?.sheets.map((sh) => {
            const isActive = sh.id === currentSheet.id;
            return (
              <button
                key={sh.id}
                onClick={() => setActiveSheetId(sh.id)}
                className={`h-6 px-3 text-xs rounded-t flex items-center space-x-1.5 transition-all ${
                  isActive
                    ? 'bg-obsidian-900 border-t-2 border-emerald-500 text-emerald-300 font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/40'
                }`}
              >
                <FileSpreadsheet className="w-3 h-3 text-slate-400" />
                <span>{sh.name}</span>
              </button>
            );
          })}
          <button
            onClick={() => addSheetToActiveSpreadsheet(`Hoja ${(currentBook?.sheets.length || 0) + 1}`, {})}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-obsidian-800 text-slate-400 hover:text-white transition-colors"
            title="Agregar nueva pestaña de hoja"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
          <span>{currentBook?.sheets.length} pestañas</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. BOTTOM STATUS & AGGREGATE STATS BAR */}
      {/* ========================================================= */}
      <footer className="h-7 bg-obsidian-950 border-t border-obsidian-800 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0 font-mono">
        <div className="flex items-center space-x-5">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <Calculator className="w-3 h-3" />
            <span>SUMA: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(sumTotal)}</span>
          </span>
          <span>PROMEDIO: {avgVal} €</span>
          <span>MÍN: {minVal} €</span>
          <span>MÁX: {maxVal} €</span>
          <span>CELDAS CON DATOS: {numericValues.length}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>DAG Reactivo Kahn 60fps</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{zoomLevel}%</span>
        </div>
      </footer>

      {/* Analytics & Stochastic Modals */}
      <PivotTableView isOpen={showPivotTable} onClose={() => setShowPivotTable(false)} />
      <MonteCarloModal
        isOpen={showMonteCarlo}
        onClose={() => setShowMonteCarlo(false)}
        initialCoord={selectedCoord}
        initialBaseValue={typeof activeCellData?.computed === 'number' ? activeCellData.computed : undefined}
      />
    </div>
  );
};
