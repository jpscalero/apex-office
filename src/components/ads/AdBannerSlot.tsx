import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  X,
  ChevronRight,
  ChevronLeft,
  Settings,
  Crown,
  Megaphone,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

interface AdItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  category: 'cloud' | 'security' | 'pro' | 'privacy';
  sponsor: string;
}

const SAMPLE_ADS: AdItem[] = [
  {
    id: 'ad-1',
    badge: 'Patrocinador Verificado',
    sponsor: 'Hetzner Cloud Europa',
    title: 'Infraestructura Cloud Soberana en la UE',
    description: 'Servidores dedicados y NVMe en Alemania y Finlandia. 100% conforme con RGPD y energía 100% renovable.',
    ctaText: 'Ver Servidores',
    ctaUrl: 'https://www.hetzner.com/cloud',
    category: 'cloud',
  },
  {
    id: 'ad-2',
    badge: 'Seguridad FIDO2',
    sponsor: 'Yubico Hardware Keys',
    title: 'Autenticación Resistente a Phishing',
    description: 'Protege tus documentos y accesos corporativos con llaves de seguridad físicas YubiKey 5 Series.',
    ctaText: 'Descubrir YubiKey',
    ctaUrl: 'https://www.yubico.com',
    category: 'security',
  },
  {
    id: 'ad-3',
    badge: 'Apex Enterprise',
    sponsor: 'Apex Office Suite',
    title: 'Pasa a Apex Office Pro y Elimina la Publicidad',
    description: 'Obtén firma digital cualificada eIDAS, sincronización P2P encriptada y soporte corporativo 24/7 sin anuncios.',
    ctaText: 'Activar Licencia Pro',
    ctaUrl: '#pro',
    category: 'pro',
  },
  {
    id: 'ad-4',
    badge: 'Privacidad Suiza',
    sponsor: 'Proton AG',
    title: 'Correo y VPN Cifrados de Extremo a Extremo',
    description: 'Comunicaciones empresariales protegidas por las estrictas leyes de confidencialidad suizas.',
    ctaText: 'Probar Gratis',
    ctaUrl: 'https://proton.me',
    category: 'privacy',
  },
];

export const AdBannerSlot: React.FC<{ position?: 'top' | 'bottom' | 'floating' }> = ({
  position = 'top',
}) => {
  const {
    showAdBanners,
    isProLicense,
    adBannerPosition,
    setAdManagerOpen,
    zenMode,
    isPresentationMode,
  } = useOfficeStore();

  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isDismissedTemporarily, setIsDismissedTemporarily] = useState(false);

  // Rotate ads every 12 seconds
  useEffect(() => {
    if (!showAdBanners || isProLicense || isDismissedTemporarily) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [showAdBanners, isProLicense, isDismissedTemporarily]);

  // Don't render if disabled, pro, zen mode or presentation mode
  if (!showAdBanners || isProLicense || isDismissedTemporarily || zenMode || isPresentationMode) {
    return null;
  }

  // Only render if matches chosen position
  if (position !== adBannerPosition) {
    return null;
  }

  const currentAd = SAMPLE_ADS[currentAdIndex];

  const handleNext = () => setCurrentAdIndex((prev) => (prev + 1) % SAMPLE_ADS.length);
  const handlePrev = () =>
    setCurrentAdIndex((prev) => (prev - 1 + SAMPLE_ADS.length) % SAMPLE_ADS.length);

  const handleCta = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentAd.category === 'pro' || currentAd.ctaUrl === '#pro') {
      setAdManagerOpen(true);
    } else {
      window.open(currentAd.ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (position === 'floating') {
    return (
      <div className="fixed bottom-6 left-6 z-30 max-w-sm w-full bg-white dark:bg-obsidian-900 border border-slate-300 dark:border-obsidian-750 rounded-2xl shadow-2xl p-4 text-xs animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-obsidian-800">
          <div className="flex items-center space-x-1.5">
            <Megaphone className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
              Patrocinio Directo
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setAdManagerOpen(true)}
              className="text-slate-400 hover:text-indigo-500 p-0.5 rounded"
              title="Gestionar publicidad y licencia Pro"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDismissedTemporarily(true)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded"
              title="Cerrar anuncio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 space-y-1.5">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            {currentAd.badge}
          </span>
          <h5 className="font-bold text-slate-900 dark:text-white leading-tight">
            {currentAd.title}
          </h5>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
            {currentAd.description}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-obsidian-800">
          <button
            onClick={() => setAdManagerOpen(true)}
            className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Crown className="w-3 h-3 text-amber-500" />
            <span>Quitar Anuncios</span>
          </button>
          <button
            onClick={handleCta}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] shadow-sm transition-colors"
          >
            <span>{currentAd.ctaText}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Top or Bottom Horizontal Leaderboard Banner (Clean, responsive and unobtrusive)
  return (
    <aside
      role="complementary"
      aria-label="Espacio de publicidad y patrocinio ético"
      className={`w-full shrink-0 select-none transition-all duration-150 ${
        position === 'top'
          ? 'border-b border-amber-400/30 dark:border-obsidian-750 bg-gradient-to-r from-amber-500/10 via-slate-50 to-indigo-500/10 dark:from-obsidian-950 dark:via-obsidian-900 dark:to-obsidian-950'
          : 'border-t border-amber-400/30 dark:border-obsidian-750 bg-gradient-to-r from-amber-500/10 via-slate-50 to-indigo-500/10 dark:from-obsidian-950 dark:via-obsidian-900 dark:to-obsidian-950'
      } px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 flex items-center justify-between gap-3 overflow-hidden`}
    >
      {/* Left: Badge & Sponsor */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
          <Megaphone className="w-3 h-3 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>PATROCINADO</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hidden sm:inline">
          {currentAd.sponsor}
        </span>
      </div>

      {/* Center: Ad Content */}
      <div className="flex-1 flex items-center justify-center space-x-3 text-center min-w-0">
        <div className="truncate">
          <strong className="text-slate-900 dark:text-white font-bold text-xs mr-2">
            {currentAd.title}:
          </strong>
          <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate hidden md:inline">
            {currentAd.description}
          </span>
        </div>

        <button
          onClick={handleCta}
          className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] shadow-sm transition-colors"
        >
          <span>{currentAd.ctaText}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Right: Controls & Pro Upgrade */}
      <div className="flex items-center space-x-1.5 shrink-0">
        {/* Next / Prev Ad buttons */}
        <div className="hidden lg:flex items-center space-x-0.5">
          <button
            onClick={handlePrev}
            className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-obsidian-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            title="Anuncio anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-0.5">
            {currentAdIndex + 1}/{SAMPLE_ADS.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-obsidian-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            title="Siguiente anuncio"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upgrade to Pro button */}
        <button
          onClick={() => setAdManagerOpen(true)}
          className="flex items-center space-x-1 px-2 py-1 rounded-md text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/40 hover:bg-amber-200/70 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/50 transition-colors"
          title="Eliminar publicidad mediante licencia Pro o cambiar ubicación"
        >
          <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="hidden xl:inline">Quitar Anuncios</span>
        </button>

        {/* Ad settings button */}
        <button
          onClick={() => setAdManagerOpen(true)}
          className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-obsidian-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          title="Configurar publicidad y formatos"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Dismiss temporarily */}
        <button
          onClick={() => setIsDismissedTemporarily(true)}
          className="p-1 rounded hover:bg-slate-200/60 dark:hover:bg-obsidian-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          title="Ocultar anuncio en esta sesión"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
