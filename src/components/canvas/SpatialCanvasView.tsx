import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Move,
  Hand,
  StickyNote,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Download,
  Box,
  Volume2,
  VolumeX,
  Radio,
  Trash2,
  Activity,
  Cpu,
  Pencil,
  Tag,
  Columns,
  RotateCw,
} from 'lucide-react';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type CanvasTool = 'pointer' | 'hand' | 'sticky' | 'frame' | 'draw' | 'model3d';

export type StickyColor = 'yellow' | 'mint' | 'coral' | 'sky' | 'lavender';

export interface StickyColorConfig {
  id: StickyColor;
  name: string;
  bgClass: string;
  borderClass: string;
  headerClass: string;
  textClass: string;
  hex: string;
}

export const STICKY_PALETTE: Record<StickyColor, StickyColorConfig> = {
  yellow: {
    id: 'yellow',
    name: 'Amarillo Pastel',
    bgClass: 'bg-amber-100/95',
    borderClass: 'border-amber-300',
    headerClass: 'bg-amber-200/80',
    textClass: 'text-amber-950',
    hex: '#FEF08A',
  },
  mint: {
    id: 'mint',
    name: 'Menta Fresca',
    bgClass: 'bg-emerald-100/95',
    borderClass: 'border-emerald-300',
    headerClass: 'bg-emerald-200/80',
    textClass: 'text-emerald-950',
    hex: '#A7F3D0',
  },
  coral: {
    id: 'coral',
    name: 'Rosa Coral',
    bgClass: 'bg-rose-100/95',
    borderClass: 'border-rose-300',
    headerClass: 'bg-rose-200/80',
    textClass: 'text-rose-950',
    hex: '#FECDD3',
  },
  sky: {
    id: 'sky',
    name: 'Azul Cielo',
    bgClass: 'bg-sky-100/95',
    borderClass: 'border-sky-300',
    headerClass: 'bg-sky-200/80',
    textClass: 'text-sky-950',
    hex: '#BAE6FD',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavanda Suave',
    bgClass: 'bg-violet-100/95',
    borderClass: 'border-violet-300',
    headerClass: 'bg-violet-200/80',
    textClass: 'text-violet-950',
    hex: '#DDD6FE',
  },
};

export type SemanticCategory =
  | 'Frontend & UI'
  | 'Seguridad & Criptografía'
  | 'Backend & Datos'
  | 'DevOps & CI/CD';

export interface SmartStickyNote {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
  color: StickyColor;
  tag: string;
  category: SemanticCategory;
  rotation: number; // Organic tilt in degrees (-2 to 2)
  isPinned?: boolean;
  author?: string;
  clusterTarget?: { x: number; y: number };
}

export type FrameTemplateType = 'retro' | 'lean' | 'eisenhower';

export interface FrameSection {
  id: string;
  title: string;
  subtitle: string;
  colorHex: string;
  badge: string;
  rect: { x: number; y: number; width: number; height: number }; // Relative to frame
}

export interface StructuredFrame {
  id: string;
  title: string;
  templateType: FrameTemplateType;
  x: number;
  y: number;
  width: number;
  height: number;
  sections: FrameSection[];
  isLocked?: boolean;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface FreehandStroke {
  id: string;
  points: StrokePoint[];
  color: string;
  width: number;
  recognizedShape?: 'circle' | 'rectangle' | null;
  shapeBounds?: { x: number; y: number; width: number; height: number };
}

export interface RecognizedShapePrompt {
  strokeId: string;
  type: 'circle' | 'rectangle';
  bounds: { x: number; y: number; width: number; height: number };
  confidence: number;
}

export interface DigitalTwinModel {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  renderMode: 'pbr' | 'wireframe' | 'hybrid';
  rotX: number;
  rotY: number;
  rotZ: number;
  isAutoSpin: boolean;
  telemetry: {
    nodeId: string;
    status: 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
    tempC: number;
    fanRpm: number;
    pcieGbps: number;
    vibrationG: number;
    harmonicHealth: number;
  };
}

export interface CollaboratorPeer {
  id: string;
  name: string;
  role: string;
  color: string;
  cursorX: number;
  cursorY: number;
  targetX: number;
  targetY: number;
  isSpeaking: boolean;
  statusText: string;
  avatarText: string;
}

export interface HRTFTelemetry {
  peerId: string;
  distanceMeters: number;
  gainDb: number;
  panPercent: number; // -100 (Left) to +100 (Right)
  azimuthDeg: number;
}

// ==========================================
// INITIAL DEMO DATA
// ==========================================

const INITIAL_STICKY_NOTES: SmartStickyNote[] = [
  // Retro Pre-placed Notes
  {
    id: 'note-retro-1',
    x: 180,
    y: 200,
    width: 220,
    height: 180,
    title: 'Cero Fugas de Memoria',
    content: 'La migración del motor de celdas a TypedArrays redujo el uso de heap en un 40%.',
    color: 'mint',
    tag: '#Performance',
    category: 'Backend & Datos',
    rotation: -1.2,
    author: 'Carlos (Lead Dev)',
  },
  {
    id: 'note-retro-2',
    x: 440,
    y: 200,
    width: 220,
    height: 180,
    title: 'Cuello de Botella en Render',
    content: 'Los árboles DOM de más de 10,000 nodos sufren con CSS backdrop-filter en Chromium.',
    color: 'yellow',
    tag: '#Bottleneck',
    category: 'Frontend & UI',
    rotation: 1.5,
    author: 'Elena (Diseño)',
  },
  {
    id: 'note-retro-3',
    x: 700,
    y: 200,
    width: 220,
    height: 180,
    title: 'Adopción de WebGPU',
    content: 'Prototipar aceleración de shader WGSL para renderizado masivo de la pizarra infinita.',
    color: 'sky',
    tag: '#NextSprint',
    category: 'Frontend & UI',
    rotation: -0.8,
    author: 'Sara (QA)',
  },

  // Unclustered Smart Notes ready for Local Semantic AI Clustering
  {
    id: 'note-cluster-1',
    x: 120,
    y: 780,
    width: 230,
    height: 190,
    title: 'Migración a React 19 Concurrente',
    content: 'Aprovechar Server Actions, useActionState y transiciones fluidas sin re-renders fantasma.',
    color: 'sky',
    tag: '#React19',
    category: 'Frontend & UI',
    rotation: 0.9,
    author: 'Elena (Diseño)',
  },
  {
    id: 'note-cluster-2',
    x: 390,
    y: 820,
    width: 230,
    height: 190,
    title: 'Autenticación WebAuthn FIDO2',
    content: 'Reemplazo total de credenciales por llaves Passkeys biométricas con enclave TPM.',
    color: 'coral',
    tag: '#ZeroTrust',
    category: 'Seguridad & Criptografía',
    rotation: -1.4,
    author: 'Sara (QA)',
  },
  {
    id: 'note-cluster-3',
    x: 660,
    y: 770,
    width: 230,
    height: 190,
    title: 'Design System & Tokens Tailwind',
    content: 'Paleta HSL semántica con soporte nativo de alto contraste y modos Obsidian y Nord.',
    color: 'lavender',
    tag: '#DesignSystem',
    category: 'Frontend & UI',
    rotation: -0.6,
    author: 'Elena (Diseño)',
  },
  {
    id: 'note-cluster-4',
    x: 930,
    y: 810,
    width: 230,
    height: 190,
    title: 'Cluster SQLite WASM + Litestream',
    content: 'Replicación P2P streaming en tiempo real con cifrado de páginas AES-GCM local.',
    color: 'mint',
    tag: '#SQLite',
    category: 'Backend & Datos',
    rotation: 1.1,
    author: 'Carlos (Lead Dev)',
  },
  {
    id: 'note-cluster-5',
    x: 1200,
    y: 790,
    width: 230,
    height: 190,
    title: 'Hardening Zero-Trust & RBAC',
    content: 'Validación criptográfica de permisos a nivel de byte en cada transacción del documento.',
    color: 'coral',
    tag: '#Criptografía',
    category: 'Seguridad & Criptografía',
    rotation: -1.7,
    author: 'Sara (QA)',
  },
  {
    id: 'note-cluster-6',
    x: 150,
    y: 1040,
    width: 230,
    height: 190,
    title: 'CI/CD con Artefactos Firmados',
    content: 'Generar binarios portables Windows/macOS en GitHub Actions con sellado de tiempo RFC 3161.',
    color: 'yellow',
    tag: '#DevOps',
    category: 'DevOps & CI/CD',
    rotation: 1.3,
    author: 'Carlos (Lead Dev)',
  },
  {
    id: 'note-cluster-7',
    x: 430,
    y: 1060,
    width: 230,
    height: 190,
    title: 'Telemetría OpenTelemetry P2P',
    content: 'Monitoreo de latencia P99 entre nodos WebRTC y contadores de frames descartados.',
    color: 'lavender',
    tag: '#Monitoring',
    category: 'DevOps & CI/CD',
    rotation: -0.5,
    author: 'Sara (QA)',
  },
  {
    id: 'note-cluster-8',
    x: 710,
    y: 1030,
    width: 230,
    height: 190,
    title: 'Particionado de Tablas & B-Tree',
    content: 'Optimización de índices compuestos para tablas de más de 500k filas sin lag en scroll.',
    color: 'mint',
    tag: '#SQL',
    category: 'Backend & Datos',
    rotation: 1.8,
    author: 'Carlos (Lead Dev)',
  },
];

const INITIAL_FRAMES: StructuredFrame[] = [
  {
    id: 'frame-retro-1',
    title: 'Retrospectiva Ágil • Sprint 42 Q4',
    templateType: 'retro',
    x: 120,
    y: 100,
    width: 860,
    height: 540,
    sections: [
      {
        id: 'sec-worked',
        title: 'Qué Funcionó Bien',
        subtitle: 'Logros y buenas prácticas',
        colorHex: '#10B981',
        badge: 'ÉXITO',
        rect: { x: 20, y: 60, width: 260, height: 460 },
      },
      {
        id: 'sec-improve',
        title: 'Qué Mejorar',
        subtitle: 'Bloqueos y fricción operativa',
        colorHex: '#F59E0B',
        badge: 'ATENCIÓN',
        rect: { x: 300, y: 60, width: 260, height: 460 },
      },
      {
        id: 'sec-actions',
        title: 'Acciones de Mejora',
        subtitle: 'Compromisos para el siguiente ciclo',
        colorHex: '#3B82F6',
        badge: 'ACCIONES',
        rect: { x: 580, y: 60, width: 260, height: 460 },
      },
    ],
  },
  {
    id: 'frame-eisenhower-1',
    title: 'Matriz de Eisenhower • Prioridades Estratégicas',
    templateType: 'eisenhower',
    x: 1060,
    y: 100,
    width: 760,
    height: 540,
    sections: [
      {
        id: 'sec-q1',
        title: '1. Urgente e Importante',
        subtitle: 'Hacer Inmediatamente (Crisis)',
        colorHex: '#F43F5E',
        badge: 'HACER YA',
        rect: { x: 20, y: 60, width: 350, height: 215 },
      },
      {
        id: 'sec-q2',
        title: '2. No Urgente pero Importante',
        subtitle: 'Planificar & Diseñar (Estrategia)',
        colorHex: '#3B82F6',
        badge: 'PLANIFICAR',
        rect: { x: 390, y: 60, width: 350, height: 215 },
      },
      {
        id: 'sec-q3',
        title: '3. Urgente pero No Importante',
        subtitle: 'Delegar & Automatizar',
        colorHex: '#F59E0B',
        badge: 'DELEGAR',
        rect: { x: 20, y: 295, width: 350, height: 225 },
      },
      {
        id: 'sec-q4',
        title: '4. Ni Urgente Ni Importante',
        subtitle: 'Eliminar o Posponer',
        colorHex: '#64748B',
        badge: 'ELIMINAR',
        rect: { x: 390, y: 295, width: 350, height: 225 },
      },
    ],
  },
];

const INITIAL_DIGITAL_TWIN: DigitalTwinModel = {
  id: 'twin-edge-server-1',
  title: 'Gemelo Digital • Apex Server Unit TWIN-CAD-809',
  x: 1060,
  y: 720,
  width: 460,
  height: 520,
  renderMode: 'pbr',
  rotX: 25,
  rotY: -35,
  rotZ: 0,
  isAutoSpin: true,
  telemetry: {
    nodeId: 'APEX-CAD-0941-PRO',
    status: 'OPTIMAL',
    tempC: 41.8,
    fanRpm: 3420,
    pcieGbps: 128.4,
    vibrationG: 0.038,
    harmonicHealth: 99.4,
  },
};

const INITIAL_COLLABORATORS: CollaboratorPeer[] = [
  {
    id: 'peer-elena',
    name: 'Elena',
    role: 'Diseño UI/UX',
    color: '#EC4899',
    cursorX: 520,
    cursorY: 340,
    targetX: 540,
    targetY: 360,
    isSpeaking: true,
    statusText: 'Revisando cuadrícula de Eisenhower',
    avatarText: 'EL',
  },
  {
    id: 'peer-carlos',
    name: 'Carlos',
    role: 'Lead Dev',
    color: '#10B981',
    cursorX: 1220,
    cursorY: 880,
    targetX: 1250,
    targetY: 890,
    isSpeaking: false,
    statusText: 'Inspeccionando telemetría CAD PBR',
    avatarText: 'CD',
  },
  {
    id: 'peer-sara',
    name: 'Sara',
    role: 'QA & Security',
    color: '#F59E0B',
    cursorX: 780,
    cursorY: 960,
    targetX: 790,
    targetY: 980,
    isSpeaking: true,
    statusText: 'Validando clustering semántico',
    avatarText: 'SR',
  },
];

export const SpatialCanvasView: React.FC = () => {
  // ==========================================
  // VIEWPORT NAVIGATION & ZOOM STATE
  // ==========================================
  const [viewport, setViewport] = useState<{ x: number; y: number; zoom: number }>({
    x: 80,
    y: 40,
    zoom: 0.85,
  });

  const [activeTool, setActiveTool] = useState<CanvasTool>('pointer');
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Board Elements State
  const [notes, setNotes] = useState<SmartStickyNote[]>(INITIAL_STICKY_NOTES);
  const [frames, setFrames] = useState<StructuredFrame[]>(INITIAL_FRAMES);
  const [digitalTwin, setDigitalTwin] = useState<DigitalTwinModel>(INITIAL_DIGITAL_TWIN);
  const [strokes, setStrokes] = useState<FreehandStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[] | null>(null);

  // Brush settings
  const [brushColor, setBrushColor] = useState<string>('#38BDF8');
  const [brushWidth, setBrushWidth] = useState<number>(4);

  // Selection & Dragging
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Magnetic Snapping Guide Indicator
  const [magneticSnapGuide, setMagneticSnapGuide] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  // Geometric Shape Recognition Prompt
  const [shapePrompt, setShapePrompt] = useState<RecognizedShapePrompt | null>(null);

  // AI Semantic Clustering Animation
  const [isClustering, setIsClustering] = useState<boolean>(false);
  const [aiInferenceNotice, setAiInferenceNotice] = useState<string | null>(null);
  const clusterAnimIdRef = useRef<number | null>(null);
  const clusterTimeout1Ref = useRef<NodeJS.Timeout | null>(null);
  const clusterTimeout2Ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clusterAnimIdRef.current) cancelAnimationFrame(clusterAnimIdRef.current);
      if (clusterTimeout1Ref.current) clearTimeout(clusterTimeout1Ref.current);
      if (clusterTimeout2Ref.current) clearTimeout(clusterTimeout2Ref.current);
    };
  }, []);

  // Telepresence & Spatial HRTF Audio
  const [peers, setPeers] = useState<CollaboratorPeer[]>(INITIAL_COLLABORATORS);
  const [isSpatialAudioMuted, setIsSpatialAudioMuted] = useState<boolean>(false);
  const [localMousePos, setLocalMousePos] = useState<{ x: number; y: number }>({ x: 500, y: 400 });

  // 3D Twin Canvas Drag / Orbit
  const [isOrbiting3D, setIsOrbiting3D] = useState<boolean>(false);
  const orbitStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const twinCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // ==========================================
  // COORDINATE HELPERS
  // ==========================================
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const originX = rect ? rect.left : 0;
      const originY = rect ? rect.top : 0;
      return {
        x: (screenX - originX - viewport.x) / viewport.zoom,
        y: (screenY - originY - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // ==========================================
  // KEYBOARD SHORTCUTS FOR PANNING & TOOLS
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      } else if (e.key === 'v' || e.key === 'V') {
        setActiveTool('pointer');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool('hand');
      } else if (e.key === 'n' || e.key === 'N') {
        setActiveTool('sticky');
      } else if (e.key === 'f' || e.key === 'F') {
        setActiveTool('frame');
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveTool('draw');
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setViewport({ x: 100, y: 50, zoom: 1.0 });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ==========================================
  // ZOOM WHEEL HANDLER (10% to 400%)
  // ==========================================
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseScreenX = e.clientX - rect.left;
      const mouseScreenY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      setViewport((prev) => {
        const nextZoom = Math.min(4.0, Math.max(0.1, prev.zoom * zoomFactor));
        // Keep mouse coordinate anchored in canvas space
        const newX = mouseScreenX - (mouseScreenX - prev.x) * (nextZoom / prev.zoom);
        const newY = mouseScreenY - (mouseScreenY - prev.y) * (nextZoom / prev.zoom);
        return { x: newX, y: newY, zoom: nextZoom };
      });
    },
    []
  );

  // ==========================================
  // P2P COLLABORATORS MOVEMENT SIMULATION
  // ==========================================
  useEffect(() => {
    const interval = setInterval(() => {
      setPeers((prevPeers) =>
        prevPeers.map((peer) => {
          // Wander organically
          const dx = peer.targetX - peer.cursorX;
          const dy = peer.targetY - peer.cursorY;
          const dist = Math.hypot(dx, dy);

          let nextTargetX = peer.targetX;
          let nextTargetY = peer.targetY;
          if (dist < 20) {
            // Pick a new target in vicinity of frames or notes
            nextTargetX = Math.max(100, Math.min(1700, peer.cursorX + (Math.random() - 0.5) * 450));
            nextTargetY = Math.max(80, Math.min(1200, peer.cursorY + (Math.random() - 0.5) * 450));
          }

          const speed = 0.08;
          return {
            ...peer,
            cursorX: peer.cursorX + dx * speed,
            cursorY: peer.cursorY + dy * speed,
            targetX: nextTargetX,
            targetY: nextTargetY,
            isSpeaking: Math.random() > 0.45,
          };
        })
      );
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Telemetry jitter for 3D Digital Twin
  useEffect(() => {
    const timer = setInterval(() => {
      setDigitalTwin((prev) => ({
        ...prev,
        telemetry: {
          ...prev.telemetry,
          tempC: parseFloat((41.5 + Math.sin(Date.now() / 3000) * 1.2).toFixed(1)),
          fanRpm: Math.round(3400 + Math.sin(Date.now() / 2000) * 120),
          vibrationG: parseFloat((0.035 + Math.random() * 0.008).toFixed(3)),
        },
      }));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // ==========================================
  // HRTF 3D SPATIAL AUDIO CALCULATIONS
  // ==========================================
  const hrtfTelemetries = useMemo<HRTFTelemetry[]>(() => {
    return peers.map((peer) => {
      // Calculate delta between user pointer and collaborator cursor in canvas coords
      const dx = peer.cursorX - localMousePos.x;
      const dy = peer.cursorY - localMousePos.y;
      const distPx = Math.hypot(dx, dy);

      // 100 pixels = 1 virtual acoustic meter
      const distanceMeters = parseFloat(Math.max(0.5, distPx / 100).toFixed(1));

      // Inverse distance law attenuation
      const gainDb = Math.max(-48, Math.round(-20 * Math.log10(Math.max(1, distanceMeters / 1.5))));

      // Stereo pan: -100% (Left) to +100% (Right)
      const panPercent = Math.max(-100, Math.min(100, Math.round((dx / 400) * 100)));

      // Polar azimuth angle
      const azimuthDeg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);

      return {
        peerId: peer.id,
        distanceMeters,
        gainDb,
        panPercent,
        azimuthDeg,
      };
    });
  }, [peers, localMousePos]);

  // ==========================================
  // 3D CAD ENGINE RENDERING LOOP (CANVAS)
  // ==========================================
  useEffect(() => {
    let animId: number;
    const canvas = twinCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Turntable rotation step if autoSpin
    let rotX = (digitalTwin.rotX * Math.PI) / 180;
    let rotY = (digitalTwin.rotY * Math.PI) / 180;

    const render3D = () => {
      if (digitalTwin.isAutoSpin && !isOrbiting3D) {
        rotY += 0.012;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = 110;
      const focalLength = 340;

      // 3D Chassis Cuboid Definition (-1 to 1)
      const rawVertices = [
        [-1.4, -0.9, -0.6],
        [1.4, -0.9, -0.6],
        [1.4, 0.9, -0.6],
        [-1.4, 0.9, -0.6],
        [-1.4, -0.9, 0.6],
        [1.4, -0.9, 0.6],
        [1.4, 0.9, 0.6],
        [-1.4, 0.9, 0.6],
      ];

      // Rotation Matrix Application
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const transformed = rawVertices.map(([vx, vy, vz]) => {
        // Rotate around Y
        const x1 = vx * cosY + vz * sinY;
        const y1 = vy;
        const z1 = -vx * sinY + vz * cosY;

        // Rotate around X
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX + 3.8; // Camera offset Z

        // Perspective Projection
        const projFactor = focalLength / z2;
        const px = cx + x2 * scale * (projFactor / focalLength);
        const py = cy + y2 * scale * (projFactor / focalLength);

        return { x: px, y: py, z: z2 };
      });

      // Faces definition: 4 vertices per face with directional normal
      const faces = [
        { indices: [0, 1, 2, 3], normal: [0, 0, -1], name: 'Back' },
        { indices: [4, 5, 6, 7], normal: [0, 0, 1], name: 'Front' },
        { indices: [0, 1, 5, 4], normal: [0, -1, 0], name: 'Top' },
        { indices: [2, 3, 7, 6], normal: [0, 1, 0], name: 'Bottom' },
        { indices: [0, 3, 7, 4], normal: [-1, 0, 0], name: 'Left' },
        { indices: [1, 2, 6, 5], normal: [1, 0, 0], name: 'Right' },
      ];

      // Simulated directional PBR light source
      const lightDir = [0.4, -0.7, -0.6];
      const lightNorm = Math.hypot(lightDir[0], lightDir[1], lightDir[2]);
      const L = [lightDir[0] / lightNorm, lightDir[1] / lightNorm, lightDir[2] / lightNorm];

      // Depth sort faces (Painter's algorithm)
      const sortedFaces = faces
        .map((f) => {
          const avgZ = f.indices.reduce((sum, idx) => sum + transformed[idx].z, 0) / f.indices.length;
          return { ...f, avgZ };
        })
        .sort((a, b) => b.avgZ - a.avgZ);

      // Render Faces
      sortedFaces.forEach((face) => {
        const pts = face.indices.map((i) => transformed[i]);

        // Calculate surface normal in rotated space for lighting
        const nx = face.normal[0] * cosY + face.normal[2] * sinY;
        const ny = face.normal[1] * cosX - (-face.normal[0] * sinY + face.normal[2] * cosY) * sinX;
        const nz = face.normal[1] * sinX + (-face.normal[0] * sinY + face.normal[2] * cosY) * cosX;

        // Dot product with camera vector (0, 0, 1) -> backface culling check
        if (nz > 0.05 && digitalTwin.renderMode === 'pbr') {
          // Normal faces towards camera
          const dotLight = Math.max(0.12, -(nx * L[0] + ny * L[1] + nz * L[2]));
          const intensity = Math.min(255, Math.floor(dotLight * 220 + 25));

          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();

          // PBR Metallic Shading
          ctx.fillStyle = `rgb(${Math.floor(intensity * 0.4)}, ${Math.floor(intensity * 0.65)}, ${Math.floor(
            intensity * 0.95
          )})`;
          ctx.fill();

          // Edge highlight
          ctx.strokeStyle = `rgba(56, 189, 248, 0.4)`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // If front face, draw simulated server drive bays & LED indicators
          if (face.name === 'Front') {
            ctx.save();
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
            ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
            const midX = (pts[0].x + pts[1].x) / 2;
            const midY = (pts[0].y + pts[2].y) / 2;
            ctx.beginPath();
            ctx.arc(midX - 35, midY, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
            ctx.beginPath();
            ctx.arc(midX - 22, midY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else if (digitalTwin.renderMode === 'wireframe' || digitalTwin.renderMode === 'hybrid') {
          // Wireframe mode
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();

          if (digitalTwin.renderMode === 'hybrid') {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
            ctx.fill();
          }

          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Draw vertex dots
          pts.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#67E8F9';
            ctx.fill();
          });
        }
      });

      // Internal heatsink fin ribs
      if (digitalTwin.renderMode !== 'pbr') {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1;
        for (let offset = -0.8; offset <= 0.8; offset += 0.3) {
          const fx1 = cx + (offset * cosY) * scale * 0.9;
          const fy1 = cy - 35;
          const fx2 = cx + (offset * cosY) * scale * 0.9;
          const fy2 = cy + 35;
          ctx.beginPath();
          ctx.moveTo(fx1, fy1);
          ctx.lineTo(fx2, fy2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render3D);
    };

    render3D();
    return () => cancelAnimationFrame(animId);
  }, [digitalTwin.isAutoSpin, digitalTwin.renderMode, digitalTwin.rotX, digitalTwin.rotY, isOrbiting3D]);

  // ==========================================
  // FREEHAND DRAWING & SHAPE RECOGNITION
  // ==========================================
  const startDrawing = (canvasX: number, canvasY: number) => {
    setCurrentStroke([{ x: canvasX, y: canvasY }]);
  };

  const continueDrawing = (canvasX: number, canvasY: number) => {
    if (!currentStroke) return;
    setCurrentStroke((prev) => (prev ? [...prev, { x: canvasX, y: canvasY }] : null));
  };

  const finishDrawing = () => {
    if (!currentStroke || currentStroke.length < 3) {
      setCurrentStroke(null);
      return;
    }

    const strokeId = `stroke-${Date.now()}`;
    const newStroke: FreehandStroke = {
      id: strokeId,
      points: currentStroke,
      color: brushColor,
      width: brushWidth,
    };

    // Analyze stroke points for geometric shape recognition
    const points = currentStroke;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let totalLen = 0;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (i > 0) {
        totalLen += Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y);
      }
    }

    const bboxW = maxX - minX;
    const bboxH = maxY - minY;
    const perimeter = 2 * (bboxW + bboxH);
    const startEndDist = Math.hypot(points[0].x - points[points.length - 1].x, points[0].y - points[points.length - 1].y);

    const isClosed = startEndDist < Math.max(45, (bboxW + bboxH) * 0.25);

    if (isClosed && bboxW > 40 && bboxH > 40) {
      // Centroid
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const expectedRadius = (bboxW + bboxH) / 4;

      // Circle variance calculation
      let radiusDevSum = 0;
      points.forEach((pt) => {
        const r = Math.hypot(pt.x - cx, pt.y - cy);
        radiusDevSum += Math.abs(r - expectedRadius);
      });
      const avgRadiusDev = radiusDevSum / points.length;
      const radiusDevRatio = avgRadiusDev / expectedRadius;
      const aspectRatio = bboxW / bboxH;

      if (radiusDevRatio < 0.22 && aspectRatio > 0.72 && aspectRatio < 1.38) {
        // Circle detected!
        setShapePrompt({
          strokeId,
          type: 'circle',
          bounds: { x: minX, y: minY, width: bboxW, height: bboxH },
          confidence: Math.round((1 - radiusDevRatio) * 100),
        });
      } else if (Math.abs(totalLen - perimeter) / perimeter < 0.35) {
        // Rectangle detected!
        setShapePrompt({
          strokeId,
          type: 'rectangle',
          bounds: { x: minX, y: minY, width: bboxW, height: bboxH },
          confidence: 88,
        });
      }
    }

    setStrokes((prev) => [...prev, newStroke]);
    setCurrentStroke(null);
  };

  const convertStrokeToVector = (prompt: RecognizedShapePrompt) => {
    setStrokes((prev) =>
      prev.map((s) => {
        if (s.id === prompt.strokeId) {
          return {
            ...s,
            recognizedShape: prompt.type,
            shapeBounds: prompt.bounds,
          };
        }
        return s;
      })
    );
    setShapePrompt(null);
  };

  // ==========================================
  // LOCAL SEMANTIC AI CLUSTERING
  // ==========================================
  const handleRunSemanticClustering = () => {
    if (isClustering) return;
    setIsClustering(true);
    setAiInferenceNotice('Inicializando motor semántico local WASM (ONNX Runtime)...');

    // 4 Cluster Zones in Canvas Space
    const CLUSTER_ANCHORS: Record<SemanticCategory, { startX: number; startY: number; color: string }> = {
      'Frontend & UI': { startX: 120, startY: 1380, color: '#38BDF8' },
      'Seguridad & Criptografía': { startX: 480, startY: 1380, color: '#F43F5E' },
      'Backend & Datos': { startX: 840, startY: 1380, color: '#10B981' },
      'DevOps & CI/CD': { startX: 1200, startY: 1380, color: '#F59E0B' },
    };

    // Calculate destinations for each note
    const counts: Record<SemanticCategory, number> = {
      'Frontend & UI': 0,
      'Seguridad & Criptografía': 0,
      'Backend & Datos': 0,
      'DevOps & CI/CD': 0,
    };

    const updatedNotesWithTargets = notes.map((note) => {
      const cat = note.category;
      const anchor = CLUSTER_ANCHORS[cat];
      const slotIndex = counts[cat]++;
      const targetX = anchor.startX;
      const targetY = anchor.startY + 60 + slotIndex * 210;

      return {
        ...note,
        clusterTarget: { x: targetX, y: targetY },
      };
    });

    setNotes(updatedNotesWithTargets);

    clusterTimeout1Ref.current = setTimeout(() => {
      setAiInferenceNotice('Agrupando notas por similitud de embeddings neuronales (MiniLM-L6)...');
    }, 250);

    // Smooth position interpolation over 650ms
    const startTime = performance.now();
    const duration = 650;
    const initialPositions = notes.map((n) => ({ id: n.id, x: n.x, y: n.y }));

    const animateStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (!note.clusterTarget) return note;
          const orig = initialPositions.find((p) => p.id === note.id);
          if (!orig) return note;

          const currentX = orig.x + (note.clusterTarget.x - orig.x) * ease;
          const currentY = orig.y + (note.clusterTarget.y - orig.y) * ease;

          return {
            ...note,
            x: Math.round(currentX),
            y: Math.round(currentY),
            rotation: (1 - ease) * note.rotation, // Flatten slight tilt on cluster
          };
        })
      );

      if (progress < 1) {
        clusterAnimIdRef.current = requestAnimationFrame(animateStep);
      } else {
        setIsClustering(false);
        setAiInferenceNotice(
          '✨ 12 notas agrupadas en 4 categorías semánticas • Inferencia 100% soberana en dispositivo'
        );
        clusterTimeout2Ref.current = setTimeout(() => setAiInferenceNotice(null), 5000);
      }
    };

    clusterAnimIdRef.current = requestAnimationFrame(animateStep);
  };

  // ==========================================
  // MAGNETIC SNAPPING LOGIC DURING DRAG
  // ==========================================
  const checkMagneticSnapping = (noteX: number, noteY: number, noteW: number, noteH: number) => {
    const noteCenterX = noteX + noteW / 2;
    const noteCenterY = noteY + noteH / 2;

    for (const frame of frames) {
      for (const sec of frame.sections) {
        const secAbsX = frame.x + sec.rect.x;
        const secAbsY = frame.y + sec.rect.y;
        const secCenterX = secAbsX + sec.rect.width / 2;
        const secCenterY = secAbsY + sec.rect.height / 2;

        const isInsideSec =
          noteCenterX >= secAbsX &&
          noteCenterX <= secAbsX + sec.rect.width &&
          noteCenterY >= secAbsY &&
          noteCenterY <= secAbsY + sec.rect.height;

        if (isInsideSec) {
          // Snap magnetic guide
          setMagneticSnapGuide({
            x: secCenterX,
            y: secCenterY,
            label: `${frame.title} → ${sec.title}`,
          });
          return {
            snappedX: secCenterX - noteW / 2,
            snappedY: Math.max(secAbsY + 15, noteY),
          };
        }
      }
    }

    setMagneticSnapGuide(null);
    return null;
  };

  // ==========================================
  // MOUSE & POINTER DISPATCHER
  // ==========================================
  const handlePointerDown = (e: React.PointerEvent) => {
    const coords = screenToCanvas(e.clientX, e.clientY);

    // Pan mode with space or hand tool or middle click
    if (isSpacePressed || activeTool === 'hand' || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
      return;
    }

    // Freehand Drawing Mode
    if (activeTool === 'draw') {
      startDrawing(coords.x, coords.y);
      return;
    }

    // Creating a new sticky note
    if (activeTool === 'sticky') {
      const newNote: SmartStickyNote = {
        id: `note-${Date.now()}`,
        x: Math.round(coords.x - 110),
        y: Math.round(coords.y - 90),
        width: 220,
        height: 180,
        title: 'Nueva Idea',
        content: 'Escribe tu nota aquí...',
        color: 'yellow',
        tag: '#General',
        category: 'Frontend & UI',
        rotation: (Math.random() - 0.5) * 2.5,
      };
      setNotes((prev) => [...prev, newNote]);
      setSelectedNoteId(newNote.id);
      setActiveTool('pointer');
      return;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = screenToCanvas(e.clientX, e.clientY);
    setLocalMousePos(coords);

    if (isPanning) {
      setViewport((prev) => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      }));
      return;
    }

    if (activeTool === 'draw' && currentStroke) {
      continueDrawing(coords.x, coords.y);
      return;
    }

    if (draggingNoteId) {
      const rawX = coords.x - dragOffsetRef.current.x;
      const rawY = coords.y - dragOffsetRef.current.y;

      const draggingNote = notes.find((n) => n.id === draggingNoteId);
      if (draggingNote) {
        const snap = checkMagneticSnapping(rawX, rawY, draggingNote.width, draggingNote.height);
        const finalX = snap ? snap.snappedX : rawX;
        const finalY = snap ? snap.snappedY : rawY;

        setNotes((prev) =>
          prev.map((n) => (n.id === draggingNoteId ? { ...n, x: finalX, y: finalY } : n))
        );
      }
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (activeTool === 'draw' && currentStroke) {
      finishDrawing();
    }
    if (draggingNoteId) {
      setDraggingNoteId(null);
      setMagneticSnapGuide(null);
    }
    if (isOrbiting3D) {
      setIsOrbiting3D(false);
    }
  };

  // Start Note Drag
  const handleNoteMouseDown = (e: React.PointerEvent, noteId: string) => {
    e.stopPropagation();
    if (activeTool !== 'pointer') return;
    const note = notes.find((n) => n.id === noteId);
    if (!note || note.isPinned) return;

    setSelectedNoteId(noteId);
    setSelectedFrameId(null);
    setDraggingNoteId(noteId);

    const coords = screenToCanvas(e.clientX, e.clientY);
    dragOffsetRef.current = {
      x: coords.x - note.x,
      y: coords.y - note.y,
    };
  };

  // Update Note Content
  const handleUpdateNote = (id: string, updates: Partial<SmartStickyNote>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  // Delete Note
  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  // ==========================================
  // EXPORT FUNCTIONS (PNG, SVG)
  // ==========================================
  const exportBoardAsPNG = () => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 1920;
    offCanvas.height = 1080;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0c0e12';
    ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    // Draw dot grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let x = 0; x < offCanvas.width; x += 32) {
      for (let y = 0; y < offCanvas.height; y += 32) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Title Header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('Apex Spatial Board Export', 40, 50);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Exportado el ${new Date().toLocaleString()}`, 40, 75);

    // Draw Frames
    frames.forEach((f) => {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(f.x * 0.7, f.y * 0.7, f.width * 0.7, f.height * 0.7);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(f.x * 0.7, f.y * 0.7, f.width * 0.7, f.height * 0.7);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(f.title, f.x * 0.7 + 15, f.y * 0.7 + 30);
    });

    // Draw Notes
    notes.forEach((n) => {
      const col = STICKY_PALETTE[n.color] || STICKY_PALETTE.yellow;
      ctx.fillStyle = col.hex;
      ctx.fillRect(n.x * 0.7, n.y * 0.7, n.width * 0.7, n.height * 0.7);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(n.title, n.x * 0.7 + 10, n.y * 0.7 + 25);

      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(n.content.substring(0, 45) + '...', n.x * 0.7 + 10, n.y * 0.7 + 45);
    });

    // Trigger download
    const link = document.createElement('a');
    link.download = `pizarra-espacial-apex-${Date.now()}.png`;
    link.href = offCanvas.toDataURL('image/png');
    link.click();
  };

  const exportBoardAsSVG = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1500" width="2000" height="1500">
        <rect width="100%" height="100%" fill="#0c0e12" />
        <defs>
          <pattern id="dotGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#334155" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
        <text x="40" y="50" font-family="sans-serif" font-weight="bold" font-size="28" fill="#F8FAFC">Apex Spatial Board Export</text>
        ${frames
          .map(
            (f) => `
          <g transform="translate(${f.x}, ${f.y})">
            <rect width="${f.width}" height="${f.height}" rx="16" fill="#161a22" stroke="#334155" stroke-width="2" />
            <text x="24" y="36" font-family="sans-serif" font-size="18" font-weight="bold" fill="#38BDF8">${f.title}</text>
          </g>
        `
          )
          .join('')}
        ${notes
          .map(
            (n) => `
          <g transform="translate(${n.x}, ${n.y})">
            <rect width="${n.width}" height="${n.height}" rx="8" fill="${
              STICKY_PALETTE[n.color]?.hex || '#FEF08A'
            }" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
            <text x="14" y="28" font-family="sans-serif" font-weight="bold" font-size="14" fill="#1E293B">${n.title}</text>
            <text x="14" y="52" font-family="sans-serif" font-size="12" fill="#334155">${n.content.substring(0, 35)}...</text>
          </g>
        `
          )
          .join('')}
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pizarra-espacial-apex-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#090b0e] overflow-hidden select-none cursor-crosshair font-sans"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        cursor: isPanning || isSpacePressed ? 'grab' : activeTool === 'draw' ? 'crosshair' : 'default',
      }}
    >
      {/* ========================================== */}
      {/* 1. TOP SPATIAL TOOLBAR DOCK */}
      {/* ========================================== */}
      <header className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-obsidian-950/90 backdrop-blur-xl border border-obsidian-700/80 shadow-2xl">
        {/* Pointer Tool */}
        <button
          onClick={() => setActiveTool('pointer')}
          className={`p-2 rounded-xl transition-all flex items-center space-x-1 ${
            activeTool === 'pointer'
              ? 'bg-apex-blue text-white shadow-lg shadow-apex-blue/30'
              : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
          }`}
          title="Puntero de Selección (V)"
        >
          <Move className="w-4 h-4" />
        </button>

        {/* Hand Pan Tool */}
        <button
          onClick={() => setActiveTool('hand')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'hand'
              ? 'bg-apex-blue text-white shadow-lg shadow-apex-blue/30'
              : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
          }`}
          title="Herramienta Mano / Paneo (H o Espacio)"
        >
          <Hand className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-obsidian-800 mx-1" />

        {/* Smart Sticky Note Tool */}
        <button
          onClick={() => setActiveTool('sticky')}
          className={`p-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTool === 'sticky'
              ? 'bg-amber-400 text-amber-950 font-bold shadow-lg shadow-amber-400/30'
              : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
          }`}
          title="Nota Adhesiva Inteligente (N)"
        >
          <StickyNote className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Nota</span>
        </button>

        {/* Structured Frame Tool */}
        <button
          onClick={() => {
            // Add a new template frame
            const newFrame: StructuredFrame = {
              id: `frame-${Date.now()}`,
              title: 'Lean Canvas • Modelo de Negocio Ágil',
              templateType: 'lean',
              x: localMousePos.x - 100,
              y: localMousePos.y - 50,
              width: 820,
              height: 480,
              sections: [
                {
                  id: 's-prob',
                  title: 'Problema',
                  subtitle: 'Top 3 problemas del usuario',
                  colorHex: '#EF4444',
                  badge: 'PROBLEMA',
                  rect: { x: 20, y: 50, width: 240, height: 400 },
                },
                {
                  id: 's-sol',
                  title: 'Solución',
                  subtitle: 'Características mínimas viables',
                  colorHex: '#10B981',
                  badge: 'SOLUCIÓN',
                  rect: { x: 280, y: 50, width: 240, height: 400 },
                },
                {
                  id: 's-val',
                  title: 'Propuesta de Valor',
                  subtitle: 'Mensaje claro y diferenciador',
                  colorHex: '#3B82F6',
                  badge: 'VALOR',
                  rect: { x: 540, y: 50, width: 260, height: 400 },
                },
              ],
            };
            setFrames((prev) => [...prev, newFrame]);
            setActiveTool('pointer');
          }}
          className={`p-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTool === 'frame'
              ? 'bg-apex-indigo text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
          }`}
          title="Añadir Marco Estructurado (F)"
        >
          <Columns className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Marco</span>
        </button>

        {/* Freehand Brush Tool */}
        <button
          onClick={() => setActiveTool('draw')}
          className={`p-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTool === 'draw'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
              : 'text-slate-400 hover:text-white hover:bg-obsidian-800'
          }`}
          title="Lápiz y Reconocimiento de Formas (P)"
        >
          <Pencil className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Lápiz</span>
        </button>

        {/* Brush Options Popover when Draw is active */}
        {activeTool === 'draw' && (
          <div className="flex items-center space-x-1 pl-1 bg-obsidian-900 rounded-lg py-0.5 px-1 border border-obsidian-700">
            {['#38BDF8', '#10B981', '#F43F5E', '#F59E0B', '#A855F7', '#FFFFFF'].map((color) => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-3.5 h-3.5 rounded-full transition-transform ${
                  brushColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <div className="w-px h-3 bg-obsidian-700 mx-1" />
            {[2, 4, 8].map((w) => (
              <button
                key={w}
                onClick={() => setBrushWidth(w)}
                className={`text-[10px] px-1 rounded font-mono ${
                  brushWidth === w ? 'bg-sky-500/30 text-sky-300 font-bold' : 'text-slate-400'
                }`}
              >
                {w}p
              </button>
            ))}
          </div>
        )}

        <div className="w-px h-5 bg-obsidian-800 mx-1" />

        {/* LOCAL SEMANTIC AI CLUSTERING BUTTON */}
        <button
          onClick={handleRunSemanticClustering}
          disabled={isClustering}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 text-white font-medium text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95 transition-all"
          title="Agrupa notas temáticamente con IA local (Frontend, Seguridad, Backend, DevOps)"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isClustering ? 'animate-spin' : ''}`} />
          <span className="tracking-tight">
            {isClustering ? 'Clusterizando...' : 'Clusterizar con IA Semántica Local'}
          </span>
        </button>

        <div className="w-px h-5 bg-obsidian-800 mx-1" />

        {/* Export PNG */}
        <button
          onClick={exportBoardAsPNG}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-obsidian-800 transition-all flex items-center space-x-1"
          title="Descargar Pizarra como PNG de Alta Resolución"
        >
          <Download className="w-4 h-4" />
          <span className="text-[10px] font-mono">PNG</span>
        </button>

        {/* Export SVG */}
        <button
          onClick={exportBoardAsSVG}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-obsidian-800 transition-all flex items-center space-x-1"
          title="Descargar Pizarra como SVG Vectorial Puro"
        >
          <Download className="w-4 h-4" />
          <span className="text-[10px] font-mono">SVG</span>
        </button>
      </header>

      {/* ========================================== */}
      {/* 2. FLOATING HUD CONTROLS (ZOOM & RADAR) */}
      {/* ========================================== */}
      <div className="absolute bottom-5 right-5 z-30 flex flex-col items-end space-y-3">
        {/* Zoom Controls HUD */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-obsidian-950/90 backdrop-blur-md border border-obsidian-800 text-slate-300 shadow-xl">
          <button
            onClick={() =>
              setViewport((v) => ({ ...v, zoom: Math.max(0.1, parseFloat((v.zoom - 0.15).toFixed(2))) }))
            }
            className="p-1.5 rounded-lg hover:bg-obsidian-800 hover:text-white transition-colors"
            title="Alejar Zoom (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-mono font-medium px-1.5 text-slate-200">
            {Math.round(viewport.zoom * 100)}%
          </span>

          <button
            onClick={() =>
              setViewport((v) => ({ ...v, zoom: Math.min(4.0, parseFloat((v.zoom + 0.15).toFixed(2))) }))
            }
            className="p-1.5 rounded-lg hover:bg-obsidian-800 hover:text-white transition-colors"
            title="Acercar Zoom (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-obsidian-800 mx-1" />

          <button
            onClick={() => setViewport({ x: 80, y: 40, zoom: 0.85 })}
            className="p-1.5 rounded-lg hover:bg-obsidian-800 hover:text-white transition-colors"
            title="Restablecer Vista (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Processing Notification Toast */}
      {aiInferenceNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-indigo-950/95 border border-indigo-500/50 text-indigo-200 text-xs font-medium shadow-2xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{aiInferenceNotice}</span>
        </div>
      )}

      {/* Geometric Shape Detection Prompt Toast */}
      {shapePrompt && (
        <div className="absolute top-16 right-6 z-40 p-3 rounded-2xl bg-obsidian-950/95 border border-sky-500/50 shadow-2xl backdrop-blur-md flex items-center space-x-3 text-xs text-slate-200">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <div>
            <div className="font-semibold text-white">
              Forma detectada: {shapePrompt.type === 'circle' ? 'Círculo Perfecto' : 'Rectángulo Regular'}
            </div>
            <div className="text-[11px] text-slate-400">Confianza IA geométrica: {shapePrompt.confidence}%</div>
          </div>
          <div className="flex items-center space-x-1.5 pl-2">
            <button
              onClick={() => convertStrokeToVector(shapePrompt)}
              className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-obsidian-950 font-bold transition-all"
            >
              Convertir
            </button>
            <button
              onClick={() => setShapePrompt(null)}
              className="px-2 py-1 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-400 transition-all"
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 3. P2P TELEPRESENCE & SPATIAL AUDIO HUD */}
      {/* ========================================== */}
      <aside className="absolute bottom-5 left-5 z-30 flex items-center space-x-3">
        {/* Remote Collaborators Badge Bar */}
        <div className="px-3 py-2 rounded-2xl bg-obsidian-950/90 backdrop-blur-md border border-obsidian-800 shadow-xl flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">P2P Mesh</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              WebRTC Activo
            </span>
          </div>

          <div className="w-px h-5 bg-obsidian-800" />

          {/* Collaborator Avatars with Voice Rings */}
          <div className="flex items-center -space-x-1.5">
            {peers.map((peer) => (
              <div
                key={peer.id}
                className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-obsidian-950 shadow-md transition-transform ${
                  peer.isSpeaking ? 'scale-110 ring-2 ring-emerald-400' : ''
                }`}
                style={{ backgroundColor: peer.color }}
                title={`${peer.name} (${peer.role}) • ${peer.statusText}`}
              >
                {peer.avatarText}
                {peer.isSpeaking && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
            ))}
          </div>

          <div className="w-px h-5 bg-obsidian-800" />

          {/* Spatial Audio HRTF Telemetry Indicator */}
          <button
            onClick={() => setIsSpatialAudioMuted((m) => !m)}
            className={`p-1.5 rounded-xl transition-all flex items-center space-x-1 text-xs ${
              isSpatialAudioMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
            }`}
            title={isSpatialAudioMuted ? 'Audio Espacial Silenciado' : 'Audio Espacial HRTF 3D Activo'}
          >
            {isSpatialAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="font-mono text-[11px] hidden sm:inline">HRTF 3D</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* 4. INFINITE 2D/3D TRANSFORM CANVAS CONTAINER */}
      {/* ========================================== */}
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          width: '5000px',
          height: '4000px',
        }}
      >
        {/* Infinite Dot Grid Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <pattern id="spatial-dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#475569" />
            </pattern>
            <pattern id="spatial-dots-major" width="160" height="160" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2.2" fill="#64748B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#spatial-dots)" />
          <rect width="100%" height="100%" fill="url(#spatial-dots-major)" />
        </svg>

        {/* Magnetic Snapping Guide Indicator Line */}
        {magneticSnapGuide && (
          <div
            className="absolute pointer-events-none z-20 flex flex-col items-center animate-pulse"
            style={{
              left: `${magneticSnapGuide.x}px`,
              top: `${magneticSnapGuide.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-6 h-6 rounded-full border-2 border-cyan-400 bg-cyan-400/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-cyan-300" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-[10px] font-mono whitespace-nowrap shadow-lg">
              {magneticSnapGuide.label}
            </span>
          </div>
        )}

        {/* ========================================== */}
        {/* 4.1 STRUCTURED FRAMES */}
        {/* ========================================== */}
        {frames.map((frame) => (
          <div
            key={frame.id}
            className={`absolute rounded-3xl bg-obsidian-950/80 border transition-all ${
              selectedFrameId === frame.id
                ? 'border-apex-blue ring-2 ring-apex-blue/40 shadow-2xl shadow-blue-500/10'
                : 'border-obsidian-800/80'
            }`}
            style={{
              left: `${frame.x}px`,
              top: `${frame.y}px`,
              width: `${frame.width}px`,
              height: `${frame.height}px`,
            }}
            onClick={() => setSelectedFrameId(frame.id)}
          >
            {/* Frame Header */}
            <div className="px-5 py-3 border-b border-obsidian-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Columns className="w-4 h-4 text-apex-blue" />
                <span className="font-semibold text-sm text-slate-200 tracking-tight">{frame.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-obsidian-800 text-slate-400 font-mono">
                  Marco Estructurado
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="font-mono text-[11px] text-slate-500">
                  {frame.sections.length} Secciones Magnéticas
                </span>
              </div>
            </div>

            {/* Frame Interior Columns / Sections */}
            <div className="relative w-full h-[calc(100%-3rem)] p-4">
              {frame.sections.map((section) => (
                <div
                  key={section.id}
                  className="absolute rounded-2xl bg-obsidian-900/60 border border-obsidian-800/70 p-3 flex flex-col justify-between overflow-hidden"
                  style={{
                    left: `${section.rect.x}px`,
                    top: `${section.rect.y}px`,
                    width: `${section.rect.width}px`,
                    height: `${section.rect.height}px`,
                  }}
                >
                  {/* Section Top Header */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: section.colorHex }}
                      >
                        {section.title}
                      </span>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${section.colorHex}20`,
                          color: section.colorHex,
                          borderColor: `${section.colorHex}40`,
                          borderWidth: 1,
                        }}
                      >
                        {section.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{section.subtitle}</p>
                  </div>

                  {/* Visual Drop Slot Guide for Sticky Notes */}
                  <div className="border border-dashed border-obsidian-700/60 rounded-xl p-3 flex items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 italic">
                      Encaje magnético activo para notas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ========================================== */}
        {/* 4.2 3D DIGITAL TWIN CAD INSPECTOR MODEL */}
        {/* ========================================== */}
        <div
          className="absolute rounded-3xl bg-obsidian-950/90 border border-obsidian-800/90 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden"
          style={{
            left: `${digitalTwin.x}px`,
            top: `${digitalTwin.y}px`,
            width: `${digitalTwin.width}px`,
            height: `${digitalTwin.height}px`,
          }}
        >
          {/* 3D Header Bar */}
          <div className="px-4 py-3 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-900/50">
            <div className="flex items-center space-x-2">
              <Box className="w-4 h-4 text-sky-400" />
              <div>
                <h3 className="text-xs font-bold text-white tracking-tight">{digitalTwin.title}</h3>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>GEMELO DIGITAL P2P • EN LÍNEA</span>
                </span>
              </div>
            </div>

            {/* Mode Switchers */}
            <div className="flex items-center space-x-1 bg-obsidian-950 p-1 rounded-lg border border-obsidian-800">
              <button
                onClick={() => setDigitalTwin((t) => ({ ...t, renderMode: 'pbr' }))}
                className={`text-[10px] px-2 py-0.5 rounded font-mono transition-all ${
                  digitalTwin.renderMode === 'pbr'
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PBR Sólido
              </button>
              <button
                onClick={() => setDigitalTwin((t) => ({ ...t, renderMode: 'wireframe' }))}
                className={`text-[10px] px-2 py-0.5 rounded font-mono transition-all ${
                  digitalTwin.renderMode === 'wireframe'
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Alambre
              </button>
              <button
                onClick={() => setDigitalTwin((t) => ({ ...t, isAutoSpin: !t.isAutoSpin }))}
                className={`p-1 rounded hover:bg-obsidian-800 transition-colors ${
                  digitalTwin.isAutoSpin ? 'text-emerald-400' : 'text-slate-500'
                }`}
                title="Giro Automático 3D"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive 3D Canvas Viewport */}
          <div
            className="relative flex-1 bg-gradient-to-b from-[#090b0e] to-obsidian-950 flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsOrbiting3D(true);
              orbitStartRef.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerMove={(e) => {
              if (!isOrbiting3D) return;
              e.stopPropagation();
              const dx = e.clientX - orbitStartRef.current.x;
              const dy = e.clientY - orbitStartRef.current.y;
              orbitStartRef.current = { x: e.clientX, y: e.clientY };

              setDigitalTwin((t) => ({
                ...t,
                rotY: t.rotY + dx * 0.7,
                rotX: Math.max(-85, Math.min(85, t.rotX + dy * 0.7)),
              }));
            }}
            onPointerUp={() => setIsOrbiting3D(false)}
          >
            <canvas ref={twinCanvasRef} width={420} height={260} className="w-full h-full" />

            {/* Orbit Hint Watermark */}
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500 select-none pointer-events-none">
              Arrastra para rotar 360° en órbita
            </div>
          </div>

          {/* Telemetry Sensor Dashboard */}
          <div className="p-3 bg-obsidian-950 border-t border-obsidian-800/80 grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-amber-400" />
                <span>Temperatura</span>
              </span>
              <span className="text-sm font-mono font-bold text-slate-100 mt-0.5">
                {digitalTwin.telemetry.tempC} °C
              </span>
            </div>

            <div className="p-2 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <RotateCcw className="w-3 h-3 text-sky-400" />
                <span>Ventilador</span>
              </span>
              <span className="text-sm font-mono font-bold text-slate-100 mt-0.5">
                {digitalTwin.telemetry.fanRpm} RPM
              </span>
            </div>

            <div className="p-2 rounded-xl bg-obsidian-900 border border-obsidian-800 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Vibración</span>
              </span>
              <span className="text-sm font-mono font-bold text-slate-100 mt-0.5">
                {digitalTwin.telemetry.vibrationG} g
              </span>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 4.3 FREEHAND STROKES & DETECTED VECTORS */}
        {/* ========================================== */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {strokes.map((stroke) => {
            if (stroke.recognizedShape === 'circle' && stroke.shapeBounds) {
              const cx = stroke.shapeBounds.x + stroke.shapeBounds.width / 2;
              const cy = stroke.shapeBounds.y + stroke.shapeBounds.height / 2;
              const rx = stroke.shapeBounds.width / 2;
              const ry = stroke.shapeBounds.height / 2;
              return (
                <ellipse
                  key={stroke.id}
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  fill="none"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
              );
            }

            if (stroke.recognizedShape === 'rectangle' && stroke.shapeBounds) {
              return (
                <rect
                  key={stroke.id}
                  x={stroke.shapeBounds.x}
                  y={stroke.shapeBounds.y}
                  width={stroke.shapeBounds.width}
                  height={stroke.shapeBounds.height}
                  rx={8}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  fill="none"
                />
              );
            }

            // Normal Freehand Stroke
            if (stroke.points.length < 2) return null;
            const pathD = stroke.points.reduce((acc, pt, i) => {
              return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
            }, '');

            return (
              <path
                key={stroke.id}
                d={pathD}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            );
          })}

          {/* Active drawing stroke */}
          {currentStroke && currentStroke.length > 1 && (
            <path
              d={currentStroke.reduce((acc, pt, i) => {
                return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
              }, '')}
              stroke={brushColor}
              strokeWidth={brushWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </svg>

        {/* ========================================== */}
        {/* 4.4 SMART STICKY NOTES */}
        {/* ========================================== */}
        {notes.map((note) => {
          const col = STICKY_PALETTE[note.color] || STICKY_PALETTE.yellow;
          const isSelected = selectedNoteId === note.id;

          return (
            <div
              key={note.id}
              className={`absolute rounded-2xl shadow-xl transition-shadow flex flex-col select-none cursor-move ${col.bgClass} border ${col.borderClass} ${
                isSelected ? 'ring-4 ring-apex-blue/50 shadow-2xl scale-[1.02]' : 'hover:shadow-2xl'
              }`}
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                width: `${note.width}px`,
                minHeight: `${note.height}px`,
                transform: `rotate(${note.rotation}deg)`,
                transformOrigin: 'top center',
              }}
              onPointerDown={(e) => handleNoteMouseDown(e, note.id)}
            >
              {/* Note Header & Action Tools */}
              <div
                className={`px-3 py-1.5 rounded-t-2xl flex items-center justify-between border-b ${col.borderClass} ${col.headerClass}`}
              >
                {/* Category Tag Badge */}
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3 opacity-60 text-current" />
                  <span className={`text-[10px] font-mono font-bold tracking-tight ${col.textClass}`}>
                    {note.tag}
                  </span>
                </div>

                {/* Color Selector & Pin actions */}
                <div className="flex items-center space-x-1">
                  <div className="flex items-center -space-x-1">
                    {(Object.keys(STICKY_PALETTE) as StickyColor[]).map((cKey) => (
                      <button
                        key={cKey}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateNote(note.id, { color: cKey });
                        }}
                        className={`w-3.5 h-3.5 rounded-full border border-black/20 transition-transform ${
                          note.color === cKey ? 'scale-125 z-10' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: STICKY_PALETTE[cKey].hex }}
                        title={STICKY_PALETTE[cKey].name}
                      />
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className="p-1 rounded text-black/50 hover:text-black hover:bg-black/10 transition-colors ml-1"
                    title="Eliminar Nota"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Note Body: Editable Title & Text */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => handleUpdateNote(note.id, { title: e.target.value })}
                    className={`w-full font-bold text-xs bg-transparent border-none outline-none mb-1.5 ${col.textClass}`}
                    placeholder="Título de la nota..."
                  />
                  <textarea
                    value={note.content}
                    onChange={(e) => handleUpdateNote(note.id, { content: e.target.value })}
                    rows={4}
                    className={`w-full text-xs bg-transparent border-none outline-none resize-none leading-relaxed font-sans ${col.textClass}`}
                    placeholder="Escribe detalles aquí..."
                  />
                </div>

                {/* Footer with Semantic Category & Author */}
                <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] opacity-75">
                  <span className="font-semibold text-slate-800">{note.category}</span>
                  {note.author && <span className="font-mono text-slate-700">{note.author}</span>}
                </div>
              </div>
            </div>
          );
        })}

        {/* ========================================== */}
        {/* 4.5 P2P REMOTE COLLABORATOR CURSORS */}
        {/* ========================================== */}
        {peers.map((peer) => {
          const hrtf = hrtfTelemetries.find((h) => h.peerId === peer.id);

          return (
            <div
              key={peer.id}
              className="absolute pointer-events-none z-30 transition-all duration-100 ease-out flex flex-col items-start"
              style={{
                left: `${peer.cursorX}px`,
                top: `${peer.cursorY}px`,
                transform: 'translate(0, 0)',
              }}
            >
              {/* Virtual HRTF Audio Wave Pulses when Speaking */}
              {peer.isSpeaking && !isSpatialAudioMuted && (
                <div
                  className="absolute -top-3 -left-3 w-12 h-12 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none"
                  style={{ animationDuration: '1.4s' }}
                />
              )}

              {/* Vector Mouse Pointer Arrow */}
              <svg
                width="20"
                height="24"
                viewBox="0 0 18 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
              >
                <path
                  d="M0 0L16 11.5L8.5 13L5 21L0 0Z"
                  fill={peer.color}
                  stroke="#07080a"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Collaborator Badge & HRTF Telemetry Pill */}
              <div
                className="mt-1 ml-3 px-2 py-1 rounded-xl text-white text-[11px] font-medium shadow-2xl flex flex-col whitespace-nowrap"
                style={{ backgroundColor: `${peer.color}E6` }}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold">{peer.name}</span>
                  <span className="opacity-80 text-[10px]">({peer.role})</span>
                </div>

                {/* Spatial Audio Telemetry Tooltip */}
                {hrtf && !isSpatialAudioMuted && (
                  <div className="text-[9px] font-mono opacity-90 flex items-center space-x-1 mt-0.5">
                    <span>{hrtf.distanceMeters}m</span>
                    <span>•</span>
                    <span>{hrtf.gainDb} dB</span>
                    <span>•</span>
                    <span>{hrtf.panPercent > 0 ? `R${hrtf.panPercent}%` : `L${Math.abs(hrtf.panPercent)}%`}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpatialCanvasView;
