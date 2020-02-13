import styled from 'styled-components';

const SortedHeading = styled.th`
  background-color: ${props => props.theme.white};
  border-bottom: 2px solid ${props => props.theme.tfBlue};
  cursor: pointer;
  font-weight: 700;
  text-align: center;
  transition: 0.2s ease-in-out background-color;

  div {
    overflow: hidden;
    text-overflow: ellipsis;

    @media screen and (min-width: 500px) {
      padding-right: 0.5rem;
      position: relative;

      &::after,
      &::before {
        border: 4px solid transparent;
        content: '';
        display: block;
        height: 0;
        right: 0;
        top: 50%;
        position: absolute;
        width: 0;
      }

      &::before {
        border-bottom-color: ${props =>
          props.ascending && props.orderedBy === props.id
            ? props.theme.color
            : props.theme.borderColor};
        margin-top: -9px;
      }

      &::after {
        border-top-color: ${props =>
          !props.ascending && props.orderedBy === props.id
            ? props.theme.color
            : props.theme.borderColor};
        margin-top: 1px;
      }
    }
  }

  &:hover {
    background-color: ${props => props.theme.tfBlueHighlight};
  }
`;

export default SortedHeading;
