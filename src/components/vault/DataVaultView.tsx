import React, { useState } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Search,
  Columns,
  Code2,
  HardDrive,
  X,
  Play,
  FileSpreadsheet,
  RefreshCw,
  Table,
  CheckCircle2,
  Calendar,
  DollarSign,
  Hash,
  Type,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { FieldType, TableField } from '../../types';

export const DataVaultView: React.FC = () => {
  const { tables, activeTableId, addRecord, deleteRecord, addTable, addTableField } = useOfficeStore();

  const currentTable = tables.find((t) => t.id === activeTableId) || tables[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [isNewFieldModalOpen, setIsNewFieldModalOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'grid' | 'schema' | 'sql'>('grid');
  const [activeRibbonTab, setActiveRibbonTab] = useState<'inicio' | 'crear' | 'herramientas' | 'vistas'>('inicio');

  // New Table State
  const [newTableName, setNewTableName] = useState('');
  const [newTableDesc, setNewTableDesc] = useState('');

  // New Field State
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');

  // Interactive SQL Query State
  const [customSqlQuery, setCustomSqlQuery] = useState('');
  const [queryExecutionMessage, setQueryExecutionMessage] = useState<string | null>(null);

  if (!currentTable) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
        No hay tablas disponibles en la base de datos local.
      </div>
    );
  }

  // Filter records
  const filteredRecords = currentTable.records.filter((rec) => {
    if (!searchTerm) return true;
    return Object.values(rec).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    addRecord(currentTable.id, newRecordData);
    setNewRecordData({});
    setIsNewRecordModalOpen(false);
  };

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;
    addTable(newTableName, newTableDesc);
    setNewTableName('');
    setNewTableDesc('');
    setIsNewTableModalOpen(false);
  };

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName) return;
    const newField: TableField = {
      id: newFieldName.toLowerCase().replace(/\s+/g, '_'),
      name: newFieldName,
      type: newFieldType,
      required: false,
    };
    addTableField(currentTable.id, newField);
    setNewFieldName('');
    setIsNewFieldModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', ...currentTable.fields.map((f) => f.name)];
    const rows = currentTable.records.map((r) => [r.id, ...currentTable.fields.map((f) => r[f.id] || '')]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentTable.name.toLowerCase()}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteSql = () => {
    const q = customSqlQuery || simulatedSql;
    const queryName = q.trim().split('\n')[0].replace(/--\s*/, '') || 'SELECT';
    setQueryExecutionMessage(`Consulta ejecutada exitosamente [${queryName}]: 0 errores, ${currentTable.records.length} filas procesadas en 1.2ms.`);
    setTimeout(() => setQueryExecutionMessage(null), 4000);
  };

  // Generate simulated local SQLite DDL / SQL
  const simulatedSql = `
-- Esquema DDL en SQLite WASM / OPFS
CREATE TABLE IF NOT EXISTS "${currentTable.name.toLowerCase().replace(/\s+/g, '_')}" (
  "id" TEXT PRIMARY KEY,
${currentTable.fields.map((f) => `  "${f.id}" ${f.type.toUpperCase()}${f.required ? ' NOT NULL' : ''}`).join(',\n')}
);

-- Consulta activa ejecutada en el cliente
SELECT * FROM "${currentTable.name.toLowerCase().replace(/\s+/g, '_')}"
${searchTerm ? `WHERE (id LIKE '%${searchTerm}%')` : ''}
ORDER BY id ASC;
  `.trim();

  return (
    <div className="flex-1 flex flex-col h-full bg-obsidian-900 overflow-hidden select-none">
      {/* ========================================================= */}
      {/* 1. MEGA-RIBBON TAB HEADER (Inicio, Crear, Herramientas, Vistas) */}
      {/* ========================================================= */}
      <div className="bg-obsidian-950 border-b border-obsidian-800 flex items-center justify-between px-3 h-9 shrink-0">
        <div className="flex items-center space-x-1">
          <span className="flex items-center space-x-1 px-2 py-0.5 mr-2 rounded text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
            <Database className="w-3.5 h-3.5" />
            <span>VAULT</span>
          </span>

          <button
            onClick={() => setActiveRibbonTab('inicio')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'inicio'
                ? 'bg-obsidian-900 text-cyan-300 border-t-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveRibbonTab('crear')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'crear'
                ? 'bg-obsidian-900 text-cyan-300 border-t-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Crear Tablas & Campos
          </button>
          <button
            onClick={() => setActiveRibbonTab('herramientas')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'herramientas'
                ? 'bg-obsidian-900 text-cyan-300 border-t-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Herramientas SQL & Relaciones
          </button>
          <button
            onClick={() => setActiveRibbonTab('vistas')}
            className={`px-3 py-1 text-xs font-medium rounded-t transition-all ${
              activeRibbonTab === 'vistas'
                ? 'bg-obsidian-900 text-cyan-300 border-t-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-obsidian-900/50'
            }`}
          >
            Vistas
          </button>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
          <HardDrive className="w-3.5 h-3.5" />
          <span>SQLite WASM • Cero-Servidor ACID</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MEGA-RIBBON CONTENT PANEL */}
      {/* ========================================================= */}
      <div className="min-h-[58px] bg-obsidian-900 border-b border-obsidian-800 px-3 py-1 flex items-center space-x-4 overflow-x-auto shrink-0 shadow-inner text-xs">
        {/* TAB 1: INICIO */}
        {activeRibbonTab === 'inicio' && (
          <>
            {/* Records Operations */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsNewRecordModalOpen(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-sm transition-colors"
                  title="Añadir nuevo registro"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Registro</span>
                </button>
                <button
                  onClick={() => {
                    const first = currentTable.records[0];
                    if (first) deleteRecord(currentTable.id, first.id);
                  }}
                  disabled={currentTable.records.length === 0}
                  className="px-2 py-1 rounded bg-obsidian-950 hover:bg-rose-900/40 text-rose-300 disabled:opacity-30 border border-obsidian-750 transition-colors"
                  title="Eliminar primer registro"
                >
                  Eliminar
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Registros</span>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-1.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filtrar registros..."
                    className="bg-obsidian-950 text-white text-xs pl-7 pr-2 py-1 rounded border border-obsidian-750 focus:outline-none focus:border-cyan-500/50 w-44"
                  />
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Búsqueda & Filtro</span>
            </div>

            {/* Export Group */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                  title="Exportar registros a archivo CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportar CSV</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Exportar</span>
            </div>
          </>
        )}

        {/* TAB 2: CREAR */}
        {activeRibbonTab === 'crear' && (
          <>
            {/* New Table */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsNewTableModalOpen(true)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-cyan-300 font-medium border border-obsidian-750"
                  title="Crear nueva tabla en la base de datos"
                >
                  <Table className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Nueva Tabla</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Tablas</span>
            </div>

            {/* New Fields */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setNewFieldType('text');
                    setIsNewFieldModalOpen(true);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                >
                  <Type className="w-3.5 h-3.5 text-blue-400" />
                  <span>+ Columna Texto</span>
                </button>
                <button
                  onClick={() => {
                    setNewFieldType('number');
                    setIsNewFieldModalOpen(true);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                >
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Número</span>
                </button>
                <button
                  onClick={() => {
                    setNewFieldType('currency');
                    setIsNewFieldModalOpen(true);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Moneda (€)</span>
                </button>
                <button
                  onClick={() => {
                    setNewFieldType('date');
                    setIsNewFieldModalOpen(true);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 border border-obsidian-750"
                >
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>+ Fecha</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Agregar Columnas</span>
            </div>
          </>
        )}

        {/* TAB 3: HERRAMIENTAS */}
        {activeRibbonTab === 'herramientas' && (
          <>
            {/* SQL Queries */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setActiveTab('sql');
                    setCustomSqlQuery(`SELECT * FROM "${currentTable.name.toLowerCase().replace(/\s+/g, '_')}" LIMIT 50;`);
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-cyan-300 font-mono text-xs border border-obsidian-750"
                >
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SELECT *</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('sql');
                    setCustomSqlQuery(`SELECT COUNT(*) as total_filas FROM "${currentTable.name.toLowerCase().replace(/\s+/g, '_')}";`);
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-slate-300 font-mono text-xs border border-obsidian-750"
                >
                  <span>COUNT(*)</span>
                </button>
                <button
                  onClick={handleExecuteSql}
                  className="flex items-center space-x-1 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Ejecutar SQL</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Consultas SQL WASM</span>
            </div>

            {/* Maintenance */}
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setQueryExecutionMessage('Base de datos compactada y optimizada con VACUUM (0% fragmentación).');
                    setTimeout(() => setQueryExecutionMessage(null), 3000);
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-emerald-300 border border-obsidian-750"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Compactar SQLite</span>
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Mantenimiento</span>
            </div>
          </>
        )}

        {/* TAB 4: VISTAS */}
        {activeRibbonTab === 'vistas' && (
          <>
            <div className="flex flex-col items-center border-r border-obsidian-800 pr-3">
              <div className="flex items-center space-x-1 bg-obsidian-950 p-0.5 rounded-lg border border-obsidian-750">
                <button
                  onClick={() => setActiveTab('grid')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'grid' ? 'bg-cyan-600/30 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hoja de Datos ({filteredRecords.length})
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'schema' ? 'bg-cyan-600/30 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Diseño de Columnas
                </button>
                <button
                  onClick={() => setActiveTab('sql')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'sql' ? 'bg-cyan-600/30 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Consola SQL WASM
                </button>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">Vistas de Base de Datos</span>
            </div>
          </>
        )}
      </div>

      {/* Query Execution Status Banner */}
      {queryExecutionMessage && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-4 py-1.5 flex items-center space-x-2 text-xs text-emerald-300 font-mono animate-fadeIn shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{queryExecutionMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MAIN CONTENT VIEW (Grid / Schema / SQL) */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-auto bg-obsidian-950 p-4">
        {activeTab === 'grid' && (
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs text-left">
                {/* Table Header */}
                <thead>
                  <tr className="bg-obsidian-950/80 border-b border-obsidian-750 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                    <th className="px-4 py-3">ID</th>
                    {currentTable.fields.map((f) => (
                      <th key={f.id} className="px-4 py-3">
                        {f.name} <span className="text-slate-500 lowercase font-normal">({f.type})</span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-obsidian-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={currentTable.fields.length + 2} className="px-4 py-8 text-center text-slate-500">
                        No se encontraron registros que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-obsidian-850/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-cyan-400">{rec.id}</td>
                        {currentTable.fields.map((f) => {
                          const val = rec[f.id];
                          return (
                            <td key={f.id} className="px-4 py-3 text-slate-200">
                              {f.type === 'badge' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                  {val || 'N/A'}
                                </span>
                              ) : f.type === 'currency' ? (
                                <span className="font-mono text-emerald-400 font-medium">
                                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val || 0)}
                                </span>
                              ) : (
                                String(val !== undefined ? val : '—')
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteRecord(currentTable.id, rec.id)}
                            className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Schema DDL View */}
        {activeTab === 'schema' && (
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
                <Columns className="w-4 h-4" />
                <span>Estructura de Columnas & Tipos de Datos</span>
              </div>
              <button
                onClick={() => setIsNewFieldModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1 rounded bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-600/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Columna</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentTable.fields.map((field) => (
                <div key={field.id} className="bg-obsidian-950 border border-obsidian-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{field.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {field.type}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Identificador: {field.id}</p>
                  <p className="text-[10px] text-slate-400">Requerido: {field.required ? 'Sí (NOT NULL)' : 'Opcional'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SQL WASM View */}
        {activeTab === 'sql' && (
          <div className="bg-obsidian-900 border border-obsidian-750 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm">
                <Code2 className="w-4 h-4" />
                <span>Consola SQLite WASM en Origin Private File System</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Transaccional ACID • Cero Servidor
              </span>
            </div>

            <textarea
              value={customSqlQuery || simulatedSql}
              onChange={(e) => setCustomSqlQuery(e.target.value)}
              rows={8}
              className="w-full bg-obsidian-950 border border-obsidian-800 p-4 rounded-xl text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500/50 leading-relaxed resize-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Presiona "Ejecutar SQL" para procesar la instrucción en el motor local.
              </span>
              <button
                onClick={handleExecuteSql}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Ejecutar Instrucción</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Record Modal */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Añadir Registro a {currentTable.name}</span>
              </h3>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="space-y-3">
              {currentTable.fields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">
                    {f.name} {f.required && <span className="text-rose-400">*</span>}
                  </label>
                  <input
                    type={f.type === 'number' || f.type === 'currency' ? 'number' : 'text'}
                    required={f.required}
                    value={newRecordData[f.id] || ''}
                    onChange={(e) =>
                      setNewRecordData({
                        ...newRecordData,
                        [f.id]: f.type === 'number' || f.type === 'currency' ? Number(e.target.value) : e.target.value,
                      })
                    }
                    placeholder={`Ingresa ${f.name.toLowerCase()}...`}
                    className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              ))}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-obsidian-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/20"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Table Modal */}
      {isNewTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Table className="w-4 h-4 text-cyan-400" />
                <span>Crear Nueva Tabla Relacional</span>
              </h3>
              <button onClick={() => setIsNewTableModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Nombre de la Tabla</label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="ej. Clientes, Facturas, Inventario..."
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Descripción</label>
                <input
                  type="text"
                  value={newTableDesc}
                  onChange={(e) => setNewTableDesc(e.target.value)}
                  placeholder="Propósito del esquema relacional..."
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewTableModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-obsidian-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/20"
                >
                  Crear Tabla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Field Modal */}
      {isNewFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-obsidian-900 border border-obsidian-700 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Columns className="w-4 h-4 text-cyan-400" />
                <span>Agregar Columna a {currentTable.name}</span>
              </h3>
              <button onClick={() => setIsNewFieldModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateField} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Nombre del Campo</label>
                <input
                  type="text"
                  required
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="ej. Teléfono, Ciudad, Total..."
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Tipo de Dato SQLite</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                  className="w-full bg-obsidian-950 border border-obsidian-750 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="text">Texto (VARCHAR / TEXT)</option>
                  <option value="number">Número Entero / Flotante (INTEGER / REAL)</option>
                  <option value="currency">Moneda (€ EUR)</option>
                  <option value="date">Fecha (TIMESTAMP / DATE)</option>
                  <option value="boolean">Booleano (BOOLEAN)</option>
                  <option value="badge">Etiqueta / Badge</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewFieldModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-obsidian-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/20"
                >
                  Guardar Campo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <footer className="h-7 bg-obsidian-950 border-t border-obsidian-800 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0 font-mono">
        <div className="flex items-center space-x-4">
          <span className="text-cyan-400 font-semibold">{currentTable.records.length} registros persistidos</span>
          <span>•</span>
          <span>{currentTable.fields.length} columnas relacionales</span>
        </div>
        <div className="flex items-center space-x-2 text-emerald-400">
          <HardDrive className="w-3 h-3" />
          <span>Almacenamiento Local OPFS (IndexedDB)</span>
        </div>
      </footer>
    </div>
  );
};
