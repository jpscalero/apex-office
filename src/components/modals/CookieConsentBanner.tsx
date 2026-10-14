import React from 'react';
import { Cookie, ShieldCheck, Settings, Check, X } from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

export const CookieConsentBanner: React.FC = () => {
  const {
    isCookieBannerDismissed,
    dismissCookieBanner,
    setCookiePreferences,
    setPrivacyCenterOpen,
    setActivePrivacyTab,
  } = useOfficeStore();

  if (isCookieBannerDismissed) return null;

  const handleAcceptEssentialOnly = () => {
    setCookiePreferences({
      technical: true,
      preferences: false,
      analytics: false,
    });
    dismissCookieBanner();
  };

  const handleAcceptAll = () => {
    setCookiePreferences({
      technical: true,
      preferences: true,
      analytics: true,
    });
    dismissCookieBanner();
  };

  const handleConfigure = () => {
    setActivePrivacyTab('cookies');
    setPrivacyCenterOpen(true);
  };

  return (
    <div
      role="region"
      aria-label="Gestión de consentimiento de cookies y almacenamiento local"
      className="fixed bottom-4 right-4 sm:right-6 z-40 max-w-xl w-[calc(100vw-2rem)] bg-white dark:bg-obsidian-900 border border-amber-300 dark:border-amber-500/40 rounded-2xl shadow-2xl p-5 text-slate-800 dark:text-slate-100 animate-in slide-in-from-bottom-6 duration-300 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Cookies & Almacenamiento Local Soberano
              </h4>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600/40">
                LSSI-CE • ePrivacy
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Conforme al Art. 22.2 de la LSSI-CE y directrices actualizadas de la AEPD
            </p>
          </div>
        </div>

        <button
          onClick={handleAcceptEssentialOnly}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors"
          title="Continuar solo con esenciales"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Explanatory Body */}
      <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
        <p>
          Apex Office utiliza <strong>cookies técnicas y almacenamiento local en tu dispositivo</strong> (LocalStorage local bajo la clave apex-office-state-v1)
          estrictamente necesarios para recordar tu sesión de trabajo, el ajuste de ventana y tus preferencias de tema sin requerir conexión.
        </p>
        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Garantía Zero-Tracking: 0 cookies de terceros, 0 rastreadores publicitarios y 0 telemetría externa.</span>
        </div>
      </div>

      {/* Action Buttons (AEPD-compliant: equal prominence for refusal and acceptance) */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-obsidian-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        <button
          onClick={handleConfigure}
          className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-obsidian-700 bg-slate-50 dark:bg-obsidian-800 hover:bg-slate-100 dark:hover:bg-obsidian-750 text-slate-700 dark:text-slate-200 font-medium transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configurar</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAcceptEssentialOnly}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-300 dark:border-obsidian-700 bg-white dark:bg-obsidian-850 hover:bg-slate-50 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-200 font-medium transition-colors"
          >
            Solo Técnicas
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aceptar Todo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
