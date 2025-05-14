import styled from 'styled-components';

export const Header = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  column-gap: 10px;
  border-radius: 8px 8px 0 0;
  // cursor: move;

  background: linear-gradient(to bottom, #f9f9ff 0%, rgba(248, 248, 255, 0.8) 100%);
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 10px 12px;
  min-height: 46px;
`;

export const Title = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 28px;
  position: relative;
  margin: 0 2px;
`;

export const Icon = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const Operators = styled.div`
  display: flex;
  align-items: center;
  column-gap: 6px;
  flex-shrink: 0;
  padding-left: 4px;
`;
