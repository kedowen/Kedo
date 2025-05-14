import React from 'react';
import { Typography, Card, Table, Badge, Notification } from '@douyinfe/semi-ui';
import { IconRefresh } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';

const { Text, Paragraph } = Typography;

// 声明全局变量类型
declare global {
  interface Window {
    __END_NODE_RESULT__?: any;
  }
}

interface ResultDisplayState {
  result: any;
  hasResult: boolean;
}

export class ResultDisplay extends React.Component<{}, ResultDisplayState> {
  state: ResultDisplayState = {
    result: null,
    hasResult: false
  };

  intervalId: NodeJS.Timeout | null = null;

  componentDidMount() {
    console.log('[ResultDisplay] 组件挂载');
    
    // 初始化检查
    this.checkGlobalResult();
    
    // 设置定时器
    this.intervalId = setInterval(() => {
      this.checkGlobalResult();
    }, 500);
    
    // 设置事件监听
    window.addEventListener('end-node-result-update', this.handleResultUpdate as EventListener);
  }
  
  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    window.removeEventListener('end-node-result-update', this.handleResultUpdate as EventListener);
  }
  
  checkGlobalResult = () => {
    const result = window.__END_NODE_RESULT__;
    if (result && JSON.stringify(result) !== JSON.stringify(this.state.result)) {
      console.log('[ResultDisplay] 发现全局结果:', result);
      this.setState({ 
        result,
        hasResult: true
      });
    }
  };
  
  handleResultUpdate = (event: CustomEvent) => {
    console.log('[ResultDisplay] 收到结果更新事件:', event.detail);
    if (event.detail) {
      this.setState({
        result: event.detail,
        hasResult: true
      });
    }
  };
  
  handleRefresh = () => {
    this.checkGlobalResult();
    Notification.info({
      content: i18n.t('nodes.end.resultDisplay.refreshed'),
      duration: 2
    });
  };
  
  renderContent() {
    const { result } = this.state;
    if (!result) return null;
    
    // 简单的key-value文本展示
    if (typeof result === 'object' && result.result) {
      const resultData = result.result;
      
      return (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Badge 
              count={result.status === 'success' ? i18n.t('nodes.end.resultDisplay.executionSuccess') : i18n.t('nodes.end.resultDisplay.executionFailure')} 
              type={result.status === 'success' ? 'success' : 'danger'} 
            />
            {result.timestamp && (
              <Text type="tertiary" size="small">{new Date(result.timestamp).toLocaleString()}</Text>
            )}
          </div>
          
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '4px',
            border: '1px solid #f0f0f0',
            fontSize: '14px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {typeof resultData === 'string' 
              ? resultData 
              : Object.entries(resultData).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '8px' }}>
                  <Text strong>{key}: </Text>
                  <Text>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Text>
                </div>
              ))
            }
          </div>
          
          {result.executionId && (
            <Text type="tertiary" size="small" style={{ display: 'block', marginTop: 8 }}>
              {i18n.t('nodes.end.resultDisplay.executionId')}: {result.executionId}
            </Text>
          )}
        </>
      );
    }
    
    return <pre>{JSON.stringify(result, null, 2)}</pre>;
  }
  
  render() {
    const { hasResult } = this.state;
    
    if (!hasResult && !window.__END_NODE_RESULT__) {
      return (
        <Card style={{ marginTop: 16 }}>
          <Text type="tertiary">{i18n.t('nodes.end.resultDisplay.waitingForResult')}</Text>
        </Card>
      );
    }
    
    return (
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>{i18n.t('nodes.end.resultDisplay.executionResult')}</Text>
            <IconRefresh 
              style={{ cursor: 'pointer' }} 
              onClick={this.handleRefresh}
            />
          </div>
        }
        style={{ marginTop: 16 }}
      >
        {this.renderContent()}
      </Card>
    );
  }
} 