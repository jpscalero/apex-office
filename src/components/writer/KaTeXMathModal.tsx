import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import {
  X,
  Sigma,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Code
} from 'lucide-react';

export interface KaTeXMathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula: (renderedHtml: string, rawLatex: string, isBlock?: boolean) => void;
  initialLatex?: string;
}

interface SymbolItem {
  label: string;
  latex: string;
  tooltip: string;
  preview?: string;
}

interface PresetFormula {
  name: string;
  category: string;
  latex: string;
  description: string;
}

export const KaTeXMathModal: React.FC<KaTeXMathModalProps> = ({
  isOpen,
  onClose,
  onInsertFormula,
  initialLatex = '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)',
}) => {
  const [latexInput, setLatexInput] = useState<string>(initialLatex);
  const [isBlockMode, setIsBlockMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'calculus' | 'algebra' | 'greek' | 'operators' | 'presets'>('templates');
  const [renderedPreview, setRenderedPreview] = useState<string>('');
  const [hasSyntaxError, setHasSyntaxError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial latex if modal re-opens
  useEffect(() => {
    if (isOpen) {
      if (initialLatex && !latexInput) {
        setLatexInput(initialLatex);
      }
    }
  }, [isOpen, initialLatex]);

  // Real-time KaTeX rendering
  useEffect(() => {
    if (!latexInput.trim()) {
      setRenderedPreview('');
      setHasSyntaxError(false);
      setErrorMessage('');
      return;
    }

    try {
      // Use katex.renderToString with displayMode and throwOnError: false
      const html = katex.renderToString(latexInput, {
        throwOnError: false,
        displayMode: isBlockMode,
      });

      // Detect if KaTeX rendered an error span
      if (html.includes('class="katex-error"')) {
        setHasSyntaxError(true);
        // Extract title or error text from html if present
        const match = html.match(/title="([^"]+)"/);
        setErrorMessage(match ? match[1] : 'Error de sintaxis LaTeX');
      } else {
        setHasSyntaxError(false);
        setErrorMessage('');
      }

      setRenderedPreview(html);
    } catch (err: unknown) {
      setHasSyntaxError(true);
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar LaTeX');
    }
  }, [latexInput, isBlockMode]);

  // Keyboard shortcut: Escape to close, Ctrl+Enter to insert
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleInsert();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, latexInput, isBlockMode]);

  // Insert latex snippet at current cursor position in textarea
  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setLatexInput((prev) => prev + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = latexInput;

    const newText = currentText.substring(0, start) + snippet + currentText.substring(end);
    setLatexInput(newText);

    // Reposition cursor right after snippet or inside brackets
    setTimeout(() => {
      textarea.focus();
      const cursorOffset = snippet.includes('{') ? snippet.indexOf('{') + 1 : snippet.length;
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 10);
  };

  const handleCopyLatex = async () => {
    try {
      await navigator.clipboard.writeText(latexInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClear = () => {
    setLatexInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInsert = () => {
    if (!latexInput.trim()) return;

    // Render full HTML for the document
    const rawLatex = latexInput.trim();
    const renderedKaTeX = katex.renderToString(rawLatex, {
      throwOnError: false,
      displayMode: isBlockMode,
    });

    let documentWrapperHtml = '';

    if (isBlockMode) {
      documentWrapperHtml = `
        <div class="katex-formula-block my-4 p-4 rounded-xl bg-obsidian-950/70 border border-obsidian-750 text-center select-all cursor-pointer transition-all hover:border-indigo-500/50 shadow-sm" data-latex="${encodeURIComponent(
          rawLatex
        )}" data-mode="block" contenteditable="false">
          <div class="text-xs text-indigo-400 font-mono mb-1 flex items-center justify-center space-x-1 opacity-70">
            <span>∑ FÓRMULA MATEMÁTICA</span>
          </div>
          <div class="overflow-x-auto py-1 text-slate-100 flex justify-center">
            ${renderedKaTeX}
          </div>
        </div>
        <p></p>
      `.trim();
    } else {
      documentWrapperHtml = `
        <span class="katex-formula-inline mx-1 px-1.5 py-0.5 rounded-md bg-obsidian-900/60 border border-obsidian-750 text-slate-100 align-middle inline-block select-all cursor-pointer hover:border-indigo-400" data-latex="${encodeURIComponent(
          rawLatex
        )}" data-mode="inline" contenteditable="false">
          ${renderedKaTeX}
        </span>
      `.trim();
    }

    onInsertFormula(documentWrapperHtml, rawLatex, isBlockMode);
    onClose();
  };

  if (!isOpen) return null;

  // Catalog of single-click symbols and templates
  const templateSymbols: SymbolItem[] = [
    { label: 'a/b', latex: '\\frac{a}{b}', tooltip: 'Fracción ordinaria' },
    { label: '√x', latex: '\\sqrt{x^2 + y^2}', tooltip: 'Raíz cuadrada' },
    { label: 'ⁿ√x', latex: '\\sqrt[n]{x}', tooltip: 'Raíz n-ésima' },
    { label: 'xⁿ', latex: 'x^{n}', tooltip: 'Superíndice / Exponente' },
    { label: 'xᵢ', latex: 'x_{i}', tooltip: 'Subíndice' },
    { label: 'xᵢⁿ', latex: 'x_{i}^{n}', tooltip: 'Subíndice y superíndice' },
    { label: '(ⁿₖ)', latex: '\\binom{n}{k}', tooltip: 'Coeficiente binomial' },
    { label: '|x|', latex: '|x|', tooltip: 'Valor absoluto' },
    { label: '‖v‖', latex: '\\|\\vec{v}\\|', tooltip: 'Norma de vector' },
    { label: '(…)', latex: '\\left( \\frac{a}{b} \\right)', tooltip: 'Paréntesis adaptables' },
    { label: '[…]', latex: '\\left[ \\frac{a}{b} \\right]', tooltip: 'Corchetes adaptables' },
    { label: '{…}', latex: '\\left\\{ x \\in \\mathbb{R} : x > 0 \\right\\}', tooltip: 'Llaves de conjunto' },
  ];

  const calculusSymbols: SymbolItem[] = [
    { label: '∫ᵇₐ', latex: '\\int_{a}^{b} f(x) \\, dx', tooltip: 'Integral definida' },
    { label: '∫', latex: '\\int f(x) \\, dx', tooltip: 'Integral indefinida' },
    { label: '∬', latex: '\\iint_{D} f(x, y) \\, dx \\, dy', tooltip: 'Integral doble' },
    { label: '∮', latex: '\\oint_{C} \\mathbf{F} \\cdot d\\mathbf{r}', tooltip: 'Integral de línea cerrada' },
    { label: '∑', latex: '\\sum_{i=1}^{n} x_i', tooltip: 'Sumatorio' },
    { label: '∏', latex: '\\prod_{i=1}^{n} a_i', tooltip: 'Productorio' },
    { label: 'lim', latex: '\\lim_{x \\to \\infty} f(x)', tooltip: 'Límite al infinito' },
    { label: 'lim₀', latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1', tooltip: 'Límite notable' },
    { label: 'df/dx', latex: '\\frac{df}{dx}', tooltip: 'Derivada ordinaria' },
    { label: 'd²f/dx²', latex: '\\frac{d^2 f}{dx^2}', tooltip: 'Segunda derivada' },
    { label: '∂f/∂x', latex: '\\frac{\\partial f}{\\partial x}', tooltip: 'Derivada parcial' },
    { label: '∇f', latex: '\\nabla f(x, y, z)', tooltip: 'Gradiente' },
    { label: '∇·F', latex: '\\nabla \\cdot \\mathbf{F}', tooltip: 'Divergencia' },
    { label: '∇×F', latex: '\\nabla \\times \\mathbf{F}', tooltip: 'Rotacional' },
    { label: 'Δu', latex: '\\Delta u = \\nabla^2 u', tooltip: 'Laplaciano' },
  ];

  const algebraSymbols: SymbolItem[] = [
    { label: 'Matriz 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', tooltip: 'Matriz 2x2 con paréntesis' },
    { label: 'Matriz 3x3', latex: '\\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\\\ a_{31} & a_{32} & a_{33} \\end{pmatrix}', tooltip: 'Matriz 3x3' },
    { label: 'Det 2x2', latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', tooltip: 'Determinante 2x2' },
    { label: 'Det 3x3', latex: '\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}', tooltip: 'Determinante 3x3' },
    { label: 'Corchetes 2x2', latex: '\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}', tooltip: 'Matriz identidad corchetes' },
    { label: 'Sistema Casos', latex: '\\begin{cases} 2x + y = 10 \\\\ x - 3y = -2 \\end{cases}', tooltip: 'Sistema de ecuaciones' },
    { label: 'Vector v⃗', latex: '\\vec{v} = \\begin{pmatrix} v_x \\\\ v_y \\\\ v_z \\end{pmatrix}', tooltip: 'Vector columna 3D' },
    { label: 'Prod. Escalar', latex: '\\mathbf{u} \\cdot \\mathbf{v} = \\|\\mathbf{u}\\| \\|\\mathbf{v}\\| \\cos \\theta', tooltip: 'Producto escalar' },
    { label: 'Prod. Vectorial', latex: '\\mathbf{u} \\times \\mathbf{v}', tooltip: 'Producto vectorial' },
  ];

  const greekSymbols: SymbolItem[] = [
    { label: 'α', latex: '\\alpha', tooltip: 'Alpha' },
    { label: 'β', latex: '\\beta', tooltip: 'Beta' },
    { label: 'γ', latex: '\\gamma', tooltip: 'Gamma' },
    { label: 'δ', latex: '\\delta', tooltip: 'Delta' },
    { label: 'ε', latex: '\\epsilon', tooltip: 'Epsilon' },
    { label: 'ζ', latex: '\\zeta', tooltip: 'Zeta' },
    { label: 'η', latex: '\\eta', tooltip: 'Eta' },
    { label: 'θ', latex: '\\theta', tooltip: 'Theta' },
    { label: 'ι', latex: '\\iota', tooltip: 'Iota' },
    { label: 'κ', latex: '\\kappa', tooltip: 'Kappa' },
    { label: 'λ', latex: '\\lambda', tooltip: 'Lambda' },
    { label: 'μ', latex: '\\mu', tooltip: 'Mu' },
    { label: 'ν', latex: '\\nu', tooltip: 'Nu' },
    { label: 'ξ', latex: '\\xi', tooltip: 'Xi' },
    { label: 'π', latex: '\\pi', tooltip: 'Pi' },
    { label: 'ρ', latex: '\\rho', tooltip: 'Rho' },
    { label: 'σ', latex: '\\sigma', tooltip: 'Sigma' },
    { label: 'τ', latex: '\\tau', tooltip: 'Tau' },
    { label: 'υ', latex: '\\upsilon', tooltip: 'Upsilon' },
    { label: 'φ', latex: '\\phi', tooltip: 'Phi' },
    { label: 'χ', latex: '\\chi', tooltip: 'Chi' },
    { label: 'ψ', latex: '\\psi', tooltip: 'Psi' },
    { label: 'ω', latex: '\\omega', tooltip: 'Omega' },
    // Uppercase
    { label: 'Γ', latex: '\\Gamma', tooltip: 'Gamma Mayúscula' },
    { label: 'Δ', latex: '\\Delta', tooltip: 'Delta Mayúscula' },
    { label: 'Θ', latex: '\\Theta', tooltip: 'Theta Mayúscula' },
    { label: 'Λ', latex: '\\Lambda', tooltip: 'Lambda Mayúscula' },
    { label: 'Ξ', latex: '\\Xi', tooltip: 'Xi Mayúscula' },
    { label: 'Π', latex: '\\Pi', tooltip: 'Pi Mayúscula' },
    { label: 'Σ', latex: '\\Sigma', tooltip: 'Sigma Mayúscula' },
    { label: 'Φ', latex: '\\Phi', tooltip: 'Phi Mayúscula' },
    { label: 'Ψ', latex: '\\Psi', tooltip: 'Psi Mayúscula' },
    { label: 'Ω', latex: '\\Omega', tooltip: 'Omega Mayúscula' },
  ];

  const operatorSymbols: SymbolItem[] = [
    { label: '±', latex: '\\pm', tooltip: 'Más o menos' },
    { label: '∓', latex: '\\mp', tooltip: 'Menos o más' },
    { label: '×', latex: '\\times', tooltip: 'Multiplicación' },
    { label: '÷', latex: '\\div', tooltip: 'División' },
    { label: '·', latex: '\\cdot', tooltip: 'Punto centrado' },
    { label: '≠', latex: '\\neq', tooltip: 'Distinto de' },
    { label: '≤', latex: '\\leq', tooltip: 'Menor o igual' },
    { label: '≥', latex: '\\geq', tooltip: 'Mayor o igual' },
    { label: '≈', latex: '\\approx', tooltip: 'Aproximadamente' },
    { label: '≡', latex: '\\equiv', tooltip: 'Equivalente / Congruente' },
    { label: '∞', latex: '\\infty', tooltip: 'Infinito' },
    { label: '∀', latex: '\\forall', tooltip: 'Para todo' },
    { label: '∃', latex: '\\exists', tooltip: 'Existe' },
    { label: '∄', latex: '\\nexists', tooltip: 'No existe' },
    { label: '∈', latex: '\\in', tooltip: 'Pertenece a' },
    { label: '∉', latex: '\\notin', tooltip: 'No pertenece a' },
    { label: '⊂', latex: '\\subset', tooltip: 'Subconjunto propio' },
    { label: '⊆', latex: '\\subseteq', tooltip: 'Subconjunto' },
    { label: '∪', latex: '\\cup', tooltip: 'Unión' },
    { label: '∩', latex: '\\cap', tooltip: 'Intersección' },
    { label: '∅', latex: '\\emptyset', tooltip: 'Conjunto vacío' },
    { label: '→', latex: '\\to', tooltip: 'Tiende a / Flecha derecha' },
    { label: '⇒', latex: '\\implies', tooltip: 'Implica' },
    { label: '⇔', latex: '\\iff', tooltip: 'Si y solo si' },
    { label: 'ℝ', latex: '\\mathbb{R}', tooltip: 'Números Reales' },
    { label: 'ℂ', latex: '\\mathbb{C}', tooltip: 'Números Complejos' },
    { label: 'ℕ', latex: '\\mathbb{N}', tooltip: 'Números Naturales' },
    { label: 'ℤ', latex: '\\mathbb{Z}', tooltip: 'Números Enteros' },
    { label: 'ℚ', latex: '\\mathbb{Q}', tooltip: 'Números Racionales' },
    { label: 'ℏ', latex: '\\hbar', tooltip: 'Constante reducida de Planck' },
  ];

  const presets: PresetFormula[] = [
    {
      name: 'Fórmula Cuadrática',
      category: 'Álgebra',
      latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      description: 'Solución exacta para ax² + bx + c = 0',
    },
    {
      name: 'Identidad de Euler',
      category: 'Análisis Complejo',
      latex: 'e^{i\\pi} + 1 = 0',
      description: 'Vínculo fundamental entre e, i, π, 1 y 0',
    },
    {
      name: 'Distribución Normal de Gauss',
      category: 'Probabilidad y Estadística',
      latex: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left( -\\frac{(x - \\mu)^2}{2\\sigma^2} \\right)',
      description: 'Campana de Gauss con media μ y desviación estándar σ',
    },
    {
      name: 'Transformada Continua de Fourier',
      category: 'Cálculo Avanzado',
      latex: '\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x) \\, e^{-2\\pi i x \\xi} \\, dx',
      description: 'Descomposición de funciones en componentes frecuenciales',
    },
    {
      name: 'Ecuación de Schrödinger Independiente',
      category: 'Física Cuántica',
      latex: '-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi(\\mathbf{r}) + V(\\mathbf{r})\\psi(\\mathbf{r}) = E\\psi(\\mathbf{r})',
      description: 'Estado cuántico estacionario en mecánica ondulatoria',
    },
    {
      name: 'Teorema Fundamental del Cálculo',
      category: 'Cálculo',
      latex: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a) \\quad \\text{donde } F\'(x) = f(x)',
      description: 'Relación entre diferenciación e integración',
    },
    {
      name: 'Ecuaciones de Maxwell (Forma Diferencial)',
      category: 'Electromagnetismo',
      latex: '\\begin{cases} \\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0} \\\\[4pt] \\nabla \\cdot \\mathbf{B} = 0 \\\\[4pt] \\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\[4pt] \\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} \\end{cases}',
      description: 'Las 4 leyes clásicas del electromagnetismo unificado',
    },
    {
      name: 'Serie de Taylor',
      category: 'Análisis',
      latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n',
      description: 'Aproximación polinómica en el entorno de a',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-obsidian-950 border border-obsidian-750 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100 ring-1 ring-white/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="katex-modal-title"
      >
        {/* =========================================================================
            HEADER: Obsidian Dark Pro con badges de ciencia
           ========================================================================= */}
        <div className="px-6 py-4 border-b border-obsidian-800 bg-obsidian-900/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Sigma className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="katex-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Editor de Fórmulas Matemáticas LaTeX
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                  KaTeX Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sintaxis matemática estándar, renderizado instantáneo sin servidor
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Inline / Block Toggle */}
            <div className="flex items-center bg-obsidian-950 p-1 rounded-lg border border-obsidian-800 text-xs select-none">
              <button
                type="button"
                onClick={() => setIsBlockMode(false)}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  !isBlockMode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850'
                }`}
                title="Inserta la fórmula dentro de la misma línea de texto"
              >
                En línea (Inline)
              </button>
              <button
                type="button"
                onClick={() => setIsBlockMode(true)}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  isBlockMode
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-850'
                }`}
                title="Inserta la fórmula en su propio bloque centrado y destacado"
              >
                En bloque (Display)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-850 transition-colors"
              title="Cerrar modal (Esc)"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            SYMBOL PALETTE TABS & BUTTONS (Single-Click Insertion)
           ========================================================================= */}
        <div className="border-b border-obsidian-800 bg-obsidian-900/40 px-6 pt-3 shrink-0">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {[
              { id: 'templates', label: 'Plantillas Frecuentes' },
              { id: 'calculus', label: 'Cálculo & Integrales' },
              { id: 'algebra', label: 'Matrices & Álgebra' },
              { id: 'greek', label: 'Letras Griegas' },
              { id: 'operators', label: 'Símbolos & Lógica' },
              { id: 'presets', label: 'Biblioteca de Ejemplos' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick-Click Button Grid */}
          <div className="py-2.5 max-h-36 overflow-y-auto">
            {activeTab === 'templates' && (
              <div className="flex flex-wrap gap-1.5">
                {templateSymbols.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertSnippet(s.latex)}
                    className="px-2.5 py-1.5 rounded-md bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-750 hover:border-indigo-500/50 text-slate-200 text-xs font-mono transition-colors flex items-center space-x-1"
                    title={s.tooltip}
                  >
                    <span className="font-semibold text-indigo-300">{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'calculus' && (
              <div className="flex flex-wrap gap-1.5">
                {calculusSymbols.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertSnippet(s.latex)}
                    className="px-2.5 py-1.5 rounded-md bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-750 hover:border-indigo-500/50 text-slate-200 text-xs font-mono transition-colors"
                    title={s.tooltip}
                  >
                    <span className="font-semibold text-emerald-400">{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'algebra' && (
              <div className="flex flex-wrap gap-1.5">
                {algebraSymbols.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertSnippet(s.latex)}
                    className="px-2.5 py-1.5 rounded-md bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-750 hover:border-indigo-500/50 text-slate-200 text-xs font-mono transition-colors"
                    title={s.tooltip}
                  >
                    <span className="font-semibold text-cyan-400">{s.label}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'greek' && (
              <div className="grid grid-cols-6 sm:grid-cols-11 gap-1 text-center">
                {greekSymbols.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertSnippet(s.latex)}
                    className="h-8 rounded-md bg-obsidian-900 hover:bg-indigo-600 hover:text-white border border-obsidian-750 text-slate-200 text-sm font-serif transition-colors flex items-center justify-center"
                    title={`${s.tooltip} (${s.latex})`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'operators' && (
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1 text-center">
                {operatorSymbols.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => insertSnippet(s.latex)}
                    className="h-8 rounded-md bg-obsidian-900 hover:bg-indigo-600 hover:text-white border border-obsidian-750 text-slate-200 text-sm font-mono transition-colors flex items-center justify-center"
                    title={`${s.tooltip} (${s.latex})`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'presets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLatexInput(p.latex)}
                    className="p-2.5 rounded-xl bg-obsidian-900/80 hover:bg-obsidian-800/80 border border-obsidian-800 hover:border-indigo-500/50 cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{p.name}</span>
                      <span className="text-[10px] text-indigo-400 font-mono px-1.5 py-0.5 rounded bg-indigo-500/10">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            EDITOR & LIVE PREVIEW BODY
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* LATEX INPUT TEXTAREA */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="latex-code-input" className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>Código Fuente LaTeX</span>
              </label>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 rounded text-slate-400 hover:text-slate-200 hover:bg-obsidian-850 transition-colors flex items-center space-x-1"
                  title="Limpiar código"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpiar</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLatex}
                  className="px-2.5 py-1 rounded bg-obsidian-900 hover:bg-obsidian-800 border border-obsidian-750 text-slate-300 transition-colors flex items-center space-x-1"
                  title="Copiar código LaTeX al portapapeles"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar LaTeX</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative rounded-xl border border-obsidian-750 bg-obsidian-900/90 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <textarea
                id="latex-code-input"
                ref={textareaRef}
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                placeholder="Escribe aquí tu código LaTeX, e.g. \frac{a}{b} o \int_{0}^{\infty} e^{-x} dx..."
                rows={3}
                className="w-full bg-transparent px-4 py-3 text-sm font-mono text-indigo-100 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
              <div className="absolute bottom-2 right-3 pointer-events-none select-none text-[10px] font-mono text-slate-500">
                Atajo: [Ctrl + Enter] para insertar
              </div>
            </div>
          </div>

          {/* REAL-TIME PREVIEW PANEL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Previsualización KaTeX en Vivo</span>
              </span>

              {hasSyntaxError ? (
                <span className="text-[11px] font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center space-x-1">
                  <span>⚠ Sintaxis no válida</span>
                </span>
              ) : latexInput.trim() ? (
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Sintaxis correcta</span>
                </span>
              ) : null}
            </div>

            <div className="min-h-[140px] rounded-xl border border-obsidian-750 bg-gradient-to-b from-obsidian-950 to-obsidian-900 p-6 flex items-center justify-center overflow-x-auto relative shadow-inner">
              {renderedPreview ? (
                <div
                  className="katex-preview-container text-white text-lg sm:text-xl font-normal leading-loose tracking-wide flex justify-center items-center select-all max-w-full overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: renderedPreview }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 text-xs space-y-1.5 italic">
                  <Sigma className="w-6 h-6 stroke-1 text-slate-600" />
                  <span>La fórmula matemática renderizada aparecerá aquí en tiempo real</span>
                </div>
              )}
            </div>

            {hasSyntaxError && errorMessage && (
              <p className="text-xs text-rose-400/90 font-mono px-1">
                Detalle del error: {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* =========================================================================
            FOOTER ACTIONS
           ========================================================================= */}
        <div className="px-6 py-4 border-t border-obsidian-800 bg-obsidian-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Modo seleccionado:{' '}
              <strong className="text-white">
                {isBlockMode ? 'Bloque Ecuación Centrado' : 'Fórmula en Línea (Inline)'}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-obsidian-800 border border-obsidian-750 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleInsert}
              disabled={!latexInput.trim()}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg transition-all ${
                latexInput.trim()
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 active:scale-[0.98]'
                  : 'bg-obsidian-800 text-slate-500 border border-obsidian-750 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Insertar Fórmula en Documento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
