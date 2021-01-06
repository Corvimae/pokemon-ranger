import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { OptionsType, OptionTypeBase } from 'react-select';
import AsyncSelect from 'react-select/async';
import { Button } from '../Button';
import { InputRow } from '../Layout';
import { loadFile, RouteContext, setRepoPath } from '../../reducers/route/reducer';
import { LoadingIcon } from '../LoadingIcon';

interface ImportPromptProps {
  repoQueryParam?: string;
  error?: string;
  hasAttemptedQueryParamLoad: boolean;
  setFileContent: React.Dispatch<React.SetStateAction<string | null>>;
  onInitialLoad: () => void;
}

export const ImportPrompt: React.FC<ImportPromptProps> = ({
  error,
  repoQueryParam,
  hasAttemptedQueryParamLoad,
  setFileContent,
  onInitialLoad,
}) => {
  const router = useRouter();
  const dispatch = RouteContext.useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [fileSelectError, setFileSelectError] = useState<string | null>(null);
  const [publishedImportPath, setPublishedImportPath] = useState<OptionsType<OptionTypeBase> | null>();
  const [repoImportPath, setRepoImportPath] = useState<string>('');

  const handleSetRepoImportPath = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRepoImportPath(event.target.value);
  }, []);

  const handleSetPublishedImportPath = useCallback((value: OptionsType<OptionTypeBase>) => {
    setPublishedImportPath(value);
  }, []);

  const loadPublishedRoutes = useCallback((inputValue: string, callback: (options: OptionsType<OptionTypeBase>) => void) => {
    const lowerCaseInput = inputValue.toLowerCase();
    fetch('https://api.github.com/repos/Corvimae/ranger-routes/git/trees/main').then(response => {
      if (response.status === 200) {
        response.json().then(({ tree }) => {
          callback(
            (tree as { path: string; type: string; }[])
              .filter(({ path }) => lowerCaseInput.length === 0 || path.toLowerCase().indexOf(lowerCaseInput) !== -1)
              .filter(({ type }) => type === 'tree')
              .map(({ path }) => ({ label: path, value: path })),
          );
        });
      } else {
        setFileSelectError('Could not query ranger-routes; is GitHub down?');
      }
    });
  }, []);

  const handleImportFromGithub = useCallback((repoPath: string, isFullPath = false) => {
    dispatch(loadFile());
    setIsLoading(true);

    const path = isFullPath ? repoPath : `https://raw.githubusercontent.com/${repoPath}/route.mdr`;

    fetch(path)
      .then(async response => {
        if (response.status === 200) {
          setFileContent(await response.text());
          setFileSelectError(null);
          dispatch(setRepoPath(path));
     
          router.push(
            {
              pathname: router.pathname,
              query: {
                repo: encodeURIComponent(path),
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
      });
  }, [dispatch, setFileContent, router]);

  const handlePublishedImport = useCallback(() => {
    if (publishedImportPath) {
      handleImportFromGithub(`Corvimae/ranger-routes/main/${(publishedImportPath as OptionTypeBase).value}`);
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

    reader.readAsBinaryString(acceptedFile);
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
              loadOptions={loadPublishedRoutes}
              cacheOptions
              defaultOptions
            />
            <Button onClick={handlePublishedImport}>Load</Button>
          </RepoInputContainer>
        </RepoSourceContainer>
        <PublishRequestLink
          href="https://github.com/Corvimae/ranger-routes/tree/main"
          target="_blank"
          rel="noreferrer"
        >
          Publish your route!
        </PublishRequestLink>
        <OrDivider>or</OrDivider>
        
        <RepoSourceContainer>
          Load from a repo
          <RepoInputContainer>
            <input type="text" value={repoImportPath} onChange={handleSetRepoImportPath} />
            <Button onClick={handleImportFromRepo}>Load</Button>
          </RepoInputContainer>
        </RepoSourceContainer>
      </UploadMessage>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const UploadMessage = styled.div`
  position: absolute;
  width: 100%;
  top: 50%;
  left: 50%;
  padding: 0 8rem;
  text-align: center;
  font-size: 1.25rem;
  color: #666;
  font-weight: 700;
  transform: translate(-50%, -50%);
`;

const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  color: #900;
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
    border-top: 1px solid #999;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0.825rem;
    width: 20%;
    left: 55%;
    border-top: 1px solid #999;
  }
`;

const RepoSourceContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RouteSelector = styled(AsyncSelect)``;

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
    width: 16rem;
    margin-bottom: 0;
    font-weight: 400;
    font-size: 1rem;
  }
`;

const PublishRequestLink = styled.a`
  font-size: 0.825rem;
  margin-top: 0.5rem;
  color: #5c95e0;
`;
