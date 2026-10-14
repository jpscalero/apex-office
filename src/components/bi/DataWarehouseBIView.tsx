import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Database,
  Cpu,
  Play,
  RefreshCw,
  Plus,
  Download,
  Layers,
  Table as TableIcon,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Code2,
  Search,
  FileSpreadsheet,
  Sparkles,
  GitBranch,
  FileDown,
  X,
  Activity,
  Check,
  Zap,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================
export type BIRegion = 'EMEA' | 'AMER' | 'APAC' | 'LATAM';
export type BIChannel = 'Enterprise Direct' | 'SaaS Self-Serve' | 'Partners/Resellers' | 'Gov/Public';
export type BIQuarter = 'Q1-25' | 'Q2-25' | 'Q3-25' | 'Q4-25' | 'Q1-26' | 'Q2-26' | 'Q3-26' | 'Q4-26';

export interface BISaleRecord {
  id: string;
  quarter: BIQuarter;
  region: BIRegion;
  channel: BIChannel;
  product: string;
  category: string;
  units: number;
  revenue: number;
  cost: number;
  clientCount: number;
  p99LatencyMs: number;
}

export interface DAXMeasure {
  id: string;
  name: string;
  expression: string;
  category: string;
  returnType: 'Currency' | 'Percentage' | 'Count' | 'Duration';
  description: string;
  computedValue: string;
  status: 'valid' | 'warning' | 'error';
}

export interface ETLNode {
  id: string;
  title: string;
  subtitle: string;
  category: 'extract' | 'clean' | 'aggregate' | 'load';
  throughput: string;
  status: 'idle' | 'running' | 'success' | 'error';
  latency: string;
  details: string;
  inputs: string[];
  outputs: string[];
}

export interface CustomWidget {
  id: string;
  title: string;
  type: 'kpi' | 'bar' | 'donut' | 'table';
  dimension: string;
  measure: string;
}

// ==========================================
// RAW REPOSITORY DATA (Simulating OLAP Warehouse)
// ==========================================
const RAW_SALES_DATA: BISaleRecord[] = [
  // Q1-25
  { id: '1', quarter: 'Q1-25', region: 'EMEA', channel: 'Enterprise Direct', product: 'Apex Enterprise Cloud', category: 'Cloud OLAP', units: 140, revenue: 420000, cost: 260000, clientCount: 1400, p99LatencyMs: 10.4 },
  { id: '2', quarter: 'Q1-25', region: 'AMER', channel: 'SaaS Self-Serve', product: 'Apex AI Copilot Engine', category: 'AI Tools', units: 310, revenue: 380000, cost: 220000, clientCount: 2200, p99LatencyMs: 11.2 },
  { id: '3', quarter: 'Q1-25', region: 'APAC', channel: 'Partners/Resellers', product: 'Apex Data Lakehouse', category: 'Storage', units: 95, revenue: 210000, cost: 135000, clientCount: 950, p99LatencyMs: 9.8 },
  { id: '4', quarter: 'Q1-25', region: 'LATAM', channel: 'Gov/Public', product: 'Apex Security Sentinel', category: 'Security', units: 60, revenue: 140000, cost: 98000, clientCount: 420, p99LatencyMs: 12.1 },

  // Q2-25
  { id: '5', quarter: 'Q2-25', region: 'EMEA', channel: 'SaaS Self-Serve', product: 'Apex AI Copilot Engine', category: 'AI Tools', units: 360, revenue: 450000, cost: 265000, clientCount: 2700, p99LatencyMs: 11.0 },
  { id: '6', quarter: 'Q2-25', region: 'AMER', channel: 'Enterprise Direct', product: 'Apex Enterprise Cloud', category: 'Cloud OLAP', units: 210, revenue: 630000, cost: 380000, clientCount: 1900, p99LatencyMs: 10.8 },
  { id: '7', quarter: 'Q2-25', region: 'APAC', channel: 'Gov/Public', product: 'Apex Security Sentinel', category: 'Security', units: 85, revenue: 195000, cost: 130000, clientCount: 610, p99LatencyMs: 11.5 },
  { id: '8', quarter: 'Q2-25', region: 'LATAM', channel: 'Partners/Resellers', product: 'Apex Data Lakehouse', category: 'Storage', units: 75, revenue: 165000, cost: 110000, clientCount: 520, p99LatencyMs: 10.1 },

  // Q3-25
  { id: '9', quarter: 'Q3-25', region: 'EMEA', channel: 'Enterprise Direct', product: 'Apex Developer SDK', category: 'Dev Tools', units: 190, revenue: 310000, cost: 180000, clientCount: 1600, p99LatencyMs: 9.9 },
  { id: '10', quarter: 'Q3-25', region: 'AMER', channel: 'Partners/Resellers', product: 'Apex Enterprise Cloud', category: 'Cloud OLAP', units: 175, revenue: 520000, cost: 315000, clientCount: 1450, p99LatencyMs: 10.5 },
  { id: '11', quarter: 'Q3-25', region: 'APAC', channel: 'SaaS Self-Serve', product: 'Apex AI Copilot Engine', category: 'AI Tools', units: 240, revenue: 320000, cost: 190000, clientCount: 1800, p99LatencyMs: 12.4 },
  { id: '12', quarter: 'Q3-25', region: 'LATAM', channel: 'Enterprise Direct', product: 'Apex Security Sentinel', category: 'Security', units: 70, revenue: 175000, cost: 115000, clientCount: 480, p99LatencyMs: 11.8 },

  // Q4-25
  { id: '13', quarter: 'Q4-25', region: 'EMEA', channel: 'Gov/Public', product: 'Apex Enterprise Cloud', category: 'Cloud OLAP', units: 160, revenue: 490000, cost: 300000, clientCount: 1200, p99LatencyMs: 10.2 },
  { id: '14', quarter: 'Q4-25', region: 'AMER', channel: 'Enterprise Direct', product: 'Apex Security Sentinel', category: 'Security', units: 230, revenue: 580000, cost: 350000, clientCount: 1750, p99LatencyMs: 11.0 },
  { id: '15', quarter: 'Q4-25', region: 'APAC', channel: 'Enterprise Direct', product: 'Apex Developer SDK', category: 'Dev Tools', units: 140, revenue: 250000, cost: 155000, clientCount: 1100, p99LatencyMs: 9.7 },
  { id: '16', quarter: 'Q4-25', region: 'LATAM', channel: 'SaaS Self-Serve', product: 'Apex AI Copilot Engine', category: 'AI Tools', units: 120, revenue: 160000, cost: 95000, clientCount: 920, p99LatencyMs: 11.9 },

  // Q1-26
  { id: '17', quarter: 'Q1-26', region: 'EMEA', channel: 'Enterprise Direct', product: 'Apex Enterprise Cloud', category: 'Cloud OLAP', units: 240, revenue: 740000, cost: 440000, clientCount: 2100, p99LatencyMs: 10.6 },
  { id: '18', quarter: 'Q1-26', region: 'AMER', channel: 'SaaS Self-Serve', product: 'Apex AI Copilot Engine', category: 'AI Tools', units: 480, revenue: 640000, cost: 360000, clientCount: 3800, p99LatencyMs: 11.4 },
  { id: '19', quarter: 'Q1-26', region: 'APAC', channel: 'Partners/Resellers', product: 'Apex Data Lakehouse', category: 'Storage', units: 160, revenue: 390000, cost: 235000, clientCount: 1650, p99LatencyMs: 10.1 },
  { id: '20', quarter: 'Q1-26', region: 'LATAM', channel: 'Gov/Public', product: 'Apex Security Sentinel', category: 'Security', units: 95, revenue: 240000, cost: 155000, clientCount: 780, p99LatencyMs: 12.0 },

  // Q2-26
  { id: '21', quarter: 'Q2-26', region: 'EMEA', channel: 'Partners/Resellers', product: 'Apex Data Lakehouse', category: 'Storage', units: 210, revenue: 520000, cost: 320000, clientCount: 1950, p99LatencyMs: 10.3 },
  { id: '22', quarter: 'Q2-26', region: 'AMER', channel: 'Enterprise Direct', product: 'Apex Enterprise Cloud', category: 'Cloud OLAP', units: 290, revenue: 890000, cost: 530000, clientCount: 2600, p99LatencyMs: 10.9 },
  { id: '23', quarter: 'Q2-26', region: 'APAC', channel: 'SaaS Self-Serve', product: 'Apex AI Copilot Engine', category: 'AI Tools', units: 380, revenue: 490000, cost: 285000, clientCount: 2900, p99LatencyMs: 11.7 },
  { id: '24', quarter: 'Q2-26', region: 'LATAM', channel: 'Enterprise Direct', product: 'Apex Developer SDK', category: 'Dev Tools', units: 110, revenue: 210000, cost: 125000, clientCount: 840, p99LatencyMs: 10.8 },

  // Q3-26
  { id: '25', quarter: 'Q3-26', region: 'EMEA', channel: 'SaaS Self-Serve', product: 'Apex AI Copilot Engine', category: 'AI Tools', units: 520, revenue: 690000, cost: 395000, clientCount: 4100, p99LatencyMs: 11.1 },
  { id: '26', quarter: 'Q3-26', region: 'AMER', channel: 'Gov/Public', product: 'Apex Security Sentinel', category: 'Security', units: 210, revenue: 620000, cost: 370000, clientCount: 1600, p99LatencyMs: 11.3 },
  { id: '27', quarter: 'Q3-26', region: 'APAC', channel: 'Enterprise Direct', product: 'Apex Enterprise Cloud', category: 'Cloud OLAP', units: 180, revenue: 560000, cost: 340000, clientCount: 1500, p99LatencyMs: 9.6 },
  { id: '28', quarter: 'Q3-26', region: 'LATAM', channel: 'Partners/Resellers', product: 'Apex Data Lakehouse', category: 'Storage', units: 105, revenue: 235000, cost: 145000, clientCount: 790, p99LatencyMs: 10.7 },

  // Q4-26 (Projected / Closing)
  { id: '29', quarter: 'Q4-26', region: 'EMEA', channel: 'Enterprise Direct', product: 'Apex Enterprise Cloud', category: 'Cloud OLAP', units: 310, revenue: 980000, cost: 580000, clientCount: 2800, p99LatencyMs: 10.4 },
  { id: '30', quarter: 'Q4-26', region: 'AMER', channel: 'Enterprise Direct', product: 'Apex AI Copilot Engine', category: 'AI Tools', units: 560, revenue: 820000, cost: 460000, clientCount: 4400, p99LatencyMs: 11.2 },
  { id: '31', quarter: 'Q4-26', region: 'APAC', channel: 'Gov/Public', product: 'Apex Security Sentinel', category: 'Security', units: 130, revenue: 380000, cost: 230000, clientCount: 1050, p99LatencyMs: 10.0 },
  { id: '32', quarter: 'Q4-26', region: 'LATAM', channel: 'SaaS Self-Serve', product: 'Apex Developer SDK', category: 'Dev Tools', units: 145, revenue: 245000, cost: 140000, clientCount: 990, p99LatencyMs: 11.6 },
];

export const DataWarehouseBIView: React.FC = () => {
  // Navigation tabs within BI Module
  const [activeTab, setActiveTab] = useState<'dashboard' | 'duckdb' | 'etl' | 'dax'>('dashboard');

  // Active dataset
  const [selectedDataset, setSelectedDataset] = useState<string>('Ventas Globales Enterprise 2026 (1.25M Filas)');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Hace 2 minutos');

  // Cross-filtering states
  const [selectedRegion, setSelectedRegion] = useState<BIRegion | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<BIChannel | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<BIQuarter | null>(null);

  // Table search & sort
  const [tableSearch, setTableSearch] = useState('');
  const [tableSortColumn, setTableSortColumn] = useState<'product' | 'category' | 'units' | 'revenue' | 'margin' | 'yoy'>('revenue');
  const [tableSortAsc, setTableSortAsc] = useState(false);

  // Custom widgets added by user
  const [widgets, setWidgets] = useState<CustomWidget[]>([]);
  const [isNewWidgetModalOpen, setIsNewWidgetModalOpen] = useState(false);
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetType, setNewWidgetType] = useState<'kpi' | 'bar' | 'donut' | 'table'>('kpi');
  const [newWidgetMeasure, setNewWidgetMeasure] = useState('revenue');
  const [newWidgetDimension, setNewWidgetDimension] = useState('region');

  // Export report modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'json'>('pdf');

  // DuckDB WASM SQL Studio state
  const [sqlQuery, setSqlQuery] = useState<string>(
    `-- Consulta Analítica Soberana DuckDB WASM v1.1.2\nSELECT\n  region,\n  channel,\n  COUNT(*) AS transacciones,\n  SUM(revenue) AS facturacion_total,\n  ROUND(AVG((revenue - cost) / revenue * 100), 2) AS margen_ebitda_pct\nFROM sales_lakehouse\nWHERE quarter LIKE '2026%'\nGROUP BY region, channel\nORDER BY facturacion_total DESC;`
  );
  const [isExecutingSQL, setIsExecutingSQL] = useState(false);
  const [sqlMetrics, setSqlMetrics] = useState<{
    rowsProcessed: string;
    executionTimeMs: number;
    cloudRequests: number;
    sovereigntyPct: number;
    ramMB: number;
  }>({
    rowsProcessed: '1.250.000',
    executionTimeMs: 12.8,
    cloudRequests: 0,
    sovereigntyPct: 100,
    ramMB: 48.6,
  });

  const [sqlResults, setSqlResults] = useState<Array<Record<string, string | number>>>([
    { region: 'AMER', channel: 'Enterprise Direct', transacciones: 290, facturacion_total: '€890.000', margen_ebitda_pct: '40.45%' },
    { region: 'EMEA', channel: 'Enterprise Direct', transacciones: 310, facturacion_total: '€980.000', margen_ebitda_pct: '40.82%' },
    { region: 'AMER', channel: 'SaaS Self-Serve', transacciones: 560, facturacion_total: '€820.000', margen_ebitda_pct: '43.90%' },
    { region: 'EMEA', channel: 'SaaS Self-Serve', transacciones: 520, facturacion_total: '€690.000', margen_ebitda_pct: '42.75%' },
    { region: 'APAC', channel: 'Enterprise Direct', transacciones: 180, facturacion_total: '€560.000', margen_ebitda_pct: '39.29%' },
    { region: 'AMER', channel: 'Gov/Public', transacciones: 210, facturacion_total: '€620.000', margen_ebitda_pct: '40.32%' },
    { region: 'APAC', channel: 'SaaS Self-Serve', transacciones: 380, facturacion_total: '€490.000', margen_ebitda_pct: '41.84%' },
  ]);

  // ETL Pipeline state
  const [etlNodes, setEtlNodes] = useState<ETLNode[]>([
    {
      id: 'node-1',
      title: '1. Extract: Archivos Parquet & CSV',
      subtitle: 'erp_sales_partitioned.parquet • 2.4 GB',
      category: 'extract',
      throughput: '245k rows/seg',
      status: 'success',
      latency: '84 ms',
      details: 'Extracción sin copia de búfer mediante WebAssembly Zero-Copy Memory y File System Access API nativa.',
      inputs: ['storage/erp_sales_2026.parquet', 'storage/clients_master.csv'],
      outputs: ['stream::parquet_column_batch'],
    },
    {
      id: 'node-2',
      title: '2. Clean & Filter: Eliminación de Nulos',
      subtitle: 'Filtro Z-Score > 3.0 • Drop Nulls & Outliers',
      category: 'clean',
      throughput: '410k rows/seg',
      status: 'success',
      latency: '42 ms',
      details: 'Depuración vectorial SIMD: 12.430 registros corruptos o incompletos purgados sin bloquear la interfaz.',
      inputs: ['stream::parquet_column_batch'],
      outputs: ['stream::sanitized_transactions'],
    },
    {
      id: 'node-3',
      title: '3. Aggregate: Agrupación por Región & Canal',
      subtitle: 'SUM(revenue), AVG(margin) • Vectorized SIMD',
      category: 'aggregate',
      throughput: '620k rows/seg',
      status: 'success',
      latency: '28 ms',
      details: 'Compilación Just-In-Time de expresiones OLAP. Agrupaciones multicubo calculadas en memoria L3.',
      inputs: ['stream::sanitized_transactions'],
      outputs: ['cube::regional_channel_aggregates'],
    },
    {
      id: 'node-4',
      title: '4. Load: Almacén Local Soberano',
      subtitle: 'Native Sovereign Table • Local Cache',
      category: 'load',
      throughput: '180k rows/seg',
      status: 'success',
      latency: '65 ms',
      details: 'Persistencia directa en Almacén Local Soberano (LocalStorage). Cifrado local verificado.',
      inputs: ['cube::regional_channel_aggregates'],
      outputs: ['local://warehouse/sales_lakehouse.db'],
    },
  ]);

  const [activeEtlNodeId, setActiveEtlNodeId] = useState<string>('node-1');
  const [isEtlPipelineRunning, setIsEtlPipelineRunning] = useState(false);
  const [etlExecutionProgress, setEtlExecutionProgress] = useState<number>(100);

  // DAX & Expressions state
  const [daxFormula, setDaxFormula] = useState<string>(
    `YoY_Growth = \nDIVIDE(\n    [Ventas_Actual] - [Ventas_Anterior],\n    [Ventas_Anterior],\n    0.0\n)`
  );
  const [daxValidationResult, setDaxValidationResult] = useState<{
    isValid: boolean;
    message: string;
    tokensCount: number;
    astDepth: number;
  }>({
    isValid: true,
    message: '✓ Sintaxis DAX válida • Medida compilada para motor OLAP columnar en DuckDB',
    tokensCount: 14,
    astDepth: 3,
  });

  const [daxMeasures, setDaxMeasures] = useState<DAXMeasure[]>([
    {
      id: 'dax-1',
      name: 'YoY_Growth',
      expression: 'DIVIDE([Ventas_Actual] - [Ventas_Anterior], [Ventas_Anterior], 0)',
      category: 'Rendimiento Temporal',
      returnType: 'Percentage',
      description: 'Crecimiento interanual compuesto calculado sobre trimestres homólogos.',
      computedValue: '+24.8%',
      status: 'valid',
    },
    {
      id: 'dax-2',
      name: 'Customer_LTV',
      expression: 'SUMX(Clientes, [Ticket_Medio] * [Frecuencia_Compra] * [Vida_Media_Anios])',
      category: 'Cohortes y Clientes',
      returnType: 'Currency',
      description: 'Valor de vida estimado por cuenta empresarial activa en el repositorio.',
      computedValue: '€38.450',
      status: 'valid',
    },
    {
      id: 'dax-3',
      name: 'Churn_Rate',
      expression: 'DIVIDE([Bajas_Periodo], [Clientes_Inicio_Periodo], 0.0)',
      category: 'Retención SaaS',
      returnType: 'Percentage',
      description: 'Tasa mensual de cancelación neta de licencias y suscripciones.',
      computedValue: '1.42%',
      status: 'valid',
    },
    {
      id: 'dax-4',
      name: 'EBITDA_Margin_Weighted',
      expression: 'DIVIDE(SUM(Facturacion[Margen_Bruto]), SUM(Facturacion[Ingresos_Totales]), 0)',
      category: 'Rentabilidad',
      returnType: 'Percentage',
      description: 'Margen operativo ponderado antes de intereses, amortizaciones e impuestos.',
      computedValue: '38.6%',
      status: 'valid',
    },
    {
      id: 'dax-5',
      name: 'Quick_Ratio_Liquidity',
      expression: 'DIVIDE([Activo_Circulante] - [Inventario], [Pasivo_Circulante], 1.0)',
      category: 'Solvencia Financiera',
      returnType: 'Duration',
      description: 'Ratio de prueba ácida de cobertura de pasivos en tiempo de ejecución.',
      computedValue: '2.14x',
      status: 'valid',
    },
  ]);

  // SVG Hover States
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{ quarter: string; revenue: number; margin: number; x: number; y: number } | null>(null);

  // ==========================================
  // CROSS-FILTERING ENGINE (Bidirectional at 60 FPS)
  // ==========================================
  const filteredData = useMemo(() => {
    return RAW_SALES_DATA.filter((item) => {
      if (selectedRegion && item.region !== selectedRegion) return false;
      if (selectedChannel && item.channel !== selectedChannel) return false;
      if (selectedQuarter && item.quarter !== selectedQuarter) return false;
      return true;
    });
  }, [selectedRegion, selectedChannel, selectedQuarter]);

  // Executive KPI Calculations
  const kpis = useMemo(() => {
    const totalRev = filteredData.reduce((acc, row) => acc + row.revenue, 0);
    const totalCost = filteredData.reduce((acc, row) => acc + row.cost, 0);
    const totalClients = filteredData.reduce((acc, row) => acc + row.clientCount, 0);
    const avgP99 = filteredData.length > 0 ? (filteredData.reduce((acc, row) => acc + row.p99LatencyMs, 0) / filteredData.length).toFixed(1) : '0.0';
    const marginEbitda = totalRev > 0 ? (((totalRev - totalCost) / totalRev) * 100).toFixed(1) : '0.0';

    return {
      revenue: totalRev,
      marginEbitda: parseFloat(marginEbitda),
      activeClients: totalClients,
      p99Ms: avgP99,
    };
  }, [filteredData]);

  // Regional Sales Aggregation (Bar Chart)
  const regionalSales = useMemo(() => {
    const regions: BIRegion[] = ['EMEA', 'AMER', 'APAC', 'LATAM'];
    return regions.map((reg) => {
      // If region is filtered, we still want to show full vs filtered comparison
      const totalRev = RAW_SALES_DATA.filter((r) => r.region === reg && (!selectedChannel || r.channel === selectedChannel) && (!selectedQuarter || r.quarter === selectedQuarter)).reduce(
        (sum, r) => sum + r.revenue,
        0
      );
      const isSelected = selectedRegion === reg;
      return {
        region: reg,
        revenue: totalRev,
        isSelected,
      };
    });
  }, [selectedRegion, selectedChannel, selectedQuarter]);

  const maxRegionalRevenue = useMemo(() => {
    return Math.max(...regionalSales.map((r) => r.revenue), 1);
  }, [regionalSales]);

  // Channel Distribution Aggregation (Donut Chart)
  const channelSales = useMemo(() => {
    const channels: BIChannel[] = ['Enterprise Direct', 'SaaS Self-Serve', 'Partners/Resellers', 'Gov/Public'];
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];
    const total = RAW_SALES_DATA.filter((r) => (!selectedRegion || r.region === selectedRegion) && (!selectedQuarter || r.quarter === selectedQuarter)).reduce(
      (sum, r) => sum + r.revenue,
      0
    );

    return channels.map((chan, idx) => {
      const rev = RAW_SALES_DATA.filter(
        (r) => r.channel === chan && (!selectedRegion || r.region === selectedRegion) && (!selectedQuarter || r.quarter === selectedQuarter)
      ).reduce((sum, r) => sum + r.revenue, 0);
      const percentage = total > 0 ? (rev / total) * 100 : 0;
      const isSelected = selectedChannel === chan;
      return {
        channel: chan,
        revenue: rev,
        percentage,
        color: colors[idx],
        isSelected,
      };
    });
  }, [selectedChannel, selectedRegion, selectedQuarter]);

  // Quarterly Trend Aggregation (Line & Area Chart)
  const quarterlyTrend = useMemo(() => {
    const quarters: BIQuarter[] = ['Q1-25', 'Q2-25', 'Q3-25', 'Q4-25', 'Q1-26', 'Q2-26', 'Q3-26', 'Q4-26'];
    return quarters.map((q) => {
      const matching = RAW_SALES_DATA.filter(
        (r) => r.quarter === q && (!selectedRegion || r.region === selectedRegion) && (!selectedChannel || r.channel === selectedChannel)
      );
      const rev = matching.reduce((s, r) => s + r.revenue, 0);
      const cost = matching.reduce((s, r) => s + r.cost, 0);
      const margin = rev > 0 ? ((rev - cost) / rev) * 100 : 0;
      return {
        quarter: q,
        revenue: rev,
        margin: parseFloat(margin.toFixed(1)),
        isSelected: selectedQuarter === q,
      };
    });
  }, [selectedQuarter, selectedRegion, selectedChannel]);

  const maxQuarterlyRevenue = useMemo(() => {
    return Math.max(...quarterlyTrend.map((q) => q.revenue), 1);
  }, [quarterlyTrend]);

  // Product Table Aggregation
  const productPerformance = useMemo(() => {
    const productNames = Array.from(new Set(RAW_SALES_DATA.map((r) => r.product)));
    const items = productNames.map((name) => {
      const records = filteredData.filter((r) => r.product === name);
      const category = records[0]?.category || 'General';
      const units = records.reduce((s, r) => s + r.units, 0);
      const revenue = records.reduce((s, r) => s + r.revenue, 0);
      const cost = records.reduce((s, r) => s + r.cost, 0);
      const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;
      // Simulated YoY based on product category
      const yoy = name.includes('Cloud') ? 28.4 : name.includes('AI') ? 46.2 : name.includes('Lakehouse') ? 18.5 : 14.1;
      const status = margin >= 40 ? 'Excelente' : margin >= 30 ? 'En Meta' : 'Revisar';

      return {
        product: name,
        category,
        units,
        revenue,
        margin: parseFloat(margin.toFixed(1)),
        yoy,
        status,
      };
    });

    // Filter by text search
    const filtered = items.filter(
      (item) =>
        item.product.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.status.toLowerCase().includes(tableSearch.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let valA: string | number = a[tableSortColumn];
      let valB: string | number = b[tableSortColumn];
      if (typeof valA === 'string') {
        return tableSortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      }
      return tableSortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return filtered;
  }, [filteredData, tableSearch, tableSortColumn, tableSortAsc]);

  // ==========================================
  // HANDLERS & ACTIONS
  // ==========================================
  const handleClearFilters = () => {
    setSelectedRegion(null);
    setSelectedChannel(null);
    setSelectedQuarter(null);
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed('Hace un instante');
    }, 650);
  };

  const handleExecuteSQL = () => {
    setIsExecutingSQL(true);
    setTimeout(() => {
      setIsExecutingSQL(false);
      const randomTime = (Math.random() * 4 + 10.5).toFixed(1);
      setSqlMetrics({
        rowsProcessed: '1.250.000',
        executionTimeMs: parseFloat(randomTime),
        cloudRequests: 0,
        sovereigntyPct: 100,
        ramMB: parseFloat((Math.random() * 2 + 47.8).toFixed(1)),
      });
      setSqlResults((prev) => [...prev].sort(() => Math.random() - 0.5));
    }, 450);
  };

  const handleExecuteETLPipeline = () => {
    setIsEtlPipelineRunning(true);
    setEtlExecutionProgress(0);

    // Reset all nodes to idle
    setEtlNodes((prev) => prev.map((n) => ({ ...n, status: 'idle' })));

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setEtlNodes((prev) => prev.map((n, i) => (i === 0 ? { ...n, status: 'running' } : n)));
        setEtlExecutionProgress(25);
      } else if (step === 2) {
        setEtlNodes((prev) => prev.map((n, i) => (i === 0 ? { ...n, status: 'success' } : i === 1 ? { ...n, status: 'running' } : n)));
        setEtlExecutionProgress(50);
      } else if (step === 3) {
        setEtlNodes((prev) => prev.map((n, i) => (i <= 1 ? { ...n, status: 'success' } : i === 2 ? { ...n, status: 'running' } : n)));
        setEtlExecutionProgress(75);
      } else if (step === 4) {
        setEtlNodes((prev) => prev.map((n, i) => (i <= 2 ? { ...n, status: 'success' } : { ...n, status: 'running' })));
        setEtlExecutionProgress(95);
      } else if (step >= 5) {
        setEtlNodes((prev) => prev.map((n) => ({ ...n, status: 'success' })));
        setEtlExecutionProgress(100);
        setIsEtlPipelineRunning(false);
        clearInterval(interval);
      }
    }, 600);
  };

  // DAX Validator
  useEffect(() => {
    const openParens = (daxFormula.match(/\(/g) || []).length;
    const closeParens = (daxFormula.match(/\)/g) || []).length;
    const openBrackets = (daxFormula.match(/\[/g) || []).length;
    const closeBrackets = (daxFormula.match(/\]/g) || []).length;

    if (openParens !== closeParens) {
      setDaxValidationResult({
        isValid: false,
        message: `Error de sintaxis: Desbalance de paréntesis (${openParens} abiertos vs ${closeParens} cerrados)`,
        tokensCount: daxFormula.trim().split(/\s+/).length,
        astDepth: 1,
      });
    } else if (openBrackets !== closeBrackets) {
      setDaxValidationResult({
        isValid: false,
        message: `Error de sintaxis: Identificadores de columnas corchetes desbalanceados (${openBrackets} abiertos vs ${closeBrackets} cerrados)`,
        tokensCount: daxFormula.trim().split(/\s+/).length,
        astDepth: 1,
      });
    } else {
      setDaxValidationResult({
        isValid: true,
        message: '✓ Sintaxis DAX válida • Medida compilada para motor OLAP columnar en DuckDB WASM',
        tokensCount: daxFormula.trim().split(/\s+/).length,
        astDepth: Math.max(2, Math.min(5, Math.floor(daxFormula.length / 25))),
      });
    }
  }, [daxFormula]);

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle.trim()) return;

    const newW: CustomWidget = {
      id: `w-${Date.now()}`,
      title: newWidgetTitle.trim(),
      type: newWidgetType,
      dimension: newWidgetDimension,
      measure: newWidgetMeasure,
    };

    setWidgets((prev) => [...prev, newW]);
    setNewWidgetTitle('');
    setIsNewWidgetModalOpen(false);
  };

  const handleExportReport = () => {
    setIsExportModalOpen(false);
    const filename = `informe_ejecutivo_apex_bi_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
    const dummyBlob = new Blob([
      JSON.stringify(
        {
          reportTitle: 'Apex Office Suite • Informe Ejecutivo de Business Intelligence',
          dataset: selectedDataset,
          exportedAt: new Date().toISOString(),
          kpis,
          activeFilters: { selectedRegion, selectedChannel, selectedQuarter },
          topProducts: productPerformance.slice(0, 5),
        },
        null,
        2
      ),
    ], { type: 'application/json' });
    const url = URL.createObjectURL(dummyBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper formatters
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('es-ES').format(val);
  };

  const activeEtlNode = etlNodes.find((n) => n.id === activeEtlNodeId) || etlNodes[0];

  return (
    <div className="flex-1 flex flex-col bg-obsidian-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* ==========================================
          TOP BAR: DATASET SELECTOR & WORKSPACE ACTIONS
         ========================================== */}
      <header className="h-14 bg-obsidian-900 border-b border-obsidian-800 px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Module Identity & Dataset Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-apex-amber flex items-center justify-center shadow-lg shadow-amber-500/20 text-obsidian-950">
              <BarChart3 className="w-4 h-4 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white flex items-center space-x-1">
                  <span>APEX BI & WAREHOUSE</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30 flex items-center space-x-1">
                  <Cpu className="w-2.5 h-2.5" />
                  <span>DUCKDB WASM</span>
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-obsidian-700/60 mx-1" />

          {/* Dataset Selector */}
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="bg-obsidian-950 text-xs font-medium text-slate-200 border border-obsidian-700 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              <option value="Ventas Globales Enterprise 2026 (1.25M Filas)">Ventas Globales Enterprise 2026 (1.25M Filas)</option>
              <option value="Métricas Financieras & EBITDA 2024-2026">Métricas Financieras & EBITDA 2024-2026</option>
              <option value="Telemetría Cloud & Rendimiento P99">Telemetría Cloud & Rendimiento P99</option>
              <option value="Archivo Parquet Local (Local Store)">Archivo Parquet Local (Local Store)</option>
            </select>
          </div>

          {/* Sincronización soberana badge */}
          <div className="hidden xl:flex items-center space-x-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>0 peticiones externas • 100% In-Memory</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Refresh Data */}
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-obsidian-800 text-slate-300 hover:text-white hover:bg-obsidian-700 border border-obsidian-700 transition-all disabled:opacity-50"
            title="Recalcular métricas y sincronizar con DuckDB"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Actualizar Datos</span>
          </button>

          {/* New Widget */}
          <button
            onClick={() => setIsNewWidgetModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-obsidian-800 text-slate-300 hover:text-white hover:bg-obsidian-700 border border-obsidian-700 transition-all"
            title="Añadir tarjeta o gráfico personalizado al tablero"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Nuevo Widget</span>
          </button>

          {/* Run ETL Pipeline Quick Action */}
          <button
            onClick={() => {
              setActiveTab('etl');
              handleExecuteETLPipeline();
            }}
            disabled={isEtlPipelineRunning}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-semibold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            title="Ejecutar la canalización de ingesta y agregación"
          >
            <Play className={`w-3.5 h-3.5 ${isEtlPipelineRunning ? 'animate-pulse' : ''}`} />
            <span>Ejecutar Pipeline ETL</span>
          </button>

          {/* Export Report */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-obsidian-800 text-slate-300 hover:text-white hover:bg-obsidian-700 border border-obsidian-700 transition-all"
            title="Exportar informe en formato PDF o Excel"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Exportar Informe</span>
          </button>
        </div>
      </header>

      {/* ==========================================
          SUBNAV TABS: DASHBOARD, DUCKDB, ETL, DAX
         ========================================== */}
      <div className="h-10 bg-obsidian-900/80 border-b border-obsidian-800/80 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'dashboard'
                ? 'border-amber-400 text-amber-300 bg-obsidian-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-obsidian-800/30'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1. Tablero de Control Ejecutivo</span>
          </button>

          <button
            onClick={() => setActiveTab('duckdb')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'duckdb'
                ? 'border-cyan-400 text-cyan-300 bg-obsidian-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-obsidian-800/30'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Consola SQL DuckDB WASM</span>
          </button>

          <button
            onClick={() => setActiveTab('etl')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'etl'
                ? 'border-emerald-400 text-emerald-300 bg-obsidian-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-obsidian-800/30'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>3. Diseñador ETL No-Code</span>
          </button>

          <button
            onClick={() => setActiveTab('dax')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-t text-xs font-medium border-b-2 transition-all ${
              activeTab === 'dax'
                ? 'border-indigo-400 text-indigo-300 bg-obsidian-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-obsidian-800/30'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>4. Métricas DAX & Expresiones</span>
          </button>
        </div>

        {/* Status ticker */}
        <div className="hidden md:flex items-center space-x-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cross-filtering a 60 FPS</span>
          </div>
          <span className="text-obsidian-700">•</span>
          <span>Actualizado: {lastRefreshed}</span>
        </div>
      </div>

      {/* ==========================================
          TAB 1: TABLERO DE CONTROL EJECUTIVO
         ========================================== */}
      {activeTab === 'dashboard' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Active Filter Notification Bar */}
          {(selectedRegion || selectedChannel || selectedQuarter) && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-center justify-between text-xs transition-all">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-200 font-medium">Filtrado Cruzado Bidireccional Activo:</span>
                <div className="flex items-center space-x-1.5 flex-wrap">
                  {selectedRegion && (
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/40 flex items-center space-x-1">
                      <span>Región: {selectedRegion}</span>
                      <button onClick={() => setSelectedRegion(null)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedChannel && (
                    <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono border border-cyan-500/40 flex items-center space-x-1">
                      <span>Canal: {selectedChannel}</span>
                      <button onClick={() => setSelectedChannel(null)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedQuarter && (
                    <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-500/40 flex items-center space-x-1">
                      <span>Trimestre: {selectedQuarter}</span>
                      <button onClick={() => setSelectedQuarter(null)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-slate-400">
                  Mostrando <strong className="text-slate-200">{filteredData.length}</strong> de {RAW_SALES_DATA.length} particiones OLAP
                </span>
                <button
                  onClick={handleClearFilters}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium rounded transition-colors"
                >
                  Restablecer Filtros
                </button>
              </div>
            </div>
          )}

          {/* 1.1 FOUR EXECUTIVE KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Facturación Total */}
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 relative overflow-hidden group hover:border-obsidian-700 transition-all shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Facturación Total (€)</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
                {formatCurrency(kpis.revenue)}
              </div>
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="flex items-center text-emerald-400 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +18.4%
                </span>
                <span className="text-slate-500">vs trimestre anterior</span>
              </div>
            </div>

            {/* KPI 2: Margen EBITDA */}
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 relative overflow-hidden group hover:border-obsidian-700 transition-all shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Margen EBITDA (%)</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400 mb-1">
                {kpis.marginEbitda}%
              </div>
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="flex items-center text-emerald-400 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +3.2%
                </span>
                <span className="text-slate-500">eficiencia operativa</span>
              </div>
            </div>

            {/* KPI 3: Clientes Activos */}
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 relative overflow-hidden group hover:border-obsidian-700 transition-all shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clientes Activos</span>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-white mb-1">
                {formatNumber(kpis.activeClients)}
              </div>
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="flex items-center text-cyan-400 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  +1.240
                </span>
                <span className="text-slate-500">nuevas cuentas Enterprise</span>
              </div>
            </div>

            {/* KPI 4: Tiempo de Respuesta P99 */}
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 relative overflow-hidden group hover:border-obsidian-700 transition-all shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Respuesta P99 OLAP</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-indigo-400 mb-1">
                {kpis.p99Ms} <span className="text-sm font-normal text-slate-400">ms</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  SIMD AVX-512
                </span>
                <span className="text-slate-500">Zero-Copy Memory</span>
              </div>
            </div>
          </div>

          {/* 1.2 INTERACTIVE CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart 1: Interactive SVG Bar Chart (Ventas por Región) */}
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Ventas por Región</span>
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                      Click para Filtrar
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Agregación sumatoria en tiempo real</p>
                </div>
                {selectedRegion && (
                  <button
                    onClick={() => setSelectedRegion(null)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    Quitar filtro
                  </button>
                )}
              </div>

              {/* SVG Bar Chart */}
              <div className="flex-1 w-full flex items-center justify-center min-h-[200px]">
                <svg viewBox="0 0 340 180" className="w-full h-full max-h-[220px]">
                  {/* Horizontal Grid lines */}
                  <line x1="40" y1="20" x2="320" y2="20" stroke="#1f293d" strokeDasharray="3 3" />
                  <line x1="40" y1="60" x2="320" y2="60" stroke="#1f293d" strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="320" y2="100" stroke="#1f293d" strokeDasharray="3 3" />
                  <line x1="40" y1="140" x2="320" y2="140" stroke="#334155" />

                  {/* Y Axis Labels */}
                  <text x="32" y="24" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                    €{(maxRegionalRevenue / 1000000).toFixed(1)}M
                  </text>
                  <text x="32" y="80" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                    €{(maxRegionalRevenue / 2000000).toFixed(1)}M
                  </text>
                  <text x="32" y="143" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                    €0
                  </text>

                  {/* Bars */}
                  {regionalSales.map((item, index) => {
                    const barWidth = 44;
                    const x = 60 + index * 68;
                    const height = (item.revenue / maxRegionalRevenue) * 115;
                    const y = 140 - height;
                    const isHovered = hoveredBarIndex === index;
                    const isSelected = item.isSelected;
                    const isDimmed = selectedRegion !== null && !isSelected;

                    return (
                      <g
                        key={item.region}
                        className="cursor-pointer transition-all duration-200"
                        onClick={() => setSelectedRegion(selectedRegion === item.region ? null : item.region)}
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      >
                        {/* Bar Rect */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(4, height)}
                          rx="4"
                          fill={isSelected ? '#f59e0b' : isHovered ? '#fbbf24' : '#3b82f6'}
                          opacity={isDimmed ? 0.35 : 1}
                          stroke={isSelected ? '#ffffff' : isHovered ? '#f59e0b' : 'none'}
                          strokeWidth={isSelected ? '2' : '1'}
                          className="transition-all duration-200"
                        />

                        {/* Top Value Label */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          fill={isSelected ? '#f59e0b' : '#94a3b8'}
                          fontSize="9"
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          €{(item.revenue / 1000).toFixed(0)}k
                        </text>

                        {/* X Axis Region Label */}
                        <text
                          x={x + barWidth / 2}
                          y="158"
                          fill={isSelected ? '#f59e0b' : '#cbd5e1'}
                          fontSize="10"
                          fontWeight={isSelected ? 'bold' : '500'}
                          textAnchor="middle"
                        >
                          {item.region}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="pt-2 border-t border-obsidian-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Total Regiones Activas: 4</span>
                <span className="font-mono text-amber-300">
                  {selectedRegion ? `Filtrando por ${selectedRegion}` : 'Sin filtro regional'}
                </span>
              </div>
            </div>

            {/* Chart 2: Interactive SVG Donut Chart (Distribución por Canal) */}
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Canal de Distribución</span>
                    <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 font-mono">
                      Donut SVG
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Distribución porcentual de facturación</p>
                </div>
                {selectedChannel && (
                  <button
                    onClick={() => setSelectedChannel(null)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    Quitar filtro
                  </button>
                )}
              </div>

              {/* Donut SVG */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[190px]">
                <div className="relative w-44 h-44">
                  <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                    {(() => {
                      let accumulatedAngle = 0;
                      const radius = 60;
                      const cx = 80;
                      const cy = 80;
                      const circumference = 2 * Math.PI * radius;

                      return channelSales.map((chan, idx) => {
                        const strokeDasharray = `${(chan.percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((accumulatedAngle / 100) * circumference);
                        accumulatedAngle += chan.percentage;

                        const isHovered = hoveredDonutIndex === idx;
                        const isSelected = chan.isSelected;
                        const isDimmed = selectedChannel !== null && !isSelected;

                        return (
                          <circle
                            key={chan.channel}
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill="transparent"
                            stroke={chan.color}
                            strokeWidth={isHovered || isSelected ? '22' : '18'}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            opacity={isDimmed ? 0.3 : 1}
                            className="cursor-pointer transition-all duration-200"
                            onClick={() => setSelectedChannel(selectedChannel === chan.channel ? null : chan.channel)}
                            onMouseEnter={() => setHoveredDonutIndex(idx)}
                            onMouseLeave={() => setHoveredDonutIndex(null)}
                          />
                        );
                      });
                    })()}
                  </svg>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    {hoveredDonutIndex !== null ? (
                      <>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90px]">
                          {channelSales[hoveredDonutIndex].channel}
                        </span>
                        <span className="text-base font-bold font-mono text-white">
                          {channelSales[hoveredDonutIndex].percentage.toFixed(1)}%
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          €{(channelSales[hoveredDonutIndex].revenue / 1000).toFixed(0)}k
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total</span>
                        <span className="text-sm font-bold font-mono text-white">
                          €{(channelSales.reduce((s, c) => s + c.revenue, 0) / 1000000).toFixed(2)}M
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">100% cuota</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1.5 mt-3 pt-2 border-t border-obsidian-800 text-[11px]">
                  {channelSales.map((chan) => (
                    <div
                      key={chan.channel}
                      onClick={() => setSelectedChannel(selectedChannel === chan.channel ? null : chan.channel)}
                      className={`flex items-center space-x-1.5 cursor-pointer p-1 rounded transition-colors ${
                        chan.isSelected ? 'bg-obsidian-800 font-bold' : 'hover:bg-obsidian-800/40 text-slate-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: chan.color }} />
                      <span className="truncate flex-1">{chan.channel}</span>
                      <span className="font-mono text-slate-400 text-[10px]">{chan.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart 3: Interactive SVG Time Trend (Evolución Trimestral) */}
            <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Evolución Trimestral</span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">
                      Área Sombreada
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Tendencia de facturación (2025 - 2026)</p>
                </div>
                {selectedQuarter && (
                  <button
                    onClick={() => setSelectedQuarter(null)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                  >
                    Quitar filtro
                  </button>
                )}
              </div>

              {/* Area & Line SVG */}
              <div className="flex-1 w-full flex items-center justify-center min-h-[190px]">
                <svg viewBox="0 0 340 180" className="w-full h-full max-h-[220px]">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="35" y1="20" x2="325" y2="20" stroke="#1f293d" strokeDasharray="3 3" />
                  <line x1="35" y1="60" x2="325" y2="60" stroke="#1f293d" strokeDasharray="3 3" />
                  <line x1="35" y1="100" x2="325" y2="100" stroke="#1f293d" strokeDasharray="3 3" />
                  <line x1="35" y1="140" x2="325" y2="140" stroke="#334155" />

                  {/* Y Axis text */}
                  <text x="30" y="24" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                    €{(maxQuarterlyRevenue / 1000000).toFixed(1)}M
                  </text>
                  <text x="30" y="80" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                    €{(maxQuarterlyRevenue / 2000000).toFixed(1)}M
                  </text>
                  <text x="30" y="143" fill="#64748b" fontSize="8" textAnchor="end" fontFamily="monospace">
                    €0
                  </text>

                  {/* Area Polygon */}
                  {(() => {
                    const stepX = (325 - 45) / (quarterlyTrend.length - 1);
                    const points = quarterlyTrend.map((q, idx) => {
                      const x = 45 + idx * stepX;
                      const y = 140 - (q.revenue / maxQuarterlyRevenue) * 115;
                      return { x, y, quarter: q.quarter, revenue: q.revenue, margin: q.margin, isSelected: q.isSelected };
                    });

                    const pathArea = `M 45 140 ` + points.map((p) => `L ${p.x} ${p.y}`).join(' ') + ` L ${points[points.length - 1].x} 140 Z`;
                    const pathLine = `M ` + points.map((p) => `${p.x} ${p.y}`).join(' L ');

                    return (
                      <>
                        {/* Shaded Area */}
                        <path d={pathArea} fill="url(#areaGradient)" />

                        {/* Trend Line */}
                        <path d={pathLine} fill="none" stroke="#6366f1" strokeWidth="2.5" />

                        {/* Data Points */}
                        {points.map((p) => {
                          const isHovered = hoveredTrendPoint?.quarter === p.quarter;
                          return (
                            <g
                              key={p.quarter}
                              className="cursor-pointer"
                              onClick={() => setSelectedQuarter(selectedQuarter === p.quarter ? null : (p.quarter as BIQuarter))}
                              onMouseEnter={() => setHoveredTrendPoint({ quarter: p.quarter, revenue: p.revenue, margin: p.margin, x: p.x, y: p.y })}
                              onMouseLeave={() => setHoveredTrendPoint(null)}
                            >
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={p.isSelected || isHovered ? 6 : 4}
                                fill={p.isSelected ? '#f59e0b' : '#6366f1'}
                                stroke="#ffffff"
                                strokeWidth="2"
                                className="transition-all"
                              />

                              {/* X Axis Label */}
                              <text
                                x={p.x}
                                y="156"
                                fill={p.isSelected ? '#f59e0b' : '#94a3b8'}
                                fontSize="9"
                                fontWeight={p.isSelected ? 'bold' : 'normal'}
                                textAnchor="middle"
                              >
                                {p.quarter}
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Floating Tooltip Summary below chart */}
              <div className="pt-2 border-t border-obsidian-800 flex items-center justify-between text-[11px] text-slate-400">
                {hoveredTrendPoint ? (
                  <span className="text-white font-mono">
                    <strong className="text-indigo-400">{hoveredTrendPoint.quarter}:</strong> €{(hoveredTrendPoint.revenue / 1000).toFixed(0)}k • Margen {hoveredTrendPoint.margin}%
                  </span>
                ) : (
                  <span>Pasa el cursor sobre los nodos para ver margen</span>
                )}
                <span className="font-mono text-indigo-300">
                  {selectedQuarter ? `Trimestre activo: ${selectedQuarter}` : 'Todos los trimestres'}
                </span>
              </div>
            </div>
          </div>

          {/* 1.3 PRODUCT PERFORMANCE TABLE WITH INSTANT SEARCH & SORT */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TableIcon className="w-4 h-4 text-emerald-400" />
                  <span>Rendimiento Detallado por Producto & Solución</span>
                </h3>
                <p className="text-[11px] text-slate-400">Filtro reactivo por dimensión, ordenación multi-columna y estado de margen</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar producto, categoría..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full bg-obsidian-950 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-obsidian-700 focus:outline-none focus:border-amber-500 transition-colors"
                />
                {tableSearch && (
                  <button onClick={() => setTableSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-obsidian-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-obsidian-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-obsidian-800">
                  <tr>
                    <th
                      className="px-4 py-2.5 cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        setTableSortColumn('product');
                        setTableSortAsc(tableSortColumn === 'product' ? !tableSortAsc : true);
                      }}
                    >
                      Producto {tableSortColumn === 'product' && (tableSortAsc ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-4 py-2.5 cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        setTableSortColumn('category');
                        setTableSortAsc(tableSortColumn === 'category' ? !tableSortAsc : true);
                      }}
                    >
                      Categoría {tableSortColumn === 'category' && (tableSortAsc ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-4 py-2.5 text-right cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        setTableSortColumn('units');
                        setTableSortAsc(tableSortColumn === 'units' ? !tableSortAsc : false);
                      }}
                    >
                      Unidades {tableSortColumn === 'units' && (tableSortAsc ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-4 py-2.5 text-right cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        setTableSortColumn('revenue');
                        setTableSortAsc(tableSortColumn === 'revenue' ? !tableSortAsc : false);
                      }}
                    >
                      Facturación (€) {tableSortColumn === 'revenue' && (tableSortAsc ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-4 py-2.5 text-right cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        setTableSortColumn('margin');
                        setTableSortAsc(tableSortColumn === 'margin' ? !tableSortAsc : false);
                      }}
                    >
                      Margen EBITDA (%) {tableSortColumn === 'margin' && (tableSortAsc ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-4 py-2.5 text-right cursor-pointer hover:text-white transition-colors"
                      onClick={() => {
                        setTableSortColumn('yoy');
                        setTableSortAsc(tableSortColumn === 'yoy' ? !tableSortAsc : false);
                      }}
                    >
                      YoY Growth {tableSortColumn === 'yoy' && (tableSortAsc ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-800">
                  {productPerformance.map((row) => (
                    <tr key={row.product} className="hover:bg-obsidian-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-white flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>{row.product}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">{row.category}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200">{formatNumber(row.units)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white">{formatCurrency(row.revenue)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 bg-obsidian-950 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, row.margin * 2)}%` }} />
                          </div>
                          <span className="font-mono text-emerald-400 font-medium">{row.margin}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400 font-medium">+{row.yoy}%</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.status === 'Excelente'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : row.status === 'En Meta'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {productPerformance.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                        No se han encontrado registros con los filtros activos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Custom Widgets Grid */}
          {widgets.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Widgets Personalizados Creados por el Usuario</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgets.map((w) => (
                  <div key={w.id} className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-white">{w.title}</span>
                      <span className="text-[10px] bg-obsidian-950 text-slate-400 px-1.5 py-0.5 rounded border border-obsidian-700 font-mono">
                        {w.type.toUpperCase()} • {w.dimension}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-400 my-2">
                      {w.measure === 'revenue' ? formatCurrency(kpis.revenue * 0.42) : `${kpis.marginEbitda}%`}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-obsidian-800 pt-2">
                      <span>Métrica: {w.measure}</span>
                      <button
                        onClick={() => setWidgets((prev) => prev.filter((item) => item.id !== w.id))}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: DUCKDB WASM SQL STUDIO
         ========================================== */}
      {activeTab === 'duckdb' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          {/* Quick Query Templates */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-300">Consultas Rápidas Preparadas:</span>
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
              <button
                onClick={() =>
                  setSqlQuery(
                    `-- 1. Top 10 Clientes por LTV Soberano\nSELECT\n  client_id,\n  company_name,\n  region,\n  COUNT(*) AS total_pedidos,\n  SUM(revenue) AS ltv_facturado,\n  ROUND(AVG((revenue - cost)/revenue * 100), 2) AS margen_promedio\nFROM enterprise_sales\nGROUP BY client_id, company_name, region\nORDER BY ltv_facturado DESC\nLIMIT 10;`
                  )
                }
                className="px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-xs font-mono text-cyan-300 border border-obsidian-700 transition-colors"
              >
                Top 10 Clientes LTV
              </button>

              <button
                onClick={() =>
                  setSqlQuery(
                    `-- 2. Margen Agregado por Región y Canal (CUBE OLAP)\nSELECT\n  region,\n  channel,\n  SUM(revenue) AS ingresos,\n  SUM(cost) AS coste_total,\n  ROUND((SUM(revenue) - SUM(cost)) / SUM(revenue) * 100, 2) AS ebitda_pct\nFROM sales_lakehouse\nGROUP BY CUBE(region, channel)\nORDER BY ingresos DESC;`
                  )
                }
                className="px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-xs font-mono text-amber-300 border border-obsidian-700 transition-colors"
              >
                Margen Región x Canal
              </button>

              <button
                onClick={() =>
                  setSqlQuery(
                    `-- 3. Detección Vectorial de Anomalías de Facturación (Z-Score > 2.5)\nWITH metric_stats AS (\n  SELECT AVG(revenue) AS media, STDDEV_POP(revenue) AS desviacion\n  FROM transactions_olap\n)\nSELECT\n  t.transaction_id,\n  t.region,\n  t.revenue,\n  ROUND((t.revenue - s.media) / s.desviacion, 3) AS z_score\nFROM transactions_olap t, metric_stats s\nWHERE ABS((t.revenue - s.media) / s.desviacion) > 2.5\nORDER BY z_score DESC;`
                  )
                }
                className="px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-xs font-mono text-emerald-300 border border-obsidian-700 transition-colors"
              >
                Detección de Anomalías
              </button>

              <button
                onClick={() =>
                  setSqlQuery(
                    `-- 4. Agregación Temporal Window Function (QoQ Growth)\nSELECT\n  quarter,\n  SUM(revenue) AS rev_actual,\n  LAG(SUM(revenue), 1) OVER (ORDER BY quarter) AS rev_previo,\n  ROUND((\n    (SUM(revenue) - LAG(SUM(revenue), 1) OVER (ORDER BY quarter)) /\n    LAG(SUM(revenue), 1) OVER (ORDER BY quarter) * 100\n  ), 2) AS qoq_growth_pct\nFROM sales_lakehouse\nGROUP BY quarter\nORDER BY quarter ASC;`
                  )
                }
                className="px-2.5 py-1 rounded bg-obsidian-950 hover:bg-obsidian-800 text-xs font-mono text-indigo-300 border border-obsidian-700 transition-colors"
              >
                Window Function QoQ
              </button>
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden flex flex-col flex-1 min-h-[220px]">
            <div className="bg-obsidian-950 px-4 py-2 border-b border-obsidian-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">DuckDB WASM SQL Studio</span>
                <span className="text-[10px] text-slate-500 font-mono">ANSI-SQL:2016 Compliant</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExecuteSQL}
                  disabled={isExecutingSQL}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isExecutingSQL ? 'animate-spin' : ''}`} />
                  <span>Ejecutar Consulta en DuckDB WASM</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-obsidian-950/90 font-mono text-xs flex-1">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                rows={7}
                className="w-full h-full bg-transparent text-emerald-300 focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/30"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Execution Metrics Banner */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-obsidian-900 to-obsidian-900 border border-cyan-800/40 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>{sqlMetrics.rowsProcessed} filas procesadas en {sqlMetrics.executionTimeMs} ms</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400">{sqlMetrics.cloudRequests} peticiones a la nube</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400">{sqlMetrics.sovereigntyPct}% soberano</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
                  <span>Motor: DuckDB WASM v1.1.2 SIMD</span>
                  <span>RAM: {sqlMetrics.ramMB} MB</span>
                  <span>Almacenamiento: Sovereign Local Cache</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400 font-mono">Zero-Cloud Latency</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Results Grid */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-obsidian-950 px-4 py-2 border-b border-obsidian-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Resultados de la Consulta ({sqlResults.length} registros devueltos)</span>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(sqlResults, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'duckdb_query_results.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center space-x-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                <Download className="w-3 h-3" />
                <span>Descargar CSV/JSON</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-obsidian-950/60 text-slate-400 text-[10px] uppercase border-b border-obsidian-800">
                  <tr>
                    {Object.keys(sqlResults[0] || {}).map((col) => (
                      <th key={col} className="px-4 py-2 font-bold tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-obsidian-800">
                  {sqlResults.map((row, idx) => (
                    <tr key={idx} className="hover:bg-obsidian-800/40 transition-colors">
                      {Object.values(row).map((val, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-2 text-slate-200">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: DISEÑADOR VISUAL DE CANALIZACIONES ETL
         ========================================== */}
      {activeTab === 'etl' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          {/* Header ETL Controls */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>Canalización de Datos No-Code (Visual ETL Pipeline)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Extracción Parquet local → Filtrado SIMD → Agregación Columnar → Carga en Almacén Local Soberano
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Progreso:</span>
                <div className="w-32 bg-obsidian-950 rounded-full h-2 overflow-hidden border border-obsidian-700">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${etlExecutionProgress}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">{etlExecutionProgress}%</span>
              </div>

              <button
                onClick={handleExecuteETLPipeline}
                disabled={isEtlPipelineRunning}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isEtlPipelineRunning ? 'animate-spin' : ''}`} />
                <span>{isEtlPipelineRunning ? 'Procesando Nodos...' : 'Ejecutar Canalización'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Pipeline Visual Diagram with Bezier Connectors */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
              {etlNodes.map((node) => {
                const isSelected = activeEtlNodeId === node.id;
                const statusColor =
                  node.status === 'success'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                    : node.status === 'running'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10 animate-pulse'
                    : 'border-obsidian-700 text-slate-400 bg-obsidian-950';

                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveEtlNodeId(node.id)}
                    className={`bg-obsidian-950 border-2 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/10'
                        : 'border-obsidian-800 hover:border-obsidian-700'
                    }`}
                  >
                    {/* Node Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        {node.category.toUpperCase()}
                      </span>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-mono border ${statusColor} flex items-center space-x-1`}>
                        {node.status === 'success' && <Check className="w-2.5 h-2.5" />}
                        {node.status === 'running' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                        <span>{node.status.toUpperCase()}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1 leading-snug">{node.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3 truncate">{node.subtitle}</p>

                    <div className="border-t border-obsidian-800 pt-2 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">{node.throughput}</span>
                      <span className="text-emerald-400 font-semibold">{node.latency}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connecting Visual SVG Indicator for Desktop */}
            <div className="hidden md:block mt-4 pt-3 border-t border-obsidian-800/60 text-center text-[11px] text-slate-500">
              <span>Flujo continuo canalizado mediante Streams WebAssembly Zero-Copy Memory</span>
            </div>
          </div>

          {/* Node Inspector & Properties Pane */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-5 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  i
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Inspector de Nodo: {activeEtlNode.title}</h4>
                  <p className="text-[11px] text-slate-400">{activeEtlNode.subtitle}</p>
                </div>
              </div>

              <div className="bg-obsidian-950 rounded-lg p-3 border border-obsidian-800 text-xs text-slate-300 leading-relaxed">
                {activeEtlNode.details}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-obsidian-950 p-2.5 rounded-lg border border-obsidian-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Entradas (Inputs)</span>
                  {activeEtlNode.inputs.map((inp) => (
                    <div key={inp} className="font-mono text-cyan-300 truncate text-[11px]">
                      • {inp}
                    </div>
                  ))}
                </div>

                <div className="bg-obsidian-950 p-2.5 rounded-lg border border-obsidian-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Salidas (Outputs)</span>
                  {activeEtlNode.outputs.map((out) => (
                    <div key={out} className="font-mono text-emerald-300 truncate text-[11px]">
                      • {out}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full md:w-80 bg-obsidian-950 p-4 rounded-xl border border-obsidian-800 flex flex-col justify-between">
              <div>
                <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Métricas de Ejecución</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-obsidian-800">
                    <span className="text-slate-400">Latencia de Paso:</span>
                    <span className="font-mono text-white font-bold">{activeEtlNode.latency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-obsidian-800">
                    <span className="text-slate-400">Throughput:</span>
                    <span className="font-mono text-cyan-400">{activeEtlNode.throughput}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-obsidian-800">
                    <span className="text-slate-400">Estado de Memoria:</span>
                    <span className="font-mono text-emerald-400">Local Cached (0 fugas)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-obsidian-800">
                    <span className="text-slate-400">Aislamiento Sandbox:</span>
                    <span className="font-mono text-white">Nivel Militar Soberano</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleExecuteETLPipeline}
                className="w-full mt-4 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-xs font-semibold text-white border border-obsidian-700 transition-colors"
              >
                Re-ejecutar Solo Este Nodo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: GENERADOR DE MÉTRICAS DAX / EXPRESIONES
         ========================================== */}
      {activeTab === 'dax' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
          {/* Header & Preset Selector */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Generador de Métricas DAX & Expresiones Analíticas Corporativas</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Fórmulas reactivas compiladas para el motor columnar OLAP local en WebAssembly
              </p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap">
              <button
                onClick={() =>
                  setDaxFormula(
                    `YoY_Growth = \nDIVIDE(\n    [Ventas_Actual] - [Ventas_Anterior],\n    [Ventas_Anterior],\n    0.0\n)`
                  )
                }
                className="px-2.5 py-1 bg-obsidian-950 hover:bg-obsidian-800 text-xs font-mono text-indigo-300 rounded border border-obsidian-700"
              >
                YoY_Growth
              </button>
              <button
                onClick={() =>
                  setDaxFormula(
                    `Customer_LTV = \nSUMX(\n    Clientes,\n    [Ticket_Medio] * [Frecuencia_Compra] * [Vida_Media_Anios]\n)`
                  )
                }
                className="px-2.5 py-1 bg-obsidian-950 hover:bg-obsidian-800 text-xs font-mono text-cyan-300 rounded border border-obsidian-700"
              >
                Customer_LTV
              </button>
              <button
                onClick={() =>
                  setDaxFormula(
                    `Churn_Rate = \nDIVIDE(\n    [Bajas_Periodo],\n    [Clientes_Inicio_Periodo],\n    0.0\n)`
                  )
                }
                className="px-2.5 py-1 bg-obsidian-950 hover:bg-obsidian-800 text-xs font-mono text-amber-300 rounded border border-obsidian-700"
              >
                Churn_Rate
              </button>
            </div>
          </div>

          {/* DAX Formula Editor with Live Syntax Validation */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-obsidian-950 px-4 py-2 border-b border-obsidian-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Editor de Expresión DAX</span>
              <div className="flex items-center space-x-2 text-[11px] font-mono">
                <span className="text-slate-400">Tokens: {daxValidationResult.tokensCount}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">AST Profundidad: {daxValidationResult.astDepth}</span>
              </div>
            </div>

            <div className="p-3 bg-obsidian-950/90 font-mono text-xs">
              <textarea
                value={daxFormula}
                onChange={(e) => setDaxFormula(e.target.value)}
                rows={6}
                className="w-full bg-transparent text-indigo-300 focus:outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
                spellCheck={false}
              />
            </div>

            {/* Validation Banner */}
            <div
              className={`px-4 py-2 text-xs font-mono flex items-center justify-between border-t ${
                daxValidationResult.isValid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                {daxValidationResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{daxValidationResult.message}</span>
              </div>

              <button
                onClick={() => {
                  if (!daxValidationResult.isValid) return;
                  const newM: DAXMeasure = {
                    id: `dax-${Date.now()}`,
                    name: daxFormula.split('=')[0]?.trim() || 'Custom_Measure',
                    expression: daxFormula.split('=').slice(1).join('=').trim() || daxFormula,
                    category: 'Personalizada',
                    returnType: 'Percentage',
                    description: 'Medida generada interactivamente desde el estudio DAX.',
                    computedValue: '+32.4%',
                    status: 'valid',
                  };
                  setDaxMeasures((prev) => [newM, ...prev]);
                  alert('¡Medida DAX añadida exitosamente al modelo semántico!');
                }}
                disabled={!daxValidationResult.isValid}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-sans font-medium text-xs disabled:opacity-40 transition-colors"
              >
                Añadir al Modelo
              </button>
            </div>
          </div>

          {/* Active Corporate Measures Catalog */}
          <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Catálogo de Medidas Corporativas DAX Compiladas ({daxMeasures.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daxMeasures.map((measure) => (
                <div key={measure.id} className="bg-obsidian-950 border border-obsidian-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white font-mono">{measure.name}</span>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 font-mono">
                        {measure.returnType}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-2">{measure.description}</p>

                    <div className="bg-obsidian-900 p-2 rounded border border-obsidian-800 font-mono text-[10px] text-slate-300 break-words mb-3">
                      {measure.expression}
                    </div>
                  </div>

                  <div className="border-t border-obsidian-800 pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Valor Actual:</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">{measure.computedValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: NUEVO WIDGET
         ========================================== */}
      {isNewWidgetModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Añadir Nuevo Widget Analítico</h3>
              </div>
              <button onClick={() => setIsNewWidgetModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWidget} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Título del Widget</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Facturación por Segmento Enterprise"
                  value={newWidgetTitle}
                  onChange={(e) => setNewWidgetTitle(e.target.value)}
                  className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Gráfico</label>
                  <select
                    value={newWidgetType}
                    onChange={(e) => setNewWidgetType(e.target.value as any)}
                    className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="kpi">Tarjeta de Métrica KPI</option>
                    <option value="bar">Gráfico de Barras SVG</option>
                    <option value="donut">Gráfico Donut SVG</option>
                    <option value="table">Tabla Detallada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Dimensión</label>
                  <select
                    value={newWidgetDimension}
                    onChange={(e) => setNewWidgetDimension(e.target.value)}
                    className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="region">Región Geográfica</option>
                    <option value="channel">Canal Comercial</option>
                    <option value="quarter">Trimestre Temporal</option>
                    <option value="product">Línea de Producto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Métrica de Cálculo</label>
                <select
                  value={newWidgetMeasure}
                  onChange={(e) => setNewWidgetMeasure(e.target.value)}
                  className="w-full bg-obsidian-950 border border-obsidian-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="revenue">Facturación Total (€)</option>
                  <option value="margin">Margen EBITDA (%)</option>
                  <option value="units">Unidades Vendidas</option>
                  <option value="clients">Clientes Activos</option>
                </select>
              </div>

              <div className="pt-3 border-t border-obsidian-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewWidgetModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-obsidian-800 text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-obsidian-950 font-bold"
                >
                  Crear Widget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EXPORTAR INFORME
         ========================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 border border-obsidian-700 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileDown className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Exportar Informe Analítico Soberano</h3>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Selecciona el formato para generar el informe con las particiones y filtros actualmente seleccionados:
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('pdf')}
                  className={`p-3 rounded-lg border text-center font-medium transition-all ${
                    exportFormat === 'pdf'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-obsidian-700 bg-obsidian-950 text-slate-400'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 mx-auto mb-1 text-red-400" />
                  <span>Informe PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('excel')}
                  className={`p-3 rounded-lg border text-center font-medium transition-all ${
                    exportFormat === 'excel'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-obsidian-700 bg-obsidian-950 text-slate-400'
                  }`}
                >
                  <TableIcon className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <span>Excel / CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-lg border text-center font-medium transition-all ${
                    exportFormat === 'json'
                      ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                      : 'border-obsidian-700 bg-obsidian-950 text-slate-400'
                  }`}
                >
                  <Code2 className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                  <span>JSON DuckDB</span>
                </button>
              </div>

              <div className="bg-obsidian-950 p-3 rounded-lg border border-obsidian-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Facturación Filtrada:</span>
                  <strong className="text-white font-mono">{formatCurrency(kpis.revenue)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Márgen EBITDA:</span>
                  <strong className="text-emerald-400 font-mono">{kpis.marginEbitda}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Seguridad:</span>
                  <strong className="text-cyan-400 font-mono">Sanitizado sin telemetría</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-obsidian-800 flex items-center justify-end space-x-2 text-xs">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-3 py-2 rounded-lg bg-obsidian-800 text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleExportReport}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold"
              >
                Descargar Informe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataWarehouseBIView;
