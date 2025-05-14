import { useCallback, useState } from 'react';
import { SideSheet, Button } from '@douyinfe/semi-ui';

import {
  useService,
  WorkflowDocument,
  usePlayground,
  getAntiOverlapPosition,
  PositionSchema,
  WorkflowNodeEntity,
  WorkflowSelectService,
  useClientContext,
  getNodeForm,
  WorkflowLinesManager
} from '@flowgram.ai/free-layout-editor';
import { log } from 'console';

export interface FormFiledProps {
  name: string;
  type: string;
  value: any;
  required?: boolean;
}

export const useRun =  () => {
  const context = useClientContext();
  const linesManager = useService(WorkflowLinesManager);

  const isValid = useCallback(async () => {
    const document = context.document;
    // 获取所有连接的节点ID
    const connectedNodeIds = new Set<string>();
    const allLines = linesManager?.getAllLines() || [];
    
    // 通过连线收集所有连接的节点
    allLines.forEach(line => {
      const fromNode = line.fromPort?.node;
      const toNode = line.toPort?.node;
      
      if (fromNode) connectedNodeIds.add(fromNode.id);
      if (toNode) connectedNodeIds.add(toNode.id);
    });
    
    // 只验证连接的节点
    const allNodes = document.getAllNodes();
    const connectedNodes = allNodes.filter(node => connectedNodeIds.has(node.id));
    const connectedForms = connectedNodes.map(node => getNodeForm(node));
    
    const res = await Promise.all(connectedForms.map(async (form) => form?.validate()));
    return res.every((item) => item);
  }, [context, linesManager]);

  const getRunProperties =useCallback(():FormFiledProps[]|null =>{
    const document = context.document;
    const allForms = document.toJSON().nodes;
    console.log('allForms-->', allForms);
    //找到开始节点
    const startNode = allForms.find((form) => form?.type === "start");
    console.log(startNode);
    if (!startNode) {
      return null;
    }
    const properties = startNode.data.outputs.properties;
    console.log('propertiesList-->',properties)
    const propertiesList = Object.keys(properties).map((key) => {
      return {
        name: key,
        type: properties[key].type,
        value: properties[key].default,
        required: properties[key].extra?.required || false,
      }
    })
    return propertiesList;
  },[context]) 

  return {
    isValid,
    getRunProperties
  };
};
