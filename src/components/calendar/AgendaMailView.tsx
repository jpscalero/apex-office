import React, { useState } from 'react';
import {
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  ShieldCheck,
  X,
  Inbox,
  SendHorizontal,
  Reply,
  Forward,
  Archive,
  RefreshCw,
  Search,
  Lock,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { AgendaEvent } from '../../types';

export const AgendaMailView: React.FC = () => {
  const {
    mails,
    events,
    markMailRead,
    sendMail,
    addEvent,
    toggleEventCompleted,
    deleteEvent,
  } = useOfficeStore();

  const [activeView, setActiveView] = useState<'mail' | 'calendar'>('mail');
  const [activeRibbonTab, setActiveRibbonTab] = useState<'inicio' | 'enviar' | 'carpetas' | 'seguridad'>('inicio');
  const [selectedMailId, setSelectedMailId] = useState<string>(mails[0]?.id || '');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Search & Filter
  const [mailSearchTerm, setMailSearchTerm] = useState('');
  const [mailFolder, setMailFolder] = useState<'inbox' | 'sent' | 'drafts' | 'archive'>('inbox');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // New Event state
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('11:00');
  const [newEventDuration, setNewEventDuration] = useState(45);
  const [newEventCategory, setNewEventCategory] = useState<AgendaEvent['category']>('meeting');

  const selectedMail = mails.find((m) => m.id === selectedMailId) || mails[0];

  const filteredMails = mails.filter((m) => {
    if (!mailSearchTerm) return true;
    return (
      m.subject.toLowerCase().includes(mailSearchTerm.toLowerCase()) ||
      m.from.toLowerCase().includes(mailSearchTerm.toLowerCase()) ||
      m.snippet.toLowerCase().includes(mailSearchTerm.toLowerCase())
    );
  });

  const handleSelectMail = (id: string) => {
    setSelectedMailId(id);
    markMailRead(id);
  };

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject) return;
    sendMail(composeTo, composeSubject, composeBody);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setIsComposeOpen(false);
    setStatusNotification('Mensaje enviado y firmado criptográficamente.');
    setTimeout(() => setStatusNotification(null), 3500);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    addEvent({
      title: newEventTitle,
      date: new Date().toISOString().split('T')[0],
      time: newEventTime,
      durationMin: newEventDuration,
      category: newEventCategory,
    });
    setNewEventTitle('');
    setIsNewEventOpen(false);
    setStatusNotification('Evento añadido al cronograma operativo local.');
    setTimeout(() => setStatusNotification(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-900 overflow-hidden select-none">
      {/* ========================================================= */}
      {/* 1. MEGA-RIBBON TAB HEADER (Inicio, Enviar & Recibir, Carpetas, Seguridad) */}
      {/* ========================================================= */}
      <div className="bg-obsidian-950 border-b border-obsidian-800 flex items-center justify-between px-3 h-9 shrink-0">
        <div className="flex items-center space-x-1">
          <span className="flex items-center space-x-1 px-2 py-0.5 mr-2 rounded text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
            <Mail className="w-3.5 h-3.5" />
            <span>AGENDA & MAIL</span>
          </span>

          <button
            onClick={() => setActiveRibbonTab('inicio')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'inicio'
                ? 'bg-obsidian-900 text-indigo-300 border-t-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveRibbonTab('enviar')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'enviar'
                ? 'bg-obsidian-900 text-indigo-300 border-t-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Enviar y Recibir
          </button>
          <button
            onClick={() => setActiveRibbonTab('carpetas')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'carpetas'
                ? 'bg-obsidian-900 text-indigo-300 border-t-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Carpetas & Filtros
          </button>
          <button
            onClick={() => setActiveRibbonTab('seguridad')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'seguridad'
                ? 'bg-obsidian-900 text-indigo-300 border-t-2 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Privacidad & Cifrado
          </button>
        </div>

        {/* View Toggle Pill */}
        <div className="flex items-center space-x-1 bg-obsidian-900 p-0.5 rounded-lg border border-obsidian-800">
          <button
            onClick={() => setActiveView('mail')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
              activeView === 'mail' ? 'bg-indigo-600/30 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Inbox className="w-3 h-3" />
            <span>Correo ({mails.filter((m) => !m.isRead).length})</span>
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
              activeView === 'calendar' ? 'bg-indigo-600/30 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Agenda ({events.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MEGA-RIBBON CONTENT PANEL */}
      {/* ========================================================= */}
      <div className="min-h-[58px] bg-obsidian-900 border-b border-obsidian-800 px-3 py-1 flex items-center space-x-4 overflow-x-auto shrink-0 shadow-inner text-xs">
        {/* TAB 1: INICIO */}
        {activeRibbonTab === 'inicio' && (
          <>
            {/* New items */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsComposeOpen(true)}
                  className="flex items-center space-x-1 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                  <span>Nuevo Correo</span>
                </button>
                <button
                  onClick={() => setIsNewEventOpen(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-indigo-300 border border-obsidian-750"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Cita</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Crear Mensaje</span>
            </div>

            {/* Response options */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => {
                    if (selectedMail) {
                      setComposeTo(selectedMail.from);
                      setComposeSubject(`Re: ${selectedMail.subject}`);
                      setComposeBody(`\n\n--- Mensaje original ---\n${selectedMail.body}`);
                      setIsComposeOpen(true);
                    }
                  }}
                  className="p-1.5 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Responder al remitente"
                >
                  <Reply className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (selectedMail) {
                      setComposeTo('');
                      setComposeSubject(`Fwd: ${selectedMail.subject}`);
                      setComposeBody(`\n\n--- Mensaje reenviado ---\n${selectedMail.body}`);
                      setIsComposeOpen(true);
                    }
                  }}
                  className="p-1.5 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Reenviar mensaje"
                >
                  <Forward className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setStatusNotification('Mensaje archivado en almacén seguro.');
                    setTimeout(() => setStatusNotification(null), 3000);
                  }}
                  className="p-1.5 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Archivar mensaje"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Responder & Archivar</span>
            </div>

            {/* Event categories */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setActiveView('calendar');
                    setNewEventCategory('meeting');
                    setIsNewEventOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]"
                >
                  + Reunión
                </button>
                <button
                  onClick={() => {
                    setActiveView('calendar');
                    setNewEventCategory('deadline');
                    setIsNewEventOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px]"
                >
                  + Hito / Deadline
                </button>
                <button
                  onClick={() => {
                    setActiveView('calendar');
                    setNewEventCategory('ops');
                    setIsNewEventOpen(true);
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]"
                >
                  + Operaciones
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Categorías de Eventos</span>
            </div>
          </>
        )}

        {/* TAB 2: ENVIAR & RECIBIR */}
        {activeRibbonTab === 'enviar' && (
          <>
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setStatusNotification('Sincronización P2P local completada: 0 mensajes nuevos.');
                    setTimeout(() => setStatusNotification(null), 3000);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-emerald-300 border border-obsidian-750"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enviar y Recibir Todo (F9)</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Sincronización</span>
            </div>

            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Buzón Cifrado Local Soberano</span>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Estado de Conexión</span>
            </div>
          </>
        )}

        {/* TAB 3: CARPETAS */}
        {activeRibbonTab === 'carpetas' && (
          <>
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1">
                {(['inbox', 'sent', 'drafts', 'archive'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setMailFolder(f);
                      setActiveView('mail');
                    }}
                    className={`px-2.5 py-1 rounded capitalize transition-colors ${
                      mailFolder === f
                        ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'bg-obsidian-950 text-slate-400 hover:text-white border border-obsidian-750'
                    }`}
                  >
                    {f === 'inbox' ? 'Bandeja de Entrada' : f === 'sent' ? 'Enviados' : f === 'drafts' ? 'Borradores' : 'Archivados'}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Carpetas de Mensajes</span>
            </div>

            {/* Quick search input */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2 top-1.5 text-slate-400" />
                <input
                  type="text"
                  value={mailSearchTerm}
                  onChange={(e) => setMailSearchTerm(e.target.value)}
                  placeholder="Buscar remitente o asunto..."
                  className="bg-obsidian-950 text-white text-xs pl-7 pr-2 py-1 rounded border border-obsidian-750 focus:outline-none focus:border-indigo-500/50 w-44"
                />
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Búsqueda Rápida</span>
            </div>
          </>
        )}

        {/* TAB 4: SEGURIDAD */}
        {activeRibbonTab === 'seguridad' && (
          <>
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1 text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tracking Pixels Bloqueados (100%)</span>
                </span>
                <span className="flex items-center space-x-1 text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Firma PGP Local</span>
                </span>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Protección Activa de Privacidad</span>
            </div>
          </>
        )}
      </div>

      {/* Status Notification Banner */}
      {statusNotification && (
        <div className="bg-indigo-950/80 border-b border-indigo-800/80 px-4 py-1.5 flex items-center space-x-2 text-xs text-indigo-300 font-mono animate-fadeIn shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MAIN VIEW (Mail Split / Calendar Schedule) */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-hidden flex">
        {activeView === 'mail' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Mail Master List */}
            <div className="w-80 md:w-96 border-r border-obsidian-800 bg-obsidian-950 overflow-y-auto divide-y divide-obsidian-850">
              {filteredMails.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  No hay mensajes que coincidan con la búsqueda.
                </div>
              ) : (
                filteredMails.map((mail) => {
                  const isSelected = mail.id === selectedMailId;
                  return (
                    <div
                      key={mail.id}
                      onClick={() => handleSelectMail(mail.id)}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-obsidian-800/90 border-l-2 border-indigo-500'
                          : !mail.isRead
                          ? 'bg-obsidian-900/40 hover:bg-obsidian-850'
                          : 'hover:bg-obsidian-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs truncate ${!mail.isRead ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                          {mail.from}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{mail.date}</span>
                      </div>
                      <p className={`text-xs truncate ${!mail.isRead ? 'font-semibold text-slate-200' : 'text-slate-400'}`}>
                        {mail.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{mail.snippet}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mail Detail Pane */}
            <div className="flex-1 overflow-y-auto bg-obsidian-900 p-6 flex flex-col justify-between">
              {selectedMail ? (
                <div>
                  {/* Subject and Security Pill */}
                  <div className="flex items-center justify-between border-b border-obsidian-800 pb-4 mb-4">
                    <h3 className="text-base font-bold text-white">{selectedMail.subject}</h3>
                    <span className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Tracking Pixels Bloqueados</span>
                    </span>
                  </div>

                  {/* Sender Info */}
                  <div className="flex items-center space-x-3 mb-6 bg-obsidian-950 p-3 rounded-xl border border-obsidian-800">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-apex-blue flex items-center justify-center text-white font-bold text-xs">
                      {selectedMail.from.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{selectedMail.from}</p>
                      <p className="text-[11px] text-slate-400">Para: {selectedMail.to}</p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{selectedMail.date}</span>
                  </div>

                  {/* Mail Body (Clean formatted) */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-300">
                    {selectedMail.body}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  Selecciona un correo para leer
                </div>
              )}

              {/* Bottom Safety Info */}
              <div className="pt-6 border-t border-obsidian-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Cifrado Local: AES-256</span>
                <span>Zero UNC Leaks (Cero filtración de credenciales NTLM)</span>
              </div>
            </div>
          </div>
        ) : (
          /* Calendar & Schedule View */
          <div className="flex-1 overflow-y-auto p-6 bg-obsidian-950 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Cronograma Operativo & Hitos Corporativos</span>
              </h3>
              <button
                onClick={() => setIsNewEventOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Evento</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ev.completed
                      ? 'bg-obsidian-900/40 border-obsidian-850 opacity-60'
                      : 'bg-obsidian-900 border-obsidian-750 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleEventCompleted(ev.id)}
                        className={`p-1 rounded-md transition-colors ${
                          ev.completed ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <h4 className={`text-xs font-bold ${ev.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {ev.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="text-slate-400 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>{ev.time} ({ev.durationMin}m)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 capitalize border border-indigo-500/20 text-[10px]">
                      {ev.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compose Mail Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-obsidian-900 border border-obsidian-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <SendHorizontal className="w-4 h-4 text-indigo-400" />
                <span>Nuevo Mensaje Corporativo</span>
              </h3>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Destinatario:</label>
                <input
                  type="email"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="ejemplo@empresa.org"
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Asunto:</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Asunto del comunicado..."
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Cuerpo del Mensaje:</label>
                <textarea
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Escribe el contenido del mensaje..."
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white p-3 rounded-lg focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-obsidian-800"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20"
                >
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {isNewEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Añadir Hito o Evento al Calendario</span>
              </h3>
              <button onClick={() => setIsNewEventOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Título del Evento:</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="ej. Revisión de Arquitectura de Seguridad..."
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Hora (HH:mm):</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Duración (minutos):</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={newEventDuration}
                    onChange={(e) => setNewEventDuration(Number(e.target.value))}
                    className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Categoría:</label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value as any)}
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="meeting">Reunión Estratégica</option>
                  <option value="review">Revisión de Código / Auditoría</option>
                  <option value="deadline">Hito de Entrega / Plazo</option>
                  <option value="ops">Operaciones & Mantenimiento</option>
                  <option value="personal">Personal / Formación</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewEventOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-obsidian-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20"
                >
                  Crear Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
