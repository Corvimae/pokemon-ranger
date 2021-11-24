import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { loadFile, resetRoute, RouteContext, setShowOptions } from '../../reducers/route/reducer';
import { Button } from '../../components/Button';
import { IVTracker } from '../../components/route/IVTracker';
import { IVDisplay } from '../../components/route/IVDisplay';
import { ImportPrompt } from '../../components/route/ImportPrompt';
import { RouteOptionsModal } from '../../components/route/RouteOptionsModal';
import { useOnMount } from '../../utils/hooks';
import { loadOptions } from '../../utils/options';
import { buildRouteProcessor } from '../../utils/routeProcessor';
import { buildAllTrackerCalculationSets, RouteCalculationsContext } from '../../utils/trackerCalculations';
import { Card } from '../../components/Layout';
import { CENTRAL_ROUTE_REPO_PREFIX } from '../../utils/utils';
import { getRouteMetadata } from '../../server/routeList';
import { RouteMetadata } from '../../components/route/RouteSelectorComponents';

const RESET_CONFIRM_DURATION = 2000;
const RANGER_TITLE = 'Pokémon Ranger';

interface RouteViewParams {
  repo?: string;
  routeMetadata: RouteMetadata | null;
}

const RouteView: NextPage<RouteViewParams> = ({ repo, routeMetadata }) => {
  const router = useRouter();
  const dispatch = RouteContext.useDispatch();
  const hasAttemptedQueryParamLoad = useRef(false);
  const guideContentElement = useRef<HTMLDivElement>(null);
  const [resetConfirmActive, setResetConfirmActive] = useState(false);

  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [activeRouteMetadata, setActiveRouteMetadata] = useState<RouteMetadata | null>(routeMetadata);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const state = RouteContext.useState();

  const handleOnInitialImport = useCallback(() => {
    hasAttemptedQueryParamLoad.current = true;
  }, []);

  const handleShowOptions = useCallback(() => {
    dispatch(setShowOptions(true));
  }, [dispatch]);

  const handleCloseRoute = useCallback(() => {
    dispatch(loadFile());

    setFileContent(null);
    setActiveRouteMetadata(null);
    
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
        content: buildRouteProcessor(state.options.renderOnlyTrackers).processSync(fileContent).result as React.ReactNode,
      };
    } catch (e) {
      console.error(e);
      
      return {
        error: true,
        message: 'The route file is not valid.',
      };
    }
  }, [fileContent, state.options.renderOnlyTrackers]);

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

  const calculationSets = useMemo(() => buildAllTrackerCalculationSets(state), [state]);
  const pageDescription = activeRouteMetadata ? (
    `A route ${activeRouteMetadata.game === 'other' ? '' : `for Pokémon ${activeRouteMetadata.game} `} by ${activeRouteMetadata.author} on ${RANGER_TITLE}.`
  ) : 'Pokémon speedrunning made easier.';
  
  return (
    <RouteCalculationsContext.Provider value={calculationSets}>
      <NextSeo
        title={activeRouteMetadata ? `${activeRouteMetadata.title}` : RANGER_TITLE}
        description={pageDescription}
      />
      
      <Container ivHorizontalLayout={state.options.ivHorizontalLayout}>
        <Head>
          <title>{activeRouteMetadata ? `${activeRouteMetadata.title} -  ` : ''}{RANGER_TITLE}</title>
          {state.options.customCSS && (
            <style type="text/css">
              {state.options.customCSS}
            </style>
          )}
        </Head>
        <MainContent hasRouteContent={!(content?.error ?? true)}>
          {content && !content?.error ? (
            <Guide showOptions={state.showOptions} ref={guideContentElement}>
              <RouteActions>
                <Button onClick={handleShowOptions}>Options</Button>
                <Button onClick={handleReset}>{resetConfirmActive ? 'Are you sure?' : 'Reset All'}</Button>
                <Button onClick={handleCloseRoute}>Close</Button>
              </RouteActions>
              <RouteContent hideMedia={state.options.hideMedia}>
                {state.routeErrors.length > 0 && (
                  <Card variant="error">
                    <ErrorCardTitle>This route contains {state.routeErrors.length} error{state.routeErrors.length === 1 ? '' : 's'}:</ErrorCardTitle>
                    <ul>
                      {state.routeErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </Card>
                )}
                {content.content}
                {state.options.renderOnlyTrackers && (
                  <NoRenderWarning>
                    Route rendering is disabled. Disable the &ldquo;Render Only IV Trackers&rdquo; option
                    to re-enable it.
                  </NoRenderWarning>
                )}
              </RouteContent>
              {state.showOptions && <RouteOptionsModal />}
            </Guide>
          ) : (
            <ImportContainer>
              <ImportPrompt
                repoQueryParam={repo}
                error={content?.error ? content.message : undefined}
                setFileContent={setFileContent}
                setActiveRouteMetadata={setActiveRouteMetadata}
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
          hasContent={!(content?.error ?? true)}
        >
          <TrackerInputContainer>
            {Object.values(state.trackers).map(tracker => (
              <IVTracker
                key={tracker.name}
                tracker={tracker}
                manualEVInput={state.options.manualEVInput}
              />
            ))}
          </TrackerInputContainer>
          <div>
            {Object.values(state.trackers).map(tracker => (
              <IVDisplay key={tracker.name} tracker={tracker} compactIVs={state.options.compactIVs} />
            ))}
          </div>
        </Sidebar>
      </Container>
    </RouteCalculationsContext.Provider>
  );
};

export const getServerSideProps: GetServerSideProps = async context => {
  const repo = context.query.repo ? decodeURIComponent(context.query.repo as string) : null;
  let routeMetadata: RouteMetadata | null = null;

  if (repo?.startsWith(CENTRAL_ROUTE_REPO_PREFIX)) {
    routeMetadata = getRouteMetadata(repo.replace(CENTRAL_ROUTE_REPO_PREFIX, '')) ?? null;
  }

  return {
    props: {
      repo,
      routeMetadata,
    },
  };
};

export default RouteContext.connect(RouteView);

const Container = styled.div<{ ivHorizontalLayout: boolean; }>`
  position: relative;
  display: grid;
  height: 100%;
  grid-template-columns: ${({ ivHorizontalLayout }) => !ivHorizontalLayout && '1fr minmax(28rem, max-content)'};
  grid-template-rows: ${({ ivHorizontalLayout }) => ivHorizontalLayout && '1fr 20rem'};
  overflow: hidden;
`;

const MainContent = styled.div<{ hasRouteContent: boolean }>`
  position: relative;
  height: 100%;
  overflow-y: hidden;

  @media (max-width: 1000px) {
    grid-column: ${({ hasRouteContent }) => !hasRouteContent && '1 / -1'};
  }
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

const Sidebar = styled.div<{ backgroundColor?: string; fontFamily?: string; ivHorizontalLayout: boolean; hasContent: boolean }>`
  display: flex;
  flex-direction: ${({ ivHorizontalLayout }) => ivHorizontalLayout ? 'row' : 'column'};
  padding: 0.5rem;
  font-family: ${props => props.fontFamily ?? undefined};
  background-color: ${props => props.backgroundColor ?? '#222'};
  color: #eee;
  overflow: hidden;

  @media (max-width: 1000px) {
    display: ${({ hasContent }) => !hasContent && 'none'};
  }
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

const NoRenderWarning = styled.div`
  font-style: italic;
  color: ${({ theme }) => theme.label};
`;

const ErrorCardTitle = styled.h3`
  &&& {
    margin-top: 1rem;
  }
`;
