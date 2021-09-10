import React, { useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import { config, dom } from '@fortawesome/fontawesome-svg-core';

import 'react-tippy/dist/tippy.css';
import '../styles/globals.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { ApplicationContext, loadFromStorage, setDarkMode } from '../reducers/application/reducer';
import { useOnMount } from '../utils/hooks';
import { THEMES } from '../components/Layout';

config.autoAddCss = false;

function Ranger({ Component, pageProps }: AppProps): React.ReactElement {
  const { darkMode } = ApplicationContext.useState();
  const dispatch = ApplicationContext.useDispatch();

  const handleToggleDarkMode = useCallback(() => {
    dispatch(setDarkMode(!darkMode));
  }, [dispatch, darkMode]);

  useOnMount(() => dispatch(loadFromStorage()));

  return (
    <ThemeProvider theme={darkMode ? THEMES.dark : THEMES.light}>
      <Layout>
        <Head>
          <title>Pokémon Ranger</title>
          <link rel="shortcut icon" href="/favicon.png" />
          <meta charSet="UTF-8" />
          <style>{dom.css()}</style>
        </Head>
        <Header>
          <li>
            <Link href="/">Ranger</Link>
          </li>
          <li>
            <Link href="/sum">Damage Sum</Link>
          </li>
          <li>
            <Link href="/route">Routes</Link>
          </li>
          <li>
            <Link href="/lgpe-friendship">LGPE Friendship</Link>
          </li>
          <li>
            <Link href="/experience">Exp. Route Builder (BETA)</Link>
          </li>
          <RightAlignedActions>
            <ActionSet>
              <li>
                <a href="https://docs.ranger.maybreak.com/" target="_blank" rel="noopener noreferrer">Docs</a>
              </li>
              <DarkModeToggle active={darkMode}>
                <button type="button" onClick={handleToggleDarkMode}>
                  <FontAwesomeIcon icon={faMoon} />
                </button>
              </DarkModeToggle>
            </ActionSet>
          </RightAlignedActions>
        </Header>
        <Content>
          <Component {...pageProps} />
        </Content>
        <Footer>
          Created by <a href="https://twitter.com/Corvimae" target="_blank" rel="noreferrer">@Corvimae</a>.&nbsp;
          <a href="https://github.com/corvimae/pokemon-ranger" target="_blank" rel="noreferrer">View the source.</a>
        </Footer>
      </Layout>
    </ThemeProvider>
  );
}

export default ApplicationContext.connect(Ranger);

const Layout = styled.div`
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-rows: max-content 1fr max-content;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.foreground};
`;

const ActionSet = styled.ul`
  display: flex;
  flex-direction: row;
  height: 100%;
  padding: 0;
  margin: 0;
  list-style: none;

  & > li > a,
  & > li > button {
    display: block;
    padding: 1rem 1rem;
    height: 100%;
    font-weight: 700;
    cursor: pointer;
    border: none;
    background-color: transparent;
    border-radius: 0;
    margin: 0;

    &:hover,
    &:active {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }
`;

const Header = styled(ActionSet)`
  padding: 0 0 0 0.5rem;
  color: #fff;
  background-color: ${({ theme }) => theme.primary};
`;

const RightAlignedActions = styled.li`
  margin-left: auto;
  height: 100%;
`;

const DarkModeToggle = styled.li<{ active: boolean }>`
  && > button {
    background-color: ${({ active }) => active ? 'rgba(0, 0, 0, 0.25)' : 'transparent'};
    color: ${({ active }) => active ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.75)'};

    &:hover,
    &:active {
      background-color: ${({ active }) => active ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.25)'};
    }
  }
`;

const Content = styled.div`
  position: relative;
  overflow-y: auto;
`;

const Footer = styled.div`
  padding: 0.5rem 0.75rem;
  color: #fff;
  background-color: ${({ theme }) => theme.primary};

  & > a {
    color: #bceaf5;
  }
`;
