import styled from 'styled-components';
import { CopyGridButton } from './CopyGridButton';

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

export const Card = styled.div`
  width: 100%;
  padding: 1rem;
  background-color: #a1c2ee;
  border: 1px solid #5e84b6;
  color: #1a3250;
`;
