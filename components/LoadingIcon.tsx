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
  background: linear-gradient(0deg, #ccc 0%, #ccc 50%, #e7040f 50.1%, #e7040f 100%);
  background-size: 200% 200%;
  animation: 2.5s infinite linear ${TopAnimation};
`;

const BallCenter = styled.div`
  position: relative;
  width: 100%;
  height: 1rem;
  border-radius: 50%;
  background-color: #f0f0f0;
`;

const BallButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: #f0f0f0;
  transform: translate(-50%, -50%);
`;

const BallBottom = styled.div`
  width: 16rem;
  height: 8rem;
  border-radius: 0 0 8rem 8rem;
  background-color: #ccc;
  background: linear-gradient(0deg, #ccc 0%, #ccc 50%, #fff 50.1%, #fff 100%);
  background-size: 200% 200%;
  animation: 2.5s infinite linear ${BottomAnimation};
`;
