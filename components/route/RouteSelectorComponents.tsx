import React from 'react';
import styled from 'styled-components';
import { components, OptionProps } from 'react-select';
import { Link } from '../Layout';

export interface RouteMetadata {
  path: string;
  title?: string;
  author?: string;
  authorLink?: string;
  generation?: number;
  game?: string;
}

export const RouteDropdownOption : React.FC<OptionProps<RouteMetadata, false>> = props => {
  const { data } = props;

  return (
    <components.Option {...props}>
      <Container>
        <Row>
          <Title>{data.title ?? data.path}</Title>
          {data.author && (
            <Author>
              by&nbsp;
              {data.authorLink ? (
                <Link href={data.authorLink} target="_blank" rel="nofollow noreferrer">{data.author}</Link>
              ) : data.author}
            </Author>
          )}
        </Row>
        {data.game && (
          <Row>
            <Game>
              {data.game}
              {data.generation && ` (Gen ${data.generation})`}
            </Game>
          </Row>
        )}
      </Container>
    </components.Option>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  line-height: normal;

  & + & {
    margin-top: 0.25rem;
  }
`;

const Title = styled.span`
  font-weight: 700;
  min-width: 0;
  flex-grow: 1;
  align-self: baseline;
  text-align: left;
`;

const Author = styled.span`
  font-size: 0.825rem;
  width: max-content;
  white-space: nowrap;
  align-self: baseline;
`;

const Game = styled.span`
  font-style: italic;
  font-size: 0.75rem;
`;
