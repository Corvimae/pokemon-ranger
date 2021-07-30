import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Tracker } from '../../reducers/route/types';
import { capitalize } from '../../utils/utils';
import { Stat, STATS } from '../../utils/constants';
import { Button } from '../Button';
import { resetTracker, RouteContext, setManualPositiveNature, setStartingLevel, setStat, setManualNegativeNature, triggerEvolution, setManualNeutralNature } from '../../reducers/route/reducer';
import { calculateAllPossibleIVRanges, calculatePossibleNature, calculatePossibleStats, StatValuePossibilitySet } from '../../utils/trackerCalculations';
import { ConfirmedNature, Generation } from '../../utils/rangeTypes';

const RESET_CONFIRM_DURATION = 2000;

interface IVTrackerProps {
  tracker: Tracker;
}

export const IVTracker: React.FC<IVTrackerProps> = ({ tracker }) => {
  const dispatch = RouteContext.useDispatch();
  const [currentLevel, setCurrentLevel] = useState(Number(Object.keys(tracker.evSegments)[0] || 5));
  const [resetConfirmActive, setResetConfirmActive] = useState(false);

  const handleSetStat = useCallback((stat: Stat, value: number) => {
    dispatch(setStat(tracker.name, stat, currentLevel, value));
  }, [currentLevel, dispatch, tracker.name]);

  const handleDecreaseLevel = useCallback(() => {
    setCurrentLevel(Math.max(tracker.startingLevel, currentLevel - 1));
  }, [tracker.startingLevel, currentLevel]);

  const handleIncreaseLevel = useCallback(() => {
    setCurrentLevel(Math.min(100, currentLevel + 1));
  }, [currentLevel]);

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
      setCurrentLevel(tracker.startingLevel);
      setResetConfirmActive(false);
    } else {
      setResetConfirmActive(true);

      setTimeout(() => {
        setResetConfirmActive(false);
      }, RESET_CONFIRM_DURATION);
    }
  }, [tracker.name, tracker.startingLevel, resetConfirmActive, dispatch]);

  const handleSetStartingLevel = useCallback((level: number) => {
    dispatch(setStartingLevel(tracker.name, level));
    setCurrentLevel(level);
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

  const ivRanges = useMemo(() => calculateAllPossibleIVRanges(tracker), [tracker]);
  const confirmedNatures = useMemo(() => {
    if (tracker.generation <= 2) return ['attack', 'attack'] as ConfirmedNature;

    return calculatePossibleNature(ivRanges, tracker);
  }, [tracker, ivRanges]);

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
              <FontAwesomeIcon icon={faMinus} size="sm" />
            </Button>
            <CurrentLevel>Lv. {currentLevel}</CurrentLevel>
            <Button onClick={handleIncreaseLevel} disabled={currentLevel === 100}>
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
        <IVGridHeaderCell uninteractable>
          HP
        </IVGridHeaderCell>
        <IVGridHeaderCell
          isPositive={tracker.manualPositiveNature === 'attack'}
          isNegative={tracker.manualNegativeNature === 'attack'}
          onClick={event => handleSetManualNature(event, 'attack')}
        >
          ATK
        </IVGridHeaderCell>
        <IVGridHeaderCell
          isPositive={tracker.manualPositiveNature === 'defense'}
          isNegative={tracker.manualNegativeNature === 'defense'}
          onClick={event => handleSetManualNature(event, 'defense')}
        >
          DEF
        </IVGridHeaderCell>
        <IVGridHeaderCell
          isPositive={tracker.manualPositiveNature === 'spAttack'}
          isNegative={tracker.manualNegativeNature === 'spAttack'}
          onClick={event => handleSetManualNature(event, 'spAttack')}
        >
          {tracker.generation > 2 ? 'SP. ATK' : 'SPEC'}
        </IVGridHeaderCell>
        {tracker.generation > 2 && (
          <IVGridHeaderCell
            isPositive={tracker.manualPositiveNature === 'spDefense'}
            isNegative={tracker.manualNegativeNature === 'spDefense'}
            onClick={event => handleSetManualNature(event, 'spDefense')}
          >
            SP. DEF
          </IVGridHeaderCell>
        )}
        <IVGridHeaderCell
          isPositive={tracker.manualPositiveNature === 'speed'}
          isNegative={tracker.manualNegativeNature === 'speed'}
          onClick={event => handleSetManualNature(event, 'speed')}
        >
          SPE
        </IVGridHeaderCell>
        {STATS.filter(stat => tracker.generation > 2 || stat !== 'spDefense').map(stat => (
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

const IVGrid = styled.div<{ generation: Generation }>`
  display: grid;
  grid-template-columns: repeat(${({ generation }) => generation > 2 ? 6 : 5}, 1fr);
  margin-top: 0.5rem;
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

const IVGridHeaderCell = styled.button<{ uninteractable?: boolean; isPositive?: boolean; isNegative?: boolean }>`
  color: ${props => {
    if (props.isPositive && props.isNegative) return '#fff';
    if (props.isPositive) return '#ff7f7f';
    if (props.isNegative) return '#a1a1ff';

    return '#fff';
  }};
  border: none;
  padding: 0.5rem;
  font-weight: 700;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;

  &:not(:disabled):hover,
  &:not(:disabled):active {
    background-color: ${props => !props.uninteractable && 'rgba(255, 255, 255, 0.2)'};
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const EvolveButton = styled(Button)<{ displayAsDisabled: boolean }>`
  opacity: ${props => props.displayAsDisabled ? 0.5 : 1};
`;
