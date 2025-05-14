import { Button, Collapse } from "@douyinfe/semi-ui";
import styled from "styled-components";
export const TypeLabel = styled.div`
  color: #000;
  font-size: 12px;
  border-radius: 4px;
  padding: 2px 4px;
  margin-left: 4px;
  background-color: #f0f0f0;
`;

// 为结果显示创建一个独立的样式组件，不依赖于NodeWrapper
export const ResultDisplayContainer = styled.div`
  width: 100%;
  border-radius: 12px;
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
`;

export const ResultDisplayItem = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  max-height: 200px;
  overflow: auto;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f2f2f2;
  }
`;

export const ResultSectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid #22c55e;
  display: flex;
  align-items: center;
`;

export const ResultKeyValue = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 6px;
  background-color: white;
  border-left: 2px solid #e6f7ff;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background-color: #f0f7ff;
    border-left: 2px solid #1890ff;
  }
`;

export const ResultKey = styled.span`
  font-weight: 600;
  color: #444;
  margin-right: 8px;
  white-space: wrap;
  user-select: text;
`;

export const ResultValue = styled.span`
  color: #333;
  word-break: break-word;
  flex: 1;
  user-select: text;
  padding-right: 40px; /* 为预览按钮留出空间 */
`;

export const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  background: linear-gradient(to right, #f9f9f9, #ffffff);
  border-radius: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #eaeaea;
`;

export const ResultTitle = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;

  &::before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: #4caf50;
    border-radius: 50%;
    margin-right: 8px;
  }
`;

export const PreviewButton = styled(Button)`
  position: absolute;
  right: 0;
  top: 0;
  &:hover {
    background-color: #f0f7ff;
  }
`;

// 自定义 Collapse 样式
export const StyledCollapse = styled(Collapse)`
  .semi-collapse-header {
    padding: 12px 8px;
    transition: all 0.2s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }

  /* 自定义展开/折叠图标 */
  .semi-collapse-arrow {
    transition: transform 0.2s;
  }

  .semi-collapse-item-inactive .semi-collapse-arrow {
    transform: rotate(-90deg);
  }

  /* 改进面板样式 */
  .semi-collapse-item {
    margin-bottom: 10px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #f0f0f0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .semi-collapse-content-wrapper {
    background-color: #fafafa;
  }
`;

export const ConfigBtnContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 6px 12px;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
  display: flex;
  gap: 6px;
  align-items: center;

  :hover {
    cursor: pointer;
    border-color: #1e9cff;
    color: #1e9cff;
    box-shadow: 0 2px 12px rgba(30, 156, 255, 0.1);
  }
`;
