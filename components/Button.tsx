import styled from 'styled-components';

export const Button = styled.button`
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
  margin: 0;
  background-color: ${({ theme }) => theme.primary};
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;

  &:not(:disabled):hover,
  &:not(:disabled):active {
    background-color: ${({ theme }) => theme.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
  }

  & + & {
    margin-left: 1rem;
  }
`;

export const IconButton = styled(Button)`
  color: ${({ theme }) => theme.foreground};
  background-color: transparent;
  
  &:not(:disabled):hover,
  &:not(:disabled):active {
    background-color: transparent;
    color: ${({ theme }) => theme.foregroundHover};
  }
`;
