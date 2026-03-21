import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

import mappings from '../../data/mappings.json';
import parseBracketTable from './parseBracketTable';
import parseSectionedTable from './parseSectionedTable';
import parseStateTable from './parseStateTable';
import type { CompiledData, Mapping } from './types';
import writeExcelFiles from './writeExcelFiles';

/**
 * Finds the maximum length among an array of arrays.
 *
 * Used to determine the number of columns needed when normalizing
 * rows of varying lengths to have consistent column counts.
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

const data: CompiledData = {};

const source = path.resolve(__dirname, '../../data/facts-and-figures.xlsx');
const destination = path.resolve(__dirname, '../frontend/src/data/data.json');
const wb = XLSX.readFile(source);

/**
 * Concatenates all cell values within a given Excel range into a single string.
 *
 * Extracts all cells from the specified range, flattens them, and joins their
 * values with spaces. This is useful for metadata fields like notes or sources
 * that may span multiple cells in the source spreadsheet.
 *
 * @param range - An Excel range string (e.g., "A1:C3") specifying cells to concatenate
 * @param sheet - The XLSX worksheet to read from
 * @returns A space-separated string of all non-null cell values in the range
 */
function concatRange(range: string, sheet: XLSX.WorkSheet): string {
	const cells = XLSX.utils.sheet_to_json(sheet, {
		header: 1,
		range,
		raw: false,
	});
	const values: unknown[] = [];
	(cells as unknown[][]).forEach(row => {
		row.forEach(cell => values.push(cell));
	});

	const concatenation = values.reduce<string>((prev, curr) => {
		if (curr == null) return prev;
		const currStr =
			typeof curr === 'string'
				? curr
				: typeof curr === 'number'
					? String(curr)
					: '';
		return `${prev} ${currStr.trim()}`;
	}, '');

	return concatenation;
}

/**
 * Extracts and transforms data from an Excel sheet based on a mapping configuration.
 *
 * This function reads raw data from the specified range in the worksheet, normalizes
 * row lengths, and stores the result in the global `data` object. For state-type tables,
 * the data is further processed through `parseStateTable` to structure it with headers
 * and state-keyed values. Metadata fields (title, subtitle, date, notes, source) are
 * extracted from their configured cell references, with multi-cell ranges concatenated.
 * Footnotes are also extracted if specified in the mapping.
 *
 * @param table - The mapping configuration specifying sheet name, data range, type, and metadata locations
 * @param sheet - The XLSX worksheet to extract data from
 */
function mapValues(table: Mapping, sheet: XLSX.WorkSheet): void {
	data[table.sheetName] = {
		type: table.type,
		data: [],
	};
	const metadata: (keyof Mapping)[] = [
		'title',
		'subtitle',
		'date',
		'notes',
		'source',
	];

	const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
		header: 1,
		range: table.data,
		raw: false,
	});

	const columns = maxLength(rawData);
	rawData.forEach(row => {
		while (row.length < columns) {
			row.push(null);
		}
	});

	const tableEntry = data[table.sheetName];
	if (!tableEntry) return;

	if (table.type === 'states') {
		tableEntry.data = parseStateTable(rawData);
	} else if (table.type === 'sectioned') {
		tableEntry.data = parseSectionedTable(rawData);
	} else {
		tableEntry.data = parseBracketTable(rawData);
	}

	metadata.forEach(term => {
		const value = table[term];
		if (value && typeof value === 'string') {
			const cellRef = value;
			const cell = sheet[cellRef] as { v?: unknown } | undefined;
			const metadataValue = !cellRef.includes(':')
				? cell?.v
				: concatRange(cellRef, sheet);

			if (metadataValue !== undefined) {
				(tableEntry as Record<string, unknown>)[term] = metadataValue;
			}
		}
	});

	if (table.footnotes) {
		const footnotesData: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
			header: 1,
			range: table.footnotes,
			raw: false,
		});
		tableEntry.footnotes = footnotesData;
	} else {
		tableEntry.footnotes = null;
	}
}

/**
 * Iterates through all table mappings and extracts data from the source workbook.
 *
 * Verifies the source file exists, then processes each mapping configuration
 * by finding the corresponding sheet in the workbook and calling `mapValues`
 * to extract and transform the data. Progress is logged to the console for
 * each sheet processed.
 */
function buildData(): void {
	fs.access(source, err => {
		if (err) throw err;
	});
	(mappings as Mapping[]).forEach(table => {
		const sheet = wb.Sheets[table.sheetName];
		if (table.data && sheet) {
			console.log(`Mapping ${table.sheetName}`);
			mapValues(table, sheet);
		}
	});
}

/**
 * Orchestrates the full data compilation and output process.
 *
 * Calls `buildData` to extract all table data from the source workbook,
 * writes the compiled data to a JSON file for the frontend application,
 * and generates individual Excel files for each table via `writeExcelFiles`.
 */
function writeData(): void {
	buildData();
	console.log('Writing new data to file...');
	fs.writeFileSync(destination, JSON.stringify(data, null, 2));
	console.log('New data created.');
	console.log('Writing individual Excel files...');
	writeExcelFiles(data);
}

fs.access(destination, err => {
	console.log('Deleting old data...');
	if (err) {
		console.log('No data file found, creating from scratch.');
		writeData();
	} else {
		fs.unlink(destination, err => {
			if (err) throw err;
			console.log('Old data deleted.');
			writeData();
		});
	}
});
