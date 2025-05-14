import {
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
} from "@flowgram.ai/free-layout-editor";

import { FlowNodeJSON } from "../typings";
import {
  FormHeader,
  FormContent,
  FormInputs,
  FormOutputs,
} from "../form-components";

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => (
  <>
    <FormHeader />
    <FormContent>
      <FormInputs />
      <FormOutputs />
    </FormContent>
  </>
);

export const defaultFormMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }) => (value ? undefined : "标题必填"),
    "inputsValues.*": ({ value, context, formValues, name }) => {
      console.log("value->", formValues);
      const valuePropetyKey = name.replace(/^inputsValues\./, "");
      const valueDesscription =
        formValues.inputs?.properties[valuePropetyKey]?.description;
      const required = formValues.inputs?.required || [];
      if (
        required.includes(valuePropetyKey) &&
        (value === "" || value === undefined)
      ) {
        return `${valueDesscription || valuePropetyKey}必填`;
      }
      return undefined;
    },
  },
};
