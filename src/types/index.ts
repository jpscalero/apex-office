export type OfficeModule = 'writer' | 'calc' | 'slides' | 'vault' | 'agenda' | 'project' | 'pdf' | 'diagram' | 'science' | 'canvas' | 'bi';

export type ThemeMode = 'classic' | 'obsidian' | 'editorial' | 'nord' | 'cyber';

// ==========================================
// 1. APEX WRITER TYPES (WORD REPLACEMENT)
// ==========================================
export interface DocItem {
  id: string;
  title: string;
  content: string; // Rich HTML/Structured Content
  wordCount: number;
  charCount: number;
  readingTimeMin: number;
  lastModified: number | string;
  tags: string[];
  isFavorite?: boolean;
}

// ==========================================
// 2. APEX CALC TYPES (EXCEL REPLACEMENT)
// ==========================================
export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  bg?: string;
  color?: string;
  format?: 'text' | 'number' | 'currency' | 'percent';
}

export interface CellData {
  raw: string; // User input or formula, e.g. "=SUM(A1:A5)" or "1500"
  computed: string | number;
  style?: CellStyle;
}

export interface SheetData {
  id: string;
  name: string;
  cells: Record<string, CellData>; // Keyed by "A1", "B2", etc.
  rowCount: number;
  colCount: number;
}

export interface SpreadsheetItem {
  id: string;
  title: string;
  sheets: SheetData[];
  activeSheetId: string;
  lastModified: number | string;
}

// ==========================================
// 3. APEX SLIDES TYPES (POWERPOINT REPLACEMENT)
// ==========================================
export interface SlideElement {
  id: string;
  type: 'title' | 'text' | 'shape' | 'stat' | 'code' | 'badge';
  x: number; // Percent 0 - 100%
  y: number; // Percent 0 - 100%
  width: number;
  height: number;
  content: string;
  subtitle?: string;
  color?: string;
  bg?: string;
  fontSize?: number;
}

export interface Slide {
  id: string;
  background: string;
  elements: SlideElement[];
  notes?: string;
}

export interface SlideDeckItem {
  id: string;
  title: string;
  aspectRatio: '16:9' | '4:3';
  slides: Slide[];
  lastModified: number | string;
}

// ==========================================
// 4. APEX VAULT TYPES (ACCESS REPLACEMENT)
// ==========================================
export type FieldType = 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'badge';

export interface TableField {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // for badges/selects
}

export interface TableRecord {
  id: string;
  [fieldId: string]: any;
}

export interface VaultTable {
  id: string;
  name: string;
  description: string;
  icon?: string;
  fields: TableField[];
  records: TableRecord[];
}

export interface VaultQuery {
  id: string;
  name: string;
  tableId: string;
  filterField?: string;
  filterOperator?: 'equals' | 'contains' | 'greater' | 'less';
  filterValue?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// ==========================================
// 5. APEX AGENDA & MAIL TYPES (OUTLOOK REPLACEMENT)
// ==========================================
export interface AgendaEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMin: number;
  category: 'meeting' | 'review' | 'deadline' | 'ops' | 'personal';
  description?: string;
  completed?: boolean;
}

export interface MailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive';
}

// ==========================================
// 6. DEFENSIVE SECURITY & PRIVACY TYPES
// ==========================================
export interface SecurityAuditResult {
  passed: boolean;
  ddeThreatsDetected: number;
  xxeThreatsDetected: number;
  hiddenMetadataStripped: number;
  externalLinksVerified: number;
  threats: {
    severity: 'critical' | 'high' | 'medium' | 'info';
    vector: string;
    description: string;
    actionTaken: string;
  }[];
}

// ==========================================
// 7. WINDOWS NATIVE INTEGRATION TYPES
// ==========================================
export interface NativeSaveOptions {
  defaultName?: string;
  content: string;
  filters?: { name: string; extensions: string[] }[];
}

export interface NativeSaveResult {
  canceled: boolean;
  filePath?: string;
  error?: string;
}

export interface NativeOpenOptions {
  filters?: { name: string; extensions: string[] }[];
}

export interface NativeOpenResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
  error?: string;
}

export interface NativeSystemInfo {
  isNative: boolean;
  platform: string;
  arch: string;
  electronVersion: string;
  nodeVersion: string;
  memoryUsageMB: number;
}

export interface ApexNativeApi {
  isNativeWindows: boolean;
  saveFile: (options: NativeSaveOptions) => Promise<NativeSaveResult>;
  openFile: (options: NativeOpenOptions) => Promise<NativeOpenResult>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  getSystemInfo: () => Promise<NativeSystemInfo>;
}

declare global {
  interface Window {
    apexNative?: ApexNativeApi;
  }
}

// ==========================================
// 8. APEX DIAGRAM TYPES (VISIO REPLACEMENT)
// ==========================================
export type DiagramNodeType =
  | 'bpmn-start'
  | 'bpmn-task'
  | 'bpmn-gateway'
  | 'bpmn-end'
  | 'uml-class'
  | 'uml-interface'
  | 'cloud-aws'
  | 'cloud-ec2'
  | 'cloud-s3'
  | 'cloud-k8s'
  | 'cloud-db'
  | 'cloud-postgres'
  | 'flow-process'
  | 'flow-decision'
  | 'flow-terminal'
  | 'decision'
  | 'process';

export interface DiagramNode {
  id: string;
  type: DiagramNodeType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  bg?: string;
  stereotype?: string;
  attributes?: string[];
  methods?: string[];
  description?: string;
  properties?: Record<string, string>;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  style?: 'orthogonal' | 'bezier' | 'straight';
  arrow?: boolean;
  color?: string;
}

export interface DiagramItem {
  id: string;
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  lastModified: number | string;
}

// ==========================================
// 9. APEX SCIENCE TYPES (MATLAB / MATHEMATICA)
// ==========================================
export type CellLanguage = 'python' | 'cas-math' | 'typescript';

export interface NotebookCell {
  id: string;
  language: CellLanguage;
  code: string;
  output?: string;
  outputType?: 'text' | 'latex' | 'plot3d' | 'error';
  executionTimeMs?: number;
  isRunning?: boolean;
}

export interface ScienceNotebookItem {
  id: string;
  title: string;
  cells: NotebookCell[];
  lastModified: number | string;
}

// ==========================================
// 10. APEX SPATIAL CANVAS TYPES (MIRO / FIGMA)
// ==========================================
export interface SpatialStickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  tag?: string;
  cluster?: string;
}

export interface SpatialFrame {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bg?: string;
}

export interface SpatialCanvasItem {
  id: string;
  title: string;
  zoom: number;
  panX: number;
  panY: number;
  stickyNotes: SpatialStickyNote[];
  frames: SpatialFrame[];
  lastModified: number | string;
}

// ==========================================
// 11. APEX DATA WAREHOUSE & BI (POWER BI / TABLEAU)
// ==========================================
export interface BIDataset {
  id: string;
  name: string;
  source: 'csv' | 'parquet' | 'sqlite' | 'duckdb' | 'calc';
  rowCount: number;
  columns: { name: string; type: 'string' | 'number' | 'date' }[];
  sampleData: Record<string, any>[];
}

export interface BIWidget {
  id: string;
  title: string;
  type: 'kpi' | 'bar' | 'donut' | 'scatter' | 'table';
  dimension: string;
  measure: string;
  aggregation: 'SUM' | 'AVG' | 'COUNT' | 'MAX' | 'MIN';
  widthSpan: number; // 1 to 4 columns in grid
}

export interface BIDashboardItem {
  id: string;
  title: string;
  datasetId: string;
  widgets: BIWidget[];
  lastModified: number | string;
}

// ==========================================
// 12. AUTOMATION & MACRO TYPES (PILAR IX)
// ==========================================
export interface MacroScript {
  id: string;
  name: string;
  description: string;
  code: string;
  isSigned: boolean;
  author: string;
  lastExecuted?: string;
}

// ==========================================
// 13. TIME MACHINE & MERKLE TYPES (PILAR XIII)
// ==========================================
export interface DocumentSnapshot {
  id: string;
  timestamp: string;
  hash: string;
  author: string;
  commitMessage: string;
  module: OfficeModule;
  changesSummary: string;
  snapshotData: any;
}

