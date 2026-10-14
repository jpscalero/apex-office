import React, { useState } from 'react';
import {
  X,
  Megaphone,
  Crown,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
  Sliders,
  DollarSign,
  Code2,
  KeyRound,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

export const AdManagementModal: React.FC = () => {
  const {
    isAdManagerOpen,
    setAdManagerOpen,
    showAdBanners,
    toggleAdBanners,
    adBannerPosition,
    setAdBannerPosition,
    isProLicense,
    activateProLicense,
    setActivePrivacyTab,
    setPrivacyCenterOpen,
  } = useOfficeStore();

  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isAdManagerOpen) return null;

  const handleActivateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const success = activateProLicense(licenseKeyInput);
    if (success) {
      setLicenseStatus('success');
      setTimeout(() => {
        setLicenseStatus('idle');
      }, 4000);
    } else {
      setLicenseStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in-50 duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-obsidian-950 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Gestor de Publicidad, Patrocinio y Licencia Pro
                </h3>
                {isProLicense && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40">
                    PRO ACTIVO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monetización ética, configuración de formatos de anuncios y clave de desbloqueo
              </p>
            </div>
          </div>

          <button
            onClick={() => setAdManagerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-obsidian-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Pro License Activation Banner */}
          <div className={`p-4 rounded-xl border transition-all ${
            isProLicense
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/50 text-emerald-900 dark:text-emerald-200'
              : 'bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border-amber-300 dark:border-amber-600/40'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <strong className="text-sm font-bold text-slate-900 dark:text-white">
                    {isProLicense ? 'Licencia Apex Office Pro Activada' : 'Eliminar Publicidad con Licencia Pro'}
                  </strong>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {isProLicense
                    ? 'Tu copia de Apex Office está completamente libre de publicidad comercial y de patrocinios.'
                    : 'Puedes desbloquear el modo sin anuncios introduciendo una clave de licencia o utilizando la clave de prueba gratuita.'}
                </p>
              </div>

              {!isProLicense && (
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[10px] shadow-sm uppercase tracking-wide">
                  Modelo Freemium
                </span>
              )}
            </div>

            {!isProLicense && (
              <form onSubmit={handleActivateLicense} className="mt-3.5 flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <KeyRound className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    placeholder="Introduce tu clave (ej. APEX-PRO-2026)"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-850 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
                >
                  Activar Clave Pro
                </button>
              </form>
            )}

            {licenseStatus === 'success' && (
              <div className="mt-2.5 flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>¡Clave válida! La publicidad ha sido desactivada en toda la suite.</span>
              </div>
            )}
            {licenseStatus === 'error' && (
              <div className="mt-2.5 flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Clave no reconocida. Prueba introduciendo la clave de demostración: <code className="font-mono bg-rose-100 dark:bg-rose-950 px-1 rounded">APEX-PRO-2026</code></span>
              </div>
            )}
          </div>

          {/* Quick Controls */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Configuración de los Banners en Pantalla</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Toggle Enable/Disable */}
              <div className="p-3 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 dark:text-white font-semibold text-xs">
                    Mostrar Banners de Publicidad
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    {showAdBanners ? 'Banners visibles en la interfaz' : 'Banners ocultos'}
                  </span>
                </div>
                <button
                  onClick={toggleAdBanners}
                  disabled={isProLicense}
                  className={`w-9 h-5 rounded-full flex items-center px-1 transition-colors shrink-0 ${
                    showAdBanners && !isProLicense
                      ? 'bg-amber-600 justify-end'
                      : 'bg-slate-300 dark:bg-obsidian-700 justify-start opacity-70'
                  }`}
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                </button>
              </div>

              {/* Position selector */}
              <div className="p-3 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 dark:text-white font-semibold text-xs">
                    Ubicación del Banner
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Posición visual en el área de trabajo
                  </span>
                </div>
                <select
                  value={adBannerPosition}
                  onChange={(e) => setAdBannerPosition(e.target.value as any)}
                  disabled={!showAdBanners || isProLicense}
                  className="px-2 py-1 rounded-lg border border-slate-300 dark:border-obsidian-750 bg-white dark:bg-obsidian-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                >
                  <option value="top">Superior (Barra de menú)</option>
                  <option value="bottom">Inferior (Pie de ventana)</option>
                  <option value="floating">Flotante (Tarjeta esquina)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Educational Architecture Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cómo se implementa la publicidad en aplicaciones (Guía Técnica)</span>
            </h4>

            <div className="space-y-2.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl space-y-1">
                <strong className="text-slate-900 dark:text-white flex items-center space-x-1.5 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>1. Patrocinio Ético Directo / Self-Hosted (El modelo activo en Apex Office)</span>
                </strong>
                <p>
                  Las creatividades, textos e hipervínculos están precargados en local o se descargan mediante un archivo JSON estático.
                  <strong> Ventajas:</strong> Cero rastreo, no ralentiza la aplicación, funciona 100% offline y cumple el RGPD sin requerir cookies publicitarias de terceros.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl space-y-1">
                <strong className="text-slate-900 dark:text-white flex items-center space-x-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span>2. Redes Programáticas Externas (Google AdSense, Prebid.js, Carbon Ads)</span>
                </strong>
                <p>
                  Se incrusta un script externo o un <code className="font-mono bg-slate-200 dark:bg-obsidian-800 px-1 py-0.5 rounded">&lt;iframe&gt;</code> que
                  subasta anuncios en tiempo real. <strong>Requisito legal:</strong> Exige que el usuario acepte expresamente las cookies publicitarias
                  en el banner de consentimiento antes de cargar los scripts de Google o anunciantes externos.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl space-y-1">
                <strong className="text-slate-900 dark:text-white flex items-center space-x-1.5 font-bold">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  <span>3. Modelo Freemium Híbrido</span>
                </strong>
                <p>
                  El software libre se distribuye gratuitamente mostrando un banner discreto de patrocinio, ofreciendo a empresas
                  o usuarios avanzados comprar una clave de licencia para retirar la publicidad y acceder a funciones prémium.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Link */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl flex items-center justify-between">
            <span className="text-[11px] text-indigo-900 dark:text-indigo-200">
              ¿Quieres revisar cómo interactúan los anuncios con la directiva ePrivacy y cookies?
            </span>
            <button
              onClick={() => {
                setAdManagerOpen(false);
                setActivePrivacyTab('cookies');
                setPrivacyCenterOpen(true);
              }}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] shadow-sm transition-colors shrink-0"
            >
              Ver Cookies & LSSI
            </button>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-obsidian-950 border-t border-slate-200 dark:border-obsidian-800 flex items-center justify-between shrink-0 text-xs">
          <div className="text-[11px] font-mono text-slate-500">
            {isProLicense ? 'Estado: Versión Pro (Sin publicidad)' : 'Estado: Edición Estándar (Patrocinada)'}
          </div>
          <button
            onClick={() => setAdManagerOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-obsidian-800 hover:bg-slate-300 dark:hover:bg-obsidian-750 text-slate-800 dark:text-slate-100 font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
