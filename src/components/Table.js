import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;

  caption {
    margin-bottom: 1rem;

    h1 {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0;
    }

    p {
      font-style: italic;
      margin: 0;
    }
  }
`;

const Table = ({ children }) => {
  return <StyledTable>{children}</StyledTable>;
};

Table.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

export default Table;
