import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Tracker } from '../../reducers/route/types';
import { capitalize } from '../../utils/utils';
import { Stat, STATS } from '../../utils/constants';
import { Button } from '../Button';
import { resetTracker, RouteContext, setStartingLevel, setStat, triggerEvolution } from '../../reducers/route/reducer';
import { calculateAllPossibleIVRanges, calculatePossibleNature, calculatePossibleStats, StatValuePossibilitySet } from '../../utils/trackerCalculations';

interface IVTrackerProps {
  tracker: Tracker;
}

export const IVTracker: React.FC<IVTrackerProps> = ({ tracker }) => {
  const dispatch = RouteContext.useDispatch();
  const [currentLevel, setCurrentLevel] = useState(Number(Object.keys(tracker.evSegments)[0] || 5));

  const handleSetStat = useCallback((stat: Stat, value: number) => {
    dispatch(setStat(tracker.name, stat, currentLevel, value));
  }, [currentLevel, dispatch, tracker.name]);

  const handleDecreaseLevel = useCallback(() => {
    setCurrentLevel(Math.max(tracker.startingLevel, currentLevel - 1));
  }, [tracker.startingLevel, currentLevel]);

  const handleIncreaseLevel = useCallback(() => {
    setCurrentLevel(Math.min(100, currentLevel + 1));
  }, [currentLevel]);

  const handleEvolution = useCallback(() => {
    dispatch(triggerEvolution(tracker.name));
  }, [tracker.name, dispatch]);

  const handleReset = useCallback(() => {
    dispatch(resetTracker(tracker.name));
    setCurrentLevel(tracker.startingLevel);
  }, [tracker.name, tracker.startingLevel, dispatch]);

  const handleSetStartingLevel = useCallback((level: number) => {
    dispatch(setStartingLevel(tracker.name, level));
    setCurrentLevel(level);
  }, [tracker.name, dispatch]);

  const ivRanges = useMemo(() => calculateAllPossibleIVRanges(tracker), [tracker]);
  const confirmedNatures = useMemo(() => calculatePossibleNature(ivRanges), [ivRanges]);

  const possibleStatValues = useMemo(() => (
    STATS.reduce((acc, stat) => {
      const { possible, valid } = calculatePossibleStats(
        stat,
        currentLevel,
        ivRanges,
        confirmedNatures,
        tracker,
      );

      return {
        ...acc,
        [stat]: {
          possible: [...new Set(possible)],
          valid: [...new Set(valid)],
        },
      };
    }, {} as Record<Stat, StatValuePossibilitySet>)
  ), [currentLevel, ivRanges, tracker, confirmedNatures]);
  
  return (
    <Container>
      <ActionRow>
        {capitalize(tracker.name)}
        {Object.keys(tracker.evSegments).length > 1 && Object.keys(tracker.evSegments).map(level => (
          <StartingLevelButton
            key={level}
            active={tracker.startingLevel === Number(level)}
            onClick={() => handleSetStartingLevel(Number(level))}
          >
            {level}
          </StartingLevelButton>
        ))}

        <ActionButtons>
          <LevelSelector>
            <Button onClick={handleDecreaseLevel} disabled={currentLevel === tracker.startingLevel}>
              -
            </Button>
            <CurrentLevel>Lv. {currentLevel}</CurrentLevel>
            <Button onClick={handleIncreaseLevel} disabled={currentLevel === 100}>
              +
            </Button>
          </LevelSelector>
          <Button onClick={handleEvolution} disabled={tracker.evolution === tracker.baseStats.length - 1}>
            Evolve
          </Button>
          <Button onClick={handleReset}>Reset</Button>
        </ActionButtons>
      </ActionRow>
      <IVGrid>
        <IVGridHeader>
          <div>HP</div>
          <div>ATK</div>
          <div>DEF</div>
          <div>SP. ATK</div>
          <div>SP. DEF</div>
          <div>SPD</div>
        </IVGridHeader>
        {STATS.map(stat => (
          <StatSelectorGrid key={stat}>
            {possibleStatValues[stat].possible.map(value => (
              <StatSelector
                key={value}
                selected={tracker.recordedStats[tracker.evolution]?.[currentLevel]?.[stat] === value}
                disabled={possibleStatValues[stat].valid.indexOf(value) === -1}
                onClick={() => handleSetStat(stat, value)}
              >
                {value}
              </StatSelector>
            ))}
          </StatSelectorGrid>
        ))}
      </IVGrid>
    </Container>
  );
};

const Container = styled.div`
  & + & {
    margin-top: 1rem;
  }
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const LevelSelector = styled.div`
  display: flex;
  align-items: center;
  margin: 0 1rem;
`;

const CurrentLevel = styled.div`
  margin: 0 0.5rem;
`;

const IVGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-top: 0.5rem;
`;

const IVGridHeader = styled.div`
  display: contents;

  & > div {
    padding: 0.5rem;
    font-weight: 700;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const StatSelectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 1.5rem;
  padding: 0 0.5rem;
`;

const StatSelector = styled.button<{ selected?: boolean }>`
  display: flex;
  height: 1.5rem;
  justify-content: center;
  align-items: center;
  border: none;
  padding: 0;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  background: none;
  color: ${props => props.selected ? '#9eff8a' : '#fff'};
  cursor: pointer;

  &:disabled {
    opacity: 0.35;
  }
`;

const StartingLevelButton = styled(Button)<{ active?: boolean }>`
  font-size: 0.875rem;
  margin-left: 1rem;
  background-color: ${props => props.active && '#be45be'};

  &:not(:disabled):hover {
    background-color: ${props => props.active && '#be45be'};
  }
`;
