import React, { useState, useMemo, useCallback } from 'react';
import {
  Table2,
  Filter,
  Download,
  Copy,
  PlusCircle,
  X,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Database,
  Calculator,
} from 'lucide-react';
import { useOfficeStore } from '../../store/useOfficeStore';
import { CellData } from '../../types';
import { SecuritySanitizer } from '../../core/securitySanitizer';

export type AggregationType = 'SUM' | 'AVERAGE' | 'COUNT' | 'MAX' | 'MIN';
export type FormatMode = 'currency' | 'number' | 'percent' | 'compact';

export interface PivotTableViewProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

// Demo enterprise datasets for quick exploration
const DEMO_SALES_RECORDS = [
  { Región: 'Norte', Categoría: 'Cloud Computing', Vendedor: 'Elena García', Trimestre: 'Q1', Año: '2025', Canal: 'Directo B2B', Ventas: 64200, Coste: 31000, Unidades: 45 },
  { Región: 'Norte', Categoría: 'Ciberseguridad', Vendedor: 'Elena García', Trimestre: 'Q2', Año: '2025', Canal: 'Partner', Ventas: 89400, Coste: 42000, Unidades: 32 },
  { Región: 'Norte', Categoría: 'Licencias SaaS', Vendedor: 'Elena García', Trimestre: 'Q3', Año: '2025', Canal: 'Online', Ventas: 48900, Coste: 18000, Unidades: 120 },
  { Región: 'Sur', Categoría: 'Cloud Computing', Vendedor: 'Carlos Vega', Trimestre: 'Q1', Año: '2025', Canal: 'Directo B2B', Ventas: 51200, Coste: 26000, Unidades: 38 },
  { Región: 'Sur', Categoría: 'Consultoría IA', Vendedor: 'Carlos Vega', Trimestre: 'Q2', Año: '2025', Canal: 'Partner', Ventas: 112000, Coste: 58000, Unidades: 15 },
  { Región: 'Sur', Categoría: 'Licencias SaaS', Vendedor: 'Carlos Vega', Trimestre: 'Q3', Año: '2025', Canal: 'Online', Ventas: 73500, Coste: 29000, Unidades: 180 },
  { Región: 'Este', Categoría: 'Cloud Computing', Vendedor: 'Marta Ruiz', Trimestre: 'Q1', Año: '2025', Canal: 'Directo B2B', Ventas: 78900, Coste: 37000, Unidades: 52 },
  { Región: 'Este', Categoría: 'Ciberseguridad', Vendedor: 'Marta Ruiz', Trimestre: 'Q2', Año: '2025', Canal: 'Directo B2B', Ventas: 95400, Coste: 44000, Unidades: 28 },
  { Región: 'Este', Categoría: 'Consultoría IA', Vendedor: 'Marta Ruiz', Trimestre: 'Q3', Año: '2025', Canal: 'Partner', Ventas: 134000, Coste: 67000, Unidades: 20 },
  { Región: 'Centro', Categoría: 'Cloud Computing', Vendedor: 'David Ortiz', Trimestre: 'Q1', Año: '2025', Canal: 'Directo B2B', Ventas: 88500, Coste: 41000, Unidades: 60 },
  { Región: 'Centro', Categoría: 'Licencias SaaS', Vendedor: 'David Ortiz', Trimestre: 'Q2', Año: '2025', Canal: 'Online', Ventas: 62100, Coste: 22000, Unidades: 140 },
  { Región: 'Centro', Categoría: 'Consultoría IA', Vendedor: 'David Ortiz', Trimestre: 'Q3', Año: '2025', Canal: 'Partner', Ventas: 145000, Coste: 71000, Unidades: 22 },
  { Región: 'Norte', Categoría: 'Consultoría IA', Vendedor: 'Lucía Méndez', Trimestre: 'Q4', Año: '2025', Canal: 'Directo B2B', Ventas: 98000, Coste: 49000, Unidades: 18 },
  { Región: 'Sur', Categoría: 'Ciberseguridad', Vendedor: 'Lucía Méndez', Trimestre: 'Q4', Año: '2025', Canal: 'Partner', Ventas: 84300, Coste: 39000, Unidades: 31 },
  { Región: 'Este', Categoría: 'Licencias SaaS', Vendedor: 'Lucía Méndez', Trimestre: 'Q4', Año: '2025', Canal: 'Online', Ventas: 92400, Coste: 34000, Unidades: 210 },
  { Región: 'Centro', Categoría: 'Ciberseguridad', Vendedor: 'Lucía Méndez', Trimestre: 'Q4', Año: '2025', Canal: 'Directo B2B', Ventas: 105600, Coste: 48000, Unidades: 35 },
];

export const PivotTableView: React.FC<PivotTableViewProps> = ({
  isOpen = true,
  onClose,
  isModal = true,
}) => {
  const { spreadsheets, activeSpreadsheetId, addSheetToActiveSpreadsheet } = useOfficeStore();

  const currentBook = spreadsheets.find((s) => s.id === activeSpreadsheetId) || spreadsheets[0];
  const currentSheet =
    currentBook?.sheets.find((sh) => sh.id === currentBook.activeSheetId) || currentBook?.sheets[0];

  // Parse tabular data from active sheet
  const parsedSheetData = useMemo(() => {
    if (!currentSheet || !currentSheet.cells) {
      return { headers: [], records: [] };
    }

    const cells = currentSheet.cells;
    const coords = Object.keys(cells);
    if (coords.length === 0) return { headers: [], records: [] };

    // Group cells by row and col
    const rowMap: Record<number, Record<number, string | number>> = {};
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    coords.forEach((coord) => {
      const match = coord.match(/^([A-Z]+)(\d+)$/);
      if (!match) return;
      const colStr = match[1];
      const row = parseInt(match[2], 10);

      // Convert col string (A -> 1, B -> 2)
      let col = 0;
      for (let i = 0; i < colStr.length; i++) {
        col = col * 26 + (colStr.charCodeAt(i) - 64);
      }

      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);

      if (!rowMap[row]) rowMap[row] = {};
      const val = cells[coord].computed !== undefined && cells[coord].computed !== ''
        ? cells[coord].computed
        : cells[coord].raw;
      rowMap[row][col] = val;
    });

    if (minRow === Infinity || maxRow - minRow < 1) {
      return { headers: [], records: [] };
    }

    // Header row is minRow
    const headerRow = rowMap[minRow] || {};
    const headers: { col: number; name: string }[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      const val = headerRow[c];
      if (val !== undefined && String(val).trim() !== '') {
        headers.push({ col: c, name: String(val).trim() });
      }
    }

    if (headers.length === 0) return { headers: [], records: [] };

    const records: Record<string, string | number>[] = [];
    for (let r = minRow + 1; r <= maxRow; r++) {
      const rowData = rowMap[r];
      if (!rowData) continue;

      const record: Record<string, string | number> = {};
      let hasData = false;

      headers.forEach(({ col, name }) => {
        const cellVal = rowData[col];
        if (cellVal !== undefined && cellVal !== '') {
          record[name] = cellVal;
          hasData = true;
        } else {
          record[name] = '';
        }
      });

      if (hasData) {
        records.push(record);
      }
    }

    return {
      headers: headers.map((h) => h.name),
      records,
    };
  }, [currentSheet]);

  // DataSource selection: 'sheet' | 'demo-sales'
  const [selectedDataSource, setSelectedDataSource] = useState<'sheet' | 'demo-sales'>(
    parsedSheetData.records.length >= 2 ? 'sheet' : 'demo-sales'
  );

  const activeRecords = useMemo(() => {
    if (selectedDataSource === 'sheet' && parsedSheetData.records.length > 0) {
      return parsedSheetData.records;
    }
    return DEMO_SALES_RECORDS;
  }, [selectedDataSource, parsedSheetData]);

  const availableFields = useMemo(() => {
    if (activeRecords.length === 0) return [];
    return Object.keys(activeRecords[0]);
  }, [activeRecords]);

  // Field configurations
  const [rowFields, setRowFields] = useState<string[]>(['Categoría', 'Región']);
  const [colField, setColField] = useState<string | null>('Trimestre');
  const [valField, setValField] = useState<string>('Ventas');
  const [aggType, setAggType] = useState<AggregationType>('SUM');
  const [formatMode, setFormatMode] = useState<FormatMode>('currency');

  // Slicers state: Record<field, Set<selectedValues>>
  const [activeSlicers, setActiveSlicers] = useState<Record<string, string[]>>({});
  const [enabledSlicerFields, setEnabledSlicerFields] = useState<string[]>(['Región', 'Canal']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync default fields if dataset changes
  React.useEffect(() => {
    if (availableFields.length >= 3) {
      if (!availableFields.includes(valField)) {
        // Find first numeric field
        const numericCandidate = availableFields.find((f) =>
          activeRecords.some((r) => typeof r[f] === 'number')
        );
        setValField(numericCandidate || availableFields[availableFields.length - 1]);
      }
      if (!rowFields.every((f) => availableFields.includes(f))) {
        setRowFields([availableFields[0]]);
      }
    }
  }, [availableFields]);

  // Toast auto-clear
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Distinct values for each slicer field
  const slicerOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    availableFields.forEach((field) => {
      const set = new Set<string>();
      activeRecords.forEach((r) => {
        if (r[field] !== undefined && r[field] !== null && String(r[field]).trim() !== '') {
          set.add(String(r[field]));
        }
      });
      map[field] = Array.from(set).sort();
    });
    return map;
  }, [availableFields, activeRecords]);

  // Toggle slicer value
  const handleToggleSlicerValue = (field: string, val: string) => {
    setActiveSlicers((prev) => {
      const currentSelected = prev[field] || slicerOptions[field] || [];
      const isSelected = currentSelected.includes(val);
      let updated: string[];

      if (isSelected) {
        updated = currentSelected.filter((v) => v !== val);
      } else {
        updated = [...currentSelected, val];
      }

      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const handleSelectAllSlicer = (field: string) => {
    setActiveSlicers((prev) => ({
      ...prev,
      [field]: slicerOptions[field] || [],
    }));
  };

  const handleClearSlicer = (field: string) => {
    setActiveSlicers((prev) => ({
      ...prev,
      [field]: [],
    }));
  };

  // Filter records based on active slicers
  const filteredRecords = useMemo(() => {
    return activeRecords.filter((record) => {
      for (const field of enabledSlicerFields) {
        const allowed = activeSlicers[field];
        if (allowed && allowed.length > 0) {
          const recVal = String(record[field] ?? '');
          if (!allowed.includes(recVal)) return false;
        }
      }
      return true;
    });
  }, [activeRecords, enabledSlicerFields, activeSlicers]);

  // Distinct row keys and col keys
  const { distinctRowKeys, distinctColKeys } = useMemo(() => {
    const rowKeySet = new Set<string>();
    const colKeySet = new Set<string>();

    filteredRecords.forEach((r) => {
      // Row composite key
      const rKey = rowFields.map((f) => String(r[f] ?? '(Vacío)')).join(' › ');
      if (rKey) rowKeySet.add(rKey);

      // Col key
      if (colField) {
        const cKey = String(r[colField] ?? '(Vacío)');
        colKeySet.add(cKey);
      }
    });

    const sortedRows = Array.from(rowKeySet).sort();
    const sortedCols = colField ? Array.from(colKeySet).sort() : ['Total'];

    return { distinctRowKeys: sortedRows, distinctColKeys: sortedCols };
  }, [filteredRecords, rowFields, colField]);

  // Aggregation calculation helper
  const computeAggregation = useCallback(
    (values: any[], type: AggregationType): number => {
      if (type === 'COUNT') {
        return values.filter((v) => v !== undefined && v !== null && v !== '').length;
      }

      const numeric = values
        .map((v) => (typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]+/g, ''))))
        .filter((v) => !isNaN(v));

      if (numeric.length === 0) return 0;

      switch (type) {
        case 'SUM':
          return numeric.reduce((acc, v) => acc + v, 0);
        case 'AVERAGE':
          return numeric.reduce((acc, v) => acc + v, 0) / numeric.length;
        case 'MAX':
          return Math.max(...numeric);
        case 'MIN':
          return Math.min(...numeric);
        default:
          return 0;
      }
    },
    []
  );

  // Grouped Matrix Calculations
  const { matrix, rowSubtotals, colSubtotals, grandTotal } = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {};
    const rowBuckets: Record<string, any[]> = {};
    const colBuckets: Record<string, any[]> = {};
    const allValues: any[] = [];

    // Initialize structures
    distinctRowKeys.forEach((rKey) => {
      groups[rKey] = {};
      rowBuckets[rKey] = [];
      distinctColKeys.forEach((cKey) => {
        groups[rKey][cKey] = [];
      });
    });

    distinctColKeys.forEach((cKey) => {
      colBuckets[cKey] = [];
    });

    filteredRecords.forEach((r) => {
      const rKey = rowFields.map((f) => String(r[f] ?? '(Vacío)')).join(' › ');
      const cKey = colField ? String(r[colField] ?? '(Vacío)') : 'Total';
      const rawVal = r[valField];

      if (groups[rKey] && groups[rKey][cKey]) {
        groups[rKey][cKey].push(rawVal);
      }
      if (rowBuckets[rKey]) {
        rowBuckets[rKey].push(rawVal);
      }
      if (colBuckets[cKey]) {
        colBuckets[cKey].push(rawVal);
      }
      allValues.push(rawVal);
    });

    // Compute cell aggregations
    const computedMatrix: Record<string, Record<string, number>> = {};
    distinctRowKeys.forEach((rKey) => {
      computedMatrix[rKey] = {};
      distinctColKeys.forEach((cKey) => {
        computedMatrix[rKey][cKey] = computeAggregation(groups[rKey]?.[cKey] || [], aggType);
      });
    });

    // Compute row subtotals
    const computedRowSubtotals: Record<string, number> = {};
    distinctRowKeys.forEach((rKey) => {
      computedRowSubtotals[rKey] = computeAggregation(rowBuckets[rKey] || [], aggType);
    });

    // Compute col subtotals
    const computedColSubtotals: Record<string, number> = {};
    distinctColKeys.forEach((cKey) => {
      computedColSubtotals[cKey] = computeAggregation(colBuckets[cKey] || [], aggType);
    });

    // Grand Total
    const computedGrandTotal = computeAggregation(allValues, aggType);

    return {
      matrix: computedMatrix,
      rowSubtotals: computedRowSubtotals,
      colSubtotals: computedColSubtotals,
      grandTotal: computedGrandTotal,
    };
  }, [filteredRecords, distinctRowKeys, distinctColKeys, rowFields, colField, valField, aggType, computeAggregation]);

  // Formatter helper
  const formatValue = (num: number): string => {
    if (aggType === 'COUNT') {
      return num.toLocaleString('es-ES');
    }
    switch (formatMode) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(num);
      case 'percent':
        return `${(num * 100).toFixed(1)}%`;
      case 'compact':
        return new Intl.NumberFormat('es-ES', {
          notation: 'compact',
          compactDisplay: 'short',
        }).format(num);
      case 'number':
      default:
        return num.toLocaleString('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    }
  };

  // Drag and Drop Field Assignment
  const handleDragStart = (e: React.DragEvent, field: string) => {
    e.dataTransfer.setData('text/plain', field);
  };

  const handleDropOnZone = (e: React.DragEvent, zone: 'rows' | 'cols' | 'values' | 'slicers') => {
    e.preventDefault();
    const field = e.dataTransfer.getData('text/plain');
    if (!field) return;

    if (zone === 'rows') {
      if (!rowFields.includes(field)) {
        setRowFields([...rowFields, field]);
      }
    } else if (zone === 'cols') {
      setColField(field);
    } else if (zone === 'values') {
      setValField(field);
    } else if (zone === 'slicers') {
      if (!enabledSlicerFields.includes(field)) {
        setEnabledSlicerFields([...enabledSlicerFields, field]);
      }
    }
  };

  // Insert into new sheet in spreadsheet store
  const handleInsertIntoSheet = () => {
    const sheetCells: Record<string, CellData> = {};
    const title = `Tabla Dinámica - ${valField} por ${rowFields.join(' & ')}`;

    // Row 1: Header / Title banner
    sheetCells['A1'] = {
      raw: title,
      computed: title,
      style: { bold: true, bg: '#064e3b', color: '#6ee7b7' },
    };
    sheetCells['B1'] = {
      raw: `Agregación: ${aggType}`,
      computed: `Agregación: ${aggType}`,
      style: { bold: true, bg: '#064e3b', color: '#a7f3d0', align: 'center' },
    };

    // Row 2: Column Headers
    let colIdx = 1; // A = 1
    const getColLetter = (n: number) => String.fromCharCode(64 + n);

    // Dimension header
    const rowDimHeader = rowFields.join(' / ');
    sheetCells[`${getColLetter(colIdx)}3`] = {
      raw: rowDimHeader,
      computed: rowDimHeader,
      style: { bold: true, bg: '#1e293b', color: '#f1f5f9' },
    };
    colIdx++;

    distinctColKeys.forEach((cKey) => {
      sheetCells[`${getColLetter(colIdx)}3`] = {
        raw: cKey,
        computed: cKey,
        style: { bold: true, bg: '#1e293b', color: '#f1f5f9', align: 'right' },
      };
      colIdx++;
    });

    // Row Total Header
    if (colField) {
      sheetCells[`${getColLetter(colIdx)}3`] = {
        raw: 'Total Fila',
        computed: 'Total Fila',
        style: { bold: true, bg: '#0f172a', color: '#38bdf8', align: 'right' },
      };
    }

    // Rows 4..N: Data Rows
    let currentRow = 4;
    distinctRowKeys.forEach((rKey) => {
      let currentC = 1;
      // Row label
      sheetCells[`${getColLetter(currentC)}${currentRow}`] = {
        raw: rKey,
        computed: rKey,
        style: { bold: true, color: '#e2e8f0' },
      };
      currentC++;

      distinctColKeys.forEach((cKey) => {
        const val = matrix[rKey]?.[cKey] || 0;
        sheetCells[`${getColLetter(currentC)}${currentRow}`] = {
          raw: String(val),
          computed: val,
          style: {
            align: 'right',
            format: formatMode === 'percent' ? 'percent' : 'currency',
          },
        };
        currentC++;
      });

      if (colField) {
        const rowTot = rowSubtotals[rKey] || 0;
        sheetCells[`${getColLetter(currentC)}${currentRow}`] = {
          raw: String(rowTot),
          computed: rowTot,
          style: {
            bold: true,
            align: 'right',
            color: '#38bdf8',
            format: formatMode === 'percent' ? 'percent' : 'currency',
          },
        };
      }
      currentRow++;
    });

    // Grand Total Row
    let totC = 1;
    sheetCells[`${getColLetter(totC)}${currentRow}`] = {
      raw: 'Total General',
      computed: 'Total General',
      style: { bold: true, bg: '#1e293b', color: '#10b981' },
    };
    totC++;

    distinctColKeys.forEach((cKey) => {
      const colTot = colSubtotals[cKey] || 0;
      sheetCells[`${getColLetter(totC)}${currentRow}`] = {
        raw: String(colTot),
        computed: colTot,
        style: {
          bold: true,
          align: 'right',
          bg: '#1e293b',
          color: '#10b981',
          format: formatMode === 'percent' ? 'percent' : 'currency',
        },
      };
      totC++;
    });

    if (colField) {
      sheetCells[`${getColLetter(totC)}${currentRow}`] = {
        raw: String(grandTotal),
        computed: grandTotal,
        style: {
          bold: true,
          align: 'right',
          bg: '#064e3b',
          color: '#34d399',
          format: formatMode === 'percent' ? 'percent' : 'currency',
        },
      };
    }

    const sheetName = `Pivot-${Date.now().toString().slice(-4)}`;
    addSheetToActiveSpreadsheet(sheetName, sheetCells);
    setToastMessage(`✓ Tabla Dinámica insertada como nueva hoja "${sheetName}"`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows: string[][] = [];

    // Header
    const headerRow = [
      SecuritySanitizer.sanitizeCsvExportCell(rowFields.join(' / ')),
      ...distinctColKeys.map((c) => SecuritySanitizer.sanitizeCsvExportCell(c)),
    ];
    if (colField) {
      headerRow.push(SecuritySanitizer.sanitizeCsvExportCell('Total General'));
    }
    rows.push(headerRow);

    // Data rows
    distinctRowKeys.forEach((rKey) => {
      const rRow = [SecuritySanitizer.sanitizeCsvExportCell(rKey)];
      distinctColKeys.forEach((cKey) => {
        const val = matrix[rKey]?.[cKey] || 0;
        rRow.push(SecuritySanitizer.sanitizeCsvExportCell(String(val)));
      });
      if (colField) {
        rRow.push(SecuritySanitizer.sanitizeCsvExportCell(String(rowSubtotals[rKey] || 0)));
      }
      rows.push(rRow);
    });

    // Column Subtotals
    const grandRow = [SecuritySanitizer.sanitizeCsvExportCell('Total General')];
    distinctColKeys.forEach((cKey) => {
      grandRow.push(SecuritySanitizer.sanitizeCsvExportCell(String(colSubtotals[cKey] || 0)));
    });
    if (colField) {
      grandRow.push(SecuritySanitizer.sanitizeCsvExportCell(String(grandTotal)));
    }
    rows.push(grandRow);

    const csvContent = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tabla_dinamica_${valField.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToastMessage('✓ Archivo CSV exportado con éxito');
  };

  // Copy TSV to clipboard
  const handleCopyTSV = () => {
    const rows: string[][] = [];
    const headerRow = [rowFields.join(' / '), ...distinctColKeys];
    if (colField) headerRow.push('Total Fila');
    rows.push(headerRow);

    distinctRowKeys.forEach((rKey) => {
      const rRow = [rKey];
      distinctColKeys.forEach((cKey) => {
        rRow.push(String(matrix[rKey]?.[cKey] || 0));
      });
      if (colField) rRow.push(String(rowSubtotals[rKey] || 0));
      rows.push(rRow);
    });

    const grandRow = ['Total General', ...distinctColKeys.map((c) => String(colSubtotals[c] || 0))];
    if (colField) grandRow.push(String(grandTotal));
    rows.push(grandRow);

    const tsvText = rows.map((r) => r.join('\t')).join('\n');
    navigator.clipboard.writeText(tsvText).then(() => {
      setToastMessage('✓ Matriz copiada al portapapeles (compatible con Excel)');
    });
  };

  if (!isOpen) return null;

  const content = (
    <div className="flex flex-col h-full bg-obsidian-950 text-slate-100 select-none overflow-hidden border border-obsidian-800 rounded-xl shadow-2xl">
      {/* 1. TOP HEADER BAR */}
      <header className="h-14 px-5 bg-obsidian-900/90 border-b border-obsidian-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Table2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-sm text-slate-100 tracking-wide">
                Apex Pivot Engine • Tablas Dinámicas
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                Bidimensional DAG
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Agrupación matricial multi-nivel, segmentadores en tiempo real y subtotales automáticos
            </p>
          </div>
        </div>

        {/* Data source switch & action buttons */}
        <div className="flex items-center space-x-2.5">
          {/* Data source pills */}
          <div className="flex items-center bg-obsidian-950 p-1 rounded-lg border border-obsidian-800 text-xs">
            <button
              onClick={() => setSelectedDataSource('sheet')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors ${
                selectedDataSource === 'sheet'
                  ? 'bg-emerald-600/30 text-emerald-300 font-medium border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Analizar datos tabulados de la hoja activa"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Hoja Activa ({parsedSheetData.records.length} filas)</span>
            </button>
            <button
              onClick={() => setSelectedDataSource('demo-sales')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded transition-colors ${
                selectedDataSource === 'demo-sales'
                  ? 'bg-emerald-600/30 text-emerald-300 font-medium border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dataset multidimensional de prueba con 6 dimensiones"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Dataset Demo Ventas</span>
            </button>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleCopyTSV}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 border border-obsidian-700 text-xs transition-colors"
            title="Copiar matriz para pegar en hojas de cálculo"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span>Copiar</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 border border-obsidian-700 text-xs transition-colors"
            title="Descargar matriz en formato CSV sanitizado"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleInsertIntoSheet}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition-all"
            title="Generar nueva pestaña de hoja con esta matriz calculada"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Insertar en Hoja</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-obsidian-800 transition-colors ml-2"
              title="Cerrar panel de tabla dinámica"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 text-xs px-4 py-2 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. MAIN WORKSPACE: FIELD CONFIGURATION & MATRIX DISPLAY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT CONFIGURATION DOCK */}
        <aside className="w-72 bg-obsidian-900 border-r border-obsidian-800 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3.5 border-b border-obsidian-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campos Disponibles</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {availableFields.length} campos
            </span>
          </div>

          {/* List of draggable fields */}
          <div className="p-3 space-y-1.5">
            <p className="text-[11px] text-slate-400 mb-2">
              Arrastra o haz clic en los campos para asignarlos a Filas, Columnas o Valores:
            </p>
            {availableFields.map((field) => {
              const isRow = rowFields.includes(field);
              const isCol = colField === field;
              const isVal = valField === field;

              return (
                <div
                  key={field}
                  draggable
                  onDragStart={(e) => handleDragStart(e, field)}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-grab active:cursor-grabbing transition-all ${
                    isVal
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-medium'
                      : isRow || isCol
                      ? 'bg-blue-950/30 border-blue-500/40 text-blue-200'
                      : 'bg-obsidian-950/60 border-obsidian-800 text-slate-300 hover:border-obsidian-700 hover:bg-obsidian-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span className="font-mono truncate">{field}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        if (isRow) {
                          setRowFields(rowFields.filter((f) => f !== field));
                        } else {
                          setRowFields([...rowFields, field]);
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                        isRow
                          ? 'bg-blue-600 text-white'
                          : 'bg-obsidian-800 hover:bg-obsidian-750 text-slate-400'
                      }`}
                      title="Asignar como dimensión de Fila"
                    >
                      Fila
                    </button>
                    <button
                      onClick={() => setColField(isCol ? null : field)}
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                        isCol
                          ? 'bg-indigo-600 text-white'
                          : 'bg-obsidian-800 hover:bg-obsidian-750 text-slate-400'
                      }`}
                      title="Asignar como dimensión de Columna"
                    >
                      Col
                    </button>
                    <button
                      onClick={() => setValField(field)}
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                        isVal
                          ? 'bg-emerald-600 text-white'
                          : 'bg-obsidian-800 hover:bg-obsidian-750 text-slate-400'
                      }`}
                      title="Asignar como campo de Valor numérico"
                    >
                      Val
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DROP / CONFIGURATION ZONES */}
          <div className="p-3 border-t border-obsidian-800 space-y-3">
            {/* Zone 1: Filas (Row dimensions) */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnZone(e, 'rows')}
              className="p-2.5 rounded-lg bg-obsidian-950/80 border border-obsidian-800 hover:border-blue-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wide">
                  1. Dimensiones de Fila
                </span>
                <span className="text-[10px] text-slate-400">({rowFields.length})</span>
              </div>
              <div className="space-y-1">
                {rowFields.map((field, idx) => (
                  <div
                    key={field}
                    className="flex items-center justify-between bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs px-2 py-1 rounded"
                  >
                    <span className="truncate">{idx + 1}. {field}</span>
                    <button
                      onClick={() => setRowFields(rowFields.filter((f) => f !== field))}
                      className="text-slate-400 hover:text-white"
                      title="Eliminar de filas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {rowFields.length === 0 && (
                  <div className="text-[11px] text-slate-500 text-center py-2 border border-dashed border-obsidian-800 rounded">
                    Arrastra aquí dimensiones de fila
                  </div>
                )}
              </div>
            </div>

            {/* Zone 2: Columnas (Column dimension) */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnZone(e, 'cols')}
              className="p-2.5 rounded-lg bg-obsidian-950/80 border border-obsidian-800 hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wide">
                  2. Dimensión de Columna
                </span>
                {colField && (
                  <button
                    onClick={() => setColField(null)}
                    className="text-[10px] text-slate-400 hover:text-rose-400"
                  >
                    Quitar
                  </button>
                )}
              </div>
              {colField ? (
                <div className="flex items-center justify-between bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs px-2 py-1 rounded">
                  <span className="truncate">{colField}</span>
                  <button onClick={() => setColField(null)} className="text-slate-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 text-center py-2 border border-dashed border-obsidian-800 rounded">
                  Opcional: Arrastra campo columna
                </div>
              )}
            </div>

            {/* Zone 3: Valor y Agregación */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnZone(e, 'values')}
              className="p-2.5 rounded-lg bg-obsidian-950/80 border border-obsidian-800 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                  3. Valores & Agregación
                </span>
                <Calculator className="w-3 h-3 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs px-2 py-1 rounded">
                  <span className="font-mono font-medium truncate">{valField}</span>
                </div>

                <div className="grid grid-cols-5 gap-1 pt-1">
                  {(['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN'] as AggregationType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAggType(type)}
                      className={`text-[10px] py-1 rounded font-mono font-semibold transition-colors ${
                        aggType === type
                          ? 'bg-emerald-600 text-white'
                          : 'bg-obsidian-850 hover:bg-obsidian-800 text-slate-400'
                      }`}
                      title={`Calcular ${type}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Zone 4: Segmentadores Activos */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnZone(e, 'slicers')}
              className="p-2.5 rounded-lg bg-obsidian-950/80 border border-obsidian-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wide">
                  4. Segmentadores (Slicers)
                </span>
                <Filter className="w-3 h-3 text-amber-400" />
              </div>
              <div className="flex flex-wrap gap-1">
                {availableFields.map((f) => {
                  const active = enabledSlicerFields.includes(f);
                  return (
                    <button
                      key={f}
                      onClick={() => {
                        if (active) {
                          setEnabledSlicerFields(enabledSlicerFields.filter((x) => x !== f));
                        } else {
                          setEnabledSlicerFields([...enabledSlicerFields, f]);
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        active
                          ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                          : 'bg-obsidian-850 text-slate-400 hover:text-slate-200 border border-obsidian-750'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT CENTRAL WORKSPACE: SLICERS & PIVOT MATRIX */}
        <main className="flex-1 flex flex-col overflow-hidden bg-obsidian-950">
          {/* SLICERS BAR (Segmentadores interactivos) */}
          {enabledSlicerFields.length > 0 && (
            <div className="p-3 bg-obsidian-900/60 border-b border-obsidian-800 flex flex-wrap gap-4 items-start shrink-0">
              {enabledSlicerFields.map((field) => {
                const options = slicerOptions[field] || [];
                const currentSelected = activeSlicers[field] || options;

                return (
                  <div
                    key={field}
                    className="bg-obsidian-950 p-2.5 rounded-lg border border-obsidian-800 flex flex-col space-y-1.5 shadow-sm max-w-sm"
                  >
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
                        <Filter className="w-3 h-3 text-amber-400" />
                        <span>{field}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                        <button
                          onClick={() => handleSelectAllSlicer(field)}
                          className="hover:text-emerald-400 underline decoration-dotted"
                        >
                          Todos
                        </button>
                        <span>|</span>
                        <button
                          onClick={() => handleClearSlicer(field)}
                          className="hover:text-rose-400 underline decoration-dotted"
                        >
                          Limpiar
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                      {options.map((opt) => {
                        const isSelected = currentSelected.includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => handleToggleSlicerValue(field, opt)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 font-medium'
                                : 'bg-obsidian-900 text-slate-500 border border-obsidian-800 hover:text-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MATRIX TOOLBAR (Formatters & Metrics) */}
          <div className="h-10 px-4 bg-obsidian-900/40 border-b border-obsidian-800 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center space-x-3 text-slate-400">
              <span className="flex items-center space-x-1 text-slate-300 font-medium">
                <span>Métrica:</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {aggType}({valField})
                </span>
              </span>
              <span>•</span>
              <span>Registros filtrados: <strong className="text-slate-200 font-mono">{filteredRecords.length}</strong></span>
              <span>•</span>
              <span>Filas resultantes: <strong className="text-slate-200 font-mono">{distinctRowKeys.length}</strong></span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[11px]">Formato:</span>
              <div className="flex items-center bg-obsidian-950 p-0.5 rounded border border-obsidian-800 text-[11px]">
                <button
                  onClick={() => setFormatMode('currency')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    formatMode === 'currency' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
                  }`}
                  title="Formato Moneda (€)"
                >
                  €
                </button>
                <button
                  onClick={() => setFormatMode('number')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    formatMode === 'number' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
                  }`}
                  title="Formato Decimal 0.00"
                >
                  0.00
                </button>
                <button
                  onClick={() => setFormatMode('compact')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    formatMode === 'compact' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
                  }`}
                  title="Formato Compacto (k, M)"
                >
                  10k
                </button>
                <button
                  onClick={() => setFormatMode('percent')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    formatMode === 'percent' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
                  }`}
                  title="Formato Porcentaje (%)"
                >
                  %
                </button>
              </div>
            </div>
          </div>

          {/* MATRIX SCROLLABLE TABLE */}
          <div className="flex-1 overflow-auto relative">
            {distinctRowKeys.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Filter className="w-10 h-10 text-slate-600 animate-pulse" />
                <p className="text-sm">Ningún dato coincide con los filtros y segmentadores activos.</p>
                <button
                  onClick={() => setActiveSlicers({})}
                  className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-slate-200 border border-obsidian-700 text-xs"
                >
                  Restablecer todos los segmentadores
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse font-sans text-xs">
                <thead>
                  <tr className="sticky top-0 z-20 bg-obsidian-900 border-b border-obsidian-800 shadow-md">
                    {/* Top-Left Header: Row Dimensions */}
                    <th className="sticky left-0 z-30 bg-obsidian-900 p-2.5 text-left font-semibold text-slate-200 border-r border-obsidian-800 min-w-[200px]">
                      <div className="flex items-center space-x-1.5 text-blue-300 font-mono">
                        <span>{rowFields.join(' › ')}</span>
                      </div>
                    </th>

                    {/* Column Headers */}
                    {distinctColKeys.map((cKey) => (
                      <th
                        key={cKey}
                        className="p-2.5 text-right font-semibold text-indigo-300 border-r border-obsidian-800 font-mono min-w-[120px] bg-obsidian-900"
                      >
                        {cKey}
                      </th>
                    ))}

                    {/* Row Subtotal Header */}
                    {colField && (
                      <th className="p-2.5 text-right font-bold text-sky-400 border-r border-obsidian-800 font-mono min-w-[130px] bg-obsidian-850">
                        Total General
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-obsidian-850">
                  {distinctRowKeys.map((rKey, rowIdx) => {
                    const rowTot = rowSubtotals[rKey] || 0;
                    const isEven = rowIdx % 2 === 0;

                    return (
                      <tr
                        key={rKey}
                        className={`hover:bg-emerald-950/20 transition-colors ${
                          isEven ? 'bg-obsidian-950' : 'bg-obsidian-900/40'
                        }`}
                      >
                        {/* Sticky Row Dimension Header */}
                        <td className="sticky left-0 z-10 p-2.5 font-medium text-slate-200 border-r border-obsidian-800 font-mono bg-inherit">
                          {rKey}
                        </td>

                        {/* Cell Values across columns */}
                        {distinctColKeys.map((cKey) => {
                          const val = matrix[rKey]?.[cKey] || 0;
                          return (
                            <td
                              key={cKey}
                              className="p-2.5 text-right font-mono text-slate-300 border-r border-obsidian-850 hover:text-white"
                            >
                              {val !== 0 ? formatValue(val) : <span className="text-slate-600">-</span>}
                            </td>
                          );
                        })}

                        {/* Row Subtotal */}
                        {colField && (
                          <td className="p-2.5 text-right font-mono font-semibold text-sky-300 bg-obsidian-900/60 border-r border-obsidian-800">
                            {formatValue(rowTot)}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>

                {/* GRAND TOTAL / COLUMN SUBTOTALS FOOTER */}
                <tfoot>
                  <tr className="sticky bottom-0 z-20 bg-obsidian-900 border-t-2 border-obsidian-750 font-semibold shadow-inner">
                    <td className="sticky left-0 z-30 bg-obsidian-900 p-2.5 text-left font-bold text-emerald-400 font-mono border-r border-obsidian-800">
                      Total General
                    </td>

                    {distinctColKeys.map((cKey) => {
                      const colTot = colSubtotals[cKey] || 0;
                      return (
                        <td
                          key={cKey}
                          className="p-2.5 text-right font-mono font-bold text-emerald-400 border-r border-obsidian-800"
                        >
                          {formatValue(colTot)}
                        </td>
                      );
                    })}

                    {colField && (
                      <td className="p-2.5 text-right font-mono font-extrabold text-emerald-300 bg-emerald-950/50 border-r border-emerald-500/40 ring-1 ring-emerald-500/30">
                        {formatValue(grandTotal)}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-7xl h-[90vh]">{content}</div>
    </div>
  );
};

export default PivotTableView;
