import {
  Field,
  FieldRenderProps,
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
} from "@flowgram.ai/free-layout-editor";
import { useTranslation } from 'react-i18next';
import i18n from '../../utils/i18n';

import { FlowNodeJSON, JsonSchema } from "../../typings";
import { useIsSidebar } from "../../hooks";
import {
  FormHeader,
  FormContent,
  FormArrayOutputs,
} from "../../form-components";
import { ParamsArrayEditor } from "@/components";
import { Collapse } from "@douyinfe/semi-ui";

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  const { t } = useTranslation();
  
  if (isSidebar) {
    return (
      <>
        <FormHeader />
        <FormContent>
          <Collapse
            expandIconPosition="left"
            defaultActiveKey={["outputs"]}
            keepDOM
          >
            <Collapse.Panel itemKey="outputs" header={t('nodes.end.form.outputs')}>
              <ParamsArrayEditor arrayName="customParams" />
            </Collapse.Panel>
          </Collapse>
        </FormContent>
      </>
    );
  }
  return (
    <>
      <FormHeader />
      <FormContent>
        <FormArrayOutputs name="inputsValues.customParams" label={t('nodes.end.form.outputs')} />
      </FormContent>
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : i18n.t('nodes.end.form.titleRequired')),
  },
};
