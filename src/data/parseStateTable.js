const _ = require('lodash');

const states = require('./states.json');

module.exports = function(table) {
  /*
  Take data that looks like this:
  [
    [State, Value, Rank],
    [Ala., 14%, 19],
    ...
  ]
  And return this:
  "headers": [
    {
      "name": "State",
      "id": "state",
      "order": 0
    },
    {
      "name": "Value",
      "id": "value",
      "order": 1
    },
    {
      "name": "Rank",
      "id": "rank",
      "order": 2
    }
  ],
  "values": [
    {
      "state": "Alabama",
      "fips": 1,
      "tax-freedom-day": "14%",
      "rank": "19"
    },
    ...
  ]
  Assume first row is the table headings
  */
  const headerRow = table[0];
  const headers = headerRow.map((header, i) => {
    return {
      name: header,
      id: _.kebabCase(header),
      order: i
    };
  });

  // Assume all other rows after first are data
  const values = table.slice(1).map(row => {
    let value = {};

    // figure out which state this is
    const stateAbbr = /([a-z]+\.?[a-z]+\.?)/i;
    // Does it have footnotes?
    const footnotesCheck = /\((.*)\)/;

    const theState = states.find(state => {
      const theAbbr = row[0].match(stateAbbr);

      // Got to try them all, because data inconsistency
      return (
        state.abbr === theAbbr[1] ||
        state.postal === theAbbr[1] ||
        state.name === theAbbr[1]
      );
    });

    if (row[0].match(footnotesCheck)) {
      const theNotes = row[0]
        .match(footnotesCheck)[1]
        .replace(/\s/g, '')
        .split(',');
      value['footnotes'] = theNotes;
    }

    // Name for display, fips for easy sort
    value['fips'] = theState.id;
    value['state'] = theState.name;

    // Assuming first column is state,
    // set the row values for each header ID
    row.slice(1).forEach((cell, i) => {
      const header = headers.find(h => h.order === i + 1).id;
      const DC = /\((\d+)\)/;
      if (cell && cell.match(DC)) {
        value[header] = cell.match(DC)[1];
      } else {
        value[header] = cell;
      }
    });

    return value;
  });
  return { headers, values };
};
