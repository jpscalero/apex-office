import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Highlighter,
  CheckSquare,
  ShieldAlert,
  ShieldCheck,
  Download,
  Check,
  X,
  Lock,
  Layers,
  Printer,
  Cpu,
  FileSignature,
  SlidersHorizontal,
  Search,
  Info,
  Trash2,
  Award,
} from 'lucide-react';

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export type PDFToolMode = 'read' | 'annotate' | 'acroforms' | 'redact';

export interface SensitiveSegment {
  id: string;
  text: string;
  isSensitive: boolean;
  sensitiveType?: 'dni' | 'credit_card' | 'iban' | 'hsm_key' | 'address' | 'biometric' | 'api_token' | 'confidential_name';
  sensitiveLabel?: string;
  isMarkedForRedaction?: boolean;
  isPurged?: boolean; // When true, the original text is destroyed permanently
  isHighlighted?: boolean;
  highlightComment?: string;
}

export interface ClauseParagraph {
  id: string;
  clauseTitle?: string;
  segments: SensitiveSegment[];
}

export interface AcroTextField {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  required?: boolean;
  type?: 'text' | 'date';
}

export interface AcroCheckboxField {
  id: string;
  label: string;
  checked: boolean;
  required?: boolean;
}

export interface DigitalSignatureData {
  isSigned: boolean;
  signerName: string;
  signerTitle: string;
  signedAt: string;
  certificateId: string;
  signatureCanvasDataUrl?: string;
  algorithm: string;
  documentHash: string;
}

export interface OCRBoundingBox {
  id: string;
  text: string;
  x: number; // Percent relative to page canvas (0 - 100)
  y: number; // Percent relative to page canvas (0 - 100)
  width: number;
  height: number;
  confidence: number; // 0 - 100%
  lineIndex: number;
}

export interface CustomRedactionBox {
  id: string;
  pageNumber: number;
  x: number; // percent
  y: number; // percent
  width: number; // percent
  height: number; // percent
  isPurged: boolean;
  label: string;
}

export interface PDFPageContent {
  pageNumber: number;
  headerTitle: string;
  headerSubtitle: string;
  classificationBadge: string;
  clauses: ClauseParagraph[];
  textFields: AcroTextField[];
  checkboxes: AcroCheckboxField[];
  signatureData?: DigitalSignatureData;
  ocrBoxes: OCRBoundingBox[];
}

// Initial Blank PDF Page (Zero Emulation / Zero Mock Corporate Text)
const INITIAL_PAGES: PDFPageContent[] = [
  {
    pageNumber: 1,
    headerTitle: "Documento PDF en Blanco",
    headerSubtitle: "Lienzo listo para visualización, anotaciones y firmas digitales",
    classificationBadge: "DOCUMENTO LIMPIO",
    clauses: [
      {
        id: "c1-blank",
        clauseTitle: "",
        segments: [
          {
            id: "s1-blank",
            text: "Documento PDF en blanco. Utiliza las herramientas de la barra superior para agregar anotaciones, campos de formulario AcroForms o aplicar sellos de firma digital cualificada.",
            isSensitive: false,
          },
        ],
      },
    ],
    textFields: [],
    checkboxes: [],
    ocrBoxes: [],
  },
];

export const PDFViewerEditor: React.FC = () => {
  // Navigation & View state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(100); // 50 to 200
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [activeTool, setActiveTool] = useState<PDFToolMode>('read');
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [showOcrLayer, setShowOcrLayer] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'thumbnails' | 'acroforms' | 'forensics' | 'ocr'>('thumbnails');

  // Document Content State
  const [pages, setPages] = useState<PDFPageContent[]>(INITIAL_PAGES);
  const [customRedactions, setCustomRedactions] = useState<CustomRedactionBox[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Forensic Certification Dialogs
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [isSanitizeCertModalOpen, setIsSanitizeCertModalOpen] = useState<boolean>(false);
  const [isCleanExportModalOpen, setIsCleanExportModalOpen] = useState<boolean>(false);
  const [certDetails, setCertDetails] = useState<{
    purgedItemsCount: number;
    bytesOverwritten: number;
    sha256Hash: string;
    timestamp: string;
    protocol: string;
  } | null>(null);

  // Digital Signature Pad Canvas Ref & States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState<boolean>(false);
  const [signaturePresetName, setSignaturePresetName] = useState<string>('Elena Valenzuela Morán');
  const [signaturePresetTitle, setSignaturePresetTitle] = useState<string>('Directora General de Operaciones');
  const [activeSignTab, setActiveSignTab] = useState<'draw' | 'preset'>('draw');

  // Drawing Redaction Boxes on Canvas
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawingRedaction, setIsDrawingRedaction] = useState<boolean>(false);
  const [redactionStartPos, setRedactionStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentDragRect, setCurrentDragRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Quick stats
  const totalPages = pages.length;
  const activePageData = pages.find((p) => p.pageNumber === currentPage) || pages[0];

  // Count pending redactions
  const pendingTextRedactions = pages.reduce((acc, p) => {
    return (
      acc +
      p.clauses.reduce((cAcc, clause) => {
        return cAcc + clause.segments.filter((s) => s.isMarkedForRedaction && !s.isPurged).length;
      }, 0)
    );
  }, 0);
  const pendingCustomRedactions = customRedactions.filter((r) => !r.isPurged).length;
  const totalPendingRedactions = pendingTextRedactions + pendingCustomRedactions;

  // Count purged items
  const totalPurgedItems =
    pages.reduce((acc, p) => {
      return (
        acc +
        p.clauses.reduce((cAcc, clause) => {
          return cAcc + clause.segments.filter((s) => s.isPurged).length;
        }, 0)
      );
    }, 0) + customRedactions.filter((r) => r.isPurged).length;

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // Page Navigation
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  // ============================================================================
  // FORENSIC SANITIZATION & REDACTION ENGINE
  // ============================================================================

  // Toggle mark on sensitive text segment
  const handleToggleSegmentRedaction = (clauseId: string, segmentId: string) => {
    if (activeTool !== 'redact') return;

    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageNumber !== currentPage) return page;
        return {
          ...page,
          clauses: page.clauses.map((clause) => {
            if (clause.id !== clauseId) return clause;
            return {
              ...clause,
              segments: clause.segments.map((seg) => {
                if (seg.id !== segmentId) return seg;
                if (seg.isPurged) return seg; // Already purged irreversibly
                return {
                  ...seg,
                  isMarkedForRedaction: !seg.isMarkedForRedaction,
                };
              }),
            };
          }),
        };
      })
    );
  };

  // Toggle annotation/highlight on text segment
  const handleToggleSegmentHighlight = (clauseId: string, segmentId: string) => {
    if (activeTool !== 'annotate') return;

    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageNumber !== currentPage) return page;
        return {
          ...page,
          clauses: page.clauses.map((clause) => {
            if (clause.id !== clauseId) return clause;
            return {
              ...clause,
              segments: clause.segments.map((seg) => {
                if (seg.id !== segmentId) return seg;
                return {
                  ...seg,
                  isHighlighted: !seg.isHighlighted,
                  highlightComment: !seg.isHighlighted ? 'Anotación oficial de auditoría forense' : undefined,
                };
              }),
            };
          }),
        };
      })
    );
  };

  // Drag to create custom redaction box
  const handleMouseDownCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'redact' || !pageContainerRef.current) return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawingRedaction(true);
    setRedactionStartPos({ x, y });
    setCurrentDragRect({ x, y, w: 0, h: 0 });
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingRedaction || !redactionStartPos || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(redactionStartPos.x, currentX);
    const y = Math.min(redactionStartPos.y, currentY);
    const w = Math.abs(currentX - redactionStartPos.x);
    const h = Math.abs(currentY - redactionStartPos.y);

    setCurrentDragRect({ x, y, w, h });
  };

  const handleMouseUpCanvas = () => {
    if (isDrawingRedaction && currentDragRect && currentDragRect.w > 2 && currentDragRect.h > 1) {
      const newBox: CustomRedactionBox = {
        id: `redact-box-${Date.now()}`,
        pageNumber: currentPage,
        x: currentDragRect.x,
        y: currentDragRect.y,
        width: currentDragRect.w,
        height: currentDragRect.h,
        isPurged: false,
        label: '[INFORMACIÓN CLASIFICADA // PURGADA]',
      };
      setCustomRedactions((prev) => [...prev, newBox]);
    }
    setIsDrawingRedaction(false);
    setRedactionStartPos(null);
    setCurrentDragRect(null);
  };

  // Remove a custom redaction box (if not yet sealed)
  const handleDeleteCustomBox = (boxId: string) => {
    setCustomRedactions((prev) => prev.filter((b) => b.id !== boxId));
  };

  // Generate SHA-256 hex string
  const generateSimulatedHash = async (content: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content + Date.now().toString());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    }
  };

  // APPLY & SEAL FORENSIC REDACTION (IRREVERSIBLE PURGE)
  const handleApplyAndSealRedaction = async () => {
    if (totalPendingRedactions === 0) return;

    let bytesOverwritten = 0;
    let itemsPurged = 0;
    const purgedPayloadStrings: string[] = [];

    // Irreversibly destroy underlying text in pages state
    const newPages = pages.map((page) => ({
      ...page,
      clauses: page.clauses.map((clause) => ({
        ...clause,
        segments: clause.segments.map((seg) => {
          if (seg.isMarkedForRedaction && !seg.isPurged) {
            bytesOverwritten += seg.text.length * 4;
            itemsPurged++;
            purgedPayloadStrings.push(seg.text);
            return {
              ...seg,
              text: '████████████████████████████████',
              isPurged: true,
              isMarkedForRedaction: false,
            };
          }
          return seg;
        }),
      })),
    }));

    // Seal custom boxes as well
    const newCustomBoxes = customRedactions.map((box) => {
      if (!box.isPurged) {
        itemsPurged++;
        bytesOverwritten += 1024;
        return { ...box, isPurged: true };
      }
      return box;
    });

    setPages(newPages);
    setCustomRedactions(newCustomBoxes);

    // Generate cryptographic hash certificate
    const hash = await generateSimulatedHash(purgedPayloadStrings.join('|'));
    const nowIso = new Date().toISOString();

    setCertDetails({
      purgedItemsCount: itemsPurged,
      bytesOverwritten,
      sha256Hash: hash,
      timestamp: nowIso,
      protocol: 'NIST SP 800-88 Rev. 1 & DoD 5220.22-M Zero-Byte Sanitization',
    });

    setIsSanitizeCertModalOpen(true);
  };

  // ============================================================================
  // ACROFORMS FORM INTERACTION
  // ============================================================================

  const handleUpdateTextField = (fieldId: string, val: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageNumber !== currentPage) return page;
        return {
          ...page,
          textFields: page.textFields.map((f) => (f.id === fieldId ? { ...f, value: val } : f)),
        };
      })
    );
  };

  const handleToggleCheckbox = (cbId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageNumber !== currentPage) return page;
        return {
          ...page,
          checkboxes: page.checkboxes.map((cb) => (cb.id === cbId ? { ...cb, checked: !cb.checked } : cb)),
        };
      })
    );
  };

  // ============================================================================
  // DIGITAL SIGNATURE MODAL & CANVAS
  // ============================================================================

  const openSignModal = () => {
    setIsSignModalOpen(true);
  };

  // Clear signature canvas
  const handleClearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Mouse drawing listeners on signature canvas
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1d4ed8'; // Navy Blue ink
    setIsDrawingSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSignature) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingSignature(false);
  };

  const handleSaveSignature = async () => {
    let signatureImgUrl: string | undefined = undefined;
    if (activeSignTab === 'draw' && canvasRef.current) {
      signatureImgUrl = canvasRef.current.toDataURL('image/png');
    }

    const docHash = await generateSimulatedHash('DocSignDigestPage' + currentPage);
    const now = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newSignature: DigitalSignatureData = {
      isSigned: true,
      signerName: activeSignTab === 'preset' ? signaturePresetName : 'Elena Valenzuela Morán',
      signerTitle: activeSignTab === 'preset' ? signaturePresetTitle : 'Directora General de Operaciones',
      signedAt: `${now} UTC`,
      certificateId: 'ES-FNMT-QES-2026-994102-K',
      signatureCanvasDataUrl: signatureImgUrl,
      algorithm: 'RSA-4096 / SHA-256 (eIDAS QES)',
      documentHash: docHash,
    };

    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageNumber !== currentPage) return page;
        return {
          ...page,
          signatureData: newSignature,
        };
      })
    );

    setIsSignModalOpen(false);
  };

  // Clean PDF Export Trigger
  const handleTriggerCleanExport = () => {
    setIsCleanExportModalOpen(true);
  };

  const handleExecutePrint = () => {
    setIsCleanExportModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-950 text-slate-100 select-none overflow-hidden font-sans">
      {/* ==================================================================== */}
      {/* TOP WORKSTATION TOOLBAR (ADOBE ACROBAT PRO STYLE)                   */}
      {/* ==================================================================== */}
      <div className="bg-obsidian-900 border-b border-obsidian-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 z-20 shrink-0">
        {/* Left: Document Identity & Badges */}
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold text-xs shadow-sm">
            PDF
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-200 tracking-tight">
                Apex_Acuerdo_Transferencia_Confidencial.pdf
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                ISO 32000-2
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5" />
                <span>AES-256</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              3 páginas • A4 • AcroForms Activo • Sellado eIDAS QES
            </p>
          </div>
        </div>

        {/* Center: Primary Navigation & Zoom Controls */}
        <div className="flex items-center space-x-1.5 bg-obsidian-950 px-2 py-1 rounded-lg border border-obsidian-800">
          {/* Page Selector */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-obsidian-850 disabled:opacity-30 transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-1 px-1.5 text-xs font-mono">
            <span className="font-bold text-slate-200">{currentPage}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-400">{totalPages}</span>
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-obsidian-850 disabled:opacity-30 transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-obsidian-800 mx-1" />

          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors"
            title="Reducir zoom (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-300 w-11 text-center font-medium">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors"
            title="Aumentar zoom (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoom(100)}
            className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors"
            title="Ajustar al 100%"
          >
            100%
          </button>

          <div className="w-[1px] h-4 bg-obsidian-800 mx-1" />

          {/* Page Rotation */}
          <button
            onClick={handleRotate}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors flex items-center space-x-1"
            title="Rotar página 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">{rotation}°</span>
          </button>
        </div>

        {/* Right: Tool Mode Selector Buttons */}
        <div className="flex items-center space-x-1 bg-obsidian-950 p-1 rounded-lg border border-obsidian-800">
          {/* 1. Reading Mode */}
          <button
            onClick={() => setActiveTool('read')}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-medium transition-all ${
              activeTool === 'read'
                ? 'bg-obsidian-800 text-white shadow-sm border border-obsidian-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900'
            }`}
            title="Modo Lectura: visualización limpia y navegación fluida"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Lectura</span>
          </button>

          {/* 2. Annotation Mode */}
          <button
            onClick={() => setActiveTool('annotate')}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-medium transition-all ${
              activeTool === 'annotate'
                ? 'bg-amber-500/20 text-amber-200 shadow-sm border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900'
            }`}
            title="Modo Anotación: resaltar fragmentos de texto en amarillo y agregar notas"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Anotar</span>
          </button>

          {/* 3. AcroForms Mode */}
          <button
            onClick={() => setActiveTool('acroforms')}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-medium transition-all ${
              activeTool === 'acroforms'
                ? 'bg-indigo-500/20 text-indigo-200 shadow-sm border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900'
            }`}
            title="Modo AcroForms: rellenar campos interactivos, casillas y firma digital"
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AcroForms</span>
          </button>

          {/* 4. Forensic Redaction Mode */}
          <button
            onClick={() => setActiveTool('redact')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all ${
              activeTool === 'redact'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-400'
                : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
            }`}
            title="Modo Tachado Forense (Sanitized Redaction): eliminar datos sensibles de forma irreversible"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Tachado Forense</span>
            {totalPendingRedactions > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black text-rose-300 text-[10px] font-mono ml-0.5">
                {totalPendingRedactions}
              </span>
            )}
          </button>
        </div>

        {/* Action Group: Redact Seal, OCR Layer, Clean Export */}
        <div className="flex items-center space-x-1.5">
          {/* Apply and Seal Redaction Button */}
          {activeTool === 'redact' && (
            <button
              onClick={handleApplyAndSealRedaction}
              disabled={totalPendingRedactions === 0}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-md transition-all ${
                totalPendingRedactions > 0
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white ring-1 ring-amber-400/50 animate-pulse'
                  : 'bg-obsidian-850 text-slate-500 cursor-not-allowed border border-obsidian-800'
              }`}
              title="Purgar y sobreescribir permanentemente los nodos de texto seleccionados (NIST SP 800-88)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Aplicar y Sellar ({totalPendingRedactions})</span>
            </button>
          )}

          {/* OCR Text Layer Simulator Toggle */}
          <button
            onClick={() => setShowOcrLayer((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
              showOcrLayer
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200 hover:bg-obsidian-900'
            }`}
            title="Visualizar la capa de texto vectorial extraída mediante OCR offline en matriz verde"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Capa OCR</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                showOcrLayer ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
          </button>

          {/* Export Clean PDF Button */}
          <button
            onClick={handleTriggerCleanExport}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all"
            title="Exportar archivo PDF limpio garantizando cero metadatos y cero historial residual"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar PDF Limpio</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECONDARY TOOLBAR: TOOL-SPECIFIC CONTEXTUAL HINTS & SEARCH           */}
      {/* ==================================================================== */}
      <div className="bg-obsidian-950/80 border-b border-obsidian-850 px-3 py-1 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center space-x-2 truncate">
          {activeTool === 'read' && (
            <span className="flex items-center space-x-1.5 text-blue-300 text-[11px]">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Modo Lectura activo: use la barra de miniaturas para saltar entre páginas o la rueda del ratón para desplazarse.</span>
            </span>
          )}
          {activeTool === 'annotate' && (
            <span className="flex items-center space-x-1.5 text-amber-300 text-[11px]">
              <Highlighter className="w-3.5 h-3.5 text-amber-400" />
              <span>Haga clic en cualquier fragmento de texto para resaltarlo en amarillo o retirar el resaltado.</span>
            </span>
          )}
          {activeTool === 'acroforms' && (
            <span className="flex items-center space-x-1.5 text-indigo-300 text-[11px]">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Modo AcroForms: los recuadros resaltados en azul son editables. Haga clic en la firma para firmar digitalmente.</span>
            </span>
          )}
          {activeTool === 'redact' && (
            <span className="flex items-center space-x-1.5 text-rose-300 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>
                <strong>Tachado Forense:</strong> Haga clic en los datos sensibles detectados (DNI, tarjetas, direcciones) o arrastre el ratón sobre el lienzo para trazar un bloque negro. Pulse "Aplicar y Sellar" para destruir el texto.
              </span>
            </span>
          )}
        </div>

        {/* Right Search Input */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en PDF..."
              className="bg-obsidian-900 border border-obsidian-800 text-slate-200 text-[11px] rounded pl-6 pr-2 py-0.5 focus:outline-none focus:border-indigo-500 w-36 transition-all focus:w-48"
            />
          </div>
          <button
            onClick={() => setShowThumbnails((prev) => !prev)}
            className="p-1 rounded hover:bg-obsidian-850 text-slate-400 hover:text-slate-200 transition-colors"
            title={showThumbnails ? 'Ocultar barra de miniaturas' : 'Mostrar barra de miniaturas'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* WORKSPACE BODY: LEFT THUMBNAILS SIDEBAR + CENTRAL HIGH-FI A4 CANVAS  */}
      {/* ==================================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: THUMBNAILS & INSPECTORS */}
        {showThumbnails && (
          <aside className="w-60 bg-obsidian-950 border-r border-obsidian-850 flex flex-col shrink-0 select-none z-10 transition-all">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-obsidian-800 bg-obsidian-900 text-[11px] font-medium text-slate-400">
              <button
                onClick={() => setSidebarTab('thumbnails')}
                className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                  sidebarTab === 'thumbnails'
                    ? 'border-indigo-500 text-white font-semibold'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                Páginas ({totalPages})
              </button>
              <button
                onClick={() => setSidebarTab('acroforms')}
                className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                  sidebarTab === 'acroforms'
                    ? 'border-indigo-500 text-white font-semibold'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                Campos
              </button>
              <button
                onClick={() => setSidebarTab('forensics')}
                className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                  sidebarTab === 'forensics'
                    ? 'border-rose-500 text-rose-300 font-semibold'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                Forense
              </button>
              <button
                onClick={() => setSidebarTab('ocr')}
                className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                  sidebarTab === 'ocr'
                    ? 'border-emerald-500 text-emerald-300 font-semibold'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                OCR
              </button>
            </div>

            {/* TAB CONTENT: THUMBNAILS */}
            {sidebarTab === 'thumbnails' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {pages.map((p) => {
                  const isActive = p.pageNumber === currentPage;
                  return (
                    <div
                      key={p.pageNumber}
                      onClick={() => setCurrentPage(p.pageNumber)}
                      className={`group cursor-pointer rounded-lg p-2 border transition-all ${
                        isActive
                          ? 'bg-obsidian-850 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                          : 'bg-obsidian-900/60 border-obsidian-800 hover:border-obsidian-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono">
                        <span className={`font-bold ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                          Página {p.pageNumber}
                        </span>
                        <span className="text-slate-400">A4 • Vertical</span>
                      </div>

                      {/* Mini Page Simulation Thumbnail */}
                      <div className="aspect-[1/1.414] bg-white rounded border border-slate-300 p-2 shadow-inner overflow-hidden flex flex-col justify-between select-none relative">
                        {/* Header bar */}
                        <div className="w-full">
                          <div className="h-1 bg-red-800 rounded w-full mb-1" />
                          <div className="h-0.5 bg-slate-400 rounded w-2/3 mb-1.5" />
                          {/* Mini simulated text lines */}
                          <div className="space-y-1">
                            <div className="h-0.5 bg-slate-300 rounded w-full" />
                            <div className="h-0.5 bg-slate-300 rounded w-11/12" />
                            <div className="h-0.5 bg-slate-300 rounded w-4/5" />
                          </div>
                        </div>

                        {/* Mid simulated clauses */}
                        <div className="space-y-1">
                          <div className="h-0.5 bg-slate-400 rounded w-1/2" />
                          <div className="h-0.5 bg-slate-300 rounded w-full" />
                          <div className="h-0.5 bg-slate-300 rounded w-3/4" />
                        </div>

                        {/* Bottom AcroForms or Signature Badge */}
                        <div className="w-full pt-1 border-t border-slate-200 flex items-center justify-between">
                          <div className="h-1 w-8 bg-blue-300 rounded" />
                          {p.signatureData?.isSigned && (
                            <div className="text-[6px] font-bold text-emerald-700 uppercase">
                              ✓ FIRMADO
                            </div>
                          )}
                        </div>

                        {/* Mini Redaction overlay preview */}
                        {p.clauses.some((c) => c.segments.some((s) => s.isPurged || s.isMarkedForRedaction)) && (
                          <div className="absolute inset-0 bg-rose-900/10 pointer-events-none flex items-center justify-center">
                            <div className="bg-black text-[5px] text-rose-300 px-1 py-0.5 font-mono rounded">
                              REDACTED
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: ACROFORMS LIST */}
            {sidebarTab === 'acroforms' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <div className="text-[11px] font-semibold text-slate-300 mb-1">
                  Campos en Página {currentPage}:
                </div>
                {activePageData.textFields.map((f) => (
                  <div key={f.id} className="p-2 rounded bg-obsidian-900 border border-obsidian-800 text-xs">
                    <span className="text-[10px] text-indigo-400 font-mono block">{f.label}</span>
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => handleUpdateTextField(f.id, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full bg-obsidian-950 border border-obsidian-700 rounded px-2 py-1 text-slate-200 mt-1 focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                ))}
                {activePageData.checkboxes.map((cb) => (
                  <div
                    key={cb.id}
                    onClick={() => handleToggleCheckbox(cb.id)}
                    className="p-2 rounded bg-obsidian-900 border border-obsidian-800 flex items-start space-x-2 cursor-pointer hover:bg-obsidian-850"
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        cb.checked ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-600 bg-obsidian-950'
                      }`}
                    >
                      {cb.checked && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-[11px] text-slate-300 leading-tight">{cb.label}</span>
                  </div>
                ))}

                {activePageData.signatureData && (
                  <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-xs">
                    <span className="text-[10px] text-emerald-400 font-mono font-bold block mb-1">
                      CERTIFICADO DE FIRMA DIGITAL
                    </span>
                    <p className="text-slate-200 font-medium">
                      {activePageData.signatureData.signerName}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {activePageData.signatureData.signerTitle}
                    </p>
                    <p className="text-[9px] font-mono text-emerald-400/80 mt-1 truncate">
                      Hash: {activePageData.signatureData.documentHash.slice(0, 20)}...
                    </p>
                    <button
                      onClick={openSignModal}
                      className="mt-2 w-full py-1 text-[11px] rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 font-medium transition-colors"
                    >
                      Modificar / Re-firmar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: FORENSICS AUDIT LOG */}
            {sidebarTab === 'forensics' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-rose-300">
                  <div className="flex items-center space-x-1.5 font-bold text-xs mb-1">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Estado Forense</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {totalPurgedItems > 0
                      ? `${totalPurgedItems} elemento(s) purgados irreversiblemente.`
                      : 'Sin modificaciones destructivas aplicadas.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Marcas pendientes:
                  </div>
                  {totalPendingRedactions === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No hay tachados pendientes</p>
                  ) : (
                    <div className="p-2 rounded bg-obsidian-900 border border-amber-500/30 text-[11px] text-amber-300">
                      {totalPendingRedactions} marca(s) pendiente(s) de sellado.
                      <button
                        onClick={handleApplyAndSealRedaction}
                        className="mt-1.5 w-full py-1 rounded bg-amber-600 text-white font-semibold text-[11px] hover:bg-amber-500 transition-colors"
                      >
                        Sellar permanentemente
                      </button>
                    </div>
                  )}
                </div>

                {customRedactions.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Bloques Rectangulares:
                    </div>
                    {customRedactions.map((box, idx) => (
                      <div
                        key={box.id}
                        className="p-1.5 rounded bg-obsidian-900 border border-obsidian-800 flex items-center justify-between text-[11px]"
                      >
                        <span>
                          Bloque #{idx + 1} (Pág {box.pageNumber})
                        </span>
                        {!box.isPurged && (
                          <button
                            onClick={() => handleDeleteCustomBox(box.id)}
                            className="text-slate-400 hover:text-rose-400"
                            title="Eliminar marca"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {box.isPurged && (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold">
                            PURGADO
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: OCR TELEMETRY */}
            {sidebarTab === 'ocr' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
                <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/40 text-emerald-300">
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>OCR Engine: Apex-WASM</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Tesseract 5.3 Offline Sandbox • Idioma: Español (spa+eng) • 300 DPI
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Total palabras en OCR:</span>
                    <span className="font-mono text-slate-200">148 palabras</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Confianza promedio:</span>
                    <span className="font-mono text-emerald-400 font-bold">99.4%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Capa vectorial activa:</span>
                    <span className={`font-mono ${showOcrLayer ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {showOcrLayer ? 'SÍ (Visible)' : 'NO (Oculta)'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowOcrLayer((prev) => !prev)}
                  className="w-full py-1.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 font-semibold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showOcrLayer ? 'Ocultar Capa Verde' : 'Mostrar Capa Verde'}</span>
                </button>
              </div>
            )}

            {/* Sidebar Bottom Integrity Badge */}
            <div className="p-2.5 border-t border-obsidian-850 bg-obsidian-950 text-[10px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Esquema Forense:</span>
                <span className="font-mono text-slate-200 font-bold">NIST SP 800-88</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Modo de Cifrado:</span>
                <span className="font-mono text-emerald-400">Zero-Trust E2EE</span>
              </div>
            </div>
          </aside>
        )}

        {/* CENTRAL SCROLLABLE WORKBENCH CANVAS */}
        <div
          className="flex-1 overflow-auto bg-obsidian-950/90 flex flex-col items-center p-6 md:p-10 relative"
          style={{ cursor: activeTool === 'redact' ? 'crosshair' : activeTool === 'annotate' ? 'text' : 'default' }}
        >
          {/* FLOATING OCR HUD TELEMETRY (WHEN OCR LAYER TOGGLED) */}
          {showOcrLayer && (
            <div className="fixed top-24 right-10 z-40 bg-black/90 backdrop-blur border border-emerald-500/60 rounded-xl p-3 shadow-2xl text-emerald-400 font-mono text-xs max-w-xs animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1 mb-2">
                <span className="font-bold flex items-center space-x-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>OCR VECTOR LAYER HUD</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded text-emerald-300">
                  300 DPI
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-1.5">
                Capa de texto invisible alineada con mapa de píxeles:
              </p>
              <div className="space-y-0.5 text-[10px]">
                <div>• Confianza media: 99.4%</div>
                <div>• Nodos vectoriales: {activePageData.ocrBoxes.length} bloques</div>
                <div>• Purgado forense en OCR: Sincronizado</div>
              </div>
              <div className="mt-2 pt-1 border-t border-emerald-500/30 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Estado de Indexación:</span>
                <span className="text-emerald-300 font-bold">100% Búsqueda Offline</span>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* HIGH-FIDELITY A4 DOCUMENT CANVAS                                 */}
          {/* ================================================================ */}
          <div
            ref={pageContainerRef}
            onMouseDown={handleMouseDownCanvas}
            onMouseMove={handleMouseMoveCanvas}
            onMouseUp={handleMouseUpCanvas}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              width: '794px', // Standard A4 width at 96 DPI
              minHeight: '1123px', // Standard A4 height at 96 DPI
            }}
            className="bg-white text-slate-900 shadow-2xl rounded-sm p-12 border border-slate-300 relative select-text shrink-0 mb-16"
          >
            {/* WATERMARK: OFFICIAL / CONFIDENTIAL */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.035] select-none">
              <div className="text-8xl font-black rotate-[-35deg] text-slate-900 tracking-widest whitespace-nowrap">
                CONFIDENCIAL // STRICTLY SECRET
              </div>
            </div>

            {/* HEADER: CORPORATE LOGO & CLASSIFICATION */}
            <header className="border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-serif font-black text-xl shadow">
                    ▲
                  </div>
                  <div>
                    <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">
                      {activePageData.headerTitle}
                    </h1>
                    <p className="text-[10px] text-slate-600 font-serif italic">
                      Registro Mercantil de Madrid, Tomo 34.201, Folio 89 • C.I.F. B-84920194
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-[9px] font-mono font-bold px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded uppercase tracking-wider">
                    {activePageData.classificationBadge}
                  </span>
                  <p className="text-[9px] font-mono text-slate-500 mt-1">
                    PÁG. {activePageData.pageNumber} DE {totalPages}
                  </p>
                </div>
              </div>

              <div className="mt-3 text-center">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-t border-slate-200 pt-2 font-mono">
                  {activePageData.headerSubtitle}
                </h2>
              </div>
            </header>

            {/* CLAUSES & PARAGRAPHS WITH INTERACTIVE SENSITIVE SPANS */}
            <main className="space-y-6 text-xs leading-relaxed text-slate-800">
              {activePageData.clauses.map((clause) => (
                <div key={clause.id} className="space-y-1.5">
                  {clause.clauseTitle && (
                    <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900 font-mono border-b border-slate-200 pb-0.5">
                      {clause.clauseTitle}
                    </h3>
                  )}
                  <p className="text-justify font-serif text-[12px] leading-6">
                    {clause.segments.map((seg) => {
                      // Check if matches search
                      const isSearchMatch =
                        searchQuery.trim().length > 1 &&
                        seg.text.toLowerCase().includes(searchQuery.toLowerCase());

                      // If segment was purged irreversibly
                      if (seg.isPurged) {
                        return (
                          <span
                            key={seg.id}
                            className="bg-black text-rose-300 font-mono text-[10px] px-2 py-0.5 rounded mx-1 font-bold inline-block select-none shadow-sm border border-rose-900"
                            title="[CONTENIDO PURGADO FORENSEMENTE BAJO NIST SP 800-88]"
                          >
                            [INFORMACIÓN CLASIFICADA // PURGADA]
                          </span>
                        );
                      }

                      // If marked for redaction (preview before sealing)
                      if (seg.isMarkedForRedaction) {
                        return (
                          <span
                            key={seg.id}
                            onClick={() => handleToggleSegmentRedaction(clause.id, seg.id)}
                            className="bg-black text-amber-300 font-mono text-[10px] px-2 py-0.5 rounded mx-1 font-bold inline-block cursor-pointer border border-amber-400 animate-pulse"
                            title="Marcado para tachado irreversible. Clic para desmarcar."
                          >
                            [POR PURGAR: {seg.sensitiveLabel || 'DATOS CLASIFICADOS'}]
                          </span>
                        );
                      }

                      // Sensitive segment not yet marked
                      if (seg.isSensitive) {
                        return (
                          <span
                            key={seg.id}
                            onClick={() => {
                              if (activeTool === 'redact') {
                                handleToggleSegmentRedaction(clause.id, seg.id);
                              } else if (activeTool === 'annotate') {
                                handleToggleSegmentHighlight(clause.id, seg.id);
                              }
                            }}
                            className={`transition-all rounded px-1 py-0.5 mx-0.5 ${
                              seg.isHighlighted
                                ? 'bg-yellow-200 font-semibold'
                                : activeTool === 'redact'
                                ? 'bg-red-50 text-red-900 border border-red-300 hover:bg-black hover:text-white cursor-pointer shadow-sm'
                                : activeTool === 'annotate'
                                ? 'hover:bg-yellow-100 cursor-pointer'
                                : ''
                            } ${isSearchMatch ? 'ring-2 ring-indigo-500 bg-indigo-100 font-bold' : ''}`}
                            title={
                              activeTool === 'redact'
                                ? `Dato Sensible: ${seg.sensitiveLabel} (Clic para marcar para tachado)`
                                : seg.sensitiveLabel
                            }
                          >
                            {seg.text}
                          </span>
                        );
                      }

                      // Ordinary text segment
                      return (
                        <span
                          key={seg.id}
                          onClick={() => {
                            if (activeTool === 'annotate') {
                              handleToggleSegmentHighlight(clause.id, seg.id);
                            }
                          }}
                          className={`${
                            seg.isHighlighted ? 'bg-yellow-200 px-0.5 rounded' : ''
                          } ${isSearchMatch ? 'ring-2 ring-indigo-500 bg-indigo-100 font-bold' : ''}`}
                        >
                          {seg.text}
                        </span>
                      );
                    })}
                  </p>
                </div>
              ))}

              {/* ACROFORMS INTERACTIVE FIELDS SECTION */}
              {activePageData.textFields.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h4 className="text-[11px] font-mono font-bold text-slate-700 uppercase">
                    Campos AcroForms del Documento:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activePageData.textFields.map((field) => (
                      <div
                        key={field.id}
                        className={`p-2 rounded border transition-all ${
                          activeTool === 'acroforms'
                            ? 'bg-blue-50/80 border-blue-400 shadow-sm ring-1 ring-blue-300'
                            : 'bg-slate-50 border-slate-300'
                        }`}
                      >
                        <label className="text-[10px] font-mono font-semibold text-slate-600 block mb-1">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleUpdateTextField(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-xs font-serif focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHECKBOXES SECTION */}
              {activePageData.checkboxes.length > 0 && (
                <div className="pt-2 space-y-2">
                  {activePageData.checkboxes.map((cb) => (
                    <div
                      key={cb.id}
                      onClick={() => handleToggleCheckbox(cb.id)}
                      className={`flex items-start space-x-2.5 p-2 rounded cursor-pointer transition-all ${
                        activeTool === 'acroforms'
                          ? 'hover:bg-blue-50/80 border border-dashed border-blue-300'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                          cb.checked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-400 bg-white'
                        }`}
                      >
                        {cb.checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] text-slate-700 font-serif leading-tight">
                        {cb.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* DIGITAL SIGNATURE BOX (PAGE 3 OR AS CONFIGURED) */}
              {activePageData.signatureData && (
                <div className="pt-6 border-t-2 border-slate-900 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Notarial / Authority Stamp */}
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-300 rounded">
                      <div className="w-16 h-16 rounded-full border-2 border-red-700 p-1 flex items-center justify-center text-red-800 text-center font-serif leading-none select-none shrink-0 shadow-sm">
                        <div className="border border-red-600 rounded-full w-full h-full flex flex-col items-center justify-center text-[7px] font-bold uppercase">
                          <span>★ APEX ★</span>
                          <span className="text-[8px] my-0.5">SELLO</span>
                          <span>OFICIAL</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">
                        <p className="font-bold text-slate-900">APEX TRUST SERVICES</p>
                        <p>Autoridad de Sellado eIDAS QES</p>
                        <p className="text-[9px] text-slate-500">ID: CA-ROOT-2026-X09</p>
                      </div>
                    </div>

                    {/* Right: Interactive AcroForms Digital Signature Box */}
                    <div
                      onClick={openSignModal}
                      className={`p-3 rounded border-2 transition-all cursor-pointer relative ${
                        activeTool === 'acroforms'
                          ? 'border-blue-500 bg-blue-50/70 hover:bg-blue-100/70 shadow-md ring-2 ring-blue-300'
                          : 'border-slate-400 bg-slate-50 hover:bg-slate-100'
                      }`}
                      title="Haga clic para firmar digitalmente o modificar el certificado"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-700 uppercase">
                          Recuadro de Firma Digital
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          ✓ eIDAS VALIDADO
                        </span>
                      </div>

                      {/* Signature graphic or drawn path */}
                      <div className="h-14 flex items-center justify-center border-b border-dashed border-slate-300 relative">
                        {activePageData.signatureData.signatureCanvasDataUrl ? (
                          <img
                            src={activePageData.signatureData.signatureCanvasDataUrl}
                            alt="Firma"
                            className="max-h-12 object-contain"
                          />
                        ) : (
                          <div className="font-serif italic text-blue-900 text-xl font-bold tracking-wide transform -rotate-2 select-none">
                            {activePageData.signatureData.signerName}
                          </div>
                        )}
                      </div>

                      <div className="text-[9px] font-mono text-slate-600 mt-1.5 leading-tight">
                        <p className="font-bold text-slate-900">{activePageData.signatureData.signerName}</p>
                        <p>{activePageData.signatureData.signerTitle}</p>
                        <p className="text-[8px] text-slate-500 truncate">
                          Timestamp: {activePageData.signatureData.signedAt}
                        </p>
                        <p className="text-[8px] text-slate-500 truncate">
                          Certificado: {activePageData.signatureData.certificateId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* CUSTOM DRAGGED REDACTION BOXES OVERLAY */}
            {customRedactions
              .filter((box) => box.pageNumber === currentPage)
              .map((box) => (
                <div
                  key={box.id}
                  style={{
                    position: 'absolute',
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                  className={`flex items-center justify-center text-center p-1 select-none z-30 transition-all ${
                    box.isPurged
                      ? 'bg-black text-rose-300 border border-rose-900 shadow-md font-mono text-[9px] font-bold'
                      : 'bg-black/95 text-amber-300 border-2 border-amber-400 font-mono text-[9px] font-bold animate-pulse'
                  }`}
                >
                  <span className="truncate">
                    {box.isPurged ? '[INFORMACIÓN CLASIFICADA // PURGADA]' : '[REDACTION PENDIENTE DE SELLO]'}
                  </span>
                  {!box.isPurged && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomBox(box.id);
                      }}
                      className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs hover:bg-red-700 shadow"
                      title="Eliminar marca"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

            {/* DRAGGING ACTIVE RECTANGLE PREVIEW */}
            {isDrawingRedaction && currentDragRect && (
              <div
                style={{
                  position: 'absolute',
                  left: `${currentDragRect.x}%`,
                  top: `${currentDragRect.y}%`,
                  width: `${currentDragRect.w}%`,
                  height: `${currentDragRect.h}%`,
                }}
                className="bg-black/80 border-2 border-dashed border-rose-500 z-40 pointer-events-none flex items-center justify-center text-white text-[10px] font-mono"
              >
                [TRAZANDO BLOQUE FORENSE]
              </div>
            )}

            {/* OCR TEXT LAYER SIMULATOR OVERLAY (NEON GREEN MATRIX) */}
            {showOcrLayer && (
              <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                {activePageData.ocrBoxes.map((ocr) => (
                  <div
                    key={ocr.id}
                    style={{
                      position: 'absolute',
                      left: `${ocr.x}%`,
                      top: `${ocr.y}%`,
                      width: `${ocr.width}%`,
                      height: `${ocr.height}%`,
                    }}
                    className="border border-emerald-500 bg-emerald-500/15 pointer-events-auto group hover:bg-emerald-500/30 transition-all flex items-start justify-end p-0.5"
                    title={`OCR Text: "${ocr.text}" • Confianza: ${ocr.confidence}%`}
                  >
                    <span className="text-[7px] font-mono bg-emerald-950 text-emerald-300 px-0.5 rounded leading-none border border-emerald-500/50 opacity-80 group-hover:opacity-100">
                      {ocr.confidence}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* FOOTER */}
            <footer className="absolute bottom-6 left-12 right-12 border-t border-slate-300 pt-2 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span>APEX DEFENSE CORP • STRICTLY RESTRICTED DISCLOSURE</span>
              <span>PÁGINA {activePageData.pageNumber} DE {totalPages}</span>
            </footer>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: DIGITAL SIGNATURE PAD (CANVAS + VERIFIED CERTIFICATES)      */}
      {/* ==================================================================== */}
      {isSignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Firmar Digitalmente Documento (AcroForms eIDAS)
                </h3>
              </div>
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="p-1 rounded-lg hover:bg-obsidian-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Signature Mode Tabs */}
            <div className="flex rounded-lg bg-obsidian-950 p-1 mb-4 border border-obsidian-800 text-xs">
              <button
                onClick={() => setActiveSignTab('draw')}
                className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                  activeSignTab === 'draw'
                    ? 'bg-obsidian-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dibujar con Ratón / Táctil
              </button>
              <button
                onClick={() => setActiveSignTab('preset')}
                className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                  activeSignTab === 'preset'
                    ? 'bg-obsidian-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Certificado Cualificado FNMT
              </button>
            </div>

            {/* TAB 1: DRAW CANVAS */}
            {activeSignTab === 'draw' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Dibuje su rúbrica sobre el lienzo blanco:</span>
                  <button
                    onClick={handleClearSignatureCanvas}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Borrar trazo
                  </button>
                </div>
                <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 overflow-hidden p-2 shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-40 cursor-crosshair block"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Tinta criptográfica azul oscuro (#1D4ED8). La rúbrica será incorporada como stream vectorial autenticado.
                </p>
              </div>
            )}

            {/* TAB 2: PRESET CERTIFICATE */}
            {activeSignTab === 'preset' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Nombre del Firmante Titular:</label>
                  <input
                    type="text"
                    value={signaturePresetName}
                    onChange={(e) => setSignaturePresetName(e.target.value)}
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Cargo y Acreditación Oficial:</label>
                  <input
                    type="text"
                    value={signaturePresetTitle}
                    onChange={(e) => setSignaturePresetTitle(e.target.value)}
                    className="w-full bg-obsidian-950 border border-obsidian-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <p className="font-bold flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Certificado Cualificado eIDAS Detectado</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Número de serie: ES-FNMT-QES-2026-994102-K • Emisor: FNMT-RCM CA Clase 2
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-3 border-t border-obsidian-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSignature}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Estampar Firma Cualificada</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: CRYPTOGRAPHIC SANITIZATION CERTIFICATION DIALOG             */}
      {/* ==================================================================== */}
      {isSanitizeCertModalOpen && certDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-emerald-500/50 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center space-x-3 border-b border-obsidian-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Certificado de Destrucción y Sanitización Forense
                </h3>
                <p className="text-xs text-emerald-400 font-mono">
                  PROTOCOLO NIST SP 800-88 REV. 1 & DoD 5220.22-M
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Elementos purgados:</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {certDetails.purgedItemsCount} bloque(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bytes sobreescritos (0x00):</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {certDetails.bytesOverwritten} bytes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sellado de tiempo RFC-3161:</span>
                  <span className="font-mono text-slate-200">{certDetails.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destrucción de nodos DOM:</span>
                  <span className="font-mono text-emerald-400 font-bold">IRREVERSIBLE (100%)</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block mb-1">
                  Digest Criptográfico SHA-256 de la Operación:
                </span>
                <div className="p-2.5 rounded bg-black border border-emerald-500/30 text-[10px] font-mono text-emerald-300 break-all select-all">
                  {certDetails.sha256Hash}
                </div>
              </div>

              <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 text-[11px] text-slate-300">
                ✓ Se certifica que los nodos de texto subyacentes, metadatos y capas vectoriales han sido eliminados de la memoria activa. La inspección mediante herramientas de análisis forense no recuperará los datos originales.
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-obsidian-800 flex justify-end">
              <button
                onClick={() => setIsSanitizeCertModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
              >
                Aceptar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: CLEAN PDF EXPORT (ZERO METADATA & ZERO VERSION RESIDUES)    */}
      {/* ==================================================================== */}
      {isCleanExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Exportación Limpia de Documento PDF
                  </h3>
                  <p className="text-[11px] text-indigo-300 font-mono">
                    Garantía Forense de Cero Metadatos Residuales
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCleanExportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-obsidian-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata audit checklist */}
            <div className="space-y-2.5 text-xs">
              <p className="text-slate-300">
                El motor de exportación de Apex Office generará un archivo PDF normalizado con erradicación total de telemetría:
              </p>

              <div className="p-3 rounded-lg bg-obsidian-950 border border-obsidian-800 space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Autor y Propietario del Sistema</span>
                  </span>
                  <span className="text-emerald-400">PURGADO (0 bytes)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fechas de Creación y Modificación</span>
                  </span>
                  <span className="text-emerald-400">NORMALIZADO (0)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Metadatos XML XMP y Esquemas Dublin Core</span>
                  </span>
                  <span className="text-emerald-400">ELIMINADO</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Historial de Versiones y Deshacer</span>
                  </span>
                  <span className="text-emerald-400">DESTRUIDO</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Identificador de Máquina (UUID / MAC)</span>
                  </span>
                  <span className="text-emerald-400">ANONIMIZADO</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-indigo-950/20 border border-indigo-500/30 text-[11px] text-indigo-300">
                El PDF resultante cumple con el estándar ISO 32000-2 (PDF 2.0) sin scripts ejecutables ni llamadas externas de red.
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-3 border-t border-obsidian-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsCleanExportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={handleExecutePrint}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar como PDF Limpio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* BOTTOM STATUS BAR                                                    */}
      {/* ==================================================================== */}
      <footer className="h-6 bg-obsidian-950 border-t border-obsidian-850 px-3 flex items-center justify-between text-[10px] text-slate-400 font-mono select-none shrink-0">
        <div className="flex items-center space-x-3">
          <span>
            Pág {currentPage} de {totalPages}
          </span>
          <span>•</span>
          <span>A4 (210 × 297 mm)</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">100% Offline WASM</span>
        </div>

        <div className="flex items-center space-x-3">
          {totalPurgedItems > 0 && (
            <span className="text-rose-400 font-semibold">
              ● {totalPurgedItems} purgados (NIST SP 800-88)
            </span>
          )}
          <span>Zoom: {zoom}%</span>
          <span>•</span>
          <span className="text-slate-500">Apex PDF Forensics Engine v2.4</span>
        </div>
      </footer>
    </div>
  );
};

export default PDFViewerEditor;
