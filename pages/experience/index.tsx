import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { NextPage } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faToggleOff, faToggleOn } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Select from 'react-select';
import { useDropzone } from 'react-dropzone';
import { Tooltip } from 'react-tippy';
import { calculateExperienceRequiredForLevel, Generation, GrowthRate } from 'relicalc';
import { Header, InputSection, InputRow, InputSubheader, Checkbox, HelpText } from '../../components/Layout';
import { Button, IconButton } from '../../components/Button';
import { addManualExperienceEvent, addRareCandyExperienceEvent, addSpeciesExperienceEvent, importExperienceRoute, removeExperienceEvent, reorderExperienceEvents, resetState, setGrowthRate, setInitialLevel, toggleExperienceEventEnabled, updateExperienceEvent, useExperienceReducer } from '../../reducers/experience/reducer';
import { buildExperienceRoute, ExperienceEvent, ExperienceEventWithMetadata, SpeciesExperienceEvent } from '../../utils/calculations';

const GROWTH_RATE_NAMES: Record<GrowthRate, string> = {
  slow: 'Slow',
  'medium-slow': 'Medium-Slow',
  'medium-fast': 'Medium-Fast',
  fast: 'Fast',
  erratic: 'Erratic',
  fluctuating: 'Fluctuating',
};

const BLANK_EV_SET = [0, 0, 0, 0, 0, 0];

interface PokemonSpeciesData {
  name: string;
  url: string;
}

function getTradeExpBoostLabel(event: SpeciesExperienceEvent): string {
  if (event.isTrade) return 'domestic';
  if (event.isInternationalTrade) return 'international';

  return 'no';
}

function getAffectedText(status: boolean): string {
  return status ? 'Affected' : 'Not affected';
}
interface ExperienceEventRowProps {
  event: ExperienceEventWithMetadata;
  onRemove: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onUpdate: (event: ExperienceEvent) => void;
  innerRef: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  draggableProps: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  dragHandleProps: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const ExperienceEventRow: React.FC<ExperienceEventRowProps> = ({ innerRef, event, draggableProps, dragHandleProps, onUpdate, onRemove, onToggleEnabled }) => {
  const handleToggleExpShare = useCallback(() => {
    if (event.type !== 'species') return;

    onUpdate({ ...event, expShareEnabled: !event.expShareEnabled });
  }, [event, onUpdate]);

  const handleToggleLuckyEgg = useCallback(() => {
    if (event.type !== 'species') return;

    onUpdate({ ...event, hasLuckyEgg: !event.hasLuckyEgg });
  }, [event, onUpdate]);

  const handleToggleAffectionBoost = useCallback(() => {
    if (event.type !== 'species') return;

    onUpdate({ ...event, hasAffectionBoost: !event.hasAffectionBoost });
  }, [event, onUpdate]);

  const handleCycleTrade = useCallback(() => {
    if (event.type !== 'species') return;

    if (event.isTrade) {
      onUpdate({ ...event, isTrade: false, isInternationalTrade: true });
    } else if (event.isInternationalTrade) {
      onUpdate({ ...event, isTrade: false, isInternationalTrade: false });
    } else {
      onUpdate({ ...event, isTrade: true, isInternationalTrade: false });
    }
  }, [event, onUpdate]);

  const handleToggleWild = useCallback(() => {
    if (event.type !== 'species') return;

    onUpdate({ ...event, isWild: !event.isWild });
  }, [event, onUpdate]);

  const handleTogglePastEvolutionPoint = useCallback(() => {
    if (event.type !== 'species') return;

    onUpdate({ ...event, isPastEvolutionPoint: !event.isPastEvolutionPoint });
  }, [event, onUpdate]);
  
  return (
    <>
      <ExperienceEventContainer ref={innerRef} enabled={event.enabled} {...draggableProps}>
        <ExperienceEventDragHandleContainer {...dragHandleProps}>
          <FontAwesomeIcon icon={faBars} color="#CCC" />
        </ExperienceEventDragHandleContainer>
        <IconButton onClick={() => onToggleEnabled(event.id, !event.enabled)}>
          <FontAwesomeIcon icon={event.enabled ? faToggleOn : faToggleOff} />
        </IconButton>
        <ExperienceEventText>
          {event.type === 'rareCandy' ? '(Rare Candy)' : event.name}
          {event.type === 'species' && (
            <ExperienceEventLevel>Lv. {event.level}</ExperienceEventLevel>
          )}
          {event.enabled && (
            <ExperienceGained>(+{event.experienceGained})</ExperienceGained>
          )}
          {event.type === 'species' && (
            <>
              <Tooltip
                html={(
                  <div>
                    <div>{getAffectedText(event.expShareEnabled)} by Exp. Share</div>
                    {event.otherPokemonHoldingExperienceShare ? <div>{event.otherPokemonHoldingExperienceShare} other party members have an Exp. Share</div> : null}
                  </div>
                )}
                position="bottom"
                className="tooltip"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon
                  src="images/exp-share.png"
                  enabled={(event.expShareEnabled || event.otherPokemonHoldingExperienceShare > 0)}
                  onClick={handleToggleExpShare}
                />
              </Tooltip>
              <Tooltip
                title={`${getAffectedText(event.hasLuckyEgg)} by Lucky Egg`}
                className="tooltip"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon
                  src="images/lucky-egg.png"
                  enabled={event.hasLuckyEgg}
                  onClick={handleToggleLuckyEgg}
                />
              </Tooltip>
              <Tooltip
                title={`${getAffectedText(event.hasAffectionBoost)} by Affection Exp. boost (>= 2)`}
                className="tooltip"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon
                  src="images/affection-heart.png"
                  enabled={event.hasAffectionBoost}
                  onClick={handleToggleAffectionBoost}
                />
              </Tooltip>
              <Tooltip
                title={`Affected by ${getTradeExpBoostLabel(event)} trade Exp. boost`}
                className="tooltip"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon
                  src="images/trade-icon.png"
                  enabled={event.isTrade || event.isInternationalTrade}
                  isSpecial={event.isInternationalTrade}
                  onClick={handleCycleTrade}
                />
              </Tooltip>
              <Tooltip
                title={`Opponent is ${event.isWild ? 'wild' : 'owned by a trainer'}`}
                className="tooltip"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon
                  src="images/pokeball.png"
                  enabled={!event.isWild}
                  onClick={handleToggleWild}
                />
              </Tooltip>
              <Tooltip
                title={`Pokémon is ${event.isPastEvolutionPoint ? '' : 'not '}past evolution level`}
                className="tooltip"
                position="bottom"
                distance={8}
                duration={0}
                arrow
              >
                <ExperienceEventIcon
                  src="images/everstone.png"
                  enabled={event.isPastEvolutionPoint}
                  onClick={handleTogglePastEvolutionPoint}
                />
              </Tooltip>
            </>
          )}
        </ExperienceEventText>
        {event.enabled && (
          <ExperienceEventEVs>
            <ExperienceEVsLabel>EVs</ExperienceEVsLabel>
            <div>{(event.evs ?? BLANK_EV_SET).join('/')}</div>
          </ExperienceEventEVs>
        )}
        <Button onClick={() => onRemove(event.id)}>&times;</Button>
      </ExperienceEventContainer>
      {event.isLevelUp && (
        <LevelUpRow>Level up! ({event.levelAfterExperience}) </LevelUpRow>
      )}
    </>
  );
};

const ExperienceRoute: NextPage = () => {
  const [state, dispatch] = useExperienceReducer();
  const pendingDetailsRequestUrl = useRef(undefined);
  const [importError, setImportError] = useState<string | null>(null);

  const [generation, setGeneration] = useState<Generation>(4);
  const [manualNameValue, setManualNameValue] = useState('');
  const [manualRewardValue, setManualRewardValue] = useState(0);
  const [speciesNameValue, setSpeciesNameValue] = useState('');
  const [speciesBaseExperienceValue, setSpeciesBaseExperienceValue] = useState(0);
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
  const [hpEVValue, setHpEVValue] = useState(0);
  const [attackEVValue, setAttackEVValue] = useState(0);
  const [defenseEVValue, setDefenseEVValue] = useState(0);
  const [spAttackEVValue, setSpAttackEVValue] = useState(0);
  const [spDefenseEVValue, setSpDefenseEVValue] = useState(0);
  const [speedEVValue, setSpeedEVValue] = useState(0);
  const [manualHpEVValue, setManualHpEVValue] = useState(0);
  const [manualAttackEVValue, setManualAttackEVValue] = useState(0);
  const [manualDefenseEVValue, setManualDefenseEVValue] = useState(0);
  const [manualSpAttackEVValue, setManualSpAttackEVValue] = useState(0);
  const [manualSpDefenseEVValue, setManualSpDefenseEVValue] = useState(0);
  const [manualSpeedEVValue, setManualSpeedEVValue] = useState(0);

  const [pokemonSpeciesList, setPokemonSpeciesList] = useState<PokemonSpeciesData[]>([]);

  const handleSetGeneration = useCallback(event => {
    setGeneration(event.target.value === 'lgpe' ? event.target.value : Number(event.target.value));
  }, []);

  const handleSetSpeciesLevelValue = useCallback(event => {
    setSpeciesLevelValue(Number(event.target.value));
  }, []);
  
  const handleSetSelectedSpecies = useCallback(async value => {
    if (!value) return;

    pendingDetailsRequestUrl.current = value;

    const speciesDataRequest = await fetch(value);
    
    const speciesData = await speciesDataRequest.json();

    if (speciesDataRequest.url !== pendingDetailsRequestUrl.current) return;

    setSpeciesNameValue(speciesData.name[0].toUpperCase() + speciesData.name.substr(1));
    setSpeciesBaseExperienceValue(speciesData.base_experience);
    setHpEVValue(speciesData.stats[0].effort);
    setAttackEVValue(speciesData.stats[1].effort);
    setDefenseEVValue(speciesData.stats[2].effort);
    setSpAttackEVValue(speciesData.stats[3].effort);
    setSpDefenseEVValue(speciesData.stats[4].effort);
    setSpeedEVValue(speciesData.stats[5].effort);

    pendingDetailsRequestUrl.current = undefined;
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

  const handleAddManualExperienceEvent = useCallback((position: number) => {
    dispatch(addManualExperienceEvent(
      manualNameValue,
      manualRewardValue,
      manualHpEVValue,
      manualAttackEVValue,
      manualDefenseEVValue,
      manualSpAttackEVValue,
      manualSpDefenseEVValue,
      manualSpeedEVValue,
      position,
    ));
  }, [dispatch, manualNameValue, manualRewardValue, manualHpEVValue, manualAttackEVValue, manualDefenseEVValue, manualSpAttackEVValue, manualSpDefenseEVValue, manualSpeedEVValue]);

  const handleAddRareCandyExperienceEvent = useCallback((position: number) => {
    dispatch(addRareCandyExperienceEvent(position));
  }, [dispatch]);

  const handleAddSpeciesExperienceEvent = useCallback((position: number) => {
    dispatch(addSpeciesExperienceEvent(
      speciesNameValue,
      speciesBaseExperienceValue,
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
      hpEVValue,
      attackEVValue,
      defenseEVValue,
      spAttackEVValue,
      spDefenseEVValue,
      speedEVValue,
      position,
    ));
  }, [dispatch, speciesNameValue, speciesBaseExperienceValue, speciesLevelValue, expShareEnabledValue, didParticipateValue, otherParticipantCountValue, otherPokemonHoldingExperienceShareValue, partySizeValue, tradeExperienceType, hasLuckyEggValue, hasAffectionBoostValue, isWildValue, isPastEvolutionPointValue, hpEVValue, attackEVValue, defenseEVValue, spAttackEVValue, spDefenseEVValue, speedEVValue]);

  const handleRemoveExperienceEvent = useCallback(id => {
    dispatch(removeExperienceEvent(id));
  }, [dispatch]);

  const handleToggleExperienceEventEnabled = useCallback((id, enabled) => {
    dispatch(toggleExperienceEventEnabled(id, enabled));
  }, [dispatch]);

  const handleUpdateExperienceEvent = useCallback((updatedEvent: ExperienceEvent) => {
    dispatch(updateExperienceEvent(updatedEvent));
  }, [dispatch]);

  const handleDragEnd = useCallback(dragEvent => {
    if (!dragEvent.destination) return;

    const updatedList = [...state.experienceEvents];
    const [removed] = updatedList.splice(dragEvent.source.index, 1);

    updatedList.splice(dragEvent.destination.index, 0, removed);

    dispatch(reorderExperienceEvents(updatedList));
  }, [state.experienceEvents, dispatch]);

  const handleExport = useCallback(() => {
    const a = document.createElement('a');

    a.href = URL.createObjectURL(new Blob([JSON.stringify({
      ...state,
      generation,
    }, null, 2)], {
      type: 'text/plain',
    }));

    a.setAttribute('download', 'experience-route.json');

    document.body.appendChild(a);
    
    a.click();

    document.body.removeChild(a);
  }, [state, generation]);

  const handleImport = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      setImportError('Only one route file may be selected at a time.');

      return;
    }

    if (acceptedFiles.length === 0) {
      setImportError('An unknown issue occurred trying to load the file.');

      return;
    }

    const [acceptedFile] = acceptedFiles;

    if (!acceptedFile.name.endsWith('.json')) {
      setImportError('Experience route files must end in .json');

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

        dispatch(importExperienceRoute(importedJSON));
        setGeneration(importedJSON.generation);
        setImportError(null);
      } catch (error) {
        setImportError(`The experience route could not be read: ${error}.`);
      }
    };

    reader.readAsBinaryString(acceptedFile);
  }, [dispatch]);
    
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
      const speciesList = (await response.json()).results.map((result: { name: string }) => ({
        ...result,
        name: result.name[0].toUpperCase() + result.name.substr(1),
      }));

      setPokemonSpeciesList(speciesList);

      handleSetSelectedSpecies(speciesList[0].url);
    };

    fetchData();
  }, [handleSetSelectedSpecies]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleImport,
    noClick: true,
    multiple: false,
  });

  const experienceRoute = useMemo(() => (
    buildExperienceRoute(generation, state.initialLevel, state.growthRate, state.experienceEvents)
  ), [state, generation]);

  const { experienceNeededForNextLevel, nextLevel } = useMemo(() => {
    const enabledEvents = experienceRoute.filter(item => item.enabled);

    if (enabledEvents.length === 0) return {};

    const { totalExperience, levelAfterExperience } = enabledEvents[enabledEvents.length - 1];
    const expForNextLevel = calculateExperienceRequiredForLevel(levelAfterExperience + 1, state.growthRate);
    
    return {
      experienceNeededForNextLevel: expForNextLevel - totalExperience,
      nextLevel: levelAfterExperience + 1,
    };
  }, [state, experienceRoute]);

  const ivTrackerOutput = useMemo(() => (
    experienceRoute.reduce((acc, event) => {
      if (event.isLevelUp) {
        return [...acc, `  ${event.levelAfterExperience} -> ${event.evs.join(', ')}`];
      }

      return acc;
    }, [`${state.initialLevel}:`]).join('\n')
  ), [experienceRoute, state.initialLevel]);
  
  return (
    <Container>
      <LeftColumn>
        <Header>
          Experience Route Builder
          <div>
            <Button onClick={handleResetValues}>Reset</Button>
          </div>
        </Header>
        <InputSectionContainer>
          <InputSection>
            <InputRow>
              <label htmlFor="generation">Generation</label>
              <select id="generation" value={generation} onChange={handleSetGeneration}>
                <option value={3}>3 (Ruby/Sapphire/Emerald)</option>
                <option value={4}>4 (Diamond/Pearl/Platinum)</option>
                <option value={5}>5 (Black/White and Black 2/White 2)</option>
                <option value={6}>6 (X/Y)</option>
                <option value={7}>7+ (Sun/Moon, USUM, Sword/Shield, and BDSP)</option>
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

          <ExperienceEventSubheader>
            Experience Events
            <div>
              <Button onClick={() => handleAddRareCandyExperienceEvent(-1)}>Add Rare Candy</Button>
              <Button onClick={() => handleAddSpeciesExperienceEvent(0)}>Add to Start</Button>
              <Button onClick={() => handleAddSpeciesExperienceEvent(-1)}>Add to End</Button>
            </div>
          </ExperienceEventSubheader>
          <ExperienceEventActions>
            <InputSection>
              <SectionSubheader>Event Pokémon</SectionSubheader>
              <InputRow>
                <label htmlFor="speciesSelect">Species</label>
                <SpeciesSelector
                  id="speciesSelect"
                  classNamePrefix="species-selector"
                  onChange={(item: PokemonSpeciesData) => item && handleSetSelectedSpecies(item.url)}
                  options={pokemonSpeciesList}
                  getOptionLabel={(item: PokemonSpeciesData) => item.name}
                  getOptionValue={(item: PokemonSpeciesData) => item.url}
                  isClearable
                />
              </InputRow>
              <InputRow>
                <label htmlFor="speciesLabel">Label</label>
                <input id="speciesLabel" value={speciesNameValue} onChange={event => setSpeciesNameValue(event.target.value)} />
                <HelpText>You can set the label to anything, but it&apos;s best to pick a label that makes it clear how you got the experience.</HelpText>
              </InputRow>
              <InputRow>
                <label htmlFor="speciesBaseExperience">Base Experience</label>
                <input id="speciesBaseExperience" type="number" value={speciesBaseExperienceValue} onChange={event => setSpeciesBaseExperienceValue(Number(event.target.value))} />
              </InputRow>
              <InputRow>
                <label htmlFor="speciesLevel">Level</label>
                <input id="speciesLevel" type="number" value={speciesLevelValue} onChange={handleSetSpeciesLevelValue} />
              </InputRow>
              <InputRow>
                <label htmlFor="speciesWild">Wild Pokémon</label>
                <Checkbox id="speciesWild" data-checked={isWildValue} onClick={() => setIsWildValue(!isWildValue)} />
                <HelpText>Is the opposing Pokémon a wild Pokémon?</HelpText>
              </InputRow>

              <SectionSubheader>Owned Pokémon</SectionSubheader>
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
              {generation >= 6 && (
                <InputRow>
                  <label htmlFor="speciesPastEvolution">Past Evolution Level</label>
                  <Checkbox id="speciesPastEvolution" data-checked={isPastEvolutionPointValue} onClick={() => setIsPastEvolutionPointValue(!isPastEvolutionPointValue)} />
                  <HelpText>Is this Pokémon past the level where it would normally evolve, but has not</HelpText>
                </InputRow>
              )}
              <SectionSubheader>Effort Values</SectionSubheader>
              <InputRow>
                <EVGrid>
                  <label htmlFor="speciesHPEV">HP</label>
                  <label htmlFor="speciesAttackEV">Atk.</label>
                  <label htmlFor="speciesDefenseEV">Def.</label>
                  <label htmlFor="speciesSpAttackEV">Sp. Atk.</label>
                  <label htmlFor="speciesSpDefenseEV">Sp. Def.</label>
                  <label htmlFor="speciesSpeedEV">Spe.</label>
                  <div>
                    <input id="speciesHPEV" type="number" value={hpEVValue} onChange={event => setHpEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="speciesAttackEV" type="number" value={attackEVValue} onChange={event => setAttackEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="speciesDefenseEV" type="number" value={defenseEVValue} onChange={event => setDefenseEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="speciesSpAttackEV" type="number" value={spAttackEVValue} onChange={event => setSpAttackEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="speciesSpDefenseEV" type="number" value={spDefenseEVValue} onChange={event => setSpDefenseEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="speciesSpeedEV" type="number" value={speedEVValue} onChange={event => setSpeedEVValue(Number(event.target.value))} />
                  </div>
                </EVGrid>
              </InputRow>
            </InputSection>
            <ActionInputSubheader>
              Manual Experience
              <div>
                <Button onClick={() => handleAddManualExperienceEvent(0)}>Add to Start</Button>
                <Button onClick={() => handleAddManualExperienceEvent(-1)}>Add to End</Button>
              </div>
            </ActionInputSubheader>
            <InputSection>
              <InputRow>
                <label htmlFor="manualName">Source Name</label>
                <input id="manualName" value={manualNameValue} onChange={event => setManualNameValue(event.target.value)} />
              </InputRow>
              <InputRow>
                <label htmlFor="manualReward">Exp. Reward</label>
                <input id="manualReward" type="number" value={manualRewardValue} onChange={event => setManualRewardValue(Number(event.target.value))} />
              </InputRow>
              <SectionSubheader>Effort Values</SectionSubheader>
              <InputRow>
                <EVGrid>
                  <label htmlFor="manualHPEv">HP</label>
                  <label htmlFor="manualAttackEV">Atk.</label>
                  <label htmlFor="manualDefenseEV">Def.</label>
                  <label htmlFor="manualSpAttackEV">Sp. Atk.</label>
                  <label htmlFor="manualSpDefenseEV">Sp. Def.</label>
                  <label htmlFor="manualSpeedEV">Spe.</label>
                  <div>
                    <input id="manualHPEV" type="number" value={manualHpEVValue} onChange={event => setManualHpEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="manualAttackEV" type="number" value={manualAttackEVValue} onChange={event => setManualAttackEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="manualDefenseEV" type="number" value={manualDefenseEVValue} onChange={event => setManualDefenseEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="manualSpAttackEV" type="number" value={manualSpAttackEVValue} onChange={event => setManualSpAttackEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="manualSpDefenseEV" type="number" value={manualSpDefenseEVValue} onChange={event => setManualSpDefenseEVValue(Number(event.target.value))} />
                  </div>
                  <div>
                    <input id="manualSpeedEV" type="number" value={manualSpeedEVValue} onChange={event => setManualSpeedEVValue(Number(event.target.value))} />
                  </div>
                </EVGrid>
              </InputRow>
            </InputSection>
          </ExperienceEventActions>
        </InputSectionContainer>
      </LeftColumn>
      <RightColumn {...getRootProps()} tabIndex={-1}>
        <input {...getInputProps()} />
        <Header>
          Experience Route
          <div>
            <Button onClick={handleExport}>Export</Button>
          </div>
        </Header>
        {importError && <ImportError>{importError}</ImportError>}
        {experienceRoute.length === 0 && (
          <ImportInstructions>
            Drag an exported experience route JSON file here to import it.
          </ImportInstructions>
        )}
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
                        onRemove={handleRemoveExperienceEvent}
                        onToggleEnabled={handleToggleExperienceEventEnabled}
                        onUpdate={handleUpdateExperienceEvent}
                        draggableProps={draggableProvided.draggableProps}
                        dragHandleProps={draggableProvided.dragHandleProps}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {experienceNeededForNextLevel && (
                  <ExperienceNeededRow>{experienceNeededForNextLevel} more experience needed to reach Lv. {nextLevel}</ExperienceNeededRow>
                )}
                {experienceRoute.length > 0 && (
                  <EVRouteContainer>
                    <ActionInputSubheader>EV Route</ActionInputSubheader>
                    <HelpText>
                      Paste this into an <a href="https://docs.ranger.maybreak.com/#/routefiles?id=iv-trackers" rel="noopener noreferrer" target="_blank">IV tracker directive</a> to use it in a route.
                    </HelpText>
                    <EVRouteTextArea readOnly value={ivTrackerOutput} />
                  </EVRouteContainer>
                )}
              </ExperienceEventList>
            )}
          </Droppable>
        </DragDropContext>

      </RightColumn>
    </Container>
  );
};

export default ExperienceRoute;

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: 1fr 1fr;  
  overflow-y: hidden;

  & > div {
    padding: 1rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow-y: auto;
`;

const RightColumn = styled.div`
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow-y: hidden;
`;

const ExperienceEventSubheader = styled(InputSubheader)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InputSectionContainer = styled.div`
  display: flex;
  min-height: 0;
  grid-column: 1 / -1;
  flex-direction: column;
  overflow-y: auto;
  align-self: stretch;
  flex-grow: 1;
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

const ExperienceEventContainer = styled.div<{ enabled: boolean }>`
  display: flex;
  height: 3.25rem;
  align-items: center;
  padding: 0.5rem 0;
  opacity: ${({ enabled }) => !enabled && 0.5};
  
  & + & {
    border-top: 1px solid ${({ theme }) => theme.input.border};
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

  & .tooltip {
    position: relative;
  }

  & .tooltip img {
    position: relative;
    top: 2px;
  }
`;

const LevelUpRow = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.cards.info.background};
  color: ${({ theme }) => theme.cards.info.foreground};
  font-size: 0.825rem;
  text-align: center;
  font-style: italic;
`;

const ExperienceNeededRow = styled(LevelUpRow)`
  background-color: ${({ theme }) => theme.cards.warning.background};
  color: ${({ theme }) => theme.cards.warning.foreground};
  margin-top: 0.5rem;
`;

const ExperienceEventActions = styled.div`
  display: flex;
  grid-column: 1 / -1;
  flex-direction: column;

  & > div + div {
    margin-top: 0.5rem;
  }
`;

const ActionInputSubheader = styled.h3`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  border-top: 1px solid ${({ theme }) => theme.input.border};
  font-size: 1.125rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-bottom: none;
`;

const ExperienceGained = styled.span`
  color: ${({ theme }) => theme.label};
  margin-left: 0.25rem;
`;

const ExperienceEventIcon = styled.div<{ enabled: boolean; isSpecial?: boolean; src: string; }>`
  width: 1rem;
  height: 1rem;
  margin-left: 0.5rem;
  opacity: ${({ enabled }) => enabled ? 1.0 : 0.2};
  cursor: pointer;
  background: url(${({ src }) => src});
  background-size: cover;
  background-position-x: center;
  overflow: hidden;
  
  &:before {
    content: ${({ isSpecial }) => isSpecial && '"⭐️"'};
    position: absolute;
    font-size: 0.75rem;
    top: -0.25rem;
    right: -0.25rem;
  }
`;

const ImportError = styled.div`
  color: ${({ theme }) => theme.error};
  font-weight: 700;
  margin-top: 1rem;
`;

const ImportInstructions = styled.div`
  color: ${({ theme }) => theme.label};
  font-style: italic;
  margin-top: 1rem;
`;

const EVGrid = styled.div`
  display: grid;
  width: 100%;
  grid-column: span 2;
  grid-template-columns: repeat(6, 1fr);

  & > label {
    justify-content: flex-start;
    padding-bottom: 0;
  }

  & > div,
  & > label {
    padding: 0.125rem 0.5rem;
    min-width: 0;
    max-width: 100%;
    margin: 0;
  }

  & > div > input {
    width: 100%;
    margin: 0;
  }
`;

const ExperienceEventDragHandleContainer = styled.div`
  margin-right: 0.25rem;
`;

const ExperienceEVsLabel = styled.div`
  color: ${({ theme }) => theme.label};
  font-weight: 700;
  font-size: 0.825rem;
`;

const ExperienceEventEVs = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  padding: 0 1rem;

  & > div {
    font-size: 0.825rem;
  }
`;

const ExperienceEventLevel = styled.div`
  font-size: 0.825rem;
  color: ${({ theme }) => theme.label};
  font-weight: 700;
  margin: 0 0.5rem;
  align-self: flex-end;
`;

const SpeciesSelector = styled(Select)`
  margin-bottom: 0.5rem;

  & > .species-selector__control {
    background-color: ${({ theme }) => theme.input.background};
    color: ${({ theme }) => theme.input.foreground};
    border-color: ${({ theme }) => theme.input.border};
  }

  & .species-selector__value-container div {
    color: ${({ theme }) => theme.input.foreground};
  }

  & .species-selector__indicator-separator {
    background-color: ${({ theme }) => theme.input.border};
  }

  & .species-selector__menu {
    background-color: ${({ theme }) => theme.input.background};
    z-index: 99;
  }

  & .species-selector__option--is-focused {
    background-color: ${({ theme }) => theme.backgroundSelected};
  }
`;

const SectionSubheader = styled.h3`
  grid-column: 1 / -1;
  font-size: 1rem;
  font-weight: 700;
  font-style: italic;
  color: ${({ theme }) => theme.label};
  margin: 0.5rem 0;
`;

const EVRouteContainer = styled.div`
  width: 100%;
`;

const EVRouteTextArea = styled.textarea`
  width: 100%;
  height: 8rem;
  font-family: monospace;
  padding: 0.5rem;
  resize: none;
  background-color: ${({ theme }) => theme.input.background};
  color: ${({ theme }) => theme.input.foreground};
  border: 1px solid ${({ theme }) => theme.input.border};
`;
