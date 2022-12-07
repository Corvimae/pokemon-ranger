import React from 'react';
import styled from 'styled-components';

interface DropdownBlockProps {
  title?: string;
  theme?: string;
}

export const DropdownBlock: React.FC<DropdownBlockProps> = ({ title, theme = 'info', children }) => (
  <p>
    <Container variant={theme}>
      <summary>{title}</summary>
      {children}
    </Container>
  </p>
);

const Container = styled.details<{ variant: string }>`
  padding: 0.25rem 0.5rem;
  background-color: ${({ theme, variant }) => theme.cards[variant]?.background ?? theme.cards.info.background};
  
  & > summary {
    color: ${({ theme, variant }) => theme.cards[variant]?.text ?? theme.cards.info.text};
    cursor: pointer;
  }
`;
