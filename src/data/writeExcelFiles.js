const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

function maxLength(arrays) {
  let length = 0;
  arrays.forEach(array => {
    length = Math.max(length, array.length);
  });

  return length;
}

function writeWorkbook(key, data, destination) {
  const wb = XLSX.utils.book_new();
  const ws_data = [];
  const top = ['title', 'subtitle', 'date'];
  const bottom = ['notes', 'source'];
  const length = Array.isArray(data[key].data)
    ? maxLength(data[key].data)
    : data[key].data.headers.length;

  top.forEach(item => {
    if (data[key][item]) {
      const itemArray = new Array(length);
      itemArray[0] = data[key][item].trim();
      ws_data.push(itemArray);
    }
  });

  if (data[key].type !== 'states') {
    ws_data.push(new Array(length));
    ws_data.push(...data[key].data);
    ws_data.push(new Array(length));
  } else {
    ws_data.push(new Array(length));
    // create array for header row
    let theHeaders = [];
    data[key].data.headers.forEach(header => {
      theHeaders.push(header.name);
    });
    ws_data.push(theHeaders);
    // create arrays for each row of data
    data[key].data.values.forEach(row => {
      let theRow = [];
      data[key].data.headers.forEach(header => {
        if (header.id === 'state' && row.footnotes) {
          theRow.push(`${row[header.id].trim()} (${row.footnotes.join(', ')})`);
        } else if (row[header.id]) {
          theRow.push(row[header.id].trim());
        } else {
          theRow.push(null);
        }
      });
      ws_data.push(theRow);
    });
    ws_data.push(new Array(length));
  }

  if (data[key].footnotes) {
    data[key].footnotes.forEach(footnote => {
      const fnArray = new Array(length);
      if (footnote[0]) {
        fnArray[0] = footnote[0].trim();
        ws_data.push(fnArray);
      }
    });
  }

  bottom.forEach(item => {
    if (data[key][item]) {
      const itemArray = new Array(length);
      itemArray[0] = data[key][item].trim();
      ws_data.push(itemArray);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, `Facts and Figures Table ${key}`);
  XLSX.writeFileSync(wb, destination);

  return ws;
}

module.exports = data => {
  const keys = Object.keys(data);
  const outputDirectory = path.resolve(__dirname, '../../public/data');

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  fs.readdir(outputDirectory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlinkSync(path.join(outputDirectory, file), err => {
        if (err) throw err;
      });
    }
    console.log(`Old Excel files deleted.`);

    let wb = XLSX.utils.book_new();
    keys.forEach(key => {
      const destination = path.join(outputDirectory, `table-${key}.xlsx`);
      let sheet = writeWorkbook(key, data, destination);
      XLSX.utils.book_append_sheet(wb, sheet, key);
    });
    XLSX.writeFileSync(
      wb,
      path.join(outputDirectory, 'facts-and-figures.xlsx')
    );
  });
  console.log('New Excel files written.');
};
