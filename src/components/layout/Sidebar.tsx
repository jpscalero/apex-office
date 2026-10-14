import React from 'react';
import {
  Plus,
  Trash2,
  FileText,
  Sheet,
  Presentation,
  Database,
  Calendar,
  Mail,
  HardDrive,
  Shield,
  Star,
  FolderKanban,
  FileCheck,
  Lock,
  Clock,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { formatRelativeTime } from '../../core/timeFormat';

export const Sidebar: React.FC = () => {
  const {
    currentModule,
    zenMode,
    docs,
    activeDocId,
    setActiveDoc,
    createDoc,
    deleteDoc,
    spreadsheets,
    activeSpreadsheetId,
    setActiveSpreadsheet,
    createSpreadsheet,
    decks,
    activeDeckId,
    activeSlideIndex,
    setActiveSlideIndex,
    addSlide,
    deleteSlide,
    tables,
    activeTableId,
    setActiveTable,
    events,
    mails,
  } = useOfficeStore();

  if (zenMode) return null;

  return (
    <aside className="w-64 bg-obsidian-950 border-r border-obsidian-700/70 flex flex-col h-full select-none shrink-0 transition-all">
      {/* Module-Specific Header & Action */}
      <div className="p-3 border-b border-obsidian-800 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          {currentModule === 'writer' && (
            <>
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Documentos</span>
            </>
          )}
          {currentModule === 'calc' && (
            <>
              <Sheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Libros de Cálculo</span>
            </>
          )}
          {currentModule === 'slides' && (
            <>
              <Presentation className="w-3.5 h-3.5 text-amber-400" />
              <span>Diapositivas</span>
            </>
          )}
          {currentModule === 'vault' && (
            <>
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tablas de Datos</span>
            </>
          )}
          {currentModule === 'agenda' && (
            <>
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Agenda & Correo</span>
            </>
          )}
          {currentModule === 'project' && (
            <>
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>Proyectos & CPM</span>
            </>
          )}
          {currentModule === 'pdf' && (
            <>
              <FileCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>PDF Forense</span>
            </>
          )}
        </span>

        {/* Action Button */}
        {currentModule === 'writer' && (
          <button
            onClick={() => createDoc()}
            className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs flex items-center space-x-1 transition-all"
            title="Crear nuevo documento"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium pr-1">Nuevo</span>
          </button>
        )}
        {currentModule === 'calc' && (
          <button
            onClick={() => createSpreadsheet()}
            className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-1 transition-all"
            title="Crear nueva hoja de cálculo"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium pr-1">Nueva</span>
          </button>
        )}
        {currentModule === 'slides' && (
          <button
            onClick={() => addSlide()}
            className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs flex items-center space-x-1 transition-all"
            title="Añadir diapositiva"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium pr-1">Añadir</span>
          </button>
        )}
      </div>

      {/* Module-Specific Item List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* WRITER LIST */}
        {currentModule === 'writer' &&
          docs.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-obsidian-800 text-white border border-blue-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-obsidian-900 hover:text-slate-100'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    {doc.isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                    <p className="text-xs font-medium truncate">{doc.title}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                    <span>{doc.wordCount} palabras</span>
                    <span>•</span>
                    <span>{formatRelativeTime(doc.lastModified)}</span>
                  </div>
                </div>
                {docs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDoc(doc.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                    title="Eliminar documento"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

        {/* CALC SPREADSHEETS */}
        {currentModule === 'calc' &&
          spreadsheets.map((sheet) => {
            const isActive = sheet.id === activeSpreadsheetId;
            return (
              <div
                key={sheet.id}
                onClick={() => setActiveSpreadsheet(sheet.id)}
                className={`p-2 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? 'bg-obsidian-800 text-white border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-obsidian-900 hover:text-slate-100'
                }`}
              >
                <p className="text-xs font-medium truncate">{sheet.title}</p>
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 font-mono">
                  <span>{sheet.sheets.length} hoja(s)</span>
                  <span>•</span>
                  <span>{formatRelativeTime(sheet.lastModified)}</span>
                </div>
              </div>
            );
          })}

        {/* SLIDES THUMBNAILS */}
        {currentModule === 'slides' && (
          <div className="space-y-2">
            {decks
              .find((d) => d.id === activeDeckId)
              ?.slides.map((slide, idx) => {
                const isActive = idx === activeSlideIndex;
                const titleEl = slide.elements.find((e) => e.type === 'title');
                return (
                  <div
                    key={slide.id}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`p-2 rounded-lg cursor-pointer border transition-all ${
                      isActive
                        ? 'bg-obsidian-800 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-obsidian-900/60 border-obsidian-800 hover:border-obsidian-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Diapositiva #{idx + 1}
                      </span>
                      {decks.find((d) => d.id === activeDeckId)!.slides.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSlide(idx);
                          }}
                          className="text-slate-400 hover:text-rose-400 p-0.5"
                          title="Eliminar diapositiva"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {/* Mini Slide Preview Canvas */}
                    <div className="aspect-video bg-obsidian-950 rounded border border-obsidian-800 p-1.5 flex flex-col justify-center overflow-hidden">
                      <p className="text-[10px] font-bold text-amber-200/90 truncate">
                        {titleEl ? titleEl.content : 'Sin título'}
                      </p>
                      <p className="text-[8px] text-slate-400 truncate">
                        {slide.elements.length} objetos en lienzo
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* VAULT TABLES */}
        {currentModule === 'vault' &&
          (tables.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500 border border-dashed border-obsidian-800 rounded-lg">
              <Database className="w-4 h-4 mx-auto mb-1 text-slate-600" />
              <p>Sin tablas creadas</p>
            </div>
          ) : (
            tables.map((tbl) => {
              const isActive = tbl.id === activeTableId;
              return (
                <div
                  key={tbl.id}
                  onClick={() => setActiveTable(tbl.id)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-obsidian-800 text-white border border-cyan-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-obsidian-900 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <p className="text-xs font-semibold truncate">{tbl.name}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{tbl.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                    <span>{tbl.fields.length} columnas</span>
                    <span>{tbl.records.length} registros</span>
                  </div>
                </div>
              );
            })
          ))}

        {/* AGENDA & MAIL LIST */}
        {currentModule === 'agenda' && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
                Bandejas
              </p>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between p-1.5 rounded-md text-xs font-medium bg-obsidian-800 text-white">
                  <span className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Bandeja de Entrada</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">
                    {mails.filter((m) => !m.isRead).length}
                  </span>
                </div>
                <div className="flex items-center space-x-2 p-1.5 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-obsidian-900">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Próximas Reuniones ({events.length})</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
                Eventos de Hoy
              </p>
              <div className="space-y-1">
                {events.length === 0 ? (
                  <p className="text-[11px] text-slate-500 px-1 py-1 italic">Sin eventos programados</p>
                ) : (
                  events.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="p-2 rounded bg-obsidian-900/70 border border-obsidian-800 text-xs">
                      <p className="font-medium text-slate-200 truncate">{ev.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{ev.time} ({ev.durationMin}m)</span>
                        <span className="capitalize text-indigo-400">{ev.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROJECT MANAGEMENT LIST */}
        {currentModule === 'project' && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
                Línea Base del Proyecto
              </p>
              <div className="space-y-1">
                <div className="p-2 rounded-lg bg-obsidian-800 border border-indigo-500/30 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Cronograma Principal</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      WBS Activo
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                    <span>CPM Automático</span>
                    <span className="text-emerald-400 font-bold">Ruta Crítica OK</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
                Vistas de Cronograma
              </p>
              <div className="space-y-0.5 text-xs text-slate-300">
                <div className="p-1.5 rounded-md bg-obsidian-850 text-indigo-300 font-medium flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Diagrama de Gantt</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Gantt SVG</span>
                </div>
                <div className="p-1.5 rounded-md hover:bg-obsidian-900 text-slate-400 hover:text-white flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Holguras & Float</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF WORKSTATION LIST */}
        {currentModule === 'pdf' && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
                Documento Forense Activo
              </p>
              <div className="p-2.5 rounded-lg bg-obsidian-800 border border-rose-500/30 text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <p className="font-semibold text-white truncate">Documento_1.pdf</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>1 Página</span>
                  <span className="text-emerald-400 font-bold">ISO 32000-2</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
                Capas de Seguridad
              </p>
              <div className="space-y-0.5 text-xs text-slate-300 font-mono text-[11px]">
                <div className="p-1.5 rounded-md bg-obsidian-900 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Lock className="w-3 h-3 text-rose-400" />
                    <span className="text-slate-300">Sanitized Redaction</span>
                  </span>
                  <span className="text-rose-400 text-[10px]">3 Zonas</span>
                </div>
                <div className="p-1.5 rounded-md bg-obsidian-900 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    <span className="text-slate-300">Metadatos Ocultos</span>
                  </span>
                  <span className="text-emerald-400 text-[10px]">0 Fugas</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Zero-Cloud & Security Status */}
      <div className="p-3 border-t border-obsidian-800/80 bg-obsidian-950/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Almacén Soberano</span>
          </span>
          <span className="font-mono text-emerald-400">Local (100%)</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Sandbox WASM</span>
          </span>
          <span className="font-mono text-blue-400">Aislado</span>
        </div>
      </div>
    </aside>
  );
};
