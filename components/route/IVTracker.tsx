import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { calculateAllPossibleStatValues, capitalize, Nature, NATURES, Stat, STATS, StatValuePossibilitySet } from 'relicalc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Tracker } from '../../reducers/route/types';
import { Button } from '../Button';
import { resetTracker, RouteContext, setManualPositiveNature, setStartingLevel, setStat, setManualNegativeNature, triggerEvolution, setManualNeutralNature, setManualNature, setCurrentLevel } from '../../reducers/route/reducer';
import { useCalculationSet } from '../../utils/trackerCalculations';
import { IVDirectInput } from './IVDirectInput';
import { IVGrid, IVGridHeader } from './IVGrid';

const RESET_CONFIRM_DURATION = 2000;

interface IVTrackerProps {
  tracker: Tracker;
}

export const IVTracker: React.FC<IVTrackerProps> = ({ tracker }) => {
  const dispatch = RouteContext.useDispatch();
  const [resetConfirmActive, setResetConfirmActive] = useState(false);

  const handleSetStat = useCallback((stat: Stat, value: number) => {
    dispatch(setStat(tracker.name, stat, tracker.currentLevel, value));
  }, [tracker.currentLevel, dispatch, tracker.name]);

  const handleDecreaseLevel = useCallback(() => {
    dispatch(setCurrentLevel(tracker.name, Math.max(tracker.startingLevel, tracker.currentLevel - 1)));
  }, [tracker.startingLevel, dispatch, tracker.currentLevel, tracker.name]);

  const handleIncreaseLevel = useCallback(() => {
    dispatch(setCurrentLevel(tracker.name, Math.min(100, tracker.currentLevel + 1)));
  }, [tracker.currentLevel, dispatch, tracker.name]);

  const handleEvolution = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.shiftKey) {
      if (tracker.evolution > 0) dispatch(triggerEvolution(tracker.name, true));
    } else if (tracker.evolution < tracker.baseStats.length - 1) {
      dispatch(triggerEvolution(tracker.name, false));
    }
  }, [tracker.name, tracker.evolution, tracker.baseStats, dispatch]);

  const handleReset = useCallback(() => {
    if (resetConfirmActive) {
      dispatch(resetTracker(tracker.name));
      setResetConfirmActive(false);
    } else {
      setResetConfirmActive(true);

      setTimeout(() => {
        setResetConfirmActive(false);
      }, RESET_CONFIRM_DURATION);
    }
  }, [tracker.name, resetConfirmActive, dispatch]);

  const handleSetStartingLevel = useCallback((level: number) => {
    dispatch(setStartingLevel(tracker.name, level));
  }, [tracker.name, dispatch]);

  const handleSetManualNature = useCallback((event: React.MouseEvent<HTMLButtonElement>, stat: Stat) => {
    if (event.altKey) {
      dispatch(setManualNeutralNature(tracker.name, tracker.manualNegativeNature === stat && tracker.manualPositiveNature === stat ? undefined : stat));
    } else if (event.shiftKey) {
      dispatch(setManualNegativeNature(tracker.name, tracker.manualNegativeNature === stat ? undefined : stat));
    } else {
      dispatch(setManualPositiveNature(tracker.name, tracker.manualPositiveNature === stat ? undefined : stat));
    }
  }, [tracker.name, tracker.manualNegativeNature, tracker.manualPositiveNature, dispatch]);

  const handleNatureButtonClick = useCallback((nature: Nature) => {
    dispatch(setManualNature(tracker.name, NATURES[nature].plus, NATURES[nature].minus));
  }, [tracker.name, dispatch]);

  const calculationSet = useCalculationSet(tracker.name);

  const possibleStatValues = useMemo(() => {
    if (!calculationSet) return {} as Record<Stat, StatValuePossibilitySet>;

    return STATS.reduce((acc, stat) => {
      console.log(stat, calculationSet.ivRanges[stat]);
      const { possible, valid } = calculateAllPossibleStatValues(
        stat,
        tracker.currentLevel,
        calculationSet.ivRanges[stat],
        calculationSet.confirmedNature,
        tracker.baseStats[tracker.evolution][stat],
        tracker.evSegments[tracker.startingLevel][tracker.currentLevel][stat],
        tracker.generation,
      );

      return {
        ...acc,
        [stat]: {
          possible: Array.from(new Set(possible)),
          valid: Array.from(new Set(valid)),
        },
      };
    }, {} as Record<Stat, StatValuePossibilitySet>);
  }, [calculationSet, tracker]);
  
  if (tracker.directInput) {
    return (
      <IVDirectInput
        tracker={tracker}
        confirmedNatures={calculationSet?.confirmedNature ?? [null, null]}
        onNatureButtonClick={handleNatureButtonClick}
        onSetManualNature={handleSetManualNature}
        onReset={handleReset}
        resetConfirmActive={resetConfirmActive}
      />
    );
  }

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
            <Button onClick={handleDecreaseLevel} disabled={tracker.currentLevel === tracker.startingLevel}>
              <FontAwesomeIcon icon={faMinus} size="sm" />
            </Button>
            <CurrentLevel>Lv. {tracker.currentLevel}</CurrentLevel>
            <Button onClick={handleIncreaseLevel} disabled={tracker.currentLevel === 100}>
              <FontAwesomeIcon icon={faPlus} size="sm" />
            </Button>
          </LevelSelector>
          <EvolveButton onClick={handleEvolution} displayAsDisabled={tracker.evolution === tracker.baseStats.length - 1}>
            Evolve
          </EvolveButton>
          <Button onClick={handleReset}>{resetConfirmActive ? 'Are you sure?' : 'Reset'}</Button>
        </ActionButtons>
      </ActionRow>
      <IVGrid generation={tracker.generation}>
        <IVGridHeader tracker={tracker} onSetManualNature={handleSetManualNature} />
        {STATS.filter(stat => tracker.generation > 2 || stat !== 'spDefense').map(stat => (
          <StatSelectorGrid key={stat}>
            {possibleStatValues[stat].possible.map(value => (
              <StatSelector
                key={value}
                selected={tracker.recordedStats[tracker.evolution]?.[tracker.currentLevel]?.[stat] === value}
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

const EvolveButton = styled(Button)<{ displayAsDisabled: boolean }>`
  opacity: ${props => props.displayAsDisabled ? 0.5 : 1};
`;
