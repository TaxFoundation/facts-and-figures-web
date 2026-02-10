import { kebabCase } from 'lodash';

import states from '../../data/states.json';
import type { Header, ParsedStateTable, State, StateValue } from './types';

/** Regex to extract state abbreviation from a cell value */
const STATE_ABBR_PATTERN = /([a-z]+\.?[a-z]+\.?)/i;

/** Regex to extract footnote references from parentheses, e.g., "(1, 2)" */
const FOOTNOTES_PATTERN = /\((.*)\)/;

/** Regex to extract DC-style numeric values in parentheses, e.g., "(42)" */
const DC_VALUE_PATTERN = /\((\d+)\)/;

/**
 * Converts a cell value to a string.
 *
 * Handles string, number, and other types by returning the appropriate
 * string representation or an empty string for unsupported types.
 *
 * @param cell - The cell value to convert
 * @returns The string representation of the cell value
 */
function cellToString(cell: unknown): string {
	if (typeof cell === 'string') return cell;
	if (typeof cell === 'number') return String(cell);
	return '';
}

/**
 * Finds a state object by matching against various identifier formats.
 *
 * Attempts to match the provided abbreviation against the state's abbreviated
 * name (e.g., "Ala."), postal code (e.g., "AL"), or full name (e.g., "Alabama").
 * This flexibility is needed because the source data uses inconsistent state
 * identifier formats across different tables.
 *
 * @param abbr - The state abbreviation or name to search for
 * @returns The matching State object, or undefined if not found
 */
function findState(abbr: string): State | undefined {
	return (states as State[]).find(
		state =>
			state.abbr === abbr || state.postal === abbr || state.name === abbr,
	);
}

/**
 * Extracts footnote references from a cell string.
 *
 * Looks for content within parentheses and splits it by commas to extract
 * individual footnote identifiers. For example, "Alabama (1, 2)" would
 * return ["1", "2"].
 *
 * @param cellStr - The cell string to extract footnotes from
 * @returns An array of footnote identifiers, or undefined if none found
 */
function extractFootnotes(cellStr: string): string[] | undefined {
	const match = FOOTNOTES_PATTERN.exec(cellStr);
	if (match?.[1]) {
		return match[1].replace(/\s/g, '').split(',');
	}
	return undefined;
}

/**
 * Transforms a single data row into a StateValue object.
 *
 * Parses the first cell to identify the state and any footnotes, then maps
 * the remaining cells to their corresponding header IDs. For DC (District of
 * Columbia) values that appear in parentheses, extracts just the numeric value.
 *
 * @param row - The raw data row from the Excel file
 * @param headers - The parsed header definitions for this table
 * @returns A StateValue object with state info and mapped values, or null if the row is invalid
 */
function parseRow(row: unknown[], headers: Header[]): StateValue | null {
	if (!row[0]) {
		return null;
	}

	const rowState = cellToString(row[0]);
	const abbrMatch = STATE_ABBR_PATTERN.exec(rowState);

	if (!abbrMatch || !abbrMatch[1]) {
		return null;
	}

	const theState = findState(abbrMatch[1]);
	if (!theState) {
		return null;
	}

	const value: StateValue = {
		state: theState.name,
		fips: theState.id,
	};

	const footnotes = extractFootnotes(rowState);
	if (footnotes) {
		value.footnotes = footnotes;
	}

	// Map remaining cells to their header IDs (first column is state, skip it)
	row.slice(1).forEach((cell, i) => {
		const header = headers.find(h => h.order === i + 1);
		if (!header) return;

		const cellStr = cellToString(cell);
		const dcMatch = DC_VALUE_PATTERN.exec(cellStr);

		// DC values appear in parentheses - extract just the number
		value[header.id] = dcMatch ? dcMatch[1] : cellStr;
	});

	return value;
}

/**
 * Transforms raw Excel table data into a structured state data format.
 *
 * Takes a 2D array where the first row contains column headers and subsequent
 * rows contain state data. Transforms this into an object with:
 * - `headers`: Array of header objects with name, kebab-case ID, and column order
 * - `values`: Array of state value objects with standardized state names, FIPS codes,
 *   and values keyed by header ID
 *
 * This transformation normalizes inconsistent state identifiers (abbreviations,
 * postal codes, full names) into a consistent format with FIPS codes for sorting.
 *
 * @example
 * Input:  [["State", "Value"], ["Ala.", "14%"], ["Alaska", "10%"]]
 * Output: {
 *   headers: [{ name: "State", id: "state", order: 0 }, { name: "Value", id: "value", order: 1 }],
 *   values: [{ state: "Alabama", fips: 1, value: "14%" }, { state: "Alaska", fips: 2, value: "10%" }]
 * }
 *
 * @param table - Raw 2D array from Excel with headers in first row
 * @returns Structured object with headers and state values
 */
export default function parseStateTable(table: unknown[][]): ParsedStateTable {
	const headerRow = table[0] as string[];
	const headers: Header[] = headerRow.map((header, i) => ({
		name: header,
		id: kebabCase(header),
		order: i,
	}));

	const values = table
		.slice(1)
		.map(row => parseRow(row, headers))
		.filter((value): value is StateValue => value !== null);

	return { headers, values };
}
