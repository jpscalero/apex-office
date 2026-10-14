import React, { useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Copy,
  Type,
  TrendingUp,
  Code,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Square,
  Circle,
  ArrowRight,
  Star,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Tv,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { SlideElement } from '../../types';

export const SlideDeckView: React.FC = () => {
  const {
    decks,
    activeDeckId,
    activeSlideIndex,
    setActiveSlideIndex,
    setPresentationMode,
    addSlide,
    duplicateSlide,
    deleteSlide,
    updateSlideNotes,
    updateSlideBackground,
    updateSlideElement,
    updateDeckAspectRatio,
  } = useOfficeStore();

  const currentDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const slides = currentDeck ? currentDeck.slides : [];
  const currentSlide = slides[activeSlideIndex] || slides[0];

  const [activeRibbonTab, setActiveRibbonTab] = useState<'inicio' | 'insertar' | 'diseno' | 'transiciones' | 'presentacion'>('inicio');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // View & UI state
  const [isSlideSorterOpen, setIsSlideSorterOpen] = useState(false);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(true);
  const [stageZoom, setStageZoom] = useState(100);
  const [transitionEffect, setTransitionEffect] = useState<'fade' | 'slide' | 'zoom' | 'flip'>('fade');
  const [transitionDuration, setTransitionDuration] = useState('0.6s');
  const [isPreviewingTransition, setIsPreviewingTransition] = useState(false);

  // Dropdown toggles
  const [showNewSlideDropdown, setShowNewSlideDropdown] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);

  const selectedElement = currentSlide?.elements.find((el) => el.id === selectedElementId);

  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const addElement = (type: SlideElement['type']) => {
    if (!currentSlide) return;

    let newEl: SlideElement;
    const now = Date.now();

    if (type === 'title') {
      newEl = {
        id: `el-${now}`,
        type: 'title',
        x: 10,
        y: 20,
        width: 80,
        height: 15,
        content: 'Nuevo Título de Diapositiva',
        fontSize: 38,
        color: '#ffffff',
      };
    } else if (type === 'stat') {
      newEl = {
        id: `el-${now}`,
        type: 'stat',
        x: 15,
        y: 40,
        width: 32,
        height: 25,
        content: '99.9%',
        subtitle: 'Disponibilidad Verificada',
        color: '#fbbf24',
      };
    } else if (type === 'code') {
      newEl = {
        id: `el-${now}`,
        type: 'code',
        x: 20,
        y: 45,
        width: 60,
        height: 30,
        content: `// Módulo seguro en WebAssembly\nconst sandbox = new WASMIsolation();\nsandbox.executeSecure();`,
        color: '#34d399',
      };
    } else if (type === 'badge') {
      newEl = {
        id: `el-${now}`,
        type: 'badge',
        x: 10,
        y: 10,
        width: 28,
        height: 8,
        content: 'CONFIDENCIAL • CERO-CLOUD',
        color: '#818cf8',
      };
    } else if (type === 'shape') {
      newEl = {
        id: `el-${now}`,
        type: 'shape',
        x: 35,
        y: 35,
        width: 30,
        height: 30,
        content: 'rectangle', // rectangle, circle, arrow, star, callout
        bg: 'rgba(99, 102, 241, 0.2)',
        color: '#6366f1',
      };
    } else {
      newEl = {
        id: `el-${now}`,
        type: 'text',
        x: 10,
        y: 35,
        width: 75,
        height: 20,
        content: 'Añade tu descripción o argumento estratégico aquí.',
        fontSize: 16,
        color: '#cbd5e1',
      };
    }

    currentSlide.elements.push(newEl);
    setSelectedElementId(newEl.id);
  };

  const deleteElement = (id: string) => {
    if (!currentSlide) return;
    currentSlide.elements = currentSlide.elements.filter((e) => e.id !== id);
    setSelectedElementId(null);
  };

  const triggerPreviewTransition = () => {
    setIsPreviewingTransition(true);
    setTimeout(() => setIsPreviewingTransition(false), 800);
  };

  // Color theme definitions
  const themes = [
    { name: 'Obsidian Dark', bg: '#0c0e12', desc: 'Ónice Profundo con acentos Neón' },
    { name: 'Midnight Blue', bg: '#0f172a', desc: 'Azul Noche Profesional' },
    { name: 'Cyberpunk Dark', bg: '#09090b', desc: 'Negro Puro y Esmeralda' },
    { name: 'Sunset Coral', bg: '#1c1917', desc: 'Carbón con acentos Cálidos' },
    { name: 'Executive White', bg: '#ffffff', desc: 'Fondo Blanco para Proyectores' },
  ];

  const textColors = [
    { label: 'Blanco', value: '#ffffff' },
    { label: 'Gris Claro', value: '#cbd5e1' },
    { label: 'Ámbar', value: '#fbbf24' },
    { label: 'Esmeralda', value: '#34d399' },
    { label: 'Azul Apex', value: '#60a5fa' },
    { label: 'Coral', value: '#f87171' },
    { label: 'Púrpura', value: '#c084fc' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-900 overflow-hidden select-none">
      {/* ========================================================= */}
      {/* 1. MEGA-RIBBON TAB HEADER (Inicio, Insertar, Diseño, Transiciones, Presentación) */}
      {/* ========================================================= */}
      <div className="bg-obsidian-950 border-b border-obsidian-800 flex items-center justify-between px-3 h-9 shrink-0">
        <div className="flex items-center space-x-1">
          <span className="flex items-center space-x-1 px-2 py-0.5 mr-2 rounded text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
            <Tv className="w-3.5 h-3.5" />
            <span>SLIDES</span>
          </span>

          <button
            onClick={() => setActiveRibbonTab('inicio')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'inicio'
                ? 'bg-obsidian-900 text-amber-300 border-t-2 border-amber-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveRibbonTab('insertar')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'insertar'
                ? 'bg-obsidian-900 text-amber-300 border-t-2 border-amber-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Insertar Formas & Contenido
          </button>
          <button
            onClick={() => setActiveRibbonTab('diseno')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'diseno'
                ? 'bg-obsidian-900 text-amber-300 border-t-2 border-amber-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Diseño & Temas
          </button>
          <button
            onClick={() => setActiveRibbonTab('transiciones')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'transiciones'
                ? 'bg-obsidian-900 text-amber-300 border-t-2 border-amber-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Transiciones & Animación
          </button>
          <button
            onClick={() => setActiveRibbonTab('presentacion')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'presentacion'
                ? 'bg-obsidian-900 text-amber-300 border-t-2 border-amber-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Presentación con Diapositivas
          </button>
        </div>

        {/* Start Presentation Action */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPresentationMode(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs shadow-md shadow-amber-500/20 transition-all"
            title="Iniciar Presentación a Pantalla Completa (F5)"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Presentar (F5)</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MEGA-RIBBON CONTENT PANEL */}
      {/* ========================================================= */}
      <div className="min-h-[58px] bg-obsidian-900 border-b border-obsidian-800 px-3 py-1 flex items-center space-x-4 overflow-x-auto shrink-0 shadow-inner text-xs">
        {/* TAB 1: INICIO */}
        {activeRibbonTab === 'inicio' && (
          <>
            {/* Slides Management Group */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <div className="relative">
                  <button
                    onClick={() => setShowNewSlideDropdown(!showNewSlideDropdown)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-amber-300 font-medium border border-obsidian-750 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Diapositiva</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </button>

                  {showNewSlideDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-obsidian-950 border border-obsidian-750 rounded shadow-2xl py-1 z-30">
                      <button
                        onClick={() => {
                          addSlide('title');
                          setShowNewSlideDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                      >
                        📌 Diapositiva de Título
                      </button>
                      <button
                        onClick={() => {
                          addSlide('two-column');
                          setShowNewSlideDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                      >
                        ⚖ Dos Columnas / Comparativa
                      </button>
                      <button
                        onClick={() => {
                          addSlide('stat');
                          setShowNewSlideDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                      >
                        📊 Tarjetas de Métricas KPI
                      </button>
                      <button
                        onClick={() => {
                          addSlide('blank');
                          setShowNewSlideDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 transition-colors"
                      >
                        ◻ Diapositiva en Blanco
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => duplicateSlide(activeSlideIndex)}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750 flex items-center space-x-1"
                  title="Duplicar diapositiva actual"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Duplicar</span>
                </button>
                {slides.length > 1 && (
                  <button
                    onClick={() => deleteSlide(activeSlideIndex)}
                    className="p-1 rounded bg-obsidian-950 hover:bg-rose-900/40 text-rose-300 border border-obsidian-750"
                    title="Eliminar diapositiva actual"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Diapositivas</span>
            </div>

            {/* Typography Formatting Group */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                {/* Font Size Buttons */}
                <button
                  onClick={() => {
                    if (selectedElement) {
                      const currentSize = selectedElement.fontSize || 20;
                      updateSlideElement(activeSlideIndex, selectedElement.id, { fontSize: Math.max(12, currentSize - 4) });
                    }
                  }}
                  disabled={!selectedElement}
                  className="px-1.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 disabled:opacity-30 border border-obsidian-750 font-bold text-xs"
                  title="Reducir tamaño fuente"
                >
                  A⁻
                </button>
                <button
                  onClick={() => {
                    if (selectedElement) {
                      const currentSize = selectedElement.fontSize || 20;
                      updateSlideElement(activeSlideIndex, selectedElement.id, { fontSize: Math.min(80, currentSize + 4) });
                    }
                  }}
                  disabled={!selectedElement}
                  className="px-1.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 disabled:opacity-30 border border-obsidian-750 font-bold text-xs"
                  title="Aumentar tamaño fuente"
                >
                  A⁺
                </button>

                {/* Text Color Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    disabled={!selectedElement}
                    className="p-1.5 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 disabled:opacity-30 border border-obsidian-750 flex items-center"
                    title="Color de texto"
                  >
                    <span className="font-bold underline text-xs text-amber-400 mr-0.5">A</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>
                  {showTextColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-obsidian-950 border border-obsidian-750 rounded p-2 z-30 shadow-xl grid grid-cols-4 gap-1 w-32">
                      {textColors.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => {
                            if (selectedElement) {
                              updateSlideElement(activeSlideIndex, selectedElement.id, { color: c.value });
                            }
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
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Fuente & Texto</span>
            </div>

            {/* Arrangement & Alignment */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    if (selectedElement) {
                      updateSlideElement(activeSlideIndex, selectedElement.id, { x: 50 - selectedElement.width / 2 });
                    }
                  }}
                  disabled={!selectedElement}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 disabled:opacity-30 border border-obsidian-750"
                  title="Centrar horizontalmente"
                >
                  Centrar
                </button>
                <button
                  onClick={() => {
                    if (selectedElement) {
                      updateSlideElement(activeSlideIndex, selectedElement.id, { y: 15 });
                    }
                  }}
                  disabled={!selectedElement}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 disabled:opacity-30 border border-obsidian-750"
                  title="Mover arriba"
                >
                  Arriba
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Posición de Objeto</span>
            </div>
          </>
        )}

        {/* TAB 2: INSERTAR */}
        {activeRibbonTab === 'insertar' && (
          <>
            {/* Content Blocks */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => addElement('title')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750"
                  title="Añadir Título Principal"
                >
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>Título</span>
                </button>
                <button
                  onClick={() => addElement('text')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750"
                  title="Añadir Párrafo de Texto"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Texto</span>
                </button>
                <button
                  onClick={() => addElement('stat')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750"
                  title="Añadir Métrica / KPI"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Métrica KPI</span>
                </button>
                <button
                  onClick={() => addElement('code')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750"
                  title="Añadir Bloque de Código"
                >
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Código</span>
                </button>
                <button
                  onClick={() => addElement('badge')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750"
                  title="Añadir Etiqueta de Seguridad"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Insignia</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Bloques de Contenido</span>
            </div>

            {/* Geometric Shapes */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    const now = Date.now();
                    currentSlide.elements.push({
                      id: `el-${now}`,
                      type: 'shape',
                      x: 40,
                      y: 35,
                      width: 20,
                      height: 25,
                      content: 'rectangle',
                      bg: 'rgba(99, 102, 241, 0.25)',
                      color: '#818cf8',
                    });
                    setSelectedElementId(`el-${now}`);
                  }}
                  className="p-1.5 rounded bg-obsidian-950 hover:bg-obsidian-800 text-indigo-400 border border-obsidian-750"
                  title="Insertar Rectángulo"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const now = Date.now();
                    currentSlide.elements.push({
                      id: `el-${now}`,
                      type: 'shape',
                      x: 40,
                      y: 35,
                      width: 20,
                      height: 25,
                      content: 'circle',
                      bg: 'rgba(16, 185, 129, 0.25)',
                      color: '#34d399',
                    });
                    setSelectedElementId(`el-${now}`);
                  }}
                  className="p-1.5 rounded bg-obsidian-950 hover:bg-obsidian-800 text-emerald-400 border border-obsidian-750"
                  title="Insertar Círculo"
                >
                  <Circle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const now = Date.now();
                    currentSlide.elements.push({
                      id: `el-${now}`,
                      type: 'shape',
                      x: 35,
                      y: 45,
                      width: 25,
                      height: 12,
                      content: 'arrow',
                      bg: 'rgba(245, 158, 11, 0.25)',
                      color: '#fbbf24',
                    });
                    setSelectedElementId(`el-${now}`);
                  }}
                  className="p-1.5 rounded bg-obsidian-950 hover:bg-obsidian-800 text-amber-400 border border-obsidian-750"
                  title="Insertar Flecha Direccional"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const now = Date.now();
                    currentSlide.elements.push({
                      id: `el-${now}`,
                      type: 'shape',
                      x: 40,
                      y: 35,
                      width: 20,
                      height: 25,
                      content: 'star',
                      bg: 'rgba(244, 63, 94, 0.25)',
                      color: '#f43f5e',
                    });
                    setSelectedElementId(`el-${now}`);
                  }}
                  className="p-1.5 rounded bg-obsidian-950 hover:bg-obsidian-800 text-rose-400 border border-obsidian-750"
                  title="Insertar Estrella Destacada"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Formas Vectoriales</span>
            </div>
          </>
        )}

        {/* TAB 3: DISEÑO & TEMAS */}
        {activeRibbonTab === 'diseno' && (
          <>
            {/* Color Themes */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                {themes.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => updateSlideBackground(t.bg)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750 hover:border-amber-500/50 transition-all"
                    title={t.desc}
                  >
                    <span className="w-3 h-3 rounded-full border border-slate-600" style={{ backgroundColor: t.bg }} />
                    <span className="text-[11px]">{t.name}</span>
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Paletas de Fondo & Estilo</span>
            </div>

            {/* Aspect Ratio */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => updateDeckAspectRatio('16:9')}
                  className={`px-2 py-1 rounded transition-colors ${
                    currentDeck.aspectRatio === '16:9' ? 'bg-amber-600/30 text-amber-300 font-semibold' : 'bg-obsidian-950 text-slate-400'
                  }`}
                >
                  16:9 Panorámica
                </button>
                <button
                  onClick={() => updateDeckAspectRatio('4:3')}
                  className={`px-2 py-1 rounded transition-colors ${
                    currentDeck.aspectRatio === '4:3' ? 'bg-amber-600/30 text-amber-300 font-semibold' : 'bg-obsidian-950 text-slate-400'
                  }`}
                >
                  4:3 Estándar
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Proporción de Pantalla</span>
            </div>
          </>
        )}

        {/* TAB 4: TRANSICIONES */}
        {activeRibbonTab === 'transiciones' && (
          <>
            {/* Transition Styles */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                {(['fade', 'slide', 'zoom', 'flip'] as const).map((effect) => (
                  <button
                    key={effect}
                    onClick={() => {
                      setTransitionEffect(effect);
                      triggerPreviewTransition();
                    }}
                    className={`px-2.5 py-1 rounded capitalize transition-colors ${
                      transitionEffect === effect
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                        : 'bg-obsidian-950 text-slate-400 hover:text-white border border-obsidian-750'
                    }`}
                  >
                    {effect === 'fade' ? 'Desvanecer' : effect === 'slide' ? 'Deslizar' : effect === 'zoom' ? 'Zoom' : 'Volteo 3D'}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Efecto de Transición</span>
            </div>

            {/* Transition Duration & Test */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setTransitionDuration('0.3s')}
                  className={`px-2 py-1 rounded text-xs ${transitionDuration === '0.3s' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400'}`}
                >
                  0.3s Rápida
                </button>
                <button
                  onClick={() => setTransitionDuration('0.6s')}
                  className={`px-2 py-1 rounded text-xs ${transitionDuration === '0.6s' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400'}`}
                >
                  0.6s Normal
                </button>
                <button
                  onClick={() => setTransitionDuration('1.0s')}
                  className={`px-2 py-1 rounded text-xs ${transitionDuration === '1.0s' ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-400'}`}
                >
                  1.0s Suave
                </button>
                <button
                  onClick={triggerPreviewTransition}
                  className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium"
                >
                  Probar Animación
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Velocidad & Previsualización</span>
            </div>
          </>
        )}

        {/* TAB 5: PRESENTACIÓN & VISTA */}
        {activeRibbonTab === 'presentacion' && (
          <>
            {/* Show controls */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setActiveSlideIndex(0);
                    setPresentationMode(true);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-sm"
                  title="Presentar desde el Principio (F5)"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Desde el Principio</span>
                </button>
                <button
                  onClick={() => setPresentationMode(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-200 border border-obsidian-750"
                  title="Presentar desde la Diapositiva Actual"
                >
                  <span>Desde Actual</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Modos de Presentación</span>
            </div>

            {/* Views & Tools */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsSlideSorterOpen(!isSlideSorterOpen)}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded transition-colors ${
                    isSlideSorterOpen ? 'bg-amber-600/30 text-amber-300 font-semibold' : 'bg-obsidian-950 text-slate-300 hover:bg-obsidian-800 border border-obsidian-750'
                  }`}
                  title="Clasificador de Diapositivas (Mosaico general)"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clasificador Mosaico</span>
                </button>
                <button
                  onClick={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
                  className={`px-2 py-1 rounded transition-colors ${
                    isNotesPanelOpen ? 'bg-indigo-600/30 text-indigo-300' : 'bg-obsidian-950 text-slate-400'
                  }`}
                  title="Mostrar/Ocultar Panel de Notas"
                >
                  Notas Orador
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Vistas de Organización</span>
            </div>

            {/* Stage Zoom */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setStageZoom((z) => Math.max(60, z - 15))}
                  className="p-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Alejar Lienzo"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-slate-300 text-xs w-10 text-center">{stageZoom}%</span>
                <button
                  onClick={() => setStageZoom((z) => Math.min(150, z + 15))}
                  className="p-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Acercar Lienzo"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Escala del Lienzo</span>
            </div>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. SLIDE SORTER (MOSAIC VIEW OVERLAY) */}
      {/* ========================================================= */}
      {isSlideSorterOpen ? (
        <div className="flex-1 bg-obsidian-950 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span>Clasificador de Diapositivas • Visión Panorámica ({slides.length} diapositivas)</span>
            </h3>
            <button
              onClick={() => setIsSlideSorterOpen(false)}
              className="px-3 py-1 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs text-slate-300"
            >
              Cerrar Clasificador
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slides.map((sl, idx) => (
              <div
                key={sl.id}
                onClick={() => {
                  setActiveSlideIndex(idx);
                  setIsSlideSorterOpen(false);
                }}
                className={`aspect-video rounded-lg p-2 border-2 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between shadow-lg relative group ${
                  idx === activeSlideIndex
                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                    : 'border-obsidian-750 hover:border-amber-500/50'
                }`}
                style={{ backgroundColor: sl.background || '#0c0e12' }}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-mono bg-obsidian-950/80 px-1.5 py-0.5 rounded">#{idx + 1}</span>
                  <span className="truncate max-w-[120px]">{sl.elements[0]?.content || 'Sin título'}</span>
                </div>

                <div className="text-center py-4">
                  <p className="text-xs font-bold text-white truncate px-2">
                    {sl.elements[0]?.content || 'Diapositiva ' + (idx + 1)}
                  </p>
                </div>

                <div className="text-[9px] text-slate-500 text-right">
                  {sl.elements.length} elementos
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 4. MAIN SLIDE STAGE CANVAS */
        /* ========================================================= */
        <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-obsidian-950/70 relative">
          {/* Transition wrapper */}
          <div
            className={`w-full max-w-5xl transition-all duration-500 ${
              currentDeck.aspectRatio === '4:3' ? 'aspect-[4/3] max-w-3xl' : 'aspect-video'
            } ${
              isPreviewingTransition
                ? transitionEffect === 'fade'
                  ? 'opacity-0 scale-95'
                  : transitionEffect === 'slide'
                  ? 'translate-x-12 opacity-50'
                  : transitionEffect === 'zoom'
                  ? 'scale-75 opacity-0'
                  : 'rotate-3 scale-90 opacity-20'
                : 'opacity-100 scale-100 translate-x-0 rotate-0'
            }`}
            style={{
              transform: `scale(${stageZoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <div
              className="w-full h-full bg-obsidian-900 border border-obsidian-750 rounded-xl shadow-2xl relative overflow-hidden transition-all"
              style={{ background: currentSlide?.background || '#0c0e12' }}
            >
              {/* Subtle Grid Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

              {/* Render Elements inside Slide */}
              {currentSlide?.elements.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 text-amber-400/60">
                    <Tv className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">Diapositiva en blanco</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Usa la pestaña &ldquo;Insertar Formas & Contenido&rdquo; superior para agregar títulos, textos, métricas o tarjetas.
                  </p>
                </div>
              )}
              {currentSlide?.elements.map((el) => {
                const isSelected = el.id === selectedElementId;
                return (
                  <div
                    key={el.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElementId(el.id);
                    }}
                    className={`absolute transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-amber-400 rounded-lg p-1 bg-amber-500/5' : ''
                    }`}
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      width: `${el.width}%`,
                    }}
                  >
                    {/* Delete element button if selected */}
                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(el.id);
                        }}
                        className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-20"
                        title="Eliminar elemento"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Element Type: Title */}
                    {el.type === 'title' && (
                      <h1
                        className="font-extrabold tracking-tight drop-shadow-md"
                        style={{
                          fontSize: `${el.fontSize || 38}px`,
                          color: el.color || '#ffffff',
                        }}
                      >
                        {el.content}
                      </h1>
                    )}

                    {/* Element Type: Text */}
                    {el.type === 'text' && (
                      <p
                        className="leading-relaxed"
                        style={{
                          fontSize: `${el.fontSize || 16}px`,
                          color: el.color || '#cbd5e1',
                        }}
                      >
                        {el.content}
                      </p>
                    )}

                    {/* Element Type: Stat Metric */}
                    {el.type === 'stat' && (
                      <div className="bg-obsidian-800/80 border border-obsidian-700/80 p-4 rounded-xl shadow-xl backdrop-blur-sm">
                        <p
                          className="text-3xl font-extrabold font-mono"
                          style={{ color: el.color || '#fbbf24' }}
                        >
                          {el.content}
                        </p>
                        {el.subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{el.subtitle}</p>}
                      </div>
                    )}

                    {/* Element Type: Code Block */}
                    {el.type === 'code' && (
                      <pre className="bg-obsidian-950 border border-obsidian-750 p-4 rounded-xl text-xs font-mono text-emerald-400 shadow-xl overflow-hidden">
                        <code>{el.content}</code>
                      </pre>
                    )}

                    {/* Element Type: Security Badge */}
                    {el.type === 'badge' && (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{el.content}</span>
                      </div>
                    )}

                    {/* Element Type: Shape */}
                    {el.type === 'shape' && (
                      <div
                        className="w-full h-24 rounded-lg flex items-center justify-center border transition-all"
                        style={{
                          backgroundColor: el.bg || 'rgba(99, 102, 241, 0.2)',
                          borderColor: el.color || '#6366f1',
                        }}
                      >
                        {el.content === 'circle' && <Circle className="w-8 h-8 text-emerald-400" />}
                        {el.content === 'arrow' && <ArrowRight className="w-8 h-8 text-amber-400" />}
                        {el.content === 'star' && <Star className="w-8 h-8 text-rose-400 fill-rose-400/20" />}
                        {el.content === 'rectangle' && <Square className="w-8 h-8 text-indigo-400" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SLIDE NAVIGATION & PRESENTER NOTES FOOTER */}
      {/* ========================================================= */}
      {isNotesPanelOpen && !isSlideSorterOpen && (
        <footer className="h-16 bg-obsidian-950 border-t border-obsidian-800 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevSlide}
              disabled={activeSlideIndex === 0}
              className="p-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Diapositiva anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 px-2">
              {activeSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={handleNextSlide}
              disabled={activeSlideIndex === slides.length - 1}
              className="p-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Siguiente diapositiva"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Presenter Notes Input */}
          <div className="flex-1 max-w-xl mx-6">
            <input
              type="text"
              value={currentSlide?.notes || ''}
              onChange={(e) => updateSlideNotes(e.target.value)}
              placeholder="Notas privadas del presentador para esta diapositiva (visibles solo en modo orador)..."
              className="w-full bg-obsidian-900 border border-obsidian-750 text-xs text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSlideSorterOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 text-xs font-medium border border-obsidian-750 flex items-center space-x-1"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Mosaico</span>
            </button>
            <button
              onClick={() => addSlide('title')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-amber-300 text-xs font-medium border border-obsidian-750 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};
