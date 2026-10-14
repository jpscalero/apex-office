import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FileText,
  Sheet,
  Presentation,
  Database,
  Calendar,
  ShieldCheck,
  Download,
  Maximize2,
  Plus,
  Terminal,
  FolderKanban,
  FileCheck,
  Network,
  Cpu,
  Layers,
  BarChart3,
  Bot,
  FileCode,
  History,
  Lock,
  Sun,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setModule,
    setExportModalOpen,
    setSecurityModalOpen,
    toggleAICopilot,
    toggleMacroIDE,
    toggleTimeMachine,
    togglePrivacyCenter,
    toggleTheme,
    toggleZenMode,
    createDoc,
    createSpreadsheet,
    addSlide,
    runAudit,
  } = useOfficeStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global key listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const commands: CommandItem[] = [
    {
      id: 'nav-writer',
      title: 'Cambiar a Apex Writer (Procesador de Texto)',
      category: 'Navegación',
      icon: FileText,
      shortcut: 'Alt+1',
      action: () => {
        setModule('writer');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-calc',
      title: 'Cambiar a Apex Calc (Hoja de Cálculo Reactiva)',
      category: 'Navegación',
      icon: Sheet,
      shortcut: 'Alt+2',
      action: () => {
        setModule('calc');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-slides',
      title: 'Cambiar a Apex Slides (Presentaciones Dinámicas)',
      category: 'Navegación',
      icon: Presentation,
      shortcut: 'Alt+3',
      action: () => {
        setModule('slides');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-vault',
      title: 'Cambiar a Apex Vault (Base de Datos Relacional)',
      category: 'Navegación',
      icon: Database,
      shortcut: 'Alt+4',
      action: () => {
        setModule('vault');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-agenda',
      title: 'Cambiar a Apex Agenda & Correo',
      category: 'Navegación',
      icon: Calendar,
      shortcut: 'Alt+5',
      action: () => {
        setModule('agenda');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-project',
      title: 'Cambiar a Apex Project (Gantt & Ruta Crítica CPM)',
      category: 'Navegación',
      icon: FolderKanban,
      shortcut: 'Alt+6',
      action: () => {
        setModule('project');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-pdf',
      title: 'Cambiar a Apex PDF Pro (Editor Forense & AcroForms)',
      category: 'Navegación',
      icon: FileCheck,
      shortcut: 'Alt+7',
      action: () => {
        setModule('pdf');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-diagram',
      title: 'Cambiar a Apex Diagram (Modelado BPMN 2.0 & UML 2.5)',
      category: 'Navegación',
      icon: Network,
      shortcut: 'Alt+8',
      action: () => {
        setModule('diagram');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-science',
      title: 'Cambiar a Apex Science (Cuaderno Científico & CAS Simbólico)',
      category: 'Navegación',
      icon: Cpu,
      shortcut: 'Alt+9',
      action: () => {
        setModule('science');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-canvas',
      title: 'Cambiar a Apex Canvas (Pizarra Espacial Infinita & Gemelos 3D)',
      category: 'Navegación',
      icon: Layers,
      action: () => {
        setModule('canvas');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'nav-bi',
      title: 'Cambiar a Apex Data Warehouse (Business Intelligence & DuckDB)',
      category: 'Navegación',
      icon: BarChart3,
      action: () => {
        setModule('bi');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-ai-copilot',
      title: 'Abrir Copiloto Neural Soberano (IA Local WebGPU 100% Offline)',
      category: 'Herramientas Inteligentes',
      icon: Bot,
      shortcut: 'Ctrl+Shift+A',
      action: () => {
        toggleAICopilot();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-macro-ide',
      title: 'Abrir Studio de Macros & Automatización TypeScript',
      category: 'Herramientas Inteligentes',
      icon: FileCode,
      shortcut: 'Alt+F11',
      action: () => {
        toggleMacroIDE();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-time-machine',
      title: 'Abrir Time Machine Criptográfica & Control de Revisiones Merkle',
      category: 'Herramientas Inteligentes',
      icon: History,
      shortcut: 'Ctrl+Shift+H',
      action: () => {
        toggleTimeMachine();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-new-doc',
      title: 'Crear nuevo Documento en Writer',
      category: 'Acciones Rápidas',
      icon: Plus,
      action: () => {
        setModule('writer');
        createDoc();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-new-sheet',
      title: 'Crear nueva Hoja de Cálculo',
      category: 'Acciones Rápidas',
      icon: Plus,
      action: () => {
        setModule('calc');
        createSpreadsheet();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'act-new-slide',
      title: 'Añadir nueva Diapositiva',
      category: 'Acciones Rápidas',
      icon: Plus,
      action: () => {
        setModule('slides');
        addSlide();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'sec-audit',
      title: 'Ejecutar Auditoría de Seguridad Zero-Trust (DDE/XXE/Metadata)',
      category: 'Ciberseguridad',
      icon: ShieldCheck,
      action: () => {
        runAudit();
        setSecurityModalOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'sec-privacy',
      title: 'Abrir Centro de Privacidad, RGPD y Soberanía Local (Zero-Cloud)',
      category: 'Ciberseguridad & Privacidad',
      icon: Lock,
      shortcut: 'Ctrl+Shift+P',
      action: () => {
        togglePrivacyCenter();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'tool-theme',
      title: 'Alternar Tema de Interfaz (Clásico Normal / Oscuro Obsidian)',
      category: 'Apariencia',
      icon: Sun,
      action: () => {
        toggleTheme();
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'tool-export',
      title: 'Exportar archivo actual (PDF, Markdown, CSV, JSON)',
      category: 'Herramientas',
      icon: Download,
      action: () => {
        setExportModalOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'tool-zen',
      title: 'Alternar Modo Zen / Concentración',
      category: 'Herramientas',
      icon: Maximize2,
      shortcut: 'Shift+F',
      action: () => {
        toggleZenMode();
        setCommandPaletteOpen(false);
      },
    },
  ];

  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-obsidian-900 border border-obsidian-700 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-obsidian-800 bg-obsidian-950">
          <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Escribe un comando o busca una función... (ej. 'Writer', 'Seguridad', 'Exportar')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInput}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] bg-obsidian-800 text-slate-400 px-2 py-0.5 rounded border border-obsidian-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No se encontraron comandos para &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-600/20 text-white border border-indigo-500/30' : 'text-slate-300 hover:bg-obsidian-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-indigo-500 text-white' : 'bg-obsidian-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{cmd.title}</p>
                      <p className="text-[10px] text-slate-400">{cmd.category}</p>
                    </div>
                  </div>
                  {cmd.shortcut && (
                    <span className="text-[10px] font-mono text-slate-400 bg-obsidian-950 px-2 py-0.5 rounded border border-obsidian-800">
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-obsidian-800 bg-obsidian-950 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-2">
            <Terminal className="w-3 h-3 text-indigo-400" />
            <span>Navega con ↑↓ y pulsa Enter</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">Apex Suite Universal CLI</span>
        </div>
      </div>
    </div>
  );
};
