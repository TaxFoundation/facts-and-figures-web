import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Table from './Table';
import { StyledTableHeader } from './ui/TableHeader';
import { StyledTableRow } from './ui/TableRow';

const StatesTable = ({ data }) => {
  const [sortBy, setSortBy] = useState('state');
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
              onClick={() => {
                setSortBy(header.id);
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
            <StyledTableRow>
              {data.data.headers.map(header => {
                return <td>{row[header.id]}</td>;
              })}
            </StyledTableRow>
          ))}
      </tbody>
    </Table>
  );
};

StatesTable.propTypes = {};

export default StatesTable;
