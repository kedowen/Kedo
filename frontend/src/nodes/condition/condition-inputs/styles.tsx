import styled from "styled-components";

export const ConditionPort = styled.div`
  position: absolute;
  right: -12px;
  top: 50%;
`;

// 条件分支
export const ConditionBranch = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  margin-bottom: 12px;
  width: 100%;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

export const InputLabel = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
`;

export const IfConditionBox = styled.div`
  border: 1px solid rgba(var(--semi-grey-2), .7);
  padding: 12px;
  border-radius: 4px;
  position: relative;
`;

export const ElseConditionBox = styled.div`
  border: 1px solid rgba(var(--semi-grey-2), .7);
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const ConditionContent = styled.div`
  margin-top: 12px;
`;

export const ConditionItem = styled.div`
  width: 100%;
  margin: 3px 0;
  
  position: relative;
`;

export const ConditionTitle = styled.div`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  font-weight: 600;
`;

// 条件
export const ConditionResultBox = styled.div`
  background-color: #eeeeee;
  padding: 8px;
  border-radius: 4px;
  box-sizing:border-box;
  overflow: hidden;
  height:40px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ConditionRelationBox = styled.div`
  display: block; /*设置为块级元素会独占一行形成上下居中的效果*/
  position: relative; /*定位横线（当横线的父元素）*/
  color: #188eee; /*居中文字的颜色*/
  text-align: center;
  :before,
  :after {
    content: "";
    position: absolute; /*定位背景横线的位置*/
    top: 50%;
    background: #8c8c8c; /*背景横线颜色*/
    width: 42%; /*单侧横线的长度*/
    height: 1px;
  }
  :before {
    left: 2px;
  }
  :after {
    right: 2px;
  }
`;
