import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.borderColor};

  td {
    padding: 0.25rem;
    text-align: center;
  }
`;

const TableRow = ({ row }) => (
  <StyledTableRow>
    {row.map(cell => (
      <td>{cell}</td>
    ))}
  </StyledTableRow>
);

export default TableRow;

TableRow.propTypes = {
  row: PropTypes.array,
};