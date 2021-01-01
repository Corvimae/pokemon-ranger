import React, { useCallback } from 'react';
import styled from 'styled-components';
import { RangeResult, OneShotResult, CompactRange } from '../utils/rangeTypes';
import { formatIVRange, formatStatRange } from '../utils/rangeFormat';
import { Button } from './Button';

type GridResult = RangeResult | CompactRange | OneShotResult;

function isOneShotResult(result: GridResult): result is OneShotResult {
  return (result as OneShotResult).successes !== undefined;
}

function isCompactRange(result: GridResult): result is CompactRange {
  const compactResult = result as CompactRange;
  const hasNatureIVs = compactResult.negative !== undefined || compactResult.neutral !== undefined || compactResult.positive !== undefined;

  return !isOneShotResult(result) && hasNatureIVs;
}

function formatSegment(result: GridResult): string[] {
  if (isOneShotResult(result)) {
    return [
      `${formatIVRange(result.negative)} / ${formatIVRange(result.neutral)} / ${formatIVRange(result.positive)}`,
      formatStatRange(result.statFrom, result.statTo),
      `${result.successes} / 16`,
    ];
  }

  if (isCompactRange(result)) {
    return [
      `${formatIVRange(result.negative)} / ${formatIVRange(result.neutral)} / ${formatIVRange(result.positive)}`,
      formatStatRange(result.statFrom, result.statTo),
      result.damageRangeOutput,
    ];
  }

  return [
    formatStatRange(result.from, result.to),
    `${result.stat}`,
    result.damageRangeOutput,
  ];
}

interface CopyGridButtonProps {
  results: GridResult[];
  className?: string;
}

const UnstyledCopyGridButton: React.FC<CopyGridButtonProps> = ({ results, className }) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(results.map(result => formatSegment(result).join('\t\t\t')).join('\n'));
  }, [results]);

  return (
    <CopyButton className={className} onClick={handleCopy}>
      Copy
    </CopyButton>
  );
};

export const CopyGridButton = styled(UnstyledCopyGridButton)``;

const CopyButton = styled(Button)`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
`;
