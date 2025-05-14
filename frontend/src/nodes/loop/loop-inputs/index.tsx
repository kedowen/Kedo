import { ErrorContainer, Feedback, FxIcon } from "@/form-components";
import { VariableSelector } from "@/plugins/sync-variable-plugin/variable-selector";
import { FlowRefValueSchema } from "@/typings";
import { Button, Collapse, InputNumber, Typography } from "@douyinfe/semi-ui";
import { useTranslation } from "react-i18next";
import {
  Field,
  FieldRenderProps,
  FieldState,
} from "@flowgram.ai/free-layout-editor";

export const LoopSlideInputs = () => {
  const { t } = useTranslation();
  const toggleMode = (field: {
    value: FlowRefValueSchema;
    onChange: (value: FlowRefValueSchema) => void;
  }) => {
    if (field.value.type === "expression") {
      field.onChange({
        type: "number",
        content: 2,
      });
    } else {
      field.onChange({
        type: "expression",
        content: "",
      });
    }
  };
  return (
    <Collapse
      expandIconPosition="left"
      defaultActiveKey={["loopConfig"]}
      keepDOM
    >
      <Collapse.Panel itemKey="loopConfig" header={t("nodes.loop.form.loopConfig")}>
        <Field name="inputsValues.loopTimes">
          {({
            field,
            fieldState,
          }: {
            field: {
              value: FlowRefValueSchema;
              onChange: (value: FlowRefValueSchema) => void;
            };
            fieldState: FieldState;
          }) => {
            return (
              <div>
                <Typography.Text strong type="secondary" size="small">
                  {t("nodes.loop.form.loopTimes")}
                </Typography.Text>
                <div style={{ display: "flex", gap: "8px" }}>
                  {field.value?.type === "expression" ? (
                    <VariableSelector
                      style={{ flex: 1 }}
                      value={field.value.content}
                      hasError={
                        Object.keys(fieldState?.errors || {}).length > 0
                      }
                      onChange={(value) => {
                        field.onChange({
                          type: "expression",
                          content: value,
                        });
                      }}
                    />
                  ) : (
                    <ErrorContainer style={{ flex: 1 }} fieldState={fieldState}>
                      <InputNumber
                        style={{ width: "100%" }}
                        value={field.value.content as number}
                        onChange={(value) => {
                          field.onChange({
                            type: "number",
                            content: value as number,
                          });
                        }}
                      />
                    </ErrorContainer>
                  )}
                  <Button
                    theme="borderless"
                    icon={<FxIcon />}
                    onClick={() => toggleMode(field)}
                  />
                </div>
              </div>
            );
          }}
        </Field>
      </Collapse.Panel>
    </Collapse>
  );
};
