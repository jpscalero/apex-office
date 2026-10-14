import React, { useState } from 'react';
import {
  Heart,
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Globe,
  Award,
  CreditCard,
  Smartphone,
  Zap,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

export const SupportDonationModal: React.FC = () => {
  const { isDonationModalOpen, setDonationModalOpen } = useOfficeStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isDonationModalOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={() => setDonationModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl my-auto bg-obsidian-900 border border-obsidian-700/90 rounded-2xl shadow-2xl shadow-blue-950/30 overflow-hidden flex flex-col text-slate-200 animate-scale-up max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-blue-950/40 via-obsidian-900 to-indigo-950/40 border-b border-obsidian-750 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Apoyar el Desarrollo de Apex Office
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-blue-500/15 border border-blue-500/30 text-blue-300">
                  Revolut Bank
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Software libre, privado, sin telemetría ni suscripciones obligatorias.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDonationModalOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Revolut Featured Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-obsidian-950 to-indigo-950/30 border border-blue-500/40 shadow-xl shadow-blue-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/30 shrink-0">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    Revolut.Me • Donación Directa
                  </h3>
                  <span className="text-xs text-blue-300 font-mono">
                    revolut.me/jpscalero • Revtag: @jpscalero
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 shrink-0">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>0% Comisiones</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Puedes realizar una donación libre e inmediata a través del enlace oficial de Revolut. <strong>No necesitas tener cuenta en Revolut</strong> para realizar tu aportación.
            </p>

            {/* Payment Methods Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-750 flex items-center gap-2 text-xs text-slate-300">
                <Smartphone className="w-4 h-4 text-slate-200" />
                <span className="text-[11px] font-medium">Apple Pay</span>
              </div>
              <div className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-750 flex items-center gap-2 text-xs text-slate-300">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-medium">Google Pay</span>
              </div>
              <div className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-750 flex items-center gap-2 text-xs text-slate-300">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-medium">Tarjetas (Visa/MC)</span>
              </div>
              <div className="p-2 rounded-lg bg-obsidian-900 border border-obsidian-750 flex items-center gap-2 text-xs text-slate-300">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-[11px] font-medium">Revtag (@jpscalero)</span>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="https://revolut.me/jpscalero"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40"
              >
                <span>Donar en Revolut.Me</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleCopy('@jpscalero', 'revtag')}
                className={`w-full sm:w-auto py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 ${
                  copiedKey === 'revtag'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-obsidian-900 border-obsidian-750 text-slate-200 hover:bg-obsidian-800'
                }`}
                title="Copiar Revtag para transferencias en la app de Revolut"
              >
                {copiedKey === 'revtag' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡@jpscalero Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copiar Revtag @jpscalero</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Transparency & Objectives Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-750 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" /> Nuevos Módulos
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Desarrollo continuo de exportadores ODF/OOXML nativos y herramientas de productividad.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-750 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" /> Auditorías de Seguridad
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Verificación continua contra inyección de fórmulas, ataques DDE y protección criptográfica.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-750 space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <Globe className="w-4 h-4" /> Soporte Multiplataforma
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mantenimiento de empaquetados nativos y versiones portables para Windows, GNU/Linux y macOS.
              </p>
            </div>
          </div>

          {/* Sovereign Commitment Notice */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/20 to-obsidian-950 border border-indigo-500/20 text-xs space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" /> Compromiso Soberano de Apex Office
            </div>
            <p className="text-slate-300 leading-relaxed">
              Las funciones fundamentales de Apex Office <strong>siempre serán 100% libres y gratuitas</strong>. Las donaciones son completamente voluntarias y hacen posible el mantenimiento independiente del proyecto sin vender datos ni incluir rastreadores.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-obsidian-950/90 border-t border-obsidian-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-blue-400 fill-blue-400/30" />
            <span>Desarrollado para la comunidad de código abierto</span>
          </div>
          <button
            onClick={() => setDonationModalOpen(false)}
            className="py-1.5 px-4 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-white text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
export default SupportDonationModal;
