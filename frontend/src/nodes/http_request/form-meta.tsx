import { FormRenderProps, FormMeta, ValidateTrigger } from '@flowgram.ai/free-layout-editor';
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';

import { FlowNodeJSON } from '../../typings';
import { FormHeader, FormContent, FormOutputs } from '../../form-components';
import { HttpInputs } from './http-inputs';
import { SimplifiedHttpView } from './simplified-http-view';
import { useIsSidebar } from '../../hooks';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const { t } = useTranslation();
  const isSidebar = useIsSidebar();
  
  if (!isSidebar) {
    // 在节点视图中使用简化视图
    return (
      <>
        <FormHeader />
        <FormContent>
          <SimplifiedHttpView />
        </FormContent>
      </>
    );
  }
  
  // 在侧边栏中显示完整表单
  return (
    <>
      <FormHeader />
      <FormContent>
        <HttpInputs />
      </FormContent>
      <FormOutputs />
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : i18n.t('nodes.http_request.validation.titleRequired')),
    'inputsValues.url': ({ value }: { value: string }) => (value ? undefined : i18n.t('nodes.http_request.validation.urlRequired')),
  },
}; 