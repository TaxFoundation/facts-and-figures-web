const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const mappings = require('./data/mappings.json');
const states = require('./data/states.json');

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

  const cooncatenation = values.reduce((prev, curr) => {
    return `${prev} ${curr.trim()}`;
  }, '');

  return cooncatenation;
};

// const parseStateTable = (table) => {
//   const headerRow = table[0];
//   const rankColumn = headerRow.reduce((acc, curr, i) => {
//     if (curr === 'Rank') return acc + i;
//     return acc;
//   }, 0);
// }

const mapValues = (table, sheet) => {
  data[table.sheetName] = {};
  const metadata = ['title', 'subtitle', 'date', 'notes', 'source'];

  const rawData = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    range: table.data,
    raw: false
  });

  data[table.sheetName].data = rawData;

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
