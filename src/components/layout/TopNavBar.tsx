import React, { useState } from 'react';
import {
  FileText,
  Sheet,
  Presentation,
  Database,
  Calendar,
  ShieldCheck,
  Download,
  Search,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Sparkles,
  Monitor,
  FolderKanban,
  FileCheck,
  Network,
  Cpu,
  Layers,
  BarChart3,
  Bot,
  FileCode,
  History,
  Sun,
  Moon,
  Lock,
  Cookie,
  Crown,
  Heart,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { OfficeModule } from '../../types';

export const TopNavBar: React.FC = () => {
  const {
    currentModule,
    setModule,
    zenMode,
    toggleZenMode,
    setCommandPaletteOpen,
    setExportModalOpen,
    setSecurityModalOpen,
    toggleAICopilot,
    toggleMacroIDE,
    toggleTimeMachine,
    togglePrivacyCenter,
    setActivePrivacyTab,
    setPrivacyCenterOpen,
    isProLicense,
    setAdManagerOpen,
    toggleDonationModal,
    theme,
    toggleTheme,
    docs,
    activeDocId,
    updateDocTitle,
    spreadsheets,
    activeSpreadsheetId,
    decks,
    activeDeckId,
  } = useOfficeStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Get active item title depending on module
  let activeTitle = 'Documento sin título';
  if (currentModule === 'writer') {
    const doc = docs.find((d) => d.id === activeDocId);
    if (doc) activeTitle = doc.title;
  } else if (currentModule === 'calc') {
    const sheet = spreadsheets.find((s) => s.id === activeSpreadsheetId);
    if (sheet) activeTitle = sheet.title;
  } else if (currentModule === 'slides') {
    const deck = decks.find((d) => d.id === activeDeckId);
    if (deck) activeTitle = deck.title;
  } else if (currentModule === 'vault') {
    activeTitle = 'Apex Vault • Base de Datos Relacional SQLite';
  } else if (currentModule === 'agenda') {
    activeTitle = 'Apex Agenda & Correo Corporativo';
  } else if (currentModule === 'project') {
    activeTitle = 'Apex Project • Cronograma Gantt & Ruta Crítica CPM';
  } else if (currentModule === 'pdf') {
    activeTitle = 'Apex PDF Pro • Editor Forense & Sanitized Redaction';
  } else if (currentModule === 'diagram') {
    activeTitle = 'Apex Diagram • Diagramación Vectorial BPMN & UML';
  } else if (currentModule === 'science') {
    activeTitle = 'Apex Science • Cuaderno Computacional & CAS Simbólico';
  } else if (currentModule === 'canvas') {
    activeTitle = 'Apex Canvas • Pizarra Espacial Infinita & Gemelos 3D';
  } else if (currentModule === 'bi') {
    activeTitle = 'Apex Data Warehouse • Business Intelligence & DuckDB';
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentModule === 'writer') {
      updateDocTitle(activeDocId, e.target.value);
    }
  };

  const modules: { id: OfficeModule; name: string; icon: React.ElementType; color: string; badge: string }[] = [
    { id: 'writer', name: 'Writer', icon: FileText, color: 'text-blue-400', badge: 'Word' },
    { id: 'calc', name: 'Calc', icon: Sheet, color: 'text-emerald-400', badge: 'Excel' },
    { id: 'slides', name: 'Slides', icon: Presentation, color: 'text-amber-400', badge: 'PowerPoint' },
    { id: 'vault', name: 'Vault', icon: Database, color: 'text-cyan-400', badge: 'Access' },
    { id: 'project', name: 'Project', icon: FolderKanban, color: 'text-rose-400', badge: 'MS Project' },
    { id: 'pdf', name: 'PDF Pro', icon: FileCheck, color: 'text-red-400', badge: 'Acrobat' },
    { id: 'diagram', name: 'Diagram', icon: Network, color: 'text-purple-400', badge: 'Visio' },
    { id: 'science', name: 'Science', icon: Cpu, color: 'text-teal-400', badge: 'MATLAB' },
    { id: 'canvas', name: 'Canvas', icon: Layers, color: 'text-pink-400', badge: 'Miro' },
    { id: 'bi', name: 'BI', icon: BarChart3, color: 'text-amber-300', badge: 'Power BI' },
    { id: 'agenda', name: 'Agenda', icon: Calendar, color: 'text-indigo-400', badge: 'Outlook' },
  ];

  return (
    <header className="h-14 bg-obsidian-900 border-b border-obsidian-700/80 px-2 sm:px-3 flex items-center justify-between select-none z-30 transition-all w-full max-w-full overflow-hidden shrink-0">
      {/* Left: Brand + Module Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-apex-blue flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-sm tracking-tight text-white flex items-center space-x-1">
              <span>APEX</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                PRO
              </span>
            </span>
          </div>
        </div>

        {/* Module Switcher Buttons with Adaptive Width */}
        <nav className="flex items-center bg-obsidian-950 p-0.5 sm:p-1 rounded-lg border border-obsidian-850 overflow-x-auto scrollbar-none max-w-[48vw] xl:max-w-none shrink">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = currentModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setModule(m.id)}
                className={`flex items-center space-x-1 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-obsidian-800 text-white shadow-sm border border-obsidian-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900'
                }`}
                title={`Abrir módulo ${m.name} (MS ${m.badge})`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? m.color : 'text-slate-400'}`} />
                <span className={isActive ? 'inline font-semibold' : 'hidden 2xl:inline'}>{m.name}</span>
                <span className="hidden 2xl:inline text-[10px] text-slate-500">({m.badge})</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Middle: Active Document Title & Privacy Status (Shown on wide monitors) */}
      <div className="hidden 2xl:flex items-center space-x-2 max-w-xs justify-center shrink">
        {isEditingTitle && currentModule === 'writer' ? (
          <input
            type="text"
            value={activeTitle}
            onChange={handleTitleChange}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            autoFocus
            className="bg-obsidian-950 text-white text-xs font-medium px-2 py-1 rounded border border-indigo-500/50 focus:outline-none w-56 text-center"
          />
        ) : (
          <button
            onClick={() => currentModule === 'writer' && setIsEditingTitle(true)}
            className="group flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-obsidian-800 transition-colors truncate"
          >
            <span className="truncate max-w-[160px]">{activeTitle}</span>
            <span className="flex items-center text-[10px] text-emerald-400/90 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Zero-Cloud
            </span>
          </button>
        )}
      </div>

      {/* Right: Security Badge, Search, Zen, Export, Theme, Fullscreen */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
        {/* AI Neural Copilot */}
        <button
          onClick={toggleAICopilot}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/25 transition-all shadow-sm shrink-0"
          title="Abrir Copiloto Neural Soberano (IA Local WebGPU 100% Offline)"
        >
          <Bot className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="hidden 2xl:inline">IA Local</span>
        </button>

        {/* Macro & Scripting Studio IDE */}
        <button
          onClick={toggleMacroIDE}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-medium hover:bg-orange-500/25 transition-all shadow-sm shrink-0"
          title="Abrir Studio de Macros y Scripting TypeScript en Sandbox WASM"
        >
          <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="hidden 2xl:inline">Macros</span>
        </button>

        {/* Time Machine & Version History */}
        <button
          onClick={toggleTimeMachine}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-medium hover:bg-cyan-500/25 transition-all shadow-sm shrink-0"
          title="Time Machine Criptográfica & Historial de Commits Merkle"
        >
          <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden 2xl:inline">Historial</span>
        </button>

        {/* Security Shield Button */}
        <button
          onClick={() => setSecurityModalOpen(true)}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-all shrink-0"
          title="Ver auditoría de seguridad en tiempo real (Protección contra DDE, XXE e Inyección de Fórmulas)"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden xl:inline">Defensa</span>
        </button>

        {/* Privacy & RGPD Center Button */}
        <button
          onClick={togglePrivacyCenter}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-500/25 transition-all shadow-sm shrink-0"
          title="Centro de Privacidad, RGPD y Soberanía Local (Zero-Cloud, Auditoría ARCO+ y Purga de Metadatos)"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="hidden xl:inline">Privacidad</span>
        </button>

        {/* Cookies & LSSI-CE Button */}
        <button
          onClick={() => {
            setActivePrivacyTab('cookies');
            setPrivacyCenterOpen(true);
          }}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-medium hover:bg-amber-500/25 transition-all shadow-sm shrink-0"
          title="Gestión de Cookies y Almacenamiento Local (LSSI-CE & ePrivacy)"
        >
          <Cookie className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="hidden 2xl:inline">Cookies</span>
        </button>

        {/* Ads & Pro License Button */}
        <button
          onClick={() => setAdManagerOpen(true)}
          className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0 ${
            isProLicense
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
              : 'bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25'
          }`}
          title="Gestor de Banners Publicitarios y Licencia Pro"
        >
          <Crown className={`w-3.5 h-3.5 shrink-0 ${isProLicense ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
          <span className="hidden 2xl:inline">{isProLicense ? 'Pro' : 'Ads / Pro'}</span>
        </button>

        {/* Support & Donations Button */}
        <button
          onClick={toggleDonationModal}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium hover:bg-rose-500/25 transition-all shadow-sm shrink-0"
          title="Apoyar el proyecto / Donaciones para seguir mejorando Apex Office"
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 fill-rose-500/30" />
          <span className="hidden xl:inline">Donar</span>
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-slate-400 hover:text-slate-200 text-xs transition-all hover:border-obsidian-600 shrink-0"
          title="Abrir paleta de comandos universal (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px] font-mono text-slate-400">Ctrl+K</span>
        </button>

        {/* Export Button */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all shrink-0"
          title="Exportar archivo en formatos abiertos libres de telemetría"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        {/* Theme Mode Toggle (Classic Normal vs Obsidian Dark) */}
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-obsidian-750 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200/60 dark:hover:bg-obsidian-800 transition-all shrink-0"
          title={theme === 'classic' ? 'Tema actual: Clásico Office (Normal). Clic para cambiar a Modo Oscuro' : 'Tema actual: Oscuro (Obsidian). Clic para cambiar a Modo Clásico Office'}
        >
          {theme === 'classic' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden lg:inline font-semibold text-slate-700">Normal</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="hidden lg:inline font-semibold text-slate-300">Oscuro</span>
            </>
          )}
        </button>

        {/* Window Maximize / Fullscreen Toggle */}
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.apexNative?.maximizeWindow) {
              window.apexNative.maximizeWindow();
            } else if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-obsidian-800 border border-transparent hover:border-obsidian-750 transition-colors shrink-0"
          title="Ajustar / Maximizar a la Ventana (F11)"
        >
          <Monitor className="w-3.5 h-3.5 text-slate-300" />
        </button>

        {/* Zen Mode Toggle */}
        <button
          onClick={toggleZenMode}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
            zenMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
          }`}
          title={zenMode ? 'Salir del modo concentración' : 'Modo Zen / Concentración'}
        >
          {zenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
