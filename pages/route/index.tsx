import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import merge from 'deepmerge';
import unified from 'unified';
import remark from 'remark-parse';
import remarkToRehype from 'remark-rehype';
import rehypeToReact from 'rehype-react';
import directive from 'remark-directive';
import raw from 'rehype-raw';
import sanitize from 'rehype-sanitize';
import gh from 'hast-util-sanitize/lib/github.json';
import { Schema } from 'hast-util-sanitize';
import { directiveConverter } from '../../directives/directiveConverter';
import { IVCalculatorDirective } from '../../directives/IVCalculatorDirective';
import { loadFile, RouteContext } from '../../reducers/route/reducer';
import { IVTracker } from '../../components/route/IVTracker';
import { IVDisplay } from '../../components/route/IVDisplay';
import { DamageTable } from '../../components/route/DamageTable';
import { ConditionalBlock } from '../../components/route/ConditionalBlock';
import { ContainerLabel } from '../../components/Layout';
import { Button } from '../../components/Button';
import { RouteCard } from '../../components/route/RouteCard';
import { InlineInfo } from '../../components/route/InlineInfo';
import { TrainerBlock } from '../../components/route/TrainerBlock';
import { PokemonBlock } from '../../components/route/PokemonBlock';
import { ImportPrompt } from '../../components/route/ImportPrompt';

const schema = merge(gh, {
  tagNames: [
    'tracker',
    'if',
    'damage',
    'level',
    'card',
    'info',
    'trainer',
    'pokemon',
    'containerlabel',
  ],
  attributes: {
    tracker: ['species', 'contents', 'baseStats'],
    if: ['condition', 'level', 'evolution', 'source', 'theme'],
    card: ['theme'],
    info: ['color'],
    trainer: ['info', 'infoColor'],
    pokemon: ['info', 'infoColor'],
    damage: [
      'source',
      'contents',
      'level',
      'evolution',
      'evs',
      'combatStages',
      'movePower',
      'effectiveness',
      'stab',
      'opponentStat',
      'opponentCombatStages',
      'opponentLevel',
      'torrent',
      'weatherBoosted',
      'weatherReduced',
      'multiTarget',
      'otherModifier',
      'generation',
      'offensive',
      'special',
      'healthThreshold',
    ],
  },
});

const processor = unified()
  .use(remark)
  .use(directive)
  .use(directiveConverter)
  .use(remarkToRehype, { allowDangerousHtml: true })
  .use(raw)
  .use(sanitize, (schema as unknown) as Schema)
  .use(rehypeToReact, {
    createElement: React.createElement,
    components: ({
      tracker: IVCalculatorDirective,
      if: ConditionalBlock,
      damage: DamageTable,
      card: RouteCard,
      info: InlineInfo,
      trainer: TrainerBlock,
      pokemon: PokemonBlock,
      containerlabel: ContainerLabel,
    } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
  });

interface RouteViewParams {
  repo?: string;
}

const RouteView: NextPage<RouteViewParams> = ({ repo }) => {
  const router = useRouter();
  const dispatch = RouteContext.useDispatch();
  const hasAttemptedQueryParamLoad = useRef(false);

  const [fileContent, setFileContent] = useState<string | null>(null);

  const handleOnInitialImport = useCallback(() => {
    hasAttemptedQueryParamLoad.current = true;
  }, []);

  const handleCloseRoute = useCallback(() => {
    dispatch(loadFile());

    setFileContent(null);
    
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      undefined,
      { shallow: true },
    );
  }, [dispatch, router]);

  const content = useMemo(() => {
    if (!fileContent) return null;

    try {
      return {
        error: false,
        content: processor.processSync(fileContent).result as React.ReactNode,
      };
    } catch (e) {
      console.error(e);
      return {
        error: true,
        message: 'The route file is not valid.',
      };
    }
  }, [fileContent]);

  const state = RouteContext.useState();

  return (
    <Container>
      <Guide>
        {content && !content?.error ? (
          <>
            <RouteActions>
              <Button onClick={handleCloseRoute}>Close</Button>
            </RouteActions>
            <RouteContent>
              {content.content}
            </RouteContent>
          </>
        ) : (
          <ImportPrompt
            repo={repo}
            error={content?.error ? content.message : undefined}
            setFileContent={setFileContent}
            hasAttemptedQueryParamLoad={hasAttemptedQueryParamLoad.current}
            onInitialLoad={handleOnInitialImport}
          />
        )}
      </Guide>
      <Sidebar>
        <TrackerInputContainer>
          {Object.values(state.trackers).map(tracker => (
            <IVTracker key={tracker.name} tracker={tracker} />
          ))}
        </TrackerInputContainer>
        <div>
          {Object.values(state.trackers).map(tracker => (
            <IVDisplay key={tracker.name} tracker={tracker} />
          ))}
        </div>
      </Sidebar>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async context => ({
  props: {
    repo: context.query.repo ? decodeURIComponent(context.query.repo as string) : null,
  },
});

export default RouteContext.connect(RouteView);

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 1fr minmax(28rem, max-content);
  overflow: hidden;
`;

const Guide = styled.div`
  position: relative;
  padding: 0.5rem;
  overflow-y: auto;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  background-color: #222;
  color: #eee;
  overflow: hidden;
`;

const TrackerInputContainer = styled.div`
  overflow-y: auto;
  min-height: 0;
  flex-grow: 1;
  align-self: stretch;
`;

const RouteContent = styled.div`
  & > div {
    line-height: 1.52;

    & > *:first-child {
      margin-top: 0;
    }

    & > * {
      max-width: 100%;
    }

    & pre > code {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      background-color: #333;
      color: #eee;
      padding: 0.5rem;
      border-radius: 0.25rem;
    }

    & h4 + ul {
      margin-top: -1rem;
    }

    & h3 + blockquote {
      margin-top: -1rem;
    }

    & ul + ul {
      margin-top: -1rem;
    }
  }
`;

const RouteActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
`;
