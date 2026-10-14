import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Table as TableIcon,
  Image as ImageIcon,
  Link2,
  Sparkles,
  ShieldCheck,
  Eye,
  FileDown,
  Search,
  Replace,
  Palette,
  Highlighter,
  Eraser,
  Minus,
  Plus,
  BookOpen,
  FileText,
  Sliders,
  Check,
  ChevronDown,
  X,
  Hash,
  Undo2,
  Redo2,
  Copy,
  Clipboard as ClipboardIcon,
  Sigma,
  ListTree,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { formatRelativeTime } from '../../core/timeFormat';
import { KaTeXMathModal } from './KaTeXMathModal';
import { TableOfContentsDrawer } from './TableOfContentsDrawer';

export const DocWriterView: React.FC = () => {
  const { docs, activeDocId, updateDocContent, setExportModalOpen, theme } = useOfficeStore();
  const currentDoc = docs.find((d) => d.id === activeDocId) || docs[0];

  const editorRef = useRef<HTMLDivElement>(null);

  // Ribbon Tabs: 'inicio' | 'insertar' | 'disposicion' | 'revisar' | 'vista'
  const [activeRibbonTab, setActiveRibbonTab] = useState<'inicio' | 'insertar' | 'disposicion' | 'revisar' | 'vista'>('inicio');

  // Document Metrics
  const [wordCount, setWordCount] = useState(currentDoc ? currentDoc.wordCount : 0);
  const [charCount, setCharCount] = useState(currentDoc ? currentDoc.charCount : 0);
  const [paragraphCount, setParagraphCount] = useState(1);
  const [readingTime, setReadingTime] = useState(1);

  // View Options
  const [typewriterMode, setTypewriterMode] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  const [showOutline, setShowOutline] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100); // 75, 100, 125, 150
  const [pageTheme, setPageTheme] = useState<'obsidian' | 'white' | 'sepia' | 'midnight'>(theme === 'obsidian' ? 'obsidian' : 'white');

  useEffect(() => {
    setPageTheme(theme === 'obsidian' ? 'obsidian' : 'white');
  }, [theme]);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageMargin, setPageMargin] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [columnLayout, setColumnLayout] = useState<1 | 2 | 3>(1);

  // Typography Options
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('11pt');

  // Modals & Floating Toolbars
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findMatchCount, setFindMatchCount] = useState(0);

  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState(false);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // KaTeX Math & TOC Drawers
  const [isKaTeXModalOpen, setIsKaTeXModalOpen] = useState(false);
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState(false);

  // Color Pickers
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);

  // Document Headings Outline
  const [outlineHeadings, setOutlineHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  // Sync content with currentDoc when active doc changes
  useEffect(() => {
    if (editorRef.current && currentDoc) {
      if (editorRef.current.innerHTML !== currentDoc.content) {
        editorRef.current.innerHTML = currentDoc.content;
      }
      calculateStats();
      extractHeadings();
    }
  }, [activeDocId]);

  const calculateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length || 1;

    setWordCount(words);
    setCharCount(chars);
    setParagraphCount(paragraphs);
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
  };

  const extractHeadings = () => {
    if (!editorRef.current) return;
    const headings: { id: string; text: string; level: number }[] = [];
    const elements = editorRef.current.querySelectorAll('h1, h2, h3');
    elements.forEach((el, index) => {
      const tag = el.tagName.toLowerCase();
      const level = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3;
      const text = el.textContent || `Sección ${index + 1}`;
      if (!el.id) el.id = `heading-sec-${index}`;
      headings.push({ id: el.id, text, level });
    });
    setOutlineHeadings(headings);
  };

  const handleInput = () => {
    if (!editorRef.current || !currentDoc) return;
    const html = editorRef.current.innerHTML;
    calculateStats();
    extractHeadings();
    updateDocContent(currentDoc.id, html);

    // Typewriter scrolling effect
    if (typewriterMode) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        const middle = editorRect.top + editorRect.height / 2;
        if (Math.abs(rect.top - middle) > 50) {
          editorRef.current.parentElement?.scrollBy({
            top: rect.top - middle,
            behavior: 'smooth',
          });
        }
      }
    }
  };

  const formatDoc = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current && currentDoc) {
      updateDocContent(currentDoc.id, editorRef.current.innerHTML);
      calculateStats();
      extractHeadings();
    }
  };

  const applyFontFamily = (font: string) => {
    setFontFamily(font);
    formatDoc('fontName', font);
  };

  const applyFontSize = (size: string) => {
    setFontSize(size);
    // Use inline styled span or execCommand
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.appendChild(range.extractContents());
      range.insertNode(span);
      handleInput();
    }
  };

  const adjustFontSizeStep = (delta: number) => {
    const currentPt = parseInt(fontSize, 10) || 12;
    const newPt = Math.max(8, Math.min(72, currentPt + delta));
    applyFontSize(`${newPt}pt`);
  };

  const insertCustomTable = (rows: number, cols: number) => {
    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 1.25rem 0; border: 1px solid #334155;"><thead><tr style="background: #1e293b; color: #f8fafc;">`;
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<th style="border: 1px solid #334155; padding: 10px; font-weight: 600; text-align: left;">Encabezado ${c}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;
    for (let r = 1; r <= rows; r++) {
      tableHtml += `<tr style="border-bottom: 1px solid #222834;">`;
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td style="border: 1px solid #334155; padding: 8px 10px; color: #cbd5e1;">Dato ${r},${c}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p></p>`;
    formatDoc('insertHTML', tableHtml);
    setIsTablePickerOpen(false);
  };

  const insertImagePrompt = () => {
    const url = prompt('Introduce la URL de la imagen (o ruta local segura):');
    if (!url) return;
    const imgHtml = `
      <figure style="margin: 1.5rem auto; text-align: center; max-width: 100%;">
        <img src="${url}" alt="Imagen insertada" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3);" />
        <figcaption style="font-size: 0.8em; color: #94a3b8; margin-top: 6px; font-style: italic;">Figura 1: Ilustración del documento</figcaption>
      </figure>
      <p></p>
    `;
    formatDoc('insertHTML', imgHtml);
  };

  const insertChecklist = () => {
    const checkHtml = `
      <div style="margin: 0.75rem 0;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #e2e8f0;">
          <input type="checkbox" style="width: 16px; height: 16px; accent-color: #6366f1;" />
          <span>Tarea pendiente de completar</span>
        </label>
      </div>
      <p></p>
    `;
    formatDoc('insertHTML', checkHtml);
  };

  const insertCallout = (type: 'info' | 'warning' | 'tip') => {
    const colors = {
      info: { bg: '#1e293b', border: '#38bdf8', text: '#38bdf8', label: 'INFORMACIÓN IMPORTANTE' },
      warning: { bg: '#291809', border: '#f59e0b', text: '#fbbf24', label: 'ADVERTENCIA DE SEGURIDAD' },
      tip: { bg: '#062e20', border: '#10b981', text: '#34d399', label: 'CONSEJO DE OPTIMIZACIÓN' },
    }[type];

    const calloutHtml = `
      <div style="background: ${colors.bg}; border-left: 4px solid ${colors.border}; padding: 12px 16px; margin: 1.25rem 0; border-radius: 0 8px 8px 0;">
        <strong style="color: ${colors.text}; font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase; display: block; margin-bottom: 4px;">${colors.label}</strong>
        <p style="margin: 0; color: #e2e8f0; font-size: 0.9em;">Escribe aquí la nota explicativa o aclaratoria para los lectores...</p>
      </div>
      <p></p>
    `;
    formatDoc('insertHTML', calloutHtml);
  };

  const insertSymbol = (sym: string) => {
    formatDoc('insertText', sym);
    setIsSymbolPickerOpen(false);
  };

  const handleInsertKaTeXFormula = (renderedHtml: string, _rawLatex: string) => {
    formatDoc('insertHTML', renderedHtml);
  };

  const handleInsertToc = (tocHtml: string) => {
    formatDoc('insertHTML', tocHtml);
  };

  const handleFind = () => {
    if (!findText || !editorRef.current) return;
    const content = editorRef.current.innerText;
    const regex = new RegExp(findText, 'gi');
    const matches = content.match(regex);
    setFindMatchCount(matches ? matches.length : 0);
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;
    const html = editorRef.current.innerHTML;
    const regex = new RegExp(findText, 'g');
    const newHtml = html.replace(regex, replaceText);
    editorRef.current.innerHTML = newHtml;
    handleInput();
    setFindMatchCount(0);
  };

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Color Swatches
  const textColors = ['#f8fafc', '#94a3b8', '#38bdf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#f472b6'];
  const highlightColors = ['transparent', '#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#fed7aa'];

  // Special Symbols Catalog
  const specialSymbols = [
    '€', '$', '£', '¥', '₹', '©', '®', '™', '§', '¶',
    '°', '±', '≠', '≤', '≥', '≈', '∞', 'π', '√', '∑',
    '∫', 'α', 'β', 'γ', 'δ', 'λ', 'μ', 'Ω', '←', '→',
    '↑', '↓', '↔', '✓', '✗', '★', '⚡', '♦', '♠', '♣'
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.25rem)] bg-obsidian-900 overflow-hidden relative select-none">
      {/* =========================================================================
          1. OFFICE NOTEBOOKBAR / RIBBON (PESTAÑAS PROFESIONALES ESTILO OFFICE)
         ========================================================================= */}
      <div className="bg-obsidian-950 border-b border-obsidian-800 shrink-0 z-20">
        {/* Ribbon Tab Selectors */}
        <div className="flex items-center space-x-1 px-3 pt-1 border-b border-obsidian-850">
          {(['inicio', 'insertar', 'disposicion', 'revisar', 'vista'] as const).map((tab) => {
            const labels = {
              inicio: 'Inicio',
              insertar: 'Insertar',
              disposicion: 'Disposición & Página',
              revisar: 'Revisar & Ortografía',
              vista: 'Vista & Zoom',
            };
            const isActive = activeRibbonTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveRibbonTab(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-all ${
                  isActive
                    ? 'bg-obsidian-900 text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Ribbon Toolbars Content per Tab */}
        <div className="h-16 px-4 flex items-center justify-between overflow-x-auto divide-x divide-obsidian-800">
          {/* TAB 1: INICIO (HOME) */}
          {activeRibbonTab === 'inicio' && (
            <div className="flex items-center space-x-3 pr-4">
              {/* Deshacer / Rehacer / Portapapeles */}
              <div className="flex items-center space-x-1">
                <button onClick={() => formatDoc('undo')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-300" title="Deshacer (Ctrl+Z)">
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('redo')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-300" title="Rehacer (Ctrl+Y)">
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('copy')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-300" title="Copiar (Ctrl+C)">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('paste')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-300" title="Pegar (Ctrl+V)">
                  <ClipboardIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[1px] h-8 bg-obsidian-800" />

              {/* Selector de Fuentes y Tamaño */}
              <div className="flex items-center space-x-1.5">
                <select
                  value={fontFamily}
                  onChange={(e) => applyFontFamily(e.target.value)}
                  className="bg-obsidian-900 text-slate-200 text-xs px-2 py-1 rounded border border-obsidian-750 focus:outline-none w-28 sm:w-36"
                >
                  <option value="Inter">Inter (Sans)</option>
                  <option value="Merriweather">Merriweather (Serif)</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Arial">Arial</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>

                <select
                  value={fontSize}
                  onChange={(e) => applyFontSize(e.target.value)}
                  className="bg-obsidian-900 text-slate-200 text-xs px-2 py-1 rounded border border-obsidian-750 focus:outline-none w-16"
                >
                  <option value="9pt">9 pt</option>
                  <option value="10pt">10 pt</option>
                  <option value="11pt">11 pt</option>
                  <option value="12pt">12 pt</option>
                  <option value="14pt">14 pt</option>
                  <option value="16pt">16 pt</option>
                  <option value="18pt">18 pt</option>
                  <option value="24pt">24 pt</option>
                  <option value="32pt">32 pt</option>
                  <option value="48pt">48 pt</option>
                </select>

                <button onClick={() => adjustFontSizeStep(1)} className="px-1.5 py-1 rounded hover:bg-obsidian-800 text-slate-300 text-xs font-bold" title="Aumentar tamaño de fuente (A+)">
                  A⁺
                </button>
                <button onClick={() => adjustFontSizeStep(-1)} className="px-1.5 py-1 rounded hover:bg-obsidian-800 text-slate-300 text-xs font-bold" title="Disminuir tamaño de fuente (A-)">
                  A⁻
                </button>
              </div>

              <div className="w-[1px] h-8 bg-obsidian-800" />

              {/* Formato de Carácter: B, I, U, S, X2, X^2, Color, Highlighter */}
              <div className="flex items-center space-x-1">
                <button onClick={() => formatDoc('bold')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Negrita (Ctrl+B)">
                  <Bold className="w-3.5 h-3.5 font-bold" />
                </button>
                <button onClick={() => formatDoc('italic')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Cursiva (Ctrl+I)">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('underline')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Subrayado (Ctrl+U)">
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('strikeThrough')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Tachado">
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('subscript')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Subíndice (X₂)">
                  <Subscript className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('superscript')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Superíndice (X²)">
                  <Superscript className="w-3.5 h-3.5" />
                </button>

                {/* Color de Texto */}
                <div className="relative">
                  <button onClick={() => setShowTextColorPicker(!showTextColorPicker)} className="p-1.5 rounded hover:bg-obsidian-800 text-amber-400" title="Color de fuente">
                    <Palette className="w-3.5 h-3.5" />
                  </button>
                  {showTextColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-obsidian-950 border border-obsidian-750 p-2 rounded-lg shadow-xl grid grid-cols-4 gap-1.5 z-50">
                      {textColors.map((c) => (
                        <div
                          key={c}
                          onClick={() => {
                            formatDoc('foreColor', c);
                            setShowTextColorPicker(false);
                          }}
                          className="w-5 h-5 rounded cursor-pointer border border-white/20 hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Resaltador */}
                <div className="relative">
                  <button onClick={() => setShowHighlightColorPicker(!showHighlightColorPicker)} className="p-1.5 rounded hover:bg-obsidian-800 text-yellow-400" title="Resaltado fluorescente">
                    <Highlighter className="w-3.5 h-3.5" />
                  </button>
                  {showHighlightColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-obsidian-950 border border-obsidian-750 p-2 rounded-lg shadow-xl grid grid-cols-3 gap-1.5 z-50">
                      {highlightColors.map((c) => (
                        <div
                          key={c}
                          onClick={() => {
                            formatDoc('hiliteColor', c);
                            setShowHighlightColorPicker(false);
                          }}
                          className="w-6 h-6 rounded cursor-pointer border border-white/20 hover:scale-110 flex items-center justify-center text-[10px]"
                          style={{ backgroundColor: c }}
                        >
                          {c === 'transparent' ? '✕' : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => formatDoc('removeFormat')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-400 hover:text-white" title="Borrar formato">
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[1px] h-8 bg-obsidian-800" />

              {/* Párrafo: Alineaciones & Listas */}
              <div className="flex items-center space-x-1">
                <button onClick={() => formatDoc('justifyLeft')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Alinear a la izquierda (Ctrl+L)">
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('justifyCenter')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Centrar (Ctrl+E)">
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('justifyRight')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Alinear a la derecha (Ctrl+R)">
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('justifyFull')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Justificar (Ctrl+J)">
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>

                <button onClick={() => formatDoc('insertUnorderedList')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Viñetas">
                  <List className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('insertOrderedList')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Numeración">
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button onClick={insertChecklist} className="p-1.5 rounded hover:bg-obsidian-800 text-indigo-400" title="Lista de Tareas / Checkbox">
                  <ListChecks className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('outdent')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Disminuir sangría">
                  <Outdent className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => formatDoc('indent')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Aumentar sangría">
                  <Indent className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-[1px] h-8 bg-obsidian-800" />

              {/* Estilos Rápidos: Títulos H1-H3 */}
              <div className="flex items-center space-x-1">
                <button onClick={() => formatDoc('formatBlock', '<h1>')} className="px-2 py-1 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs font-bold text-slate-200" title="Título 1">
                  H1
                </button>
                <button onClick={() => formatDoc('formatBlock', '<h2>')} className="px-2 py-1 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs font-bold text-slate-200" title="Título 2">
                  H2
                </button>
                <button onClick={() => formatDoc('formatBlock', '<h3>')} className="px-2 py-1 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs font-bold text-slate-200" title="Título 3">
                  H3
                </button>
                <button onClick={() => formatDoc('formatBlock', '<blockquote>')} className="p-1.5 rounded hover:bg-obsidian-800 text-slate-200" title="Cita en bloque">
                  <Quote className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INSERTAR (INSERT) */}
          {activeRibbonTab === 'insertar' && (
            <div className="flex items-center space-x-3 pr-4">
              {/* Tabla con Selector de Filas x Columnas */}
              <div className="relative">
                <button
                  onClick={() => setIsTablePickerOpen(!isTablePickerOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs font-medium text-slate-200 border border-obsidian-750"
                  title="Insertar Tabla"
                >
                  <TableIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Insertar Tabla</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isTablePickerOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-obsidian-950 border border-obsidian-750 p-3 rounded-xl shadow-2xl z-50 w-52 space-y-3">
                    <p className="text-xs font-bold text-white">Dimensiones de la Tabla</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400">Filas:</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={tableRows}
                          onChange={(e) => setTableRows(Number(e.target.value))}
                          className="w-full bg-obsidian-900 border border-obsidian-800 text-white px-2 py-1 rounded text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">Columnas:</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={tableCols}
                          onChange={(e) => setTableCols(Number(e.target.value))}
                          className="w-full bg-obsidian-900 border border-obsidian-800 text-white px-2 py-1 rounded text-center"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => insertCustomTable(tableRows, tableCols)}
                      className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Insertar {tableRows}x{tableCols}
                    </button>
                  </div>
                )}
              </div>

              {/* Imagen */}
              <button
                onClick={insertImagePrompt}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs font-medium text-slate-200 border border-obsidian-750"
                title="Insertar Imagen"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Imagen</span>
              </button>

              {/* Hipervínculo */}
              <button
                onClick={() => {
                  const url = prompt('Introduce la dirección URL:');
                  if (url) formatDoc('createLink', url);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs font-medium text-slate-200 border border-obsidian-750"
                title="Insertar Hipervínculo"
              >
                <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hipervínculo</span>
              </button>

              {/* Símbolos y Caracteres Especiales */}
              <div className="relative">
                <button
                  onClick={() => setIsSymbolPickerOpen(!isSymbolPickerOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs font-medium text-slate-200 border border-obsidian-750"
                  title="Insertar Símbolos Especiales"
                >
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>Símbolos (€, ©, ∞, π)</span>
                </button>

                {isSymbolPickerOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-obsidian-950 border border-obsidian-750 p-3 rounded-xl shadow-2xl z-50 w-72">
                    <div className="flex items-center justify-between pb-2 border-b border-obsidian-800 mb-2">
                      <p className="text-xs font-bold text-white">Símbolos Especiales</p>
                      <button onClick={() => setIsSymbolPickerOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-8 gap-1.5 text-sm">
                      {specialSymbols.map((sym, idx) => (
                        <button
                          key={idx}
                          onClick={() => insertSymbol(sym)}
                          className="h-7 rounded bg-obsidian-900 hover:bg-indigo-600 hover:text-white text-slate-200 transition-colors flex items-center justify-center font-serif"
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cuadros de Aviso / Callouts */}
              <div className="flex items-center space-x-1 bg-obsidian-900 p-1 rounded-lg border border-obsidian-800">
                <button onClick={() => insertCallout('info')} className="px-2 py-1 rounded hover:bg-obsidian-800 text-[11px] text-sky-300 font-medium">
                  + Nota Info
                </button>
                <button onClick={() => insertCallout('warning')} className="px-2 py-1 rounded hover:bg-obsidian-800 text-[11px] text-amber-300 font-medium">
                  + Aviso
                </button>
                <button onClick={() => insertCallout('tip')} className="px-2 py-1 rounded hover:bg-obsidian-800 text-[11px] text-emerald-300 font-medium">
                  + Tip
                </button>
              </div>

              {/* KaTeX Math Formula Editor */}
              <button
                onClick={() => setIsKaTeXModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-indigo-950/50 hover:bg-indigo-900/70 text-xs font-semibold text-indigo-300 border border-indigo-500/40 shadow-sm transition-all"
                title="Editor de Ecuaciones y Fórmulas Matemáticas LaTeX / KaTeX"
              >
                <Sigma className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fórmula KaTeX</span>
              </button>

              {/* Table of Contents Drawer */}
              <button
                onClick={() => setIsTocDrawerOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs font-medium text-slate-200 border border-obsidian-750 transition-colors"
                title="Índice y Tabla de Contenidos Automática"
              >
                <ListTree className="w-3.5 h-3.5 text-blue-400" />
                <span>Tabla de Contenidos</span>
              </button>

              {/* Salto de Línea Horizontal */}
              <button
                onClick={() => formatDoc('insertHorizontalRule')}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-obsidian-850 hover:bg-obsidian-800 text-xs text-slate-300"
                title="Línea divisoria horizontal"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Separador</span>
              </button>
            </div>
          )}

          {/* TAB 3: DISPOSICIÓN & MAQUETACIÓN (LAYOUT) */}
          {activeRibbonTab === 'disposicion' && (
            <div className="flex items-center space-x-4 pr-4">
              {/* Orientación */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Orientación:</span>
                <div className="flex items-center bg-obsidian-900 p-0.5 rounded-lg border border-obsidian-750 text-xs">
                  <button
                    onClick={() => setPageOrientation('portrait')}
                    className={`px-2.5 py-1 rounded transition-colors ${pageOrientation === 'portrait' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Vertical
                  </button>
                  <button
                    onClick={() => setPageOrientation('landscape')}
                    className={`px-2.5 py-1 rounded transition-colors ${pageOrientation === 'landscape' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    Horizontal
                  </button>
                </div>
              </div>

              {/* Márgenes */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Márgenes:</span>
                <select
                  value={pageMargin}
                  onChange={(e) => setPageMargin(e.target.value as any)}
                  className="bg-obsidian-900 text-slate-200 text-xs px-2.5 py-1 rounded border border-obsidian-750 focus:outline-none"
                >
                  <option value="normal">Normal (2.5 cm)</option>
                  <option value="narrow">Estrecho (1.27 cm)</option>
                  <option value="wide">Ancho (3.8 cm)</option>
                </select>
              </div>

              {/* Columnas */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Columnas:</span>
                <div className="flex items-center bg-obsidian-900 p-0.5 rounded-lg border border-obsidian-750 text-xs">
                  <button
                    onClick={() => setColumnLayout(1)}
                    className={`px-2 py-1 rounded ${columnLayout === 1 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    1 Col
                  </button>
                  <button
                    onClick={() => setColumnLayout(2)}
                    className={`px-2 py-1 rounded ${columnLayout === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    2 Cols
                  </button>
                  <button
                    onClick={() => setColumnLayout(3)}
                    className={`px-2 py-1 rounded ${columnLayout === 3 ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    3 Cols
                  </button>
                </div>
              </div>

              {/* Color de Hoja de Papel */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Color Papel:</span>
                <div className="flex items-center space-x-1">
                  <button onClick={() => setPageTheme('obsidian')} className={`w-5 h-5 rounded-full bg-[#0c0e12] border-2 ${pageTheme === 'obsidian' ? 'border-indigo-500 ring-1 ring-indigo-400' : 'border-slate-700'}`} title="Obsidian Dark" />
                  <button onClick={() => setPageTheme('white')} className={`w-5 h-5 rounded-full bg-[#ffffff] border-2 ${pageTheme === 'white' ? 'border-indigo-500 ring-1 ring-indigo-400' : 'border-slate-700'}`} title="Blanco Clásico" />
                  <button onClick={() => setPageTheme('sepia')} className={`w-5 h-5 rounded-full bg-[#fbf0d9] border-2 ${pageTheme === 'sepia' ? 'border-indigo-500 ring-1 ring-indigo-400' : 'border-slate-700'}`} title="Sepia Confort" />
                  <button onClick={() => setPageTheme('midnight')} className={`w-5 h-5 rounded-full bg-[#0f172a] border-2 ${pageTheme === 'midnight' ? 'border-indigo-500 ring-1 ring-indigo-400' : 'border-slate-700'}`} title="Azul Medianoche" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REVISAR & ORTOGRAFÍA (REVIEW) */}
          {activeRibbonTab === 'revisar' && (
            <div className="flex items-center space-x-3 pr-4">
              {/* Buscar y Reemplazar */}
              <button
                onClick={() => setIsFindReplaceOpen(!isFindReplaceOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  isFindReplaceOpen ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-obsidian-850 border-obsidian-750 text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span>Buscar y Reemplazar</span>
              </button>

              {/* Estadísticas de Lectura */}
              <div className="flex items-center space-x-4 bg-obsidian-900 px-3 py-1.5 rounded-lg border border-obsidian-800 text-[11px] font-mono text-slate-300">
                <span><strong>{wordCount}</strong> palabras</span>
                <span>•</span>
                <span><strong>{charCount}</strong> caracteres</span>
                <span>•</span>
                <span><strong>{paragraphCount}</strong> párrafos</span>
                <span>•</span>
                <span className="text-indigo-400"><strong>~{readingTime}</strong> min lectura</span>
              </div>

              {/* Corrector Ortográfico Nativo */}
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded border border-emerald-500/20">
                <Check className="w-3.5 h-3.5" />
                <span>Corrector Ortográfico Activo (Español)</span>
              </div>
            </div>
          )}

          {/* TAB 5: VISTA & ZOOM (VIEW) */}
          {activeRibbonTab === 'vista' && (
            <div className="flex items-center space-x-4 pr-4">
              {/* Controles de Vista */}
              <button
                onClick={() => setShowRuler(!showRuler)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  showRuler ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-obsidian-850 border-obsidian-750 text-slate-300'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Regla Graduada</span>
              </button>

              <button
                onClick={() => setShowOutline(!showOutline)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  showOutline ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-obsidian-850 border-obsidian-750 text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Mapa del Documento ({outlineHeadings.length})</span>
              </button>

              <button
                onClick={() => setIsTocDrawerOpen(true)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  isTocDrawerOpen ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-obsidian-850 border-obsidian-750 text-slate-300'
                }`}
                title="Abrir panel deslizante de Tabla de Contenidos e Índice"
              >
                <ListTree className="w-3.5 h-3.5 text-indigo-400" />
                <span>Índice / TOC</span>
              </button>

              <button
                onClick={() => setTypewriterMode(!typewriterMode)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  typewriterMode ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-obsidian-850 border-obsidian-750 text-slate-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Modo Máquina de Escribir</span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400">Zoom:</span>
                <div className="flex items-center bg-obsidian-900 rounded-lg border border-obsidian-750 p-0.5 text-xs">
                  <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))} className="p-1 hover:text-white text-slate-400">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-indigo-400">{zoomLevel}%</span>
                  <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))} className="p-1 hover:text-white text-slate-400">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Right Action: Quick Export */}
          <div className="pl-4">
            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              title="Exportar archivo"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Guardar / Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. FIND AND REPLACE FLOATING BAR
         ========================================================================= */}
      {isFindReplaceOpen && (
        <div className="bg-obsidian-950 border-b border-obsidian-800 px-4 py-2 flex items-center space-x-3 text-xs z-20 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <input
              type="text"
              placeholder="Buscar en el documento..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFind()}
              className="bg-obsidian-900 text-white text-xs px-2.5 py-1 rounded border border-obsidian-750 focus:outline-none w-48"
            />
            <button onClick={handleFind} className="px-2 py-1 rounded bg-obsidian-850 hover:bg-obsidian-800 text-slate-300">
              Buscar
            </button>
            {findMatchCount > 0 && (
              <span className="text-[10px] text-emerald-400 font-mono">
                {findMatchCount} coincidencia(s)
              </span>
            )}
          </div>

          <div className="w-[1px] h-5 bg-obsidian-800" />

          <div className="flex items-center space-x-2">
            <Replace className="w-3.5 h-3.5 text-indigo-400" />
            <input
              type="text"
              placeholder="Reemplazar por..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="bg-obsidian-900 text-white text-xs px-2.5 py-1 rounded border border-obsidian-750 focus:outline-none w-48"
            />
            <button onClick={handleReplaceAll} className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
              Reemplazar Todo
            </button>
          </div>

          <button onClick={() => setIsFindReplaceOpen(false)} className="ml-auto text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          3. INTERACTIVE RULER (REGLA GRADUADA EN CENTÍMETROS)
         ========================================================================= */}
      {showRuler && (
        <div className="h-5 bg-obsidian-950 border-b border-obsidian-800 flex items-center justify-center select-none shrink-0 overflow-hidden font-mono text-[9px] text-slate-400">
          <div className="w-full max-w-[850px] flex items-center justify-between px-12 border-x border-obsidian-800 relative">
            {/* Centimeter ticks */}
            {Array.from({ length: 17 }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-[8px] text-slate-400">{i}</span>
                <div className="h-1.5 w-[1px] bg-obsidian-700" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. MAIN WORKSPACE WITH OPTIONAL OUTLINE DRAWER + A4 PAGE
         ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Outline Drawer (Tabla de Contenidos Automática) */}
        {showOutline && (
          <aside className="w-64 bg-obsidian-950 border-r border-obsidian-800 p-4 overflow-y-auto space-y-2 shrink-0 animate-in slide-in-from-left duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-obsidian-800 mb-2">
              <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Estructura del Documento</span>
              </span>
              <button onClick={() => setShowOutline(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {outlineHeadings.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No hay encabezados (H1, H2, H3) definidos en el texto.</p>
            ) : (
              <div className="space-y-1">
                {outlineHeadings.map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToHeading(h.id)}
                    className={`w-full text-left truncate text-xs py-1 px-2 rounded hover:bg-obsidian-850 hover:text-white transition-colors ${
                      h.level === 1 ? 'font-bold text-slate-200' : h.level === 2 ? 'pl-4 text-slate-300' : 'pl-6 text-slate-400 text-[11px]'
                    }`}
                  >
                    {h.text}
                  </button>
                ))}
              </div>
            )}
          </aside>
        )}

        {/* Document Page Canvas */}
        <div className="flex-1 overflow-y-auto px-4 py-8 flex justify-center bg-obsidian-950/60">
          <div
            className={`transition-all duration-200 rounded-lg shadow-2xl focus:outline-none print-page ${
              pageOrientation === 'landscape' ? 'w-full max-w-[1100px] min-h-[850px]' : 'w-full max-w-[850px] min-h-[1100px]'
            } ${
              pageMargin === 'narrow' ? 'p-8 sm:p-10' : pageMargin === 'wide' ? 'p-16 sm:p-24' : 'p-12 sm:p-16'
            } ${
              pageTheme === 'white'
                ? 'bg-white text-slate-900 border-none'
                : pageTheme === 'sepia'
                ? 'bg-[#fbf0d9] text-[#2c2214] border border-[#e8d7b5]'
                : pageTheme === 'midnight'
                ? 'bg-[#0f172a] text-slate-100 border border-slate-800'
                : 'bg-obsidian-900 text-slate-200 border border-obsidian-750'
            }`}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {/* Page Header Indicator */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-black/10 dark:border-white/10 select-none">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  APEX WRITER • {pageOrientation.toUpperCase()} • {pageMargin.toUpperCase()}
                </span>
                <span className="text-xs opacity-50">|</span>
                <span className="text-xs opacity-70">{formatRelativeTime(currentDoc?.lastModified)}</span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-500 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Libre de Macros & DDE</span>
              </div>
            </div>

            {/* Editable Content */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              suppressContentEditableWarning
              className="prose-apex focus:outline-none min-h-[800px] leading-relaxed text-sm sm:text-base"
              style={{
                columnCount: columnLayout,
                columnGap: '2rem',
                fontFamily: fontFamily,
              }}
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. BOTTOM STATUS BAR (ESTADÍSTICAS EXACTAS ESTILO LIBREOFFICE / WORD)
         ========================================================================= */}
      <footer className="h-7 bg-obsidian-950 border-t border-obsidian-800 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0 font-mono">
        <div className="flex items-center space-x-4">
          <span>Página 1 de 1</span>
          <span>•</span>
          <span>{wordCount} palabras</span>
          <span>•</span>
          <span>{charCount} caracteres</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            <span>~{readingTime} min lectura</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="capitalize">{pageOrientation}</span>
          <span>•</span>
          <span>Zoom: {zoomLevel}%</span>
          <span>•</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>UTF-8 / OOXML Conforme</span>
          </span>
        </div>
      </footer>

      {/* KaTeX LaTeX Formula Editor Modal */}
      <KaTeXMathModal
        isOpen={isKaTeXModalOpen}
        onClose={() => setIsKaTeXModalOpen(false)}
        onInsertFormula={handleInsertKaTeXFormula}
      />

      {/* Live Table of Contents Slide-in Drawer */}
      <TableOfContentsDrawer
        isOpen={isTocDrawerOpen}
        onClose={() => setIsTocDrawerOpen(false)}
        editorRef={editorRef}
        onInsertToc={handleInsertToc}
      />
    </div>
  );
};
