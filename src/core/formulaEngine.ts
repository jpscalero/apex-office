import { SecuritySanitizer } from './securitySanitizer';

/**
 * Recursive descent arithmetic parser that supports:
 * numbers, unary +/-, binary +, -, *, /, ^ (right-associative power), % (postfix percentage and binary modulo),
 * parentheses, and safe math functions.
 * Pure AST traversal with zero dynamic code compilation.
 */
class RecursiveDescentArithmeticParser {
  private input: string;
  private pos: number = 0;

  constructor(input: string) {
    this.input = input.trim();
    this.pos = 0;
  }

  public parse(): number {
    this.skipWhitespace();
    if (this.pos >= this.input.length) {
      throw new Error('#ERROR!');
    }
    const result = this.parseExpression();
    this.skipWhitespace();
    if (this.pos < this.input.length) {
      throw new Error('#ERROR!');
    }
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      throw new Error('#ERROR!');
    }
    return result;
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private peek(): string {
    this.skipWhitespace();
    return this.pos < this.input.length ? this.input[this.pos] : '';
  }

  private parseExpression(): number {
    return this.parseAdditive();
  }

  // Additive: + and -
  private parseAdditive(): number {
    let left = this.parseMultiplicative();
    while (true) {
      this.skipWhitespace();
      const op = this.peek();
      if (op === '+' || op === '-') {
        this.pos++;
        const right = this.parseMultiplicative();
        if (op === '+') left = left + right;
        else left = left - right;
        if (!isFinite(left)) throw new Error('#ERROR!');
      } else {
        break;
      }
    }
    return left;
  }

  // Multiplicative: *, /, and binary modulo %
  private parseMultiplicative(): number {
    let left = this.parsePower();
    while (true) {
      this.skipWhitespace();
      const op = this.peek();
      if (op === '*' || op === '/' || (op === '%' && this.isBinaryModulo())) {
        this.pos++;
        const right = this.parsePower();
        if (op === '*') {
          left = left * right;
        } else if (op === '/') {
          if (right === 0) throw new Error('#DIV/0!');
          left = left / right;
        } else if (op === '%') {
          if (right === 0) throw new Error('#DIV/0!');
          left = left % right;
        }
        if (!isFinite(left)) throw new Error('#ERROR!');
      } else {
        break;
      }
    }
    return left;
  }

  // Checks whether the '%' at current position is followed by an operand (binary modulo)
  // or is a postfix percentage operator
  private isBinaryModulo(): boolean {
    if (this.peek() !== '%') return false;
    let p = this.pos + 1;
    while (p < this.input.length && /\s/.test(this.input[p])) {
      p++;
    }
    if (p >= this.input.length) return false;
    const nextChar = this.input[p];
    if (/[0-9.(]/.test(nextChar)) return true;
    if (/[A-Za-z]/.test(nextChar)) return true;
    if (/[+-]/.test(nextChar)) {
      let p2 = p + 1;
      while (p2 < this.input.length && /\s/.test(this.input[p2])) p2++;
      if (p2 < this.input.length && /[0-9.(A-Za-z]/.test(this.input[p2])) return true;
    }
    return false;
  }

  // Power: ^ (RIGHT-ASSOCIATIVE: a ^ b ^ c = a ^ (b ^ c))
  private parsePower(): number {
    let left = this.parseUnary();
    this.skipWhitespace();
    if (this.peek() === '^') {
      this.pos++;
      const right = this.parsePower();
      if (left === 0 && right < 0) {
        throw new Error('#DIV/0!');
      }
      const res = Math.pow(left, right);
      if (!isFinite(res)) {
        throw new Error('#ERROR!');
      }
      return res;
    }
    return left;
  }

  // Unary: + and -
  private parseUnary(): number {
    this.skipWhitespace();
    const char = this.peek();
    if (char === '+') {
      this.pos++;
      return +this.parseUnary();
    }
    if (char === '-') {
      this.pos++;
      return -this.parseUnary();
    }
    return this.parsePostfix();
  }

  // Postfix: % (percentage operator: 50% -> 0.5)
  private parsePostfix(): number {
    let val = this.parsePrimary();
    this.skipWhitespace();
    while (this.peek() === '%' && !this.isBinaryModulo()) {
      this.pos++;
      val = val / 100;
      this.skipWhitespace();
    }
    return val;
  }

  // Primary: Number, Parenthesized expression, or safe math function
  private parsePrimary(): number {
    this.skipWhitespace();
    const char = this.peek();

    if (char === '(') {
      this.pos++;
      const val = this.parseExpression();
      this.skipWhitespace();
      if (this.peek() !== ')') {
        throw new Error('#ERROR!');
      }
      this.pos++;
      return val;
    }

    if (/[0-9.]/.test(char)) {
      const start = this.pos;
      let hasDot = false;
      while (this.pos < this.input.length) {
        const c = this.input[this.pos];
        if (/[0-9]/.test(c)) {
          this.pos++;
        } else if (c === '.' && !hasDot) {
          hasDot = true;
          this.pos++;
        } else {
          break;
        }
      }
      if (this.pos < this.input.length && (this.input[this.pos] === 'e' || this.input[this.pos] === 'E')) {
        const expStart = this.pos;
        this.pos++;
        if (this.pos < this.input.length && (this.input[this.pos] === '+' || this.input[this.pos] === '-')) {
          this.pos++;
        }
        let expDigits = 0;
        while (this.pos < this.input.length && /[0-9]/.test(this.input[this.pos])) {
          this.pos++;
          expDigits++;
        }
        if (expDigits === 0) {
          this.pos = expStart;
        }
      }

      const numStr = this.input.substring(start, this.pos);
      const num = Number(numStr);
      if (isNaN(num)) {
        throw new Error('#ERROR!');
      }
      return num;
    }

    if (/[A-Za-z]/.test(char)) {
      const start = this.pos;
      while (this.pos < this.input.length && /[A-Za-z0-9_.]/.test(this.input[this.pos])) {
        this.pos++;
      }
      const rawIdent = this.input.substring(start, this.pos);
      const ident = rawIdent.replace(/^Math\./i, '').toUpperCase();

      this.skipWhitespace();
      if (this.peek() === '(') {
        this.pos++;
        const args: number[] = [];
        this.skipWhitespace();
        if (this.peek() !== ')') {
          while (true) {
            args.push(this.parseExpression());
            this.skipWhitespace();
            if (this.peek() === ',' || this.peek() === ';') {
              this.pos++;
              continue;
            }
            break;
          }
        }
        this.skipWhitespace();
        if (this.peek() !== ')') {
          throw new Error('#ERROR!');
        }
        this.pos++;

        return this.evalMathFunction(ident, args);
      } else {
        if (ident === 'PI') return Math.PI;
        if (ident === 'E') return Math.E;
        throw new Error('#ERROR!');
      }
    }

    throw new Error('#ERROR!');
  }

  private evalMathFunction(name: string, args: number[]): number {
    switch (name) {
      case 'ABS':
        if (args.length < 1) throw new Error('#VALUE!');
        return Math.abs(args[0]);
      case 'ROUND': {
        if (args.length < 1) throw new Error('#VALUE!');
        const decimals = args[1] !== undefined ? Math.trunc(args[1]) : 0;
        const factor = Math.pow(10, decimals);
        return Math.round(args[0] * factor) / factor;
      }
      case 'SQRT':
        if (args.length < 1 || args[0] < 0) throw new Error('#ERROR!');
        return Math.sqrt(args[0]);
      case 'SIN':
        return Math.sin(args[0]);
      case 'COS':
        return Math.cos(args[0]);
      case 'TAN':
        return Math.tan(args[0]);
      case 'LOG':
      case 'LN':
        if (args.length < 1 || args[0] <= 0) throw new Error('#ERROR!');
        return Math.log(args[0]);
      case 'EXP':
        return Math.exp(args[0]);
      case 'FLOOR':
        return Math.floor(args[0]);
      case 'CEIL':
        return Math.ceil(args[0]);
      case 'POW':
      case 'POWER':
        return Math.pow(args[0], args[1]);
      case 'MOD':
        if (args[1] === 0) throw new Error('#DIV/0!');
        return args[0] % args[1];
      case 'MIN':
        return Math.min(...args);
      case 'MAX':
        return Math.max(...args);
      default:
        throw new Error('#ERROR!');
    }
  }
}

export class FormulaEngine {
  /**
   * Converts a column letter to a 1-based index (A=1, Z=26, AA=27...)
   */
  public static colToIndex(col: string): number {
    const upper = col.toUpperCase().trim();
    let index = 0;
    for (let i = 0; i < upper.length; i++) {
      const code = upper.charCodeAt(i) - 64;
      if (code < 1 || code > 26) return 0;
      index = index * 26 + code;
    }
    return index;
  }

  /**
   * Converts a 1-based index to a column letter (1=A, 26=Z, 27=AA...)
   */
  public static indexToCol(idx: number): string {
    let temp = idx;
    let col = '';
    while (temp > 0) {
      const rem = (temp - 1) % 26;
      col = String.fromCharCode(65 + rem) + col;
      temp = Math.floor((temp - 1) / 26);
    }
    return col;
  }

  /**
   * Expands an Excel coordinate range into an array of individual cell coordinates.
   * Supports multi-letter columns (e.g. "AA1:AB3" -> ["AA1", "AA2", "AA3", "AB1", "AB2", "AB3"]).
   * Safe limit of 10,000 cells; overflows trigger console.warn and return ['#RANGE!'].
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

    const startCol = this.colToIndex(startColMatch[0]);
    const endCol = this.colToIndex(endColMatch[0]);
    const startRow = parseInt(startRowMatch[0], 10);
    const endRow = parseInt(endRowMatch[0], 10);

    if (startCol === 0 || endCol === 0 || isNaN(startRow) || isNaN(endRow)) {
      return [start, end];
    }

    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    const totalCells = (maxCol - minCol + 1) * (maxRow - minRow + 1);
    if (totalCells > 10000) {
      console.warn(`expandRange exceeded limit: ${totalCells} cells requested for range ${range}`);
      return ['#RANGE!'];
    }

    const result: string[] = [];
    for (let c = minCol; c <= maxCol; c++) {
      const colLetter = this.indexToCol(c);
      for (let r = minRow; r <= maxRow; r++) {
        result.push(`${colLetter}${r}`);
      }
    }
    return result;
  }

  /**
   * Splits function arguments by comma or semicolon outside of quotes and parentheses.
   */
  public static splitArgs(argsStr: string): string[] {
    const args: string[] = [];
    let current = '';
    let inDouble = false;
    let inSingle = false;
    let parenDepth = 0;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '"' && !inSingle) {
        inDouble = !inDouble;
        current += char;
      } else if (char === "'" && !inDouble) {
        inSingle = !inSingle;
        current += char;
      } else if (char === '(' && !inDouble && !inSingle) {
        parenDepth++;
        current += char;
      } else if (char === ')' && !inDouble && !inSingle) {
        parenDepth--;
        current += char;
      } else if ((char === ',' || char === ';') && !inDouble && !inSingle && parenDepth === 0) {
        args.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim() !== '' || args.length > 0) {
      args.push(current.trim());
    }
    return args;
  }

  /**
   * Helper to retrieve and evaluate a cell value with circular dependency detection.
   */
  private static getCellValue(
    key: string,
    allCells: Record<string, { raw: string; computed: string | number }>,
    visited: Set<string>
  ): string | number {
    if (visited.has(key)) {
      throw new Error('#CIRCULAR!');
    }
    const target = allCells[key];
    if (!target) return '';

    if (target.raw && this.isFormulaString(target.raw)) {
      const nextVisited = new Set(visited);
      nextVisited.add(key);
      const val = this.evaluateCell(target.raw, allCells, nextVisited);
      if (val === '#CIRCULAR!') {
        throw new Error('#CIRCULAR!');
      }
      return val;
    }

    if (target.computed !== undefined && target.computed !== '') {
      return target.computed;
    }
    return target.raw ?? '';
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
      // 1. Check for standard functions: SUM, AVERAGE/AVG, MAX, MIN, COUNT, IF, VLOOKUP, ROUND, ABS, CONCAT
      const funcMatch = expr.match(/^([A-Z]+)\(([\s\S]*)\)$/i);
      if (funcMatch) {
        const funcName = funcMatch[1].toUpperCase();
        const argsStr = funcMatch[2].trim();

        if (
          funcName === 'SUM' ||
          funcName === 'AVERAGE' ||
          funcName === 'AVG' ||
          funcName === 'MAX' ||
          funcName === 'MIN' ||
          funcName === 'COUNT'
        ) {
          const cellsToAggregate = this.getCellsFromArgs(argsStr);
          const numbers: number[] = [];

          for (const cellKey of cellsToAggregate) {
            if (cellKey === '#RANGE!') return '#RANGE!';
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
            // Full number returned without premature toFixed(2)
            return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
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

        // IF condition: =IF(B2>5, "La celda B2 es alta", "baja")
        if (funcName === 'IF') {
          const parts = this.splitArgs(argsStr);
          if (parts.length >= 2) {
            const condition = parts[0];
            const trueBranchRaw = parts[1];
            const falseBranchRaw = parts[2] !== undefined ? parts[2] : '';

            const resolvedCond = this.substituteCellRefs(condition, allCells, visitedCells);
            const condResult = this.evalSimpleCondition(resolvedCond);
            if (condResult === '#VALUE!') {
              return '#VALUE!';
            }

            const chosen = condResult ? trueBranchRaw : falseBranchRaw;
            if (
              (chosen.startsWith('"') && chosen.endsWith('"')) ||
              (chosen.startsWith("'") && chosen.endsWith("'"))
            ) {
              return chosen.slice(1, -1);
            }
            if (/^[A-Z]+[0-9]+$/i.test(chosen)) {
              return this.getCellValue(chosen.toUpperCase(), allCells, visitedCells);
            }
            if (this.isFormulaString(chosen)) {
              return this.evaluateCell(chosen, allCells, visitedCells);
            }
            if (!isNaN(Number(chosen)) && chosen !== '') {
              return Number(chosen);
            }
            const res = this.evalArithmeticExpression(this.substituteCellRefs(chosen, allCells, visitedCells));
            return res === '#ERROR!' ? chosen : res;
          }
        }

        // VLOOKUP(valor_buscado, rango, indice_col, [aprox=FALSE])
        if (funcName === 'VLOOKUP') {
          const parts = this.splitArgs(argsStr);
          if (parts.length < 3) return '#VALUE!';

          const lookupRaw = parts[0];
          const rangeStr = parts[1];
          const colIndexRaw = parts[2];
          const approxRaw = parts[3];

          // Resolve lookup value
          let lookupVal: string | number;
          if (/^[A-Z]+[0-9]+$/i.test(lookupRaw)) {
            lookupVal = this.getCellValue(lookupRaw.toUpperCase(), allCells, visitedCells);
          } else if (
            (lookupRaw.startsWith('"') && lookupRaw.endsWith('"')) ||
            (lookupRaw.startsWith("'") && lookupRaw.endsWith("'"))
          ) {
            lookupVal = lookupRaw.slice(1, -1);
          } else if (!isNaN(Number(lookupRaw))) {
            lookupVal = Number(lookupRaw);
          } else {
            lookupVal = lookupRaw;
          }

          // Resolve column index
          let colIndex: number;
          if (/^[A-Z]+[0-9]+$/i.test(colIndexRaw)) {
            const v = this.getCellValue(colIndexRaw.toUpperCase(), allCells, visitedCells);
            colIndex = parseInt(String(v), 10);
          } else {
            colIndex = parseInt(colIndexRaw, 10);
          }
          if (isNaN(colIndex) || colIndex < 1) {
            return '#REF!';
          }

          // Parse range
          const rangeParts = rangeStr.split(':');
          if (rangeParts.length !== 2) return '#REF!';

          const startCoord = rangeParts[0].trim().toUpperCase();
          const endCoord = rangeParts[1].trim().toUpperCase();

          const startColMatch = startCoord.match(/^[A-Z]+/);
          const startRowMatch = startCoord.match(/\d+$/);
          const endColMatch = endCoord.match(/^[A-Z]+/);
          const endRowMatch = endCoord.match(/\d+$/);
          if (!startColMatch || !startRowMatch || !endColMatch || !endRowMatch) {
            return '#REF!';
          }

          const startColIdx = this.colToIndex(startColMatch[0]);
          const endColIdx = this.colToIndex(endColMatch[0]);
          const startRow = parseInt(startRowMatch[0], 10);
          const endRow = parseInt(endRowMatch[0], 10);

          const minCol = Math.min(startColIdx, endColIdx);
          const maxCol = Math.max(startColIdx, endColIdx);
          const minRow = Math.min(startRow, endRow);
          const maxRow = Math.max(startRow, endRow);

          const totalCols = maxCol - minCol + 1;
          if (colIndex > totalCols) {
            return '#REF!';
          }

          const isApprox = approxRaw
            ? approxRaw.trim().toUpperCase() === 'TRUE' || approxRaw.trim() === '1'
            : false;

          const lookupColLetter = this.indexToCol(minCol);
          const targetColLetter = this.indexToCol(minCol + colIndex - 1);

          if (!isApprox) {
            for (let r = minRow; r <= maxRow; r++) {
              const cellKey = `${lookupColLetter}${r}`;
              const cellVal = this.getCellValue(cellKey, allCells, visitedCells);

              let isMatch = false;
              if (typeof lookupVal === 'number') {
                isMatch = Number(cellVal) === lookupVal;
              } else {
                isMatch = String(cellVal).toLowerCase() === String(lookupVal).toLowerCase();
              }

              if (isMatch) {
                const targetKey = `${targetColLetter}${r}`;
                return this.getCellValue(targetKey, allCells, visitedCells);
              }
            }
            return '#N/A';
          } else {
            let bestRow = -1;
            for (let r = minRow; r <= maxRow; r++) {
              const cellKey = `${lookupColLetter}${r}`;
              const cellVal = this.getCellValue(cellKey, allCells, visitedCells);

              let cmp = 0;
              if (typeof lookupVal === 'number') {
                const numVal = Number(cellVal);
                cmp = numVal <= lookupVal ? -1 : 1;
              } else {
                cmp = String(cellVal).localeCompare(String(lookupVal));
              }

              if (cmp <= 0) {
                bestRow = r;
              } else {
                break;
              }
            }

            if (bestRow !== -1) {
              const targetKey = `${targetColLetter}${bestRow}`;
              return this.getCellValue(targetKey, allCells, visitedCells);
            }
            return '#N/A';
          }
        }

        // ROUND(x, n)
        if (funcName === 'ROUND') {
          const parts = this.splitArgs(argsStr);
          if (parts.length < 1) return '#VALUE!';
          const xStr = this.substituteCellRefs(parts[0], allCells, visitedCells);
          const xVal = Number(this.evalArithmeticExpression(xStr));
          let decimals = 0;
          if (parts.length >= 2) {
            const dStr = this.substituteCellRefs(parts[1], allCells, visitedCells);
            decimals = parseInt(String(this.evalArithmeticExpression(dStr)), 10);
            if (isNaN(decimals)) decimals = 0;
          }
          if (isNaN(xVal)) return '#VALUE!';
          const factor = Math.pow(10, decimals);
          return Math.round(xVal * factor) / factor;
        }

        // ABS(x)
        if (funcName === 'ABS') {
          const parts = this.splitArgs(argsStr);
          if (parts.length < 1) return '#VALUE!';
          const xStr = this.substituteCellRefs(parts[0], allCells, visitedCells);
          const xVal = Number(this.evalArithmeticExpression(xStr));
          if (isNaN(xVal)) return '#VALUE!';
          return Math.abs(xVal);
        }

        // CONCAT(...)
        if (funcName === 'CONCAT' || funcName === 'CONCATENATE') {
          const parts = this.splitArgs(argsStr);
          let result = '';
          for (const part of parts) {
            if (part.includes(':')) {
              const cells = this.expandRange(part);
              for (const cellKey of cells) {
                if (cellKey === '#RANGE!') return '#RANGE!';
                result += String(this.getCellValue(cellKey, allCells, visitedCells));
              }
            } else if (/^[A-Z]+[0-9]+$/i.test(part)) {
              result += String(this.getCellValue(part.toUpperCase(), allCells, visitedCells));
            } else if (
              (part.startsWith('"') && part.endsWith('"')) ||
              (part.startsWith("'") && part.endsWith("'"))
            ) {
              result += part.slice(1, -1);
            } else {
              result += part;
            }
          }
          return result;
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
    const tokens = this.splitArgs(argsStr);
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

  /**
   * Substitutes cell coordinates with their values, strictly excluding coordinates
   * that appear inside quoted text literals ("..." or '...').
   */
  private static substituteCellRefs(
    expr: string,
    allCells: Record<string, { raw: string; computed: string | number }>,
    visited: Set<string>
  ): string {
    const pattern = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|\b([A-Z]+[0-9]+)\b/gi;
    return expr.replace(pattern, (match, _doubleQuoted, _singleQuoted, cellRef) => {
      // Exclude coordinates within quoted text literals
      if (match.startsWith('"') || match.startsWith("'")) {
        return match;
      }

      const key = (cellRef || match).toUpperCase();
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

      if (cellVal === '' || cellVal === undefined || cellVal === null) {
        return '0';
      }

      const num = Number(cellVal);
      if (!isNaN(num) && typeof cellVal !== 'boolean' && String(cellVal).trim() !== '') {
        return String(num);
      }

      const strVal = String(cellVal);
      if ((strVal.startsWith('"') && strVal.endsWith('"')) || (strVal.startsWith("'") && strVal.endsWith("'"))) {
        return strVal;
      }
      return JSON.stringify(strVal);
    });
  }

  /**
   * Evaluates comparison conditions with support for numeric and text comparisons ("a"="a", "x"!="y").
   * Returns '#VALUE!' if parsing fails.
   */
  public static evalSimpleCondition(condStr: string): boolean | '#VALUE!' {
    const trimmed = condStr.trim();
    if (!trimmed) return '#VALUE!';

    if (trimmed.toUpperCase() === 'TRUE') return true;
    if (trimmed.toUpperCase() === 'FALSE') return false;

    const operators = ['>=', '<=', '!=', '<>', '==', '=', '>', '<'];

    let foundOp = '';
    let opIndex = -1;

    for (const op of operators) {
      let inDouble = false;
      let inSingle = false;
      for (let i = 0; i <= trimmed.length - op.length; i++) {
        const char = trimmed[i];
        if (char === '"' && !inSingle) inDouble = !inDouble;
        else if (char === "'" && !inDouble) inSingle = !inSingle;
        else if (!inDouble && !inSingle) {
          if (trimmed.substring(i, i + op.length) === op) {
            foundOp = op;
            opIndex = i;
            break;
          }
        }
      }
      if (opIndex !== -1) break;
    }

    if (opIndex === -1) {
      if (!isNaN(Number(trimmed))) {
        return Number(trimmed) !== 0;
      }
      return '#VALUE!';
    }

    const leftPart = trimmed.substring(0, opIndex).trim();
    const rightPart = trimmed.substring(opIndex + foundOp.length).trim();

    if (leftPart === '' || rightPart === '') {
      return '#VALUE!';
    }

    const isLeftQuoted =
      (leftPart.startsWith('"') && leftPart.endsWith('"')) ||
      (leftPart.startsWith("'") && leftPart.endsWith("'"));
    const isRightQuoted =
      (rightPart.startsWith('"') && rightPart.endsWith('"')) ||
      (rightPart.startsWith("'") && rightPart.endsWith("'"));

    const leftUnquoted = isLeftQuoted ? leftPart.slice(1, -1) : leftPart;
    const rightUnquoted = isRightQuoted ? rightPart.slice(1, -1) : rightPart;

    const leftNum = Number(leftUnquoted);
    const rightNum = Number(rightUnquoted);
    const isNumeric = !isLeftQuoted && !isRightQuoted && !isNaN(leftNum) && !isNaN(rightNum);

    if (isNumeric) {
      switch (foundOp) {
        case '>=': return leftNum >= rightNum;
        case '<=': return leftNum <= rightNum;
        case '!=':
        case '<>': return leftNum !== rightNum;
        case '==':
        case '=':  return leftNum === rightNum;
        case '>':  return leftNum > rightNum;
        case '<':  return leftNum < rightNum;
      }
    } else {
      switch (foundOp) {
        case '==':
        case '=':  return leftUnquoted === rightUnquoted;
        case '!=':
        case '<>': return leftUnquoted !== rightUnquoted;
        case '>=': return leftUnquoted >= rightUnquoted;
        case '<=': return leftUnquoted <= rightUnquoted;
        case '>':  return leftUnquoted > rightUnquoted;
        case '<':  return leftUnquoted < rightUnquoted;
      }
    }

    return '#VALUE!';
  }

  /**
   * Safe recursive descent arithmetic expression evaluator.
   * Pure AST execution without code generation. Returns complete numbers without premature rounding.
   * Division by zero -> '#DIV/0!'. Non-finites -> '#ERROR!'.
   */
  public static evalArithmeticExpression(expr: string): number | string {
    try {
      const parser = new RecursiveDescentArithmeticParser(expr);
      const result = parser.parse();
      if (typeof result === 'number' && !isNaN(result)) {
        if (!isFinite(result)) return '#ERROR!';
        return result;
      }
      return '#ERROR!';
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === '#DIV/0!') return '#DIV/0!';
        if (err.message === '#CIRCULAR!') return '#CIRCULAR!';
        if (err.message === '#VALUE!') return '#VALUE!';
      }
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
