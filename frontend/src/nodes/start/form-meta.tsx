import {
  Field,
  FieldRenderProps,
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
  useNodeRender,
} from "@flowgram.ai/free-layout-editor";
import { useTranslation } from 'react-i18next';
import { FlowNodeJSON, JsonSchema } from "../../typings";
import { useIsSidebar } from "../../hooks";
import {
  FormHeader,
  FormContent,
  FormOutputs,
  PropertiesEdit,
  TypeTag,
} from "@/form-components";
import { Collapse } from "@douyinfe/semi-ui";

export const renderForm = ({}: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  const { t } = useTranslation();

  if (isSidebar) {
    return (
      <>
        <FormHeader />
        <FormContent>
          <Collapse
            expandIconPosition="left"
            defaultActiveKey={[
              "outputs",
            ]}
            keepDOM
          >
            <Collapse.Panel itemKey="outputs" header={t('nodes.start.form.outputs')}>
              <Field
                name="outputs.properties"
                render={({
                  field: { value, onChange },
                  fieldState,
                }: FieldRenderProps<Record<string, JsonSchema>>) => (
                  <PropertiesEdit
                    value={value}
                    onChange={onChange}
                    nodeType="start"
                  />
                )}
              />
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
        <FormOutputs />
      </FormContent>
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => {
      const { t } = { t: (key: string) => i18n.t(key) };
      return value ? undefined : t('nodes.start.form.titleRequired');
    },
    // "outputs.properties.*": ({ value, context, formValues, name }) => {
    //   const propertyKey = name.replace(/^outputs\.properties\./, "");
    //   if (
    //     value?.extra?.required &&
    //     !value.default &&
    //     value.default !== false &&
    //     value.default !== 0
    //   ) {
    //     return `${propertyKey} 字段必填`;
    //   }
    //   return undefined;
    // },
  },
};

// 使用i18next在非React环境中
import i18n from 'i18next';
