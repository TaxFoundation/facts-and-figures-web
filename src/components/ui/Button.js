import styled, { css } from 'styled-components';

const ButtonStyles = css`
  background-color: ${props => props.theme.white};
  border: 1px solid ${props => props.theme.tfBlue};
  border-radius: 4px;
  color: ${props => props.theme.tfBlue};
  font-size: 1rem;
  padding: 0.25rem;
  width: 100%;
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
