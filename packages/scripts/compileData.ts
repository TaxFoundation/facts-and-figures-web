import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

import mappings from '../../data/mappings.json';
import parseStateTable from './parseStateTable';
import writeExcelFiles from './writeExcelFiles';
import type { CompiledData, Mapping } from './types';

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
    raw: false
  }) as unknown[][];
  const values: unknown[] = [];
  cells.forEach(row => {
    (row as unknown[]).forEach(cell => values.push(cell));
  });

  const concatenation = values.reduce<string>((prev, curr) => {
    const currStr = String(curr || '');
    return `${prev} ${currStr.trim()}`;
  }, '');

  return concatenation;
};

const mapValues = (table: Mapping, sheet: XLSX.WorkSheet): void => {
  data[table.sheetName] = {
    type: table.type,
    data: []
  };
  const metadata: (keyof Mapping)[] = ['title', 'subtitle', 'date', 'notes', 'source'];

  const rawData = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: table.data,
    raw: false
  }) as unknown[][];

  const columns = maxLength(rawData);
  rawData.forEach(row => {
    const typedRow = row as unknown[];
    while (typedRow.length < columns) {
      typedRow.push(null);
    }
  });

  const tableEntry = data[table.sheetName];
  if (!tableEntry) return;

  tableEntry.data = table.type === 'states' ? parseStateTable(rawData) : rawData;

  metadata.forEach(term => {
    const value = table[term];
    if (value && typeof value === 'string') {
      const cellRef = value;
      const metadataValue = cellRef.indexOf(':') === -1
        ? sheet[cellRef]?.v
        : concatRange(cellRef, sheet);

      if (metadataValue !== undefined) {
        (tableEntry as Record<string, unknown>)[term] = metadataValue;
      }
    }
  });

  tableEntry.footnotes = table.footnotes
    ? XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        range: table.footnotes,
        raw: false
      }) as unknown[][]
    : null;
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
  try {
    console.log('Writing new data to file...');
    fs.writeFileSync(destination, JSON.stringify(data, null, 2));
    console.log('New data created.');
    console.log('Writing individual Excel files...');
    writeExcelFiles(data);
  } catch (err) {
    throw err;
  }
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
