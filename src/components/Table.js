import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;

  caption {
    margin: 2rem;
    color: ${props => props.theme.tfBlue};

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1;
      margin: 0;
    }

    p {
      font-size: 1.25rem;
      font-style: italic;
      margin: 0;
    }

    tr {
      font-family: ${props => props.theme.RobotoMono};
    }
  }
`;

export const AlternateRowTable = styled(StyledTable)`
  tr:nth-child(even) {
    background-color: ${props => props.theme.tfBlueHighlight};
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
