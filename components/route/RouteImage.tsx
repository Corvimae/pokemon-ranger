import React from 'react';
import { RouteContext } from '../../reducers/route/reducer';
import { normalizeRouteLocation } from '../../utils/utils';

export const RouteImage: React.FC<React.HTMLProps<HTMLImageElement>> = ({ src, alt }) => {
  const { repoPath } = RouteContext.useState();
  const normalizedSrc = src ? normalizeRouteLocation(src).replace('route.mdr', '') : null;

  const imgPath = normalizedSrc?.startsWith('http') ? normalizedSrc : `${repoPath}/assets/${normalizedSrc}`;

  return <img alt={alt} src={imgPath} />;
};
