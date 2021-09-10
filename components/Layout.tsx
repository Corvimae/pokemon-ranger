import styled from 'styled-components';
import { CopyGridButton } from './CopyGridButton';

interface CardVariantDefinition {
  background: string;
  border: string;
  text: string;
  borderless?: boolean;
}

export const THEMES = {
  light: {
    background: '#fff',
    backgroundSelected: '#ccc',
    backgroundDarkened: '#aaa',
    foreground: '#333',
    foregroundHover: '#000',
    primary: '#30b878',
    primaryHover: '#4ecf92',
    label: '#666',
    anchor: '#5c95e0',
    error: '#900',
    trainerBackground: '#badfff',
    input: {
      background: '#fff',
      foreground: '#333',
      border: '#999',
      hover: '#ccc',
    },
    gridHeader: {
      foreground: '#333',
      background: '#ccc',
      cardFade: 'rgba(255, 255, 255, 0.6)',
    },
    cards: {
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
      },
    } as Record<string, CardVariantDefinition>,
    info: {
      black: '#000',
      red: '#a02c2c',
      blue: '#2626a8',
      green: '#2a8f2a',
      gray: '#686868',
      pink: '#af32a5',
    },
  },
  dark: {
    background: '#24292e',
    backgroundSelected: '#596066',
    backgroundDarkened: '#7f8790',
    foreground: '#fff',
    foregroundHover: '#ced2d6',
    primary: '#248a5a',
    primaryHover: '#627d98',
    label: '#e5e7ea',
    anchor: '#7ea5d8',
    error: '#de350b',
    trainerBackground: '#2e5679',
    input: {
      background: '#383f45',
      foreground: '#f6f7f9',
      border: '#596066',
      hover: '#596066',
    },
    gridHeader: {
      foreground: '#f6f7f9',
      background: '#383f45',
      cardFade: 'rgba(0, 0, 0, 0.3)',
    },
    cards: {
      info: {
        background: '#364954',
        border: '#1e2e38',
        text: '#81c0e7',
      },
      error: {
        background: '#594141',
        border: '#3d2626',
        text: '#FF7369',
      },
      warning: {
        background: '#59563B',
        border: '#36341e',
        text: '#d8b734',
      },
      success: {
        background: '#354C4B',
        border: '#1c302f',
        text: '#5dbead',
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
        text: '#7f8790',
      },
    } as Record<string, CardVariantDefinition>,
    info: {
      black: '#fff',
      red: '#FF7369',
      blue: '#529CCA',
      green: '#4DAB9A',
      gray: '#979A9B',
      pink: '#E255A1',
    },
  },
} as const;

export const Header = styled.h2`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.foreground};
  font-weight: 700;
  margin: 0.5rem 0;
`;

export const Link = styled.a`
  font-size: 0.825rem;
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.anchor};
`;

export const ResultsSubheader = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.label};
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
    background-color: ${({ theme }) => theme.gridHeader.background};
    color: ${({ theme }) => theme.gridHeader.foreground};
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

  & label {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5rem;
    padding-right: 0.5rem;
    font-weight: 700;
    line-height: 2;
    color: ${({ theme }) => theme.label};
  }

  & input {
    border-radius: 0.25rem;
    height: 2rem;
    margin: 0 0 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    color: ${({ theme }) => theme.input.foreground};
    background-color: ${({ theme }) => theme.input.background};
    border: 1px solid ${({ theme }) => theme.input.border};
  }

  & select {
    border-radius: 0.25rem;
    height: 2rem;
    margin: 0 0 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
    color: ${({ theme }) => theme.input.foreground};
    background-color: ${({ theme }) => theme.input.background};
    border: 1px solid ${({ theme }) => theme.input.border};
  }
`;

export const InputSubheader = styled.div`
  grid-column: 1 / -1;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.label};
  margin: 0.5rem 0;
`;

export const HelpText = styled.div`
  grid-column: 2;
  font-size: 0.875rem;
  font-style: italic;
  color: ${({ theme }) => theme.label};
  margin: -0.5rem 0 0.5rem;

  & a {
    color: ${({ theme }) => theme.anchor};
  }
`;

export const Checkbox = styled.button<{ 'data-checked': boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props['data-checked'] ? props.theme.primary : 'transparent'};
  border: ${props => props['data-checked'] ? 'none' : `1px solid ${props.theme.input.border}`};
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
    color: ${({ theme }) => theme.foreground};
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function variantIsBorderless(theme: any, variant: keyof typeof THEMES.light.cards): boolean {
  const variantDefinition = theme.cards[variant] ?? theme.cards.info;

  return variantDefinition.borderless === true;
}

export const Card = styled.div<{ variant?: string }>`
  width: 100%;
  padding: 0 1rem;
  background-color: ${({ variant = 'info', theme }) => theme.cards[variant]?.background};
  border: 1px solid ${({ variant = 'info', theme }) => theme.cards[variant]?.border};
  color: ${({ variant = 'info', theme }) => theme.cards[variant]?.text};
  margin: 1rem 0;
`;

export const BorderlessCard = styled.div<{ variant?: string }>`
  color: ${({ variant = 'borderless', theme }) => theme.cards[variant]?.text};
`;

export const ContainerLabel = styled.div``;
