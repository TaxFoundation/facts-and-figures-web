import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

import mappings from '../../data/mappings.json';
import parseStateTable from './parseStateTable';
import type { CompiledData, Mapping } from './types';
import writeExcelFiles from './writeExcelFiles';

function maxLength(arrays: unknown[][]): number {
	let length = 0;
	arrays.forEach(array => {
		length = Math.max(length, array.length);
	});

	return length;
}

const data: CompiledData = {};

const source = path.resolve(__dirname, '../../data/facts-and-figures.xlsx');
const destination = path.resolve(__dirname, '../../data/data.json');
const wb = XLSX.readFile(source);

const concatRange = (range: string, sheet: XLSX.WorkSheet): string => {
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
};

const mapValues = (table: Mapping, sheet: XLSX.WorkSheet): void => {
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

	tableEntry.data =
		table.type === 'states' ? parseStateTable(rawData) : rawData;

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
};

const buildData = (): void => {
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
};

const writeData = (): void => {
	buildData();
	console.log('Writing new data to file...');
	fs.writeFileSync(destination, JSON.stringify(data, null, 2));
	console.log('New data created.');
	console.log('Writing individual Excel files...');
	writeExcelFiles(data);
};

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
