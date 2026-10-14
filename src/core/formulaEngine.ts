import { SecuritySanitizer } from './securitySanitizer';

export class FormulaEngine {
  /**
   * Expands an Excel coordinate range into an array of individual cell coordinates.
   * e.g. "A1:A4" -> ["A1", "A2", "A3", "A4"]
   * "A1:B2" -> ["A1", "A2", "B1", "B2"]
   */
  public static expandRange(range: string): string[] {
    const parts = range.split(':');
    if (parts.length !== 2) return [range.toUpperCase().trim()];

    const start = parts[0].trim().toUpperCase();
    const end = parts[1].trim().toUpperCase();

    const startColMatch = start.match(/^[A-Z]+/);
    const startRowMatch = start.match(/\d+$/);
    const endColMatch = end.match(/^[A-Z]+/);
    const endRowMatch = end.match(/\d+$/);

    if (!startColMatch || !startRowMatch || !endColMatch || !endRowMatch) {
      return [start, end];
    }

    const startCol = startColMatch[0].charCodeAt(0);
    const endCol = endColMatch[0].charCodeAt(0);
    const startRow = parseInt(startRowMatch[0], 10);
    const endRow = parseInt(endRowMatch[0], 10);

    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    // Bounded expansion to prevent Denial of Service on enormous coordinate requests
    const maxAllowedRows = 500;
    const effectiveMaxRow = Math.min(maxRow, minRow + maxAllowedRows);
    const maxAllowedCols = 26;
    const effectiveMaxCol = Math.min(maxCol, minCol + maxAllowedCols);

    const result: string[] = [];
    for (let c = minCol; c <= effectiveMaxCol; c++) {
      const colLetter = String.fromCharCode(c);
      for (let r = minRow; r <= effectiveMaxRow; r++) {
        result.push(`${colLetter}${r}`);
      }
    }
    return result;
  }

  /**
   * Evaluates a formula or raw user string in the context of the entire sheet's cells.
   */
  public static evaluateCell(
    raw: string,
    allCells: Record<string, { raw: string; computed: string | number }>,
    visitedCells: Set<string> = new Set()
  ): string | number {
    if (!raw) return '';
    const trimmed = raw.trim();

    // Security check against DDE injection
    const { cleanInput, wasThreatBlocked } = SecuritySanitizer.sanitizeFormulaInput(trimmed);
    if (wasThreatBlocked) {
      return '#ERROR!';
    }

    // Pure numeric literal (e.g. "42", "-15.5", "+10")
    if (!isNaN(Number(cleanInput)) && cleanInput !== '') {
      return Number(cleanInput);
    }

    // Formulas start with '=', '+', or '@'
    const isFormula = cleanInput.startsWith('=') || cleanInput.startsWith('+') || cleanInput.startsWith('@');
    if (!isFormula) {
      return cleanInput;
    }

    const expr = cleanInput.replace(/^[=+@]/, '').trim();

    try {
      // 1. Check for standard functions: SUM, AVERAGE/AVG, MAX, MIN, COUNT, IF
      const funcMatch = expr.match(/^([A-Z]+)\((.*)\)$/i);
      if (funcMatch) {
        const funcName = funcMatch[1].toUpperCase();
        const argsStr = funcMatch[2].trim();

        if (funcName === 'SUM' || funcName === 'AVERAGE' || funcName === 'AVG' || funcName === 'MAX' || funcName === 'MIN' || funcName === 'COUNT') {
          const cellsToAggregate = this.getCellsFromArgs(argsStr);
          const numbers: number[] = [];

          for (const cellKey of cellsToAggregate) {
            if (visitedCells.has(cellKey)) {
              return '#CIRCULAR!';
            }
            const target = allCells[cellKey];
            let cellVal: string | number = target?.computed;
            if (target?.raw && this.isFormulaString(target.raw)) {
              const nextVisited = new Set(visitedCells);
              nextVisited.add(cellKey);
              cellVal = this.evaluateCell(target.raw, allCells, nextVisited);
            } else if (cellVal === '' || cellVal === undefined) {
              cellVal = target?.raw ?? 0;
            }
            if (cellVal === '#CIRCULAR!') {
              return '#CIRCULAR!';
            }
            const num = Number(cellVal);
            if (!isNaN(num)) numbers.push(num);
          }

          if (funcName === 'SUM') {
            return numbers.reduce((a, b) => a + b, 0);
          }
          if (funcName === 'AVERAGE' || funcName === 'AVG') {
            return numbers.length ? Number((numbers.reduce((a, b) => a + b, 0) / numbers.length).toFixed(2)) : 0;
          }
          if (funcName === 'MAX') {
            return numbers.length ? Math.max(...numbers) : 0;
          }
          if (funcName === 'MIN') {
            return numbers.length ? Math.min(...numbers) : 0;
          }
          if (funcName === 'COUNT') {
            return numbers.length;
          }
        }

        // IF condition: =IF(A1 > 100, "Alto", "Bajo")
        if (funcName === 'IF') {
          const parts = argsStr.split(',').map((s) => s.trim());
          if (parts.length >= 2) {
            const condition = parts[0];
            const trueBranch = parts[1].replace(/^["']|["']$/g, '');
            const falseBranch = (parts[2] || '').replace(/^["']|["']$/g, '');

            const resolvedCond = this.substituteCellRefs(condition, allCells, visitedCells);
            // Safe evaluation of simple comparison
            const condResult = this.evalSimpleCondition(resolvedCond);
            return condResult ? trueBranch : falseBranch;
          }
        }
      }

      // 2. Direct arithmetic formula evaluation, e.g. "A1 + B2 * 1.21"
      const resolvedArithmetic = this.substituteCellRefs(expr, allCells, visitedCells);
      return this.evalArithmeticExpression(resolvedArithmetic);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === '#CIRCULAR!') {
        return '#CIRCULAR!';
      }
      return '#VALUE!';
    }
  }

  private static getCellsFromArgs(argsStr: string): string[] {
    const tokens = argsStr.split(/[,;]/).map((t) => t.trim());
    const cellKeys: string[] = [];
    for (const token of tokens) {
      if (token.includes(':')) {
        cellKeys.push(...this.expandRange(token));
      } else if (/^[A-Z]+\d+$/i.test(token)) {
        cellKeys.push(token.toUpperCase());
      }
    }
    return cellKeys;
  }

  private static substituteCellRefs(
    expr: string,
    allCells: Record<string, { raw: string; computed: string | number }>,
    visited: Set<string>
  ): string {
    return expr.replace(/\b([A-Z]+\d+)\b/gi, (match) => {
      const key = match.toUpperCase();
      if (visited.has(key)) {
        throw new Error('#CIRCULAR!');
      }

      const targetCell = allCells[key];
      if (!targetCell) return '0';

      let cellVal: string | number = targetCell.computed;
      if (targetCell.raw && this.isFormulaString(targetCell.raw)) {
        const nextVisited = new Set(visited);
        nextVisited.add(key);
        cellVal = this.evaluateCell(targetCell.raw, allCells, nextVisited);
      } else if (cellVal === '' || cellVal === undefined) {
        cellVal = targetCell.raw ?? 0;
      }

      if (cellVal === '#CIRCULAR!') {
        throw new Error('#CIRCULAR!');
      }

      const num = Number(cellVal);
      return isNaN(num) ? '0' : String(num);
    });
  }

  private static evalSimpleCondition(condStr: string): boolean {
    const ops = ['>=', '<=', '!=', '==', '=', '>', '<'];
    for (const op of ops) {
      if (condStr.includes(op)) {
        const [left, right] = condStr.split(op).map((s) => Number(s.trim()));
        if (!isNaN(left) && !isNaN(right)) {
          if (op === '>=') return left >= right;
          if (op === '<=') return left <= right;
          if (op === '!=' || op === '<>') return left !== right;
          if (op === '==' || op === '=') return left === right;
          if (op === '>') return left > right;
          if (op === '<') return left < right;
        }
      }
    }
    return false;
  }

  private static evalArithmeticExpression(expr: string): number | string {
    // Sanitize: only allow numbers, basic math operators and parentheses
    if (!/^[0-9+\-*/().\s^%]+$/.test(expr)) {
      return '#ERROR!';
    }
    try {
      // Safe mathematical calculation via Function without scope leakage
      const sanitizedExpr = expr.replace(/\^/g, '**');
      const result = new Function(`"use strict"; return (${sanitizedExpr});`)();
      if (typeof result === 'number' && !isNaN(result)) {
        if (!isFinite(result)) return '#DIV/0!';
        return Number.isInteger(result) ? result : Number(result.toFixed(2));
      }
      return '#ERROR!';
    } catch {
      return '#ERROR!';
    }
  }

  private static isFormulaString(raw: string): boolean {
    if (!raw) return false;
    const trimmed = raw.trim();
    if (!isNaN(Number(trimmed)) && trimmed !== '') return false;
    return trimmed.startsWith('=') || trimmed.startsWith('+') || trimmed.startsWith('@');
  }

  /**
   * Recalculates all cells in a sheet in reactive order.
   */
  public static recalculateSheet(
    cells: Record<string, { raw: string; computed: string | number }>
  ): Record<string, { raw: string; computed: string | number }> {
    const updated: Record<string, { raw: string; computed: string | number }> = {};
    const coords = Object.keys(cells);

    // Initial pass
    for (const coord of coords) {
      const raw = cells[coord].raw;
      updated[coord] = {
        ...cells[coord],
        computed: this.evaluateCell(raw, cells, new Set([coord])),
      };
    }

    // Second stabilization pass for dependent cells
    for (const coord of coords) {
      if (this.isFormulaString(cells[coord].raw)) {
        updated[coord].computed = this.evaluateCell(cells[coord].raw, updated, new Set([coord]));
      }
    }

    return updated;
  }
}
