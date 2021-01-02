import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
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

const schema = merge(gh, {
  tagNames: [
    'calculator',
    'if',
    'damage',
    'level',
  ],
  attributes: {
    calculator: ['species', 'contents', 'baseStats'],
    if: ['stat', 'condition', 'level', 'evolution', 'source'],
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
      calculator: IVCalculatorDirective,
      if: ConditionalBlock,
      damage: DamageTable,
    } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
  });

const RouteView: NextPage = () => {
  const dispatch = RouteContext.useDispatch();
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileSelectError, setFileSelectError] = useState<string | null>(null);

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
      return {
        error: true,
        message: 'The route file is not valid.',
      };
    }
  }, [fileContent]);
  const state = RouteContext.useState();

  return (
    <Container {...getRootProps()}>
      <input {...getInputProps()} />
      <Guide>
        {content && !content?.error ? content.content : (
          <UploadMessage>
            Drag a .mdr or .md file onto this page to start.

            {(content?.error || fileSelectError) && (
              <ErrorMessage>
                {content?.message || fileSelectError}
              </ErrorMessage>
            )}
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
