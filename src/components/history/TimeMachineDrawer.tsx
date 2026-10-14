import React, { useState } from 'react';
import {
  History,
  X,
  GitBranch,
  ShieldCheck,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

interface SnapshotRecord {
  id: string;
  timestamp: string;
  relativeTime: string;
  author: string;
  hash: string;
  message: string;
  linesAdded: number;
  linesRemoved: number;
  diffSummary: string;
}

const DEMO_SNAPSHOTS: SnapshotRecord[] = [
  {
    id: 'snap-1',
    timestamp: '2026-10-14 14:35:10',
    relativeTime: 'Hace 5 minutos (Actual)',
    author: 'Elena Rostova (Lead Security)',
    hash: 'a9f24e18b04c8f2b',
    message: 'Implementación de protocolo Zero-Trust y neutralización de DDE',
    linesAdded: 24,
    linesRemoved: 4,
    diffSummary: '+ Adición de directiva DDE Disable en Calc\n- Supresión de llamadas OLE heredadas',
  },
  {
    id: 'snap-2',
    timestamp: '2026-10-14 13:20:44',
    relativeTime: 'Hace 1 hora',
    author: 'Carlos Mendoza (System Arch)',
    hash: 'c83d19f5a7092e10',
    message: 'Configuración de particionamiento columnar y sparse arrays',
    linesAdded: 86,
    linesRemoved: 12,
    diffSummary: '+ sparse matrix TypedArrays Float64\n- arrays multidimensionales tradicionales',
  },
  {
    id: 'snap-3',
    timestamp: '2026-10-14 11:15:02',
    relativeTime: 'Hace 3 horas',
    author: 'Elena Rostova (Lead Security)',
    hash: 'fa027b4481d9603c',
    message: 'Auditoría inicial de metadatos y sellado PAdES',
    linesAdded: 45,
    linesRemoved: 0,
    diffSummary: '+ Módulo de sellado de tiempo RFC 3161\n+ Limpiador de identificadores RSID',
  },
];

export const TimeMachineDrawer: React.FC = () => {
  const { isTimeMachineOpen, toggleTimeMachine } = useOfficeStore();

  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotRecord>(DEMO_SNAPSHOTS[0]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [activeBranch, setActiveBranch] = useState<'main' | 'revision-legal' | 'auditoria-q4'>('main');

  if (!isTimeMachineOpen) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Number(e.target.value);
    setSliderIndex(idx);
    setSelectedSnapshot(DEMO_SNAPSHOTS[idx] || DEMO_SNAPSHOTS[0]);
  };

  const handleRestore = () => {
    alert(`Versión [${selectedSnapshot.hash}] restaurada exitosamente en el espacio de trabajo activo.`);
    toggleTimeMachine();
  };

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-[480px] bg-obsidian-950/95 backdrop-blur-md border-r border-obsidian-800 shadow-2xl z-40 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-obsidian-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-white tracking-tight">Time Machine Criptográfica</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                MERKLE DAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Pilar XIII • Snapshots Inmutables & Myers Diff</p>
          </div>
        </div>

        <button
          onClick={toggleTimeMachine}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-obsidian-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Branch Selector */}
      <div className="px-4 py-2.5 bg-obsidian-900/50 border-b border-obsidian-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">Rama:</span>
        </div>
        <div className="flex space-x-1">
          {(['main', 'revision-legal', 'auditoria-q4'] as const).map((branch) => (
            <button
              key={branch}
              onClick={() => setActiveBranch(branch)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                activeBranch === branch
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
              }`}
            >
              {branch}
            </button>
          ))}
        </div>
      </div>

      {/* Time Machine Interactive Slider */}
      <div className="p-4 border-b border-obsidian-800 bg-obsidian-900/30">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300 flex items-center space-x-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Navegador Temporal (Time Scrubber)</span>
          </span>
          <span className="font-mono text-cyan-400 text-[11px]">
            {selectedSnapshot.relativeTime}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={DEMO_SNAPSHOTS.length - 1}
          step="1"
          value={sliderIndex}
          onChange={handleSliderChange}
          className="w-full accent-cyan-400 bg-obsidian-800 h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>Actual</span>
          <span>Hace 1h</span>
          <span>Hace 3h</span>
        </div>
      </div>

      {/* Active Snapshot Inspection Card */}
      <div className="p-4 border-b border-obsidian-800 bg-obsidian-900/40">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            Hash: {selectedSnapshot.hash}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center space-x-1 font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>Firma Ed25519 Válida</span>
          </span>
        </div>
        <h4 className="text-xs font-semibold text-white mt-2">
          {selectedSnapshot.message}
        </h4>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-3">
          <span>{selectedSnapshot.author}</span>
          <span>•</span>
          <span className="text-emerald-400 font-mono">+{selectedSnapshot.linesAdded}</span>
          <span className="text-rose-400 font-mono">-{selectedSnapshot.linesRemoved}</span>
        </div>

        <button
          onClick={handleRestore}
          className="w-full mt-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-600/30 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Esta Versión</span>
        </button>
      </div>

      {/* Myers Visual Diff */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-2">
          Visual Diff (Myers Algorithm)
        </span>
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-3 font-mono text-[11px] space-y-1.5 flex-1">
          {selectedSnapshot.diffSummary.split('\n').map((line, idx) => (
            <div
              key={idx}
              className={`p-1 rounded ${
                line.startsWith('+')
                  ? 'bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500'
                  : line.startsWith('-')
                  ? 'bg-rose-950/50 text-rose-300 border-l-2 border-rose-500'
                  : 'text-slate-400'
              }`}
            >
              {line}
            </div>
          ))}
          <div className="mt-4 pt-3 border-t border-obsidian-800 text-[10px] text-slate-500">
            Los cambios están verificados mediante árbol criptográfico Merkle DAG en memoria local.
          </div>
        </div>

        {/* Snapshot Timeline List */}
        <div className="mt-4 space-y-2">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
            Historial de Commits Firmados
          </span>
          {DEMO_SNAPSHOTS.map((snap, i) => (
            <div
              key={snap.id}
              onClick={() => {
                setSliderIndex(i);
                setSelectedSnapshot(snap);
              }}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                selectedSnapshot.id === snap.id
                  ? 'bg-obsidian-800 border-cyan-500/60 text-white shadow-sm'
                  : 'bg-obsidian-900/60 border-obsidian-800 text-slate-400 hover:bg-obsidian-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">{snap.message}</span>
                <span className="font-mono text-[10px] text-slate-500">{snap.hash.slice(0, 6)}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>{snap.author.split(' ')[0]}</span>
                <span>{snap.relativeTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
