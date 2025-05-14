import styled from 'styled-components';
import { Tag, Tooltip } from '@douyinfe/semi-ui';
import { useTranslation } from 'react-i18next';

import { VariableTypeIcons, ArrayIcons } from '../plugins/sync-variable-plugin/icons';

interface PropsType {
  name?: string | JSX.Element;
  type: string;
  className?: string;
  isArray?: boolean;
}

const TooltipContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 6px;
`;

export function TypeTag({ name, type, isArray, className }: PropsType) {
  const { t } = useTranslation();
  const icon = isArray ? ArrayIcons[type] : VariableTypeIcons[type];
  
  // 获取类型的翻译文本
  const getTypeText = (type: string) => {
    const typeKey = `formComponents.typeTag.${type}`;
    const translatedType = t(typeKey);
    
    // 如果没有找到翻译，就返回原始类型
    return translatedType === typeKey ? type : translatedType;
  };

  return (
    <Tooltip
      content={
        <TooltipContainer>
          {icon} {getTypeText(type)}
        </TooltipContainer>
      }
    >
      <Tag color="white" className={className} style={{ padding: 4, maxWidth: 450 }}>
        {icon}
        {name && (
          <span
            style={{
              display: 'inline-block',
              marginLeft: 4,
              marginTop: -1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {' '}
            {name}
          </span>
        )}
      </Tag>
    </Tooltip>
  );
}
