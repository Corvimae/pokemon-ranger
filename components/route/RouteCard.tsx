import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { BorderlessCard, Card, variantIsBorderless } from '../Layout';

interface RouteCardProps {
  theme: string,
}

export const RouteCard: React.FC<RouteCardProps> = ({ theme: variant, children }) => {
  const themeContext = useContext(ThemeContext);
  const CardComponent = variantIsBorderless(themeContext, variant) ? BorderlessCard : Card;

  return (
    <CardComponent variant={variant}>
      {children}
    </CardComponent>
  );
};
