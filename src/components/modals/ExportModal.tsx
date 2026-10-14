import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { SecuritySanitizer } from '../../core/securitySanitizer';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    setExportModalOpen,
    currentModule,
    docs,
    activeDocId,
    spreadsheets,
    activeSpreadsheetId,
  } = useOfficeStore();

  const [stripMetadata, setStripMetadata] = useState(true);
  const [format, setFormat] = useState<'markdown' | 'html' | 'csv' | 'json' | 'pdf'>('markdown');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isExportModalOpen) return null;

  const activeDoc = docs.find((d) => d.id === activeDocId) || docs[0];
  const activeBook = spreadsheets.find((s) => s.id === activeSpreadsheetId) || spreadsheets[0];

  const handleExport = async () => {
    let filename = 'documento';
    let mimeType = 'text/plain';
    let content = '';

    if (currentModule === 'writer') {
      filename = activeDoc ? activeDoc.title.replace(/\s+/g, '_') : 'documento';
      if (format === 'markdown') {
        filename += '.md';
        mimeType = 'text/markdown';
        // Convert basic HTML to markdown
        content = `# ${activeDoc?.title || 'Documento'}\n\n${(activeDoc?.content || '')
          .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
          .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
          .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<code>(.*?)<\/code>/gi, '`$1`')
          .replace(/<[^>]+>/g, '')}`;
      } else if (format === 'html') {
        filename += '.html';
        mimeType = 'text/html';
        content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeDoc?.title}</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;line-height:1.6;}</style></head><body>${activeDoc?.content}</body></html>`;
      } else if (format === 'pdf') {
        window.print();
        setExportModalOpen(false);
        return;
      } else {
        filename += '.json';
        mimeType = 'application/json';
        content = JSON.stringify(activeDoc, null, 2);
      }
    } else if (currentModule === 'calc') {
      filename = activeBook ? activeBook.title.replace(/\s+/g, '_') : 'calculo';
      if (format === 'csv') {
        filename += '.csv';
        mimeType = 'text/csv';
        const sheet = activeBook?.sheets[0];
        const rows: string[] = [];
        for (let r = 1; r <= 30; r++) {
          const rowVals: string[] = [];
          for (const col of ['A', 'B', 'C', 'D', 'E']) {
            const cell = sheet?.cells[`${col}${r}`];
            const rawVal = cell ? String(cell.computed) : '';
            // Strip DDE / CSV injection
            rowVals.push(SecuritySanitizer.sanitizeCsvExportCell(rawVal));
          }
          if (rowVals.some((v) => v !== '""')) {
            rows.push(rowVals.join(','));
          }
        }
        content = rows.join('\n');
      } else {
        filename += '.json';
        mimeType = 'application/json';
        content = JSON.stringify(activeBook, null, 2);
      }
    } else {
      filename = `apex_${currentModule}_export.json`;
      mimeType = 'application/json';
      content = JSON.stringify({ module: currentModule, exportedAt: new Date().toISOString() }, null, 2);
    }

    if (stripMetadata) {
      content = SecuritySanitizer.stripDocumentMetadata(content).cleanedContent;
    }

    // Check if running inside Native Windows App (Electron)
    if (window.apexNative) {
      const ext = filename.split('.').pop() || 'txt';
      const result = await window.apexNative.saveFile({
        defaultName: filename,
        content,
        filters: [
          { name: `Archivo .${ext}`, extensions: [ext] },
          { name: 'Todos los archivos', extensions: ['*'] },
        ],
      });
      if (result.canceled) return;
    } else {
      // Browser download fallback
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      setExportModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700 rounded-xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
          <div className="flex items-center space-x-2">
            <Download className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Exportación Segura de Documentos</h3>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Formato de Salida
          </label>
          <div className="grid grid-cols-2 gap-2">
            {currentModule === 'writer' ? (
              <>
                <button
                  onClick={() => setFormat('markdown')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === 'markdown'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">Markdown (.md)</p>
                  <p className="text-[10px] text-slate-400">Texto estructurado universal</p>
                </button>
                <button
                  onClick={() => setFormat('html')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === 'html'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">HTML Limpio (.html)</p>
                  <p className="text-[10px] text-slate-400">Sin trackers ni scripts</p>
                </button>
                <button
                  onClick={() => setFormat('pdf')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === 'pdf'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">PDF Imprimible</p>
                  <p className="text-[10px] text-slate-400">Formato A4 vectorial</p>
                </button>
                <button
                  onClick={() => setFormat('json')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === 'json'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">JSON Nativo</p>
                  <p className="text-[10px] text-slate-400">Copia de respaldo íntegra</p>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setFormat('csv')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === 'csv'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white'
                      : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">CSV Seguro (.csv)</p>
                  <p className="text-[10px] text-slate-400">Inyección DDE neutralizada</p>
                </button>
                <button
                  onClick={() => setFormat('json')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    format === 'json'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white'
                      : 'bg-obsidian-950 border-obsidian-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold">JSON Datos</p>
                  <p className="text-[10px] text-slate-400">Estructura pura sin pérdida</p>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Zero-Trust Sanitization Option */}
        <div className="bg-obsidian-950 border border-obsidian-800 p-3 rounded-lg space-y-2">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={stripMetadata}
              onChange={(e) => setStripMetadata(e.target.checked)}
              className="rounded bg-obsidian-900 border-obsidian-700 text-indigo-500 focus:ring-0"
            />
            <span className="text-xs text-slate-200 font-medium">
              Eliminar metadatos ocultos y rastros del sistema
            </span>
          </label>
          <p className="text-[11px] text-slate-400 pl-6">
            Purga identificadores de máquina (RSID), rutas locales C:\ y telemetría de revisiones.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExport}
          className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>¡Archivo Descargado Exitosamente!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Descargar Archivo Sanitizado</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
