import React from 'react';
import { BorderlessCard, Card, CardVariant } from '../Layout';

interface RouteCardProps {
  theme: CardVariant,
}

export const RouteCard: React.FC<RouteCardProps> = ({ theme, children }) => {
  const CardComponent = theme === 'borderless' ? BorderlessCard : Card;

  return (
    <CardComponent variant={theme}>
      {children}
    </CardComponent>
  );
};
