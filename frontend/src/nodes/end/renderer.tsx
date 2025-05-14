import React, { useState, useEffect } from 'react';
import { Typography, Table, Badge, Card, Button, Notification } from '@douyinfe/semi-ui';
import { IconChevronDown, IconChevronUp, IconRefresh } from '@douyinfe/semi-icons';
import { FlowNodeJSON } from '../../typings';
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';

const { Text, Paragraph } = Typography;

// 全局结果存储，用于在组件间共享数据
declare global {
  interface Window {
    __END_NODE_RESULT__?: any;
  }
}

// 结果格式化显示组件
const ResultDisplay = ({ result }: { result: any }) => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  if (!result) return null;
  
  // 获取结果状态
  const status = result.status || 'success';
  const isSuccess = status === 'success';
  
  // 显示带时间戳的状态信息
  const getStatusDisplay = () => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Badge 
            type={isSuccess ? 'success' : 'danger'} 
            count={isSuccess ? t('nodes.end.resultDisplay.executionSuccess') : t('nodes.end.resultDisplay.executionFailure')} 
            style={{ marginRight: 8 }} 
          />
          {result.responseTime && (
            <Text type="tertiary" size="small">{t('nodes.end.resultDisplay.responseTime')}: {result.responseTime}</Text>
          )}
        </div>
        {result.timestamp && (
          <Text type="tertiary" size="small">{new Date(result.timestamp).toLocaleString()}</Text>
        )}
      </div>
    );
  };

  // 格式化结果数据
  const getResultData = () => {
    if (result.result) {
      if (typeof result.result === 'string') {
        return <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{result.result}</Paragraph>;
      }
      
      if (typeof result.result === 'object') {
        try {
          // 对象结果以表格展示
          const columns = [
            { title: t('nodes.end.resultDisplay.field'), dataIndex: 'key' },
            { title: t('nodes.end.resultDisplay.value'), dataIndex: 'value' },
          ];
          
          const data = Object.entries(result.result).map(([key, value]) => ({
            key,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value)
          }));
          
          return (
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              size="small"
              style={{ marginTop: 8 }}
            />
          );
        } catch (error) {
          return <Paragraph type="danger">{t('nodes.end.resultDisplay.unableToDisplayResult')}: {String(error)}</Paragraph>;
        }
      }
    }
    
    // 处理错误信息
    if (result.error) {
      return <Paragraph type="danger">{result.error}</Paragraph>;
    }
    
    // 显示整个结果对象
    try {
      const formattedJson = JSON.stringify(result, null, 2);
      return (
        <div style={{ position: 'relative' }}>
          <pre style={{ 
            overflow: 'auto', 
            maxHeight: expanded ? 'none' : '150px',
            backgroundColor: '#f5f5f5',
            padding: 12,
            borderRadius: 4,
            fontSize: 12
          }}>
            {formattedJson}
          </pre>
          {formattedJson.length > 300 && (
            <Button 
              theme="borderless" 
              type="tertiary" 
              size="small"
              style={{ position: 'absolute', bottom: 4, right: 4 }}
              onClick={() => setExpanded(!expanded)}
              icon={expanded ? <IconChevronUp /> : <IconChevronDown />}
            >
              {expanded ? t('nodes.end.resultDisplay.collapse') : t('nodes.end.resultDisplay.expand')}
            </Button>
          )}
        </div>
      );
    } catch (error) {
      return <Paragraph type="danger">{t('nodes.end.resultDisplay.unableToParseResult')}: {String(error)}</Paragraph>;
    }
  };

  return (
    <div>
      {getStatusDisplay()}
      {getResultData()}
      {result.executionId && (
        <Text type="tertiary" size="small" style={{ display: 'block', marginTop: 8 }}>
          {t('nodes.end.resultDisplay.executionId')}: {result.executionId}
        </Text>
      )}
    </div>
  );
};

// 结果显示容器组件 - 简化版，直接从全局变量读取数据
class ResultContainer extends React.Component {
  state = {
    result: null,
    hasResult: false
  };
  
  intervalId: any = null;
  
  componentDidMount() {
    console.log('[ResultContainer] 组件挂载');
    
    // 初始化时检查全局变量
    this.checkGlobalResult();
    
    // 设置定时器定期检查全局变量
    this.intervalId = setInterval(() => {
      this.checkGlobalResult();
    }, 500);
    
    // 尝试监听事件
    window.addEventListener('end-node-result-update', this.handleResultUpdate);
    document.addEventListener('end-node-result-update', this.handleResultUpdate);
  }
  
  componentWillUnmount() {
    // 清理定时器和事件监听
    if (this.intervalId) clearInterval(this.intervalId);
    window.removeEventListener('end-node-result-update', this.handleResultUpdate);
    document.removeEventListener('end-node-result-update', this.handleResultUpdate);
  }
  
  checkGlobalResult = () => {
    const globalResult = window.__END_NODE_RESULT__;
    if (globalResult && JSON.stringify(globalResult) !== JSON.stringify(this.state.result)) {
      console.log('[ResultContainer] 检测到全局结果变化:', globalResult);
      this.setState({ 
        result: globalResult,
        hasResult: true  // 标记已有结果
      });
    }
  };
  
  handleResultUpdate = (event: any) => {
    console.log('[ResultContainer] 收到结果更新事件:', event.detail);
    if (event.detail) {
      this.setState({ 
        result: event.detail,
        hasResult: true  // 标记已有结果
      });
    }
  };
  
  handleRefresh = () => {
    this.checkGlobalResult();
    Notification.info({
      content: i18n.t('nodes.end.resultDisplay.refreshed'),
      duration: 2,
    });
  };
  
  render() {
    const { result, hasResult } = this.state;
    
    // 调试：始终显示卡片，移除条件隐藏
    // if (!hasResult && !window.__END_NODE_RESULT__) {
    //   return null;
    // }
    
    // 获取当前全局变量值用于调试
    const globalResult = window.__END_NODE_RESULT__;
    
    const defaultResult = {
      status: 'info',
      result: { 
        message: i18n.t('nodes.end.resultDisplay.waitingForResult'),
        note: '点击Save按钮执行流程',
        调试信息: 'ResultContainer正在渲染',
        当前时间: new Date().toLocaleString()
      },
      timestamp: new Date().toISOString(),
    };
    
    // 使用强制显示的结果
    const displayResult = result || globalResult || defaultResult;
    
    return (
      <>
        <div style={{ padding: 8, margin: '4px 0', backgroundColor: '#e6f7ff', borderRadius: 4 }}>
          <Text>{i18n.t('nodes.end.resultDisplay.debugStatus')}：{hasResult ? i18n.t('nodes.end.resultDisplay.receivedResult') : i18n.t('nodes.end.resultDisplay.noResult')}</Text>
          <br />
          <Text>{i18n.t('nodes.end.resultDisplay.globalVarSet')}：{globalResult ? i18n.t('nodes.end.resultDisplay.globalVarSet') : i18n.t('nodes.end.resultDisplay.globalVarNotSet')}</Text>
        </div>
        <Card
          style={{ 
            marginTop: 16, 
            width: '100%',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}
          bodyStyle={{ padding: 16 }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>{i18n.t('nodes.end.resultDisplay.executionResult')}</Text>
              <Button 
                icon={<IconRefresh />} 
                size="small" 
                theme="borderless" 
                onClick={this.handleRefresh}
              />
            </div>
          }
        >
          <ResultDisplay result={displayResult} />
        </Card>
      </>
    );
  }
}

// 结束节点渲染器
export const EndNodeRenderer = (props: any) => {
  const { renderNode } = props;
  
  console.log('[EndNodeRenderer] 渲染开始', props);
  
  // 首先渲染原始节点
  const originalNode = renderNode(props);
  
  // 为了调试，始终显示结果区域
  const debugResult = {
    status: 'success',
    result: { 
      message: '调试结果显示', 
      test: '测试数据',
      随机值: Math.random().toString()
    },
    timestamp: new Date().toISOString(),
    executionId: 'debug-exec-id',
    responseTime: '123ms'
  };
  
  // 强制显示调试结果
  window.__END_NODE_RESULT__ = window.__END_NODE_RESULT__ || debugResult;
  
  // 创建包含结果显示的节点
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {originalNode}
      <div style={{ padding: '4px', margin: '8px 0', background: '#f0f0f0', borderRadius: '4px' }}>
        <Text>调试信息: EndNodeRenderer已调用</Text>
      </div>
      <ResultContainer />
    </div>
  );
}; 