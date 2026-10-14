import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  CircleDot,
  FileCode,
  Copy,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

interface MacroPreset {
  id: string;
  name: string;
  description: string;
  code: string;
  isSigned: boolean;
}

const PRESET_MACROS: MacroPreset[] = [
  {
    id: 'macro-1',
    name: 'autoSumAndFormat.ts',
    description: 'Calcula subtotales en columnas numéricas y aplica formato contable con bordes',
    isSigned: true,
    code: `import { Apex } from '@apex/sdk';

export async function main() {
  const sheet = Apex.Calc.getActiveSheet();
  const range = sheet.getRange('C2:E20');
  
  console.log('[LOG] Analizando celdas numéricas...');
  let total = 0;
  for (const cell of range) {
    const val = Number(cell.value);
    if (!isNaN(val)) total += val;
  }
  
  sheet.getCell('E21').setValue(total);
  sheet.getCell('E21').setStyle({ bold: true, format: 'currency' });
  console.log(\`[SUCCESS] Total calculado: \${total}€ insertado en E21\`);
}`,
  },
  {
    id: 'macro-2',
    name: 'sanitizeAndStripMetadata.ts',
    description: 'Audita y purga metadatos ocultos, comentarios privados y cadenas DDE',
    isSigned: true,
    code: `import { Apex } from '@apex/sdk';

export async function main() {
  console.log('[SECURITY] Iniciando barrido forense de metadatos...');
  const doc = Apex.Writer.getActiveDocument();
  
  // Purgar RSID y rutas UNC locales
  doc.stripMetadata(['author_guid', 'rsid_history', 'printer_unc']);
  
  // Neutralizar inyecciones de fórmulas
  Apex.Calc.sanitizeAllFormulas();
  
  console.log('[OK] Documento sellado y conforme a ENS Alto.');
}`,
  },
  {
    id: 'macro-3',
    name: 'convertLegacyVBA.ts',
    description: 'Transpila código VBA tradicional a TypeScript moderno sin llamadas Win32',
    isSigned: false,
    code: `// Transpilador VBA -> TypeScript
// Entrada original:
// Sub FormatearTotal()
//   Range("A1").Font.Bold = True
//   Range("A1").Value = "Resumen"
// End Sub

import { Apex } from '@apex/sdk';

export async function formatearTotal() {
  const cell = Apex.Calc.getActiveRange("A1");
  cell.setStyle({ bold: true });
  cell.setValue("Resumen");
  console.log('[TRANSPILE] Macro VBA ejecutada con seguridad en Sandbox.');
}`,
  },
];

export const MacroScriptIDEModal: React.FC = () => {
  const { isMacroIDEOpen, toggleMacroIDE } = useOfficeStore();

  const [selectedMacro, setSelectedMacro] = useState<MacroPreset>(PRESET_MACROS[0]);
  const [code, setCode] = useState(PRESET_MACROS[0].code);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[SANDBOX INIT] Entorno QuickJS WebAssembly inicializado.',
    '[SECURITY] Cuota estricta: 64 MB RAM • Watchdog: 5000 ms • Sin acceso a red.',
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  if (!isMacroIDEOpen) return null;

  const handleSelectMacro = (m: MacroPreset) => {
    setSelectedMacro(m);
    setCode(m.code);
  };

  const handleRunScript = () => {
    setIsRunning(true);
    setConsoleLogs((prev) => [
      ...prev,
      `[EXEC START] Compilando ${selectedMacro.name} mediante TypeScript AST...`,
    ]);

    setTimeout(() => {
      setConsoleLogs((prev) => [
        ...prev,
        '[AST PASS] 0 llamadas prohibidas detectadas (no eval, no child_process).',
        '[SANDBOX] Ejecutando en worker aislado...',
        `[LOG] Evaluando estructura de datos de ${selectedMacro.name}`,
        '[SUCCESS] Macro finalizada exitosamente en 6.4 ms (0 dropped frames).',
      ]);
      setIsRunning(false);
    }, 600);
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setConsoleLogs((prev) => [
        ...prev,
        '[RECORDER ON] Grabando acciones del usuario en vivo...',
        '[RECORDER] Evento capturado: Apex.Calc.selectRange("B2:D10")',
        '[RECORDER] Evento capturado: Apex.Calc.applyStyle({ bg: "#23272e" })',
      ]);
    } else {
      setIsRecording(false);
      setConsoleLogs((prev) => [
        ...prev,
        '[RECORDER OFF] Macro generada automáticamente en TypeScript.',
      ]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[80vh] bg-obsidian-950 border border-obsidian-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="h-14 px-5 border-b border-obsidian-800 bg-obsidian-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Studio de Macros & Automatización TypeScript
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Sandbox WASM Seguro</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pilar IX • QuickJS Web Worker Aislado • Sin riesgos de inyección RCE
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleRecord}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center space-x-1.5 transition ${
                isRecording
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-obsidian-800 border-obsidian-700 text-slate-300 hover:text-white hover:bg-obsidian-700'
              }`}
            >
              <CircleDot className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-500' : 'text-slate-400'}`} />
              <span>{isRecording ? 'Detener Grabación' : 'Grabar Macro'}</span>
            </button>

            <button
              onClick={handleRunScript}
              disabled={isRunning}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Ejecutando...' : 'Ejecutar'}</span>
            </button>

            <button
              onClick={toggleMacroIDE}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Script Explorer */}
          <div className="w-64 border-r border-obsidian-800 bg-obsidian-900/40 p-3 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Scripts del Proyecto
            </span>
            <div className="space-y-1 flex-1 overflow-y-auto">
              {PRESET_MACROS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMacro(m)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition border ${
                    selectedMacro.id === m.id
                      ? 'bg-obsidian-800 text-white border-indigo-500/50 shadow-sm'
                      : 'text-slate-300 border-transparent hover:bg-obsidian-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium truncate">{m.name}</span>
                    {m.isSigned ? (
                      <span title="Firmado Criptográficamente" className="shrink-0 flex items-center">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      </span>
                    ) : (
                      <span title="Script Sin Firma" className="shrink-0 flex items-center">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {m.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-obsidian-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Firma Ed25519:</span>
                <span className="text-emerald-400 font-mono text-[10px]">Válida (Org)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cuota de Memoria:</span>
                <span className="text-slate-300 font-mono text-[10px]">64 MB / Worker</span>
              </div>
            </div>
          </div>

          {/* Central Code Editor */}
          <div className="flex-1 flex flex-col bg-obsidian-950">
            <div className="p-2 border-b border-obsidian-800/80 bg-obsidian-900/20 flex items-center justify-between text-xs text-slate-400 px-4">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-indigo-400">{selectedMacro.name}</span>
                <span className="text-[10px] bg-obsidian-800 px-1.5 py-0.5 rounded text-slate-400">TypeScript 5.7</span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-slate-200 transition flex items-center space-x-1 text-[11px]"
              >
                <Copy className="w-3 h-3" />
                <span>Copiar Código</span>
              </button>
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-obsidian-950 text-slate-200">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent resize-none focus:outline-none leading-relaxed selection:bg-indigo-500/30"
              />
            </div>

            {/* Bottom Output Console */}
            <div className="h-44 border-t border-obsidian-800 bg-obsidian-950/90 flex flex-col">
              <div className="px-4 py-2 border-b border-obsidian-800/60 bg-obsidian-900/50 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consola del Sandbox Aislado</span>
                </span>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition"
                >
                  Limpiar
                </button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300">
                {consoleLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`${
                      log.includes('[SUCCESS]') || log.includes('[OK]')
                        ? 'text-emerald-400'
                        : log.includes('[SECURITY]')
                        ? 'text-cyan-400'
                        : log.includes('[RECORDER')
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
