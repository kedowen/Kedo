import {
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
} from "@flowgram.ai/free-layout-editor";

import { FlowNodeJSON } from "../../typings";
import {
  FormHeader,
  FormContent,
  FormArrayOutputs,
  FormOutputs,
} from "../../form-components";
import { LLMInputs } from "./llm-inputs";
import { SimplifiedLLMView } from "./simplified-llm-view";
import { useIsSidebar } from "../../hooks";
import i18n from 'i18next';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();

  if (!isSidebar) {
    // 在节点视图中使用简化视图
    return (
      <>
        <FormHeader />
        <FormContent>
          <SimplifiedLLMView />
        </FormContent>
      </>
    );
  }

  // 在侧边栏中显示完整表单
  return (
    <>
      <FormHeader />
      <FormContent>
        <LLMInputs />
      </FormContent>
      <FormOutputs />
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) =>
      value ? undefined : i18n.t('nodes.llm.validation.titleRequired'),
    "inputsValues.prompt": ({ value }: { value: string }) =>
      value ? undefined : i18n.t('nodes.llm.validation.promptRequired'),
    "inputsValues.modelType": ({
      value,
    }: {
      value: { label: string; value: string };
    }) => (value.label && value.value ? undefined : i18n.t('nodes.llm.validation.modelTypeRequired')),
    "inputsValues.temperature": ({ value }: { value: number }) =>
      value ? undefined : i18n.t('nodes.llm.validation.temperatureRequired'),
  },
};
