import React from 'react';
import styled from 'styled-components';

export const ErrorCard: React.FC = ({ children }) => (
  <Container>
    <Header>This card could not be rendered.</Header>
    {children}
  </Container>
);

const Container = styled.div`
  width: 100%;
  padding: 1rem;
  background-color: #fff5bc;
  border: 1px solid #c4b980;
  color: #4e4a30;
`;

const Header = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
`;
