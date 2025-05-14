import React from "react";
import { useTranslation } from 'react-i18next';
import { Select } from "@douyinfe/semi-ui";
import { BasicType, basicTypes } from "../../typings/json-schema";
import { upperFirst } from "lodash-es";

export interface TypeSelectProps {
  value?: BasicType;
  disabled?: boolean;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

/**
 * 类型选择组件，用于选择数据类型
 */
export const TypeSelect: React.FC<TypeSelectProps> = (props) => {
  const { t } = useTranslation();
  const { value, disabled, onChange, style } = props;
  
  // 获取翻译后的类型选项
  const typeOptions = basicTypes.map((type) => {
    return { 
      label: t(`formComponents.typeTag.${type}`), 
      value: type 
    };
  });
  
  // 添加类型安全的处理函数
  const handleChange = (
    val: string | number | Record<string, any> | any[] | undefined
  ) => {
    // 确保传递给外部的onChange只有string类型
    if (typeof val === "string") {
      onChange(val);
    } else if (val !== undefined) {
      // 如果不是string但有值，尝试转换
      onChange(String(val));
    }
  };

  return (
    <Select
      value={value}
      disabled={disabled}
      onChange={handleChange}
      style={{ width: "100%", ...style }}
      optionList={typeOptions}
      showClear={false}
      placeholder={t('formComponents.propertiesEdit.selectType')}
    />
  );
};
