import { kebabCase } from 'lodash';

import states from '../../data/states.json';
import type { Header, ParsedStateTable, State, StateValue } from './types';

export default function parseStateTable(table: unknown[][]): ParsedStateTable {
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
	const headerRow = table[0] as string[];
	const headers: Header[] = headerRow.map((header, i) => {
		return {
			name: header,
			id: kebabCase(header),
			order: i,
		};
	});

	// Assume all other rows after first are data
	const values = table
		.slice(1)
		.map(row => {
			if (!row[0]) {
				return null;
			}

			const value: StateValue = {
				state: '',
				fips: 0,
			};

			// figure out which state this is
			const stateAbbr = /([a-z]+\.?[a-z]+\.?)/i;
			// Does it have footnotes?
			const footnotesCheck = /\((.*)\)/;

			const rowState = String(row[0]);
			const theAbbr = rowState.match(stateAbbr);

			if (!theAbbr) {
				return null;
			}

			const theState = (states as State[]).find(state => {
				// Got to try them all, because data inconsistency
				return (
					state.abbr === theAbbr[1] ||
					state.postal === theAbbr[1] ||
					state.name === theAbbr[1]
				);
			});

			if (!theState) {
				return null;
			}

			if (rowState.match(footnotesCheck)) {
				const match = rowState.match(footnotesCheck);
				if (match && match[1]) {
					const theNotes = match[1].replace(/\s/g, '').split(',');
					value['footnotes'] = theNotes;
				}
			}

			// Name for display, fips for easy sort
			value['fips'] = theState.id;
			value['state'] = theState.name;

			// Assuming first column is state,
			// set the row values for each header ID
			row.slice(1).forEach((cell, i) => {
				const header = headers.find(h => h.order === i + 1);
				if (!header) return;

				const DC = /\((\d+)\)/;
				const cellStr = String(cell || '');
				const dcMatch = cellStr.match(DC);

				if (cell && dcMatch) {
					value[header.id] = dcMatch[1];
				} else {
					value[header.id] = cell as string;
				}
			});

			return value;
		})
		.filter((value): value is StateValue => value !== null);

	return { headers, values };
}
