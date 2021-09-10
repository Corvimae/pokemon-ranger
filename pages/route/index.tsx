import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { directiveConverter } from '../../directives/directiveConverter';
import { IVCalculatorDirective } from '../../directives/IVCalculatorDirective';
import { loadFile, resetRoute, RouteContext, setShowOptions } from '../../reducers/route/reducer';
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
import { RouteImage } from '../../components/route/RouteImage';
import { RouteOptionsModal } from '../../components/route/RouteOptionsModal';
import { useOnMount } from '../../utils/hooks';
import { loadOptions } from '../../utils/options';
import { VariableBlock } from '../../components/route/VariableBlock';
import { CalculationDirective } from '../../components/route/CalculationDirective';

const RESET_CONFIRM_DURATION = 2000;

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
    'variable',
    'calc',
  ],
  attributes: {
    tracker: [
      'species',
      'contents',
      'baseStats',
      'hiddenPower',
      'generation',
      'hpIV',
      'attackIV',
      'defenseIV',
      'spAttackIV',
      'spDefenseIV',
      'speedIV',
      'nature',
      'directInput',
      'directInputNatures',
    ],
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
      'friendship',
      'offensive',
      'special',
      'healthThreshold',
      'screen',
      'otherPowerModifier',
      'theme',
    ],
    variable: ['theme', 'type', 'name', 'title', 'options', 'defaultValue'],
    calc: ['color', 'contents', 'source', 'level', 'evolution', 'format'],
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
      img: RouteImage,
      tracker: IVCalculatorDirective,
      if: ConditionalBlock,
      damage: DamageTable,
      card: RouteCard,
      info: InlineInfo,
      trainer: TrainerBlock,
      pokemon: PokemonBlock,
      containerlabel: ContainerLabel,
      variable: VariableBlock,
      calc: CalculationDirective,
    } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
  });

interface RouteViewParams {
  repo?: string;
}

const RouteView: NextPage<RouteViewParams> = ({ repo }) => {
  const router = useRouter();
  const dispatch = RouteContext.useDispatch();
  const hasAttemptedQueryParamLoad = useRef(false);
  const guideContentElement = useRef<HTMLDivElement>(null);
  const [resetConfirmActive, setResetConfirmActive] = useState(false);

  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const handleOnInitialImport = useCallback(() => {
    hasAttemptedQueryParamLoad.current = true;
  }, []);

  const handleShowOptions = useCallback(() => {
    dispatch(setShowOptions(true));
  }, [dispatch]);

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

  const handleOnScrollToTop = useCallback(() => {
    if (guideContentElement.current) guideContentElement.current.scrollTop = 0;
  }, []);

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

  const handleReset = useCallback(() => {
    if (resetConfirmActive) {
      dispatch(resetRoute());
      setResetConfirmActive(false);
    } else {
      setResetConfirmActive(true);

      setTimeout(() => {
        setResetConfirmActive(false);
      }, RESET_CONFIRM_DURATION);
    }
  }, [dispatch, resetConfirmActive]);

  useOnMount(() => loadOptions(dispatch));

  useEffect(() => {
    const element = guideContentElement.current;
    const onGuideScroll = () => {
      if (element) {
        setShowScrollToTop(element.scrollTop > 0);
      }
    };

    element?.addEventListener('scroll', onGuideScroll);

    return () => {
      element?.removeEventListener('scroll', onGuideScroll);
    };
  });

  return (
    <Container ivHorizontalLayout={state.options.ivHorizontalLayout}>
      <MainContent>
        {content && !content?.error ? (
          <Guide showOptions={state.showOptions} ref={guideContentElement}>
            <RouteActions>
              <Button onClick={handleShowOptions}>Options</Button>
              <Button onClick={handleReset}>{resetConfirmActive ? 'Are you sure?' : 'Reset All'}</Button>
              <Button onClick={handleCloseRoute}>Close</Button>
            </RouteActions>
            <RouteContent hideMedia={state.options.hideMedia}>
              {content.content}
            </RouteContent>
            {state.showOptions && <RouteOptionsModal />}
          </Guide>
        ) : (
          <ImportContainer>
            <ImportPrompt
              repoQueryParam={repo}
              error={content?.error ? content.message : undefined}
              setFileContent={setFileContent}
              hasAttemptedQueryParamLoad={hasAttemptedQueryParamLoad.current}
              onInitialLoad={handleOnInitialImport}
            />
          </ImportContainer>
        )}
        <ReturnToTopButton
          disabled={!showScrollToTop || !content || content.error}
          onClick={handleOnScrollToTop}
        >
          <FontAwesomeIcon icon={faChevronUp} />
        </ReturnToTopButton>
      </MainContent>
      <Sidebar
        backgroundColor={state.options.ivBackgroundColor}
        fontFamily={state.options.ivFontFamily}
        ivHorizontalLayout={state.options.ivHorizontalLayout}
      >
        <TrackerInputContainer>
          {Object.values(state.trackers).map(tracker => (
            <IVTracker key={tracker.name} tracker={tracker} />
          ))}
        </TrackerInputContainer>
        <div>
          {Object.values(state.trackers).map(tracker => (
            <IVDisplay key={tracker.name} tracker={tracker} compactIVs={state.options.compactIVs} />
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

const Container = styled.div<{ ivHorizontalLayout: boolean }>`
  position: relative;
  display: grid;
  height: 100%;
  grid-template-columns: ${({ ivHorizontalLayout }) => !ivHorizontalLayout && '1fr minmax(28rem, max-content)'};
  grid-template-rows: ${({ ivHorizontalLayout }) => ivHorizontalLayout && '1fr 20rem'};
  overflow: hidden;
`;

const MainContent = styled.div`
  position: relative;
  height: 100%;
  overflow-y: hidden;
`;

const ImportContainer = styled.div`
  position: relative;
  height: 100%;
  overflow-y: auto;
`;

const Guide = styled.div<{ showOptions: boolean }>`
  position: relative;
  height: 100%;
  padding: 0.5rem;
  overflow-y: ${props => props.showOptions ? 'none' : 'auto'};
`;

const Sidebar = styled.div<{ backgroundColor?: string; fontFamily?: string; ivHorizontalLayout: boolean }>`
  display: flex;
  flex-direction: ${({ ivHorizontalLayout }) => ivHorizontalLayout ? 'row' : 'column'};
  padding: 0.5rem;
  font-family: ${props => props.fontFamily ?? undefined};
  background-color: ${props => props.backgroundColor ?? '#222'};
  color: #eee;
  overflow: hidden;
`;

const TrackerInputContainer = styled.div`
  overflow-y: auto;
  min-height: 0;
  flex-grow: 1;
  align-self: stretch;
`;

const RouteContent = styled.div<{ hideMedia: boolean }>`
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

    & img,
    & video {
      display: ${({ hideMedia }) => hideMedia && 'none'};
    }
  }
`;

const RouteActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
`;

const ReturnToTopButton = styled.button`
  position: absolute;
  display: flex;
  bottom: 1rem;
  right: 1rem;
  width: 2.5rem;
  height: 2.5rem;
  line-height: 2rem;
  border: none;
  border-radius: 50%;
  background-color: #30b878;
  color: #fff;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 2;
  transition: opacity 150ms ease-in;

  &:disabled {
    opacity: 0;
    pointer-events: none;
  }
`;
