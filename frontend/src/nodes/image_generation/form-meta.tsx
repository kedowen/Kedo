import { FormRenderProps, FormMeta, ValidateTrigger } from '@flowgram.ai/free-layout-editor';

import { FlowNodeJSON } from '../../typings';
import { FormHeader, FormContent, FormOutputs } from '../../form-components';
import { ImageInputs } from './image-inputs';
import { SimplifiedImageView } from './simplified-view';
import { useIsSidebar } from '../../hooks';
import i18n from '../../utils/i18n';

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  
  if (!isSidebar) {
    // 在节点视图中使用简化视图
    return (
      <>
        <FormHeader />
        <FormContent>
          <SimplifiedImageView />
        </FormContent>
      </>
    );
  }
  
  // 在侧边栏中显示完整表单
  return (
    <>
      <FormHeader />
      <FormContent>
        <ImageInputs />
      </FormContent>
      <FormOutputs />
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : i18n.t('nodes.image_generation.validation.titleRequired')),
    'inputsValues.prompt': ({ value }: { value: string }) => {
      if (!value || value.trim() === '') {
        return i18n.t('nodes.image_generation.validation.promptRequired');
      }
      return undefined;
    },
    'inputsValues.width': ({ value }: { value: number }) => (
      value && value >= 256 ? undefined : i18n.t('nodes.image_generation.validation.widthRequired')
    ),
    'inputsValues.height': ({ value }: { value: number }) => (
      value && value >= 256 ? undefined : i18n.t('nodes.image_generation.validation.heightRequired')
    ),
  },
}; 