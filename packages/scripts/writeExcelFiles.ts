import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

import type {
	CompiledData,
	SectionedData,
	StateData,
	TableEntry,
} from './types';

/**
 * Finds the maximum length among an array of arrays.
 *
 * Used to determine the number of columns needed when creating
 * Excel rows that all need the same column count.
 *
 * @param arrays - An array of arrays to measure
 * @returns The length of the longest inner array
 */
function maxLength(arrays: unknown[][]): number {
	let length = 0;
	arrays.forEach(array => {
		length = Math.max(length, array.length);
	});

	return length;
}

/**
 * Creates a row array with a single value in the first cell.
 *
 * Generates an array of the specified length with the value in position 0
 * and undefined in all other positions. Used for metadata rows like title,
 * subtitle, notes, and source.
 *
 * @param value - The string value to place in the first cell
 * @param length - The total number of columns in the row
 * @returns An array with the value at index 0 and undefined elsewhere
 */
function createSingleValueRow(
	value: string,
	length: number,
): (string | undefined)[] {
	const row: (string | undefined)[] = new Array<string | undefined>(
		length,
	).fill(undefined);
	row[0] = value.trim();
	return row;
}

/**
 * Adds metadata rows to the worksheet data array.
 *
 * Iterates through the specified metadata fields and adds a row for each
 * one that has a value in the table entry.
 *
 * @param wsData - The worksheet data array to append rows to
 * @param entry - The table entry containing metadata values
 * @param fields - The metadata field names to add
 * @param length - The number of columns for each row
 */
function addMetadataRows(
	wsData: unknown[][],
	entry: TableEntry,
	fields: readonly ('title' | 'subtitle' | 'date' | 'notes' | 'source')[],
	length: number,
): void {
	fields.forEach(field => {
		const value = entry[field];
		if (value) {
			wsData.push(createSingleValueRow(value, length));
		}
	});
}

/**
 * Converts a cell value to a trimmed string.
 *
 * @param value - The cell value to convert
 * @returns The trimmed string representation
 */
function cellToString(value: unknown): string {
	if (typeof value === 'string') return value.trim();
	if (typeof value === 'number') return String(value);
	return '';
}

/**
 * Adds regular (non-state) table data rows to the worksheet.
 *
 * Simply appends the raw data array sandwiched between empty spacer rows.
 *
 * @param wsData - The worksheet data array to append rows to
 * @param data - The 2D array of table data
 * @param length - The number of columns for spacer rows
 */
function addRegularDataRows(
	wsData: unknown[][],
	data: unknown[][],
	length: number,
): void {
	wsData.push(new Array(length));
	wsData.push(...data);
	wsData.push(new Array(length));
}

/**
 * Adds state table data rows to the worksheet.
 *
 * Transforms the structured state data format back into a 2D array suitable
 * for Excel output. Creates a header row from the header definitions, then
 * creates a data row for each state value. Footnotes are appended to the
 * state name in the format "Alabama (1, 2)".
 *
 * @param wsData - The worksheet data array to append rows to
 * @param stateData - The structured state data with headers and values
 * @param length - The number of columns for spacer rows
 */
function addStateDataRows(
	wsData: unknown[][],
	stateData: StateData,
	length: number,
): void {
	wsData.push(new Array(length));

	// Create header row from header definitions
	const headerRow = stateData.headers.map(header => header.name);
	wsData.push(headerRow);

	// Create data rows for each state
	stateData.values.forEach(row => {
		const dataRow: (string | null)[] = stateData.headers.map(header => {
			const cellValue = row[header.id];
			const cellStr = cellToString(cellValue);

			// Append footnotes to state name if present
			if (header.id === 'state' && row.footnotes) {
				return `${cellStr} (${row.footnotes.join(', ')})`;
			}

			return cellValue !== undefined ? cellStr : null;
		});
		wsData.push(dataRow);
	});

	wsData.push(new Array(length));
}

/**
 * Adds footnote rows to the worksheet data.
 *
 * Each footnote is placed in its own row with the text in the first column.
 *
 * @param wsData - The worksheet data array to append rows to
 * @param footnotes - The 2D array of footnote data
 * @param length - The number of columns for each row
 */
function addFootnoteRows(
	wsData: unknown[][],
	footnotes: unknown[][],
	length: number,
): void {
	footnotes.forEach(footnote => {
		const firstCell = footnote[0];
		if (typeof firstCell === 'string') {
			wsData.push(createSingleValueRow(firstCell, length));
		}
	});
}

/**
 * Creates an Excel workbook for a single table and writes it to disk.
 *
 * Assembles the worksheet data in order: top metadata (title, subtitle, date),
 * data rows (handling state tables differently from regular tables), footnotes,
 * and bottom metadata (notes, source). The worksheet is then written to the
 * specified destination file.
 *
 * @param key - The table identifier (sheet name from the source workbook)
 * @param data - The full compiled data object containing all tables
 * @param destination - The file path where the Excel file should be written
 * @returns The created worksheet, which can be reused in a combined workbook
 * @throws Error if no data exists for the given key
 */
function writeWorkbook(
	key: string,
	data: CompiledData,
	destination: string,
): XLSX.WorkSheet {
	const wb = XLSX.utils.book_new();
	const wsData: unknown[][] = [];

	const entry = data[key];
	if (!entry) {
		throw new Error(`No data found for key: ${key}`);
	}

	const length = Array.isArray(entry.data)
		? maxLength(entry.data)
		: 'headers' in entry.data
			? entry.data.headers.length
			: Math.max(...entry.data.rows.map(r => r.cells.length));

	// Add top metadata
	addMetadataRows(wsData, entry, ['title', 'subtitle', 'date'], length);

	// Add data rows (different handling for state tables vs regular tables)
	if (entry.type === 'states') {
		addStateDataRows(wsData, entry.data as StateData, length);
	} else if (entry.type === 'sectioned') {
		const sectionedData = entry.data as SectionedData;
		wsData.push(new Array(length));
		sectionedData.rows.forEach(row => {
			const cells = row.cells.map(c => c ?? undefined);
			while (cells.length < length) cells.push(undefined);
			wsData.push(cells);
		});
		wsData.push(new Array(length));
	} else {
		addRegularDataRows(wsData, entry.data as unknown[][], length);
	}

	// Add footnotes if present
	if (entry.footnotes) {
		addFootnoteRows(wsData, entry.footnotes, length);
	}

	// Add bottom metadata
	addMetadataRows(wsData, entry, ['notes', 'source'], length);

	const ws = XLSX.utils.aoa_to_sheet(wsData);
	XLSX.utils.book_append_sheet(wb, ws, `Facts and Figures Table ${key}`);
	XLSX.writeFile(wb, destination);

	return ws;
}

/**
 * Generates Excel files from compiled table data.
 *
 * Creates individual Excel files for each table (named `table-{key}.xlsx`) and
 * a combined workbook (`facts-and-figures.xlsx`) containing all tables as separate
 * sheets. Before generating new files, any existing files in the output directory
 * are deleted to ensure a clean slate.
 *
 * The output directory is created if it doesn't exist. Each individual table file
 * includes all metadata (title, subtitle, date, notes, source) and footnotes.
 *
 * @param data - The compiled data object containing all tables keyed by sheet name
 */
export default function writeExcelFiles(data: CompiledData): void {
	const keys = Object.keys(data);
	const outputDirectory = path.resolve(__dirname, '../frontend/public/data');

	if (!fs.existsSync(outputDirectory)) {
		fs.mkdirSync(outputDirectory);
	}

	fs.readdir(outputDirectory, (err, files) => {
		if (err) throw err;

		for (const file of files) {
			if (file.endsWith('.xlsx')) {
				fs.unlinkSync(path.join(outputDirectory, file));
			}
		}
		console.log(`Old Excel files deleted.`);

		const wb = XLSX.utils.book_new();
		keys.forEach(key => {
			const destination = path.join(outputDirectory, `table-${key}.xlsx`);
			const sheet = writeWorkbook(key, data, destination);
			XLSX.utils.book_append_sheet(wb, sheet, key);
		});
		XLSX.writeFile(wb, path.join(outputDirectory, 'facts-and-figures.xlsx'));
	});
	console.log('New Excel files written.');
}
