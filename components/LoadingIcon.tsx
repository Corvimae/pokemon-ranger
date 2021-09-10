import React from 'react';
import styled, { keyframes } from 'styled-components';

export const LoadingIcon: React.FC = () => (
  <Container>
    <BallTop />
    <BallCenter>
      <BallButton />
    </BallCenter>
    <BallBottom />
  </Container>
);

const TopAnimation = keyframes`
  0%, 38% {
    background-position: 0 -100%
  }
  63% {
    background-position: 0 0;
  }
`;

const BottomAnimation = keyframes`
  0% {
    background-position: 0 -100%
  }
  33% {
    background-position: 0 0;
  }
`;

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const BallTop = styled.div`
  width: 16rem;
  height: 8rem;
  border-radius: 8rem 8rem 0 0;
  background: ${({ theme }) => `linear-gradient(0deg, ${theme.backgroundSelected} 0%, ${theme.backgroundSelected} 50%, ${theme.error} 50.1%, ${theme.error} 100%)`};
  background-size: 200% 200%;
  animation: 2.5s infinite linear ${TopAnimation};
`;

const BallCenter = styled.div`
  position: relative;
  width: 100%;
  height: 1rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.background};
`;

const BallButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.background};
  transform: translate(-50%, -50%);
`;

const BallBottom = styled.div`
  width: 16rem;
  height: 8rem;
  border-radius: 0 0 8rem 8rem;
  background-color: ${({ theme }) => theme.backgroundSelected};
  background: ${({ theme }) => `linear-gradient(0deg, ${theme.backgroundSelected} 0%, ${theme.backgroundSelected} 50%, ${theme.backgroundDarkened} 50.1%, ${theme.backgroundDarkened} 100%)`};
  background-size: 200% 200%;
  animation: 2.5s infinite linear ${BottomAnimation};
`;
