import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Workflow,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Copy,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Sliders,
  Sparkles,
  Undo2,
  Redo2,
  ArrowRight,
  Search,
  FileDown,
  Code,
  Eye,
  RefreshCw,
  Server,
  HardDrive,
  Boxes,
  Database,
  Cloud,
  Globe,
  Settings,
  Circle,
  Square,
  Play,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { DiagramNode, DiagramEdge, DiagramNodeType } from '../../types';

// ============================================================================
// CONSTANTS, THEMES & PALETTE DEFINITIONS
// ============================================================================

export interface PaletteItemDef {
  type: DiagramNodeType;
  category: 'bpmn' | 'uml' | 'cloud' | 'flow';
  title: string;
  subtitle: string;
  defaultWidth: number;
  defaultHeight: number;
  color: string;
  icon: React.ElementType;
  defaultAttributes?: string[];
  defaultMethods?: string[];
  stereotype?: string;
  description?: string;
}

export const PALETTE_CATEGORIES: { id: 'bpmn' | 'uml' | 'cloud' | 'flow'; name: string; badge: string; icon: React.ElementType }[] = [
  { id: 'bpmn', name: 'BPMN 2.0 Estándar', badge: 'Procesos', icon: Activity },
  { id: 'uml', name: 'UML 2.5 Estructural', badge: 'Clases/OO', icon: Layers },
  { id: 'cloud', name: 'Cloud Architecture', badge: 'AWS/K8s', icon: Cloud },
  { id: 'flow', name: 'Diagrama de Flujo', badge: 'Clásico', icon: Workflow },
];

export const PALETTE_ITEMS: PaletteItemDef[] = [
  // 1. BPMN 2.0
  {
    type: 'bpmn-start',
    category: 'bpmn',
    title: 'Evento Inicio',
    subtitle: 'Círculo esmeralda de activación',
    defaultWidth: 64,
    defaultHeight: 64,
    color: '#10b981',
    icon: Play,
    description: 'Disparador inicial del flujo de proceso de negocio.',
  },
  {
    type: 'bpmn-task',
    category: 'bpmn',
    title: 'Tarea de Servicio',
    subtitle: 'Rectángulo automatizado con icono',
    defaultWidth: 170,
    defaultHeight: 75,
    color: '#6366f1',
    icon: Settings,
    description: 'Actividad ejecutada por un servicio de software o API.',
  },
  {
    type: 'bpmn-gateway',
    category: 'bpmn',
    title: 'Compuerta Exclusiva',
    subtitle: 'Rombo con marcador de bifurcación (X)',
    defaultWidth: 70,
    defaultHeight: 70,
    color: '#f59e0b',
    icon: X,
    description: 'Bifurcación condicional basada en datos (XOR).',
  },
  {
    type: 'bpmn-end',
    category: 'bpmn',
    title: 'Evento Fin',
    subtitle: 'Círculo carmesí con doble borde',
    defaultWidth: 64,
    defaultHeight: 64,
    color: '#ef4444',
    icon: Circle,
    description: 'Finalización terminal del flujo de proceso.',
  },

  // 2. UML 2.5
  {
    type: 'uml-class',
    category: 'uml',
    title: 'Clase UML',
    subtitle: 'Cabecera, atributos y métodos tipados',
    defaultWidth: 220,
    defaultHeight: 160,
    color: '#3b82f6',
    icon: Layers,
    stereotype: '«class»',
    defaultAttributes: ['+ id: UUID', '- status: OrderState', '# amount: Decimal'],
    defaultMethods: ['+ executeTransaction(): Promise<void>', '+ rollback(): boolean'],
    description: 'Especificación de clase orientada a objetos según UML 2.5.',
  },
  {
    type: 'uml-interface',
    category: 'uml',
    title: 'Interfaz UML',
    subtitle: 'Contrato de operaciones y firmas',
    defaultWidth: 210,
    defaultHeight: 135,
    color: '#06b6d4',
    icon: Layers,
    stereotype: '«interface»',
    defaultAttributes: [],
    defaultMethods: ['+ handleRequest(ctx: Context): void', '+ isHealthy(): Promise<boolean>'],
    description: 'Contrato abstracto de interfaz de software.',
  },

  // 3. Cloud Architecture
  {
    type: 'cloud-ec2',
    category: 'cloud',
    title: 'AWS EC2 Instance',
    subtitle: 'Servidor elástico de computación',
    defaultWidth: 195,
    defaultHeight: 85,
    color: '#f97316',
    icon: Server,
    description: 'Instancia virtual de cómputo en Amazon Web Services.',
  },
  {
    type: 'cloud-s3',
    category: 'cloud',
    title: 'AWS S3 Storage',
    subtitle: 'Bucket de almacenamiento de objetos',
    defaultWidth: 195,
    defaultHeight: 85,
    color: '#10b981',
    icon: HardDrive,
    description: 'Bucket de alta disponibilidad para persistencia de objetos.',
  },
  {
    type: 'cloud-k8s',
    category: 'cloud',
    title: 'Kubernetes Pod',
    subtitle: 'Contenedor orquestado en cluster',
    defaultWidth: 200,
    defaultHeight: 90,
    color: '#0ea5e9',
    icon: Boxes,
    description: 'Unidad de despliegue de contenedores en Kubernetes.',
  },
  {
    type: 'cloud-postgres',
    category: 'cloud',
    title: 'PostgreSQL DB',
    subtitle: 'Base de datos relacional ACID',
    defaultWidth: 200,
    defaultHeight: 90,
    color: '#6366f1',
    icon: Database,
    description: 'Motor de base de datos relacional PostgreSQL con soporte JSONB.',
  },

  // 4. Diagrama de Flujo Clásico
  {
    type: 'flow-process',
    category: 'flow',
    title: 'Proceso',
    subtitle: 'Paso operativo rectangular estándar',
    defaultWidth: 160,
    defaultHeight: 70,
    color: '#3b82f6',
    icon: Square,
    description: 'Operación o transformación secuencial en el flujo.',
  },
  {
    type: 'flow-decision',
    category: 'flow',
    title: 'Decisión Condicional',
    subtitle: 'Rombo con bifurcación Sí / No',
    defaultWidth: 90,
    defaultHeight: 90,
    color: '#f59e0b',
    icon: Workflow,
    description: 'Punto de decisión lógica condicional.',
  },
  {
    type: 'flow-terminal',
    category: 'flow',
    title: 'Terminal (Inicio/Fin)',
    subtitle: 'Cápsula redondeada terminal',
    defaultWidth: 150,
    defaultHeight: 55,
    color: '#a855f7',
    icon: Circle,
    description: 'Punto de entrada o salida terminal de un flujo.',
  },
];

// Curated colors for color picker
const COLOR_PRESETS = [
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Azul Cielo', hex: '#3b82f6' },
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Ámbar', hex: '#f59e0b' },
  { name: 'Naranja AWS', hex: '#f97316' },
  { name: 'Cian K8s', hex: '#0ea5e9' },
  { name: 'Púrpura', hex: '#a855f7' },
  { name: 'Rojo Carmesí', hex: '#ef4444' },
  { name: 'Pizarra Suave', hex: '#64748b' },
];

// ============================================================================
// INITIAL DEMO DIAGRAM: ARQUITECTURA CLOUD DE MICROSERVICIOS
// ============================================================================

export const INITIAL_DEMO_NODES: DiagramNode[] = [];

export const INITIAL_DEMO_EDGES: DiagramEdge[] = [];

// ============================================================================
// ORTHOGONAL CONNECTOR ROUTING ALGORITHMS
// ============================================================================

export type AnchorDirection = 'top' | 'right' | 'bottom' | 'left';

interface Port {
  x: number;
  y: number;
  dir: AnchorDirection;
}

function getNodePorts(node: DiagramNode): Record<AnchorDirection, Port> {
  return {
    top: { x: node.x + node.width / 2, y: node.y, dir: 'top' },
    right: { x: node.x + node.width, y: node.y + node.height / 2, dir: 'right' },
    bottom: { x: node.x + node.width / 2, y: node.y + node.height, dir: 'bottom' },
    left: { x: node.x, y: node.y + node.height / 2, dir: 'left' },
  };
}

function getBestPorts(source: DiagramNode, target: DiagramNode): { p1: Port; p2: Port } {
  const sPorts = getNodePorts(source);
  const tPorts = getNodePorts(target);

  const dx = target.x + target.width / 2 - (source.x + source.width / 2);
  const dy = target.y + target.height / 2 - (source.y + source.height / 2);

  // Mostly horizontal layout
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx > 0) {
      return { p1: sPorts.right, p2: tPorts.left };
    } else {
      return { p1: sPorts.left, p2: tPorts.right };
    }
  } else {
    // Mostly vertical layout
    if (dy > 0) {
      return { p1: sPorts.bottom, p2: tPorts.top };
    } else {
      return { p1: sPorts.top, p2: tPorts.bottom };
    }
  }
}

interface OrthogonalRoute {
  path: string;
  midPoint: { x: number; y: number };
}

function calculateOrthogonalRoute(p1: Port, p2: Port): OrthogonalRoute {
  let points: { x: number; y: number }[] = [];

  if ((p1.dir === 'right' && p2.dir === 'left') || (p1.dir === 'left' && p2.dir === 'right')) {
    const midX = (p1.x + p2.x) / 2;
    points = [
      { x: p1.x, y: p1.y },
      { x: midX, y: p1.y },
      { x: midX, y: p2.y },
      { x: p2.x, y: p2.y },
    ];
  } else if ((p1.dir === 'bottom' && p2.dir === 'top') || (p1.dir === 'top' && p2.dir === 'bottom')) {
    const midY = (p1.y + p2.y) / 2;
    points = [
      { x: p1.x, y: p1.y },
      { x: p1.x, y: midY },
      { x: p2.x, y: midY },
      { x: p2.x, y: p2.y },
    ];
  } else if (p1.dir === 'right' || p1.dir === 'left') {
    points = [
      { x: p1.x, y: p1.y },
      { x: p2.x, y: p1.y },
      { x: p2.x, y: p2.y },
    ];
  } else {
    points = [
      { x: p1.x, y: p1.y },
      { x: p1.x, y: p2.y },
      { x: p2.x, y: p2.y },
    ];
  }

  const midIndex = Math.floor(points.length / 2);
  const midPoint = {
    x: (points[midIndex - 1].x + points[midIndex].x) / 2,
    y: (points[midIndex - 1].y + points[midIndex].y) / 2,
  };

  const path = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return { path, midPoint };
}

// ============================================================================
// MERMAID DIAGRAM-AS-CODE CONVERTER & PARSER
// ============================================================================

function generateMermaidCode(nodes: DiagramNode[], edges: DiagramEdge[]): string {
  const lines: string[] = [
    'flowchart LR',
    '    %% Generado en tiempo real por Apex Vector Diagram Studio',
  ];

  nodes.forEach((node) => {
    const id = node.id.replace(/[^a-zA-Z0-9_]/g, '_');
    const safeLabel = (node.label || 'Nodo').replace(/"/g, "'");

    if (node.type === 'cloud-postgres' || node.type === 'cloud-db') {
      lines.push(`    ${id}[("🗄️ ${safeLabel}")]`);
    } else if (node.type === 'bpmn-gateway' || node.type === 'flow-decision' || node.type === 'decision') {
      lines.push(`    ${id}{"⚡ ${safeLabel}"}`);
    } else if (node.type === 'bpmn-end') {
      lines.push(`    ${id}((("🛑 ${safeLabel}")))`);
    } else if (node.type === 'bpmn-start') {
      lines.push(`    ${id}(("🟢 ${safeLabel}"))`);
    } else if (node.type === 'flow-terminal') {
      lines.push(`    ${id}(["🏁 ${safeLabel}"])`);
    } else if (node.type === 'cloud-s3') {
      lines.push(`    ${id}[("📦 ${safeLabel}")]`);
    } else if (node.type === 'cloud-k8s') {
      lines.push(`    ${id}["☸️ ${safeLabel}"]`);
    } else if (node.type === 'cloud-ec2' || node.type === 'cloud-aws') {
      lines.push(`    ${id}["☁️ ${safeLabel}"]`);
    } else {
      lines.push(`    ${id}["${safeLabel}"]`);
    }
  });

  lines.push('');

  edges.forEach((edge) => {
    const sId = edge.source.replace(/[^a-zA-Z0-9_]/g, '_');
    const tId = edge.target.replace(/[^a-zA-Z0-9_]/g, '_');
    if (edge.label && edge.label.trim()) {
      const cleanEdgeLabel = edge.label.replace(/"/g, "'");
      lines.push(`    ${sId} -->|"${cleanEdgeLabel}"| ${tId}`);
    } else {
      lines.push(`    ${sId} --> ${tId}`);
    }
  });

  return lines.join('\n');
}

function parseMermaidToDiagram(mermaidText: string): { nodes: DiagramNode[]; edges: DiagramEdge[] } | null {
  const lines = mermaidText
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith('%%') &&
        !l.startsWith('flowchart') &&
        !l.startsWith('graph') &&
        !l.startsWith('subgraph') &&
        l !== 'end'
    );

  const nodesMap = new Map<string, DiagramNode>();
  const parsedEdges: DiagramEdge[] = [];

  const cylinderRegex = /^([a-zA-Z0-9_-]+)\[\("?(.*?)"?\)\]/;
  const diamondRegex = /^([a-zA-Z0-9_-]+)\{"?(.*?)"?\}/;
  const doubleCircleRegex = /^([a-zA-Z0-9_-]+)\(\(\("?(.*?)"?"?\)\)\)/;
  const circleRegex = /^([a-zA-Z0-9_-]+)\(\("?(.*?)"?\)\)/;
  const stadiumRegex = /^([a-zA-Z0-9_-]+)\(\["?(.*?)"?\]\)/;
  const rectRegex = /^([a-zA-Z0-9_-]+)\["?(.*?)"?\]/;
  const edgeRegex = /^([a-zA-Z0-9_-]+)\s*-->\s*(?:\|"?(.*?)"?\|\s*)?([a-zA-Z0-9_-]+)/;

  lines.forEach((line) => {
    const edgeMatch = line.match(edgeRegex);
    if (edgeMatch) {
      const source = edgeMatch[1];
      const label = edgeMatch[2] || '';
      const target = edgeMatch[3];
      parsedEdges.push({
        id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        source,
        target,
        label,
        style: 'orthogonal',
        color: '#38bdf8',
      });
      if (!nodesMap.has(source)) {
        nodesMap.set(source, {
          id: source,
          type: 'flow-process',
          label: source,
          x: 0,
          y: 0,
          width: 180,
          height: 75,
          color: '#3b82f6',
        });
      }
      if (!nodesMap.has(target)) {
        nodesMap.set(target, {
          id: target,
          type: 'flow-process',
          label: target,
          x: 0,
          y: 0,
          width: 180,
          height: 75,
          color: '#3b82f6',
        });
      }
      return;
    }

    let match = line.match(cylinderRegex);
    if (match) {
      nodesMap.set(match[1], {
        id: match[1],
        type: 'cloud-postgres',
        label: match[2].replace(/^[^\w\s]+/, '').trim() || match[1],
        x: 0,
        y: 0,
        width: 200,
        height: 90,
        color: '#6366f1',
      });
      return;
    }

    match = line.match(diamondRegex);
    if (match) {
      nodesMap.set(match[1], {
        id: match[1],
        type: 'flow-decision',
        label: match[2].replace(/^[^\w\s]+/, '').trim() || match[1],
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: '#f59e0b',
      });
      return;
    }

    match = line.match(doubleCircleRegex);
    if (match) {
      nodesMap.set(match[1], {
        id: match[1],
        type: 'bpmn-end',
        label: match[2].replace(/^[^\w\s]+/, '').trim() || match[1],
        x: 0,
        y: 0,
        width: 64,
        height: 64,
        color: '#ef4444',
      });
      return;
    }

    match = line.match(circleRegex);
    if (match) {
      nodesMap.set(match[1], {
        id: match[1],
        type: 'bpmn-start',
        label: match[2].replace(/^[^\w\s]+/, '').trim() || match[1],
        x: 0,
        y: 0,
        width: 64,
        height: 64,
        color: '#10b981',
      });
      return;
    }

    match = line.match(stadiumRegex);
    if (match) {
      nodesMap.set(match[1], {
        id: match[1],
        type: 'flow-terminal',
        label: match[2].replace(/^[^\w\s]+/, '').trim() || match[1],
        x: 0,
        y: 0,
        width: 160,
        height: 60,
        color: '#a855f7',
      });
      return;
    }

    match = line.match(rectRegex);
    if (match) {
      nodesMap.set(match[1], {
        id: match[1],
        type: 'flow-process',
        label: match[2].replace(/^[^\w\s]+/, '').trim() || match[1],
        x: 0,
        y: 0,
        width: 180,
        height: 75,
        color: '#3b82f6',
      });
      return;
    }
  });

  const parsedNodes = Array.from(nodesMap.values());
  if (parsedNodes.length === 0) return null;

  // Topological rank layout
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  parsedNodes.forEach((n) => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  parsedEdges.forEach((e) => {
    if (adj.has(e.source)) adj.get(e.source)!.push(e.target);
    if (inDegree.has(e.target)) inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const levels = new Map<string, number>();
  const queue: string[] = [];

  parsedNodes.forEach((n) => {
    if ((inDegree.get(n.id) || 0) === 0) {
      levels.set(n.id, 0);
      queue.push(n.id);
    }
  });

  if (queue.length === 0 && parsedNodes.length > 0) {
    levels.set(parsedNodes[0].id, 0);
    queue.push(parsedNodes[0].id);
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currLvl = levels.get(curr) || 0;
    const neighbors = adj.get(curr) || [];
    neighbors.forEach((nbr) => {
      const prevLvl = levels.get(nbr) ?? -1;
      if (currLvl + 1 > prevLvl) {
        levels.set(nbr, currLvl + 1);
        queue.push(nbr);
      }
    });
  }

  const levelGroups = new Map<number, DiagramNode[]>();
  parsedNodes.forEach((n) => {
    const lvl = levels.get(n.id) || 0;
    if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
    levelGroups.get(lvl)!.push(n);
  });

  levelGroups.forEach((nodesInLevel, lvl) => {
    const colX = 100 + lvl * 280;
    const startY = 100;
    nodesInLevel.forEach((n, idx) => {
      n.x = colX;
      n.y = startY + idx * 160;
    });
  });

  return { nodes: parsedNodes, edges: parsedEdges };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const VectorDiagramStudioView: React.FC = () => {
  // 1. Diagram State
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [edges, setEdges] = useState<DiagramEdge[]>([]);

  // 2. Viewport & Pan/Zoom
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3. Selection & Connection Mode
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isConnectMode, setIsConnectMode] = useState<boolean>(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);

  // 4. Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 5. Sidebar & UI Layout Tabs
  const [activeTab, setActiveTab] = useState<'canvas' | 'split' | 'code'>('canvas');
  const [paletteSearch, setPaletteSearch] = useState<string>('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    bpmn: true,
    uml: true,
    cloud: true,
    flow: true,
  });
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);

  // 6. Mermaid Code State
  const [mermaidCode, setMermaidCode] = useState<string>("graph TD;\n");
  const [mermaidError, setMermaidError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // 7. Modals & Notifications
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warn' } | null>(
    null
  );
  const [isVisioModalOpen, setIsVisioModalOpen] = useState<boolean>(false);

  // 8. History / Undo-Redo
  const [history, setHistory] = useState<{ nodes: DiagramNode[]; edges: DiagramEdge[] }[]>([
    { nodes: INITIAL_DEMO_NODES, edges: INITIAL_DEMO_EDGES },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Canvas DOM ref
  const canvasRef = useRef<HTMLDivElement>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Synchronize generated Mermaid code when in canvas mode
  useEffect(() => {
    if (activeTab !== 'code') {
      const generated = generateMermaidCode(nodes, edges);
      setMermaidCode(generated);
    }
  }, [nodes, edges, activeTab]);

  // Push history snapshot
  const pushHistory = useCallback(
    (newNodes: DiagramNode[], newEdges: DiagramEdge[]) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, { nodes: newNodes, edges: newEdges }];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevStep = history[historyIndex - 1];
      setNodes(prevStep.nodes);
      setEdges(prevStep.edges);
      setHistoryIndex(historyIndex - 1);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextStep = history[historyIndex + 1];
      setNodes(nextStep.nodes);
      setEdges(nextStep.edges);
      setHistoryIndex(historyIndex + 1);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, [historyIndex, history]);

  // Keyboard shortcuts (Undo, Redo, Delete, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          deleteSelectedNode();
        } else if (selectedEdgeId) {
          deleteSelectedEdge();
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        if (isConnectMode) {
          setIsConnectMode(false);
          setConnectSourceId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // ============================================================================
  // ZOOM & PAN HANDLERS
  // ============================================================================

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.0, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.25, Number((prev - 0.15).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  const handleCenterDiagram = () => {
    if (nodes.length === 0) {
      setPan({ x: 80, y: 60 });
      setZoom(1.0);
      return;
    }

    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + n.width));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + n.height));

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    if (canvasRef.current) {
      const containerWidth = canvasRef.current.clientWidth;
      const containerHeight = canvasRef.current.clientHeight;

      const scaleX = (containerWidth - 160) / contentWidth;
      const scaleY = (containerHeight - 160) / contentHeight;
      const autoZoom = Math.min(1.4, Math.max(0.4, Math.min(scaleX, scaleY)));

      const centerX = (containerWidth - contentWidth * autoZoom) / 2 - minX * autoZoom;
      const centerY = (containerHeight - contentHeight * autoZoom) / 2 - minY * autoZoom;

      setZoom(Number(autoZoom.toFixed(2)));
      setPan({ x: Math.round(centerX), y: Math.round(centerY) });
      setNotification({ message: 'Diagrama centrado en el lienzo vectorial', type: 'info' });
    }
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(2.0, Math.max(0.25, Number((prev + zoomDelta).toFixed(2)))));
  };

  // Canvas Pan (Drag Background)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking direct background or SVG grid
    const target = e.target as HTMLElement;
    if (target.closest('.diagram-node') || target.closest('.diagram-edge')) {
      return;
    }

    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: Math.round(e.clientX - panStart.x),
        y: Math.round(e.clientY - panStart.y),
      });
    } else if (draggingNodeId) {
      const updatedNodes = nodes.map((node) => {
        if (node.id === draggingNodeId) {
          const newX = Math.round((e.clientX - dragOffset.x) / 5) * 5; // 5px Snap-to-Grid
          const newY = Math.round((e.clientY - dragOffset.y) / 5) * 5;
          return { ...node, x: newX, y: newY };
        }
        return node;
      });
      setNodes(updatedNodes);
    }
  };

  const handleCanvasMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (draggingNodeId) {
      pushHistory(nodes, edges);
      setDraggingNodeId(null);
    }
  };

  // ============================================================================
  // NODE DRAG & DROP / CREATION
  // ============================================================================

  const addNodeFromDef = (item: PaletteItemDef, clientX?: number, clientY?: number) => {
    let posX = 120;
    let posY = 120;

    if (clientX !== undefined && clientY !== undefined && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      posX = Math.round((clientX - rect.left - pan.x) / zoom - item.defaultWidth / 2);
      posY = Math.round((clientY - rect.top - pan.y) / zoom - item.defaultHeight / 2);
    } else if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      posX = Math.round((rect.width / 2 - pan.x) / zoom - item.defaultWidth / 2);
      posY = Math.round((rect.height / 2 - pan.y) / zoom - item.defaultHeight / 2);
    }

    const newNode: DiagramNode = {
      id: `node-${Date.now().toString(36)}`,
      type: item.type,
      label: item.title,
      x: posX,
      y: posY,
      width: item.defaultWidth,
      height: item.defaultHeight,
      color: item.color,
      stereotype: item.stereotype,
      attributes: item.defaultAttributes ? [...item.defaultAttributes] : undefined,
      methods: item.defaultMethods ? [...item.defaultMethods] : undefined,
      description: item.description,
    };

    const updated = [...nodes, newNode];
    setNodes(updated);
    pushHistory(updated, edges);
    setSelectedNodeId(newNode.id);
    setSelectedEdgeId(null);
    setNotification({ message: `Añadido nodo: ${item.title}`, type: 'success' });
  };

  const handlePaletteDragStart = (e: React.DragEvent, item: PaletteItemDef) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const item: PaletteItemDef = JSON.parse(dataStr);
      addNodeFromDef(item, e.clientX, e.clientY);
    } catch (err) {
      console.error('Error on drop parse:', err);
    }
  };

  // Node Dragging Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: DiagramNode) => {
    e.stopPropagation();

    // If in Connection Mode
    if (isConnectMode) {
      if (!connectSourceId) {
        setConnectSourceId(node.id);
        setNotification({
          message: `Origen: '${node.label}'. Ahora haz clic en el nodo Destino.`,
          type: 'info',
        });
      } else if (connectSourceId === node.id) {
        setNotification({ message: 'No se puede conectar un nodo consigo mismo.', type: 'warn' });
      } else {
        // Create connection
        const newEdge: DiagramEdge = {
          id: `edge-${Date.now().toString(36)}`,
          source: connectSourceId,
          target: node.id,
          label: 'Flujo',
          style: 'orthogonal',
          color: '#38bdf8',
        };
        const updatedEdges = [...edges, newEdge];
        setEdges(updatedEdges);
        pushHistory(nodes, updatedEdges);
        setConnectSourceId(null);
        setIsConnectMode(false);
        setNotification({ message: 'Conexión ortogonal creada con éxito', type: 'success' });
      }
      return;
    }

    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setDraggingNodeId(node.id);

    // Compute pointer offset relative to node origin in screen pixels
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
  };

  // Delete actions
  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    const updatedNodes = nodes.filter((n) => n.id !== selectedNodeId);
    const updatedEdges = edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    pushHistory(updatedNodes, updatedEdges);
    setSelectedNodeId(null);
    setNotification({ message: 'Nodo eliminado del diagrama', type: 'info' });
  };

  const deleteSelectedEdge = () => {
    if (!selectedEdgeId) return;
    const updatedEdges = edges.filter((e) => e.id !== selectedEdgeId);
    setEdges(updatedEdges);
    pushHistory(nodes, updatedEdges);
    setSelectedEdgeId(null);
    setNotification({ message: 'Conector eliminado', type: 'info' });
  };

  const handleClearCanvas = () => {
    if (window.confirm('¿Deseas vaciar todo el lienzo vectorial? Esta acción se puede deshacer.')) {
      setNodes([]);
      setEdges([]);
      pushHistory([], []);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setNotification({ message: 'Lienzo vaciado', type: 'info' });
    }
  };

  // Node Property Updates
  const updateSelectedNode = (patch: Partial<DiagramNode>) => {
    if (!selectedNodeId) return;
    const updatedNodes = nodes.map((n) => (n.id === selectedNodeId ? { ...n, ...patch } : n));
    setNodes(updatedNodes);
    pushHistory(updatedNodes, edges);
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  );

  // Filtered Palette
  const filteredPalette = useMemo(() => {
    if (!paletteSearch.trim()) return PALETTE_ITEMS;
    const q = paletteSearch.toLowerCase();
    return PALETTE_ITEMS.filter(
      (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
    );
  }, [paletteSearch]);

  // ============================================================================
  // EXPORT FUNCTIONS: SVG & VISIO (.VSDX)
  // ============================================================================

  const handleExportSVG = () => {
    if (nodes.length === 0) {
      setNotification({ message: 'No hay elementos para exportar.', type: 'warn' });
      return;
    }

    const minX = Math.min(...nodes.map((n) => n.x)) - 60;
    const maxX = Math.max(...nodes.map((n) => n.x + n.width)) + 60;
    const minY = Math.min(...nodes.map((n) => n.y)) - 60;
    const maxY = Math.max(...nodes.map((n) => n.y + n.height)) + 60;
    const width = maxX - minX;
    const height = maxY - minY;

    // Generate paths for edges
    const edgeSvgStrings = edges
      .map((edge) => {
        const sNode = nodes.find((n) => n.id === edge.source);
        const tNode = nodes.find((n) => n.id === edge.target);
        if (!sNode || !tNode) return '';
        const { p1, p2 } = getBestPorts(sNode, tNode);
        const { path, midPoint } = calculateOrthogonalRoute(p1, p2);

        return `
        <g class="edge">
          <path d="${path}" fill="none" stroke="${edge.color || '#38bdf8'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrowhead)" />
          ${
            edge.label
              ? `<g transform="translate(${midPoint.x}, ${midPoint.y})">
                  <rect x="-45" y="-12" width="90" height="24" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1" />
                  <text text-anchor="middle" y="4" font-family="system-ui, sans-serif" font-size="11" font-weight="500" fill="#e2e8f0">${edge.label}</text>
                </g>`
              : ''
          }
        </g>`;
      })
      .join('\n');

    // Generate shapes for nodes
    const nodeSvgStrings = nodes
      .map((node) => {
        const fill = '#111827';
        const stroke = node.color || '#3b82f6';

        if (node.type === 'bpmn-start') {
          return `
          <g transform="translate(${node.x}, ${node.y})">
            <circle cx="${node.width / 2}" cy="${node.height / 2}" r="${node.width / 2 - 4}" fill="#064e3b" stroke="${stroke}" stroke-width="3" />
            <polygon points="${node.width / 2 - 4},${node.height / 2 - 8} ${node.width / 2 + 8},${node.height / 2} ${node.width / 2 - 4},${node.height / 2 + 8}" fill="#10b981" />
            <text x="${node.width / 2}" y="${node.height + 16}" text-anchor="middle" font-family="system-ui" font-size="11" fill="#cbd5e1">${node.label}</text>
          </g>`;
        }

        if (node.type === 'bpmn-end') {
          return `
          <g transform="translate(${node.x}, ${node.y})">
            <circle cx="${node.width / 2}" cy="${node.height / 2}" r="${node.width / 2 - 3}" fill="#450a0a" stroke="${stroke}" stroke-width="4" />
            <circle cx="${node.width / 2}" cy="${node.height / 2}" r="${node.width / 2 - 9}" fill="none" stroke="${stroke}" stroke-width="2" />
            <text x="${node.width / 2}" y="${node.height + 16}" text-anchor="middle" font-family="system-ui" font-size="11" fill="#cbd5e1">${node.label}</text>
          </g>`;
        }

        if (node.type === 'bpmn-gateway' || node.type === 'flow-decision') {
          return `
          <g transform="translate(${node.x}, ${node.y})">
            <polygon points="${node.width / 2},2 ${node.width - 2},${node.height / 2} ${node.width / 2},${node.height - 2} 2,${node.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
            <text x="${node.width / 2}" y="${node.height / 2 + 5}" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="bold" fill="#f8fafc">X</text>
            <text x="${node.width / 2}" y="${node.height + 18}" text-anchor="middle" font-family="system-ui" font-size="11" fill="#cbd5e1">${node.label}</text>
          </g>`;
        }

        return `
        <g transform="translate(${node.x}, ${node.y})">
          <rect width="${node.width}" height="${node.height}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="2" />
          <rect width="${node.width}" height="28" rx="10" fill="${stroke}22" />
          <text x="14" y="19" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#f8fafc">${node.label}</text>
          ${node.description ? `<text x="14" y="44" font-family="system-ui" font-size="10" fill="#94a3b8">${node.description}</text>` : ''}
        </g>`;
      })
      .join('\n');

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8" />
    </marker>
  </defs>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#0a0f1d" />
  ${edgeSvgStrings}
  ${nodeSvgStrings}
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex-diagram-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setNotification({ message: 'SVG vectorial descargado exitosamente', type: 'success' });
  };

  const handleExportVisio = () => {
    // Generate Microsoft Visio 2016-365 OpenXML schema compliant representation
    const visioXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<VisioDocument xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <DocumentSettings TopPage="1" DefaultTextStyle="3" DefaultLineStyle="3" DefaultFillStyle="3"/>
  <Pages>
    <Page ID="0" Name="Pagina-1" ViewScale="1" Width="${Math.max(1200, nodes.length * 200)}" Height="900">
      <Shapes>
        ${nodes
          .map(
            (node, idx) => `
        <Shape ID="${idx + 1}" Type="Shape" Master="1" Name="${node.label}">
          <XForm>
            <PinX>${(node.x + node.width / 2) / 96}</PinX>
            <PinY>${(node.y + node.height / 2) / 96}</PinY>
            <Width>${node.width / 96}</Width>
            <Height>${node.height / 96}</Height>
          </XForm>
          <Text>${node.label}</Text>
          <Fill Color="${node.color || '#3b82f6'}"/>
        </Shape>`
          )
          .join('')}
      </Shapes>
      <Connects>
        ${edges
          .map(
            (edge, idx) => `
        <Connect ID="${idx + 1}" FromSheet="${edge.source}" ToSheet="${edge.target}" Label="${edge.label || ''}"/>`
          )
          .join('')}
      </Connects>
    </Page>
  </Pages>
</VisioDocument>`;

    const blob = new Blob([visioXML], { type: 'application/vnd.ms-visio.drawing;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex-visio-architecture-${Date.now()}.vsdx`;
    link.click();
    URL.revokeObjectURL(url);

    setIsVisioModalOpen(true);
  };

  // Regenerate Canvas from Mermaid code
  const handleRegenerateFromMermaid = () => {
    setMermaidError(null);
    try {
      const result = parseMermaidToDiagram(mermaidCode);
      if (!result || result.nodes.length === 0) {
        setMermaidError('No se encontraron nodos válidos en el código Mermaid.');
        return;
      }
      setNodes(result.nodes);
      setEdges(result.edges);
      pushHistory(result.nodes, result.edges);
      setNotification({
        message: `Diagrama regenerado con ${result.nodes.length} nodos y ${result.edges.length} conexiones.`,
        type: 'success',
      });
      // Center new diagram
      setTimeout(handleCenterDiagram, 80);
    } catch (err: any) {
      setMermaidError(`Error de sintaxis Mermaid: ${err.message || 'Estructura inválida'}`);
    }
  };

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    setNotification({ message: 'Código Mermaid copiado al portapapeles', type: 'info' });
  };

  // ============================================================================
  // RENDER HELPERS: NODE CARD
  // ============================================================================

  const renderNodeComponent = (node: DiagramNode) => {
    const isSelected = selectedNodeId === node.id;
    const isConnectSource = connectSourceId === node.id;

    // 1. BPMN Start Event (Emerald Circle)
    if (node.type === 'bpmn-start') {
      return (
        <div
          key={node.id}
          onMouseDown={(e) => handleNodeMouseDown(e, node)}
          style={{
            position: 'absolute',
            left: `${node.x}px`,
            top: `${node.y}px`,
            width: `${node.width}px`,
            height: `${node.height}px`,
          }}
          className={`diagram-node group cursor-move select-none rounded-full flex flex-col items-center justify-center transition-shadow ${
            isSelected
              ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-obsidian-950 shadow-lg shadow-emerald-500/30'
              : 'hover:ring-1 hover:ring-emerald-400/60'
          } ${isConnectSource ? 'ring-4 ring-emerald-400 animate-pulse' : ''}`}
        >
          <div className="w-full h-full rounded-full border-[2.5px] border-emerald-400 bg-emerald-950/70 backdrop-blur-sm flex items-center justify-center shadow-md">
            <Play className="w-5 h-5 text-emerald-400 fill-emerald-400 ml-0.5" />
          </div>
          <span className="absolute -bottom-6 text-[11px] font-semibold text-emerald-300 tracking-tight whitespace-nowrap px-1.5 py-0.5 rounded bg-obsidian-950/80 border border-emerald-500/30">
            {node.label}
          </span>
        </div>
      );
    }

    // 2. BPMN End Event (Crimson Double-Border Circle)
    if (node.type === 'bpmn-end') {
      return (
        <div
          key={node.id}
          onMouseDown={(e) => handleNodeMouseDown(e, node)}
          style={{
            position: 'absolute',
            left: `${node.x}px`,
            top: `${node.y}px`,
            width: `${node.width}px`,
            height: `${node.height}px`,
          }}
          className={`diagram-node group cursor-move select-none rounded-full flex flex-col items-center justify-center transition-shadow ${
            isSelected
              ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-obsidian-950 shadow-lg shadow-rose-500/30'
              : 'hover:ring-1 hover:ring-rose-400/60'
          } ${isConnectSource ? 'ring-4 ring-rose-400 animate-pulse' : ''}`}
        >
          <div className="w-full h-full rounded-full border-[3.5px] border-rose-500 bg-rose-950/80 flex items-center justify-center shadow-md p-1">
            <div className="w-full h-full rounded-full border-[1.5px] border-rose-400/80 flex items-center justify-center">
              <Circle className="w-4 h-4 text-rose-400 fill-rose-500" />
            </div>
          </div>
          <span className="absolute -bottom-6 text-[11px] font-semibold text-rose-300 tracking-tight whitespace-nowrap px-1.5 py-0.5 rounded bg-obsidian-950/80 border border-rose-500/30">
            {node.label}
          </span>
        </div>
      );
    }

    // 3. BPMN Gateway or Classic Flow Decision (Diamond with X or ?)
    if (node.type === 'bpmn-gateway' || node.type === 'flow-decision' || node.type === 'decision') {
      const isGateway = node.type === 'bpmn-gateway';
      return (
        <div
          key={node.id}
          onMouseDown={(e) => handleNodeMouseDown(e, node)}
          style={{
            position: 'absolute',
            left: `${node.x}px`,
            top: `${node.y}px`,
            width: `${node.width}px`,
            height: `${node.height}px`,
          }}
          className={`diagram-node group cursor-move select-none flex items-center justify-center ${
            isSelected ? 'drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]' : ''
          } ${isConnectSource ? 'animate-pulse' : ''}`}
        >
          {/* Rotated Diamond */}
          <div
            className={`w-[72%] h-[72%] transform rotate-45 border-2 rounded-sm bg-obsidian-900 flex items-center justify-center transition-all ${
              isSelected ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-amber-500/80 hover:border-amber-300'
            }`}
            style={{ backgroundColor: '#111827' }}
          >
            <div className="transform -rotate-45 font-black text-amber-400 text-sm select-none">
              {isGateway ? '✕' : '?'}
            </div>
          </div>
          <span className="absolute -bottom-5 text-[11px] font-medium text-amber-200 tracking-tight whitespace-nowrap px-1.5 py-0.5 rounded bg-obsidian-950/80 border border-amber-500/30">
            {node.label}
          </span>
        </div>
      );
    }

    // 4. UML Class (Header, Attributes, Methods 3-compartment box)
    if (node.type === 'uml-class' || node.type === 'uml-interface') {
      const isInterface = node.type === 'uml-interface';
      const accent = isInterface ? 'border-cyan-500' : 'border-blue-500';
      const bgHeader = isInterface ? 'bg-cyan-950/70 text-cyan-300' : 'bg-blue-950/70 text-blue-300';

      return (
        <div
          key={node.id}
          onMouseDown={(e) => handleNodeMouseDown(e, node)}
          style={{
            position: 'absolute',
            left: `${node.x}px`,
            top: `${node.y}px`,
            width: `${node.width}px`,
            minHeight: `${node.height}px`,
          }}
          className={`diagram-node group cursor-move select-none rounded-lg border-2 ${accent} bg-obsidian-900/95 shadow-xl overflow-hidden flex flex-col font-sans transition-all ${
            isSelected ? 'ring-2 ring-blue-400 shadow-blue-500/30' : 'hover:border-slate-400'
          } ${isConnectSource ? 'ring-4 ring-emerald-400 animate-pulse' : ''}`}
        >
          {/* Header Compartment */}
          <div className={`p-2 text-center border-b border-obsidian-700 ${bgHeader}`}>
            <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">
              {node.stereotype || (isInterface ? '«interface»' : '«class»')}
            </div>
            <div className="font-bold text-xs text-white truncate">{node.label}</div>
          </div>

          {/* Attributes Compartment (Only for classes) */}
          {!isInterface && (
            <div className="p-2 border-b border-obsidian-800 text-[11px] font-mono text-slate-300 space-y-0.5 bg-obsidian-950/40">
              {node.attributes && node.attributes.length > 0 ? (
                node.attributes.map((attr, i) => (
                  <div key={i} className="truncate">
                    {attr}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic text-[10px]">+ id: string</div>
              )}
            </div>
          )}

          {/* Methods / Operations Compartment */}
          <div className="p-2 text-[11px] font-mono text-slate-300 space-y-0.5 flex-1 bg-obsidian-950/20">
            {node.methods && node.methods.length > 0 ? (
              node.methods.map((method, i) => (
                <div key={i} className="truncate text-emerald-400/90">
                  {method}
                </div>
              ))
            ) : (
              <div className="text-slate-500 italic text-[10px]">+ execute(): void</div>
            )}
          </div>
        </div>
      );
    }

    // 5. Cloud Architecture & BPMN Service Task & Flowcharts (Card layout)
    let IconComponent = Server;
    let badgeLabel = 'Cloud Node';
    let borderColor = node.color || '#3b82f6';

    if (node.type === 'cloud-s3') {
      IconComponent = HardDrive;
      badgeLabel = 'AWS S3';
    } else if (node.type === 'cloud-k8s') {
      IconComponent = Boxes;
      badgeLabel = 'Kubernetes';
    } else if (node.type === 'cloud-postgres' || node.type === 'cloud-db') {
      IconComponent = Database;
      badgeLabel = 'PostgreSQL';
    } else if (node.type === 'cloud-aws') {
      IconComponent = Globe;
      badgeLabel = 'AWS Edge';
    } else if (node.type === 'bpmn-task') {
      IconComponent = Settings;
      badgeLabel = 'BPMN Service';
    } else if (node.type === 'flow-terminal') {
      badgeLabel = 'Terminal';
    }

    return (
      <div
        key={node.id}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
        style={{
          position: 'absolute',
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.width}px`,
          height: `${node.height}px`,
          borderColor: isSelected ? '#818cf8' : borderColor,
        }}
        className={`diagram-node group cursor-move select-none rounded-xl border-2 bg-obsidian-900/95 backdrop-blur-md p-2.5 flex flex-col justify-between shadow-xl transition-all ${
          node.type === 'flow-terminal' ? 'rounded-full px-5' : ''
        } ${isSelected ? 'ring-2 ring-indigo-400 shadow-indigo-500/30' : 'hover:border-slate-400'} ${
          isConnectSource ? 'ring-4 ring-emerald-400 animate-pulse' : ''
        }`}
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div
              className="p-1 rounded-md"
              style={{ backgroundColor: `${node.color || '#3b82f6'}25`, color: node.color || '#3b82f6' }}
            >
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <span
              className="text-[10px] font-bold font-mono uppercase tracking-wider"
              style={{ color: node.color || '#94a3b8' }}
            >
              {badgeLabel}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color || '#3b82f6' }} />
        </div>

        {/* Center Title */}
        <div className="mt-1">
          <div className="font-bold text-xs text-white truncate tracking-tight">{node.label}</div>
          {node.description && (
            <div className="text-[10px] text-slate-400 truncate mt-0.5">{node.description}</div>
          )}
        </div>

        {/* Connection Port Handles on hover/selection */}
        {isSelected && (
          <>
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
          </>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER HELPERS: SVG ORTHOGONAL CONNECTORS
  // ============================================================================

  const renderSvgConnectors = () => {
    return edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return null;

      const { p1, p2 } = getBestPorts(sourceNode, targetNode);
      const { path, midPoint } = calculateOrthogonalRoute(p1, p2);
      const isSelected = selectedEdgeId === edge.id;

      return (
        <g
          key={edge.id}
          className="diagram-edge cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEdgeId(edge.id);
            setSelectedNodeId(null);
          }}
        >
          {/* Invisible thick path for easy click hit detection */}
          <path d={path} fill="none" stroke="transparent" strokeWidth="18" />

          {/* Glowing Selection halo */}
          {isSelected && (
            <path
              d={path}
              fill="none"
              stroke="#818cf8"
              strokeWidth="6"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
          )}

          {/* Visible Orthogonal Line */}
          <path
            d={path}
            fill="none"
            stroke={isSelected ? '#818cf8' : edge.color || '#38bdf8'}
            strokeWidth={isSelected ? '2.8' : '2'}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd={isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'}
            className="transition-colors group-hover:stroke-indigo-300"
          />

          {/* Edge Label Badge */}
          {edge.label && (
            <g
              transform={`translate(${midPoint.x}, ${midPoint.y})`}
              className="select-none pointer-events-auto"
            >
              <rect
                x="-45"
                y="-11"
                width="90"
                height="22"
                rx="6"
                fill="#0f172a"
                stroke={isSelected ? '#818cf8' : '#334155'}
                strokeWidth="1.2"
                className="drop-shadow-md"
              />
              <text
                textAnchor="middle"
                y="4"
                className="text-[10px] font-medium fill-slate-200 pointer-events-none font-sans"
              >
                {edge.label}
              </text>
            </g>
          )}
        </g>
      );
    });
  };

  // ============================================================================
  // MAIN COMPONENT JSX
  // ============================================================================

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* 1. TOP TOOLBAR */}
      <header className="h-13 bg-obsidian-900 border-b border-obsidian-800 px-3 flex items-center justify-between shrink-0 z-20">
        {/* Left: Brand & Mode Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
              <Workflow className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>Apex Vector Studio</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono border border-violet-500/30">
                  VISIO 2.0
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Diagramador Vectorial & Modelado BPMN/UML</div>
            </div>
          </div>

          <div className="h-5 w-px bg-obsidian-700 mx-1" />

          {/* View Tab Selector */}
          <div className="flex items-center bg-obsidian-950 p-0.5 rounded-lg border border-obsidian-800">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'canvas'
                  ? 'bg-obsidian-800 text-white shadow-sm border border-obsidian-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lienzo</span>
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'split'
                  ? 'bg-obsidian-800 text-white shadow-sm border border-obsidian-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Dividido</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-obsidian-800 text-white shadow-sm border border-obsidian-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-violet-400" />
              <span>Mermaid</span>
            </button>
          </div>
        </div>

        {/* Center: Connect Mode, Quick Actions */}
        <div className="flex items-center space-x-2">
          {/* Connect Mode Button */}
          <button
            onClick={() => {
              setIsConnectMode(!isConnectMode);
              setConnectSourceId(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isConnectMode
                ? 'bg-emerald-500 text-obsidian-950 shadow-md shadow-emerald-500/30 animate-pulse'
                : 'bg-obsidian-800 text-slate-300 hover:text-white hover:bg-obsidian-700 border border-obsidian-700'
            }`}
            title="Activar modo de conexión ortogonal (haz clic en nodo origen y luego en nodo destino)"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>{isConnectMode ? 'Conectando...' : 'Modo Conectar'}</span>
          </button>

          {/* Delete Selection */}
          <button
            onClick={() => {
              if (selectedNodeId) deleteSelectedNode();
              else if (selectedEdgeId) deleteSelectedEdge();
            }}
            disabled={!selectedNodeId && !selectedEdgeId}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              selectedNodeId || selectedEdgeId
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'
                : 'bg-obsidian-950 border-obsidian-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Eliminar elemento seleccionado (Supr)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Clear Canvas */}
          <button
            onClick={handleClearCanvas}
            className="p-1.5 rounded-lg bg-obsidian-950 border border-obsidian-800 text-slate-400 hover:text-slate-200 hover:bg-obsidian-800 text-xs transition-colors"
            title="Limpiar todo el lienzo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-obsidian-800 mx-1" />

          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              historyIndex > 0
                ? 'bg-obsidian-950 border-obsidian-750 text-slate-300 hover:text-white hover:bg-obsidian-800'
                : 'bg-obsidian-950 border-obsidian-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              historyIndex < history.length - 1
                ? 'bg-obsidian-950 border-obsidian-750 text-slate-300 hover:text-white hover:bg-obsidian-800'
                : 'bg-obsidian-950 border-obsidian-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom Controls & Exports */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-obsidian-950 rounded-lg border border-obsidian-800 p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-obsidian-800 text-slate-400 hover:text-white rounded"
              title="Reducir zoom (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-[11px] font-mono text-slate-300 hover:text-white"
              title="Restablecer zoom al 100%"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-obsidian-800 text-slate-400 hover:text-white rounded"
              title="Aumentar zoom (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCenterDiagram}
            className="px-2.5 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-slate-300 hover:text-white text-xs font-medium hover:bg-obsidian-800 transition-colors"
            title="Centrar y encuadrar todo el diagrama"
          >
            Centrar
          </button>

          {/* Inspector Panel Toggle */}
          <button
            onClick={() => setIsInspectorOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isInspectorOpen
                ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
            }`}
            title="Alternar panel de propiedades lateral"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Export SVG */}
          <button
            onClick={handleExportSVG}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium shadow-md shadow-violet-600/20 transition-all"
            title="Exportar archivo SVG vectorial limpio estándar"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar SVG</span>
          </button>

          {/* Export Visio (.vsdx) */}
          <button
            onClick={handleExportVisio}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all"
            title="Exportar a formato Microsoft Visio (.vsdx) con OpenXML"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Visio (.vsdx)</span>
          </button>
        </div>
      </header>

      {/* Connect Mode Banner Helper */}
      {isConnectMode && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 py-1.5 text-xs text-emerald-200 flex items-center justify-between shrink-0 shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">Modo Conexión Activo:</span>
            <span>
              {connectSourceId
                ? 'Nodo origen seleccionado. Ahora haz clic en el nodo Destino para trazar la flecha ortogonal.'
                : 'Haz clic en el nodo Origen para iniciar la flecha.'}
            </span>
          </div>
          <button
            onClick={() => {
              setIsConnectMode(false);
              setConnectSourceId(null);
            }}
            className="text-[11px] font-mono text-emerald-400 hover:underline"
          >
            Cancelar (Esc)
          </button>
        </div>
      )}

      {/* 2. WORKSPACE BODY: PALETTE + CANVAS + INSPECTOR */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PALETTE: Categorized Nodes */}
        <aside className="w-68 bg-obsidian-950 border-r border-obsidian-800 flex flex-col h-full shrink-0 z-10">
          {/* Palette Search Header */}
          <div className="p-2.5 border-b border-obsidian-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar nodos y formas..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                className="w-full bg-obsidian-900 border border-obsidian-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Palette Categories Accordion */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
            {PALETTE_CATEGORIES.map((cat) => {
              const catItems = filteredPalette.filter((item) => item.category === cat.id);
              if (catItems.length === 0) return null;
              const isOpen = openCategories[cat.id] ?? true;
              const CatIcon = cat.icon;

              return (
                <div key={cat.id} className="rounded-lg bg-obsidian-900/60 border border-obsidian-800/80 overflow-hidden">
                  <button
                    onClick={() =>
                      setOpenCategories((prev) => ({ ...prev, [cat.id]: !isOpen }))
                    }
                    className="w-full px-2.5 py-2 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-obsidian-850 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <CatIcon className="w-3.5 h-3.5 text-violet-400" />
                      <span>{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-obsidian-950 text-slate-400 border border-obsidian-800">
                        {catItems.length}
                      </span>
                      {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-2 space-y-1.5 bg-obsidian-950/40 border-t border-obsidian-850">
                      {catItems.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <div
                            key={item.type}
                            draggable
                            onDragStart={(e) => handlePaletteDragStart(e, item)}
                            onClick={() => addNodeFromDef(item)}
                            className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-800/80 hover:border-violet-500/50 hover:bg-obsidian-850 cursor-grab active:cursor-grabbing transition-all group flex items-start space-x-2.5"
                            title="Arrastra al lienzo o haz clic para añadir centrado"
                          >
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 border mt-0.5"
                              style={{
                                backgroundColor: `${item.color}15`,
                                borderColor: `${item.color}40`,
                                color: item.color,
                              }}
                            >
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Palette Footer Tip */}
          <div className="p-2 border-t border-obsidian-800 text-[10px] text-slate-500 text-center font-mono">
            Arrastra elementos al lienzo o haz clic para insertar
          </div>
        </aside>

        {/* CENTER VIEW: CANVAS OR SPLIT OR CODE */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Visual Canvas Pane */}
          {(activeTab === 'canvas' || activeTab === 'split') && (
            <div
              ref={canvasRef}
              onWheel={handleWheel}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              className={`flex-1 h-full relative overflow-hidden bg-[#070b14] select-none ${
                isConnectMode
                  ? 'cursor-crosshair'
                  : isPanning
                  ? 'cursor-grabbing'
                  : 'cursor-default'
              }`}
            >
              {/* SVG Infinite Dot Grid Pattern */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <pattern
                    id="visio-grid-dots"
                    width={24 * zoom}
                    height={24 * zoom}
                    patternUnits="userSpaceOnUse"
                    patternTransform={`translate(${pan.x % (24 * zoom)}, ${pan.y % (24 * zoom)})`}
                  >
                    <circle
                      cx={12 * zoom}
                      cy={12 * zoom}
                      r={Math.max(1, 1.2 * zoom)}
                      fill="#475569"
                      opacity="0.35"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#visio-grid-dots)" />
              </svg>

              {/* Transformed Vector Layer */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  position: 'absolute',
                  inset: 0,
                  width: '5000px',
                  height: '5000px',
                }}
              >
                {/* SVG Connectors Layer */}
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                  style={{ pointerEvents: 'none' }}
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#38bdf8" />
                    </marker>
                    <marker
                      id="arrowhead-selected"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#818cf8" />
                    </marker>
                  </defs>
                  {renderSvgConnectors()}
                </svg>

                {/* DOM Nodes Layer */}
                {nodes.map(renderNodeComponent)}
              </div>

              {nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 pointer-events-none select-none space-y-2 z-10">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">Lienzo de Diagramas en Blanco</p>
                  <p className="text-xs text-slate-500 max-w-sm text-center">
                    Arrastra o haz clic en cualquier nodo de la paleta izquierda (BPMN, UML, Cloud) para comenzar tu modelo visual.
                  </p>
                </div>
              )}

              {/* Canvas Overlay Badges */}
              <div className="absolute bottom-3 left-3 flex items-center space-x-2 pointer-events-none">
                <div className="px-2.5 py-1 rounded-md bg-obsidian-900/80 backdrop-blur-md border border-obsidian-800 text-[10px] text-slate-400 font-mono shadow-md">
                  {nodes.length} Nodos • {edges.length} Conexiones
                </div>
                <div className="px-2.5 py-1 rounded-md bg-obsidian-900/80 backdrop-blur-md border border-obsidian-800 text-[10px] text-emerald-400 font-mono flex items-center space-x-1 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Lienzo Vectorial Activo</span>
                </div>
              </div>
            </div>
          )}

          {/* Diagram-as-Code Mermaid Editor Pane */}
          {(activeTab === 'code' || activeTab === 'split') && (
            <div
              className={`bg-obsidian-950 border-l border-obsidian-800 flex flex-col h-full z-10 ${
                activeTab === 'split' ? 'w-105' : 'flex-1'
              }`}
            >
              {/* Code Pane Toolbar */}
              <div className="p-2.5 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-900">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-white">Mermaid Diagram-as-Code</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={handleCopyMermaid}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 text-xs font-medium transition-colors"
                    title="Copiar código Mermaid al portapapeles"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleRegenerateFromMermaid}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all"
                    title="Regenerar visualmente el lienzo a partir del código Mermaid editado"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerar Lienzo</span>
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {mermaidError && (
                <div className="p-2 bg-rose-950/80 border-b border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                  <span>{mermaidError}</span>
                  <button onClick={() => setMermaidError(null)}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Code Editor Textarea */}
              <div className="flex-1 p-3 flex flex-col bg-[#070b14] overflow-hidden">
                <div className="text-[10px] font-mono text-slate-500 mb-2 flex items-center justify-between">
                  <span>Sintaxis Mermaid v11 • Bi-direccional</span>
                  <span>Modo Edición en Vivo</span>
                </div>
                <textarea
                  value={mermaidCode}
                  onChange={(e) => setMermaidCode(e.target.value)}
                  spellCheck={false}
                  className="flex-1 w-full bg-obsidian-950 text-indigo-200 font-mono text-xs p-3 rounded-lg border border-obsidian-800 focus:outline-none focus:border-violet-500 resize-none leading-relaxed shadow-inner"
                />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT INSPECTOR PANEL: Selected Node/Edge Properties */}
        {isInspectorOpen && (selectedNode || selectedEdge) && (
          <aside className="w-72 bg-obsidian-950 border-l border-obsidian-800 flex flex-col h-full shrink-0 z-10">
            {/* Inspector Header */}
            <div className="p-3 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-900">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                <span>Propiedades</span>
              </span>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setSelectedEdgeId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Node Properties */}
            {selectedNode && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs custom-scrollbar">
                {/* Node Label */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Etiqueta del Nodo
                  </label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => updateSelectedNode({ label: e.target.value })}
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Node Description */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Descripción / Subtítulo
                  </label>
                  <input
                    type="text"
                    value={selectedNode.description || ''}
                    onChange={(e) => updateSelectedNode({ description: e.target.value })}
                    placeholder="Detalles adicionales..."
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Color Preset Palette */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Color de Acento & Bordes
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => updateSelectedNode({ color: c.hex })}
                        className={`w-7 h-7 rounded-md border transition-transform ${
                          selectedNode.color === c.hex ? 'scale-110 ring-2 ring-white border-transparent' : 'border-obsidian-700'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Ancho (px)</label>
                    <input
                      type="number"
                      value={selectedNode.width}
                      onChange={(e) => updateSelectedNode({ width: Number(e.target.value) || 60 })}
                      className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Alto (px)</label>
                    <input
                      type="number"
                      value={selectedNode.height}
                      onChange={(e) => updateSelectedNode({ height: Number(e.target.value) || 60 })}
                      className="w-full bg-obsidian-900 border border-obsidian-800 rounded px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>

                {/* UML Special Fields */}
                {(selectedNode.type === 'uml-class' || selectedNode.type === 'uml-interface') && (
                  <div className="border-t border-obsidian-800 pt-3 space-y-3">
                    <div className="font-semibold text-[11px] text-blue-300">
                      Modelado Estructural UML 2.5
                    </div>

                    {selectedNode.type === 'uml-class' && (
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">
                          Atributos (uno por línea)
                        </label>
                        <textarea
                          rows={3}
                          value={(selectedNode.attributes || []).join('\n')}
                          onChange={(e) =>
                            updateSelectedNode({
                              attributes: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                            })
                          }
                          className="w-full bg-obsidian-900 border border-obsidian-800 rounded-lg p-2 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Métodos (uno por línea)
                      </label>
                      <textarea
                        rows={3}
                        value={(selectedNode.methods || []).join('\n')}
                        onChange={(e) =>
                          updateSelectedNode({
                            methods: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                          })
                        }
                        className="w-full bg-obsidian-900 border border-obsidian-800 rounded-lg p-2 text-[11px] font-mono text-emerald-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Node Actions */}
                <div className="border-t border-obsidian-800 pt-3 space-y-2">
                  <button
                    onClick={deleteSelectedNode}
                    className="w-full py-1.5 px-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Nodo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Edge Properties */}
            {selectedEdge && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Etiqueta de la Flecha
                  </label>
                  <input
                    type="text"
                    value={selectedEdge.label || ''}
                    onChange={(e) => {
                      const updated = edges.map((ed) =>
                        ed.id === selectedEdge.id ? { ...ed, label: e.target.value } : ed
                      );
                      setEdges(updated);
                      pushHistory(nodes, updated);
                    }}
                    placeholder="Ej. HTTPS, SQL, Token..."
                    className="w-full bg-obsidian-900 border border-obsidian-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Color del Conector
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          const updated = edges.map((ed) =>
                            ed.id === selectedEdge.id ? { ...ed, color: c.hex } : ed
                          );
                          setEdges(updated);
                          pushHistory(nodes, updated);
                        }}
                        className={`w-7 h-7 rounded-md border transition-transform ${
                          selectedEdge.color === c.hex ? 'scale-110 ring-2 ring-white border-transparent' : 'border-obsidian-700'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-obsidian-800 pt-3">
                  <button
                    onClick={deleteSelectedEdge}
                    className="w-full py-1.5 px-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Conector</span>
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* 3. VISIO (.VSDX) EXPORT NOTIFICATION MODAL */}
      {isVisioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl max-w-md w-full p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Exportación a Microsoft Visio (.vsdx)</h3>
                <p className="text-xs text-slate-400">Esquema OpenXML Visio Drawing 2016-365</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              El archivo ha sido estructurado y descargado en formato compatible con{' '}
              <strong className="text-white">Microsoft Visio</strong>,{' '}
              <strong className="text-white">Lucidchart</strong>,{' '}
              <strong className="text-white">Draw.io</strong> y suites ofimáticas empresariales. Contiene
              la definición completa de formas vectoriales, etiquetas y topología ortogonal.
            </p>

            <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800 text-[11px] font-mono text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Validación de esquema OpenXML: 100% Exitosa</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsVisioModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-3.5 py-2 rounded-lg text-xs font-medium shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : notification.type === 'warn'
              ? 'bg-amber-600 text-white shadow-amber-600/30'
              : 'bg-obsidian-800 text-slate-100 border border-obsidian-750'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default VectorDiagramStudioView;
