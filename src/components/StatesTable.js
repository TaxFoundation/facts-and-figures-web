import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { kebabCase } from 'lodash';

import { AlternateRowTable } from './Table';
import SortedHeading from './ui/SortedHeading';
import { StyledTableRow } from './ui/TableRow';

function valueCleanup(value) {
  return value.trim().replace(/[$%,-]/g, '');
}

function sortValues(a, b, sortAsc) {
  if (isNaN(a) || isNaN(b)) {
    const A = a ? valueCleanup(a) : 0;
    const B = b ? valueCleanup(b) : 0;
    if (!isNaN(A) && !isNaN(B)) {
      return sortAsc ? +A - +B : +B - +A;
    }
  } else if (typeof +a === 'number' && typeof +b === 'number') {
    return sortAsc ? a - b : b - a;
  }
}

const StatesTable = ({ id, data }) => {
  const [table, setTable] = useState(id);
  const [sortBy, setSortBy] = useState('fips');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    if (id !== table) {
      setTable(id);
    }
    return () => {
      setSortBy('fips');
      setSortAsc(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, table]);

  return (
    <AlternateRowTable>
      <caption>
        <h1>{data.title}</h1>
        {data.subtitle ? <p>{data.subtitle}</p> : null}
        <p>{data.date}</p>
      </caption>
      <thead>
        <tr>
          {data.data.headers.map((header, i) => (
            <SortedHeading
              key={`table-${id}-header-${header.id}-${i}`}
              ascending={sortAsc}
              orderedBy={sortBy}
              id={header.id === 'state' ? 'fips' : header.id}
              onClick={() => {
                header.id === sortBy ||
                (header.id === 'state' && sortBy === 'fips')
                  ? setSortAsc(!sortAsc)
                  : setSortAsc(true);
                header.id === 'state'
                  ? setSortBy('fips')
                  : setSortBy(header.id);
              }}
            >
              <div>{header.name}</div>
            </SortedHeading>
          ))}
        </tr>
      </thead>
      <tbody>
        {id === table &&
          data.data.values
            .sort((a, b) => sortValues(a[sortBy], b[sortBy], sortAsc))
            .map((row, i) => (
              <StyledTableRow key={`table-${id}-row-${kebabCase(row.state)}`}>
                {data.data.headers.map((header, i) => {
                  return (
                    <td key={`table-${id}-row-${kebabCase(row.state)}-${i}`}>
                      {i === 0 && row.footnotes
                        ? `${row[header.id]} (${row.footnotes.join(', ')})`
                        : row[header.id]}
                    </td>
                  );
                })}
              </StyledTableRow>
            ))}
      </tbody>
    </AlternateRowTable>
  );
};

StatesTable.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.object
};

export default StatesTable;
