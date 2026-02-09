import styled, { css } from 'styled-components';

const ButtonStyles = css`
  background-color: ${props => props.theme.tfYellowCTA};
  border: 1px solid ${props => props.theme.tfYellowCTA};
  border-radius: 0px;
  color: ${props => props.theme.tfBlue};
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .1em;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  width: 100%;

  &:hover {
    background-color: ${props => props.theme.tfYellowCTAhover};
    transition: 0.3s;
    transition-timing-function: ease-in-out;
  }
`;

export const StyledButtonButton = styled.button`
  ${ButtonStyles}
`;

export const StyledButtonLink = styled.a`
  ${ButtonStyles}
  display: block;
  text-align: center;
  text-decoration: none;
`;
