import React, { useState, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  Milestone,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Edit3,
  TrendingUp,
  Check,
  X,
} from 'lucide-react';

// ============================================================================
// TYPES & DATA STRUCTURES (CPM & GANTT)
// ============================================================================

export type DependencyType = 'FS' | 'SS'; // Finish-to-Start | Start-to-Start

export interface TaskDependency {
  taskId: string;
  type: DependencyType;
  lag?: number; // Lag in days (default: 0)
}

export interface ResourceAssignee {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  initials: string;
}

export interface ProjectTask {
  id: string;
  wbs: string;
  name: string;
  duration: number; // in days (0 = Milestone)
  progress: number; // 0 to 100
  dependencies: TaskDependency[];
  assignee: ResourceAssignee;
  notes?: string;
}

export interface CalculatedTask extends ProjectTask {
  // CPM results (offsets in integer days from project start)
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  totalFloat: number; // Holgura Total = LS - ES = LF - EF
  freeFloat: number;  // Holgura Libre
  isCritical: boolean;
  // Date representations
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startDateFormatted: string;
  endDateFormatted: string;
}

export type ZoomLevel = 'days' | 'weeks' | 'months';
export type ViewLayout = 'split' | 'gantt' | 'table';

// Pre-configured Resources
export const PROJECT_RESOURCES: ResourceAssignee[] = [
  { id: 'r1', name: 'Elena Vega', role: 'Tech Lead / Architect', avatarColor: 'bg-indigo-600', initials: 'EV' },
  { id: 'r2', name: 'Carlos Ruiz', role: 'UI/UX & Frontend Spec', avatarColor: 'bg-emerald-600', initials: 'CR' },
  { id: 'r3', name: 'Marcos Sanz', role: 'DevOps & SRE Lead', avatarColor: 'bg-cyan-600', initials: 'MS' },
  { id: 'r4', name: 'Sofia Castro', role: 'Senior React Dev', avatarColor: 'bg-purple-600', initials: 'SC' },
  { id: 'r5', name: 'David Morales', role: 'QA Automation Lead', avatarColor: 'bg-amber-600', initials: 'DM' },
];

// Initial 7 Interconnected Tasks for Software Engineering Project
export const INITIAL_DEMO_TASKS: ProjectTask[] = [
  {
    id: 'T1',
    wbs: '1.0',
    name: 'Definición de Requisitos & Alcance',
    duration: 4,
    progress: 100,
    dependencies: [],
    assignee: PROJECT_RESOURCES[0],
    notes: 'Kickoff formal, SRS firmado y matriz de trazabilidad aprobada.',
  },
  {
    id: 'T2',
    wbs: '2.0',
    name: 'Diseño de Arquitectura y UX/UI',
    duration: 5,
    progress: 80,
    dependencies: [{ taskId: 'T1', type: 'FS', lag: 0 }],
    assignee: PROJECT_RESOURCES[1],
    notes: 'Esquema de componentes, tokens de diseño y diagramas C4.',
  },
  {
    id: 'T3',
    wbs: '3.0',
    name: 'Configuración de Entorno & CI/CD',
    duration: 3,
    progress: 100,
    dependencies: [{ taskId: 'T1', type: 'FS', lag: 0 }],
    assignee: PROJECT_RESOURCES[2],
    notes: 'Pipelines automatizados en GitHub Actions, linters y Docker multi-stage.',
  },
  {
    id: 'T4',
    wbs: '4.0',
    name: 'Desarrollo del Backend & APIs Core',
    duration: 8,
    progress: 60,
    dependencies: [{ taskId: 'T2', type: 'FS', lag: 0 }],
    assignee: PROJECT_RESOURCES[0],
    notes: 'Microservicios con autenticación JWT, rate-limit y persistencia SQLite/PostgreSQL.',
  },
  {
    id: 'T5',
    wbs: '5.0',
    name: 'Desarrollo de Frontend React & Estado',
    duration: 7,
    progress: 40,
    dependencies: [
      { taskId: 'T2', type: 'FS', lag: 0 },
      { taskId: 'T3', type: 'SS', lag: 2 },
    ],
    assignee: PROJECT_RESOURCES[3],
    notes: 'Vistas modulares, store Zustand y componentes accesibles Tailwind.',
  },
  {
    id: 'T6',
    wbs: '6.0',
    name: 'Integración de Sistemas & Pruebas QA',
    duration: 5,
    progress: 10,
    dependencies: [
      { taskId: 'T4', type: 'FS', lag: 0 },
      { taskId: 'T5', type: 'FS', lag: 0 },
    ],
    assignee: PROJECT_RESOURCES[4],
    notes: 'Pruebas E2E, fuzzing de payloads y validación de seguridad.',
  },
  {
    id: 'T7',
    wbs: '7.0',
    name: 'Hito: Despliegue en Producción v1.0',
    duration: 0, // Milestone!
    progress: 0,
    dependencies: [{ taskId: 'T6', type: 'FS', lag: 0 }],
    assignee: PROJECT_RESOURCES[2],
    notes: 'Pase a producción, verificación de métricas y entrega al cliente.',
  },
];

// Project Base Start Date: 12 de Octubre de 2026 (Lunes)
const DEFAULT_PROJECT_START_DATE = '2026-10-12';

// ============================================================================
// CALENDAR & DATE UTILS
// ============================================================================

function parseDateIso(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toIsoString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysToDate(baseDateStr: string, days: number): Date {
  const date = parseDateIso(baseDateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function formatDayMonth(date: Date): string {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
}

function formatFullDate(date: Date): string {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function getDayLetter(date: Date): string {
  const dayLetters = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  return dayLetters[date.getUTCDay()];
}

function isWeekendDay(date: Date): boolean {
  const dow = date.getUTCDay();
  return dow === 0 || dow === 6;
}

// ============================================================================
// CRITICAL PATH METHOD (CPM) ENGINE
// ============================================================================

export function calculateProjectCPM(tasks: ProjectTask[], baseDateStr: string): CalculatedTask[] {
  if (tasks.length === 0) return [];

  // Temporary calculation record
  interface TempNode {
    task: ProjectTask;
    duration: number;
    ES: number;
    EF: number;
    LS: number;
    LF: number;
    totalFloat: number;
    freeFloat: number;
    isCritical: boolean;
  }

  const map = new Map<string, TempNode>();
  tasks.forEach((t) => {
    map.set(t.id, {
      task: t,
      duration: Math.max(0, t.duration),
      ES: 0,
      EF: Math.max(0, t.duration),
      LS: 0,
      LF: 0,
      totalFloat: 0,
      freeFloat: 0,
      isCritical: false,
    });
  });

  // 1. FORWARD PASS: Early Start (ES) and Early Finish (EF)
  // Iterative relaxation up to N+2 times to handle arbitrary task order & detect cycles
  const maxIterations = tasks.length + 3;
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    for (const t of tasks) {
      const node = map.get(t.id)!;
      let maxRequiredES = 0;

      for (const dep of t.dependencies) {
        const pred = map.get(dep.taskId);
        if (!pred) continue;
        const lag = dep.lag ?? 0;
        let candidate = 0;
        if (dep.type === 'FS') {
          // Finish-to-Start: cannot start until predecessor finishes
          candidate = pred.EF + lag;
        } else if (dep.type === 'SS') {
          // Start-to-Start: cannot start until predecessor starts
          candidate = pred.ES + lag;
        }
        if (candidate > maxRequiredES) {
          maxRequiredES = candidate;
        }
      }

      const newEF = maxRequiredES + node.duration;
      if (node.ES !== maxRequiredES || node.EF !== newEF) {
        node.ES = maxRequiredES;
        node.EF = newEF;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Project End Date (Earliest completion time of all tasks)
  const projectEndDay = Math.max(...Array.from(map.values()).map((n) => n.EF), 1);

  // 2. BACKWARD PASS: Late Finish (LF) and Late Start (LS)
  // Initialize all nodes to projectEndDay
  for (const node of map.values()) {
    node.LF = projectEndDay;
    node.LS = projectEndDay - node.duration;
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    for (const t of tasks) {
      const node = map.get(t.id)!;
      // Successors: any task that has 't.id' in its dependencies
      const successors = tasks.filter((cand) => cand.dependencies.some((d) => d.taskId === t.id));

      if (successors.length === 0) {
        const newLF = projectEndDay;
        const newLS = newLF - node.duration;
        if (node.LF !== newLF || node.LS !== newLS) {
          node.LF = newLF;
          node.LS = newLS;
          changed = true;
        }
      } else {
        let minAllowedLS = Infinity;
        for (const succ of successors) {
          const succNode = map.get(succ.id)!;
          const dep = succ.dependencies.find((d) => d.taskId === t.id)!;
          const lag = dep.lag ?? 0;

          if (dep.type === 'FS') {
            // succ.LS >= node.EF + lag => node.EF <= succ.LS - lag => node.LS <= succ.LS - lag - node.duration
            const limit = succNode.LS - lag - node.duration;
            if (limit < minAllowedLS) minAllowedLS = limit;
          } else if (dep.type === 'SS') {
            // succ.LS >= node.ES + lag => node.LS <= succ.LS - lag
            const limit = succNode.LS - lag;
            if (limit < minAllowedLS) minAllowedLS = limit;
          }
        }

        const newLS = minAllowedLS === Infinity ? 0 : minAllowedLS;
        const newLF = newLS + node.duration;
        if (node.LS !== newLS || node.LF !== newLF) {
          node.LS = newLS;
          node.LF = newLF;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  // 3. FLOAT & CRITICAL PATH EVALUATION
  for (const node of map.values()) {
    // Total Float: TF = LS - ES = LF - EF
    node.totalFloat = Math.round(node.LS - node.ES);
    // Task is Critical if Total Float <= 0
    node.isCritical = Math.abs(node.totalFloat) <= 0.001;

    // Free Float: amount of time task can delay without affecting any successor's ES
    const successors = tasks.filter((cand) => cand.dependencies.some((d) => d.taskId === node.task.id));
    if (successors.length === 0) {
      node.freeFloat = Math.max(0, projectEndDay - node.EF);
    } else {
      let minSlack = Infinity;
      for (const succ of successors) {
        const succNode = map.get(succ.id)!;
        const dep = succ.dependencies.find((d) => d.taskId === node.task.id)!;
        const lag = dep.lag ?? 0;
        if (dep.type === 'FS') {
          minSlack = Math.min(minSlack, succNode.ES - node.EF - lag);
        } else if (dep.type === 'SS') {
          minSlack = Math.min(minSlack, succNode.ES - node.ES - lag);
        }
      }
      node.freeFloat = Math.max(0, minSlack === Infinity ? 0 : minSlack);
    }
  }

  // Map to final CalculatedTask array preserving order
  return tasks.map((t) => {
    const node = map.get(t.id)!;
    const startD = addDaysToDate(baseDateStr, node.ES);
    const endD = addDaysToDate(baseDateStr, node.EF);

    return {
      ...t,
      earlyStart: node.ES,
      earlyFinish: node.EF,
      lateStart: node.LS,
      lateFinish: node.LF,
      totalFloat: node.totalFloat,
      freeFloat: node.freeFloat,
      isCritical: node.isCritical,
      startDate: toIsoString(startD),
      endDate: toIsoString(endD),
      startDateFormatted: formatDayMonth(startD),
      endDateFormatted: formatDayMonth(endD),
    };
  });
}

// ============================================================================
// MAIN COMPONENT: GanttProjectView
// ============================================================================

export const GanttProjectView: React.FC = () => {
  // State: Tasks list & selected task
  const [tasks, setTasks] = useState<ProjectTask[]>(INITIAL_DEMO_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('T1');
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  // View configurations
  const [zoom, setZoom] = useState<ZoomLevel>('days');
  const [layout, setLayout] = useState<ViewLayout>('split');
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState<boolean>(false);
  const [baseDate, setBaseDate] = useState<string>(DEFAULT_PROJECT_START_DATE);

  // Simulated "Today" date offset for visual demo (Oct 14, 2026 = Day 2 of project)
  const [todayOffsetDays, setTodayOffsetDays] = useState<number>(2);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form state for Task Modal
  const [formName, setFormName] = useState<string>('');
  const [formWbs, setFormWbs] = useState<string>('');
  const [formDuration, setFormDuration] = useState<number>(3);
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formIsMilestone, setFormIsMilestone] = useState<boolean>(false);
  const [formAssigneeId, setFormAssigneeId] = useState<string>(PROJECT_RESOURCES[0].id);
  const [formDependencies, setFormDependencies] = useState<TaskDependency[]>([]);
  const [formNotes, setFormNotes] = useState<string>('');

  // Refs for synchronized scrolling
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef<boolean>(false);

  // Calculate CPM Schedule
  const calculatedTasks = useMemo(() => {
    return calculateProjectCPM(tasks, baseDate);
  }, [tasks, baseDate]);

  // Selected Task reference
  const selectedTask = useMemo(() => {
    return calculatedTasks.find((t) => t.id === selectedTaskId) || null;
  }, [calculatedTasks, selectedTaskId]);

  // Project overall metrics
  const projectMetrics = useMemo(() => {
    if (calculatedTasks.length === 0) {
      return { totalDuration: 0, criticalCount: 0, progress: 0, endDateFormatted: '-', criticalPathTasks: [] };
    }
    const totalDuration = Math.max(...calculatedTasks.map((t) => t.earlyFinish), 0);
    const criticalTasks = calculatedTasks.filter((t) => t.isCritical);

    // Weighted progress by duration (milestones have duration 0, give minimal weight 0.5)
    let totalWeight = 0;
    let earnedWeight = 0;
    calculatedTasks.forEach((t) => {
      const weight = t.duration === 0 ? 0.5 : t.duration;
      totalWeight += weight;
      earnedWeight += weight * (t.progress / 100);
    });
    const progress = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    const lastDate = addDaysToDate(baseDate, totalDuration);

    return {
      totalDuration,
      criticalCount: criticalTasks.length,
      progress,
      endDateFormatted: formatFullDate(lastDate),
      criticalPathTasks: criticalTasks,
    };
  }, [calculatedTasks, baseDate]);

  // Timeline Geometry based on Zoom
  const dayWidth = useMemo(() => {
    switch (zoom) {
      case 'days':
        return 42;
      case 'weeks':
        return 22;
      case 'months':
        return 10;
      default:
        return 42;
    }
  }, [zoom]);

  const rowHeight = 48; // Exact pixel height matching table rows
  const headerHeight = 56; // 2-tier header for timeline dates
  const totalDays = useMemo(() => {
    return Math.max(projectMetrics.totalDuration + 10, 32);
  }, [projectMetrics.totalDuration]);

  const svgWidth = totalDays * dayWidth;
  const svgHeight = headerHeight + calculatedTasks.length * rowHeight + 24;

  // Synchronize vertical scrolling between WBS Table and Gantt SVG
  const handleTableScroll = () => {
    if (isSyncingScroll.current) return;
    if (tableContainerRef.current && ganttContainerRef.current) {
      isSyncingScroll.current = true;
      ganttContainerRef.current.scrollTop = tableContainerRef.current.scrollTop;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  };

  const handleGanttScroll = () => {
    if (isSyncingScroll.current) return;
    if (tableContainerRef.current && ganttContainerRef.current) {
      isSyncingScroll.current = true;
      tableContainerRef.current.scrollTop = ganttContainerRef.current.scrollTop;
      requestAnimationFrame(() => {
        isSyncingScroll.current = false;
      });
    }
  };

  // Open modal to add new task
  const handleOpenAddTask = () => {
    const nextIndex = tasks.length + 1;
    setEditingTaskId(null);
    setFormName('');
    setFormWbs(`${nextIndex}.0`);
    setFormDuration(3);
    setFormProgress(0);
    setFormIsMilestone(false);
    setFormAssigneeId(PROJECT_RESOURCES[0].id);
    // Pre-populate predecessor as last task if available
    const lastTask = tasks[tasks.length - 1];
    setFormDependencies(lastTask ? [{ taskId: lastTask.id, type: 'FS', lag: 0 }] : []);
    setFormNotes('');
    setIsTaskModalOpen(true);
  };

  // Open modal to edit existing task
  const handleOpenEditTask = (task: ProjectTask) => {
    setEditingTaskId(task.id);
    setFormName(task.name);
    setFormWbs(task.wbs);
    setFormDuration(task.duration);
    setFormProgress(task.progress);
    setFormIsMilestone(task.duration === 0);
    setFormAssigneeId(task.assignee.id);
    setFormDependencies([...task.dependencies]);
    setFormNotes(task.notes || '');
    setIsTaskModalOpen(true);
  };

  // Save Task (Add or Update)
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const assignee = PROJECT_RESOURCES.find((r) => r.id === formAssigneeId) || PROJECT_RESOURCES[0];
    const duration = formIsMilestone ? 0 : Math.max(0, Number(formDuration));
    const progress = Math.min(100, Math.max(0, Number(formProgress)));

    if (editingTaskId) {
      // Update existing
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === editingTaskId) {
            return {
              ...t,
              name: formName.trim(),
              wbs: formWbs.trim() || t.wbs,
              duration,
              progress,
              dependencies: formDependencies.filter((d) => d.taskId !== editingTaskId),
              assignee,
              notes: formNotes.trim(),
            };
          }
          return t;
        })
      );
    } else {
      // Create new
      const newId = `T${Date.now().toString().slice(-4)}`;
      const newTask: ProjectTask = {
        id: newId,
        wbs: formWbs.trim() || `${tasks.length + 1}.0`,
        name: formName.trim(),
        duration,
        progress,
        dependencies: formDependencies,
        assignee,
        notes: formNotes.trim(),
      };
      setTasks((prev) => [...prev, newTask]);
      setSelectedTaskId(newId);
    }

    setIsTaskModalOpen(false);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    if (tasks.length <= 1) {
      alert('El proyecto debe contener al menos una tarea.');
      return;
    }
    setTasks((prev) => {
      // Remove task and clean references from dependencies
      return prev
        .filter((t) => t.id !== taskId)
        .map((t) => ({
          ...t,
          dependencies: t.dependencies.filter((d) => d.taskId !== taskId),
        }));
    });
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  // Quick adjust progress
  const handleQuickProgress = (taskId: string, delta: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = Math.min(100, Math.max(0, t.progress + delta));
          return { ...t, progress: next };
        }
        return t;
      })
    );
  };

  // Quick adjust duration
  const handleQuickDuration = (taskId: string, delta: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const next = Math.max(0, t.duration + delta);
          return { ...t, duration: next };
        }
        return t;
      })
    );
  };

  // Reset to Demo Schedule
  const handleResetDemo = () => {
    if (window.confirm('¿Deseas restaurar el cronograma inicial de ingeniería de software con 7 tareas interconectadas?')) {
      setTasks(INITIAL_DEMO_TASKS);
      setSelectedTaskId('T1');
      setBaseDate(DEFAULT_PROJECT_START_DATE);
      setTodayOffsetDays(2);
    }
  };

  // Export to JSON
  const handleExportSchedule = () => {
    const payload = {
      project: 'Apex Office Suite - Schedule',
      baseDate,
      calculatedSchedule: calculatedTasks,
      metrics: projectMetrics,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronograma-cpm-${baseDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // SVG GANTT CHART HELPERS & PATH GENERATOR
  // ============================================================================

  // Generate connection arrow path between predecessor & successor
  const renderDependencyArrow = (
    predTask: CalculatedTask,
    succTask: CalculatedTask,
    predIndex: number,
    succIndex: number,
    dep: TaskDependency
  ) => {
    const yPred = headerHeight + predIndex * rowHeight + rowHeight / 2;
    const ySucc = headerHeight + succIndex * rowHeight + rowHeight / 2;

    let xStart = 0;
    if (dep.type === 'FS') {
      // Starts from the finish edge of predecessor
      xStart = predTask.duration === 0 ? predTask.earlyStart * dayWidth : predTask.earlyFinish * dayWidth;
    } else {
      // Starts from start edge of predecessor
      xStart = predTask.earlyStart * dayWidth;
    }

    // Destination is always the start edge of successor
    const xEnd = succTask.earlyStart * dayWidth;

    // Both on critical path?
    const isCriticalLink = predTask.isCritical && succTask.isCritical;

    // Build step path
    let d = '';

    if (dep.type === 'FS') {
      if (xEnd >= xStart + 16) {
        // Normal forward step
        const midX = xStart + (xEnd - xStart) / 2;
        d = `M ${xStart} ${yPred} L ${midX} ${yPred} L ${midX} ${ySucc} L ${xEnd - 4} ${ySucc}`;
      } else {
        // Backward loop or tightly packed
        const stepOut = xStart + 10;
        const midY = yPred < ySucc ? yPred + rowHeight * 0.45 : yPred - rowHeight * 0.45;
        const stepIn = xEnd - 12;
        d = `M ${xStart} ${yPred} L ${stepOut} ${yPred} L ${stepOut} ${midY} L ${stepIn} ${midY} L ${stepIn} ${ySucc} L ${xEnd - 4} ${ySucc}`;
      }
    } else {
      // Start-to-Start (SS)
      const leftStep = Math.min(xStart, xEnd) - 14;
      d = `M ${xStart} ${yPred} L ${leftStep} ${yPred} L ${leftStep} ${ySucc} L ${xEnd - 4} ${ySucc}`;
    }

    return (
      <g key={`dep-${predTask.id}-${succTask.id}-${dep.type}`}>
        <path
          d={d}
          fill="none"
          stroke={isCriticalLink ? '#ef4444' : '#64748b'}
          strokeWidth={isCriticalLink ? 2.4 : 1.5}
          strokeDasharray={dep.type === 'SS' ? '4 2' : 'none'}
          markerEnd={isCriticalLink ? 'url(#arrow-critical)' : 'url(#arrow-normal)'}
          className="transition-colors duration-200"
          opacity={highlightCriticalOnly && !isCriticalLink ? 0.2 : 0.85}
        />
      </g>
    );
  };

  // Today position in pixels
  const todayX = todayOffsetDays * dayWidth + dayWidth / 2;

  return (
    <div className="flex-1 flex flex-col bg-obsidian-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* ==================================================================== */}
      {/* TOP HEADER & RIBBON CONTROLS                                         */}
      {/* ==================================================================== */}
      <header className="bg-obsidian-900 border-b border-obsidian-800 px-4 py-2.5 shrink-0 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Status */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold tracking-tight text-white">
                  Apex Project Manager • Control de Cronogramas & Ruta Crítica (CPM)
                </h1>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Primavera P6 Engine
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  MS Project Logic
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2">
                <span>Cálculo automatizado de holguras tempranas/tardías y ruta crítica sin holgura (Float = 0).</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & View Toggles */}
          <div className="flex items-center space-x-2">
            {/* Add Task Button */}
            <button
              onClick={handleOpenAddTask}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm shadow-rose-600/30 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Tarea</span>
            </button>

            {/* Delete Task */}
            {selectedTaskId && (
              <button
                onClick={() => handleDeleteTask(selectedTaskId)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-obsidian-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-obsidian-700 text-xs transition-all"
                title="Eliminar tarea seleccionada"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            )}

            {/* Layout switch */}
            <div className="flex items-center bg-obsidian-950 p-0.5 rounded-lg border border-obsidian-800 text-xs">
              <button
                onClick={() => setLayout('split')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  layout === 'split' ? 'bg-obsidian-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista dividida (Tabla WBS + Gantt)"
              >
                Dividida
              </button>
              <button
                onClick={() => setLayout('gantt')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  layout === 'gantt' ? 'bg-obsidian-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Solo diagrama de Gantt"
              >
                Gantt
              </button>
              <button
                onClick={() => setLayout('table')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  layout === 'table' ? 'bg-obsidian-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Solo tabla de WBS y CPM"
              >
                Tabla
              </button>
            </div>

            {/* Zoom Selector */}
            <div className="flex items-center bg-obsidian-950 p-0.5 rounded-lg border border-obsidian-800 text-xs">
              <button
                onClick={() => setZoom('days')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  zoom === 'days' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Días
              </button>
              <button
                onClick={() => setZoom('weeks')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  zoom === 'weeks' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semanas
              </button>
              <button
                onClick={() => setZoom('months')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  zoom === 'months' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Meses
              </button>
            </div>

            {/* Critical Path Filter Toggle */}
            <button
              onClick={() => setHighlightCriticalOnly((prev) => !prev)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                highlightCriticalOnly
                  ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm shadow-red-500/20'
                  : 'bg-obsidian-800 text-slate-300 border-obsidian-700 hover:bg-obsidian-750'
              }`}
              title="Atenuar tareas no críticas y resaltar solo la ruta crítica"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Solo Críticas</span>
            </button>

            {/* Reset Demo */}
            <button
              onClick={handleResetDemo}
              className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 transition-all"
              title="Restaurar cronograma demo (7 tareas)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Export */}
            <button
              onClick={handleExportSchedule}
              className="p-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 border border-obsidian-700 transition-all"
              title="Exportar cronograma a JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Project Metrics KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1 border-t border-obsidian-800/60">
          {/* KPI 1: Total Duration */}
          <div className="bg-obsidian-950/80 p-2 rounded-lg border border-obsidian-800 flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Duración Total</p>
              <p className="font-bold text-sm text-slate-100">{projectMetrics.totalDuration} días</p>
            </div>
          </div>

          {/* KPI 2: Target Finish Date */}
          <div className="bg-obsidian-950/80 p-2 rounded-lg border border-obsidian-800 flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Fin Estimado</p>
              <p className="font-bold text-sm text-slate-100">{projectMetrics.endDateFormatted}</p>
            </div>
          </div>

          {/* KPI 3: Overall Progress */}
          <div className="bg-obsidian-950/80 p-2 rounded-lg border border-obsidian-800 flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-medium">
                <span>Avance Ponderado</span>
                <span className="font-bold text-slate-200">{projectMetrics.progress}%</span>
              </div>
              <div className="w-full bg-obsidian-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${projectMetrics.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* KPI 4: Critical Path Count */}
          <div className="bg-obsidian-950/80 p-2 rounded-lg border border-rose-500/30 flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-rose-300 uppercase font-semibold">Ruta Crítica</p>
              <p className="font-bold text-sm text-rose-400">
                {projectMetrics.criticalCount} de {tasks.length} tareas
              </p>
            </div>
          </div>

          {/* KPI 5: Interactive 'Hoy' Slider */}
          <div className="bg-obsidian-950/80 p-2 rounded-lg border border-obsidian-800 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="flex items-center space-x-1 text-red-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>Marcador 'Hoy'</span>
              </span>
              <span className="font-mono text-slate-300">Día +{todayOffsetDays}</span>
            </div>
            <input
              type="range"
              min={0}
              max={projectMetrics.totalDuration + 5}
              value={todayOffsetDays}
              onChange={(e) => setTodayOffsetDays(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer h-1.5 bg-obsidian-800 rounded-lg mt-1"
              title="Ajusta el día de corte / 'Hoy' en la escala temporal"
            />
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN WORKSPACE BODY: SPLIT VIEW (WBS TABLE + GANTT CHART)            */}
      {/* ==================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================================================================== */}
        {/* 1. LEFT PANE: WBS TASK TABLE                                       */}
        {/* ================================================================== */}
        {(layout === 'split' || layout === 'table') && (
          <div
            className={`${
              layout === 'table' ? 'w-full' : 'w-full md:w-[540px] xl:w-[620px]'
            } border-r border-obsidian-800 flex flex-col bg-obsidian-900/60 shrink-0 transition-all`}
          >
            {/* Table Header Row (Height matching Gantt Header 56px) */}
            <div className="h-14 bg-obsidian-950 border-b border-obsidian-800 px-3 flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 select-none">
              <div className="w-10 text-center">WBS</div>
              <div className="w-12 text-center">ID</div>
              <div className="flex-1 min-w-[140px] px-2">Tarea / Hito</div>
              <div className="w-16 text-center">Dur.</div>
              <div className="w-20 text-center">Inicio / Fin</div>
              <div className="w-20 text-center">% Avance</div>
              <div className="w-20 text-center">Pred.</div>
              <div className="w-20 text-center">Holgura</div>
              <div className="w-16 text-center">Acciones</div>
            </div>

            {/* Table Body Scrollable */}
            <div
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              className="flex-1 overflow-y-auto overflow-x-auto divide-y divide-obsidian-800/60"
            >
              {calculatedTasks.map((t, idx) => {
                const isSelected = t.id === selectedTaskId;
                const isHovered = t.id === hoveredTaskId;
                const isMilestone = t.duration === 0;

                return (
                  <div
                    key={t.id}
                    style={{ height: `${rowHeight}px` }}
                    onClick={() => setSelectedTaskId(t.id)}
                    onMouseEnter={() => setHoveredTaskId(t.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                    className={`flex items-center px-3 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500/15 border-l-4 border-l-rose-500 text-white'
                        : isHovered
                        ? 'bg-obsidian-800/50 text-slate-200'
                        : idx % 2 === 1
                        ? 'bg-obsidian-900/40 text-slate-300'
                        : 'bg-obsidian-950/20 text-slate-300'
                    } ${t.isCritical ? 'font-medium' : ''}`}
                  >
                    {/* WBS */}
                    <div className="w-10 font-mono text-[11px] text-slate-400 text-center shrink-0">
                      {t.wbs}
                    </div>

                    {/* ID Badge */}
                    <div className="w-12 text-center shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          t.isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-obsidian-800 text-slate-300 border border-obsidian-700'
                        }`}
                      >
                        {t.id}
                      </span>
                    </div>

                    {/* Task Name & Milestone / Critical Icon */}
                    <div className="flex-1 min-w-[140px] px-2 flex items-center space-x-1.5 truncate">
                      {isMilestone ? (
                        <Milestone className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400/20" />
                      ) : t.isCritical ? (
                        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0 fill-rose-500/20" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-blue-500/60 shrink-0" />
                      )}
                      <span className="truncate" title={t.name}>
                        {t.name}
                      </span>
                    </div>

                    {/* Duration with quick +/- buttons */}
                    <div className="w-16 flex items-center justify-center space-x-1 shrink-0 font-mono text-[11px]">
                      {isMilestone ? (
                        <span className="text-amber-400 font-bold">Hito</span>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickDuration(t.id, -1);
                            }}
                            className="w-4 h-4 rounded bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 flex items-center justify-center text-[10px]"
                            title="-1 día"
                          >
                            -
                          </button>
                          <span>{t.duration}d</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickDuration(t.id, 1);
                            }}
                            className="w-4 h-4 rounded bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 flex items-center justify-center text-[10px]"
                            title="+1 día"
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>

                    {/* Start / Finish Dates */}
                    <div className="w-20 text-center font-mono text-[10px] text-slate-400 shrink-0 leading-tight">
                      <div>{t.startDateFormatted}</div>
                      <div className="text-slate-500">{t.endDateFormatted}</div>
                    </div>

                    {/* Progress with interactive percentage */}
                    <div className="w-20 px-1 shrink-0">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-mono text-slate-300">{t.progress}%</span>
                        <div className="flex items-center space-x-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickProgress(t.id, -10);
                            }}
                            className="text-[9px] px-1 py-0.2 rounded bg-obsidian-800 text-slate-400 hover:text-white"
                          >
                            -
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickProgress(t.id, 10);
                            }}
                            className="text-[9px] px-1 py-0.2 rounded bg-obsidian-800 text-slate-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-obsidian-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${
                            t.progress === 100
                              ? 'bg-emerald-400'
                              : t.isCritical
                              ? 'bg-rose-500'
                              : 'bg-blue-400'
                          }`}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Predecessors */}
                    <div className="w-20 text-center shrink-0 text-[10px] font-mono text-slate-400 truncate px-1">
                      {t.dependencies.length === 0 ? (
                        <span className="text-slate-600">-</span>
                      ) : (
                        t.dependencies.map((d, i) => (
                          <span
                            key={i}
                            className="inline-block px-1 py-0.5 m-0.5 rounded bg-obsidian-800 text-slate-300 border border-obsidian-700/60"
                          >
                            {d.taskId}
                            {d.type}
                            {d.lag ? `+${d.lag}` : ''}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Holgura Total (Total Float) */}
                    <div className="w-20 text-center shrink-0">
                      {t.isCritical ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse">
                          0d Crítica
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          +{t.totalFloat}d
                        </span>
                      )}
                    </div>

                    {/* Actions: Edit / Delete */}
                    <div className="w-16 flex items-center justify-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditTask(t);
                        }}
                        className="p-1 rounded bg-obsidian-800 hover:bg-obsidian-700 text-slate-300 hover:text-white"
                        title="Editar tarea"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(t.id);
                        }}
                        className="p-1 rounded bg-obsidian-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* 2. RIGHT PANE: VECTORIAL INTERACTIVE SVG GANTT TIMELINE             */}
        {/* ================================================================== */}
        {(layout === 'split' || layout === 'gantt') && (
          <div
            ref={ganttContainerRef}
            onScroll={handleGanttScroll}
            className="flex-1 overflow-auto bg-obsidian-950 relative scroll-smooth"
          >
            <svg
              width={svgWidth}
              height={svgHeight}
              className="select-none overflow-visible block"
            >
              {/* SVG Gradient & Marker Definitions */}
              <defs>
                {/* Critical Arrow Marker */}
                <marker
                  id="arrow-critical"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                </marker>

                {/* Normal Arrow Marker */}
                <marker
                  id="arrow-normal"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                </marker>

                {/* Critical Task Bar Gradient */}
                <linearGradient id="grad-critical" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>

                {/* Normal Task Bar Gradient */}
                <linearGradient id="grad-normal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>

                {/* Completed Striped Pattern */}
                <pattern id="pattern-progress" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                </pattern>

                {/* Critical Glow Filter */}
                <filter id="glow-critical" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.4" />
                </filter>

                {/* Milestone Glow Filter */}
                <filter id="glow-milestone" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#f59e0b" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* ------------------------------------------------------------ */}
              {/* TIMELINE HEADER (56px 2-TIER HEADER)                          */}
              {/* ------------------------------------------------------------ */}
              <g id="timeline-header">
                {/* Background */}
                <rect x="0" y="0" width={svgWidth} height={headerHeight} fill="#090a0f" />
                <line x1="0" y1={headerHeight} x2={svgWidth} y2={headerHeight} stroke="#1e293b" strokeWidth="1" />
                <line x1="0" y1="28" x2={svgWidth} y2="28" stroke="#161b26" strokeWidth="1" />

                {/* Days / Weeks Header Columns */}
                {Array.from({ length: totalDays }).map((_, dayIdx) => {
                  const dayDate = addDaysToDate(baseDate, dayIdx);
                  const isWeekend = isWeekendDay(dayDate);
                  const x = dayIdx * dayWidth;

                  return (
                    <g key={`day-hdr-${dayIdx}`}>
                      {/* Weekend shading in header */}
                      {isWeekend && (
                        <rect
                          x={x}
                          y="28"
                          width={dayWidth}
                          height={headerHeight - 28}
                          fill="rgba(255, 255, 255, 0.03)"
                        />
                      )}

                      {/* Vertical line between days */}
                      <line
                        x1={x}
                        y1="28"
                        x2={x}
                        y2={headerHeight}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray={isWeekend ? '2 2' : 'none'}
                      />

                      {/* Zoom: Days */}
                      {zoom === 'days' && (
                        <>
                          <text
                            x={x + dayWidth / 2}
                            y="44"
                            textAnchor="middle"
                            fill={isWeekend ? '#94a3b8' : '#e2e8f0'}
                            fontSize="11"
                            fontWeight="600"
                            fontFamily="monospace"
                          >
                            {dayDate.getUTCDate()}
                          </text>
                          <text
                            x={x + dayWidth / 2}
                            y="53"
                            textAnchor="middle"
                            fill={isWeekend ? '#ef4444' : '#64748b'}
                            fontSize="8"
                            fontWeight="700"
                          >
                            {getDayLetter(dayDate)}
                          </text>
                        </>
                      )}

                      {/* Zoom: Weeks */}
                      {zoom === 'weeks' && dayIdx % 7 === 0 && (
                        <text
                          x={x + 4}
                          y="48"
                          fill="#94a3b8"
                          fontSize="10"
                          fontWeight="600"
                        >
                          Sem {Math.floor(dayIdx / 7) + 1} ({dayDate.getUTCDate()} {formatDayMonth(dayDate).split(' ')[1]})
                        </text>
                      )}

                      {/* Zoom: Months */}
                      {zoom === 'months' && dayDate.getUTCDate() === 1 && (
                        <text
                          x={x + 4}
                          y="48"
                          fill="#e2e8f0"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {formatDayMonth(dayDate).split(' ')[1]}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Top tier month label */}
                <text x="12" y="18" fill="#cbd5e1" fontSize="11" fontWeight="700" letterSpacing="0.05em">
                  CRONOGRAMA • {formatFullDate(parseDateIso(baseDate)).toUpperCase()} -{' '}
                  {formatFullDate(addDaysToDate(baseDate, totalDays)).toUpperCase()}
                </text>
              </g>

              {/* ------------------------------------------------------------ */}
              {/* TIMELINE GRID & WEEKEND SHADING IN ROWS                      */}
              {/* ------------------------------------------------------------ */}
              <g id="timeline-grid">
                {/* Weekend column bands */}
                {Array.from({ length: totalDays }).map((_, dayIdx) => {
                  const dayDate = addDaysToDate(baseDate, dayIdx);
                  if (!isWeekendDay(dayDate)) return null;
                  return (
                    <rect
                      key={`weekend-${dayIdx}`}
                      x={dayIdx * dayWidth}
                      y={headerHeight}
                      width={dayWidth}
                      height={calculatedTasks.length * rowHeight}
                      fill="rgba(255, 255, 255, 0.015)"
                    />
                  );
                })}

                {/* Vertical day grid lines */}
                {Array.from({ length: totalDays }).map((_, dayIdx) => (
                  <line
                    key={`v-line-${dayIdx}`}
                    x1={dayIdx * dayWidth}
                    y1={headerHeight}
                    x2={dayIdx * dayWidth}
                    y2={headerHeight + calculatedTasks.length * rowHeight}
                    stroke="rgba(255, 255, 255, 0.04)"
                    strokeWidth="1"
                  />
                ))}

                {/* Horizontal row dividers and zebra shading */}
                {calculatedTasks.map((t, idx) => {
                  const y = headerHeight + idx * rowHeight;
                  const isSelected = t.id === selectedTaskId;

                  return (
                    <g key={`row-guide-${t.id}`}>
                      {/* Row Background / Hover */}
                      <rect
                        x="0"
                        y={y}
                        width={svgWidth}
                        height={rowHeight}
                        fill={
                          isSelected
                            ? 'rgba(244, 63, 94, 0.06)'
                            : idx % 2 === 1
                            ? 'rgba(255, 255, 255, 0.015)'
                            : 'transparent'
                        }
                        className="cursor-pointer"
                        onClick={() => setSelectedTaskId(t.id)}
                      />
                      {/* Row bottom boundary */}
                      <line
                        x1="0"
                        y1={y + rowHeight}
                        x2={svgWidth}
                        y2={y + rowHeight}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
              </g>

              {/* ------------------------------------------------------------ */}
              {/* SVG VECTOR DEPENDENCY ARROWS                                 */}
              {/* ------------------------------------------------------------ */}
              <g id="dependency-arrows">
                {calculatedTasks.map((succTask, succIdx) => {
                  return succTask.dependencies.map((dep) => {
                    const predIdx = calculatedTasks.findIndex((t) => t.id === dep.taskId);
                    if (predIdx === -1) return null;
                    const predTask = calculatedTasks[predIdx];
                    return renderDependencyArrow(predTask, succTask, predIdx, succIdx, dep);
                  });
                })}
              </g>

              {/* ------------------------------------------------------------ */}
              {/* TASK BARS, PROGRESS FILLS & MILESTONES                       */}
              {/* ------------------------------------------------------------ */}
              <g id="task-bars">
                {calculatedTasks.map((t, idx) => {
                  const isSelected = t.id === selectedTaskId;
                  const isHovered = t.id === hoveredTaskId;
                  const isMilestone = t.duration === 0;

                  const yRow = headerHeight + idx * rowHeight;
                  const barHeight = 26;
                  const barY = yRow + (rowHeight - barHeight) / 2;

                  // Dim non-critical tasks if filter is on
                  const isDimmed = highlightCriticalOnly && !t.isCritical;
                  const barOpacity = isDimmed ? 0.25 : 1;

                  // 1. MILESTONE DIAMOND (Duration = 0)
                  if (isMilestone) {
                    const cx = t.earlyStart * dayWidth;
                    const cy = yRow + rowHeight / 2;
                    const size = 11;
                    const points = `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;

                    return (
                      <g
                        key={`milestone-${t.id}`}
                        opacity={barOpacity}
                        onClick={() => setSelectedTaskId(t.id)}
                        onMouseEnter={() => setHoveredTaskId(t.id)}
                        onMouseLeave={() => setHoveredTaskId(null)}
                        className="cursor-pointer transition-transform duration-150"
                      >
                        {/* Glow and Diamond polygon */}
                        <polygon
                          points={points}
                          fill="#f59e0b"
                          stroke={isSelected ? '#ffffff' : '#fef08a'}
                          strokeWidth={isSelected ? 3 : 2}
                          filter="url(#glow-milestone)"
                        />

                        {/* Milestone Label beside diamond */}
                        <text
                          x={cx + size + 8}
                          y={cy + 4}
                          fill="#fef08a"
                          fontSize="11"
                          fontWeight="700"
                          className="drop-shadow"
                        >
                          {t.name} (Hito)
                        </text>
                      </g>
                    );
                  }

                  // 2. REGULAR TASK BAR
                  const x = t.earlyStart * dayWidth;
                  const barWidth = Math.max(t.duration * dayWidth, 8);
                  const progressWidth = Math.max(0, (barWidth * t.progress) / 100);

                  return (
                    <g
                      key={`bar-${t.id}`}
                      opacity={barOpacity}
                      onClick={() => setSelectedTaskId(t.id)}
                      onMouseEnter={() => setHoveredTaskId(t.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      className="cursor-pointer group"
                    >
                      {/* Bar Container Shadow / Border */}
                      <rect
                        x={x}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx="6"
                        fill={t.isCritical ? 'url(#grad-critical)' : 'url(#grad-normal)'}
                        stroke={
                          isSelected
                            ? '#ffffff'
                            : isHovered
                            ? '#38bdf8'
                            : t.isCritical
                            ? '#fca5a5'
                            : '#93c5fd'
                        }
                        strokeWidth={isSelected ? 2.5 : 1.2}
                        filter={t.isCritical ? 'url(#glow-critical)' : undefined}
                      />

                      {/* Percentage Progress Fill Overlay */}
                      {t.progress > 0 && (
                        <rect
                          x={x}
                          y={barY}
                          width={progressWidth}
                          height={barHeight}
                          rx="6"
                          fill="rgba(255, 255, 255, 0.28)"
                        />
                      )}

                      {/* Striped sheen pattern on progress */}
                      {t.progress > 0 && (
                        <rect
                          x={x}
                          y={barY}
                          width={progressWidth}
                          height={barHeight}
                          rx="6"
                          fill="url(#pattern-progress)"
                        />
                      )}

                      {/* Task Name & Progress Inside Bar (if wide enough) */}
                      {barWidth > 70 ? (
                        <text
                          x={x + 8}
                          y={barY + 16}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="600"
                          className="pointer-events-none drop-shadow-sm truncate"
                        >
                          {t.name} ({t.progress}%)
                        </text>
                      ) : (
                        <text
                          x={x + barWidth + 8}
                          y={barY + 16}
                          fill="#e2e8f0"
                          fontSize="10"
                          fontWeight="500"
                          className="pointer-events-none drop-shadow-sm"
                        >
                          {t.name} ({t.duration}d • {t.progress}%)
                        </text>
                      )}

                      {/* Right-side Assignee Pill */}
                      <circle
                        cx={x + barWidth + 12}
                        cy={barY + barHeight / 2}
                        r="6"
                        className={`${t.assignee.avatarColor} fill-current`}
                      />
                    </g>
                  );
                })}
              </g>

              {/* ------------------------------------------------------------ */}
              {/* CURRENT DAY VERTICAL LINE ('HOY' / TODAY)                    */}
              {/* ------------------------------------------------------------ */}
              {todayX >= 0 && todayX <= svgWidth && (
                <g id="today-marker" className="pointer-events-none">
                  {/* Vertical Red Dashed Line */}
                  <line
                    x1={todayX}
                    y1={headerHeight - 20}
                    x2={todayX}
                    y2={headerHeight + calculatedTasks.length * rowHeight}
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  {/* 'HOY' Badge in Header */}
                  <rect
                    x={todayX - 20}
                    y={headerHeight - 22}
                    width="40"
                    height="18"
                    rx="4"
                    fill="#ef4444"
                    className="shadow-lg shadow-red-500/50"
                  />
                  <text
                    x={todayX}
                    y={headerHeight - 9}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="800"
                    letterSpacing="0.05em"
                  >
                    HOY
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* BOTTOM INSPECTOR PANEL: DETAILED CPM DIAGNOSTICS FOR SELECTED TASK    */}
      {/* ==================================================================== */}
      {selectedTask && (
        <footer className="bg-obsidian-900 border-t border-obsidian-800 px-4 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                selectedTask.isCritical
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}
            >
              {selectedTask.id} • WBS {selectedTask.wbs}
            </span>
            <div>
              <p className="font-semibold text-slate-100 flex items-center space-x-2">
                <span>{selectedTask.name}</span>
                {selectedTask.isCritical && (
                  <span className="flex items-center space-x-1 text-rose-400 font-bold text-[11px] bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                    <Flame className="w-3 h-3" />
                    <span>EN RUTA CRÍTICA</span>
                  </span>
                )}
              </p>
              <p className="text-[11px] text-slate-400">
                Asignado a: <strong className="text-slate-200">{selectedTask.assignee.name}</strong> ({selectedTask.assignee.role})
              </p>
            </div>
          </div>

          {/* CPM Metrics Grid */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-obsidian-950 px-2.5 py-1 rounded border border-obsidian-800 font-mono text-[11px]">
              <span className="text-slate-400">ES:</span> <span className="text-slate-200">Día {selectedTask.earlyStart}</span>
            </div>
            <div className="bg-obsidian-950 px-2.5 py-1 rounded border border-obsidian-800 font-mono text-[11px]">
              <span className="text-slate-400">EF:</span> <span className="text-slate-200">Día {selectedTask.earlyFinish}</span>
            </div>
            <div className="bg-obsidian-950 px-2.5 py-1 rounded border border-obsidian-800 font-mono text-[11px]">
              <span className="text-slate-400">LS:</span> <span className="text-slate-200">Día {selectedTask.lateStart}</span>
            </div>
            <div className="bg-obsidian-950 px-2.5 py-1 rounded border border-obsidian-800 font-mono text-[11px]">
              <span className="text-slate-400">LF:</span> <span className="text-slate-200">Día {selectedTask.lateFinish}</span>
            </div>
            <div className="bg-obsidian-950 px-2.5 py-1 rounded border border-obsidian-800 font-mono text-[11px]">
              <span className="text-slate-400">Holgura Total (TF):</span>{' '}
              <span className={selectedTask.isCritical ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {selectedTask.totalFloat} días
              </span>
            </div>
            <div className="bg-obsidian-950 px-2.5 py-1 rounded border border-obsidian-800 font-mono text-[11px]">
              <span className="text-slate-400">Holgura Libre (FF):</span>{' '}
              <span className="text-slate-200">{selectedTask.freeFloat} días</span>
            </div>
          </div>

          {/* Quick Progress Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-[11px]">Avance:</span>
            {[0, 25, 50, 75, 100].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setTasks((prev) =>
                    prev.map((t) => (t.id === selectedTask.id ? { ...t, progress: val } : t))
                  );
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                  selectedTask.progress === val
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-obsidian-800 text-slate-300 hover:bg-obsidian-700'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </footer>
      )}

      {/* ==================================================================== */}
      {/* TASK MODAL (ADD / EDIT TASK)                                         */}
      {/* ==================================================================== */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-obsidian-800 flex items-center justify-between bg-obsidian-950">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white">
                  {editingTaskId ? `Editar Tarea: ${editingTaskId}` : 'Nueva Tarea de Proyecto'}
                </h2>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-obsidian-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTask} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Task Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre de la Tarea / Hito *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Desarrollo de Módulos de Autenticación"
                  className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Grid: WBS & Duration & Milestone */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código WBS</label>
                  <input
                    type="text"
                    value={formWbs}
                    onChange={(e) => setFormWbs(e.target.value)}
                    placeholder="1.1"
                    className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Duración (Días) {formIsMilestone && <span className="text-amber-400">(Hito = 0d)</span>}
                  </label>
                  <input
                    type="number"
                    min={0}
                    disabled={formIsMilestone}
                    value={formIsMilestone ? 0 : formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">% Progreso</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formProgress}
                    onChange={(e) => setFormProgress(Number(e.target.value))}
                    className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Checkbox: Is Milestone */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-milestone"
                  checked={formIsMilestone}
                  onChange={(e) => {
                    setFormIsMilestone(e.target.checked);
                    if (e.target.checked) setFormDuration(0);
                  }}
                  className="rounded bg-obsidian-950 border-obsidian-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="chk-milestone" className="text-slate-300 cursor-pointer flex items-center space-x-1.5">
                  <Milestone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Definir como Hito clave (Duración = 0 días, rombo en Gantt)</span>
                </label>
              </div>

              {/* Assignee Selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Recurso Asignado</label>
                <select
                  value={formAssigneeId}
                  onChange={(e) => setFormAssigneeId(e.target.value)}
                  className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                >
                  {PROJECT_RESOURCES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Predecessor Dependencies Management */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium">Predecesoras / Dependencias de Red</label>
                  <button
                    type="button"
                    onClick={() => {
                      const candidate = tasks.find((t) => t.id !== editingTaskId && !formDependencies.some((d) => d.taskId === t.id));
                      if (candidate) {
                        setFormDependencies((prev) => [...prev, { taskId: candidate.id, type: 'FS', lag: 0 }]);
                      }
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Añadir Dependencia</span>
                  </button>
                </div>

                {formDependencies.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic p-2 bg-obsidian-950 rounded-lg border border-obsidian-800">
                    Sin predecesoras. La tarea iniciará el Día 0 del proyecto.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {formDependencies.map((dep, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-obsidian-950 p-2 rounded-lg border border-obsidian-800"
                      >
                        <select
                          value={dep.taskId}
                          onChange={(e) => {
                            const newTaskId = e.target.value;
                            setFormDependencies((prev) =>
                              prev.map((d, i) => (i === index ? { ...d, taskId: newTaskId } : d))
                            );
                          }}
                          className="flex-1 bg-obsidian-900 border border-obsidian-700 rounded px-2 py-1 text-white text-xs"
                        >
                          {tasks
                            .filter((t) => t.id !== editingTaskId)
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.id} - {t.name}
                              </option>
                            ))}
                        </select>

                        <select
                          value={dep.type}
                          onChange={(e) => {
                            const newType = e.target.value as DependencyType;
                            setFormDependencies((prev) =>
                              prev.map((d, i) => (i === index ? { ...d, type: newType } : d))
                            );
                          }}
                          className="w-24 bg-obsidian-900 border border-obsidian-700 rounded px-2 py-1 text-white text-xs font-mono"
                        >
                          <option value="FS">FS (Fin-Inicio)</option>
                          <option value="SS">SS (Inicio-Inicio)</option>
                        </select>

                        <div className="flex items-center space-x-1">
                          <span className="text-slate-400 text-[10px]">Lag:</span>
                          <input
                            type="number"
                            value={dep.lag ?? 0}
                            onChange={(e) => {
                              const newLag = Number(e.target.value);
                              setFormDependencies((prev) =>
                                prev.map((d, i) => (i === index ? { ...d, lag: newLag } : d))
                              );
                            }}
                            className="w-12 bg-obsidian-900 border border-obsidian-700 rounded px-1 py-1 text-white text-xs font-mono text-center"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFormDependencies((prev) => prev.filter((_, i) => i !== index));
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Notas / Alcance Técnico</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Detalles sobre entregables y criterios de aceptación..."
                  className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg p-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-obsidian-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingTaskId ? 'Guardar Cambios' : 'Crear Tarea'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanttProjectView;
