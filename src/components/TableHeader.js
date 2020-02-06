import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTableHeader = styled.tr`
  border-bottom: 2px solid ${props => props.theme.tfBlue};

  th {
    font-weight: bold;
  }
`;

const TableHeader = ({ headings }) => (
  <StyledTableHeader>
    {headings.map(heading => (
      <th key={`cell-${heading}`}>{heading}</th>
    ))}
  </StyledTableHeader>
);

TableHeader.propTypes = {
  headings: PropTypes.array,
};

export default TableHeader;
