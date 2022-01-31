import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { Header } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useOnMount } from '../../utils/hooks';
import { ArceusResearchContext, resetState, setTaskActive, setTaskInactive } from '../../reducers/arceus-research/reducer';

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

  const { completedEntries, researchPointsFromTasks } = useMemo(() => (
    Object.entries(state.activeTasks).reduce<{ completedEntries: string[], researchPointsFromTasks: number }>((acc, [speciesId, tasks]) => {
      const speciesDefinition = researchData.find(({ id }) => id === Number(speciesId));

      if (!speciesDefinition) return acc;

      const completionPoints = Object.entries(tasks).reduce((total, [taskName, taskValue]) => {
        const taskDefinition = speciesDefinition.tasks.find(({ name }) => name === taskName);

        if (!taskDefinition) return total;

        const completedSegments = taskDefinition.values.filter(item => item <= taskValue).length;

        return total + completedSegments * (taskDefinition.isBoosted ? 2 : 1);
      }, 0);
      
      return {
        completedEntries: completionPoints >= 10 ? [...acc.completedEntries, speciesDefinition.name] : acc.completedEntries,
        researchPointsFromTasks: acc.researchPointsFromTasks + completionPoints * 10,
      };
    }, { completedEntries: [], researchPointsFromTasks: 0 })
  ), [researchData, state.activeTasks]);

  const totalResearchPoints = researchPointsFromTasks + completedEntries.length * 100;
  const nextRank = calculateNextRank(totalResearchPoints);
  const pointsToNextRank = calculatePointsToNextRank(totalResearchPoints);

  const handleReset = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  useOnMount(() => {
    fetch(RESEARCH_PATH).then(response => {
      response.json().then(setResearchData);
    });
  });

  return (
    <Container>
      <div>
        <Header>
          Legends: Arceus Research Calculator

          <div>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        </Header>
        <TotalPoints>{totalResearchPoints} total research points.</TotalPoints>
        <RankData>
          Rank {nextRank}. Points to next rank: {pointsToNextRank === -1 ? '-' : pointsToNextRank}.
        </RankData>
        <div>
          Completed {completedEntries.length} {completedEntries.length === 1 ? 'entry' : 'entries'}
          {completedEntries.length > 0 ? `: ${completedEntries.join(', ')}` : ''}.
        </div>
      </div>
      <div>
        <TaskGrid>
          {researchData.map(data => (
            <TaskSection key={data.id}>
              <SectionName>{data.name}</SectionName>
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
  grid-template-columns: 1fr max-content;
  
  & > div {
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
  /** todo light mode */
  background-color: ${({ active }) => active ? '#FCE3CF' : 'rgba(255, 255, 255, 0.25)'};
  color: ${({ active }) => active ? '#333' : undefined};
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

const SectionName = styled.div`
  grid-column: 1 / -1;
  font-weight: 700;

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
  font-size: 1rem;
`;
