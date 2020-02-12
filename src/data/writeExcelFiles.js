const XLSX = require('XLSX');
const _ = require('lodash');

module.exports = data => {
  const keys = Object.keys(data);
  keys.forEach(key => {
    const wb = XLSX.utils.book_new();
    const ws_data = [];
    const top = ['title', 'subtitle', 'date'];
    const length = Array.isArray(data[key].data)
      ? data[key].data[0].length
      : data[key].data.headers.length;

    top.forEach(item => {
      if (data[key][item]) {
        const itemArray = new Array(length);
        itemArray[0] = data[key][item];
        ws_data.push(itemArray);
      }
    });

    if (data[key].type !== 'states') {
      ws_data.push(new Array(length));
      ws_data.push(data[key].data);
      ws_data.push(new Array(length));
    } else {
      ws_data.push(new Array(length));
      data[key].data.values.forEach(row => {
        let theRow = [];
        data[key].data.headers.forEach(header => {
          if (header.id === 'state' && row.footnotes) {
            theRow.push(
              `${row[header.id].trim()} (${row.footnotes.join(', ')})`
            );
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
    // TODO add data to one sheet in file
    console.log(`Writing Table ${key}...`);
    // XLSX.writeFile(wb, `../public/data/${_.kebabCase(data.title)}.xlsx`);
    console.log(ws_data);
  });
};
