import React, { useCallback } from 'react';
import styled from 'styled-components';
import { RouteContext, setOptionCompactIVs, setOptionHideMedia, setOptionIVBackgroundColor, setOptionIVFontFamily, setOptionIVHorizontalLayout, setShowOptions } from '../../reducers/route/reducer';
import { OptionKeys } from '../../utils/options';
import { dispatchAndPersist } from '../../utils/utils';
import { Button } from '../Button';
import { Checkbox, HelpText, InputRow, InputSection } from '../Layout';

export const RouteOptionsModal: React.FC = () => {
  const state = RouteContext.useState();
  const dispatch = RouteContext.useDispatch();

  const handleCloseModal = useCallback(() => {
    dispatch(setShowOptions(false));
  }, [dispatch]);

  const handleToggleCompactIVs = useCallback(() => {
    dispatchAndPersist(OptionKeys.ROUTE_OPTIONS_COMPACT_IVS, !state.options.compactIVs, setOptionCompactIVs, dispatch);
  }, [dispatch, state.options.compactIVs]);
  
  const handleToggleHideMedia = useCallback(() => {
    dispatchAndPersist(OptionKeys.ROUTE_OPTIONS_HIDE_MEDIA, !state.options.hideMedia, setOptionHideMedia, dispatch);
  }, [dispatch, state.options.hideMedia]);

  const handleSetIVBackgroundColor = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAndPersist(OptionKeys.ROUTE_OPTIONS_IVS_BACKGROUND_COLOR, event.target.value, setOptionIVBackgroundColor, dispatch);
  }, [dispatch]);

  const handleSetIVFontFamily = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchAndPersist(OptionKeys.ROUTE_OPTIONS_IVS_FONT_FAMILY, event.target.value, setOptionIVFontFamily, dispatch);
  }, [dispatch]);

  const handleToggleIVHorizontalLayout = useCallback(() => {
    dispatchAndPersist(OptionKeys.ROUTE_OPTIONS_IVS_HORIZONTAL_LAYOUT, !state.options.ivHorizontalLayout, setOptionIVHorizontalLayout, dispatch);
  }, [dispatch, state.options.ivHorizontalLayout]);

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
            <InputRow>
              <label htmlFor="compactIVs">Compact IV Display</label>
              <Checkbox id="compactIVs" data-checked={state.options.compactIVs} onClick={handleToggleCompactIVs} />
              <HelpText>Hide the Pokémon&apos;s name above the IV display.</HelpText>
            </InputRow>

            <InputRow>
              <label htmlFor="compactIVs">Hide Media</label>
              <Checkbox id="compactIVs" data-checked={state.options.hideMedia} onClick={handleToggleHideMedia} />
              <HelpText>Hides images and videos.</HelpText>
            </InputRow>

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

            <InputRow>
              <label htmlFor="compactIVs">IV Horizontal Layout</label>
              <Checkbox id="compactIVs" data-checked={state.options.ivHorizontalLayout} onClick={handleToggleIVHorizontalLayout} />
              <HelpText>Show the IV tracker in a horizontal layout at the bottom of the page.</HelpText>
            </InputRow>

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
