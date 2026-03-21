import { cellToString, findState } from './parseStateTable';
import type { SectionedData, SectionedRow, SectionedRowType } from './types';

/** Regex to detect data-value patterns (numbers, currency, percentages, etc.) */
const DATA_VALUE_PATTERN = /^[\d$%¢.,\s/>-]+$/;

/** Keywords that indicate a column header row */
const COLUMN_HEADER_KEYWORDS = ['Rates', 'Item', 'Quintile', 'State'];

/** Regex to extract state abbreviation from a cell value */
const STATE_ABBR_PATTERN = /([a-z]+\.?[a-z]+\.?)/i;

function classifyRow(cells: (string | null)[]): SectionedRowType {
	const nonNullCells = cells.filter(c => c != null && c.trim() !== '');

	// Separator: all cells are null/empty
	if (nonNullCells.length === 0) return 'separator';

	// Sub-section header: row[0] is null/empty, exactly one other cell is non-null
	if (
		(cells[0] == null || cells[0].trim() === '') &&
		nonNullCells.length === 1
	) {
		return 'subsection';
	}

	// Column header: row[0] matches a keyword
	if (
		cells[0] != null &&
		COLUMN_HEADER_KEYWORDS.some(kw => cells[0]?.trim().startsWith(kw))
	) {
		return 'columnHeader';
	}

	// Section header: row[0] is non-null, all other cells are null,
	// and row[0] doesn't match a data-value pattern
	if (
		cells[0] != null &&
		cells[0].trim() !== '' &&
		nonNullCells.length === 1 &&
		!DATA_VALUE_PATTERN.test(cells[0].trim())
	) {
		return 'section';
	}

	return 'data';
}

function expandStateAbbrs(cells: (string | null)[]): (string | null)[] {
	if (cells[0] == null) return cells;

	const cellStr = cellToString(cells[0]);
	const abbrMatch = STATE_ABBR_PATTERN.exec(cellStr);

	if (!abbrMatch?.[1]) return cells;

	const state = findState(abbrMatch[1]);
	if (!state) return cells;

	const newCells = [...cells];
	newCells[0] = cellStr.replace(abbrMatch[1], state.name).trim();
	return newCells;
}

export default function parseSectionedTable(table: unknown[][]): SectionedData {
	const rows: SectionedRow[] = table.map(row => {
		const cells = row.map(cell => (cell == null ? null : cellToString(cell)));
		const type = classifyRow(cells);
		const finalCells = type === 'data' ? expandStateAbbrs(cells) : cells;
		return { type, cells: finalCells };
	});

	return { rows };
}
