import { FormRenderProps, FormMeta, ValidateTrigger } from '@flowgram.ai/free-layout-editor';
import i18n from 'i18next';

import { FlowNodeJSON } from '../../typings';
import { FormHeader, FormContent, FormOutputs } from '../../form-components';
import { CodeInputs } from './code-inputs';
import { SimplifiedCodeView } from './simplified-code-view';
import { useIsSidebar } from '../../hooks';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  
  if (!isSidebar) {
    // 在节点视图中使用简化视图
    return (
      <>
        <FormHeader />
        <FormContent>
          <SimplifiedCodeView />
        </FormContent>
      </>
    );
  }
  
  // 在侧边栏中显示完整表单
  return (
    <>
      <FormHeader />
      <FormContent>
        <CodeInputs />
      </FormContent>
      <FormOutputs />
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : i18n.t('nodes.code.validation.titleRequired')),
    'inputsValues.codeContent': ({ value }: { value: string }) => (value ? undefined : i18n.t('nodes.code.validation.codeContentRequired')),
  },
}; 