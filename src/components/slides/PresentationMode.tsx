import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';

export const PresentationMode: React.FC = () => {
  const {
    decks,
    activeDeckId,
    activeSlideIndex,
    setActiveSlideIndex,
    isPresentationMode,
    setPresentationMode,
  } = useOfficeStore();

  const [elapsedSec, setElapsedSec] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const currentDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const slides = currentDeck ? currentDeck.slides : [];
  const currentSlide = slides[activeSlideIndex] || slides[0];

  // Timer
  useEffect(() => {
    if (!isPresentationMode) {
      setElapsedSec(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPresentationMode]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPresentationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        if (activeSlideIndex < slides.length - 1) {
          setActiveSlideIndex(activeSlideIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (activeSlideIndex > 0) {
          setActiveSlideIndex(activeSlideIndex - 1);
        }
      } else if (e.key === 'Escape') {
        setPresentationMode(false);
      } else if (e.key.toLowerCase() === 'n') {
        setShowNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode, activeSlideIndex, slides.length, setActiveSlideIndex, setPresentationMode]);

  if (!isPresentationMode) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Top Floating Overlay Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity z-20">
        <div className="flex items-center space-x-4 bg-obsidian-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-obsidian-800 text-xs text-slate-300 font-mono">
          <span className="flex items-center space-x-1.5 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(elapsedSec)}</span>
          </span>
          <span>•</span>
          <span>
            {activeSlideIndex + 1} / {slides.length}
          </span>
          <span>•</span>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center space-x-1 ${showNotes ? 'text-amber-300' : 'hover:text-white'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notas (N)</span>
          </button>
        </div>

        <button
          onClick={() => setPresentationMode(false)}
          className="p-2 rounded-full bg-obsidian-900/80 hover:bg-rose-600 text-white border border-obsidian-800 transition-colors"
          title="Salir de la presentación (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Slide Fullscreen Viewport */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="w-full max-w-6xl aspect-video rounded-xl shadow-2xl relative overflow-hidden transition-all duration-300"
          style={{ background: currentSlide?.background || '#0c0e12' }}
        >
          {/* Elements */}
          {currentSlide?.elements.map((el) => (
            <div
              key={el.id}
              className="absolute pointer-events-none"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
              }}
            >
              {el.type === 'title' && (
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                  {el.content}
                </h1>
              )}
              {el.type === 'text' && (
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed drop-shadow">
                  {el.content}
                </p>
              )}
              {el.type === 'stat' && (
                <div className="bg-obsidian-850/90 border border-obsidian-700/80 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
                  <p className="text-5xl font-extrabold text-amber-300 font-mono">{el.content}</p>
                  {el.subtitle && <p className="text-sm text-slate-300 mt-2 font-medium">{el.subtitle}</p>}
                </div>
              )}
              {el.type === 'code' && (
                <pre className="bg-obsidian-950/95 border border-obsidian-750 p-5 rounded-xl text-sm font-mono text-emerald-400 shadow-2xl">
                  <code>{el.content}</code>
                </pre>
              )}
              {el.type === 'badge' && (
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-mono font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{el.content}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Presenter Notes Overlay (if toggled) */}
      {showNotes && currentSlide?.notes && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-2xl w-full bg-obsidian-950/90 border border-amber-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md text-amber-200 text-sm font-sans z-30">
          <p className="text-xs uppercase font-mono font-bold text-amber-400 mb-1">Notas de Orador:</p>
          <p>{currentSlide.notes}</p>
        </div>
      )}

      {/* Floating Bottom Nav HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-obsidian-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-obsidian-800 opacity-20 hover:opacity-100 transition-opacity z-20">
        <button
          onClick={() => activeSlideIndex > 0 && setActiveSlideIndex(activeSlideIndex - 1)}
          disabled={activeSlideIndex === 0}
          className="p-1.5 rounded-full hover:bg-obsidian-800 text-white disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-mono text-slate-300">
          {activeSlideIndex + 1} de {slides.length}
        </span>
        <button
          onClick={() => activeSlideIndex < slides.length - 1 && setActiveSlideIndex(activeSlideIndex + 1)}
          disabled={activeSlideIndex === slides.length - 1}
          className="p-1.5 rounded-full hover:bg-obsidian-800 text-white disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Progress Line */}
      <div className="h-1 bg-obsidian-800 w-full z-20">
        <div
          className="h-full bg-amber-400 transition-all duration-300"
          style={{ width: `${((activeSlideIndex + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
