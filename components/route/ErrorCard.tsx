import React from 'react';
import styled from 'styled-components';
import { Card } from '../Layout';

export const ErrorCard: React.FC = ({ children }) => (
  <Card variant="warning">
    <Header>This card could not be rendered.</Header>
    {children}
  </Card>
);

const Header = styled.div`
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
`;
