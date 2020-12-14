import styled from 'styled-components';

export const ResultsSubheader = styled.h3`
  font-size: 1rem;
  color: #666;
  font-weight: 700;
  margin: 0.25rem 0;
`;

export const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 2rem;
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

export const ResultsDamageRow = styled.div`
  grid-column: 1 / -1;
  color: #666;
  font-size: 0.825rem;
  padding: 0.25rem 0.5rem;
`;