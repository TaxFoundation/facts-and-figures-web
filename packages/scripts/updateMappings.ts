import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

import states from '../../data/states.json';
import type { Mapping } from './types';

interface State {
	id: number;
	postal: string;
	abbr: string;
	name: string;
}

interface CellLocation {
	row: number;
	col: number;
}

interface DetectedMapping extends Mapping {
	confidence: 'high' | 'medium' | 'low';
	warnings?: string[];
}

// Build a set of all possible state identifiers for fast lookup
const stateIdentifiers = new Set<string>();
(states as State[]).forEach(state => {
	stateIdentifiers.add(state.name.trim().toLowerCase());
	stateIdentifiers.add(state.abbr.toLowerCase());
	stateIdentifiers.add(state.postal.toLowerCase());
});

/**
 * Converts a 0-indexed column number to Excel column letter (A, B, ..., Z, AA, AB, ...)
 */
function colToLetter(col: number): string {
	let letter = '';
	let temp = col;
	while (temp >= 0) {
		letter = String.fromCharCode((temp % 26) + 65) + letter;
		temp = Math.floor(temp / 26) - 1;
	}
	return letter;
}

/**
 * Converts a row and column (0-indexed) to Excel cell reference (e.g., "A1")
 */
function toRef(row: number, col: number): string {
	return `${colToLetter(col)}${row + 1}`;
}

/**
 * Converts a range to Excel range reference (e.g., "A1:C10")
 */
function toRangeRef(
	startRow: number,
	startCol: number,
	endRow: number,
	endCol: number
): string {
	return `${toRef(startRow, startCol)}:${toRef(endRow, endCol)}`;
}

/**
 * Gets the cell value as a string, handling various types
 */
function getCellValue(sheet: XLSX.WorkSheet, row: number, col: number): string {
	const ref = toRef(row, col);
	const cell = sheet[ref] as { v?: unknown } | undefined;
	if (!cell || cell.v === undefined || cell.v === null) return '';
	return String(cell.v).trim();
}

/**
 * Gets all data from a sheet as a 2D array
 */
function getSheetData(sheet: XLSX.WorkSheet): string[][] {
	const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
	const data: string[][] = [];

	for (let row = range.s.r; row <= range.e.r; row++) {
		const rowData: string[] = [];
		for (let col = range.s.c; col <= range.e.c; col++) {
			rowData.push(getCellValue(sheet, row, col));
		}
		data.push(rowData);
	}

	return data;
}

/**
 * Checks if a cell value looks like a state name or abbreviation
 */
function isStateLike(value: string): boolean {
	if (!value) return false;
	// Remove footnote markers like "(1)" or "(a, b)"
	const cleaned = value.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
	return stateIdentifiers.has(cleaned);
}

/**
 * Counts how many state-like values are in a column
 */
function countStatesInColumn(data: string[][], col: number): number {
	let count = 0;
	for (let row = 0; row < data.length; row++) {
		if (isStateLike(data[row][col])) {
			count++;
		}
	}
	return count;
}

/**
 * Counts unique states in a column
 */
function countUniqueStatesInColumn(data: string[][], col: number): number {
	const uniqueStates = new Set<string>();
	for (let row = 0; row < data.length; row++) {
		const value = data[row][col];
		if (value && isStateLike(value)) {
			const cleaned = value.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
			uniqueStates.add(cleaned);
		}
	}
	return uniqueStates.size;
}

/**
 * Finds the column that contains state names
 */
function findStateColumn(data: string[][]): number | null {
	if (data.length === 0 || data[0].length === 0) return null;

	let bestCol = -1;
	let bestCount = 0;

	for (let col = 0; col < data[0].length; col++) {
		const count = countStatesInColumn(data, col);
		if (count > bestCount) {
			bestCount = count;
			bestCol = col;
		}
	}

	// Need at least 8 states to consider it a state column
	// This allows for smaller tables that only cover some states
	// (e.g., estate tax tables that only apply to ~13 states)
	return bestCount >= 8 ? bestCol : null;
}

/**
 * Checks if a value looks like a tax bracket (dollar amount or "over X")
 */
function isBracketLike(value: string): boolean {
	if (!value) return false;
	const lower = value.toLowerCase();
	return (
		/^\$[\d,]+/.test(value) ||
		/^over\s+\$?[\d,]+/i.test(value) ||
		/^[\d,]+\s*[-–]\s*[\d,]+$/.test(value) ||
		lower.includes('single') ||
		lower.includes('married') ||
		lower.includes('head of household') ||
		lower.includes('quintile') ||
		/^\d+(\.\d+)?%$/.test(value)
	);
}

/**
 * Checks if the table appears to be quintile-based (income distribution data)
 */
function isQuintileTable(data: string[][]): boolean {
	// Look for "quintile" keyword in headers or first column
	for (let row = 0; row < Math.min(10, data.length); row++) {
		for (let col = 0; col < Math.min(5, data[row]?.length || 0); col++) {
			const cell = data[row][col]?.toLowerCase() || '';
			if (cell.includes('quintile')) {
				return true;
			}
		}
	}
	return false;
}

/**
 * Counts bracket-like values in the data
 */
function countBracketValues(data: string[][]): number {
	let count = 0;
	for (const row of data) {
		for (const cell of row) {
			if (isBracketLike(cell)) count++;
		}
	}
	return count;
}

/**
 * Checks if a value is a simple sortable/categorical value
 * as opposed to a complex string description
 */
function isSimpleSortableValue(value: string): boolean {
	if (!value) return true; // Empty is fine
	const trimmed = value.trim();
	if (trimmed === '') return true;

	// Simple patterns that can be sorted or are common categorical values
	return (
		/^-?\$?[\d,.]+%?$/.test(trimmed) || // Numbers, currency, percentages
		/^-?[\d,.]+\s*%$/.test(trimmed) || // "5.5 %"
		/^\$[\d,.]+\s*(billion|million|thousand)?$/i.test(trimmed) || // "$5.5 billion"
		/^[\d,.]+\s*(billion|million|thousand)$/i.test(trimmed) || // "5.5 billion"
		/^[\d.]+%?\s*[-–]\s*[\d.]+%?$/.test(trimmed) || // Rate ranges: "10.0% - 20.0%", "0.8%-16.0%"
		/^n\.?a\.?$/i.test(trimmed) || // "N/A", "n.a."
		/^none$/i.test(trimmed) || // "None"
		/^--?$/.test(trimmed) || // "-" or "--"
		/^yes$/i.test(trimmed) || // "Yes"
		/^no$/i.test(trimmed) || // "No"
		/^exempt$/i.test(trimmed) || // "Exempt"
		/^included in base$/i.test(trimmed) || // "Included in Base"
		/^taxable$/i.test(trimmed) || // "Taxable"
		trimmed.length <= 5 // Short values like ranks, simple codes
	);
}

/**
 * Checks if a state table has primarily sortable numeric values
 * or complex string descriptions
 */
function hasSimpleSortableValues(
	data: string[][],
	stateCol: number,
	startRow: number,
	endRow: number
): boolean {
	let sortableCount = 0;
	let complexCount = 0;

	for (let row = startRow; row <= endRow; row++) {
		for (let col = 0; col < data[row].length; col++) {
			if (col === stateCol) continue; // Skip the state column
			const value = data[row][col];
			if (!value || value.trim() === '') continue;

			if (isSimpleSortableValue(value)) {
				sortableCount++;
			} else {
				complexCount++;
			}
		}
	}

	// If more than 20% of values are complex strings, treat as table
	const total = sortableCount + complexCount;
	if (total === 0) return true;
	return complexCount / total < 0.2;
}

/**
 * Detects the type of table based on content
 */
function detectTableType(
	data: string[][],
	stateCol: number | null,
	dataStartRow: number | null,
	dataEndRow: number | null
): 'states' | 'brackets' | 'table' {
	// If we found a state column, check if it's a simple state table or a brackets table
	if (stateCol !== null && dataStartRow !== null && dataEndRow !== null) {
		const uniqueStates = countUniqueStatesInColumn(data, stateCol);
		const totalDataRows = dataEndRow - dataStartRow + 1;

		// In a standard state table, we have roughly 51-52 rows (50 states + DC + maybe header)
		// In a brackets table, we have many more rows than states
		// (e.g., 160 rows for 51 states = ~3 bracket rows per state average)
		if (uniqueStates >= 30 && totalDataRows > uniqueStates * 1.5) {
			return 'brackets';
		}

		// Check if values are simple sortable numbers or complex strings
		// Tables with complex string descriptions should be type "table"
		if (!hasSimpleSortableValues(data, stateCol, dataStartRow, dataEndRow)) {
			return 'table';
		}

		return 'states';
	}

	// Check for bracket patterns (for tables without obvious state columns)
	const bracketCount = countBracketValues(data);
	if (bracketCount >= 10) {
		return 'brackets';
	}

	// Check for quintile-based tables (income distribution data)
	if (isQuintileTable(data)) {
		return 'brackets';
	}

	return 'table';
}

/**
 * Finds the first row that looks like it contains data (has state or is after a header)
 */
function findDataStartRow(
	data: string[][],
	stateCol: number | null
): number | null {
	if (stateCol !== null) {
		// For state tables, find first row with a state
		for (let row = 0; row < data.length; row++) {
			if (isStateLike(data[row][stateCol])) {
				// The row before this should be the header, so data starts at header
				return row > 0 ? row - 1 : row;
			}
		}
	}

	// For other tables, look for the first content row after the title/date section.
	// Title/date are typically in rows 1-4, so we look for any row starting at row 5
	// (index 4) that has content, which begins the data section.
	// First, find where headers with multiple columns appear
	let headerRow: number | null = null;
	for (let row = 0; row < Math.min(15, data.length); row++) {
		const nonEmpty = data[row].filter(cell => cell !== '').length;
		if (nonEmpty >= 2) {
			headerRow = row;
			break;
		}
	}

	if (headerRow === null) return null;

	// Now scan backwards from the header row to find section labels
	// that should be included (any non-empty row after row 4 / index 3)
	let startRow = headerRow;
	for (let row = headerRow - 1; row >= 4; row--) {
		const nonEmpty = data[row].filter(cell => cell !== '').length;
		if (nonEmpty >= 1) {
			startRow = row;
		} else {
			// Stop at empty row
			break;
		}
	}

	return startRow;
}

/**
 * Checks if a row contains bracket-like data (rates, dollar amounts)
 * even if the state column is empty (continuation row for multi-bracket states)
 */
function rowHasBracketData(row: string[]): boolean {
	for (const cell of row) {
		if (!cell) continue;
		// Look for percentage rates or dollar amounts
		if (/^\d+(\.\d+)?%$/.test(cell) || /^\$[\d,]+/.test(cell) || cell === '>') {
			return true;
		}
	}
	return false;
}

/**
 * Finds the last row of data (before notes/source/empty section)
 */
function findDataEndRow(
	data: string[][],
	startRow: number,
	stateCol: number | null
): number {
	let lastDataRow = startRow;

	for (let row = startRow + 1; row < data.length; row++) {
		const rowText = data[row].join(' ').toLowerCase();

		// Check for note/source markers at the start of the row
		if (
			rowText.startsWith('note:') ||
			rowText.startsWith('notes:') ||
			rowText.startsWith('source:') ||
			rowText.startsWith('sources:')
		) {
			break;
		}

		// For state tables, stop when we run out of states
		if (stateCol !== null) {
			if (isStateLike(data[row][stateCol])) {
				lastDataRow = row;
			} else {
				// Check if this row is completely empty
				const nonEmpty = data[row].filter(cell => cell !== '').length;
				if (nonEmpty === 0) {
					break;
				}

				// Check for footnote markers (typically start with parenthetical references)
				const firstNonEmpty = data[row].find(cell => cell !== '') || '';
				const looksLikeFootnote =
					/^\([a-z0-9,\s]+\)/i.test(firstNonEmpty) ||
					rowText.includes('note') ||
					rowText.includes('source');

				if (looksLikeFootnote) {
					break;
				}

				// If row has bracket data (rates, dollar amounts), it's a continuation row
				// for a multi-bracket state like D.C.
				if (rowHasBracketData(data[row])) {
					lastDataRow = row;
				}
			}
		} else {
			// For other tables, look for note markers or multiple consecutive empty rows
			const nonEmpty = data[row].filter(cell => cell !== '').length;
			if (nonEmpty === 0) {
				// Look ahead to see if there's more data after empty rows
				// (handles multi-table sheets like sheet 43)
				let foundMoreData = false;
				for (let lookAhead = row + 1; lookAhead < Math.min(row + 5, data.length); lookAhead++) {
					const lookAheadText = data[lookAhead].join(' ').toLowerCase();
					// Stop if we hit source/notes
					if (
						lookAheadText.startsWith('source') ||
						lookAheadText.startsWith('note')
					) {
						break;
					}
					const lookAheadNonEmpty = data[lookAhead].filter(cell => cell !== '').length;
					if (lookAheadNonEmpty >= 2) {
						foundMoreData = true;
						break;
					}
				}
				if (!foundMoreData) {
					break;
				}
				// Continue past the empty row since there's more data ahead
				continue;
			}
			lastDataRow = row;
		}
	}

	return lastDataRow;
}

/**
 * Finds the columns that contain actual data (not empty)
 */
function findDataColumns(
	data: string[][],
	startRow: number,
	endRow: number
): { start: number; end: number } {
	let minCol = data[0].length;
	let maxCol = 0;

	for (let row = startRow; row <= endRow; row++) {
		for (let col = 0; col < data[row].length; col++) {
			if (data[row][col] !== '') {
				minCol = Math.min(minCol, col);
				maxCol = Math.max(maxCol, col);
			}
		}
	}

	return { start: minCol, end: maxCol };
}

/**
 * Finds the title cell (usually in first few rows, longer text)
 */
function findTitle(data: string[][]): CellLocation | null {
	// Look in first 5 rows for the longest meaningful text
	let bestLoc: CellLocation | null = null;
	let bestLength = 0;

	for (let row = 0; row < Math.min(5, data.length); row++) {
		for (let col = 0; col < Math.min(5, data[row].length); col++) {
			const value = data[row][col];
			// Title should be reasonably long and not look like a date or note
			if (
				value.length > 10 &&
				value.length > bestLength &&
				!value.toLowerCase().startsWith('note') &&
				!value.toLowerCase().startsWith('source') &&
				!/^\d{4}$/.test(value) &&
				!/^as of/i.test(value)
			) {
				bestLength = value.length;
				bestLoc = { row, col };
			}
		}
	}

	return bestLoc;
}

/**
 * Finds the date cell (usually contains year or "as of")
 */
function findDate(data: string[][], titleRow: number): CellLocation | null {
	// Look in first 6 rows for date-like content
	for (let row = 0; row < Math.min(6, data.length); row++) {
		for (let col = 0; col < Math.min(5, data[row].length); col++) {
			const value = data[row][col];
			// Skip if it's the same as title row (unless it contains a year)
			if (row === titleRow && !/\b20\d{2}\b/.test(value)) continue;

			// Look for year patterns, "as of", or date-like text
			if (
				/\b20\d{2}\b/.test(value) ||
				/^as of/i.test(value) ||
				/\bfy\s*20\d{2}/i.test(value) ||
				/\bcalendar year/i.test(value) ||
				/\btax year/i.test(value)
			) {
				return { row, col };
			}
		}
	}

	return null;
}

/**
 * Finds notes, source, and footnotes after the data section
 */
function findMetadata(
	data: string[][],
	dataEndRow: number
): {
	notes: CellLocation | null;
	source: CellLocation | null;
	footnotesStart: number | null;
	footnotesEnd: number | null;
} {
	let notes: CellLocation | null = null;
	let source: CellLocation | null = null;
	let footnotesStart: number | null = null;
	let footnotesEnd: number | null = null;

	// Track if we've seen potential footnotes (content between data and notes/source)
	let potentialFootnoteRows: number[] = [];

	for (let row = dataEndRow + 1; row < data.length; row++) {
		for (let col = 0; col < data[row].length; col++) {
			const value = data[row][col].toLowerCase();

			if (
				!notes &&
				(value.startsWith('note:') || value.startsWith('notes:'))
			) {
				notes = { row, col };
				// Any content between dataEnd and notes could be footnotes
				if (potentialFootnoteRows.length > 0) {
					footnotesStart = potentialFootnoteRows[0];
					footnotesEnd = potentialFootnoteRows[potentialFootnoteRows.length - 1];
				}
			} else if (
				!source &&
				(value.startsWith('source:') || value.startsWith('sources:'))
			) {
				source = { row, col };
				// If we haven't found notes yet, check for footnotes before source
				if (!notes && potentialFootnoteRows.length > 0) {
					footnotesStart = potentialFootnoteRows[0];
					footnotesEnd = potentialFootnoteRows[potentialFootnoteRows.length - 1];
				}
			} else if (!notes && !source && data[row][col] !== '') {
				// This might be a footnote row
				potentialFootnoteRows.push(row);
			}
		}
	}

	return { notes, source, footnotesStart, footnotesEnd };
}

/**
 * Analyzes a single worksheet and generates a mapping
 */
function analyzeSheet(
	sheetName: string,
	sheet: XLSX.WorkSheet
): DetectedMapping | null {
	const data = getSheetData(sheet);
	if (data.length === 0) return null;

	const warnings: string[] = [];

	// Find state column to help determine type
	const stateCol = findStateColumn(data);

	// Find title
	const titleLoc = findTitle(data);
	if (!titleLoc) {
		warnings.push('Could not detect title location');
	}

	// Find date
	const dateLoc = findDate(data, titleLoc?.row ?? -1);
	if (!dateLoc) {
		warnings.push('Could not detect date location');
	}

	// Find data range
	const dataStartRow = findDataStartRow(data, stateCol);
	if (dataStartRow === null) {
		warnings.push('Could not detect data start');
		return null;
	}

	const dataEndRow = findDataEndRow(data, dataStartRow, stateCol);
	const dataCols = findDataColumns(data, dataStartRow, dataEndRow);

	// Now detect type with full context
	const tableType = detectTableType(data, stateCol, dataStartRow, dataEndRow);

	// Find notes, source, footnotes
	const metadata = findMetadata(data, dataEndRow);

	// Build the mapping
	const mapping: DetectedMapping = {
		sheetName,
		type: tableType,
		confidence: warnings.length === 0 ? 'high' : warnings.length <= 2 ? 'medium' : 'low',
	};

	if (warnings.length > 0) {
		mapping.warnings = warnings;
	}

	if (titleLoc) {
		mapping.title = toRef(titleLoc.row, titleLoc.col);
	}

	if (dateLoc) {
		mapping.date = toRef(dateLoc.row, dateLoc.col);
	}

	mapping.data = toRangeRef(
		dataStartRow,
		dataCols.start,
		dataEndRow,
		dataCols.end
	);

	if (metadata.notes) {
		mapping.notes = toRef(metadata.notes.row, metadata.notes.col);
	}

	if (metadata.source) {
		mapping.source = toRef(metadata.source.row, metadata.source.col);
	}

	if (metadata.footnotesStart !== null && metadata.footnotesEnd !== null) {
		mapping.footnotes = toRangeRef(
			metadata.footnotesStart,
			0,
			metadata.footnotesEnd,
			0
		);
	}

	return mapping;
}

/**
 * Main function to update mappings
 */
function updateMappings(): void {
	const sourcePath = path.resolve(__dirname, '../../data/facts-and-figures.xlsx');
	const mappingsPath = path.resolve(__dirname, '../../data/mappings.json');

	console.log('Reading Excel file...');
	const wb = XLSX.readFile(sourcePath);

	// Filter to only sheets with integer names
	const integerSheets = wb.SheetNames.filter(name => /^\d+$/.test(name)).sort(
		(a, b) => parseInt(a) - parseInt(b)
	);

	console.log(`Found ${integerSheets.length} sheets with integer names`);

	const mappings: DetectedMapping[] = [];
	let highConfidence = 0;
	let mediumConfidence = 0;
	let lowConfidence = 0;

	for (const sheetName of integerSheets) {
		const sheet = wb.Sheets[sheetName];
		const mapping = analyzeSheet(sheetName, sheet);

		if (mapping) {
			mappings.push(mapping);

			switch (mapping.confidence) {
				case 'high':
					highConfidence++;
					break;
				case 'medium':
					mediumConfidence++;
					break;
				case 'low':
					lowConfidence++;
					break;
			}

			const typeIndicator =
				mapping.type === 'states'
					? '📊'
					: mapping.type === 'brackets'
						? '📈'
						: '📋';
			console.log(
				`  ${typeIndicator} Sheet ${sheetName}: ${mapping.type} (${mapping.data})`
			);

			if (mapping.warnings && mapping.warnings.length > 0) {
				mapping.warnings.forEach(w => console.log(`     ⚠️  ${w}`));
			}
		} else {
			console.log(`  ❌ Sheet ${sheetName}: Could not analyze`);
		}
	}

	const statesCount = mappings.filter(m => m.type === 'states').length;
	const bracketsCount = mappings.filter(m => m.type === 'brackets').length;
	const tableCount = mappings.filter(m => m.type === 'table').length;

	console.log('\n--- Summary ---');
	console.log(`Total sheets processed: ${mappings.length}`);
	console.log(`  📊 States tables: ${statesCount}`);
	console.log(`  📈 Brackets tables: ${bracketsCount}`);
	console.log(`  📋 Generic tables: ${tableCount}`);
	console.log(`\nConfidence levels:`);
	console.log(`  ✅ High: ${highConfidence}`);
	console.log(`  ⚠️  Medium: ${mediumConfidence}`);
	console.log(`  ❌ Low: ${lowConfidence}`);

	// Remove confidence and warnings from output (they're for logging only)
	const cleanMappings: Mapping[] = mappings.map(m => {
		const { confidence, warnings, ...clean } = m;
		return clean;
	});

	console.log(`\nWriting mappings to ${mappingsPath}...`);
	fs.writeFileSync(mappingsPath, JSON.stringify(cleanMappings, null, 2) + '\n');
	console.log('Done!');
}

updateMappings();
