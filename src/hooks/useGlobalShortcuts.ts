import { useEffect } from 'react';
import { useOfficeStore } from '../store/useOfficeStore';

/**
 * Universal keyboard shortcuts hook for Apex Office Suite.
 * Handles command palette, quick creation, export, presentation, zen mode, and hierarchical escape closing.
 */
export function useGlobalShortcuts(): void {
  const currentModule = useOfficeStore((s) => s.currentModule);
  const isCommandPaletteOpen = useOfficeStore((s) => s.isCommandPaletteOpen);
  const setCommandPaletteOpen = useOfficeStore((s) => s.setCommandPaletteOpen);
  const isExportModalOpen = useOfficeStore((s) => s.isExportModalOpen);
  const setExportModalOpen = useOfficeStore((s) => s.setExportModalOpen);
  const isSecurityModalOpen = useOfficeStore((s) => s.isSecurityModalOpen);
  const setSecurityModalOpen = useOfficeStore((s) => s.setSecurityModalOpen);
  const isAICopilotOpen = useOfficeStore((s) => s.isAICopilotOpen);
  const toggleAICopilot = useOfficeStore((s) => s.toggleAICopilot);
  const isMacroIDEOpen = useOfficeStore((s) => s.isMacroIDEOpen);
  const toggleMacroIDE = useOfficeStore((s) => s.toggleMacroIDE);
  const isTimeMachineOpen = useOfficeStore((s) => s.isTimeMachineOpen);
  const toggleTimeMachine = useOfficeStore((s) => s.toggleTimeMachine);
  const isPrivacyCenterOpen = useOfficeStore((s) => s.isPrivacyCenterOpen);
  const setPrivacyCenterOpen = useOfficeStore((s) => s.setPrivacyCenterOpen);
  const isAdManagerOpen = useOfficeStore((s) => s.isAdManagerOpen);
  const setAdManagerOpen = useOfficeStore((s) => s.setAdManagerOpen);
  const isPresentationMode = useOfficeStore((s) => s.isPresentationMode);
  const setPresentationMode = useOfficeStore((s) => s.setPresentationMode);
  const zenMode = useOfficeStore((s) => s.zenMode);
  const toggleZenMode = useOfficeStore((s) => s.toggleZenMode);
  const newFromShortcut = useOfficeStore((s) => s.newFromShortcut);
  const checkPersistenceQuota = useOfficeStore((s) => s.checkPersistenceQuota);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 1. ESCAPE: Hierarchical dismiss stack
      if (e.key === 'Escape') {
        if (isPresentationMode) {
          e.preventDefault();
          setPresentationMode(false);
          return;
        }
        if (isCommandPaletteOpen) {
          e.preventDefault();
          setCommandPaletteOpen(false);
          return;
        }
        if (isExportModalOpen) {
          e.preventDefault();
          setExportModalOpen(false);
          return;
        }
        if (isSecurityModalOpen) {
          e.preventDefault();
          setSecurityModalOpen(false);
          return;
        }
        if (isAICopilotOpen) {
          e.preventDefault();
          toggleAICopilot();
          return;
        }
        if (isMacroIDEOpen) {
          e.preventDefault();
          toggleMacroIDE();
          return;
        }
        if (isTimeMachineOpen) {
          e.preventDefault();
          toggleTimeMachine();
          return;
        }
        if (isPrivacyCenterOpen) {
          e.preventDefault();
          setPrivacyCenterOpen(false);
          return;
        }
        if (isAdManagerOpen) {
          e.preventDefault();
          setAdManagerOpen(false);
          return;
        }
        if (zenMode) {
          e.preventDefault();
          toggleZenMode();
          return;
        }
      }

      // Do not trigger global creation or action shortcuts if typing in input/textarea/contenteditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // 2. Ctrl + K / Cmd + K or Ctrl + Shift + P: Command Palette
      if ((cmdOrCtrl && (e.key === 'k' || e.key === 'K')) ||
          (cmdOrCtrl && e.shiftKey && (e.key === 'p' || e.key === 'P'))) {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
        return;
      }

      // 3. Ctrl + Shift + E: Export Center
      if (cmdOrCtrl && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        setExportModalOpen(!isExportModalOpen);
        return;
      }

      // 4. Ctrl + S: Save & Quota Check
      if (cmdOrCtrl && (e.key === 's' || e.key === 'S') && !e.shiftKey) {
        e.preventDefault();
        checkPersistenceQuota();
        return;
      }

      // 5. Ctrl + N: Quick New Item
      if (cmdOrCtrl && (e.key === 'n' || e.key === 'N') && !e.shiftKey) {
        e.preventDefault();
        if (currentModule === 'writer') {
          newFromShortcut('doc');
        } else if (currentModule === 'calc') {
          newFromShortcut('sheet');
        } else if (currentModule === 'slides') {
          newFromShortcut('deck');
        }
        return;
      }

      // 6. F5: Presentation Mode in Slides
      if (e.key === 'F5' && currentModule === 'slides') {
        e.preventDefault();
        setPresentationMode(true);
        return;
      }

      // 7. Shift + F: Focus / Zen Mode (only when not typing in text area)
      if (e.shiftKey && (e.key === 'f' || e.key === 'F') && !cmdOrCtrl && !isInput) {
        e.preventDefault();
        toggleZenMode();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentModule,
    isCommandPaletteOpen,
    isExportModalOpen,
    isSecurityModalOpen,
    isAICopilotOpen,
    isMacroIDEOpen,
    isTimeMachineOpen,
    isPrivacyCenterOpen,
    isAdManagerOpen,
    isPresentationMode,
    zenMode,
    setCommandPaletteOpen,
    setExportModalOpen,
    setSecurityModalOpen,
    toggleAICopilot,
    toggleMacroIDE,
    toggleTimeMachine,
    setPrivacyCenterOpen,
    setAdManagerOpen,
    setPresentationMode,
    toggleZenMode,
    newFromShortcut,
    checkPersistenceQuota,
  ]);
}
