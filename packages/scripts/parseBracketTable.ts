import { cellToString, findState } from './parseStateTable';

/** Regex to extract state abbreviation from a cell value */
const STATE_ABBR_PATTERN = /([a-z]+\.?[a-z]+\.?)/i;

/**
 * Replaces state abbreviations with full state names in bracket-type tables.
 *
 * For each row, checks if the first cell contains a state abbreviation and
 * replaces it with the full state name, preserving any footnote references.
 * Non-state values (e.g., "Quintile", numeric labels) are left unchanged.
 *
 * @param table - Raw 2D array from Excel with headers in first row
 * @returns Modified 2D array with state abbreviations replaced by full names
 */
export default function parseBracketTable(table: unknown[][]): unknown[][] {
	return table.map((row, i) => {
		// Skip header row
		if (i === 0) return row;

		if (row[0] == null) return row;

		const cellStr = cellToString(row[0]);
		const abbrMatch = STATE_ABBR_PATTERN.exec(cellStr);

		if (!abbrMatch?.[1]) return row;

		const state = findState(abbrMatch[1]);
		if (!state) return row;

		const newRow = [...row];
		newRow[0] = cellStr.replace(abbrMatch[1], state.name);
		return newRow;
	});
}
