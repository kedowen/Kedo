import { FlowNodeRegistry } from '../typings';
import { StartNodeRegistry } from './start';
import { LoopNodeRegistry } from './loop';
import { LLMNodeRegistry } from './llm';
import { EndNodeRegistry } from './end';
import { ConditionNodeRegistry } from './condition';
import { EmailNodeRegistry } from './email';
import { WechatWorkNodeRegistry } from './wechat_work';
import { HttpRequestNodeRegistry } from './http_request';
import { CodeNodeRegistry } from './code';
import { ImageGenerationNodeRegistry } from './image_generation';
import { sqlExecutorNode } from './sql_executor';
import { KnowledgeBaseNodeRegistry } from './knowledge_base';
// import { GlobalNodeRegistry } from './global';
import { MCPNodeRegistry } from './mcp';

export const nodeRegistries: FlowNodeRegistry[] = [
  ConditionNodeRegistry,
  StartNodeRegistry,
  EndNodeRegistry,
  LLMNodeRegistry,
  LoopNodeRegistry,
  EmailNodeRegistry,
  WechatWorkNodeRegistry,
  HttpRequestNodeRegistry,
  CodeNodeRegistry,
  ImageGenerationNodeRegistry,
  sqlExecutorNode,
  KnowledgeBaseNodeRegistry,
  // GlobalNodeRegistry,
  MCPNodeRegistry
];
