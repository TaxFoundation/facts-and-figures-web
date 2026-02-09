import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

import type { CompiledData, StateData } from './types';

function maxLength(arrays: unknown[][]): number {
	let length = 0;
	arrays.forEach(array => {
		length = Math.max(length, array.length);
	});

	return length;
}

function writeWorkbook(
	key: string,
	data: CompiledData,
	destination: string,
): XLSX.WorkSheet {
	const wb = XLSX.utils.book_new();
	const ws_data: unknown[][] = [];
	const top = ['title', 'subtitle', 'date'] as const;
	const bottom = ['notes', 'source'] as const;

	const entry = data[key];
	if (!entry) {
		throw new Error(`No data found for key: ${key}`);
	}

	const length = Array.isArray(entry.data)
		? maxLength(entry.data as unknown[][])
		: (entry.data as StateData).headers.length;

	top.forEach(item => {
		const value = entry[item];
		if (value && typeof value === 'string') {
			const itemArray: (string | undefined)[] = new Array(length);
			itemArray[0] = value.trim();
			ws_data.push(itemArray);
		}
	});

	if (entry.type !== 'states') {
		ws_data.push(new Array(length));
		ws_data.push(...(entry.data as unknown[][]));
		ws_data.push(new Array(length));
	} else {
		ws_data.push(new Array(length));
		// create array for header row
		const theHeaders: string[] = [];
		const stateData = entry.data as StateData;
		stateData.headers.forEach(header => {
			theHeaders.push(header.name);
		});
		ws_data.push(theHeaders);
		// create arrays for each row of data
		stateData.values.forEach(row => {
			const theRow: (string | null)[] = [];
			stateData.headers.forEach(header => {
				const cellValue = row[header.id];
				if (header.id === 'state' && row.footnotes) {
					const stateStr = String(cellValue || '');
					theRow.push(`${stateStr.trim()} (${row.footnotes.join(', ')})`);
				} else if (cellValue !== undefined && cellValue !== null) {
					const valueStr = String(cellValue);
					theRow.push(valueStr.trim());
				} else {
					theRow.push(null);
				}
			});
			ws_data.push(theRow);
		});
		ws_data.push(new Array(length));
	}

	if (entry.footnotes) {
		entry.footnotes.forEach(footnote => {
			const fnArray: (string | undefined)[] = new Array(length);
			const firstCell = footnote[0];
			if (firstCell && typeof firstCell === 'string') {
				fnArray[0] = firstCell.trim();
				ws_data.push(fnArray);
			}
		});
	}

	bottom.forEach(item => {
		const value = entry[item];
		if (value && typeof value === 'string') {
			const itemArray: (string | undefined)[] = new Array(length);
			itemArray[0] = value.trim();
			ws_data.push(itemArray);
		}
	});

	const ws = XLSX.utils.aoa_to_sheet(ws_data);
	XLSX.utils.book_append_sheet(wb, ws, `Facts and Figures Table ${key}`);
	XLSX.writeFile(wb, destination);

	return ws;
}

export default function writeExcelFiles(data: CompiledData): void {
	const keys = Object.keys(data);
	const outputDirectory = path.resolve(__dirname, '../../public/data');

	if (!fs.existsSync(outputDirectory)) {
		fs.mkdirSync(outputDirectory);
	}

	fs.readdir(outputDirectory, (err, files) => {
		if (err) throw err;

		for (const file of files) {
			fs.unlinkSync(path.join(outputDirectory, file));
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
