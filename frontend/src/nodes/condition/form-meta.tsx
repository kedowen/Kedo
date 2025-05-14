import {
  FormRenderProps,
  FormMeta,
  ValidateTrigger,
} from "@flowgram.ai/free-layout-editor";
import i18n from "i18next";

import { FlowNodeJSON } from "../../typings";
import { FormHeader, FormContent } from "@/form-components";
import { ConditionInputs, ConditionSlideInputs } from "./condition-inputs";
import { useIsSidebar } from "@/hooks";
import { isArray, isBoolean, isNumber, isObject } from "lodash-es";

export const renderForm = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  if (!isSidebar) {
    return (
      <>
        <FormHeader />
        <FormContent>
          <ConditionInputs />
        </FormContent>
      </>
    );
  }
  return (
    <>
      <FormHeader />
      <FormContent>
        <ConditionSlideInputs />
      </FormContent>
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: renderForm,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) => (value ? undefined : i18n.t("nodes.condition.validation.titleRequired")),
    // 'inputsValues.conditions.*.value.*.relation': ({ value }: { value: string }) =>
    //   (value ? undefined : '条件关系必填'),
    "inputsValues.conditions.*.value.*.conationLeft": ({
      value,
    }: {
      value: string;
    }) => (value ? undefined : i18n.t("nodes.condition.validation.leftExpressionRequired")),
    // 'inputsValues.conditions.*.value.*.conationRelation': ({ value }: { value: string }) =>
    //   (value ? undefined : '关系必填'),
    "inputsValues.conditions.*.value.*.conationRight": ({
      value,
    }: {
      value: { type: string; content: any };
      }) => {
      if (isNumber(value.content)&& !isNaN(value.content)) {
        return undefined;
      } else if (isArray(value) && value.content.length === 0) {
        return i18n.t("nodes.condition.validation.rightExpressionRequired");
      } else if (isObject(value.content) && Object.keys(value.content).length === 0) {
        return i18n.t("nodes.condition.validation.rightExpressionRequired");
      } else if (isBoolean(value.content)) {
        return undefined;
      } else if (!value.content) {
        return i18n.t("nodes.condition.validation.rightExpressionRequired");
      }
      return undefined;
    },
  },
};
