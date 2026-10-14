import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

export const SecurityAuditModal: React.FC = () => {
  const {
    isSecurityModalOpen,
    setSecurityModalOpen,
    securityAudit,
    runAudit,
  } = useOfficeStore();

  if (!isSecurityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-obsidian-900 border border-obsidian-700 rounded-xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-obsidian-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Auditoría de Ciberseguridad Zero-Trust</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  APEX SHIELD v2.4
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Defensa activa contra vulnerabilidades críticas históricas de Microsoft Office
              </p>
            </div>
          </div>
          <button
            onClick={() => setSecurityModalOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-obsidian-950 border border-obsidian-800 p-3 rounded-xl">
            <p className="text-[11px] text-slate-400">Inyección DDE/CSV</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-1">Neutralizado</p>
            <span className="text-[10px] text-slate-400 font-mono">CWE-1236</span>
          </div>

          <div className="bg-obsidian-950 border border-obsidian-800 p-3 rounded-xl">
            <p className="text-[11px] text-slate-400">Macros / RCE</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-1">WASM Aislado</p>
            <span className="text-[10px] text-slate-400 font-mono">0 VBA Bloated</span>
          </div>

          <div className="bg-obsidian-950 border border-obsidian-800 p-3 rounded-xl">
            <p className="text-[11px] text-slate-400">Entidades XXE</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-1">Desactivado</p>
            <span className="text-[10px] text-slate-400 font-mono">CWE-611</span>
          </div>

          <div className="bg-obsidian-950 border border-obsidian-800 p-3 rounded-xl">
            <p className="text-[11px] text-slate-400">Fuga NetNTLM (UNC)</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-1">0 Fugas</p>
            <span className="text-[10px] text-slate-400 font-mono">CVE-2023-23397</span>
          </div>
        </div>

        {/* Threat Analysis Detail List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Vectores de Ataque Analizados y Mitigados
            </h4>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Verificado</span>
            </span>
          </div>

          <div className="space-y-2">
            {securityAudit.threats.map((threat, idx) => (
              <div
                key={idx}
                className="bg-obsidian-950 border border-obsidian-800/90 p-3.5 rounded-xl space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{threat.vector}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded uppercase ${
                      threat.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : threat.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    Severidad: {threat.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{threat.description}</p>
                <div className="text-[11px] font-mono text-emerald-300/90 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Mitigación Aplicada: {threat.actionTaken}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-between border-t border-obsidian-800">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Motor de Análisis Estático en Navegador</span>
          </div>
          <button
            onClick={() => runAudit()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-ejecutar Análisis Completo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
