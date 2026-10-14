import React, { useState } from 'react';
import {
  Heart,
  X,
  ExternalLink,
  Copy,
  Check,
  Coffee,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Zap,
  Globe,
  Coins,
  QrCode,
  Award,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface CryptoWallet {
  symbol: string;
  name: string;
  network: string;
  address: string;
  qrPattern: string;
}

const CRYPTO_WALLETS: CryptoWallet[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Mainnet (SegWit / Native)',
    address: 'bc1qapex9ff1ce0pen50urce2026sovere1gndata',
    qrPattern: 'bitcoin:bc1qapex9ff1ce0pen50urce2026sovere1gndata',
  },
  {
    symbol: 'ETH / USDT',
    name: 'Ethereum & Tokens',
    network: 'Ethereum (ERC-20) / Polygon / Arbitrum',
    address: '0x71C8A69F65B6201e74D7C261975e53cD01c9Apex',
    qrPattern: 'ethereum:0x71C8A69F65B6201e74D7C261975e53cD01c9Apex',
  },
  {
    symbol: 'XMR',
    name: 'Monero (100% Anónimo)',
    network: 'CryptoNote Sovereign Privacy Network',
    address: '888tNkZrPN6JsEshktqhWcmApex0ff1cePrivateD0nat10nS0vere1gnT0kenXMR2026',
    qrPattern: 'monero:888tNkZrPN6JsEshktqhWcmApex0ff1cePrivateD0nat10nS0vere1gnT0kenXMR2026',
  },
];

export const SupportDonationModal: React.FC = () => {
  const { isDonationModalOpen, setDonationModalOpen } = useOfficeStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fiat' | 'crypto' | 'tiers'>('fiat');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoWallet>(CRYPTO_WALLETS[0]);

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
        className="relative w-full max-w-3xl my-auto bg-obsidian-900 border border-obsidian-700/90 rounded-2xl shadow-2xl shadow-rose-950/30 overflow-hidden flex flex-col text-slate-200 animate-scale-up max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-rose-950/40 via-obsidian-900 to-indigo-950/40 border-b border-obsidian-750 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white shrink-0">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Apoyar el Desarrollo de Apex Office
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-rose-500/15 border border-rose-500/30 text-rose-300">
                  Open Source Soberano
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Software libre, privado, sin telemetría ni suscripciones obligatorias. Tu apoyo hace posible este proyecto.
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-obsidian-800 bg-obsidian-950/60 px-6 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('fiat')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'fiat'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Plataformas & Pasarelas
          </button>
          <button
            onClick={() => setActiveTab('crypto')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'crypto'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" /> Criptomonedas (Web3 & Privacidad)
          </button>
          <button
            onClick={() => setActiveTab('tiers')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'tiers'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" /> ¿En qué se invierten los fondos?
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: FIAT & DONATION PLATFORMS */}
          {activeTab === 'fiat' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/20 to-amber-950/20 border border-rose-500/20 text-xs text-rose-200/90 leading-relaxed">
                <span className="font-semibold text-white">¿Por qué donar?</span> Apex Office es una alternativa real y soberana a Microsoft 365, LibreOffice y Google Workspace. Todo el código se ejecuta en tu máquina, con cero envío de datos a servidores externos. Tu donación ayuda a financiar el desarrollo de nuevos motores nativos, auditorías de seguridad y compatibilidad multiplataforma.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* GitHub Sponsors */}
                <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-750 hover:border-pink-500/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                          <GithubIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-white">GitHub Sponsors</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-pink-500/15 text-pink-300">
                        0% Comisión
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Patrocina directamente al autor desde GitHub. Recibirás la insignia de Sponsor oficial en tu perfil de desarrollador.
                    </p>
                  </div>
                  <a
                    href="https://github.com/sponsors/jpscalero"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-600/20"
                  >
                    <span>Patrocinar en GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Ko-fi */}
                <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-750 hover:border-rose-500/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                          <Coffee className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-white">Ko-fi</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/15 text-rose-300">
                        Un café
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Invítanos a un café puntual o mensual sin necesidad de suscripciones complicadas ni creación obligatoria de cuenta.
                    </p>
                  </div>
                  <a
                    href="https://ko-fi.com/jpscalero"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
                  >
                    <span>Donar en Ko-fi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Buy Me a Coffee */}
                <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-750 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Zap className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-white">Buy Me a Coffee</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                        Rápido & Fácil
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Aporta un café o conviértete en mecenas habitual con tarjeta, Apple Pay o Google Pay en 10 segundos.
                    </p>
                  </div>
                  <a
                    href="https://buymeacoffee.com/jpscalero"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-600/20"
                  >
                    <span>Buy Me a Coffee</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* PayPal Direct */}
                <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-750 hover:border-blue-500/40 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-white">PayPal.me</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/15 text-blue-300">
                        Transferencia
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      Donación directa e instantánea a través de PayPal con la cantidad que tú elijas libremente.
                    </p>
                  </div>
                  <a
                    href="https://paypal.me/jpscalero"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
                  >
                    <span>Donar con PayPal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRYPTOCURRENCIES */}
          {activeTab === 'crypto' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-800 text-xs text-slate-400 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Las donaciones con criptomonedas son descentralizadas, directas y sin intermediarios bancarios. Soportamos pagos anónimos en Monero (XMR).
                </span>
              </div>

              {/* Crypto Selector Chips */}
              <div className="grid grid-cols-3 gap-2">
                {CRYPTO_WALLETS.map((wallet) => (
                  <button
                    key={wallet.symbol}
                    onClick={() => setSelectedCrypto(wallet)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCrypto.symbol === wallet.symbol
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                        : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200 hover:border-obsidian-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{wallet.symbol}</div>
                    <div className="text-[11px] text-slate-400 truncate">{wallet.name}</div>
                  </button>
                ))}
              </div>

              {/* Active Wallet Details Card */}
              <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-750 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-white">
                      Red: {selectedCrypto.network}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono">
                    {selectedCrypto.symbol}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Dirección Pública de Depósito:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2.5 rounded-lg bg-obsidian-900 border border-obsidian-800 font-mono text-[11px] text-emerald-400 break-all select-all">
                      {selectedCrypto.address}
                    </div>
                    <button
                      onClick={() => handleCopy(selectedCrypto.address, selectedCrypto.symbol)}
                      className={`p-2.5 rounded-lg border font-medium text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                        copiedKey === selectedCrypto.symbol
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-obsidian-800 border-obsidian-700 hover:bg-obsidian-750 text-slate-200'
                      }`}
                      title="Copiar dirección"
                    >
                      {copiedKey === selectedCrypto.symbol ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulated QR Code helper */}
                <div className="pt-2 border-t border-obsidian-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-amber-400" /> Compatible con carteras nativas y escaneo QR
                  </span>
                  <span className="text-slate-400">Sin custodia centralizada</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSPARENCY & FUNDING OBJECTIVES */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-750 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                    <Sparkles className="w-4 h-4" /> Nuevos Módulos
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Desarrollo de exportadores nativos ODF/OOXML binarios, motor de fórmulas financieras extendidas y compatibilidad con formatos vectoriales SVG y CAD.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-750 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4" /> Auditorías de Seguridad
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Verificación continua contra inyección DDE, ataques XXE en hojas de cálculo y endurecimiento de sandboxes locales WebAssembly.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-obsidian-750 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                    <Globe className="w-4 h-4" /> Soporte Multiplataforma
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Mantenimiento de empaquetados nativos para Windows (.exe portable), GNU/Linux (.AppImage, .deb, .tar.gz) y macOS (.dmg).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/30 to-obsidian-950 border border-indigo-500/20 text-xs space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" /> Compromiso Soberano de Apex Office
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Las funciones fundamentales de Apex Office <strong>siempre serán 100% libres y gratuitas</strong>. El modelo de patrocinio existe para garantizar que el proyecto sea sostenible a largo plazo sin comprometer jamás la privacidad de los usuarios ni vender datos a terceros.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-obsidian-950/90 border-t border-obsidian-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30" />
            <span>Desarrollado con pasión para la comunidad de código abierto</span>
          </div>
          <button
            onClick={() => setDonationModalOpen(false)}
            className="py-1.5 px-4 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-white text-xs font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
export default SupportDonationModal;
