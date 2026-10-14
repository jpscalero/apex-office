import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  ListTree,
  Search,
  RefreshCw,
  PlusCircle,
  ChevronRight,
  SlidersHorizontal,
  Check,
  BookOpen
} from 'lucide-react';

export interface HeadingItem {
  id: string;
  text: string;
  level: number; // 1, 2, 3, 4
  sectionNumber: string; // "1", "1.1", "1.2", "2", "2.1"
}

export interface TableOfContentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
  documentHtml?: string;
  onInsertToc: (tocHtml: string) => void;
  onNavigateHeading?: (headingId: string) => void;
}

export const TableOfContentsDrawer: React.FC<TableOfContentsDrawerProps> = ({
  isOpen,
  onClose,
  editorRef,
  documentHtml,
  onInsertToc,
  onNavigateHeading,
}) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
  });
  const [includeDottedLeaders, setIncludeDottedLeaders] = useState<boolean>(true);
  const [includeSectionNumbers, setIncludeSectionNumbers] = useState<boolean>(true);
  const [insertedFeedback, setInsertedFeedback] = useState<boolean>(false);

  // Extract headings and assign stable IDs
  const extractHeadings = useCallback(() => {
    let elements: { tag: string; text: string; id: string; targetEl?: HTMLElement }[] = [];

    if (editorRef?.current) {
      const domHeadings = editorRef.current.querySelectorAll('h1, h2, h3, h4');
      domHeadings.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        const tag = htmlEl.tagName.toLowerCase();
        const text = htmlEl.textContent?.trim() || `Sección ${index + 1}`;

        // Ensure every heading in the editor has a stable ID for navigation and anchor links
        if (!htmlEl.id) {
          const slug = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 30);
          htmlEl.id = `sec-${index + 1}-${slug || 'item'}`;
        }

        elements.push({
          tag,
          text,
          id: htmlEl.id,
          targetEl: htmlEl,
        });
      });
    } else if (documentHtml) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(documentHtml, 'text/html');
      const parsedHeadings = doc.querySelectorAll('h1, h2, h3, h4');
      parsedHeadings.forEach((el, index) => {
        const tag = el.tagName.toLowerCase();
        const text = el.textContent?.trim() || `Sección ${index + 1}`;
        const id = el.id || `sec-${index + 1}`;
        elements.push({ tag, text, id });
      });
    }

    // Compute hierarchical section numbering (e.g., 1, 1.1, 1.2, 2, 2.1, 2.1.1)
    let c1 = 0;
    let c2 = 0;
    let c3 = 0;
    let c4 = 0;

    const formatted: HeadingItem[] = elements.map((item) => {
      const level = parseInt(item.tag.replace('h', ''), 10) || 1;
      let sectionNumber = '';

      if (level === 1) {
        c1++;
        c2 = 0;
        c3 = 0;
        c4 = 0;
        sectionNumber = `${c1}`;
      } else if (level === 2) {
        c2++;
        c3 = 0;
        c4 = 0;
        sectionNumber = `${c1 || 1}.${c2}`;
      } else if (level === 3) {
        c3++;
        c4 = 0;
        sectionNumber = `${c1 || 1}.${c2 || 1}.${c3}`;
      } else if (level === 4) {
        c4++;
        sectionNumber = `${c1 || 1}.${c2 || 1}.${c3 || 1}.${c4}`;
      }

      return {
        id: item.id,
        text: item.text,
        level,
        sectionNumber,
      };
    });

    setHeadings(formatted);
  }, [editorRef, documentHtml]);

  // Extract when drawer opens or document content updates
  useEffect(() => {
    if (isOpen) {
      extractHeadings();
    }
  }, [isOpen, extractHeadings, documentHtml]);

  // Filtered list based on search and level toggles
  const filteredHeadings = useMemo(() => {
    return headings.filter((h) => {
      const matchesLevel = selectedLevels[h.level];
      const matchesSearch =
        !searchQuery.trim() ||
        h.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.sectionNumber.includes(searchQuery);
      return matchesLevel && matchesSearch;
    });
  }, [headings, selectedLevels, searchQuery]);

  // Navigate to heading with smooth scrolling and high-visibility pulse highlight
  const handleScrollToHeading = (id: string) => {
    setActiveHeadingId(id);

    let targetEl: HTMLElement | null = null;
    if (editorRef?.current) {
      targetEl = editorRef.current.querySelector(`#${CSS.escape(id)}`) as HTMLElement;
    }
    if (!targetEl) {
      targetEl = document.getElementById(id);
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Visual flash animation
      targetEl.style.transition = 'all 0.3s ease';
      targetEl.style.backgroundColor = 'rgba(99, 102, 241, 0.25)';
      targetEl.style.outline = '2px solid #818cf8';
      targetEl.style.borderRadius = '4px';

      setTimeout(() => {
        if (targetEl) {
          targetEl.style.backgroundColor = '';
          targetEl.style.outline = '';
        }
      }, 1500);
    }

    if (onNavigateHeading) {
      onNavigateHeading(id);
    }
  };

  // Generate formatted HTML Table of Contents with internal anchors and dotted leaders
  const generateTocHtml = () => {
    const items = headings.filter((h) => selectedLevels[h.level]);
    if (items.length === 0) return '';

    const leaderDotsHtml = includeDottedLeaders
      ? '<span style="flex-grow: 1; border-bottom: 1px dotted #64748b; margin: 0 0.5rem; min-width: 1.5rem; transform: translateY(-3px);" class="toc-dots"></span>'
      : '<span style="flex-grow: 1;"></span>';

    const entriesHtml = items
      .map((h) => {
        const indentRem = (h.level - 1) * 1.25;
        const fontSize =
          h.level === 1 ? '0.95rem' : h.level === 2 ? '0.875rem' : h.level === 3 ? '0.825rem' : '0.78rem';
        const fontWeight = h.level === 1 ? '700' : h.level === 2 ? '600' : '400';
        const color = h.level === 1 ? '#f8fafc' : h.level === 2 ? '#e2e8f0' : '#cbd5e1';

        const numberPrefix = includeSectionNumbers
          ? `<span style="font-family: monospace; font-weight: 700; color: #818cf8; margin-right: 0.5rem; flex-shrink: 0;">${h.sectionNumber}</span>`
          : '';

        return `
          <div style="margin-left: ${indentRem}rem; margin-bottom: 0.35rem; font-size: ${fontSize}; line-height: 1.5;">
            <a href="#${h.id}" style="display: flex; align-items: baseline; justify-content: space-between; text-decoration: none; color: ${color}; width: 100%; transition: color 0.15s ease;" onmouseover="this.style.color='#93c5fd'" onmouseout="this.style.color='${color}'">
              <span style="display: inline-flex; align-items: baseline; font-weight: ${fontWeight}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">
                ${numberPrefix}
                <span>${h.text}</span>
              </span>
              ${leaderDotsHtml}
              <span style="font-family: monospace; font-size: 0.75rem; color: #94a3b8; flex-shrink: 0; padding-left: 4px;">
                § ${h.sectionNumber}
              </span>
            </a>
          </div>
        `.trim();
      })
      .join('\n');

    return `
      <div class="apex-toc-container my-6 p-6 rounded-2xl bg-obsidian-950/85 border border-obsidian-750 font-sans shadow-xl select-all" data-apex-toc="true" contenteditable="false">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.75rem; margin-bottom: 1rem; border-bottom: 2px solid #6366f1;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-weight: 800; font-size: 1.15rem; color: #ffffff; letter-spacing: -0.02em;">ÍNDICE GENERAL DE CONTENIDOS</span>
          </div>
          <span style="font-size: 0.75rem; font-family: monospace; color: #a5b4fc; background: rgba(99, 102, 241, 0.15); padding: 3px 10px; border-radius: 9999px; border: 1px solid rgba(99, 102, 241, 0.3); font-weight: 600;">
            ${items.length} Secciones
          </span>
        </div>
        <nav style="display: flex; flex-direction: column; gap: 0.15rem;">
          ${entriesHtml}
        </nav>
      </div>
      <p></p>
    `.trim();
  };

  const handleInsertToc = () => {
    const tocHtml = generateTocHtml();
    if (!tocHtml) return;

    onInsertToc(tocHtml);
    setInsertedFeedback(true);
    setTimeout(() => {
      setInsertedFeedback(false);
      onClose();
    }, 1200);
  };

  const toggleLevel = (lvl: number) => {
    setSelectedLevels((prev) => ({
      ...prev,
      [lvl]: !prev[lvl],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Background Dim Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel Sliding from Right */}
      <div
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="toc-drawer-title"
      >
        <div className="w-screen max-w-md bg-obsidian-950 border-l border-obsidian-800 text-slate-100 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
          {/* =========================================================================
              HEADER
             ========================================================================= */}
          <div className="px-6 py-4 border-b border-obsidian-800 bg-obsidian-900/90 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <ListTree className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 id="toc-drawer-title" className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Tabla de Contenidos
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                    {headings.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Jerarquía H1 - H4 con salto interactivo</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={extractHeadings}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors"
                title="Actualizar encabezados del documento"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors"
                title="Cerrar panel lateral"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              SEARCH & LEVEL FILTERS
             ========================================================================= */}
          <div className="p-4 border-b border-obsidian-800 bg-obsidian-900/40 space-y-3 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar secciones o títulos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-obsidian-900 border border-obsidian-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Level Pill Toggles */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
                <span>Niveles:</span>
              </span>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => toggleLevel(lvl)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                      selectedLevels[lvl]
                        ? lvl === 1
                          ? 'bg-indigo-600 text-white'
                          : lvl === 2
                          ? 'bg-blue-600 text-white'
                          : lvl === 3
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 text-white'
                        : 'bg-obsidian-900 text-slate-500 border border-obsidian-800 hover:text-slate-300'
                    }`}
                  >
                    H{lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              TREE VIEW LIST OF HEADINGS
             ========================================================================= */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredHeadings.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4 space-y-3 text-slate-500">
                <BookOpen className="w-10 h-10 stroke-1 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-400">No se encontraron encabezados</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Crea títulos en tu texto usando H1, H2, H3 o H4 desde la barra de herramientas para generar la estructura.
                  </p>
                </div>
              </div>
            ) : (
              filteredHeadings.map((h, idx) => {
                const isActive = activeHeadingId === h.id;
                const indentClass =
                  h.level === 1 ? 'pl-2 font-semibold' : h.level === 2 ? 'pl-6 font-medium' : h.level === 3 ? 'pl-10' : 'pl-14';

                const badgeColor =
                  h.level === 1
                    ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25'
                    : h.level === 2
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/25'
                    : h.level === 3
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/25';

                return (
                  <div
                    key={`${h.id}-${idx}`}
                    onClick={() => handleScrollToHeading(h.id)}
                    className={`group w-full py-2 pr-3 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-between border ${indentClass} ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'border-transparent hover:bg-obsidian-900/90 hover:border-obsidian-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {/* Level Tag */}
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${badgeColor}`}>
                        H{h.level}
                      </span>

                      {/* Numbering */}
                      <span className="font-mono text-[11px] font-bold text-indigo-300 shrink-0">
                        {h.sectionNumber}
                      </span>

                      {/* Text */}
                      <span className="truncate text-slate-200 group-hover:text-white">
                        {h.text}
                      </span>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors ml-2 shrink-0" />
                  </div>
                );
              })
            )}
          </div>

          {/* =========================================================================
              BOTTOM PANEL: INSERT OPTIONS & ACTION BUTTON
             ========================================================================= */}
          <div className="p-5 border-t border-obsidian-800 bg-obsidian-900/90 space-y-4 shrink-0">
            {/* Formatting Options */}
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer text-slate-400 hover:text-slate-200">
                <span>Líneas de puntos líderes (...)</span>
                <input
                  type="checkbox"
                  checked={includeDottedLeaders}
                  onChange={(e) => setIncludeDottedLeaders(e.target.checked)}
                  className="rounded bg-obsidian-800 border-obsidian-750 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer text-slate-400 hover:text-slate-200">
                <span>Numeración jerárquica (1, 1.1, 1.2)</span>
                <input
                  type="checkbox"
                  checked={includeSectionNumbers}
                  onChange={(e) => setIncludeSectionNumbers(e.target.checked)}
                  className="rounded bg-obsidian-800 border-obsidian-750 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Primary Insertion Action */}
            <button
              type="button"
              onClick={handleInsertToc}
              disabled={headings.length === 0}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg transition-all ${
                insertedFeedback
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : headings.length > 0
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 active:scale-[0.98]'
                  : 'bg-obsidian-800 text-slate-500 border border-obsidian-750 cursor-not-allowed'
              }`}
            >
              {insertedFeedback ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>¡Índice Insertado con Éxito!</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Insertar Índice en el Documento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
