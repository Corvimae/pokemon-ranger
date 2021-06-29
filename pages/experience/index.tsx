import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Tooltip } from 'react-tippy';
import { Header, InputSection, InputRow, InputSubheader, Checkbox, HelpText } from '../../components/Layout';
import { Button } from '../../components/Button';
import { addManualExperienceEvent, addRareCandyExperienceEvent, addSpeciesExperienceEvent, removeExperienceEvent, reorderExperienceEvents, resetState, setGrowthRate, setInitialLevel, useExperienceReducer } from '../../reducers/experience/reducer';
import { buildExperienceRoute, ExperienceEventWithMetadata, GrowthRate } from '../../utils/calculations';

const GROWTH_RATE_NAMES: Record<GrowthRate, string> = {
  slow: 'Slow',
  'medium-slow': 'Medium-Slow',
  'medium-fast': 'Medium-Fast',
  fast: 'Fast',
  erratic: 'Erratic',
  fluctuating: 'Fluctuating',
};

interface PokemonSpeciesData {
  name: string;
  url: string;
}

interface ExperienceEventRowProps {
  event: ExperienceEventWithMetadata;
  onRemove: () => void;
  innerRef: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  draggableProps: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  dragHandleProps: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const ExperienceEventRow: React.FC<ExperienceEventRowProps> = ({ innerRef, event, draggableProps, dragHandleProps, onRemove }) => (
  <>
    <ExperienceEventContainer ref={innerRef} {...draggableProps}>
      <div {...dragHandleProps}>
        <FontAwesomeIcon icon={faBars} color="#CCC" />
      </div>
      <ExperienceEventText>
        {event.type === 'rareCandy' ? '(Rare Candy)' : event.name}
        <ExperienceGained>(+{event.experienceGained})</ExperienceGained>
        {event.type === 'species' && (
          <>
            {(event.expShareEnabled || event.otherPokemonHoldingExperienceShare > 0) && (
              <Tooltip
                html={(
                  <div>
                    {event.expShareEnabled ? <div>Affected by Exp. Share</div> : null}
                    {event.otherPokemonHoldingExperienceShare ? <div>{event.otherPokemonHoldingExperienceShare} other party members have an Exp. Share</div> : null}
                  </div>
                )}
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon src="images/exp-share.png" />
              </Tooltip>
            )}
            {event.hasLuckyEgg && (
              <Tooltip
                title="Affected by Lucky Egg"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon src="images/lucky-egg.png" />
              </Tooltip>
            )}
            {event.hasAffectionBoost && (
              <Tooltip
                title="Affected by Affection Exp. boost (>= 2)"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon src="images/affection-heart.png" />
              </Tooltip>
            )}
            {event.isTrade && (
              <Tooltip
                title="Affected by domestic trade Exp. boost"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon src="images/trade-icon.png" />
              </Tooltip>
            )}
            {event.isInternationalTrade && (
              <Tooltip
                title="Affected by international trade Exp. boost"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon src="images/trade-icon.png" />
              </Tooltip>
            )}
            {!event.isWild && (
              <Tooltip
                title="Opponent is owned by a trainer"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon src="images/pokeball.png" />
              </Tooltip>
            )}
            {event.isInternationalTrade && (
              <Tooltip
                title="Affected by international trade Exp. boost"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon src="images/trade-icon.png" />
              </Tooltip>
            )}

          </>
        )}
      </ExperienceEventText>
      <Button theme="error" onClick={onRemove}>&times;</Button>
    </ExperienceEventContainer>
    {event.isLevelUp && (
      <LevelUpRow>Level up! ({event.levelAfterExperience}) </LevelUpRow>
    )}
  </>
);

const ExperienceRoute: NextPage = () => {
  const [state, dispatch] = useExperienceReducer();
  const [generation, setGeneration] = useState(4);
  const [manualNameValue, setManualNameValue] = useState('');
  const [manualRewardValue, setManualRewardValue] = useState(0);
  const [speciesLevelValue, setSpeciesLevelValue] = useState(5);
  const [expShareEnabledValue, setExpShareEnabledValue] = useState(false);
  const [didParticipateValue, setDidParticipateValue] = useState(true);
  const [otherParticipantCountValue, setOtherParticipantCountValue] = useState(0);
  const [otherPokemonHoldingExperienceShareValue, setOtherPokemonHoldingExperienceShareValue] = useState(0);
  const [partySizeValue, setPartySizeValue] = useState(1);
  const [tradeExperienceType, setTradeExperienceType] = useState('owner');
  const [hasLuckyEggValue, setHasLuckyEggValue] = useState(false);
  const [hasAffectionBoostValue, setHasAffectionBoostValue] = useState(false);
  const [isWildValue, setIsWildValue] = useState(false);
  const [isPastEvolutionPointValue, setIsPastEvolutionPointValue] = useState(false);

  const [selectedSpeciesDataURL, setSelectedSpeciesDataURL] = useState<string | null>(null);

  const [pokemonSpeciesList, setPokemonSpeciesList] = useState<PokemonSpeciesData[]>([]);

  const handleSetGeneration = useCallback(event => {
    setGeneration(event.target.value === 'lgpe' ? event.target.value : Number(event.target.value));
  }, []);

  const handleSetSpeciesLevelValue = useCallback(event => {
    setSpeciesLevelValue(Number(event.target.value));
  }, []);
  
  const handleSetSelectedSpeciesDataURL = useCallback(event => {
    setSelectedSpeciesDataURL(event.target.value);
  }, []);

  const handleResetValues = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  const handleSetInitialLevel = useCallback(event => {
    dispatch(setInitialLevel(Number(event.target.value)));
  }, [dispatch]);

  const handleSetGrowthRate = useCallback(event => {
    dispatch(setGrowthRate(event.target.value as GrowthRate));
  }, [dispatch]);

  const handleAddManualExperienceEvent = useCallback(() => {
    dispatch(addManualExperienceEvent(manualNameValue, manualRewardValue));
  }, [dispatch, manualNameValue, manualRewardValue]);

  const handleAddRareCandyExperienceEvent = useCallback(() => {
    dispatch(addRareCandyExperienceEvent());
  }, [dispatch]);

  const handleAddSpeciesExperienceEvent = useCallback(async () => {
    if (!selectedSpeciesDataURL) return;

    const speciesDataRequest = await fetch(selectedSpeciesDataURL);
    const speciesData = await speciesDataRequest.json();

    dispatch(addSpeciesExperienceEvent(
      speciesData.name,
      speciesData.base_experience,
      speciesLevelValue,
      expShareEnabledValue,
      didParticipateValue,
      otherParticipantCountValue,
      otherPokemonHoldingExperienceShareValue,
      partySizeValue,
      tradeExperienceType === 'domestic',
      tradeExperienceType === 'international',
      hasLuckyEggValue,
      hasAffectionBoostValue,
      isWildValue,
      isPastEvolutionPointValue,
    ));
  }, [dispatch, speciesLevelValue, selectedSpeciesDataURL, expShareEnabledValue, didParticipateValue, otherParticipantCountValue, otherPokemonHoldingExperienceShareValue, partySizeValue, tradeExperienceType, hasLuckyEggValue, hasAffectionBoostValue, isWildValue, isPastEvolutionPointValue]);

  const handleRemoveExperienceEvent = useCallback(id => {
    dispatch(removeExperienceEvent(id));
  }, [dispatch]);

  const handleDragEnd = useCallback(dragEvent => {
    if (!dragEvent.destination) return;

    const updatedList = [...state.experienceEvents];
    const [removed] = updatedList.splice(dragEvent.source.index, 1);

    updatedList.splice(dragEvent.destination.index, 0, removed);

    dispatch(reorderExperienceEvents(updatedList));
  }, [state.experienceEvents, dispatch]);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
      const { results } = await response.json();

      setPokemonSpeciesList(results);
      setSelectedSpeciesDataURL(results[0]?.url);
    };

    fetchData();
  }, []);

  const experienceRoute = useMemo(() => (
    buildExperienceRoute(generation, state.initialLevel, state.growthRate, state.experienceEvents)
  ), [state, generation]);

  return (
    <Container>
      <LeftColumn>
        <Header>
          Experience Route Builder
          <div>
            <Button onClick={handleResetValues}>Reset</Button>
          </div>
        </Header>
        <Disclaimer>
          This tool is a work in progress and may contain bugs. If you encounter an issue, please let me know&nbsp;
          <a href="https://github.com/Corvimae/pokemon-ranger/issues" target="_blank" rel="noopener noreferrer">here</a>.
        </Disclaimer>
        <InputSection>
          <InputRow>
            <label htmlFor="generation">Generation</label>
            <select id="generation" value={generation} onChange={handleSetGeneration}>
              <option value={3}>3 (Ruby/Sapphire/Emerald)</option>
              <option value={4}>4 (Diamond/Pearl/Platinum)</option>
              <option value={5}>5 (Black/White and Black 2/White 2)</option>
              <option value={6}>6 (X/Y)</option>
              <option value={7}>7+ (Sun/Moon, Ultra Sun/Ultra Moon, and Sword/Shield)</option>
              <option value="lgpe">Let&apos;s Go</option>
            </select>
          </InputRow>
          <InputRow>
            <label htmlFor="baseFriendship">Initial Level</label>
            <input id="baseFriendship" type="number" value={state.initialLevel} onChange={handleSetInitialLevel} />
          </InputRow>
          <InputRow>
            <label htmlFor="growthRate">Growth Rate</label>
            <select id="growthRate" value={state.growthRate} onChange={handleSetGrowthRate}>
              {Object.entries(GROWTH_RATE_NAMES).map(([rate, label]) => (
                <option key={rate} value={rate}>{label}</option>
              ))}
            </select>
          </InputRow>
        </InputSection>

        <InputSubheader>Experience Events</InputSubheader>
        <ExperienceEventActions>
          <InputSection>
            <InputRow>
              <label htmlFor="speciesSelect">Species</label>
              <select id="speciesSelect" onChange={handleSetSelectedSpeciesDataURL}>
                {pokemonSpeciesList.map(({ name, url }) => (
                  <option key={name} value={url}>{name}</option>
                ))}
              </select>
            </InputRow>
            <InputRow>
              <label htmlFor="speciesLevel">Level</label>
              <input id="speciesLevel" type="number" value={speciesLevelValue} onChange={handleSetSpeciesLevelValue} />
            </InputRow>
            <InputRow>
              <label htmlFor="speciesSource">Source</label>
              <select id="speciesSource" onChange={event => setTradeExperienceType(event.target.value)}>
                <option value="owner">Original Trainer</option>
                <option value="domestic">Domestic Trade</option>
                <option value="international">International Trade</option>
              </select>
              <HelpText>Pokémon obtained via an international trade gain additional experience starting in Gen. 4.</HelpText>
            </InputRow>
            <InputRow>
              <label htmlFor="speciesParticipated">Participated?</label>
              <Checkbox id="speciesParticipated" data-checked={didParticipateValue} onClick={() => setDidParticipateValue(!didParticipateValue)} />
              <HelpText>If a Pokémon is gaining experience via the Exp. Share but did not participate in the fight, uncheck this box.</HelpText>
            </InputRow>
            <InputRow>
              <label htmlFor="speciesOtherParticipants">Other Participant Count</label>
              <input id="speciesOtherParticipants" type="number" value={otherParticipantCountValue} onChange={event => setOtherParticipantCountValue(Number(event.target.value))} />
              <HelpText>The number of unfainted Pokémon that also participated in this fight, not including this Pokémon. In most cases, this will be 0.</HelpText>
            </InputRow>
            <InputRow>
              <label htmlFor="speciesExpShare">Exp. Share</label>
              <Checkbox id="speciesExpShare" data-checked={expShareEnabledValue} onClick={() => setExpShareEnabledValue(!expShareEnabledValue)} />
              <HelpText>Is this Pokémon affected by an Exp. Share?</HelpText>
            </InputRow>
            {generation < 6 && (
              <InputRow>
                <label htmlFor="speciesOtherExpShare">Other Pokémon w/ Exp. Share</label>
                <input id="speciesOtherExpShare" type="number" value={otherPokemonHoldingExperienceShareValue} onChange={event => setOtherPokemonHoldingExperienceShareValue(Number(event.target.value))} />
                <HelpText>The number of Pokémon in the party, not including this Pokémon, that are holding an Exp. Share.</HelpText>
              </InputRow>
            )}
            {generation === 1 && (
              <InputRow>
                <label htmlFor="speciesOtherExpShare">Party Size</label>
                <input id="speciesOtherExpShare" type="number" value={partySizeValue} onChange={event => setPartySizeValue(Number(event.target.value))} />
                <HelpText>The number of Pokémon in the party, including this Pokémon.</HelpText>
              </InputRow>
            )}
            <InputRow>
              <label htmlFor="speciesLuckyEgg">Lucky Egg</label>
              <Checkbox id="speciesLuckyEgg" data-checked={hasLuckyEggValue} onClick={() => setHasLuckyEggValue(!hasLuckyEggValue)} />
              <HelpText>Is this Pokémon holding a Lucky Egg?</HelpText>
            </InputRow>
            <InputRow>
              <label htmlFor="speciesAffectionBoost">Affection Boost</label>
              <Checkbox id="speciesAffectionBoost" data-checked={hasAffectionBoostValue} onClick={() => setHasAffectionBoostValue(!hasAffectionBoostValue)} />
              <HelpText>Does the Pokémon have an Affection of at least 2?</HelpText>
            </InputRow>
            <InputRow>
              <label htmlFor="speciesWild">Wild Pokémon</label>
              <Checkbox id="speciesWild" data-checked={isWildValue} onClick={() => setIsWildValue(!isWildValue)} />
              <HelpText>Is the opposing Pokémon a wild Pokémon?</HelpText>
            </InputRow>
            {generation >= 6 && (
              <InputRow>
                <label htmlFor="speciesPastEvolution">Past Evolution Level</label>
                <Checkbox id="speciesPastEvolution" data-checked={isPastEvolutionPointValue} onClick={() => setIsPastEvolutionPointValue(!isPastEvolutionPointValue)} />
                <HelpText>Is this Pokémon past the level where it would normally evolve, but has not</HelpText>
              </InputRow>
            )}
            <Button onClick={handleAddSpeciesExperienceEvent}>Add</Button>
          </InputSection>
          <ActionInputSubheader>Manual Experience</ActionInputSubheader>
          <ExperienceActionInputRow>
            <div>
              <label htmlFor="manualName">Source Name</label>
              <input id="manualName" value={manualNameValue} onChange={event => setManualNameValue(event.target.value)} />
            </div>
            <div>
              <label htmlFor="manualReward">Exp. Reward</label>
              <input id="manualReward" type="number" value={manualRewardValue} onChange={event => setManualRewardValue(Number(event.target.value))} />
            </div>
            <Button onClick={handleAddManualExperienceEvent}>Add</Button>
          </ExperienceActionInputRow>
          <ExperienceActionInputRow>
            <Button onClick={handleAddRareCandyExperienceEvent}>Add Rare Candy</Button>
          </ExperienceActionInputRow>
        </ExperienceEventActions>
      </LeftColumn>
      <div>
        <Header>Experience Route</Header>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="experienceEvents">
            {provided => (
              <ExperienceEventList {...provided.droppableProps} ref={provided.innerRef}>
                {experienceRoute.map((experienceEvent, index) => (
                  <Draggable key={experienceEvent.id} draggableId={experienceEvent.id} index={index}>
                    {draggableProvided => (
                      <ExperienceEventRow
                        innerRef={draggableProvided.innerRef}
                        event={experienceEvent}
                        onRemove={() => handleRemoveExperienceEvent(experienceEvent.id)}
                        draggableProps={draggableProvided.draggableProps}
                        dragHandleProps={draggableProvided.dragHandleProps}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ExperienceEventList>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </Container>
  );
};

export default ExperienceRoute;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;  
  & > div {
    padding: 1rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow-y: hidden;
`;

const ExperienceEventList = styled.div`
  display: flex;
  min-height: 0;
  grid-column: 1 / -1;
  flex-direction: column;
  overflow-y: auto;
  align-self: stretch;
  flex-grow: 1;
`;

const ExperienceEventContainer = styled.div`
  display: flex;
  height: 3.25rem;
  align-items: center;
  padding: 0.5rem 0;
  
  & + & {
    border-top: 1px solid #e0e0e0;
  }
`;

const ExperienceEventText = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem;
  flex-grow: 1;
  align-self: stretch;
`;

const LevelUpRow = styled.div`
  width: 100%;
  background-color: #aaddff;
  color: #0d2f46;
  font-size: 0.825rem;
  text-align: center;
  font-style: italic;
`;

const ExperienceEventActions = styled.div`
  display: flex;
  grid-column: 1 / -1;
  flex-direction: column;

  & > div + div {
    margin-top: 0.5rem;
  }
`;

const ExperienceActionInputRow = styled(InputRow)`
  display: flex;

  & + &,
  ${InputSection} + & {
    border-top: 1px solid #ccc;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-bottom: none;
  }

  & > div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-self: stretch;
    flex-grow: 1;
  }

  & > div + div {
    margin-left: 0.5rem;
  }


  & label {
    align-self: flex-start;
  }

  & label,
  & input,
  & select {
    margin-bottom: 0;
  }

  & > div + button {
    margin-left: 0.5rem;
    height: 2rem;
    align-self: flex-end;
  }
`;

const ActionInputSubheader = styled.div`
  font-weight: 700;
  border-top: 1px solid #ccc;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-bottom: none;
`;

const ExperienceGained = styled.span`
  color: #666;
  margin-left: 0.25rem;
`;

const ExperienceEventIcon = styled.img`
  width: 1rem;
  height: 1rem;
  margin-left: 0.5rem;
`;

const Disclaimer = styled(HelpText)`
  grid-column: span 2;
`;
