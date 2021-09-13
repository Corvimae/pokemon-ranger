import React, { useCallback } from 'react';
import styled from 'styled-components';
import { RouteContext, setBooleanOption, setOptionIVBackgroundColor, setOptionIVFontFamily, setShowOptions } from '../../reducers/route/reducer';
import { BooleanRouteOptionStateKey } from '../../reducers/route/types';
import { OptionKeys } from '../../utils/options';
import { dispatchAndPersist } from '../../utils/utils';
import { Button } from '../Button';
import { Checkbox, HelpText, InputRow, InputSection } from '../Layout';

interface RouteOptionCheckboxProps {
  label: string;
  stateKey: BooleanRouteOptionStateKey
  storageKey: string;
}

const RouteOptionCheckbox: React.FC<RouteOptionCheckboxProps> = ({ label, stateKey, storageKey, children }) => {
  const state = RouteContext.useState();
  const dispatch = RouteContext.useDispatch();

  const handleToggle = useCallback(() => {
    dispatchAndPersist(storageKey, !state.options[stateKey], value => setBooleanOption(stateKey, value), dispatch);
  }, [dispatch, state.options, stateKey, storageKey]);

  return (
    <InputRow>
      <label htmlFor="stateKey">{label}</label>
      <Checkbox
        id={stateKey}
        data-checked={state.options[stateKey]}
        onClick={handleToggle}
      />
      {children && (
        <HelpText>{children}</HelpText>
      )}
    </InputRow>
  );
};

export const RouteOptionsModal: React.FC = () => {
  const state = RouteContext.useState();
  const dispatch = RouteContext.useDispatch();

  const handleCloseModal = useCallback(() => {
    dispatch(setShowOptions(false));
  }, [dispatch]);

  const handleSetIVBackgroundColor = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAndPersist(OptionKeys.ROUTE_OPTIONS_IVS_BACKGROUND_COLOR, event.target.value, setOptionIVBackgroundColor, dispatch);
  }, [dispatch]);

  const handleSetIVFontFamily = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAndPersist(OptionKeys.ROUTE_OPTIONS_IVS_FONT_FAMILY, event.target.value, setOptionIVFontFamily, dispatch);
  }, [dispatch]);

  return (
    <Backdrop>
      <Modal>
        <ModalTitle>
          Options
          <Button onClick={handleCloseModal}>
            Close
          </Button>
        </ModalTitle>

        <ModalBody>
          <InputSection>
            <OptionSectionTitle>Accessibility</OptionSectionTitle>
            
            <RouteOptionCheckbox
              label="High Condition Visibility"
              stateKey="expandConditions"
              storageKey={OptionKeys.ROUTE_OPTIONS_EXPAND_CONDITIONS}
            >
              Display the conditional expression as its own line in conditional blocks.
            </RouteOptionCheckbox>

            <OptionSectionTitle>Theme</OptionSectionTitle>
            <InputRow>
              <label htmlFor="ivBackgroundColor">IV Background Color</label>
              <input id="ivBackgroundColor" value={state.options.ivBackgroundColor} onChange={handleSetIVBackgroundColor} />
              <HelpText>
                The RGB hexcode to use for the background color of the right-side column. Please use a color that meets&nbsp;
                <a href="https://color.a11y.com/" rel="noopener noreferrer" target="_blank">accessibility contrast requirements</a> with #FFF.
              </HelpText>
            </InputRow>

            <InputRow>
              <label htmlFor="ivFontFamily">IV Font Family</label>
              <input id="ivFontFamily" value={state.options.ivFontFamily} onChange={handleSetIVFontFamily} />
              <HelpText>
                The name of the font family to use for the right-side column. The font must be installed on your system.
              </HelpText>
            </InputRow>

            <OptionSectionTitle>Layout</OptionSectionTitle>

            <RouteOptionCheckbox
              label="Compact IV Display"
              stateKey="compactIVs"
              storageKey={OptionKeys.ROUTE_OPTIONS_COMPACT_IVS}
            >
              Hide the Pokémon&apos;s name above the IV display.
            </RouteOptionCheckbox>

            <RouteOptionCheckbox
              label="Hide Media"
              stateKey="hideMedia"
              storageKey={OptionKeys.ROUTE_OPTIONS_HIDE_MEDIA}
            >
              Hides images and videos.
            </RouteOptionCheckbox>

            <RouteOptionCheckbox
              label="IV Horizontal Layout"
              stateKey="ivHorizontalLayout"
              storageKey={OptionKeys.ROUTE_OPTIONS_IVS_HORIZONTAL_LAYOUT}
            >
              Show the IV tracker in a horizontal layout at the bottom of the page.
            </RouteOptionCheckbox>

            <RouteOptionCheckbox
              label="Render Only IV Trackers"
              stateKey="renderOnlyTrackers"
              storageKey={OptionKeys.ROUTE_OPTIONS_RENDER_ONLY_TRACKERS}
            >
              Render only the IV trackers, not the route. Do not enable this option unless
              you are only using Ranger&apos;s IV tracker feature and need to improve performance.
            </RouteOptionCheckbox>

            <RouteOptionCheckbox
              label="Hide IV Results"
              stateKey="hideIVResults"
              storageKey={OptionKeys.ROUTE_OPTIONS_HIDE_IV_RESULTS}
            >
              Hide the IV results. This option is not recommended; having a good understanding of
              what stats correlate to what IVs will help you make decisions!
            </RouteOptionCheckbox>
          </InputSection>
        </ModalBody>
      </Modal>
    </Backdrop>
  );
};

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.5); 
  z-index: 999;
`;

const Modal = styled.div`
  position: absolute;
  display: flex;
  width: 90vw;
  height: 90vh;
  max-width: 75rem;
  top: 50%;
  left: 50%;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
  transform: translate(-50%, -50%);
`;

const ModalTitle = styled.div`
  display: flex;
  width: 100%;
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.foreground};
`;

const ModalBody = styled.div`
  display: flex;
  min-height: 0;
  padding: 1rem;
  flex-direction: column;
  flex-grow: 1;
  align-self: stretch;
  overflow-y: auto;
`;

const OptionSectionTitle = styled.h3`
  display: flex;
  flex-direction: row;
  align-items: center;
  grid-column: 1 / -1;

  &:after {
    content: '';
    position: relative;
    display: block;
    width: 100%;
    margin-left: 1rem;
    height: 1px;
    background-color: ${({ theme }) => theme.input.border};
  }
`;
