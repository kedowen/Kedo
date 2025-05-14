import {
  FormRenderProps,
  FlowNodeJSON,
  Field,
  FormMeta,
  ValidateTrigger,
} from "@flowgram.ai/free-layout-editor";
import { SubCanvasRender } from "@flowgram.ai/free-container-plugin";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

import { useIsSidebar } from "@/hooks";
import {
  FormHeader,
  FormContent,
  FormInputs,
  FormOutputs,
} from "@/form-components";
import { Typography } from "@douyinfe/semi-ui";
import { LoopSlideInputs } from "./loop-inputs";

// 添加LoopTimeValue接口定义
interface LoopTimeValue {
  type: "number" | "expression";
  content: number;
}

const LoopTimeView = () => {
  const { t } = useTranslation();
  return (
    <Field name="inputsValues.loopTimes">
      {({ field }: { field: { value: LoopTimeValue } }) => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px 0",
            }}
          >
            <Typography.Text strong type="secondary" size="small">
              {t("nodes.loop.form.loopTimes")}
            </Typography.Text>
            <Typography.Text type="secondary" size="small">
              {String(field.value.content)|| '--'}
            </Typography.Text>
          </div>
        );
      }}
    </Field>
  );
};

export const LoopFormRender = ({ form }: FormRenderProps<FlowNodeJSON>) => {
  const isSidebar = useIsSidebar();
  if (isSidebar) {
    return (
      <>
        <FormHeader />
        <FormContent>
          <LoopSlideInputs />
        </FormContent>
      </>
    );
  }
  return (
    <>
      <FormHeader />
      <FormContent>
        <LoopTimeView />
        <SubCanvasRender />
        <FormOutputs />
      </FormContent>
    </>
  );
};

export const formMeta: FormMeta<FlowNodeJSON> = {
  render: LoopFormRender,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    title: ({ value }: { value: string }) =>
      value ? undefined : i18n.t("nodes.loop.validation.titleRequired"),
    "inputsValues.loopTimes": ({
      value,
    }: {
      value: { type: string; content: string | number };
    }) => {
      if (value.type === "expression") {
        return value.content ? undefined : i18n.t("nodes.loop.validation.loopTimesRequired");
      } else if (value.type === "number") {
        return (value.content as number) > 0 ? undefined : i18n.t("nodes.loop.validation.loopTimesGreaterThanZero");
      }
    },
  },
};
