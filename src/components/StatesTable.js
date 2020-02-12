import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { kebabCase } from 'lodash';

import { AlternateRowTable } from './Table';
import SortedHeading from './ui/SortedHeading';
import { StyledTableRow } from './ui/TableRow';

const StatesTable = ({ id, data }) => {
  const [sortBy, setSortBy] = useState('fips');
  const [sortAsc, setSortAsc] = useState(true);

  return (
    <AlternateRowTable>
      <caption>
        <h1>{data.title}</h1>
        {data.subtitle ? <p>{data.subtitle}</p> : null}
        <p>{data.date}</p>
      </caption>
      <thead>
        <tr>
          {data.data.headers.map(header => (
            <SortedHeading
              key={`table-${id}-header-${header.id}`}
              ascending={sortAsc}
              orderedBy={sortBy}
              id={header.id === 'state' ? 'fips' : header.id}
              onClick={() => {
                header.id === 'state'
                  ? setSortBy('fips')
                  : setSortBy(header.id);
                setSortAsc(!sortAsc);
              }}
            >
              <div>{header.name}</div>
            </SortedHeading>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.data.values
          .sort((a, b) => {
            return sortAsc ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
          })
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
