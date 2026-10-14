import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Download,
  Printer,
  Undo2,
  Redo2,
  Scissors,
  Copy,
  Clipboard,
  Search,
  Replace,
  Eye,
  Maximize2,
  Table,
  Image,
  Link2,
  Hash,
  Clock,
  ShieldCheck,
  HelpCircle,
  Settings,
  X,
  Type,
  FileDown,
  Bot,
  FileCode,
  History,
  Lock,
  Cookie,
  Megaphone,
  Heart,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

interface MenuItem {
  label?: string;
  icon?: React.ElementType;
  shortcut?: string;
  action?: () => void;
  type?: 'divider';
}

export const OfficeMenuBar: React.FC = () => {
  const {
    currentModule,
    setExportModalOpen,
    setSecurityModalOpen,
    toggleZenMode,
    setCommandPaletteOpen,
    toggleAICopilot,
    toggleMacroIDE,
    toggleTimeMachine,
    togglePrivacyCenter,
    setActivePrivacyTab,
    setPrivacyCenterOpen,
    setAdManagerOpen,
    toggleDonationModal,
    createDoc,
    createSpreadsheet,
    addSlide,
    runAudit,
  } = useOfficeStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (callback: () => void) => {
    callback();
    setActiveMenu(null);
  };

  const handleNativeOpen = async () => {
    if (typeof window !== 'undefined' && window.apexNative) {
      const res = await window.apexNative.openFile({});
      if (!res.canceled && res.content) {
        if (currentModule === 'writer') {
          createDoc(res.fileName || 'Documento Importado');
        }
      }
    } else {
      // Browser input file trigger fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md,.html,.json,.csv';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content && currentModule === 'writer') {
              createDoc(file.name);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
    setActiveMenu(null);
  };

  const menuItems: { id: string; label: string; items: MenuItem[] }[] = [
    {
      id: 'archivo',
      label: 'Archivo',
      items: [
        {
          label: 'Nuevo Documento',
          icon: FileText,
          shortcut: 'Ctrl+N',
          action: () => (currentModule === 'writer' ? createDoc() : currentModule === 'calc' ? createSpreadsheet() : addSlide()),
        },
        {
          label: 'Abrir desde este equipo...',
          icon: FolderOpen,
          shortcut: 'Ctrl+O',
          action: handleNativeOpen,
        },
        { type: 'divider' },
        {
          label: 'Guardar / Exportar...',
          icon: Save,
          shortcut: 'Ctrl+S',
          action: () => setExportModalOpen(true),
        },
        {
          label: 'Exportar en formatos abiertos (PDF, DOCX, CSV)...',
          icon: Download,
          shortcut: 'Ctrl+Shift+E',
          action: () => setExportModalOpen(true),
        },
        { type: 'divider' },
        {
          label: 'Imprimir documento...',
          icon: Printer,
          shortcut: 'Ctrl+P',
          action: () => window.print(),
        },
        { type: 'divider' },
        {
          label: 'Cerrar / Salir',
          icon: X,
          shortcut: 'Alt+F4',
          action: () => {
            if (window.apexNative) window.apexNative.closeWindow();
          },
        },
      ],
    },
    {
      id: 'editar',
      label: 'Editar',
      items: [
        {
          label: 'Deshacer',
          icon: Undo2,
          shortcut: 'Ctrl+Z',
          action: () => document.execCommand('undo'),
        },
        {
          label: 'Rehacer',
          icon: Redo2,
          shortcut: 'Ctrl+Y',
          action: () => document.execCommand('redo'),
        },
        { type: 'divider' },
        {
          label: 'Cortar',
          icon: Scissors,
          shortcut: 'Ctrl+X',
          action: () => document.execCommand('cut'),
        },
        {
          label: 'Copiar',
          icon: Copy,
          shortcut: 'Ctrl+C',
          action: () => document.execCommand('copy'),
        },
        {
          label: 'Pegar',
          icon: Clipboard,
          shortcut: 'Ctrl+V',
          action: () => document.execCommand('paste'),
        },
        { type: 'divider' },
        {
          label: 'Seleccionar Todo',
          icon: Type,
          shortcut: 'Ctrl+A',
          action: () => document.execCommand('selectAll'),
        },
        {
          label: 'Buscar y Reemplazar...',
          icon: Replace,
          shortcut: 'Ctrl+H',
          action: () => setCommandPaletteOpen(true),
        },
      ],
    },
    {
      id: 'ver',
      label: 'Ver',
      items: [
        {
          label: 'Modo Diseño de Impresión (A4 Paginado)',
          icon: Eye,
          action: () => {},
        },
        {
          label: 'Modo Concentración / Zen',
          icon: Maximize2,
          shortcut: 'Shift+F',
          action: toggleZenMode,
        },
        {
          label: 'Paleta Universal de Comandos...',
          icon: Search,
          shortcut: 'Ctrl+K',
          action: () => setCommandPaletteOpen(true),
        },
        { type: 'divider' },
        {
          label: 'Zoom: 100% (Normal)',
          action: () => {},
        },
        {
          label: 'Zoom: 125% (Lectura)',
          action: () => {},
        },
        {
          label: 'Zoom: 150% (Grande)',
          action: () => {},
        },
      ],
    },
    {
      id: 'insertar',
      label: 'Insertar',
      items: [
        {
          label: 'Tabla Estructurada...',
          icon: Table,
          action: () => {
            const tableHtml = `<table style="width:100%;border-collapse:collapse;margin:1rem 0;"><thead><tr style="background:#1e293b;color:#f8fafc;"><th style="border:1px solid #334155;padding:8px;">Columna 1</th><th style="border:1px solid #334155;padding:8px;">Columna 2</th><th style="border:1px solid #334155;padding:8px;">Columna 3</th></tr></thead><tbody><tr><td style="border:1px solid #334155;padding:8px;">Dato 1</td><td style="border:1px solid #334155;padding:8px;">Dato 2</td><td style="border:1px solid #334155;padding:8px;">Dato 3</td></tr></tbody></table><p></p>`;
            document.execCommand('insertHTML', false, tableHtml);
          },
        },
        {
          label: 'Imagen desde Archivo o URL...',
          icon: Image,
          action: () => {
            const url = prompt('Introduce la URL de la imagen (o pega un enlace seguro):');
            if (url) document.execCommand('insertImage', false, url);
          },
        },
        {
          label: 'Hipervínculo Seguro...',
          icon: Link2,
          shortcut: 'Ctrl+K',
          action: () => {
            const url = prompt('Introduce la URL del hipervínculo:');
            if (url) document.execCommand('createLink', false, url);
          },
        },
        {
          label: 'Salto de Página',
          icon: FileDown,
          shortcut: 'Ctrl+Enter',
          action: () => document.execCommand('insertHorizontalRule'),
        },
        {
          label: 'Fecha y Hora Actual',
          icon: Clock,
          action: () => {
            const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            document.execCommand('insertText', false, ` ${dateStr} `);
          },
        },
        {
          label: 'Caracteres y Símbolos Especiales (€, ©, ®, ™, ±, ∞)...',
          icon: Hash,
          action: () => {
            const sym = prompt('Elige un símbolo para insertar: € © ® ™ ± ≠ ≤ ≥ ∞ π √');
            if (sym) document.execCommand('insertText', false, sym);
          },
        },
      ],
    },
    {
      id: 'formato',
      label: 'Formato',
      items: [
        {
          label: 'Negrita',
          shortcut: 'Ctrl+B',
          action: () => document.execCommand('bold'),
        },
        {
          label: 'Cursiva',
          shortcut: 'Ctrl+I',
          action: () => document.execCommand('italic'),
        },
        {
          label: 'Subrayado',
          shortcut: 'Ctrl+U',
          action: () => document.execCommand('underline'),
        },
        {
          label: 'Tachado',
          action: () => document.execCommand('strikeThrough'),
        },
        { type: 'divider' },
        {
          label: 'Alinear a la Izquierda',
          shortcut: 'Ctrl+L',
          action: () => document.execCommand('justifyLeft'),
        },
        {
          label: 'Centrar',
          shortcut: 'Ctrl+E',
          action: () => document.execCommand('justifyCenter'),
        },
        {
          label: 'Alinear a la Derecha',
          shortcut: 'Ctrl+R',
          action: () => document.execCommand('justifyRight'),
        },
        {
          label: 'Justificar Párrafo',
          shortcut: 'Ctrl+J',
          action: () => document.execCommand('justifyFull'),
        },
        { type: 'divider' },
        {
          label: 'Limpiar Todo el Formato',
          action: () => document.execCommand('removeFormat'),
        },
      ],
    },
    {
      id: 'herramientas',
      label: 'Herramientas',
      items: [
        {
          label: 'Copiloto Neural Soberano (IA Local WebGPU)...',
          icon: Bot,
          shortcut: 'Ctrl+Shift+A',
          action: toggleAICopilot,
        },
        {
          label: 'Studio de Macros & TypeScript IDE...',
          icon: FileCode,
          shortcut: 'Alt+F11',
          action: toggleMacroIDE,
        },
        {
          label: 'Time Machine Criptográfica & Snapshots...',
          icon: History,
          shortcut: 'Ctrl+Shift+H',
          action: toggleTimeMachine,
        },
        { type: 'divider' },
        {
          label: 'Auditoría de Ciberseguridad Zero-Trust (DDE/XXE/Metadata)...',
          icon: ShieldCheck,
          action: () => {
            runAudit();
            setSecurityModalOpen(true);
          },
        },
        {
          label: 'Centro de Privacidad & Protección de Datos (RGPD)...',
          icon: Lock,
          shortcut: 'Ctrl+Shift+P',
          action: togglePrivacyCenter,
        },
        {
          label: 'Gestión de Cookies & LSSI-CE...',
          icon: Cookie,
          action: () => {
            setActivePrivacyTab('cookies');
            setPrivacyCenterOpen(true);
          },
        },
        {
          label: 'Publicidad & Licencia Pro...',
          icon: Megaphone,
          action: () => setAdManagerOpen(true),
        },
        {
          label: 'Apoyar el Proyecto / Donar (Revolut Bank)...',
          icon: Heart,
          action: toggleDonationModal,
        },
        {
          label: 'Paleta Universal de Comandos CLI...',
          icon: Search,
          shortcut: 'Ctrl+K',
          action: () => setCommandPaletteOpen(true),
        },
      ],
    },
    {
      id: 'ayuda',
      label: 'Ayuda',
      items: [
        {
          label: 'Acerca de Apex Office Suite v1.0...',
          icon: HelpCircle,
          action: () => alert('Apex Office Suite v1.0 • Suite Ofimática Libre, Nativa y Segura.\nProtegida contra inyección DDE, fórmulas maliciosas, macros vulnerables y fugas NetNTLM.\n100% Offline / Local-First.'),
        },
        {
          label: 'Apoyar el Proyecto / Donar (Revolut)...',
          icon: Heart,
          action: toggleDonationModal,
        },
        {
          label: 'Cumplimiento Legal & Privacidad (RGPD / LOPDGDD)...',
          icon: Lock,
          action: togglePrivacyCenter,
        },
        {
          label: 'Política de Cookies y Guía AEPD...',
          icon: Cookie,
          action: () => {
            setActivePrivacyTab('cookies');
            setPrivacyCenterOpen(true);
          },
        },
        {
          label: 'Patrocinios, Anuncios y Versión Pro...',
          icon: Megaphone,
          action: () => setAdManagerOpen(true),
        },
        {
          label: 'Atajos de Teclado de Productividad...',
          icon: Settings,
          action: () => alert('Atajos principales:\n• Ctrl+K: Paleta universal de comandos\n• Ctrl+B/I/U: Negrita, Cursiva, Subrayado\n• Ctrl+Z/Y: Deshacer / Rehacer\n• Shift+F: Modo Zen / Concentración\n• F5: Iniciar Presentación de Diapositivas'),
        },
      ],
    },
  ];

  return (
    <div ref={menuRef} className="relative h-7 bg-obsidian-950 border-b border-obsidian-850 px-2 flex items-center select-none z-40 shrink-0 text-xs">
      <div className="flex items-center space-x-1">
        {menuItems.map((menu) => {
          const isOpen = activeMenu === menu.id;
          return (
            <div key={menu.id} className="relative">
              <button
                onClick={() => setActiveMenu(isOpen ? null : menu.id)}
                onMouseEnter={() => {
                  if (activeMenu) setActiveMenu(menu.id);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  isOpen
                    ? 'bg-obsidian-800 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-obsidian-850'
                }`}
              >
                {menu.label}
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute top-full left-0 mt-0.5 min-w-[340px] w-max max-w-[460px] bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-xl shadow-2xl p-1 z-50 text-slate-800 dark:text-slate-200 animate-in fade-in-50 duration-100 ring-1 ring-black/10 dark:ring-white/10">
                  {menu.items.map((item, idx) => {
                    if (item.type === 'divider') {
                      return <div key={idx} className="h-[1px] bg-slate-200 dark:bg-obsidian-800 my-1" />;
                    }
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAction(item.action!)}
                        className="w-full px-3 py-1.5 text-left text-xs rounded-lg hover:bg-indigo-600 hover:text-white flex items-center justify-between gap-6 group transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          {Icon ? (
                            <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-white shrink-0" />
                          ) : (
                            <div className="w-3.5 shrink-0" />
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.shortcut && (
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-200 shrink-0 pl-2">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right subtle indicator */}
      <div className="ml-auto flex items-center space-x-2 text-[10px] font-mono text-slate-400 pr-2">
        <span>Apex Engine v2.4</span>
        <span>•</span>
        <span className="text-emerald-400 font-semibold">100% Offline</span>
      </div>
    </div>
  );
};
