import React from 'react';
import { BorderlessCard, Card, CardVariant, variantIsBorderless } from '../Layout';

interface RouteCardProps {
  theme: CardVariant,
}

export const RouteCard: React.FC<RouteCardProps> = ({ theme, children }) => {
  const CardComponent = variantIsBorderless(theme) ? BorderlessCard : Card;

  return (
    <CardComponent variant={theme}>
      {children}
    </CardComponent>
  );
};
