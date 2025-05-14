import React from "react";
import {
  FormMeta,
  FormRenderProps,
  ValidateTrigger,
} from "@flowgram.ai/free-layout-editor";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { FlowNodeJSON } from "../../typings";
import { KnowledgeBaseInputs } from "./knowledge-base-inputs";
import { SimplifiedKnowledgeBaseView } from "./simplified-knowledge-base-view";
import { useIsSidebar } from "../../hooks";
import { FormContent, FormHeader } from "@/form-components";

// 表单渲染函数
export const renderForm = (props: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  const { t } = useTranslation();

  // 如果不是在侧边栏（即节点本身），则使用简化视图
  if (!isSidebar) {
    // 重要：直接传递整个props，确保表单数据能正确传递
    return (
      <>
        <FormHeader />
        <FormContent>
          <SimplifiedKnowledgeBaseView {...props} />
        </FormContent>
      </>
    )
  }

  // 在侧边栏中（配置面板）显示完整输入组件
  return (
    <>
      <FormHeader />
      <FormContent>
        <KnowledgeBaseInputs {...props} />
      </FormContent>
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    "inputsValues.knowledgeBase": ({ value }) => {
      if (typeof value === "string" && value.trim() === "") {
        return i18next.t('nodes.knowledge_base.validation.knowledgeBaseRequired');
      }
      return undefined;
    },
  },
};
