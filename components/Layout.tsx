import styled from 'styled-components';
import { CopyGridButton } from './CopyGridButton';

interface CardVariantDefinition {
  background: string;
  border: string;
  text: string;
  borderless?: boolean;
}

const CARD_VARIANTS: Record<string, CardVariantDefinition> = {
  info: {
    background: '#a1c2ee',
    border: '#5e84b6',
    text: '#1a3250',
  },
  error: {
    background: '#ffc6c6',
    border: '#923a3a',
    text: '#3f0909',
  },
  warning: {
    background: '#fff5bc',
    border: '#c4b980',
    text: '#4e4a30',
  },
  success: {
    background: '#b3f7cd',
    border: '#409b63',
    text: '#0f4423',
  },
  neutral: {
    background: '#e6e6e6',
    border: '#999',
    text: '#333',
  },
  borderless: {
    background: 'transparent',
    border: 'transparent',
    text: 'inherit',
    borderless: true,
  },
  faint: {
    background: 'transparent',
    border: 'transparent',
    text: '#999',
    borderless: true,
  },
} as const;

export const Header = styled.h2`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  color: #333;
  font-weight: 700;
  margin: 0.5rem 0;
`;

export const ResultsSubheader = styled.h3`
  font-size: 1rem;
  color: #666;
  font-weight: 700;
  margin: 0.25rem 0;
`;

export const ResultsGrid = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 2rem;

  & ${CopyGridButton} {
    display: none;
  }

  &:hover ${CopyGridButton} {
    display: block;
  }
`;

export const ResultsGridHeader = styled.div`
  display: contents;

  & > div {
    background-color: #eaeaea;
    padding: 0.25rem 0.5rem;
    font-weight: 700;
  }
`;

export const ResultsRow = styled.div`
  display: contents;

  & > div {
    padding: 0.25rem 0.5rem 0 0.5rem;
  }
`;

export const InputSection = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
`;

export const InputRow = styled.div`
  display: contents;

  & > label {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
    padding-right: 0.5rem;
    font-weight: 700;
    line-height: 2;
  }

  & > input {
    border-radius: 0.25rem;
    height: 2rem;
    margin: 0 0 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    border: 1px solid #999;
  }

  & > select {
    border-radius: 0.25rem;
    height: 2rem;
    margin: 0 0 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    border: 1px solid #999;
  }
`;

export const InputSubheader = styled.div`
  grid-column: 1 / -1;
  font-size: 1.25rem;
  font-weight: 700;
  color: #666;
  margin: 0.5rem 0;
`;

export const HelpText = styled.div`
  grid-column: 2;
  font-size: 0.875rem;
  font-style: italic;
  color: #666;
  margin: -0.5rem 0 0.5rem;
`;

export const Checkbox = styled.button<{ 'data-checked': boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props['data-checked'] ? '#30b878' : 'transparent'};
  border: ${props => props['data-checked'] ? 'none' : '1px solid #999'};
  border-radius: 0.25rem;
  margin: 0.25rem 0 0.75rem;
  width: 1.5rem;
  height: 1.5rem;

  &::after {
    content: '✓';
    display: ${props => props['data-checked'] ? 'block' : 'none'};
    font-size: 1rem;
    font-weight: 700;
    margin-top: -2px;
    color: #fff;
  }
`;

export type CardVariant = keyof typeof CARD_VARIANTS;

export function variantIsBorderless(variant: string): boolean {
  const variantDefinition = CARD_VARIANTS[variant as CardVariant] ?? CARD_VARIANTS.info;

  return variantDefinition.borderless === true;
}

export const Card = styled.div<{ variant?: CardVariant }>`
  width: 100%;
  padding: 0 1rem;
  background-color: ${({ variant = 'info' }) => CARD_VARIANTS[variant]?.background};
  border: 1px solid ${({ variant = 'info' }) => CARD_VARIANTS[variant]?.border};
  color: ${({ variant = 'info' }) => CARD_VARIANTS[variant]?.text};
  margin: 1rem 0;
`;

export const BorderlessCard = styled.div<{ variant?: CardVariant }>`
  color: ${({ variant = 'borderless' }) => CARD_VARIANTS[variant]?.text};
`;
