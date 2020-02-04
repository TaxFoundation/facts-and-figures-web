import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTable = styled.table`
  border-collapse: collapse;
  max-width: 800px;
  width: 100%;
`;

const Table = ({children}) => {
  return (
    <StyledTable>
      {children}
    </StyledTable>
  )
};

Table.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};

export default Table;
