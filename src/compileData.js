const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const mappings = require('./data/mappings.json');
const parseStateTable = require('./data/parseStateTable');
const writeExcelFiles = require('./data/writeExcelFiles');

function maxLength(arrays) {
  let length = 0;
  arrays.forEach(array => {
    length = Math.max(length, array.length);
  });

  return length;
}

let data = {};

const source = path.resolve(__dirname, 'data/facts-and-figures.xlsx');
const destination = path.resolve(__dirname, 'data/data.json');
const wb = XLSX.readFile(source);

const concatRange = (range, sheet) => {
  const cells = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range,
    raw: false
  });
  let values = [];
  cells.forEach(row => {
    row.forEach(cell => values.push(cell));
  });

  const concatenation = values.reduce((prev, curr) => {
    return `${prev} ${curr.trim()}`;
  }, '');

  return concatenation;
};

const mapValues = (table, sheet) => {
  data[table.sheetName] = {
    type: table.type
  };
  const metadata = ['title', 'subtitle', 'date', 'notes', 'source'];

  const rawData = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: table.data,
    raw: false
  });

  const columns = maxLength(rawData);
  rawData.forEach(row => {
    while (row.length < columns) {
      row.push(null);
    }
  });

  data[table.sheetName].data =
    table.type === 'states' ? parseStateTable(rawData) : rawData;

  metadata.forEach(term => {
    if (table[term]) {
      data[table.sheetName][term] =
        table[term].indexOf(':') === -1
          ? sheet[table[term]].v
          : concatRange(table[term], sheet);
    }
  });
  data[table.sheetName].footnotes = table.footnotes
    ? XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        range: table.footnotes,
        raw: false
      })
    : null;
};

const buildData = () => {
  fs.access(source, err => {
    if (err) throw err;
  });
  mappings.forEach(table => {
    const sheet = wb.Sheets[table.sheetName];
    if (table.data) {
      console.log(`Mapping ${table.sheetName}`);
      mapValues(table, sheet);
    }
  });
};

const writeData = () => {
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
