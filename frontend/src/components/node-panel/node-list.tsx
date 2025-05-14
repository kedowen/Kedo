import React, { FC } from 'react';

import styled from 'styled-components';
import { NodePanelRenderProps } from '@flowgram.ai/free-node-panel-plugin';
import { useClientContext } from '@flowgram.ai/free-layout-editor';

import { FlowNodeRegistry } from '../../typings';
import { nodeRegistries } from '../../nodes';

const NodeWrap = styled.div`
  width: 100%;
  height: 32px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 19px;
  padding: 0 15px;
  &:hover {
    background-color: hsl(252deg 62% 55% / 9%);
    color: hsl(252 62% 54.9%);
  }
`;

const NodeLabel = styled.div`
  font-size: 12px;
  margin-left: 10px;
`;

interface NodeProps {
  label: string;
  icon: JSX.Element;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

function Node(props: NodeProps) {
  return (
    <NodeWrap
      onClick={props.onClick}
      style={{ display: 'flex', alignItems: 'center'}}
    >
      <div style={{ fontSize: 14 }}>{props.icon}</div>
      <NodeLabel>{props.label}</NodeLabel>
    </NodeWrap>
  );
}

const NodesWrap = styled.div`
  max-height: 500px;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

interface NodeListProps {
  onSelect: NodePanelRenderProps['onSelect'];
}

export const NodeList: FC<NodeListProps> = (props) => {
  const { onSelect } = props;
  const context = useClientContext();
  const handleClick = (e: React.MouseEvent, registry: FlowNodeRegistry) => {
    const json = registry.onAdd?.(context);
    onSelect({
      nodeType: registry.type as string,
      selectEvent: e,
      nodeJSON: json,
    });
  };
  return (
    <NodesWrap style={{ width: 80 * 2 }}>
      {nodeRegistries.map((registry) => {
        return (registry.canAdd?.(context) ?? true) && (
          <Node
            key={registry.type}
            icon={<img style={{ width: 20, height: 20, borderRadius: 4 }} src={registry.info.icon} />}
            label={registry.info.label as string}
            onClick={(e) => handleClick(e, registry)}
          />
        )
      })}
    </NodesWrap>
  );
};
