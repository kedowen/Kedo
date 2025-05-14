import styled from 'styled-components';

export const Row = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  width: 100%;
`;

export const LeftColumn = styled.div`
  flex: 1;
  position: relative;
  margin-right: 8px;
`;

export const RequiredBadge = styled.span`
  color: #f5222d;
  font-size: 16px;
  margin-left: 4px;
  line-height: 1;
`;

export const Label = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 4px;
`;

export const PropertyContainer = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background: white;
  
  &:hover {
    border-color: #d9d9d9;
  }
`;
