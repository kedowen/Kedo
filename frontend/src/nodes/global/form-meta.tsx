import {
  Field,
  FieldRenderProps,
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
  useNodeRender,
} from "@flowgram.ai/free-layout-editor";

import { FlowNodeJSON, JsonSchema } from "../../typings";
import { useIsSidebar } from "../../hooks";
import {
  FormHeader,
  FormContent,
  FormOutputs,
  PropertiesEdit,
} from "../../form-components";

export const renderForm = ({}: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();

  if (isSidebar) {
    return (
      <>
        <FormHeader />
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
        {/* <FormContent>
         
        </FormContent> */}
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
    title: ({ value }: { value: string }) =>
      value ? undefined : "标题必填",
    "outputs.properties.*": ({ value, context, formValues, name }) => {
      const propertyKey = name.replace(/^outputs\.properties\./, "");
      if (
        value?.extra?.required &&
        !value.default &&
        value.default !== false &&
        value.default !== 0
      ) {
        return `${propertyKey} 字段必填`;
      }
      return undefined;
    },
  },
};
