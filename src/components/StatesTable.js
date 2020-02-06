import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { kebabCase } from 'lodash';

import Table from './Table';
import { StyledTableHeader } from './ui/TableHeader';
import { StyledTableRow } from './ui/TableRow';

const StatesTable = ({ id, data }) => {
  const [sortBy, setSortBy] = useState('fips');
  const [sortAsc, setSortAsc] = useState(true);

  return (
    <Table>
      <caption>
        <h1>{data.title}</h1>
        {data.subtitle ? <p>{data.subtitle}</p> : null}
        <p>{data.date}</p>
      </caption>
      <thead>
        <StyledTableHeader>
          {data.data.headers.map(header => (
            <th
              key={`table-${id}-header-${header.id}`}
              onClick={() => {
                header.id === 'state'
                  ? setSortBy('fips')
                  : setSortBy(header.id);
                setSortAsc(!sortAsc);
              }}
            >
              {header.name}
            </th>
          ))}
        </StyledTableHeader>
      </thead>
      <tbody>
        {data.data.values
          .sort((a, b) => {
            return sortAsc ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy];
          })
          .map(row => (
            <StyledTableRow key={`table-${id}-row-${kebabCase(row.state)}`}>
              {data.data.headers.map((header, i) => {
                return (
                  <td key={`table-${id}-row-${kebabCase(row.state)}-${i}`}>
                    {row[header.id]}
                  </td>
                );
              })}
            </StyledTableRow>
          ))}
      </tbody>
    </Table>
  );
};

StatesTable.propTypes = {};

export default StatesTable;
