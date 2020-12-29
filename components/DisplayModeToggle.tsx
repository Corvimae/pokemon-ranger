import React, { useCallback } from 'react';
import { DisplayMode, DISPLAY_MODES } from '../reducers/ranger/types';
import { Button } from './Layout';

interface DisplayModeToggleProps {
  displayMode: DisplayMode,
  setDisplayMode: (value: DisplayMode) => void;
}

const DISPLAY_MODE_SELECTION_LABELS: Record<DisplayMode, string> = {
  expanded: 'Show Expanded',
  compact: 'Show Compact',
  ohko: 'Show One-shot Ranges',
};

function getNextDisplayMode(currentMode: DisplayMode): DisplayMode {
  return DISPLAY_MODES[DISPLAY_MODES.indexOf(currentMode) + 1] || DISPLAY_MODES[0];
}

export const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({ displayMode, setDisplayMode }) => {
  const handleToggleDisplayMode = useCallback(() => {
    setDisplayMode(getNextDisplayMode(displayMode));
  }, [displayMode, setDisplayMode]);

  return (
    <Button onClick={handleToggleDisplayMode}>
      {DISPLAY_MODE_SELECTION_LABELS[getNextDisplayMode(displayMode)]}
    </Button>
  );
};
