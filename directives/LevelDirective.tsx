import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { InlineInfo } from '../components/route/InlineInfo';
import { logRouteError, RouteContext, setLevelIncrementLine } from '../reducers/route/reducer';

interface LevelDirectiveProps {
  source?: string;
  position: string;
  line: string;
  value?: string;
}

export const LevelDirective: React.FC<LevelDirectiveProps> = ({ source, position, line, value }) => {
  const state = RouteContext.useState();
  const dispatch = RouteContext.useDispatch();
  const hasEvaluated = useRef(false);

  useEffect(() => {
    if (!hasEvaluated.current && Object.values(state.trackers).length) {
      if (!source) {
        dispatch(logRouteError('Level directives require the source attribute.', position));
        hasEvaluated.current = true;

        return;
      }

      if (!value) {
        dispatch(logRouteError('Level directives require the value attribute.', position));
        hasEvaluated.current = true;

        return;
      }

      const valueAsNumber = Number(value);

      if (Number.isNaN(valueAsNumber)) {
        dispatch(logRouteError(`${value} is not a number.`, position));
        hasEvaluated.current = true;

        return;
      }

      if (state.trackers[source]) {
        dispatch(setLevelIncrementLine(source, valueAsNumber, Number(line)));
      } else {
        dispatch(logRouteError(`No IV table with the name ${source} exists.`, position));
      }

      hasEvaluated.current = true;
    }
  });

  return (
    <Container color="gray">
      <i>Level {value}</i>
    </Container>
  );
};

const Container = styled(InlineInfo)`
  margin-left: 0;
`;
