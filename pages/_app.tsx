import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Link from 'next/link';
import { AppProps } from 'next/dist/next-server/lib/router/router';

import '../styles/globals.css';

function Ranger({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <Layout>
      <Head>
        <title>Pokémon Ranger</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>
      <Header>
        <li>
          <Link href="/">Ranger</Link>
        </li>
        <li>
          <Link href="/sum">Damage Sum</Link>
        </li>
      </Header>
      <Content>
        <Component {...pageProps} />
      </Content>
      <Footer>
        Created by <a href="https://twitter.com/Corvimae" target="_blank" rel="noreferrer">@Corvimae</a>.&nbsp;
        <a href="https://github.com/corvimae/pokemon-ranger" target="_blank" rel="noreferrer">View the source.</a>
      </Footer>
    </Layout>
  );
}

export default Ranger;

const Layout = styled.div`
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-rows: max-content 1fr max-content;
`;

const Header = styled.ul`
  display: flex;
  flex-direction: row;
  padding: 0;
  margin: 0;
  padding: 0 0.5rem;
  color: #fff;
  background-color: #30b878;
  list-style: none;

  & > li > a {
    display: block;
    padding: 1rem 1rem;
    font-weight: 700;
    cursor: pointer;

    &:hover,
    &:active {
      background-color: rgba(255, 255, 255, 0.25);
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
  background-color: #30b878;

  & > a {
    color: #bceaf5;
  }
`;
