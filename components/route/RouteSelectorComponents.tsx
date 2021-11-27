import React, { useMemo } from 'react';
import styled from 'styled-components';
import { components, OptionProps } from 'react-select';
import { Link } from '../Layout';

interface AuthorMetadata {
  name: string;
  link: string;
}

export interface RouteMetadata {
  path: string;
  title?: string;
  author?: AuthorMetadata[] | AuthorMetadata | string;
  authorLink?: string;
  generation?: number;
  game?: string;
}

export const RouteDropdownOption : React.FC<OptionProps<RouteMetadata, false>> = props => {
  const { data } = props;

  const normalizedAuthorData = useMemo<AuthorMetadata[]>(() => {
    if (!data.author) return [];

    if (Array.isArray(data.author)) return data.author;

    if (typeof data.author === 'string') {
      return [{
        name: data.author,
        link: data.authorLink,
      }];
    }

    return [data.author];
  }, [data]);

  return (
    <components.Option {...props}>
      <Container>
        <Row>
          <Title>{data.title ?? data.path}</Title>
          {normalizedAuthorData.length > 0 && (
            <Author>
              by&nbsp;
              {normalizedAuthorData.map(({ name, link }, index) => (
                <React.Fragment key={name}>
                  {link ? (
                    <Link href={link} target="_blank" rel="nofollow noreferrer">{name}</Link>
                  ) : <span>{name}</span>}
                  {normalizedAuthorData.length > 2 && index === normalizedAuthorData.length - 3 && <span>, </span>}
                  {index === normalizedAuthorData.length - 2 && <span>{normalizedAuthorData.length > 2 && ','} and </span>}
                </React.Fragment>
              ))}
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
  max-width: 40%;
  text-align: right;
  align-self: baseline;
`;

const Game = styled.span`
  font-style: italic;
  font-size: 0.75rem;
`;
