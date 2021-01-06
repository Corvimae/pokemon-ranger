import React from 'react';
import { RouteContext } from '../../reducers/route/reducer';

export const RouteImage: React.FC<React.HTMLProps<HTMLImageElement>> = ({ src, alt }) => {
  const { repoPath } = RouteContext.useState();
  const imgPath = src?.startsWith('http') ? src : `${repoPath}/assets/${src}`;

  return <img alt={alt} src={imgPath} />;
};
