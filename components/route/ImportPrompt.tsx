import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { OptionsType, OptionTypeBase } from 'react-select';
import AsyncSelect from 'react-select/async';
import { Button } from '../Button';
import { InputRow, Link } from '../Layout';
import { loadFile, RouteContext, setRepoPath } from '../../reducers/route/reducer';
import { LoadingIcon } from '../LoadingIcon';
import { CENTRAL_ROUTE_REPO_PREFIX, isElectron, normalizeRouteLocation } from '../../utils/utils';
import { RouteDropdownOption, RouteMetadata } from './RouteSelectorComponents';
import { useDebounce } from '../../utils/hooks';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    electronAPI: {
      openRoute: (file: string) => void;
      closeRoute: () => void;
      onRouteUpdate: (callback: (event: unknown, contents: string[]) => void) => void;
    }
  }
}

function getBaseRouteURL(): string {
  return `${isElectron() ? 'https://ranger.maybreak.com/' : '/'}api/routes`;
}
interface ImportPromptProps {
  repoQueryParam?: string;
  error?: string;
  hasAttemptedQueryParamLoad: boolean;
  setFileContent: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveRouteMetadata: React.Dispatch<React.SetStateAction<RouteMetadata | null>>;
  onInitialLoad: () => void;
}

const ROUTE_SELECTOR_COMPONENT_OVERRIDES = { Option: RouteDropdownOption };

export const ImportPrompt: React.FC<ImportPromptProps> = ({
  error,
  repoQueryParam,
  hasAttemptedQueryParamLoad,
  setFileContent,
  setActiveRouteMetadata,
  onInitialLoad,
}) => {
  const router = useRouter();
  const dispatch = RouteContext.useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [fileSelectError, setFileSelectError] = useState<string | null>(null);
  const [publishedImportPath, setPublishedImportPath] = useState<OptionsType<OptionTypeBase> | null>();
  const [repoImportPath, setRepoImportPath] = useState<string>('');
  const hasAttachedElectronListener = useRef<boolean>(false);

  const handleSetRepoImportPath = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRepoImportPath(event.target.value);
  }, []);

  const handleSetPublishedImportPath = useCallback((value: OptionsType<OptionTypeBase>) => {
    setPublishedImportPath(value);
  }, []);

  const loadPublishedRoutes = useCallback((inputValue: string, callback: (options: OptionsType<OptionTypeBase>) => void) => {
    const lowerCaseInput = inputValue.toLowerCase();
    fetch(`${getBaseRouteURL()}?query=${encodeURIComponent(lowerCaseInput)}`).then(async response => {
      if (response.status === 200) {
        callback((await response.json()) as OptionsType<OptionTypeBase>);
      } else {
        setFileSelectError('Could not query ranger-routes; is GitHub down?');
      }
    });
  }, []);

  const debouncedLoadPublishedRoutes = useDebounce(loadPublishedRoutes, 200);

  const handleImportFromGithub = useCallback((repoPath: string, isFullPath = false) => {
    dispatch(loadFile());
    setIsLoading(true);

    const path = normalizeRouteLocation(isFullPath ? repoPath : `https://raw.githubusercontent.com/${repoPath}/route.mdr`);

    fetch(path)
      .then(async response => {
        if (response.status === 200) {
          setFileContent(await response.text());
          if (publishedImportPath) setActiveRouteMetadata((publishedImportPath as unknown) as RouteMetadata);
          setFileSelectError(null);
          dispatch(setRepoPath(path));
     
          router.push(
            {
              pathname: router.pathname,
              query: {
                repo: isFullPath ? repoPath : path,
              },
            },
            undefined,
            { shallow: true },
          );
        } else {
          setFileContent(null);
          setFileSelectError(`Unable to load route file: ${response.statusText}`);
        }

        setIsLoading(false);
      })
      .catch(() => {
        setFileContent(null);
        setFileSelectError('Unable to find a route file at the specified URL.');
        setIsLoading(false);
      });
  }, [dispatch, setFileContent, router, publishedImportPath, setActiveRouteMetadata]);

  const handlePublishedImport = useCallback(() => {
    if (publishedImportPath) {
      handleImportFromGithub(`${CENTRAL_ROUTE_REPO_PREFIX}${(publishedImportPath as OptionTypeBase).path}`, true);
    }
  }, [publishedImportPath, handleImportFromGithub]);

  const handleImportFromRepo = useCallback(() => {
    handleImportFromGithub(`${repoImportPath}/main`);
  }, [repoImportPath, handleImportFromGithub]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 1) {
      setFileContent(null);
      setFileSelectError('Only one route file may be selected at a time.');

      return;
    }

    if (acceptedFiles.length === 0) {
      setFileContent(null);
      setFileSelectError('An unknown issue occurred trying to load the file.');

      return;
    }

    const [acceptedFile] = acceptedFiles;

    if (!acceptedFile.name.endsWith('.md') && !acceptedFile.name.endsWith('.mdr')) {
      setFileContent(null);
      setFileSelectError('Route files must end in .md or .mdr');

      return;
    }

    dispatch(loadFile());
    setFileContent(null);

    const reader = new FileReader();

    if (isElectron()) {
      window.electronAPI.openRoute(((acceptedFile as unknown) as { path: string }).path);
    }

    reader.onabort = () => {
      setFileContent(null);
      setFileSelectError('The file read process was aborted.');
    };

    reader.onerror = () => {
      setFileContent(null);
      setFileSelectError('An unknown issue occurred trying to load the file. The file may be corrupted.');
    };

    reader.onload = () => {
      setFileContent(reader.result?.toString() ?? null);
      setFileSelectError(null);
    };

    reader.readAsText(acceptedFile);
  }, [dispatch, setFileContent]);

  useEffect(() => {
    if (!hasAttemptedQueryParamLoad) {
      if (repoQueryParam) {
        handleImportFromGithub(repoQueryParam, true);
      }

      onInitialLoad();
    }
  }, [repoQueryParam, handleImportFromGithub, onInitialLoad, hasAttemptedQueryParamLoad]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: true,
    multiple: false,
  });

  useEffect(() => {
    if (!isElectron() || hasAttachedElectronListener.current) return;
    
    window.electronAPI.onRouteUpdate((event, contents) => {
      setFileContent(contents[0]);
    });

    hasAttachedElectronListener.current = true;
  }, [setFileContent]);
  
  return isLoading ? <LoadingIcon /> : (
    <Container {...getRootProps()} tabIndex={-1}>
      <input {...getInputProps()} />
      <UploadMessage>

        Drag a .mdr or .md file onto this page to start.

        {(error || fileSelectError) && (
          <ErrorMessage>
            {error || fileSelectError}
          </ErrorMessage>
        )}

        <OrDivider>or</OrDivider>
        <RepoSourceContainer>
          Load a published route
          <RepoInputContainer>
            <RouteSelector
              onChange={handleSetPublishedImportPath}
              loadOptions={debouncedLoadPublishedRoutes}
              components={ROUTE_SELECTOR_COMPONENT_OVERRIDES}
              value={publishedImportPath}
              getOptionLabel={(item: RouteMetadata) => item.title ?? item.path}
              getOptionValue={(item: RouteMetadata) => item.path}
              classNamePrefix="route-selector"
              cacheOptions
              defaultOptions
            />
            <Button onClick={handlePublishedImport}>Load</Button>
          </RepoInputContainer>
        </RepoSourceContainer>
        <Link
          href="https://github.com/Corvimae/ranger-routes/tree/main"
          target="_blank"
          rel="noreferrer"
        >
          Publish your route!
        </Link>
        <OrDivider>or</OrDivider>
        
        <RepoSourceContainer>
          Load from a repo
          <RepoInputContainer>
            <input type="text" value={repoImportPath} onChange={handleSetRepoImportPath} />
            <Button onClick={handleImportFromRepo}>Load</Button>
          </RepoInputContainer>
        </RepoSourceContainer>
      </UploadMessage>
      <DocsLink
        href="https://docs.ranger.maybreak.com/#/routefiles"
        target="_blank"
        rel="noreferrer"
      >
        Learn to write your own route!
      </DocsLink>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
`;

const UploadMessage = styled.div`
  position: absolute;
  width: 100%;
  top: 50%;
  left: 50%;
  padding: 0 8rem;
  text-align: center;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.label};
  font-weight: 700;
  transform: translate(-50%, -50%);
  z-index: 2;
`;

const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.error};
  font-size: 1.125rem;
`;

const OrDivider = styled.div`
  position: relative;
  margin: 0.5rem 0;

  &:before {
    content: '';
    position: absolute;
    top: 0.825rem;
    left: 25%;
    width: 20%;
    border-top: 1px solid ${({ theme }) => theme.input.border};
  }

  &:after {
    content: '';
    position: absolute;
    top: 0.825rem;
    width: 20%;
    left: 55%;
    border-top: 1px solid ${({ theme }) => theme.input.border};
  }
`;

const RepoSourceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RouteSelector = styled(AsyncSelect)`
  & > .route-selector__control {
    background-color: ${({ theme }) => theme.input.background};
    color: ${({ theme }) => theme.input.foreground};
    border-color: ${({ theme }) => theme.input.border};
  }

  & .route-selector__value-container div {
    color: ${({ theme }) => theme.input.foreground};
  }

  & .route-selector__indicator-separator {
    background-color: ${({ theme }) => theme.input.border};
  }

  & .route-selector__menu {
    background-color: ${({ theme }) => theme.input.background};
    z-index: 99;
  }

  & .route-selector__option--is-focused {
    background-color: ${({ theme }) => theme.backgroundSelected};
  }
`;

const RepoInputContainer = styled(InputRow)`
  && {
    display: flex;
    margin-top: 1rem;
    justify-content: center;
  }

  & ${Button} {
    margin-left: 1rem;
  }

  & > input,
  & > ${RouteSelector} {
    width: 24rem;
    margin-bottom: 0;
    font-weight: 400;
    font-size: 1rem;
  }
`;

const DocsLink = styled(Link)`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  font-weight: 700;
  transform: translate(-50%, 0);
  z-index: 0;
`;
