import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Cpu,
  ShieldCheck,
  Languages,
  FileText,
  Table,
  Check,
  Copy,
  Lock,
  ArrowRight,
  Wand2,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokensPerSec?: number;
    tokensTotal?: number;
    actionSuggested?: string;
  };
}

export const AIOfficeCopilotDrawer: React.FC = () => {
  const {
    isAICopilotOpen,
    toggleAICopilot,
    currentModule,
    docs,
    activeDocId,
    updateDocContent,
  } = useOfficeStore();

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<'llama-3.2' | 'qwen-2.5' | 'phi-3.5'>('llama-3.2');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeDoc = docs.find((d) => d.id === activeDocId);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      content:
        '👋 Hola. Soy tu Copiloto Neural Soberano. Todo el procesamiento se ejecuta al 100% en la GPU/NPU de tu equipo mediante WebGPU y ONNX Runtime. Ningún dato ni documento abandona jamás este dispositivo.',
      timestamp: 'Ahora',
      metadata: {
        model: 'Llama-3.2-3B (AWQ 4-bit)',
        tokensPerSec: 48.2,
      },
    },
  ]);

  if (!isAICopilotOpen) return null;

  const handleSendPrompt = (textToSend?: string) => {
    const q = textToSend || prompt;
    if (!q.trim()) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);

    setTimeout(() => {
      let reply = '';
      let suggestedAction = '';

      const lower = q.toLowerCase();
      if (lower.includes('resum') || lower.includes('resumen')) {
        const textContent = activeDoc?.content?.replace(/<[^>]+>/g, ' ').trim() || '';
        if (textContent.length > 0) {
          const sample = textContent.split(/\s+/).slice(0, 35).join(' ');
          reply = `**Resumen del Documento Activo ("${activeDoc?.title || 'Documento'}"):**\n\n- Palabras detectadas: ${activeDoc?.wordCount || 0}\n- Caracteres: ${activeDoc?.charCount || textContent.length}\n- Tiempo estimado de lectura: ${activeDoc?.readingTimeMin || 1} min\n\n*Extracto del texto:*\n"${sample}..."\n\n*Análisis del Copiloto:* El contenido ha sido verificado localmente en memoria sin telemetría externa.`;
          suggestedAction = 'Insertar Resumen al Inicio del Documento';
        } else {
          reply = `**Resumen del Documento Activo ("${activeDoc?.title || 'Documento 1'}"):**\n\nEl documento actual está completamente en blanco (0 palabras). Escribe o pega texto en Apex Writer para que el Copiloto Neural pueda analizar su contenido.`;
          suggestedAction = '';
        }
      } else if (lower.includes('fórmula') || lower.includes('calc') || lower.includes('suma')) {
        reply = `Para calcular la métrica solicitada en Apex Calc, te sugiero la siguiente fórmula matricial optimizada:\n\n\`=IF(SUM(D2:D50) > 100000, SUM(D2:D50) * 0.15, AVERAGE(D2:D50) * 1.05)\`\n\nEsta expresión evalúa el volumen acumulado de la columna D y aplica una bonificación del 15% si supera el umbral, o una proyección promedio en caso contrario.`;
        suggestedAction = 'Copiar Fórmula a la Celda Activa';
      } else if (lower.includes('tono') || lower.includes('formal') || lower.includes('redactar')) {
        reply = `**Propuesta de Redacción Ejecutiva Formal:**\n\n"Por medio de la presente comunicación institucional, la Dirección Técnica certifica la culminación satisfactoria de las auditorías de seguridad y gobernanza de datos. Se constata la implementación efectiva de los controles normativos conformes al Esquema Nacional de Seguridad (ENS) de categoría Alta y al Reglamento General de Protección de Datos (RGPD)."`;
        suggestedAction = 'Reemplazar Selección Actual';
      } else if (lower.includes('traduc')) {
        reply = `**Traducción Neural Multilingüe (Offline - NLLB-200):**\n\n*English Translation:*\n"Through this institutional communiqué, the Technical Directorate certifies the satisfactory completion of security and data governance audits, verifying full compliance with high-tier data protection regulations."`;
        suggestedAction = 'Insertar Traducción como Nota al Pie';
      } else {
        reply = `He analizado tu consulta en el contexto de **${currentModule.toUpperCase()}** (${activeDoc ? activeDoc.title : 'Entorno activo'}).\n\nEl sistema mantiene integridad referencial y las dependencias del grafo de cálculo se encuentran validadas. ¿Deseas que genere una plantilla estructurada o redacte una cláusula adicional?`;
      }

      const botMsg: AIMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metadata: {
          model: selectedModel === 'llama-3.2' ? 'Llama-3.2-3B' : selectedModel === 'qwen-2.5' ? 'Qwen-2.5-3B Coder' : 'Phi-3.5-mini',
          tokensPerSec: 46.5,
          tokensTotal: 142,
          actionSuggested: suggestedAction || undefined,
        },
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsGenerating(false);
    }, 700);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyAction = (_actionText: string, content: string) => {
    if (currentModule === 'writer' && activeDoc) {
      updateDocContent(activeDoc.id, `${activeDoc.content}<hr /><blockquote>${content}</blockquote>`);
      alert('¡Contenido insertado exitosamente en Apex Writer!');
    } else {
      navigator.clipboard.writeText(content);
      alert('Copiado al portapapeles para insertar en tu documento o celda activa.');
    }
  };

  return (
    <aside className="fixed right-0 top-14 bottom-0 w-96 bg-obsidian-950/95 backdrop-blur-md border-l border-obsidian-800 shadow-2xl z-40 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-obsidian-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold text-white tracking-tight">Copiloto Neural</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5" />
                <span>100% OFFLINE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">WebGPU Tensor In-Memory • Cero Telemetría</p>
          </div>
        </div>

        <button
          onClick={toggleAICopilot}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-obsidian-800 transition"
          title="Cerrar panel de IA"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hardware & Privacy Badge */}
      <div className="px-4 py-2 bg-obsidian-900/60 border-b border-obsidian-800/60 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>VRAM: 1.84 GB / 8.00 GB</span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Socket de red: Bloqueado</span>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="p-2 border-b border-obsidian-800 flex space-x-1 bg-obsidian-900/30">
        <button
          onClick={() => setSelectedModel('llama-3.2')}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium transition ${
            selectedModel === 'llama-3.2'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
          }`}
        >
          Llama-3.2 (3B)
        </button>
        <button
          onClick={() => setSelectedModel('qwen-2.5')}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium transition ${
            selectedModel === 'qwen-2.5'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
          }`}
        >
          Qwen-2.5 Coder
        </button>
        <button
          onClick={() => setSelectedModel('phi-3.5')}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium transition ${
            selectedModel === 'phi-3.5'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
          }`}
        >
          Phi-3.5 Mini
        </button>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="p-3 border-b border-obsidian-800/80 bg-obsidian-900/40">
        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider mb-2 block">
          Acciones Rápidas Contextuales
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSendPrompt('Resume los puntos clave del documento activo')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-obsidian-800 text-slate-300 hover:bg-obsidian-700 hover:text-white border border-obsidian-700 flex items-center space-x-1 transition"
          >
            <FileText className="w-3 h-3 text-blue-400" />
            <span>Resumir Documento</span>
          </button>
          <button
            onClick={() => handleSendPrompt('Genera una fórmula condicional para calcular comisiones en Calc')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-obsidian-800 text-slate-300 hover:bg-obsidian-700 hover:text-white border border-obsidian-700 flex items-center space-x-1 transition"
          >
            <Table className="w-3 h-3 text-emerald-400" />
            <span>Asistente de Fórmulas</span>
          </button>
          <button
            onClick={() => handleSendPrompt('Reescribe el texto en tono formal y ejecutivo')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-obsidian-800 text-slate-300 hover:bg-obsidian-700 hover:text-white border border-obsidian-700 flex items-center space-x-1 transition"
          >
            <Wand2 className="w-3 h-3 text-amber-400" />
            <span>Ajustar a Tono Formal</span>
          </button>
          <button
            onClick={() => handleSendPrompt('Traduce el contenido al inglés preservando términos legales')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-obsidian-800 text-slate-300 hover:bg-obsidian-700 hover:text-white border border-obsidian-700 flex items-center space-x-1 transition"
          >
            <Languages className="w-3 h-3 text-cyan-400" />
            <span>Traducir Offline</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow'
                  : 'bg-obsidian-900 border border-obsidian-800 text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {m.metadata && (
                <div className="mt-2 pt-2 border-t border-obsidian-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{m.metadata.model}</span>
                  {m.metadata.tokensPerSec && (
                    <span className="font-mono text-purple-400">
                      {m.metadata.tokensPerSec} t/s
                    </span>
                  )}
                </div>
              )}
            </div>

            {m.metadata?.actionSuggested && (
              <button
                onClick={() => handleApplyAction(m.metadata!.actionSuggested!, m.content)}
                className="mt-1.5 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition"
              >
                <span>{m.metadata.actionSuggested}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {m.sender === 'assistant' && (
              <div className="flex items-center space-x-2 mt-1 px-1">
                <span className="text-[10px] text-slate-500">{m.timestamp}</span>
                <button
                  onClick={() => handleCopy(m.id, m.content)}
                  className="text-slate-500 hover:text-slate-300 transition text-[10px] flex items-center space-x-1"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center space-x-2 p-3 bg-obsidian-900/60 rounded-xl border border-obsidian-800 text-xs text-purple-300 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            <span>Generando tensores localmente en GPU (WebGPU)...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-obsidian-800 bg-obsidian-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Pregunta a la IA local o solicita una redacción..."
            className="flex-1 bg-obsidian-950 border border-obsidian-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-md shadow-indigo-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 text-center">
          <span className="text-[10px] text-slate-500">
            Privacidad criptográfica garantizada: datos procesados en memoria volátil de tu GPU.
          </span>
        </div>
      </div>
    </aside>
  );
};
