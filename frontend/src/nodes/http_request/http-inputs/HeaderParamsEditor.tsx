import React from 'react';
import { Typography } from '@douyinfe/semi-ui';
import { useIsSidebar } from '@/hooks';
import { ParamsArrayEditor } from '@/components';

/**
 * HTTP请求头编辑器组件
 */
export const HeadersEditor: React.FC = () => {
  const readonly = !useIsSidebar();
  
  return (
    <div>
      <ParamsArrayEditor
        arrayName="headers"
        disabled={readonly}
        emptyText="暂无请求头，点击添加"
      />
    </div>
  );
};

/**
 * HTTP请求参数编辑器组件
 */
export const ParamsEditor: React.FC = () => {
  const readonly = !useIsSidebar();
  
  return (
    <div>
      <ParamsArrayEditor
        arrayName="params"
        disabled={readonly}
        emptyText="暂无请求参数，点击添加"
      />
    </div>
  );
};

export { HeadersEditor, ParamsEditor }; 