import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  OfficeModule,
  ThemeMode,
  DocItem,
  SpreadsheetItem,
  SlideDeckItem,
  Slide,
  SlideElement,
  VaultTable,
  TableField,
  AgendaEvent,
  MailMessage,
  SecurityAuditResult,
  CellStyle,
} from '../types';
import { FormulaEngine } from '../core/formulaEngine';
import { SecuritySanitizer } from '../core/securitySanitizer';
import { sha256Sync } from '../core/crypto';

interface OfficeState {
  // Navigation & Shell
  currentModule: OfficeModule;
  setModule: (module: OfficeModule) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  zenMode: boolean;
  toggleZenMode: () => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  isSecurityModalOpen: boolean;
  setSecurityModalOpen: (open: boolean) => void;
  isAICopilotOpen: boolean;
  toggleAICopilot: () => void;
  isMacroIDEOpen: boolean;
  toggleMacroIDE: () => void;
  isTimeMachineOpen: boolean;
  toggleTimeMachine: () => void;
  isPrivacyCenterOpen: boolean;
  setPrivacyCenterOpen: (open: boolean) => void;
  togglePrivacyCenter: () => void;
  activePrivacyTab: string;
  setActivePrivacyTab: (tab: string) => void;
  isCookieBannerDismissed: boolean;
  dismissCookieBanner: () => void;
  resetCookieConsent: () => void;
  cookiePreferences: {
    technical: boolean;
    preferences: boolean;
    analytics: boolean;
  };
  setCookiePreferences: (prefs: Partial<{ technical: boolean; preferences: boolean; analytics: boolean }>) => void;

  // Ad Banners & Sponsorship / Pro License State
  showAdBanners: boolean;
  toggleAdBanners: () => void;
  setShowAdBanners: (show: boolean) => void;
  adBannerPosition: 'top' | 'bottom' | 'floating';
  setAdBannerPosition: (pos: 'top' | 'bottom' | 'floating') => void;
  isProLicense: boolean;
  activateProLicense: (key: string) => boolean;
  isAdManagerOpen: boolean;
  setAdManagerOpen: (open: boolean) => void;

  // 1. Writer State
  docs: DocItem[];
  activeDocId: string;
  setActiveDoc: (id: string) => void;
  updateDocTitle: (id: string, title: string) => void;
  updateDocContent: (id: string, content: string) => void;
  createDoc: (title?: string) => string;
  deleteDoc: (id: string) => void;

  // 2. Calc State
  spreadsheets: SpreadsheetItem[];
  activeSpreadsheetId: string;
  setActiveSpreadsheet: (id: string) => void;
  updateCell: (coord: string, raw: string, style?: CellStyle) => void;
  createSpreadsheet: (title?: string) => string;
  addSheetToActiveSpreadsheet: (name: string, cells: Record<string, import('../types').CellData>) => string;
  setActiveSheetId: (sheetId: string) => void;
  activeCellCoord: string | null;
  setActiveCellCoord: (coord: string | null) => void;

  // 3. Slides State
  decks: SlideDeckItem[];
  activeDeckId: string;
  activeSlideIndex: number;
  setActiveDeck: (id: string) => void;
  setActiveSlideIndex: (index: number) => void;
  isPresentationMode: boolean;
  setPresentationMode: (active: boolean) => void;
  addSlide: (template?: 'blank' | 'title' | 'two-column' | 'stat') => void;
  duplicateSlide: (index: number) => void;
  deleteSlide: (index: number) => void;
  updateSlideNotes: (notes: string) => void;
  updateSlideBackground: (bg: string) => void;
  updateSlideElement: (slideIndex: number, elementId: string, patch: Partial<SlideElement>) => void;
  updateDeckAspectRatio: (ratio: '16:9' | '4:3') => void;

  // 4. Vault Database State
  tables: VaultTable[];
  activeTableId: string;
  setActiveTable: (id: string) => void;
  addRecord: (tableId: string, record: Record<string, any>) => void;
  deleteRecord: (tableId: string, recordId: string) => void;
  addTable: (name: string, description: string) => void;
  addTableField: (tableId: string, field: TableField) => void;

  // 5. Agenda & Mail State
  events: AgendaEvent[];
  mails: MailMessage[];
  addEvent: (event: Omit<AgendaEvent, 'id'>) => void;
  toggleEventCompleted: (id: string) => void;
  deleteEvent: (id: string) => void;
  markMailRead: (id: string) => void;
  sendMail: (to: string, subject: string, body: string) => void;

  // 6. Security Audit
  securityAudit: SecurityAuditResult;
  runAudit: () => void;

  // 7. Sovereignty, Storage & Global Shortcuts
  persistenceWarning: boolean;
  checkPersistenceQuota: () => void;
  purgeAllStoredData: () => void;
  newFromShortcut: (type: 'doc' | 'sheet' | 'deck') => void;
}

// Initial Clean Slate Data (Zero Emulation / Zero Mock Data)
const INITIAL_DOCS: DocItem[] = [
  {
    id: 'doc-1',
    title: 'Documento 1',
    content: '',
    wordCount: 0,
    charCount: 0,
    readingTimeMin: 0,
    lastModified: Date.now(),
    tags: [],
    isFavorite: false,
  },
];

const INITIAL_SHEETS: SpreadsheetItem[] = [
  {
    id: 'sheet-1',
    title: 'Libro 1',
    activeSheetId: 's1',
    lastModified: Date.now(),
    sheets: [
      {
        id: 's1',
        name: 'Hoja 1',
        rowCount: 40,
        colCount: 20,
        cells: {},
      },
    ],
  },
];

const INITIAL_DECKS: SlideDeckItem[] = [
  {
    id: 'deck-1',
    title: 'Presentación 1',
    aspectRatio: '16:9',
    lastModified: Date.now(),
    slides: [
      {
        id: 'sl-1',
        background: '#0c0e12',
        notes: '',
        elements: [],
      },
    ],
  },
];

const INITIAL_TABLES: VaultTable[] = [];

const INITIAL_EVENTS: AgendaEvent[] = [];

const INITIAL_MAILS: MailMessage[] = [];

const PRO_LICENSE_HASHES = new Set([
  '28e8e57c01b240bcaa33c1de6e2cf8181966af8ec43eff5f696d615a4d8f1772', // APEX-PRO-2026
  'cd6d4fa133df6549b7464f165ca26fe33eee54cd85c752b59f09e99f569f8a2b', // PRO-LIBRE
  '116c440a503ce4d8684e6a4ab65028d473f4b2e952a24a90f81f5d582e56b573', // SOBERANIA-2026
]);

export const useOfficeStore = create<OfficeState>()(
  persist(
    (set, get) => ({
      currentModule: 'writer',
      setModule: (module) => set({ currentModule: module }),
      theme: 'classic',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'classic' ? 'obsidian' : 'classic' })),
      zenMode: false,
      toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      isExportModalOpen: false,
      setExportModalOpen: (open) => set({ isExportModalOpen: open }),
      isSecurityModalOpen: false,
      setSecurityModalOpen: (open) => set({ isSecurityModalOpen: open }),
      isAICopilotOpen: false,
      toggleAICopilot: () => set((state) => ({ isAICopilotOpen: !state.isAICopilotOpen })),
      isMacroIDEOpen: false,
      toggleMacroIDE: () => set((state) => ({ isMacroIDEOpen: !state.isMacroIDEOpen })),
      isTimeMachineOpen: false,
      toggleTimeMachine: () => set((state) => ({ isTimeMachineOpen: !state.isTimeMachineOpen })),
      isPrivacyCenterOpen: false,
      setPrivacyCenterOpen: (open) => set({ isPrivacyCenterOpen: open }),
      togglePrivacyCenter: () => set((state) => ({ isPrivacyCenterOpen: !state.isPrivacyCenterOpen })),
      activePrivacyTab: 'rgpd',
      setActivePrivacyTab: (tab) => set({ activePrivacyTab: tab }),
      isCookieBannerDismissed: false,
      dismissCookieBanner: () => set({ isCookieBannerDismissed: true }),
      resetCookieConsent: () => set({ isCookieBannerDismissed: false }),
      cookiePreferences: {
        technical: true,
        preferences: true,
        analytics: false,
      },
      setCookiePreferences: (prefs) =>
        set((state) => ({
          cookiePreferences: { ...state.cookiePreferences, ...prefs },
        })),

      // Ad Banners & Sponsorship / Pro License Implementation
      showAdBanners: true,
      toggleAdBanners: () => set((state) => ({ showAdBanners: !state.showAdBanners })),
      setShowAdBanners: (show) => set({ showAdBanners: show }),
      adBannerPosition: 'top',
      setAdBannerPosition: (pos) => set({ adBannerPosition: pos }),
      isProLicense: false,
      activateProLicense: (key: string) => {
        const cleaned = key.trim().toUpperCase();
        const hash = sha256Sync(cleaned);
        if (PRO_LICENSE_HASHES.has(hash)) {
          set({ isProLicense: true, showAdBanners: false });
          return true;
        }
        return false;
      },
      isAdManagerOpen: false,
      setAdManagerOpen: (open) => set({ isAdManagerOpen: open }),

      // 1. Writer
      docs: INITIAL_DOCS,
      activeDocId: 'doc-1',
      setActiveDoc: (id) => set({ activeDocId: id }),
      updateDocTitle: (id, title) =>
        set((state) => ({
          docs: state.docs.map((d) => (d.id === id ? { ...d, title, lastModified: Date.now() } : d)),
        })),
      updateDocContent: (id, content) => {
        const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = textOnly ? textOnly.split(' ').length : 0;
        const chars = textOnly.length;
        const readingTime = Math.max(1, Math.ceil(words / 200));

        set((state) => ({
          docs: state.docs.map((d) =>
            d.id === id
              ? {
                  ...d,
                  content,
                  wordCount: words,
                  charCount: chars,
                  readingTimeMin: readingTime,
                  lastModified: Date.now(),
                }
              : d
          ),
        }));
      },
      createDoc: (title) => {
        const newId = `doc-${Date.now()}`;
        const newDoc: DocItem = {
          id: newId,
          title: title || 'Documento sin título',
          content: '<h1>Nuevo Documento</h1><p>Comienza a escribir aquí...</p>',
          wordCount: 5,
          charCount: 35,
          readingTimeMin: 1,
          lastModified: Date.now(),
          tags: ['Borrador'],
        };
        set((state) => ({
          docs: [newDoc, ...state.docs],
          activeDocId: newId,
          currentModule: 'writer',
        }));
        return newId;
      },
  deleteDoc: (id) =>
    set((state) => {
      const remaining = state.docs.filter((d) => d.id !== id);
      return {
        docs: remaining,
        activeDocId: remaining[0]?.id || '',
      };
    }),

  // 2. Calc
  spreadsheets: INITIAL_SHEETS,
  activeSpreadsheetId: 'sheet-1',
  activeCellCoord: 'B2',
  setActiveSpreadsheet: (id) => set({ activeSpreadsheetId: id }),
  setActiveCellCoord: (coord) => set({ activeCellCoord: coord }),
  updateCell: (coord, raw, style) => {
    const { spreadsheets, activeSpreadsheetId } = get();
    const sheetItem = spreadsheets.find((s) => s.id === activeSpreadsheetId);
    if (!sheetItem) return;

    const activeSheet = sheetItem.sheets.find((sh) => sh.id === sheetItem.activeSheetId) || sheetItem.sheets[0];
    if (!activeSheet) return;

    const existing = activeSheet.cells[coord] || { raw: '', computed: '' };
    const updatedRaw = raw !== undefined ? raw : existing.raw;
    const updatedStyle = style ? { ...existing.style, ...style } : existing.style;

    const tempCells = {
      ...activeSheet.cells,
      [coord]: {
        raw: updatedRaw,
        computed: updatedRaw,
        style: updatedStyle,
      },
    };

    // Trigger reactive DAG evaluation
    const recalculated = FormulaEngine.recalculateSheet(tempCells);

    set((state) => ({
      spreadsheets: state.spreadsheets.map((s) =>
        s.id === activeSpreadsheetId
          ? {
              ...s,
              lastModified: Date.now(),
              sheets: s.sheets.map((sh) => (sh.id === activeSheet.id ? { ...sh, cells: recalculated } : sh)),
            }
          : s
      ),
    }));
  },
  createSpreadsheet: (title) => {
    const newId = `sheet-${Date.now()}`;
    const newSheet: SpreadsheetItem = {
      id: newId,
      title: title || 'Hoja de Cálculo sin título',
      activeSheetId: 's1',
      lastModified: Date.now(),
      sheets: [
        {
          id: 's1',
          name: 'Hoja 1',
          rowCount: 30,
          colCount: 15,
          cells: {
            A1: { raw: 'Elemento', computed: 'Elemento', style: { bold: true, bg: '#1f2937' } },
            B1: { raw: 'Valor', computed: 'Valor', style: { bold: true, align: 'right', bg: '#1f2937' } },
            A2: { raw: 'Dato Inicial', computed: 'Dato Inicial' },
            B2: { raw: '100', computed: 100, style: { format: 'number', align: 'right' } },
          },
        },
      ],
    };
    set((state) => ({
      spreadsheets: [newSheet, ...state.spreadsheets],
      activeSpreadsheetId: newId,
      currentModule: 'calc',
    }));
    return newId;
  },
  addSheetToActiveSpreadsheet: (name, cells) => {
    const { spreadsheets, activeSpreadsheetId } = get();
    const sheetItem = spreadsheets.find((s) => s.id === activeSpreadsheetId);
    if (!sheetItem) return '';

    const newSheetId = `sh-${Date.now()}`;
    const newSheet = {
      id: newSheetId,
      name: name || `Hoja ${sheetItem.sheets.length + 1}`,
      rowCount: 35,
      colCount: 15,
      cells: cells || {},
    };

    set((state) => ({
      spreadsheets: state.spreadsheets.map((s) =>
        s.id === activeSpreadsheetId
          ? {
              ...s,
              sheets: [...s.sheets, newSheet],
              activeSheetId: newSheetId,
              lastModified: Date.now(),
            }
          : s
      ),
    }));
    return newSheetId;
  },
  setActiveSheetId: (sheetId) => {
    const { activeSpreadsheetId } = get();
    set((state) => ({
      spreadsheets: state.spreadsheets.map((s) =>
        s.id === activeSpreadsheetId ? { ...s, activeSheetId: sheetId } : s
      ),
    }));
  },

  // 3. Slides
  decks: INITIAL_DECKS,
  activeDeckId: 'deck-1',
  activeSlideIndex: 0,
  isPresentationMode: false,
  setActiveDeck: (id) => set({ activeDeckId: id, activeSlideIndex: 0 }),
  setActiveSlideIndex: (index) => set({ activeSlideIndex: index }),
  setPresentationMode: (active) => set({ isPresentationMode: active }),
  addSlide: (template = 'title') => {
    const { decks, activeDeckId } = get();
    const deck = decks.find((d) => d.id === activeDeckId);
    if (!deck) return;

    let elements: SlideElement[] = [];
    if (template === 'title') {
      elements = [
        {
          id: `el-${Date.now()}-1`,
          type: 'title',
          x: 10,
          y: 28,
          width: 80,
          height: 18,
          content: 'Título de la Ponencia',
          fontSize: 40,
          color: '#ffffff',
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 10,
          y: 50,
          width: 80,
          height: 12,
          content: 'Subtítulo ejecutivo o descripción del proyecto presentado',
          fontSize: 18,
          color: '#94a3b8',
        },
      ];
    } else if (template === 'two-column') {
      elements = [
        {
          id: `el-${Date.now()}-1`,
          type: 'title',
          x: 8,
          y: 12,
          width: 84,
          height: 12,
          content: 'Análisis Comparativo de Soluciones',
          fontSize: 32,
          color: '#ffffff',
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'text',
          x: 8,
          y: 30,
          width: 40,
          height: 40,
          content: 'Columna A: Arquitectura Tradicional basada en nube centralizada con telemetría invasiva y costes recurrentes.',
          fontSize: 14,
          color: '#cbd5e1',
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'text',
          x: 52,
          y: 30,
          width: 40,
          height: 40,
          content: 'Columna B: Apex Suite Zero-Trust con procesamiento WebAssembly local, cifrado soberano y 0 telemetría.',
          fontSize: 14,
          color: '#34d399',
        },
      ];
    } else if (template === 'stat') {
      elements = [
        {
          id: `el-${Date.now()}-1`,
          type: 'title',
          x: 10,
          y: 15,
          width: 80,
          height: 14,
          content: 'Indicadores Clave de Rendimiento',
          fontSize: 32,
          color: '#ffffff',
        },
        {
          id: `el-${Date.now()}-2`,
          type: 'stat',
          x: 12,
          y: 38,
          width: 34,
          height: 25,
          content: '100% Libre',
          subtitle: 'Código abierto verificado sin licencias de pago',
        },
        {
          id: `el-${Date.now()}-3`,
          type: 'stat',
          x: 54,
          y: 38,
          width: 34,
          height: 25,
          content: '0.0ms Cloud',
          subtitle: 'Privacidad absoluta con ejecución local',
        },
      ];
    }

    const newSlide: Slide = {
      id: `sl-${Date.now()}`,
      background: '#0c0e12',
      notes: 'Notas para la diapositiva...',
      elements,
    };

    set((state) => ({
      decks: state.decks.map((d) => (d.id === activeDeckId ? { ...d, lastModified: Date.now(), slides: [...d.slides, newSlide] } : d)),
      activeSlideIndex: deck.slides.length,
    }));
  },
  duplicateSlide: (index) => {
    const { decks, activeDeckId } = get();
    const deck = decks.find((d) => d.id === activeDeckId);
    if (!deck) return;

    const sourceSlide = deck.slides[index];
    if (!sourceSlide) return;

    const clonedSlide: Slide = {
      ...sourceSlide,
      id: `sl-${Date.now()}`,
      elements: sourceSlide.elements.map((el) => ({ ...el, id: `el-${Date.now()}-${Math.random()}` })),
    };

    const newSlides = [...deck.slides];
    newSlides.splice(index + 1, 0, clonedSlide);

    set((state) => ({
      decks: state.decks.map((d) => (d.id === activeDeckId ? { ...d, lastModified: Date.now(), slides: newSlides } : d)),
      activeSlideIndex: index + 1,
    }));
  },
  deleteSlide: (index) => {
    const { decks, activeDeckId, activeSlideIndex } = get();
    const deck = decks.find((d) => d.id === activeDeckId);
    if (!deck || deck.slides.length <= 1) return;

    const remaining = deck.slides.filter((_, i) => i !== index);
    set((state) => ({
      decks: state.decks.map((d) => (d.id === activeDeckId ? { ...d, lastModified: Date.now(), slides: remaining } : d)),
      activeSlideIndex: Math.min(activeSlideIndex, remaining.length - 1),
    }));
  },
  updateSlideNotes: (notes) => {
    const { activeDeckId, activeSlideIndex } = get();
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === activeDeckId
          ? {
              ...d,
              lastModified: Date.now(),
              slides: d.slides.map((sl, idx) => (idx === activeSlideIndex ? { ...sl, notes } : sl)),
            }
          : d
      ),
    }));
  },
  updateSlideBackground: (bg) => {
    const { activeDeckId, activeSlideIndex } = get();
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === activeDeckId
          ? {
              ...d,
              lastModified: Date.now(),
              slides: d.slides.map((sl, idx) => (idx === activeSlideIndex ? { ...sl, background: bg } : sl)),
            }
          : d
      ),
    }));
  },
  updateSlideElement: (slideIndex, elementId, patch) => {
    const { activeDeckId } = get();
    set((state) => ({
      decks: state.decks.map((d) =>
        d.id === activeDeckId
          ? {
              ...d,
              lastModified: Date.now(),
              slides: d.slides.map((sl, sIdx) =>
                sIdx === slideIndex
                  ? {
                      ...sl,
                      elements: sl.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)),
                    }
                  : sl
              ),
            }
          : d
      ),
    }));
  },
  updateDeckAspectRatio: (ratio) => {
    const { activeDeckId } = get();
    set((state) => ({
      decks: state.decks.map((d) => (d.id === activeDeckId ? { ...d, lastModified: Date.now(), aspectRatio: ratio } : d)),
    }));
  },

  // 4. Vault Database
  tables: INITIAL_TABLES,
  activeTableId: '',
  setActiveTable: (id) => set({ activeTableId: id }),
  addRecord: (tableId, record) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, records: [...t.records, { id: `r-${Date.now()}`, ...record }] } : t
      ),
    })),
  deleteRecord: (tableId, recordId) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, records: t.records.filter((r) => r.id !== recordId) } : t
      ),
    })),
  addTable: (name, description) => {
    const newTbl: VaultTable = {
      id: `tbl-${Date.now()}`,
      name: name || 'Nueva Tabla',
      description: description || 'Tabla local de usuario en SQLite WASM',
      fields: [
        { id: 'nombre', name: 'Nombre', type: 'text', required: true },
        { id: 'categoria', name: 'Categoría', type: 'text' },
        { id: 'valor', name: 'Valor Numérico', type: 'number' },
      ],
      records: [],
    };
    set((state) => ({
      tables: [...state.tables, newTbl],
      activeTableId: newTbl.id,
    }));
  },
  addTableField: (tableId, field) => {
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, fields: [...t.fields, field] } : t
      ),
    }));
  },

  // 5. Agenda & Mail
  events: INITIAL_EVENTS,
  mails: INITIAL_MAILS,
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { id: `ev-${Date.now()}`, ...event }],
    })),
  toggleEventCompleted: (id) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)),
    })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
  markMailRead: (id) =>
    set((state) => ({
      mails: state.mails.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    })),
  sendMail: (to, subject, body) =>
    set((state) => ({
      mails: [
        {
          id: `mail-${Date.now()}`,
          from: 'me@apex-suite.local',
          to,
          subject,
          snippet: body.slice(0, 60),
          body,
          date: 'Ahora',
          isRead: true,
          isStarred: false,
          folder: 'sent',
        },
        ...state.mails,
      ],
    })),

  // 6. Security Audit Runner
  securityAudit: {
    passed: true,
    ddeThreatsDetected: 0,
    xxeThreatsDetected: 0,
    hiddenMetadataStripped: 0,
    externalLinksVerified: 0,
    threats: [
      {
        severity: 'info',
        vector: 'Protección Proactiva Zero-Trust',
        description: 'No se detectaron vectores maliciosos. Sandbox WASM y sanitizador de fórmulas activos.',
        actionTaken: 'Workspace 100% verificado y seguro.',
      },
    ],
  },
  runAudit: () => {
    const { docs, activeDocId, spreadsheets, activeSpreadsheetId } = get();
    const doc = docs.find((d) => d.id === activeDocId);
    const sheet = spreadsheets.find((s) => s.id === activeSpreadsheetId);
    const cells = sheet?.sheets[0]?.cells;

    const result = SecuritySanitizer.runAudit({
      docContent: doc?.content,
      sheetCells: cells,
      sheets: sheet?.sheets,
    });
    set({ securityAudit: result });
  },

  // 7. Sovereignty, Storage & Global Shortcuts
  persistenceWarning: false,
  checkPersistenceQuota: () => {
    try {
      const raw = localStorage.getItem('apex-office-state-v1') || '';
      const bytes = new Blob([raw]).size;
      set({ persistenceWarning: bytes > 4.5 * 1024 * 1024 });
    } catch {
      set({ persistenceWarning: false });
    }
  },
  purgeAllStoredData: () => {
    try {
      const key = 'apex-office-state-v1';
      const existing = localStorage.getItem(key);
      if (existing) {
        const len = existing.length;
        localStorage.setItem(key, '0'.repeat(len));
        localStorage.setItem(key, '1'.repeat(len));
        const randomNoise = Array.from({ length: Math.min(len, 1024) }, () =>
          Math.floor(Math.random() * 36).toString(36)
        ).join('');
        localStorage.setItem(key, randomNoise);
        localStorage.removeItem(key);
      }
      localStorage.clear();
    } catch {
      try {
        localStorage.clear();
      } catch {}
    }
  },
  newFromShortcut: (type) => {
    if (type === 'doc') {
      get().createDoc();
    } else if (type === 'sheet') {
      get().createSpreadsheet();
    } else if (type === 'deck') {
      const newId = `deck-${Date.now()}`;
      const newDeck: SlideDeckItem = {
        id: newId,
        title: 'Nueva Presentación',
        aspectRatio: '16:9',
        lastModified: Date.now(),
        slides: [
          {
            id: `sl-${Date.now()}`,
            background: '#0c0e12',
            elements: [
              {
                id: `el-${Date.now()}`,
                type: 'title',
                x: 10,
                y: 35,
                width: 80,
                height: 25,
                content: 'Diapositiva Inicial',
                subtitle: 'Creada mediante atajo de teclado',
                fontSize: 40,
                color: '#f8fafc',
              },
            ],
          },
        ],
      };
      set((state) => ({
        decks: [newDeck, ...state.decks],
        activeDeckId: newId,
        activeSlideIndex: 0,
        currentModule: 'slides',
      }));
    }
  },
    }),
    {
      name: 'apex-office-state-v2',
      partialize: (state) => ({
        currentModule: state.currentModule,
        theme: state.theme,
        zenMode: state.zenMode,
        showAdBanners: state.showAdBanners,
        adBannerPosition: state.adBannerPosition,
        isProLicense: state.isProLicense,
        cookiePreferences: state.cookiePreferences,
        isCookieBannerDismissed: state.isCookieBannerDismissed,
        docs: state.docs,
        activeDocId: state.activeDocId,
        spreadsheets: state.spreadsheets,
        activeSpreadsheetId: state.activeSpreadsheetId,
        activeCellCoord: state.activeCellCoord,
        decks: state.decks,
        activeDeckId: state.activeDeckId,
        activeSlideIndex: state.activeSlideIndex,
        tables: state.tables,
        activeTableId: state.activeTableId,
        events: state.events,
        mails: state.mails,
      }),
    }
  )
);
