import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${props => props.theme.tfBlueHighlight};
  }

  td {
    padding: 0.25rem;
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
