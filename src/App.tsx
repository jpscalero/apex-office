import React, { useEffect, Suspense } from 'react';
import { useOfficeStore } from './store/useOfficeStore';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { TopNavBar } from './components/layout/TopNavBar';
import { OfficeMenuBar } from './components/layout/OfficeMenuBar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { DocWriterView } from './components/writer/DocWriterView';
import { GridCalcView } from './components/calc/GridCalcView';
import { PresentationMode } from './components/slides/PresentationMode';
import { CookieConsentBanner } from './components/modals/CookieConsentBanner';
import { AdBannerSlot } from './components/ads/AdBannerSlot';
import { AdManagementModal } from './components/ads/AdManagementModal';
import { AlertTriangle, HardDrive, X } from 'lucide-react';

// Code-split secondary views into lazy chunks to keep initial bundle ultra-light (< 500 KB)
const SlideDeckView = React.lazy(() =>
  import('./components/slides/SlideDeckView').then((m) => ({ default: m.SlideDeckView }))
);
const DataVaultView = React.lazy(() =>
  import('./components/vault/DataVaultView').then((m) => ({ default: m.DataVaultView }))
);
const AgendaMailView = React.lazy(() =>
  import('./components/calendar/AgendaMailView').then((m) => ({ default: m.AgendaMailView }))
);
const GanttProjectView = React.lazy(() =>
  import('./components/project/GanttProjectView').then((m) => ({ default: m.GanttProjectView }))
);
const PDFViewerEditor = React.lazy(() =>
  import('./components/pdf/PDFViewerEditor').then((m) => ({ default: m.PDFViewerEditor }))
);
const DataWarehouseBIView = React.lazy(() =>
  import('./components/bi/DataWarehouseBIView').then((m) => ({ default: m.DataWarehouseBIView }))
);
const ScienceNotebookView = React.lazy(() =>
  import('./components/science/ScienceNotebookView').then((m) => ({ default: m.ScienceNotebookView }))
);
const VectorDiagramStudioView = React.lazy(() =>
  import('./components/diagram/VectorDiagramStudioView').then((m) => ({ default: m.VectorDiagramStudioView }))
);
const SpatialCanvasView = React.lazy(() =>
  import('./components/canvas/SpatialCanvasView').then((m) => ({ default: m.SpatialCanvasView }))
);

// Code-split heavy modals and drawers
const AIOfficeCopilotDrawer = React.lazy(() =>
  import('./components/ai/AIOfficeCopilotDrawer').then((m) => ({ default: m.AIOfficeCopilotDrawer }))
);
const MacroScriptIDEModal = React.lazy(() =>
  import('./components/automation/MacroScriptIDEModal').then((m) => ({ default: m.MacroScriptIDEModal }))
);
const TimeMachineDrawer = React.lazy(() =>
  import('./components/history/TimeMachineDrawer').then((m) => ({ default: m.TimeMachineDrawer }))
);
const ExportModal = React.lazy(() =>
  import('./components/modals/ExportModal').then((m) => ({ default: m.ExportModal }))
);
const SecurityAuditModal = React.lazy(() =>
  import('./components/modals/SecurityAuditModal').then((m) => ({ default: m.SecurityAuditModal }))
);
const PrivacyComplianceCenterModal = React.lazy(() =>
  import('./components/modals/PrivacyComplianceCenterModal').then((m) => ({ default: m.PrivacyComplianceCenterModal }))
);

const ViewSuspenseFallback: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/50">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
      Cargando módulo soberano...
    </span>
  </div>
);

export const App: React.FC = () => {
  const {
    currentModule,
    isPresentationMode,
    zenMode,
    runAudit,
    theme,
    persistenceWarning,
    checkPersistenceQuota,
    setPrivacyCenterOpen,
  } = useOfficeStore();

  // Attach global keyboard shortcuts (Ctrl+K, Ctrl+N, Ctrl+S, Shift+F, F5, Escape stack...)
  useGlobalShortcuts();

  // Initial audit and storage quota verification
  useEffect(() => {
    runAudit();
    checkPersistenceQuota();
  }, [runAudit, checkPersistenceQuota]);

  const isClassic = theme === 'classic';

  return (
    <div
      className={`h-full w-full max-w-full max-h-full flex flex-col overflow-hidden font-sans transition-colors duration-150 ${
        isClassic ? 'theme-classic bg-slate-100 text-slate-800' : 'theme-obsidian bg-obsidian-900 text-slate-100'
      }`}
    >
      {/* Top Header Bar & Office Dropdown Menus */}
      {!isPresentationMode && <TopNavBar />}
      {!isPresentationMode && !zenMode && <OfficeMenuBar />}

      {/* Storage Quota Warning Banner */}
      {persistenceWarning && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Alerta de Almacenamiento Soberano:</strong> La base de datos local ha superado los 4.5 MB (90% de la cuota del navegador).
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPrivacyCenterOpen(true)}
              className="underline font-semibold hover:text-amber-600 flex items-center gap-1 cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" /> Gestionar en Centro de Privacidad
            </button>
            <button
              onClick={() => useOfficeStore.setState({ persistenceWarning: false })}
              className="p-1 hover:bg-amber-500/20 rounded cursor-pointer"
              title="Cerrar aviso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Advertising & Sponsorship Banner */}
      <AdBannerSlot position="top" />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Module Sidebar Explorer */}
        {!isPresentationMode &&
          currentModule !== 'pdf' &&
          currentModule !== 'project' &&
          currentModule !== 'bi' &&
          currentModule !== 'science' &&
          currentModule !== 'diagram' &&
          currentModule !== 'canvas' && <Sidebar />}

        {/* Active Module Canvas with Lazy Loading Suspense */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Suspense fallback={<ViewSuspenseFallback />}>
            {currentModule === 'writer' && <DocWriterView />}
            {currentModule === 'calc' && <GridCalcView />}
            {currentModule === 'slides' && <SlideDeckView />}
            {currentModule === 'vault' && <DataVaultView />}
            {currentModule === 'agenda' && <AgendaMailView />}
            {currentModule === 'project' && <GanttProjectView />}
            {currentModule === 'pdf' && <PDFViewerEditor />}
            {currentModule === 'bi' && <DataWarehouseBIView />}
            {currentModule === 'science' && <ScienceNotebookView />}
            {currentModule === 'diagram' && <VectorDiagramStudioView />}
            {currentModule === 'canvas' && <SpatialCanvasView />}
          </Suspense>
        </main>
      </div>

      {/* Bottom Advertising & Sponsorship Banner */}
      <AdBannerSlot position="bottom" />

      {/* Global Overlays & Modals */}
      {isPresentationMode && <PresentationMode />}
      <CommandPalette />
      <CookieConsentBanner />
      <AdBannerSlot position="floating" />
      <AdManagementModal />

      {/* Lazy Loaded Heavy Modals & Drawers */}
      <Suspense fallback={null}>
        <ExportModal />
        <SecurityAuditModal />
        <AIOfficeCopilotDrawer />
        <MacroScriptIDEModal />
        <TimeMachineDrawer />
        <PrivacyComplianceCenterModal />
      </Suspense>
    </div>
  );
};

export default App;
