import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import merge from 'deepmerge';
import { useDropzone } from 'react-dropzone';
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
import { ContainerLabel, InputRow } from '../../components/Layout';
import { Button } from '../../components/Button';
import { RouteCard } from '../../components/route/RouteCard';
import { InlineInfo } from '../../components/route/InlineInfo';
import { TrainerBlock } from '../../components/route/TrainerBlock';
import { PokemonBlock } from '../../components/route/PokemonBlock';

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
  const [fileSelectError, setFileSelectError] = useState<string | null>(null);

  const [repoImportPath, setRepoImportPath] = useState<string>(repo || '');

  const handleSetRepoImportPath = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRepoImportPath(event.target.value);
  }, []);

  const handleCloseRoute = useCallback(() => {
    dispatch(loadFile());

    setFileContent(null);
    setFileSelectError(null);
    
    router.push(
      {
        pathname: router.pathname,
        query: {},
      },
      undefined,
      { shallow: true },
    );
  }, [dispatch, router]);

  const handleImportFromRepo = useCallback(() => {
    dispatch(loadFile());

    fetch(`https://raw.githubusercontent.com/${repoImportPath}/main/route.mdr`)
      .then(async response => {
        if (response.status === 200) {
          setFileContent(await response.text());
          setFileSelectError(null);
     
          router.push(
            {
              pathname: router.pathname,
              query: {
                repo: encodeURIComponent(repoImportPath),
              },
            },
            undefined,
            { shallow: true },
          );
        } else {
          setFileContent(null);
          setFileSelectError(`Unable to load route file: ${response.statusText}`);
        }
      });
  }, [repoImportPath, dispatch, router]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      setFileContent(null);
      setFileSelectError('Only one route file may be selected at a time.');

      return;
    }

    if (acceptedFiles.length === 0) {
      setFileContent(null);
      setFileSelectError('An unknown issue occurred trying to load the file.');

      return;
    }

    const [acceptedFile] = acceptedFiles;

    if (!acceptedFile.name.endsWith('.md') && !acceptedFile.name.endsWith('.mdr')) {
      setFileContent(null);
      setFileSelectError('Route files must end in .md or .mdr');

      return;
    }

    dispatch(loadFile());
    setFileContent(null);

    const reader = new FileReader();

    reader.onabort = () => {
      setFileContent(null);
      setFileSelectError('The file read process was aborted.');
    };

    reader.onerror = () => {
      setFileContent(null);
      setFileSelectError('An unknown issue occurred trying to load the file. The file may be corrupted.');
    };

    reader.onload = () => {
      setFileContent(reader.result?.toString() ?? null);
      setFileSelectError(null);
    };

    reader.readAsBinaryString(acceptedFile);
  }, [dispatch]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, noClick: true });

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

  useEffect(() => {
    if (!hasAttemptedQueryParamLoad.current) {
      if (repo) {
        handleImportFromRepo();
      }

      hasAttemptedQueryParamLoad.current = true;
    }
  }, [repo, handleImportFromRepo]);

  return (
    <Container {...getRootProps()}>
      <input {...getInputProps()} />
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
          <UploadMessage>
            Drag a .mdr or .md file onto this page to start.

            {(content?.error || fileSelectError) && (
              <ErrorMessage>
                {content?.message || fileSelectError}
              </ErrorMessage>
            )}

            <OrDivider>or</OrDivider>
            
            <RepoSourceContainer>
              Load from a repo
              <RepoInputContainer>
                <input type="text" value={repoImportPath} onChange={handleSetRepoImportPath} />
                <Button onClick={handleImportFromRepo}>Load</Button>
              </RepoInputContainer>
            </RepoSourceContainer>
          </UploadMessage>
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

const UploadMessage = styled.div`
  position: absolute;
  width: 100%;
  top: 50%;
  left: 50%;
  padding: 0 8rem;
  text-align: center;
  font-size: 1.25rem;
  color: #666;
  font-weight: 700;
  transform: translate(-50%, -50%);
`;

const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  color: #900;
  font-size: 1.125rem;
`;

const OrDivider = styled.div`
  position: relative;
  margin: 0.5rem 0;

  &:before {
    content: '';
    position: absolute;
    top: 0.825rem;
    left: 25%;
    width: 20%;
    border-top: 1px solid #999;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0.825rem;
    width: 20%;
    left: 55%;
    border-top: 1px solid #999;
  }
`;

const RepoSourceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RepoInputContainer = styled(InputRow)`
  && {
    display: flex;
    margin-top: 1rem;
    justify-content: center;
  }

  & ${Button} {
    margin-left: 1rem;
  }

  & > input {
    margin-bottom: 0;
  }
`;

const RouteContent = styled.div`
  & > div {
    overflow-x: hidden;
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
