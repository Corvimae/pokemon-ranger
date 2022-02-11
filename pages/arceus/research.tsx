import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { useDropzone } from 'react-dropzone';
import { Header, HelpText, InputRow } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useDebounce, useOnMount } from '../../utils/hooks';
import { ArceusResearchContext, importSavedResearch, resetState, setSearchTerm, setTaskActive, setTaskInactive } from '../../reducers/arceus-research/reducer';

interface ResearchTask {
  name: string;
  values: number[];
  isBoosted: boolean;
}

interface ResearchEntry {
  id: number;
  name: string;
  tasks: ResearchTask[];
}

interface CalculatedResearchData {
  completeEntries: string[];
  incompleteEntries: string[];
  researchPointsFromTasks: number;
  researchPointsByTask: Record<number, number>;
}

const RESEARCH_PATH = '/reference/pla-research.json';

function calculateNextRank(totalResearchPoints: number): number | string {
  if (totalResearchPoints < 500) return 0;
  if (totalResearchPoints >= 8500) return '6 or higher';

  return [500, 1800, 3500, 6000, 8500].findIndex(value => totalResearchPoints < value);
}

function calculatePointsToNextRank(totalResearchPoints: number): number {
  if (totalResearchPoints < 500) return 500 - totalResearchPoints;
  if (totalResearchPoints >= 8500) return -1;

  const nextRankRequirement = [500, 1800, 3500, 6000, 8500].find(value => totalResearchPoints < value) ?? totalResearchPoints - 1;

  return nextRankRequirement - totalResearchPoints;
}

interface TaskValueProps {
  speciesId: number;
  taskName: string;
  value: number;
  activeValue: number;
}

const TaskValue: React.FC<TaskValueProps> = ({ activeValue, speciesId, taskName, value }) => {
  const dispatch = ArceusResearchContext.useDispatch();

  const handleToggleActiveTask = useCallback(() => {
    if (activeValue === value) {
      dispatch(setTaskInactive(speciesId, taskName, value));
    } else {
      dispatch(setTaskActive(speciesId, taskName, value));
    }
  }, [activeValue, dispatch, speciesId, taskName, value]);
  
  return (
    <TaskValueContainer active={activeValue >= value} onClick={handleToggleActiveTask}>
      {value}
    </TaskValueContainer>
  );
};

const ResearchCalculator: NextPage = () => {
  const state = ArceusResearchContext.useState();
  const dispatch = ArceusResearchContext.useDispatch();

  const [researchData, setResearchData] = useState<ResearchEntry[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSearchTermChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  }, [dispatch]);

  const debouncedHandleSearchTermChange = useDebounce(handleSearchTermChange, 250);

  const handleReset = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const handleExport = useCallback(() => {
    const a = document.createElement('a');

    a.href = URL.createObjectURL(new Blob([JSON.stringify({
      activeTasks: { ...state.activeTasks },
      searchTerm: state.searchTerm,
    }, null, 2)], {
      type: 'text/plain',
    }));

    a.setAttribute('download', 'pla-research.json');

    document.body.appendChild(a);
    
    a.click();

    document.body.removeChild(a);
  }, [state]);

  const handleImport = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      setImportError('Only one research file may be selected at a time.');

      return;
    }

    if (acceptedFiles.length === 0) {
      setImportError('An unknown issue occurred trying to load the file.');

      return;
    }

    const [acceptedFile] = acceptedFiles;

    if (!acceptedFile.name.endsWith('.json')) {
      setImportError('Research files must end in .json');

      return;
    }

    const reader = new FileReader();

    reader.onabort = () => {
      setImportError('The file read process was aborted.');
    };

    reader.onerror = () => {
      setImportError('An unknown issue occurred trying to load the file. The file may be corrupted.');
    };

    reader.onload = () => {
      try {
        const importedJSON = JSON.parse(reader.result?.toString() ?? '');

        dispatch(importSavedResearch(importedJSON));
        setImportError(null);
      } catch (error) {
        setImportError(`The experience route could not be read: ${error}.`);
      }
    };

    reader.readAsBinaryString(acceptedFile);
  }, [dispatch]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleImport,
    noClick: true,
    multiple: false,
  });

  const filteredResearchData = useMemo(() => {
    if (!state.searchTerm) return researchData;

    let normalizedSearchTerm = state.searchTerm.toLowerCase().trim();

    if (normalizedSearchTerm.startsWith('task:')) {
      normalizedSearchTerm = normalizedSearchTerm.replace('task:', '').trim();

      return researchData.reduce<ResearchEntry[]>((acc, entry) => {
        const filteredTasks = entry.tasks.filter(task => task.name.toLowerCase().indexOf(normalizedSearchTerm) !== -1);

        if (filteredTasks.length > 0) {
          return [
            ...acc,
            {
              ...entry,
              tasks: filteredTasks,
            },
          ];
        }

        return acc;
      }, []);
    }

    return researchData.reduce<ResearchEntry[]>((acc, entry) => {
      const normalizedName = entry.name.toLowerCase();

      if (normalizedName.indexOf(normalizedSearchTerm) !== -1 || normalizedSearchTerm.indexOf(normalizedName) !== -1) {
        return [...acc, entry];
      }

      return acc;
    }, []);
  }, [researchData, state.searchTerm]);

  const { completeEntries, incompleteEntries, researchPointsFromTasks, researchPointsByTask } = useMemo(() => (
    Object.entries(state.activeTasks).reduce<CalculatedResearchData>((acc, [speciesId, tasks]) => {
      const speciesDefinition = researchData.find(({ id }) => id === Number(speciesId));

      if (!speciesDefinition) return acc;

      const completionPoints = Object.entries(tasks).reduce((total, [taskName, taskValue]) => {
        const taskDefinition = speciesDefinition.tasks.find(({ name }) => name === taskName);

        if (!taskDefinition) return total;

        const completedSegments = taskDefinition.values.filter(item => item <= taskValue).length;

        return total + completedSegments * (taskDefinition.isBoosted ? 2 : 1);
      }, 0);
      
      const isComplete = completionPoints >= 10;
      const rankPoints = completionPoints * 10;

      return {
        completeEntries: isComplete ? [...acc.completeEntries, speciesDefinition.name] : acc.completeEntries,
        incompleteEntries: !isComplete && completionPoints > 0 ? [...acc.incompleteEntries, speciesDefinition.name] : acc.incompleteEntries,
        researchPointsFromTasks: acc.researchPointsFromTasks + rankPoints,
        researchPointsByTask: {
          ...acc.researchPointsByTask,
          [speciesId]: rankPoints + (isComplete ? 100 : 0),
        },
      };
    }, { completeEntries: [], incompleteEntries: [], researchPointsFromTasks: 0, researchPointsByTask: {} })
  ), [researchData, state.activeTasks]);

  const totalResearchPoints = researchPointsFromTasks + completeEntries.length * 100;
  const nextRank = calculateNextRank(totalResearchPoints);
  const pointsToNextRank = calculatePointsToNextRank(totalResearchPoints);

  useOnMount(() => {
    fetch(RESEARCH_PATH).then(response => {
      response.json().then(setResearchData);
    });
  });

  return (
    <Container {...getRootProps()} tabIndex={-1}>
      <input {...getInputProps()} />
      
      <div>
        <Header>
          Legends: Arceus Research Calculator

          <div>
            <Button onClick={handleExport}>Export</Button>
          </div>
        </Header>
        {importError && <ImportError>{importError}</ImportError>}
        <TotalPoints>{totalResearchPoints} total research points.</TotalPoints>
        <RankData>
          Rank {nextRank}. Points to next rank: {pointsToNextRank === -1 ? '-' : pointsToNextRank}.
        </RankData>
        <p>
          Completed {completeEntries.length} {completeEntries.length === 1 ? 'entry' : 'entries'}
          {completeEntries.length > 0 ? `: ${completeEntries.join(', ')}` : ''}.
        </p>
        <p>
          Partially completed {incompleteEntries.length} {incompleteEntries.length === 1 ? 'entry' : 'entries'}
          {incompleteEntries.length > 0 ? `: ${incompleteEntries.join(', ')}` : ''}.
        </p>
        <ResultsHelpText>
          Drag an exported research file anywhere onto this page to import it.
        </ResultsHelpText>
        <ResultsHelpText>
          Tip: Start your search with <code>task:</code> to filter by task instead of Pokémon name.
          (For example, <code>task: food</code>).
        </ResultsHelpText>
        <ResultsHelpText>
          Tip: You can filter to multiple Pokémon by providing all of their names in the search box.
        </ResultsHelpText>
      </div>
      <div>
        <ActionRow>
          <input
            defaultValue={state.searchTerm}
            onChange={debouncedHandleSearchTermChange}
            placeholder="Filter..."
            autoComplete="off"
          />
          <Button onClick={handleReset}>Reset</Button>
        </ActionRow>
        <TaskGrid>
          {filteredResearchData.map(data => (
            <TaskSection key={data.id}>
              <SectionName>
                {data.name} ({researchPointsByTask[data.id] ?? 0})
                {completeEntries.indexOf(data.name) !== -1 && <CompletedImage />}
              </SectionName>
              {data.tasks.map((task, index) => (
                <TaskRow key={task.name || index}>
                  {task.isBoosted ? <BoostedImage /> : <div />}
                  <TaskName>{task.name}</TaskName>
                  <TaskValueSpacer columns={5 - task.values.length} />
                  {task.values.map(value => (
                    <TaskValue
                      key={`${task.name}_${value}`}
                      speciesId={data.id}
                      taskName={task.name}
                      value={value}
                      activeValue={state.activeTasks[data.id]?.[task.name] ?? 0}
                    />
                  ))}
                </TaskRow>
              ))}
            </TaskSection>
          ))}
        </TaskGrid>
      </div>
    </Container>
  );
};

export default ArceusResearchContext.connect(ResearchCalculator);

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: 24rem 1fr;
  overflow-x: hidden;

  & > div {
    position: relative;
    height: 100%;
    overflow-y: auto;
    padding: 1rem;
  }
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5rem 1fr repeat(5, 4rem);

  & > div > div {
    padding: 0.25rem 0.5rem;
  }
`;

const TaskSection = styled.div`
  display: contents;

  & + & > div {
    margin-top: 0.5rem;
  }
`;

const TaskRow = styled.div`
  display: contents;

  & > div {
    height: 1.5rem;
  }

  & + & > div {
    margin-top: 0.25rem;
  }
`;

const TaskName = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0.5rem;
`;

const TaskValueSpacer = styled.div<{ columns: number }>`
  display: ${({ columns }) => columns > 1 ? undefined : 'none'};
  grid-column: span ${({ columns }) => columns};  
`;

const TaskValueContainer = styled.div<{ active: boolean }>`
  display: flex;
  border-radius: 0.75rem;
  background-color: ${({ active, theme }) => active ? theme.research.task.background.active : theme.research.task.background.inactive};
  color: ${({ active, theme }) => active ? theme.research.task.foreground.active : theme.research.task.foreground.inactive};
  justify-content: center;
  align-items: center;
  margin-left: 0.5rem;
  cursor: pointer;
`;

const BoostedImage = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background-image: url("/images/research-boosted.png");
  background-size: cover;
`;

const CompletedImage = styled.div`
  width: 1rem;
  height: 1rem;
  margin-left: 0.25rem;
  background-image: url("/images/research-complete.png");
  background-size: cover;
`;

const SectionName = styled.div`
  display: flex;
  grid-column: 1 / -1;
  font-weight: 700;
  flex-direction: row;
  align-items: center;

  &&& {
    padding-left: 0;
  }
`;

const TotalPoints = styled.div`
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-size: 1.125rem;
`;

const RankData = styled.div`
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const ActionRow = styled(InputRow)`
  display: flex;

  & > input {
    margin: 0 0.5rem 0 0;
    flex-grow: 1;
    min-width: 0;
    align-self: stretch;
  }
`;

const ResultsHelpText = styled(HelpText)`
  margin-top: 1rem;
`;

const ImportError = styled.div`
  color: ${({ theme }) => theme.error};
  font-weight: 700;
  margin-top: 1rem;
`;
