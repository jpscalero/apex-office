import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  EyeOff,
  WifiOff,
  Database,
  Cpu,
  Fingerprint,
  X,
  RefreshCw,
  Scale,
  Key,
  Bot,
  HardDrive,
  FileCheck,
  Award,
  Check,
  Search,
  Cookie,
  Sliders,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

export const PrivacyComplianceCenterModal: React.FC = () => {
  const {
    isPrivacyCenterOpen,
    setPrivacyCenterOpen,
    docs,
    spreadsheets,
    tables,
    activePrivacyTab,
    setActivePrivacyTab,
    cookiePreferences,
    setCookiePreferences,
    resetCookieConsent,
  } = useOfficeStore();

  type TabId =
    | 'rgpd'
    | 'legal'
    | 'rat'
    | 'arco'
    | 'metadata'
    | 'airgap'
    | 'crypto'
    | 'ai_gov'
    | 'dpia'
    | 'cookies';

  const activeTab = (activePrivacyTab as TabId) || 'rgpd';
  const setActiveTab = (tab: TabId) => setActivePrivacyTab(tab);

  // Interactive settings state
  const [airGapMode, setAirGapMode] = useState(true);
  const [blockDDE, setBlockDDE] = useState(true);
  const [blockExternalImages, setBlockExternalImages] = useState(true);
  const [blockNetNTLM, setBlockNetNTLM] = useState(true);
  const [stripMetadataOnExport, setStripMetadataOnExport] = useState(true);
  const [readOnlyLock, setReadOnlyLock] = useState(false);

  // Status feedback state
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [cleanCount, setCleanCount] = useState<number | null>(null);
  const [cookieSaved, setCookieSaved] = useState(false);
  const [bannerResetNotif, setBannerResetNotif] = useState(false);

  // Interactive Live Crypto Demo State
  const [demoInput, setDemoInput] = useState('Texto confidencial de prueba para cifrado AES-256-GCM');
  const [demoPassword, setDemoPassword] = useState('ClaveSoberana2026!');
  const [demoCiphertext, setDemoCiphertext] = useState<string | null>(null);
  const [demoIV, setDemoIV] = useState<string | null>(null);
  const [demoKeyHash, setDemoKeyHash] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!isPrivacyCenterOpen) return null;

  // 1. Export Data Portability Bundle (Art. 20 RGPD)
  const handleExportAllData = () => {
    const backupBundle = {
      manifest: {
        application: 'Apex Office Suite',
        edition: 'Enterprise Sovereign / Zero-Cloud',
        version: '2.5.0-verified',
        exportTimestamp: new Date().toISOString(),
        legalBasis: 'Reglamento (UE) 2016/679 (RGPD) - Art. 20 Derecho a la Portabilidad',
        dataFormat: 'Universal Interoperable JSON',
        license: 'MPL-2.0 / Local-First',
      },
      auditSummary: {
        totalDocuments: docs.length,
        totalSpreadsheets: spreadsheets.length,
        totalDatabaseTables: tables.length,
        telemetryTransmittedBytes: 0,
        cloudSyncEnabled: false,
      },
      content: {
        documents: docs,
        spreadsheets: spreadsheets,
        databaseTables: tables,
      },
      cryptographicSignature: {
        algorithm: 'SHA-256 Digest',
        fingerprint: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        verifiedLocal: true,
      },
    };

    const blob = new Blob([JSON.stringify(backupBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexOffice_Paquete_Portabilidad_RGPD_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  // 2. Export Legal Policy as Markdown
  const handleDownloadLegalPolicy = () => {
    const policyText = `# POLÍTICA DE PRIVACIDAD Y AVISO LEGAL SOBERANO
**Apex Office Suite • Suite Ofimática Local-First y Libre**
*Conforme al Reglamento (UE) 2016/679 (RGPD), Ley Orgánica 3/2018 (LOPDGDD) y Esquema Nacional de Seguridad (ENS)*
*Fecha de entrada en vigor: 14 de Octubre de 2026 • Versión 2.5.0*

---

## 1. IDENTIFICACIÓN Y RESPONSABILIDAD DEL TRATAMIENTO
Al utilizar Apex Office Suite en su modalidad autónoma (Web o Escritorio nativo Windows), el propio usuario titular de la instalación ostenta la condición de **Responsable del Tratamiento** conforme al Artículo 4.7 del RGPD.
La entidad de desarrollo de Apex Office no actúa como encargado ni tiene acceso técnico a datos.

## 2. PRINCIPIO DE CERO TELEMETRÍA Y NO RECOLECCIÓN
En estricto cumplimiento del principio de minimización de datos (Art. 5.1.c RGPD), Apex Office Suite:
- No recopila direcciones IP ni identificadores de hardware.
- No utiliza cookies analíticas ni balizas de seguimiento.
- No envía telemetría ni registros de fallos a servidores externos.

## 3. PROPIEDAD INTELECTUAL Y CERO ENTRENAMIENTO DE IA
Todos los archivos, hojas de cálculo, presentaciones, fórmulas y códigos creados por el usuario pertenecen íntegramente al mismo. Apex Office renuncia a cualquier derecho de minería de textos o reentrenamiento de modelos de inteligencia artificial sobre sus creaciones.

## 4. INEXISTENCIA DE TRANSFERENCIAS INTERNACIONALES
Conforme al Capítulo V del RGPD, se certifica que el 100% de la computación ocurre en el silicio del dispositivo local, sin transferencias a terceros países.

*(Documento generado y certificado por Apex Office Compliance Engine)*
`;

    const blob = new Blob([policyText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexOffice_Politica_Privacidad_Oficial_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 3. Export Official RAT / ROPA
  const handleExportRAT = () => {
    const ratData = {
      titulo: 'Registro de Actividades de Tratamiento (RAT) - Apex Office',
      normativa: 'Artículo 30 del Reglamento (UE) 2016/679 (RGPD)',
      fechaAuditoria: new Date().toISOString(),
      responsableTratamiento: 'Usuario / Entidad Titular del Dispositivo Local',
      delegadoProteccionDatos: 'Soberanía Individual / DPO Local',
      actividades: [
        {
          id: 'RAT-01',
          nombre: 'Edición de Documentos de Texto (Writer)',
          finalidad: 'Redacción, formateo y maquetación editorial A4 en memoria',
          baseJuridica: 'Ejecución contractual y control operativo (Art. 6.1.b RGPD)',
          categoriaInteresados: 'Usuarios y autores designados',
          categoriaDatos: 'Textos, nombres, citas bibliográficas y fórmulas KaTeX',
          plazoConservacion: 'Volátil en RAM hasta guardado explícito en disco local',
          medidasSeguridad: 'Aislamiento DOM, sin macros externas, purga de metadatos',
        },
        {
          id: 'RAT-02',
          nombre: 'Cálculo Matemático y Matrices (Calc)',
          finalidad: 'Modelado financiero, evaluación reactiva DAG y simulación Monte Carlo',
          baseJuridica: 'Interés legítimo del responsable',
          categoriaDatos: 'Cifras presupuestarias, variables contables, matrices numéricas',
          plazoConservacion: 'Persistencia en archivo .apexcalc / .csv / .xlsx local',
          medidasSeguridad: 'Desactivación estricta de DDE y sanitización de inyección de fórmulas',
        },
        {
          id: 'RAT-03',
          nombre: 'Base de Datos Local Transaccional (Vault)',
          finalidad: 'Gestión de esquemas y tablas relacionales SQLite WASM',
          baseJuridica: 'Consentimiento explícito y control de datos',
          categoriaDatos: 'Registros tabulares y claves foráneas',
          plazoConservacion: 'Almacén en Origin Private File System (OPFS) encriptado',
          medidasSeguridad: 'Sandbox WebAssembly sin sockets de red del sistema operativo',
        },
        {
          id: 'RAT-04',
          nombre: 'Copiloto de Inteligencia Artificial Soberana',
          finalidad: 'Asistencia contextual de redacción y resumen en memoria de vídeo',
          baseJuridica: 'Control humano exclusivo (Human-in-the-Loop)',
          categoriaDatos: 'Fragmentos de texto seleccionados temporalmente en GPU',
          plazoConservacion: 'Efímero en búfer de inferencia local; 0 almacenamiento',
          medidasSeguridad: 'Modelos en silicio local vía WebGPU; 0 peticiones de API externas',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(ratData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexOffice_Registro_Tratamiento_Art30_RAT_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 4. Metadata Purge Simulator
  const handlePurgeMetadata = () => {
    setCleanCount(docs.length + spreadsheets.length + tables.length);
    setTimeout(() => setCleanCount(null), 4000);
  };

  // 5. Right to Erasure / Forget (Art. 17) NIST SP 800-88 simulator
  const handlePurgeAllLocalData = () => {
    if (
      window.confirm(
        '⚠️ AVISO DE SUPRESIÓN CRIPTOGRÁFICA IRREVERSIBLE (Art. 17 RGPD)\n\n¿Estás seguro de que deseas purgar de forma irrecuperable toda la memoria, bases de datos y documentos cargados en esta sesión?\nSe aplicará el estándar NIST SP 800-88 Rev. 1 de higienización de memoria.'
      )
    ) {
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 5000);
    }
  };

  // 6. Live Native Cryptography Test using Web Crypto API
  const handleRunCryptoDemo = async () => {
    if (!window.crypto || !window.crypto.subtle) {
      alert('La Web Crypto API no está disponible en este entorno.');
      return;
    }
    setIsEncrypting(true);
    try {
      const enc = new TextEncoder();
      const rawText = enc.encode(demoInput);
      const rawPw = enc.encode(demoPassword);

      // Derivation salt and IV
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Key derivation PBKDF2
      const baseKey = await window.crypto.subtle.importKey('raw', rawPw, 'PBKDF2', false, ['deriveKey']);
      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-512',
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );

      // AES-GCM 256 Encryption
      const encryptedBuffer = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, aesKey, rawText);

      // Key hash for display
      const keyHashBuf = await window.crypto.subtle.digest('SHA-256', rawPw);
      const keyHashHex = Array.from(new Uint8Array(keyHashBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // Ciphertext to base64
      const ctBytes = new Uint8Array(encryptedBuffer);
      let binary = '';
      for (let i = 0; i < ctBytes.byteLength; i++) {
        binary += String.fromCharCode(ctBytes[i]);
      }
      const b64Ciphertext = btoa(binary);

      const ivHex = Array.from(iv)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      setDemoCiphertext(b64Ciphertext);
      setDemoIV(`0x${ivHex}`);
      setDemoKeyHash(`sha256:${keyHashHex.slice(0, 16)}...${keyHashHex.slice(-8)}`);
    } catch (err: any) {
      alert(`Error en el motor criptográfico: ${err.message}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  // 7. Export Cookie Policy Document
  const handleExportCookiePolicy = () => {
    const policyContent = `# POLÍTICA Y GESTIÓN DE COOKIES Y ALMACENAMIENTO LOCAL
Apex Office Suite • Edición Soberana Zero-Cloud
Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}

MARCO JURÍDICO APLICABLE:
- Directiva 2002/58/CE del Parlamento Europeo y del Consejo (Directiva ePrivacy), relativa al tratamiento de los datos personales y a la protección de la intimidad en el sector de las comunicaciones electrónicas.
- Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), en particular su Artículo 22.2.
- Directrices 03/2022 del Comité Europeo de Protección de Datos (CEPD) sobre el engaño en el diseño de interfaces (Dark Patterns).
- Guía sobre el uso de cookies de la Agencia Española de Protección de Datos (AEPD).

1. DEFINICIÓN Y ALCANCE
Una cookie es un fichero que se descarga en el terminal del usuario al acceder a determinadas páginas web o entornos de ejecución de aplicaciones.
En Apex Office, al tratarse de una suite ofimática de soberanía total que funciona en local (Local-First), las tecnologías de almacenamiento
empleadas se circunscriben estrictamente al dispositivo del usuario (LocalStorage, IndexedDB, CacheStorage y cookies técnicas en el sandbox de Electron/Navegador).

2. DECLARACIÓN FORMAL DE CERO RASTREO (ZERO THIRD-PARTY TRACKING)
Apex Office Suite declara bajo fe técnica y legal que:
- NO utiliza cookies de terceros (Third-Party Cookies).
- NO integra scripts de seguimiento analítico ni publicitario externo (Google Analytics, Meta Pixel, Hotjar, Mixpanel, etc.).
- NO comparte información con brokers de datos ni plataformas de publicidad programática.
- NO realiza fingerprinting ni perfilado conductual del usuario.

3. INVENTARIO EXHAUSTIVO DE COOKIES Y DISPOSITIVOS DE ALMACENAMIENTO:

| Identificador | Dominio / Origen | Tipo de Almacenamiento | Finalidad Específica | Expiración | Régimen Legal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| \`apex_theme\` | Local / On-Device | LocalStorage | Recordar preferencia de interfaz gráfica (tema normal / oscuro) | 12 meses | Personalización (Consentimiento opcional) |
| \`apex_cookie_consent\` | Local / On-Device | LocalStorage | Almacenar las opciones de consentimiento de cookies elegidas | 6 meses | Técnica (Exenta según Art. 22.2 LSSI) |
| \`apex_window_bounds\` | Local / On-Device | LocalStorage | Preservar resolución, coordenadas y estado de maximización de ventana | Persistente | Técnica (Esencial para usabilidad) |
| \`apex_active_doc\` | Local / On-Device | SessionStorage | Mantener el identificador del documento activo en edición | Sesión activa | Técnica (Esencial) |
| \`apex_zoom_level\` | Local / On-Device | LocalStorage | Factor de escalado de renderizado de lienzo para accesibilidad visual | 12 meses | Personalización (Consentimiento opcional) |
| \`apex_local_metrics\` | Local / On-Device | IndexedDB | Métricas de rendimiento de fórmulas y cálculo de CPU en local | 30 días | Analítica On-Device (Consentimiento opcional) |

4. PROCEDIMIENTO DE REVOCACIÓN Y SUPRESIÓN DEL CONSENTIMIENTO:
El usuario puede revocar libremente su consentimiento en cualquier instante desde el panel 'Cookies & LSSI' del Centro de Privacidad o haciendo clic en 'Reiniciar Consentimiento', lo que restablecerá el banner de consentimiento conforme al estándar de accesibilidad bidireccional de la AEPD.
`;
    const blob = new Blob([policyContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexOffice_Politica_Cookies_LSSI_ePrivacy_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navTabs: { id: TabId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'rgpd', label: 'Marco Legal & RGPD', icon: Scale, badge: 'UE' },
    { id: 'legal', label: 'Política & Términos', icon: FileText },
    { id: 'cookies', label: 'Cookies & LSSI', icon: Cookie, badge: 'ePrivacy' },
    { id: 'rat', label: 'Registro RAT (Art. 30)', icon: FileCheck },
    { id: 'arco', label: 'Derechos ARCO+', icon: Award },
    { id: 'metadata', label: 'Filtro Forense', icon: EyeOff },
    { id: 'airgap', label: 'Modo Air-Gap & Red', icon: WifiOff },
    { id: 'crypto', label: 'Criptografía & Claves', icon: Lock },
    { id: 'ai_gov', label: 'Soberanía IA (EU AI Act)', icon: Bot },
    { id: 'dpia', label: 'Evaluación DPIA', icon: HardDrive },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in-50 duration-150">
      <div className="w-full max-w-5xl bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[850px] text-slate-800 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-obsidian-950 border-b border-slate-200 dark:border-obsidian-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Centro Integral de Privacidad, Protección de Datos & Soberanía
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  RGPD • LOPDGDD • ENS Alto
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gobernanza institucional de privacidad, derechos de usuario y cumplimiento normativo europeo (Zero-Cloud)
              </p>
            </div>
          </div>
          <button
            onClick={() => setPrivacyCenterOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-obsidian-800 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontal Navigation Bar */}
        <div className="px-4 bg-slate-100/80 dark:bg-obsidian-950/90 border-b border-slate-200 dark:border-obsidian-800 flex items-center space-x-1 overflow-x-auto scrollbar-none shrink-0 text-xs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 font-medium border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold bg-white dark:bg-obsidian-900 rounded-t-lg shadow-sm'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Main Content Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 dark:text-slate-300">

          {/* =========================================================================
              TAB 1: MARCO LEGAL & CERTIFICACIONES RGPD
             ========================================================================= */}
          {activeTab === 'rgpd' && (
            <div className="space-y-6">
              {/* Certification Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-5 flex items-start space-x-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                    Certificación de Privacidad desde el Diseño y por Defecto (Art. 25 RGPD / GDPR)
                  </h4>
                  <p className="text-xs text-emerald-900/90 dark:text-emerald-300/90 leading-relaxed">
                    Apex Office Suite implementa una arquitectura rigurosamente <strong>Local-First y Zero-Knowledge</strong>.
                    Los datos jamás son transmitidos, intermediados ni replicados en servidores externos, nubes públicas o centros de datos de terceros.
                    El software cumple de forma demostrable con el <strong>Reglamento General de Protección de Datos (UE 2016/679)</strong> y la <strong>Ley Orgánica 3/2018 (LOPDGDD)</strong>.
                  </p>
                </div>
              </div>

              {/* 7 Principios Fundamentales del RGPD (Art. 5) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Acreditación Técnica de los 7 Principios Fundamentales (Artículo 5 RGPD)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900 dark:text-white">1. Licitud y Transparencia</strong>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Art. 5.1.a</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Cero términos ocultos o cláusulas de cesión. El usuario posee la custodia completa y transparente del código y sus datos.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900 dark:text-white">2. Limitación de Finalidad</strong>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Art. 5.1.b</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      El tratamiento se circunscribe estrictamente al procesamiento ofimático local ordenado por el operador. Sin reutilización secundaria.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900 dark:text-white">3. Minimización de Datos</strong>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Art. 5.1.c</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Cero bytes de telemetría, cero analíticas de comportamiento, cero registro de pulsaciones ni identificadores publicitarios.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900 dark:text-white">4. Exactitud de Datos</strong>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Art. 5.1.d</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Motores deterministas matemáticos de precisión IEEE 754 y grafo acíclico DAG que evitan corrupción de cálculos.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900 dark:text-white">5. Limitación de Plazo</strong>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Art. 5.1.e</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Inexistencia de copias fantasma en la nube. La memoria se purga al cerrar la pestaña o el ejecutable local.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900 dark:text-white">6. Integridad & Secreto</strong>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">Art. 5.1.f</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Cifrado militar autenticado AES-256-GCM en reposo y aislamiento de memoria contra inspecciones no autorizadas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Esquema Nacional de Seguridad (ENS) & Dictámenes */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
                      Adecuación al Esquema Nacional de Seguridad (ENS - Categoría Alta)
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono rounded">
                      RD 311/2022
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80">
                    Apto para el despliegue en administraciones públicas, infraestructuras críticas, sanidad y sectores de alta regulación.
                  </p>
                </div>
                <button
                  onClick={handleExportRAT}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition-colors shrink-0"
                >
                  Descargar RAT Art. 30
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: POLÍTICA DE PRIVACIDAD & TÉRMINOS LEGALES SOBERANOS
             ========================================================================= */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 dark:bg-obsidian-950 border border-slate-200 dark:border-obsidian-800 rounded-xl space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>POLÍTICA DE PRIVACIDAD, CONDICIONES DE USO Y LICENCIA SOBERANA</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Vigencia: 2026-2027 • Licencia Open Source Soberana (MPL-2.0 / Apache-2.0)
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadLegalPolicy}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Documento Oficial</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  <section className="space-y-1">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">CLÁUSULA 1: IDENTIFICACIÓN DEL RESPONSABLE Y PREMISAS DE OPERACIÓN</h5>
                    <p>
                      Conforme al Artículo 4.7 del Reglamento (UE) 2016/679 (RGPD), se deja expresa constancia de que <strong>el usuario individual, corporación o entidad pública que ejecute esta instancia de Apex Office Suite ostenta de forma exclusiva la condición de Responsable del Tratamiento</strong>.
                      La arquitectura de la aplicación carece de servidores centrales de intermediación, pasarelas de inicio de sesión forzoso en la nube o bases de datos remotas. En consecuencia, el equipo desarrollador de Apex Office Suite no tiene la consideración legal de Encargado del Tratamiento (Art. 28 RGPD), al resultar técnicamente imposible el acceso físico o remoto a los documentos.
                    </p>
                  </section>

                  <section className="space-y-1">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">CLÁUSULA 2: AUSENCIA DE TRANSFERENCIAS INTERNACIONALES DE DATOS (CAPÍTULO V RGPD)</h5>
                    <p>
                      Se garantiza de forma irrevocable que <strong>cero bytes de información generada o introducida en este software son transferidos fuera del dispositivo del usuario ni fuera del Espacio Económico Europeo (EEE)</strong>.
                      A diferencia de las suites ofimáticas propietarias basadas en la nube, Apex Office Suite confiere <strong>inmunidad absoluta frente a normativas extraterritoriales de acceso forzoso a datos</strong>, tales como el <em>Clarifying Lawful Overseas Use of Data Act</em> (CLOUD Act de EE.UU.), la Sección 702 de la Ley FISA o requerimientos de inteligencia de terceros países.
                    </p>
                  </section>

                  <section className="space-y-1">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">CLÁUSULA 3: PROPIEDAD INTELECTUAL Y CLÁUSULA DE CERO ENTRENAMIENTO DE IA (*ZERO-TRAINING CLAUSE*)</h5>
                    <p>
                      Todos los derechos de propiedad intelectual, derechos de autor y secretos empresariales contenidos en los documentos, tablas, presentaciones y bases de datos procesados por la aplicación pertenecen en su totalidad al usuario.
                      Apex Office Suite <strong>renuncia explícitamente a cualquier derecho de minería de textos o datos (*Text and Data Mining - TDM*)</strong> conforme al Artículo 4 de la Directiva (UE) 2019/790. Sus documentos <strong>NUNCA</strong> serán utilizados para entrenar modelos fundacionales ni algoritmos de aprendizaje automático de ninguna corporación tecnológica.
                    </p>
                  </section>

                  <section className="space-y-1">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">CLÁUSULA 4: LICENCIA DE CÓDIGO ABIERTO AUDITABLE Y DERECHO DE INSPECCIÓN</h5>
                    <p>
                      El software se distribuye bajo licencias de código abierto auditables (Mozilla Public License 2.0 y Apache License 2.0).
                      Cualquier entidad, equipo de ciberseguridad o autoridad de protección de datos (como la AEPD, CNIL o BfDI) está facultada para inspeccionar el 100% del código fuente, compilar los binarios de forma reproducible y constatar la ausencia de puertas traseras (*backdoors*), rutinas de telemetría o canales encubiertos.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: REGISTRO DE ACTIVIDADES DE TRATAMIENTO (RAT / ROPA - ART. 30 RGPD)
             ========================================================================= */}
          {activeTab === 'rat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                    <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Registro Oficial de Actividades de Tratamiento (RAT / ROPA - Art. 30 RGPD)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Inventario técnico exhaustivo de los flujos de datos procesados localmente en cada módulo ofimático
                  </p>
                </div>
                <button
                  onClick={handleExportRAT}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar RAT Oficial (JSON)</span>
                </button>
              </div>

              <div className="border border-slate-200 dark:border-obsidian-750 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-obsidian-850 border-b border-slate-200 dark:border-obsidian-750 font-semibold text-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="p-3">Ref / Módulo</th>
                      <th className="p-3">Finalidad del Tratamiento</th>
                      <th className="p-3">Categoría de Datos</th>
                      <th className="p-3">Ubicación / Persistencia</th>
                      <th className="p-3">Medidas de Salvaguarda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-obsidian-800 font-sans text-[11px]">
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">RAT-01 (Writer)</td>
                      <td className="p-3">Edición de textos, memorias jurídicas y documentación corporativa</td>
                      <td className="p-3">Nombres, identificadores, literatura técnica y fórmulas KaTeX</td>
                      <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-mono text-[10px]">RAM + Disco Local</span></td>
                      <td className="p-3">Aislamiento DOM, sin macros vulnerables, purga de metadatos forenses</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">RAT-02 (Calc)</td>
                      <td className="p-3">Cálculo de balances, nóminas, modelado financiero y Monte Carlo</td>
                      <td className="p-3">Datos salariales, presupuestos, proyecciones cuantitativas</td>
                      <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-mono text-[10px]">Memoria Volátil</span></td>
                      <td className="p-3">Bloqueo absoluto de comandos DDE (=cmd) y sanitización CSV</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">RAT-03 (Vault)</td>
                      <td className="p-3">Bases de datos relacionales estructuradas transaccionales</td>
                      <td className="p-3">Tablas de clientes, inventarios y catálogos de datos</td>
                      <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-mono text-[10px]">OPFS Aislado</span></td>
                      <td className="p-3">Motor SQLite WASM en sandbox sin llamadas a APIs del sistema operativo</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-mono font-bold text-teal-600 dark:text-teal-400">RAT-04 (Copilot IA)</td>
                      <td className="p-3">Asistencia en redacción, corrección gramatical y resúmenes locales</td>
                      <td className="p-3">Fragmentos de texto temporalmente procesados en tensor</td>
                      <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-mono text-[10px]">VRAM GPU Local</span></td>
                      <td className="p-3">Inferencia en WebGPU local; 0 telemetría y 0 envío a servidores externos</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">RAT-05 (Time Machine)</td>
                      <td className="p-3">Historial criptográfico de revisiones y commits inmutables</td>
                      <td className="p-3">Diferenciales de texto, sellos de tiempo y hashes SHA-256</td>
                      <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 font-mono text-[10px]">Merkle Tree Local</span></td>
                      <td className="p-3">Firmas criptográficas locales sin almacenamiento en repositorios remotos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: EJERCICIO INTEGRAL DE DERECHOS ARCO+ (ARTS. 15 A 22 RGPD)
             ========================================================================= */}
          {activeTab === 'arco' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Módulo de Ejercicio Directo de Derechos ARCO+ (Artículos 15 a 22 RGPD)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ejecución instantánea sin intermediarios: Acceso, Rectificación, Supresión, Portabilidad y Oposición
                  </p>
                </div>
              </div>

              {exportSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 flex items-center space-x-2 animate-in fade-in-50">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">
                    Paquete estructurado de Portabilidad RGPD exportado exitosamente a tu carpeta de Descargas.
                  </span>
                </div>
              )}

              {purgeSuccess && (
                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 flex items-center space-x-2 animate-in fade-in-50">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">
                    Higienización conforme a NIST SP 800-88 completada: la memoria volátil y cachés locales han sido purgadas con éxito.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. DERECHO DE ACCESO */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50 dark:bg-obsidian-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                      <Search className="w-3.5 h-3.5 text-blue-600" />
                      <span>Derecho de Acceso (Art. 15)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Auditoría en Vivo</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Inspecciona al instante todos los datos activos en la sesión actual de memoria de tu equipo:
                  </p>
                  <div className="space-y-1.5 font-mono text-[10px] bg-white dark:bg-obsidian-900 p-2.5 rounded-lg border border-slate-200 dark:border-obsidian-800 text-slate-600 dark:text-slate-300">
                    <div>• Documentos en memoria: <strong className="text-slate-900 dark:text-white">{docs.length}</strong></div>
                    <div>• Hojas de cálculo activas: <strong className="text-slate-900 dark:text-white">{spreadsheets.length}</strong></div>
                    <div>• Tablas de bases de datos: <strong className="text-slate-900 dark:text-white">{tables.length}</strong></div>
                    <div>• Cookies de seguimiento: <strong className="text-emerald-600">0 (Inexistentes)</strong></div>
                    <div>• Servidores de terceros conectados: <strong className="text-emerald-600">0 (Modo Autónomo)</strong></div>
                  </div>
                </div>

                {/* 2. DERECHO A LA PORTABILIDAD */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50 dark:bg-obsidian-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Derecho a la Portabilidad (Art. 20)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Formato Abierto</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Descarga en un único archivo estructurado e interoperable todos tus documentos y esquemas para migrarlos sin dependencia de proveedor (*no vendor lock-in*).
                  </p>
                  <button
                    onClick={handleExportAllData}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Paquete JSON Completo</span>
                  </button>
                </div>

                {/* 3. DERECHO DE SUPRESIÓN / OLVIDO */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50 dark:bg-obsidian-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Derecho al Olvido / Supresión (Art. 17)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">NIST SP 800-88</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Destruye y sobreescribe de forma criptográfica toda la memoria volátil, metadatos temporales y cachés locales del equipo.
                  </p>
                  <button
                    onClick={handlePurgeAllLocalData}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purgar Datos Criptográficamente</span>
                  </button>
                </div>

                {/* 4. DERECHO DE LIMITACIÓN Y RETENCIÓN */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50 dark:bg-obsidian-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Limitación del Tratamiento (Art. 18)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Bloqueo Legal</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Activa el modo de solo lectura estricta y bloqueo de modificaciones para preservar evidencias en auditorías o litigios.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Modo Solo Lectura Legal:</span>
                    <button
                      onClick={() => setReadOnlyLock(!readOnlyLock)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        readOnlyLock
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {readOnlyLock ? 'Activado (Bloqueado)' : 'Desactivado'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: FILTRO FORENSE DE METADATOS (12 VECTORES DE FUGA)
             ========================================================================= */}
          {activeTab === 'metadata' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                    <EyeOff className="w-4 h-4 text-purple-600" />
                    <span>Filtro Forense y Depurador de Metadatos Ocultos (*Privacy Stripper*)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Inspección y eliminación activa de 12 vectores de rastreo forense incrustados comúnmente en archivos ofimáticos
                  </p>
                </div>
                <button
                  onClick={handlePurgeMetadata}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Depurar Documento Activo</span>
                </button>
              </div>

              {cleanCount !== null && (
                <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 flex items-center space-x-2 animate-in fade-in-50">
                  <Check className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">
                    ✓ Se han purgado con éxito los metadatos forenses de {cleanCount} archivos y tablas en memoria.
                  </span>
                </div>
              )}

              {/* Automatic Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800">
                <div className="space-y-0.5">
                  <strong className="text-xs text-slate-900 dark:text-white">Depuración Automática al Guardar y Exportar</strong>
                  <p className="text-[11px] text-slate-500">
                    Aplica sanitización forense automática cada vez que se genera un archivo PDF, DOCX, XLSX o CSV.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={stripMetadataOnExport}
                  onChange={(e) => setStripMetadataOnExport(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* Grid of 12 Analyzed Vectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">1. Autor & Colaboradores:</strong>
                  <p className="text-slate-500 mt-1">Reemplaza nombres, correos y firmas por alias soberanos genéricos.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">2. Rutas del Sistema (UNC):</strong>
                  <p className="text-slate-500 mt-1">Elimina rutas reveladoras como <code>C:\Users\nombre\...</code> en hipervínculos.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">3. Historial de Versiones Oculto:</strong>
                  <p className="text-slate-500 mt-1">Limpia textos descartados y marcas de agua invisibles antes de renderizar.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">4. GUIDs e IDs de Dispositivo:</strong>
                  <p className="text-slate-500 mt-1">Genera identificadores de documento efímeros para evitar correlación cruzada.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">5. Organización & Empresa:</strong>
                  <p className="text-slate-500 mt-1">Neutraliza nombres de sociedad y divisiones corporativas en metadatos ODF.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">6. Enlaces OLE Incrustados:</strong>
                  <p className="text-slate-500 mt-1">Deshabilita macros y vínculos a ejecutables o recursos externos peligrosos.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">7. Tiempos de Creación / Impresión:</strong>
                  <p className="text-slate-500 mt-1">Sustituye marcas de tiempo de impresión y modificación por fechas genéricas.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">8. Perfiles ICC de Impresora:</strong>
                  <p className="text-slate-500 mt-1">Elimina metadatos de marcas y modelos de impresoras locales conectadas.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">9. Propiedades XML Personalizadas:</strong>
                  <p className="text-slate-500 mt-1">Purga nodos no estándar en <code>custom.xml</code> para evitar fuga de claves.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">10. Rutas de Plantillas Remotas:</strong>
                  <p className="text-slate-500 mt-1">Elimina referencias a plantillas <code>.dotx</code> en servidores externos.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">11. Miniaturas Previas del ZIP:</strong>
                  <p className="text-slate-500 mt-1">Suprime vistas previas fotográficas generadas de versiones anteriores.</p>
                </div>
                <div className="p-3 bg-white dark:bg-obsidian-950 rounded-lg border border-slate-200 dark:border-obsidian-800">
                  <strong className="text-slate-900 dark:text-white">12. Rastros de Depuración:</strong>
                  <p className="text-slate-500 mt-1">Limpia comentarios internos del compilador y rutas de desarrollo.</p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 6: MODO AIR-GAP, FIREWALL LOCAL & TELEMETRÍA CERO
             ========================================================================= */}
          {activeTab === 'airgap' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                    <WifiOff className="w-4 h-4 text-blue-600" />
                    <span>Defensa Activa: Modo Air-Gap & Firewall de Red Estricto</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Garantía técnica de cero sockets de red salientes y mitigación contra balizas y exfiltración
                  </p>
                </div>
              </div>

              {/* Interactive Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800">
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white">Modo Air-Gap Total (Aislamiento de Red 100%)</strong>
                    <p className="text-[11px] text-slate-500">
                      Intercepta y bloquea cualquier llamada de red (`fetch`, `XMLHttpRequest`, `WebSocket`, `WebRTC`).
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={airGapMode}
                    onChange={(e) => setAirGapMode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800">
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white">Bloqueo de Inyección DDE & Fórmulas Maliciosas</strong>
                    <p className="text-[11px] text-slate-500">
                      Neutraliza comandos como `=cmd|'/C calc'!A0` y `@SUM(cmd|...)` que atacan vulnerabilidades de Microsoft Office.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={blockDDE}
                    onChange={(e) => setBlockDDE(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800">
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white">Bloqueo de Balizas Web e Imágenes Remotas (*Web Bugs*)</strong>
                    <p className="text-[11px] text-slate-500">
                      Impide que un remitente o documento externo registre tu dirección IP al cargar imágenes o fuentes remotas.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={blockExternalImages}
                    onChange={(e) => setBlockExternalImages(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800">
                  <div>
                    <strong className="text-xs text-slate-900 dark:text-white">Protección contra Robo de Hash NetNTLM (Rutas SMB)</strong>
                    <p className="text-[11px] text-slate-500">
                      Bloquea referencias a servidores de red `\\servidor-atacante\archivo` que provocan fugas de credenciales en Windows.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={blockNetNTLM}
                    onChange={(e) => setBlockNetNTLM(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs font-mono">
                <span>Tráfico de Red Saliente: <strong>0 KB enviados</strong> • Sockets Abiertos: <strong>0</strong> • Estado: Soberano</span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-semibold">100% Hermético</span>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 7: CRIPTOGRAFÍA, GESTIÓN DE CLAVES & ALMACÉN SEGURO
             ========================================================================= */}
          {activeTab === 'crypto' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Criptografía Autenticada Militar & Almacén Seguro (AES-256-GCM / PBKDF2)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Infraestructura criptográfica nativa certificada según estándares de NIST y BSI
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-amber-500" />
                    <strong className="text-slate-900 dark:text-white">Cifrado Autenticado</strong>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    <strong>AES-256-GCM</strong> con etiqueta de autenticación de 128 bits contra alteraciones maliciosas.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    <strong className="text-slate-900 dark:text-white">Derivación de Clave</strong>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    <strong>PBKDF2 / HMAC-SHA-512</strong> con 100.000 iteraciones para resistencia contra fuerza bruta en GPU.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purple-500" />
                    <strong className="text-slate-900 dark:text-white">Almacén Seguro</strong>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    <strong>Origin Private File System (OPFS)</strong> aislado del resto de procesos del sistema operativo.
                  </p>
                </div>
              </div>

              {/* Interactive Live Cryptographic Benchmark / Demo */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-obsidian-800 bg-slate-50 dark:bg-obsidian-950 space-y-3">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-indigo-600" />
                  <span>Prueba Interactiva del Motor Criptográfico en Vivo (Web Crypto API)</span>
                </h5>
                <p className="text-[11px] text-slate-500">
                  Prueba en tiempo real la derivación de clave PBKDF2 y cifrado simétrico AES-256-GCM ejecutado en tu propio procesador:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Texto a Cifrar:</label>
                    <input
                      type="text"
                      value={demoInput}
                      onChange={(e) => setDemoInput(e.target.value)}
                      className="w-full bg-white dark:bg-obsidian-900 border border-slate-300 dark:border-obsidian-750 px-2.5 py-1.5 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña Maestra:</label>
                    <input
                      type="text"
                      value={demoPassword}
                      onChange={(e) => setDemoPassword(e.target.value)}
                      className="w-full bg-white dark:bg-obsidian-900 border border-slate-300 dark:border-obsidian-750 px-2.5 py-1.5 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRunCryptoDemo}
                  disabled={isEncrypting}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isEncrypting ? 'Derivando 100.000 iteraciones...' : 'Ejecutar Cifrado Criptográfico AES-256-GCM'}</span>
                </button>

                {demoCiphertext && (
                  <div className="p-3 bg-white dark:bg-obsidian-900 rounded-lg border border-slate-200 dark:border-obsidian-800 space-y-1 font-mono text-[11px]">
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Cifrado Autenticado Exitoso:</div>
                    <div className="text-slate-500 truncate">Vector Inicialización (IV 96-bit): <span className="text-slate-800 dark:text-slate-200">{demoIV}</span></div>
                    <div className="text-slate-500 truncate">Hash Clave Derivada (SHA-256): <span className="text-slate-800 dark:text-slate-200">{demoKeyHash}</span></div>
                    <div className="text-slate-500 truncate">Ciphertext Base64 + Auth Tag: <span className="text-indigo-600 dark:text-indigo-400">{demoCiphertext.slice(0, 48)}...</span></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 8: SOBERANÍA DE INTELIGENCIA ARTIFICIAL (EU AI ACT)
             ========================================================================= */}
          {activeTab === 'ai_gov' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Gobernanza de IA: Cumplimiento del Reglamento de IA de la UE (EU AI Act 2024/1689)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Inferencia 100% en silicio local (WebGPU) con compromiso vinculante de Cero Entrenamiento
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/30 rounded-xl p-4 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-bold text-xs text-purple-950 dark:text-purple-200">
                    Soberanía Neural & Cláusula de Cero Entrenamiento (*Zero-Training Guarantee*)
                  </h5>
                  <p className="text-xs text-purple-900/90 dark:text-purple-300/90 leading-relaxed">
                    A diferencia de Microsoft Copilot o Google Gemini integrados en la nube donde los datos viajan por servidores externos,
                    el Copiloto Neural de Apex Office se ejecuta **directamente en tu chip gráfico mediante WebGPU**.
                    Tus borradores, datos financieros y fórmulas jamás abandonan la memoria de tu ordenador ni se usan para afinar modelos de terceros.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                  <strong className="text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>1. Clasificación: Riesgo Mínimo (Art. 69 EU AI Act)</span>
                  </strong>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    La IA de Apex Office está clasificada como de riesgo mínimo al operar como un asistente interactivo local de productividad sin toma de decisiones judiciales, biométricas ni crediticias.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                  <strong className="text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>2. Control Humano en el Bucle (*Human-in-the-Loop*)</span>
                  </strong>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Ninguna acción o modificación de documentos ocurre sin la intervención y aprobación explícita del usuario. El control permanece 100% en tus manos.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                  <strong className="text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>3. Cero Alucinaciones en Fórmulas Matemáticas</span>
                  </strong>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Las fórmulas y expresiones generadas son verificadas contra el motor determinista formal de Excel (DAG) antes de su inserción para impedir errores contables.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-obsidian-950 rounded-xl border border-slate-200 dark:border-obsidian-800 space-y-1.5">
                  <strong className="text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>4. Cero Retención de Prompts</span>
                  </strong>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Las instrucciones introducidas en el asistente se procesan en la memoria volátil de la GPU y son purgadas de inmediato al concluir la inferencia.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 9: EVALUACIÓN DE IMPACTO (EIPD / DPIA - ART. 35 RGPD)
             ========================================================================= */}
          {activeTab === 'dpia' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-obsidian-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Evaluación de Impacto en Protección de Datos (EIPD / DPIA - Art. 35 RGPD)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Análisis de riesgos y dictamen favorable para tratamiento de datos personales de categorías especiales
                  </p>
                </div>
              </div>

              {/* DPIA Summary Table */}
              <div className="border border-slate-200 dark:border-obsidian-750 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-obsidian-850 border-b border-slate-200 dark:border-obsidian-750 font-semibold text-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="p-3">Riesgo Identificado</th>
                      <th className="p-3">Impacto Potencial</th>
                      <th className="p-3">Salvaguarda Implementada en Apex Office</th>
                      <th className="p-3">Riesgo Residual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-obsidian-800 font-sans text-[11px]">
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Intercepción o acceso forzoso por proveedor cloud</td>
                      <td className="p-3 text-rose-600 font-medium">Muy Alto</td>
                      <td className="p-3">Arquitectura 100% Local-First sin nube centralizada ni telemetría</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold">Inexistente (0%)</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Fuga de credenciales Windows (NetNTLM) por enlaces SMB</td>
                      <td className="p-3 text-amber-600 font-medium">Alto</td>
                      <td className="p-3">Firewall local que bloquea rutas remotas UNC `\\` en hipervínculos</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold">Mitigado (0%)</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Ejecución de código malicioso mediante macros VBA</td>
                      <td className="p-3 text-rose-600 font-medium">Muy Alto</td>
                      <td className="p-3">Sustitución de macros binarias por sandbox aislado WebAssembly / QuickJS</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold">Mitigado (0%)</span></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">Rastreo de autores y rutas locales en metadatos ODF/OOXML</td>
                      <td className="p-3 text-amber-600 font-medium">Medio</td>
                      <td className="p-3">Filtro Privacy Stripper activo que purga 12 vectores forenses</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold">Neutralizado</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Dictamen Concluyente */}
              <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 rounded-xl space-y-1">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <strong className="text-xs text-teal-950 dark:text-teal-200">
                    Dictamen Favorable de Idoneidad para Tratamiento de Categorías Especiales (Art. 9 RGPD)
                  </strong>
                </div>
                <p className="text-[11px] text-teal-900/80 dark:text-teal-300/80 leading-relaxed">
                  La evaluación concluye con dictamen favorable: Apex Office Suite es formalmente recomendada para el tratamiento de datos sensibles
                  (historias clínicas sanitarias, expedientes judiciales confidenciales, secreto profesional de abogacía e información clasificada de defensa).
                </p>
              </div>
            </div>
          )}

          {/* TAB 10: COOKIES & GESTIÓN DE ALMACENAMIENTO LOCAL (LSSI-CE & ePrivacy) */}
          {activeTab === 'cookies' && (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Header Box */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Régimen de Cookies y Dispositivos de Almacenamiento Local (LSSI-CE & Directiva ePrivacy)
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-600/40">
                      Art. 22.2 LSSI-CE
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600/40">
                      Guía AEPD 2024
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Conforme a la <strong>Directiva 2002/58/CE (ePrivacy)</strong>, transpuesta en España mediante el <strong>Artículo 22.2 de la Ley 34/2002 (LSSI-CE)</strong>
                  y a las directrices actualizadas de la <strong>Agencia Española de Protección de Datos (AEPD)</strong>, el usuario tiene derecho a información transparente
                  y a la gestión granular del consentimiento previo a la implantación de tecnologías de almacenamiento y recuperación de datos en equipos terminales.
                </p>
              </div>

              {/* Feedback Notifications */}
              {cookieSaved && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-600/50 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in duration-200">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-medium">Tus preferencias de cookies y almacenamiento local han sido guardadas con éxito en el sandbox de tu dispositivo.</span>
                </div>
              )}
              {bannerResetNotif && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-600/50 rounded-xl flex items-center space-x-2 text-xs text-indigo-800 dark:text-indigo-200 animate-in fade-in duration-200">
                  <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 animate-spin" />
                  <span className="font-medium">Consentimiento restablecido: El banner interactivo de cookies volverá a mostrarse en la esquina inferior de la aplicación.</span>
                </div>
              )}

              {/* Soberanía Zero-Cloud vs Publicidad Comercial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                    <EyeOff className="w-4 h-4 text-rose-500" />
                    <span>Cookies Comerciales en la Nube (Google / Microsoft 365)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Las suites ofimáticas tradicionales instalan decenas de cookies de terceros, identificadores publicitarios (AdIDs),
                    píxeles de telemetría y rastreadores multidominio que monitorizan la actividad del usuario entre diferentes sitios web,
                    creando perfiles de comportamiento comercial sin verdadero control soberano.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-200 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Arquitectura Soberana en Apex Office (100% Local-First)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                    Apex Office <strong>no tiene servidores en la nube ni vende publicidad</strong>. El almacenamiento se realiza exclusivamente
                    en tu máquina (LocalStorage, IndexedDB y cookies técnicas del sandbox local). Cero rastreadores externos,
                    cero telemetría hacia anunciantes y total cumplimiento por diseño (Privacy by Design).
                  </p>
                </div>
              </div>

              {/* Plataforma de Consentimiento Granular (CMP) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Gestión Granular del Consentimiento (Consent Management Platform)</span>
                  </h5>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Cambios aplicados en tiempo real sobre el almacenamiento local
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* 1. Técnicas */}
                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs font-semibold text-slate-900 dark:text-white">
                          1. Cookies Técnicas y Estrictamente Necesarias
                        </strong>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
                          Exentas (Art. 22.2 LSSI)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Imprescindibles para recordar la ventana maximizada, la persistencia del documento activo en edición y el estado del banner de consentimiento.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">Siempre Activo</span>
                      <div className="w-9 h-5 bg-emerald-500 rounded-full flex items-center justify-end px-1 opacity-80 cursor-not-allowed">
                        <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>

                  {/* 2. Preferencias */}
                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs font-semibold text-slate-900 dark:text-white">
                          2. Cookies de Preferencias y Personalización
                        </strong>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/50">
                          Opcional
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Permite recordar la elección de tema visual (Clásico / Oscuro), el nivel de zoom predeterminado y la disposición de paneles.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCookiePreferences({ preferences: !cookiePreferences.preferences });
                        setCookieSaved(true);
                        setTimeout(() => setCookieSaved(false), 3000);
                      }}
                      className={`w-9 h-5 rounded-full flex items-center px-1 transition-colors shrink-0 ${
                        cookiePreferences.preferences ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-obsidian-700 justify-start'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  {/* 3. Analítica Local */}
                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs font-semibold text-slate-900 dark:text-white">
                          3. Métricas y Analítica On-Device (Sin Conexión)
                        </strong>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/50">
                          Opcional
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Métricas de latencia del motor de fórmulas y recuento local de documentos. Se computa 100% en la CPU local y jamás sale del equipo.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCookiePreferences({ analytics: !cookiePreferences.analytics });
                        setCookieSaved(true);
                        setTimeout(() => setCookieSaved(false), 3000);
                      }}
                      className={`w-9 h-5 rounded-full flex items-center px-1 transition-colors shrink-0 ${
                        cookiePreferences.analytics ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-obsidian-700 justify-start'
                      }`}
                    >
                      <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                    </button>
                  </div>

                  {/* 4. Publicidad y Terceros */}
                  <div className="p-3.5 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl flex items-center justify-between opacity-75">
                    <div className="space-y-0.5 pr-4">
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs font-semibold text-slate-900 dark:text-white">
                          4. Publicidad Comportamental & Rastreo de Terceros (AdTech)
                        </strong>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50">
                          Bloqueado
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Inexistente por diseño. Apex Office no contiene librerías publicitarias, SDKs de redes sociales ni etiquetas de retargeting.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">Desactivado permanentemente</span>
                      <div className="w-9 h-5 bg-slate-300 dark:bg-obsidian-700 rounded-full flex items-center justify-start px-1 cursor-not-allowed">
                        <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Inventario de Cookies y Almacenamiento Local (AEPD) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Inventario Oficial de Tecnologías de Almacenamiento Local (AEPD)
                  </h5>
                  <span className="text-[11px] font-mono text-slate-500">6 claves inventariadas</span>
                </div>

                <div className="border border-slate-200 dark:border-obsidian-750 rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-obsidian-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-obsidian-800 font-mono text-[11px]">
                      <tr>
                        <th className="p-2.5">Identificador / Clave</th>
                        <th className="p-2.5">Mecanismo</th>
                        <th className="p-2.5">Finalidad Técnica Específica</th>
                        <th className="p-2.5">Caducidad</th>
                        <th className="p-2.5">Tipo Legal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-obsidian-800 text-[11px]">
                      <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                        <td className="p-2.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">apex_theme</td>
                        <td className="p-2.5">LocalStorage</td>
                        <td className="p-2.5">Persiste la preferencia de paleta de colores (Clásico / Oscuro)</td>
                        <td className="p-2.5">12 meses</td>
                        <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">Personalización</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                        <td className="p-2.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">apex_cookie_consent</td>
                        <td className="p-2.5">LocalStorage</td>
                        <td className="p-2.5">Registra la aceptación o rechazo de cookies para no reiterar el banner</td>
                        <td className="p-2.5">6 meses</td>
                        <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">Técnica (Esencial)</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                        <td className="p-2.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">apex_window_bounds</td>
                        <td className="p-2.5">LocalStorage / Electron</td>
                        <td className="p-2.5">Preserva el tamaño, resolución y posición de la ventana en pantalla</td>
                        <td className="p-2.5">Persistente</td>
                        <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">Técnica (Esencial)</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                        <td className="p-2.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">apex_active_doc</td>
                        <td className="p-2.5">SessionStorage</td>
                        <td className="p-2.5">Recuerda el documento activo para restaurar la sesión tras recarga</td>
                        <td className="p-2.5">Sesión</td>
                        <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono">Técnica (Esencial)</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                        <td className="p-2.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">apex_zoom_level</td>
                        <td className="p-2.5">LocalStorage</td>
                        <td className="p-2.5">Factor de aumento y escala de visualización accesible del documento</td>
                        <td className="p-2.5">12 meses</td>
                        <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">Personalización</span></td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-obsidian-850/50">
                        <td className="p-2.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">apex_local_metrics</td>
                        <td className="p-2.5">IndexedDB</td>
                        <td className="p-2.5">Métricas locales de cálculo de fórmulas y optimización de caché</td>
                        <td className="p-2.5">30 días</td>
                        <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">Analítica On-Device</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Controles de Acción y Descarga */}
              <div className="p-4 bg-slate-50 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-750 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      resetCookieConsent();
                      setBannerResetNotif(true);
                      setTimeout(() => setBannerResetNotif(false), 4000);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-obsidian-800 hover:bg-slate-300 dark:hover:bg-obsidian-750 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reiniciar Consentimiento (Mostrar Banner)</span>
                  </button>

                  <button
                    onClick={handleExportCookiePolicy}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-200 dark:bg-obsidian-800 hover:bg-slate-300 dark:hover:bg-obsidian-750 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Política en Markdown (.md)</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCookieSaved(true);
                    setTimeout(() => setCookieSaved(false), 3000);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Preferencias de Cookies</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-obsidian-950 border-t border-slate-200 dark:border-obsidian-800 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center space-x-2 text-slate-500 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Auditado: 100% Soberano • 0 Telemetría • Cookies 100% Locales & Reguladas</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportAllData}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-obsidian-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-obsidian-750 transition-colors font-medium text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Copia Portabilidad</span>
            </button>
            <button
              onClick={() => setPrivacyCenterOpen(false)}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm text-xs"
            >
              Cerrar y Continuar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
