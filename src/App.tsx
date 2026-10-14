import React, { useEffect } from 'react';
import { useOfficeStore } from './store/useOfficeStore';
import { TopNavBar } from './components/layout/TopNavBar';
import { OfficeMenuBar } from './components/layout/OfficeMenuBar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { DocWriterView } from './components/writer/DocWriterView';
import { GridCalcView } from './components/calc/GridCalcView';
import { SlideDeckView } from './components/slides/SlideDeckView';
import { PresentationMode } from './components/slides/PresentationMode';
import { DataVaultView } from './components/vault/DataVaultView';
import { AgendaMailView } from './components/calendar/AgendaMailView';
import { GanttProjectView } from './components/project/GanttProjectView';
import { PDFViewerEditor } from './components/pdf/PDFViewerEditor';
import { DataWarehouseBIView } from './components/bi/DataWarehouseBIView';
import { ScienceNotebookView } from './components/science/ScienceNotebookView';
import { VectorDiagramStudioView } from './components/diagram/VectorDiagramStudioView';
import { SpatialCanvasView } from './components/canvas/SpatialCanvasView';
import { AIOfficeCopilotDrawer } from './components/ai/AIOfficeCopilotDrawer';
import { MacroScriptIDEModal } from './components/automation/MacroScriptIDEModal';
import { TimeMachineDrawer } from './components/history/TimeMachineDrawer';
import { ExportModal } from './components/modals/ExportModal';
import { SecurityAuditModal } from './components/modals/SecurityAuditModal';
import { PrivacyComplianceCenterModal } from './components/modals/PrivacyComplianceCenterModal';
import { CookieConsentBanner } from './components/modals/CookieConsentBanner';
import { AdBannerSlot } from './components/ads/AdBannerSlot';
import { AdManagementModal } from './components/ads/AdManagementModal';

export const App: React.FC = () => {
  const {
    currentModule,
    isPresentationMode,
    zenMode,
    runAudit,
    theme,
    togglePrivacyCenter,
  } = useOfficeStore();

  // Run security audit on workspace load and listen for global shortcuts
  useEffect(() => {
    runAudit();
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePrivacyCenter();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [runAudit, togglePrivacyCenter]);

  const isClassic = theme === 'classic';

  return (
    <div className={`h-full w-full max-w-full max-h-full flex flex-col overflow-hidden font-sans transition-colors duration-150 ${isClassic ? 'theme-classic bg-slate-100 text-slate-800' : 'theme-obsidian bg-obsidian-900 text-slate-100'}`}>
      {/* Top Header Bar & Office Dropdown Menus */}
      {!isPresentationMode && <TopNavBar />}
      {!isPresentationMode && !zenMode && <OfficeMenuBar />}

      {/* Top Advertising & Sponsorship Banner */}
      <AdBannerSlot position="top" />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Module Sidebar Explorer (PDF, Project, BI, Science, Diagram and Canvas provide their own integrated workbench canvases) */}
        {!isPresentationMode && currentModule !== 'pdf' && currentModule !== 'project' && currentModule !== 'bi' && currentModule !== 'science' && currentModule !== 'diagram' && currentModule !== 'canvas' && <Sidebar />}

        {/* Active Module Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden">
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
        </main>
      </div>

      {/* Bottom Advertising & Sponsorship Banner */}
      <AdBannerSlot position="bottom" />

      {/* Global Overlays & Modals */}
      {isPresentationMode && <PresentationMode />}
      <CommandPalette />
      <ExportModal />
      <SecurityAuditModal />
      <AIOfficeCopilotDrawer />
      <MacroScriptIDEModal />
      <TimeMachineDrawer />
      <PrivacyComplianceCenterModal />
      <CookieConsentBanner />
      <AdBannerSlot position="floating" />
      <AdManagementModal />
    </div>
  );
};

export default App;
