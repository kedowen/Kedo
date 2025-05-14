import React from "react";
import { useTranslation } from 'react-i18next';
import { useIsSidebar } from "@/hooks";
import { ParamsArrayEditor } from "@/components";

// 自定义参数编辑器组件 - 使用通用数组参数编辑器
const CustomParamsEditor: React.FC = () => {
  const readonly = !useIsSidebar();
  const { t } = useTranslation();

  return (
    <ParamsArrayEditor
      arrayName="customParams"
      disabled={readonly}
      emptyText={t('nodes.llm.form.noCustomParams')}
    />
  );
};

export default CustomParamsEditor; 