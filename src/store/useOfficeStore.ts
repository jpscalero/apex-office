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

// Initial Data
const INITIAL_DOCS: DocItem[] = [
  {
    id: 'doc-1',
    title: 'Estatuto de Seguridad & Arquitectura de Software v2.4',
    content: `<h1>Estatuto de Seguridad & Arquitectura de Software</h1>
<p>Este documento define las directrices y estándares de desarrollo para la nueva infraestructura tecnológica de <strong>Apex Suite</strong>. El objetivo prioritario es garantizar la integridad del código, erradicar dependencias vulnerables y establecer un modelo de confianza cero (Zero-Trust).</p>

<h2>1. Directivas de Protección en Hojas de Cálculo</h2>
<p>Queda terminantemente prohibida la ejecución de comandos dinámicos mediante <code>DDE (Dynamic Data Exchange)</code>. Todo archivo CSV importado se procesará bajo la directiva de texto plano estricto para neutralizar vectores de inyección de fórmulas (CWE-1236).</p>

<h2>2. Sandboxing de Automatizaciones</h2>
<p>Las macros tradicionales en Visual Basic for Applications (VBA) han sido reemplazadas por un motor de extensiones en <strong>WebAssembly (WASM)</strong>. Los scripts de usuario se ejecutan en un espacio de memoria aislado sin acceso al sistema de archivos local ni a llamadas de red no autorizadas.</p>

<h2>3. Privacidad y Eliminación de Metadatos</h2>
<p>Antes de la publicación de cualquier entregable en formato digital, el módulo <em>Privacy Stripper</em> purgará automáticamente los identificadores de máquina (RSID), rutas de red UNC y el historial de cambios oculto.</p>`,
    wordCount: 178,
    charCount: 1240,
    readingTimeMin: 1,
    lastModified: Date.now() - 3600 * 1000 * 2,
    tags: ['Seguridad', 'Arquitectura', 'Oficial'],
    isFavorite: true,
  },
  {
    id: 'doc-2',
    title: 'Informe Trimestral de Rendimiento y Balance Q4',
    content: `<h1>Resumen Ejecutivo de Rendimiento</h1>
<p>Durante el último trimestre, la migración de microservicios hacia contenedores ligeros ha reducido el tiempo de respuesta P99 en un <strong>64%</strong>. A continuación se presentan las conclusiones del análisis operativo.</p>
<p>Los costes de infraestructura en servidores dedicados se redujeron de forma sustancial gracias a la optimización de cachés distribuidas.</p>`,
    wordCount: 54,
    charCount: 380,
    readingTimeMin: 1,
    lastModified: Date.now() - 86400 * 1000 * 1,
    tags: ['Finanzas', 'Q4'],
  },
];

const INITIAL_SHEETS: SpreadsheetItem[] = [
  {
    id: 'sheet-1',
    title: 'Presupuesto Financiero & Balance de Operaciones',
    activeSheetId: 's1',
    lastModified: Date.now() - 3600 * 1000 * 1.5,
    sheets: [
      {
        id: 's1',
        name: 'Presupuesto Anual',
        rowCount: 30,
        colCount: 15,
        cells: {
          A1: { raw: 'CONCEPTO / PARTIDA', computed: 'CONCEPTO / PARTIDA', style: { bold: true, bg: '#1f2937' } },
          B1: { raw: 'TRIMESTRE 1', computed: 'TRIMESTRE 1', style: { bold: true, align: 'right', bg: '#1f2937' } },
          C1: { raw: 'TRIMESTRE 2', computed: 'TRIMESTRE 2', style: { bold: true, align: 'right', bg: '#1f2937' } },
          D1: { raw: 'TRIMESTRE 3', computed: 'TRIMESTRE 3', style: { bold: true, align: 'right', bg: '#1f2937' } },
          E1: { raw: 'TOTAL ANUAL', computed: 'TOTAL ANUAL', style: { bold: true, align: 'right', bg: '#374151' } },

          A2: { raw: 'Infraestructura Cloud & Servidores', computed: 'Infraestructura Cloud & Servidores' },
          B2: { raw: '14500', computed: 14500, style: { format: 'currency', align: 'right' } },
          C2: { raw: '16200', computed: 16200, style: { format: 'currency', align: 'right' } },
          D2: { raw: '15800', computed: 15800, style: { format: 'currency', align: 'right' } },
          E2: { raw: '=SUM(B2:D2)', computed: 46500, style: { format: 'currency', bold: true, align: 'right', color: '#10b981' } },

          A3: { raw: 'Licencias de Software & DevOps', computed: 'Licencias de Software & DevOps' },
          B3: { raw: '8400', computed: 8400, style: { format: 'currency', align: 'right' } },
          C3: { raw: '8900', computed: 8900, style: { format: 'currency', align: 'right' } },
          D3: { raw: '9200', computed: 9200, style: { format: 'currency', align: 'right' } },
          E3: { raw: '=SUM(B3:D3)', computed: 26500, style: { format: 'currency', bold: true, align: 'right', color: '#10b981' } },

          A4: { raw: 'Ciberseguridad & Auditorías Externas', computed: 'Ciberseguridad & Auditorías Externas' },
          B4: { raw: '12000', computed: 12000, style: { format: 'currency', align: 'right' } },
          C4: { raw: '6500', computed: 6500, style: { format: 'currency', align: 'right' } },
          D4: { raw: '14200', computed: 14200, style: { format: 'currency', align: 'right' } },
          E4: { raw: '=SUM(B4:D4)', computed: 32700, style: { format: 'currency', bold: true, align: 'right', color: '#10b981' } },

          A5: { raw: 'TOTAL GASTOS OPERATIVOS', computed: 'TOTAL GASTOS OPERATIVOS', style: { bold: true, bg: '#111827' } },
          B5: { raw: '=SUM(B2:B4)', computed: 34900, style: { format: 'currency', bold: true, align: 'right' } },
          C5: { raw: '=SUM(C2:C4)', computed: 31600, style: { format: 'currency', bold: true, align: 'right' } },
          D5: { raw: '=SUM(D2:D4)', computed: 39200, style: { format: 'currency', bold: true, align: 'right' } },
          E5: { raw: '=SUM(E2:E4)', computed: 105700, style: { format: 'currency', bold: true, align: 'right', color: '#38bdf8' } },

          A7: { raw: 'PROMEDIO TRIMESTRAL', computed: 'PROMEDIO TRIMESTRAL', style: { italic: true } },
          B7: { raw: '=AVERAGE(B5:D5)', computed: 35233.33, style: { format: 'currency', align: 'right' } },
        },
      },
    ],
  },
];

const INITIAL_DECKS: SlideDeckItem[] = [
  {
    id: 'deck-1',
    title: 'Apex Suite • Presentación de Producto y Estrategia Q4',
    aspectRatio: '16:9',
    lastModified: Date.now() - 3600 * 1000 * 3,
    slides: [
      {
        id: 'sl-1',
        background: '#0c0e12',
        notes: 'Bienvenida al equipo. Enfatizar la velocidad de carga de 280ms y la erradicación del Ribbon saturado.',
        elements: [
          {
            id: 'el-1',
            type: 'badge',
            x: 10,
            y: 18,
            width: 25,
            height: 6,
            content: 'NUEVA GENERACIÓN OPEN SOURCE',
            bg: '#3b82f6',
            color: '#ffffff',
          },
          {
            id: 'el-2',
            type: 'title',
            x: 10,
            y: 28,
            width: 80,
            height: 20,
            content: 'Apex Office Suite',
            subtitle: 'La suite ofimática ultra-ligera, segura y modular diseñada para el futuro.',
            fontSize: 48,
            color: '#f8fafc',
          },
          {
            id: 'el-3',
            type: 'stat',
            x: 10,
            y: 62,
            width: 24,
            height: 22,
            content: '< 280 ms',
            subtitle: 'Arranque en frío (Cold Start)',
            color: '#10b981',
          },
          {
            id: 'el-4',
            type: 'stat',
            x: 38,
            y: 62,
            width: 24,
            height: 22,
            content: '45 MB',
            subtitle: 'Consumo de RAM en reposo',
            color: '#38bdf8',
          },
          {
            id: 'el-5',
            type: 'stat',
            x: 66,
            y: 62,
            width: 24,
            height: 22,
            content: '0 DDE',
            subtitle: 'Inmunidad a inyección de código',
            color: '#f43f5e',
          },
        ],
      },
      {
        id: 'sl-2',
        background: '#0c0e12',
        notes: 'Detallar los 5 módulos integrados: Writer, Calc, Slides, DataVault y Agenda.',
        elements: [
          {
            id: 'el-20',
            type: 'title',
            x: 10,
            y: 12,
            width: 80,
            height: 15,
            content: 'Los 5 Pilares de Apex Suite',
            subtitle: 'Una sola aplicación unificada sin silos tecnológicos ni macros vulnerables.',
            fontSize: 32,
            color: '#f8fafc',
          },
          {
            id: 'el-21',
            type: 'shape',
            x: 10,
            y: 35,
            width: 38,
            height: 25,
            content: '📝 Apex Writer',
            subtitle: 'Motor de texto enriquecido con paginación real A4 y exportación PDF/DOCX limpia.',
            bg: '#161a22',
          },
          {
            id: 'el-22',
            type: 'shape',
            x: 52,
            y: 35,
            width: 38,
            height: 25,
            content: '📊 Apex Calc',
            subtitle: 'Hoja de cálculo con grafo DAG reactivo y ordenación topológica instantánea.',
            bg: '#161a22',
          },
          {
            id: 'el-23',
            type: 'shape',
            x: 10,
            y: 65,
            width: 38,
            height: 25,
            content: '🗄️ Apex DataVault',
            subtitle: 'Base de datos relacional SQLite WASM local de alta velocidad (Rival de Access).',
            bg: '#161a22',
          },
          {
            id: 'el-24',
            type: 'shape',
            x: 52,
            y: 65,
            width: 38,
            height: 25,
            content: '📅 Apex Agenda & Mail',
            subtitle: 'Organizador de tareas, reuniones y comunicaciones sin telemetría corporativa.',
            bg: '#161a22',
          },
        ],
      },
    ],
  },
];

const INITIAL_TABLES: VaultTable[] = [
  {
    id: 'tbl-1',
    name: 'Inventario de Servidores & Activos',
    description: 'Registro de infraestructura de producción, latencias y sistemas operativos asignados.',
    icon: 'Server',
    fields: [
      { id: 'f-hostname', name: 'Hostname', type: 'text', required: true },
      { id: 'f-ip', name: 'Dirección IP', type: 'text', required: true },
      { id: 'f-role', name: 'Rol Primario', type: 'badge', options: ['Gateway API', 'Database Primary', 'Edge Cache', 'Worker Node'] },
      { id: 'f-ram', name: 'RAM (GB)', type: 'number' },
      { id: 'f-status', name: 'Estado Operativo', type: 'badge', options: ['Activo', 'Mantenimiento', 'Backup'] },
      { id: 'f-active', name: 'Cifrado E2EE', type: 'boolean' },
    ],
    records: [
      { id: 'r-1', 'f-hostname': 'srv-frankfurt-01', 'f-ip': '10.0.12.4', 'f-role': 'Gateway API', 'f-ram': 64, 'f-status': 'Activo', 'f-active': true },
      { id: 'r-2', 'f-hostname': 'db-cluster-master', 'f-ip': '10.0.15.2', 'f-role': 'Database Primary', 'f-ram': 256, 'f-status': 'Activo', 'f-active': true },
      { id: 'r-3', 'f-hostname': 'edge-cache-madrid', 'f-ip': '10.0.18.9', 'f-role': 'Edge Cache', 'f-ram': 32, 'f-status': 'Activo', 'f-active': true },
      { id: 'r-4', 'f-hostname': 'worker-batch-gpu', 'f-ip': '10.0.22.7', 'f-role': 'Worker Node', 'f-ram': 128, 'f-status': 'Mantenimiento', 'f-active': false },
    ],
  },
];

const INITIAL_EVENTS: AgendaEvent[] = [
  {
    id: 'ev-1',
    title: 'Revisión de Arquitectura del Motor Calc (DAG)',
    date: '2026-10-14',
    time: '14:30',
    durationMin: 45,
    category: 'ops',
    description: 'Comprobar el benchmark del algoritmo de Kahn para 500.000 celdas reactivas.',
    completed: true,
  },
  {
    id: 'ev-2',
    title: 'Auditoría de Penetración y Sanitizador DDE',
    date: '2026-10-14',
    time: '16:00',
    durationMin: 60,
    category: 'review',
    description: 'Verificar el bloqueo de inyección en archivos CSV y deconstrucción de macros.',
    completed: false,
  },
  {
    id: 'ev-3',
    title: 'Entrega de Release Candidate v1.0 Apex Suite',
    date: '2026-10-15',
    time: '10:00',
    durationMin: 30,
    category: 'deadline',
    description: 'Generación del binario compilado y verificación en entorno local.',
    completed: false,
  },
];

const INITIAL_MAILS: MailMessage[] = [
  {
    id: 'mail-1',
    from: 'security@apex-suite.org',
    to: 'dev-team@apex-suite.org',
    subject: 'Reporte de Auditoría: Zero-Trust y Sandbox WASM Verificados',
    snippet: 'Se ha completado con éxito la validación del parser XML sin DTDs externas...',
    body: `Estimado equipo,

Confirmamos que todos los vectores de ataque analizados (inyección de fórmulas DDE, bombas ZIP y fuga de rutas UNC) han sido neutralizados de forma permanente en la capa de deserialización.

El módulo Privacy Stripper está listo para producción.

Saludos cordiales,
Equipo de Seguridad Ofensiva`,
    date: '10:24',
    isRead: false,
    isStarred: true,
    folder: 'inbox',
  },
  {
    id: 'mail-2',
    from: 'performance@apex-suite.org',
    to: 'dev-team@apex-suite.org',
    subject: 'Métricas de Arranque: <280ms en Windows 11',
    snippet: 'Los tests de Cold Start han batido todos los récords anteriores...',
    body: `El empaquetado optimizado mediante Webview2 nativa y eliminación de VSTO y COM pesadas sitúa a Apex Suite como la más rápida del mercado.`,
    date: 'Ayer',
    isRead: true,
    isStarred: false,
    folder: 'inbox',
  },
];

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
  activeTableId: 'tbl-1',
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
      records: [
        { id: 'r-1', nombre: 'Elemento Alfa', categoria: 'General', valor: 150 },
      ],
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
      name: 'apex-office-state-v1',
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
