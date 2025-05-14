import { nanoid } from "nanoid";
import {
  Field,
  FieldArray,
  FieldState,
  useNodeRender,
} from "@flowgram.ai/free-layout-editor";
import { Button, Select, Tooltip } from "@douyinfe/semi-ui";
import {
  IconPlus,
  IconCrossCircleStroked,
  IconDelete,
  IconMinus,
} from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";

import { FlowLiteralValueSchema, FlowRefValueSchema } from "@/typings";
import {
  ConditionPort,
  IfConditionBox,
  ConditionTitle,
  ElseConditionBox,
  ConditionContent,
  ConditionItem,
  ConditionResultBox,
  ConditionRelationBox,
} from "./styles";

import { VariableSelector } from "@/plugins/sync-variable-plugin/variable-selector";
import {
  ConditionRelationEnum,
  ConditionTypeEnum,
  RelationEnum,
  AndOrOption,
  RelationOption,
  defaultConditionValue,
  defaultConditionValueWithRelation,
} from "../index";
import { ErrorContainer, FxIcon } from "@/form-components";
import { TypeDefault, TypeSelect } from "@/form-components";
import { Feedback } from "@/form-components/feedback";
import { isArray, isObject } from "lodash-es";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";

interface ConditionValue {
  key: string;
  value: FlowLiteralValueSchema | FlowRefValueSchema;
}

// 关系选择器
const RelationSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (
    value: string | number | any[] | Record<string, any> | undefined
  ) => void;
}) => {
  return (
    <Select
      optionList={RelationOption}
      value={value}
      onChange={onChange}
      style={{ height: "32px" }}
    />
  );
};

// 且或选择器
const AndOrSelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (
    value: string | number | any[] | Record<string, any> | undefined
  ) => void;
}) => {
  return (
    <Select
      optionList={AndOrOption}
      value={value}
      onChange={onChange}
      style={{ height: "32px" }}
    />
  );
};

const AddConditionButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
      }}
    >
      <Button
        theme="borderless"
        icon={<IconPlus />}
        style={{ fontSize: "12px" }}
        size="small"
        onClick={onClick}
      >
        {t("nodes.condition.form.addCondition")}
      </Button>
    </div>
  );
};

const DeleteIfButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  return (
    <Tooltip content={t("nodes.condition.form.deleteBranch")}>
      <Button
        style={{
          position: "absolute",
          right: "0px",
          top: "0px",
          color: "#999",
        }}
        theme="borderless"
        icon={<IconMinus />}
        onClick={onClick}
      />
    </Tooltip>
  );
};

const IfSlideCondition = ({ field, index }: { field: any; index: number }) => {
  const { t } = useTranslation();
  const name = `inputsValues.conditions.${index}.value`;
  const { form } = useNodeRender();
  const getPropertiesFieldByName = (name: string) => {
    return form?.getValueIn(name);
  };
  const addCondition = (field: any) => {
    field.append(defaultConditionValueWithRelation);
  };

  const isFirst = index === 0;
  const title = isFirst ? t("nodes.condition.form.relations.if") : t("nodes.condition.form.relations.elseIf");

  const deleteCondition = (field: any, index: number) => {
    field.delete(index);
  };
  const deleteIf = (fieldArray: any, index: number) => {
    fieldArray.delete(index);
  };

  const toggleExpression = (field: any) => {
    field.onChange({
      ...field.value,
      type: field.value.type === "expression" ? "string" : "expression",
    });
  };

  return (
    <IfConditionBox>
      <ConditionTitle>{title}</ConditionTitle>
      <FieldArray name={`inputsValues.conditions`}>
        {({ field }) => (
          <>
            {index > 0 && (
              <DeleteIfButton onClick={() => deleteIf(field, index)} />
            )}
          </>
        )}
      </FieldArray>
      <ConditionContent>
        <FieldArray name={name}>
          {({ field }) => (
            <>
              {field.map((child, childIndex) => (
                <div
                  key={child.key}
                  style={{ marginBottom: "8px", position: "relative" }}
                >
                  {"relation" in child.value && (
                    <div
                      style={{
                        padding: "4px 0",
                        color: "#666",
                      }}
                    >
                      <AndOrSelector
                        value={child.value.relation}
                        onChange={(v) =>
                          child.onChange({
                            ...child.value,
                            relation: v,
                          })
                        }
                      />
                    </div>
                  )}
                  <ConditionItem
                    key={childIndex}
                    style={{ marginTop: "8px", position: "relative" }}
                  >
                    {childIndex > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          right: "2px",
                          top: "2px",
                          zIndex: 2,
                        }}
                      >
                        <Button
                          style={{
                            color: "red",
                            padding: "0",
                            height: "20px",
                            lineHeight: "20px",
                          }}
                          theme="borderless"
                          icon={<IconDelete size="small" />}
                          onClick={() => {
                            deleteCondition(field, childIndex);
                          }}
                        />
                      </div>
                    )}
                    <div
                      style={{
                        padding: "24px 8px 8px 8px",
                        border: "1px solid #eee",
                        borderRadius: "4px",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <div style={{ marginBottom: "8px" }}>
                        <Field name={`${name}.${childIndex}.conationLeft`}>
                          {({ field, fieldState }) => (
                            <>
                              <VariableSelector
                                style={{ width: "100%", height: "32px" }}
                                hasError={
                                  Object.keys(fieldState?.errors || {}).length >
                                  0
                                }
                                value={field.value as string}
                                onChange={(v) => field.onChange(v)}
                              />
                              <Feedback errors={fieldState?.errors} />
                            </>
                          )}
                        </Field>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          // alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <RelationSelector
                          value={child.value.conationRelation}
                          onChange={(v) =>
                            child.onChange({
                              ...child.value,
                              conationRelation: v,
                            })
                          }
                        />
                        <Field name={`${name}.${childIndex}.conationRight`}>
                          {({
                            field,
                          }: {
                            field: {
                              value: FlowRefValueSchema;
                              onChange: (value: FlowRefValueSchema) => void;
                            };
                          }) => (
                            <div
                              style={{
                                display: "flex",
                                flex: 1,
                                // alignItems: "center",
                              }}
                            >
                              {field.value.type === "expression" ? (
                                <Field
                                  name={`${name}.${childIndex}.conationRight.content`}
                                >
                                  {({ field: contentField, fieldState }) => (
                                    <div style={{ width: "100%" }}>
                                      <VariableSelector
                                        style={{
                                          width: "100%",
                                          height: "32px",
                                        }}
                                        hasError={
                                          Object.keys(fieldState?.errors || {})
                                            .length > 0
                                        }
                                        value={contentField.value}
                                        onChange={(v) =>
                                          contentField.onChange(v)
                                        }
                                      />
                                      <Feedback errors={fieldState?.errors} />
                                    </div>
                                  )}
                                </Field>
                              ) : (
                                <TypeSelect
                                  value={field.value.type}
                                  style={{ flex: 1, height: "32px" }}
                                  onChange={(v) => {
                                    field.onChange({
                                      type: v,
                                      content: "", // 每次切换类型需要清空
                                    });
                                  }}
                                />
                              )}
                              <Button
                                theme="borderless"
                                icon={<FxIcon />}
                                style={{ marginLeft: "4px", height: "32px" }}
                                onClick={() => toggleExpression(field)}
                              />
                            </div>
                          )}
                        </Field>
                      </div>
                      <Field name={`${name}.${childIndex}.conationRight`}>
                        {({
                          field,
                          fieldState,
                        }: {
                          field: {
                            value: FlowRefValueSchema;
                            onChange: (value: FlowRefValueSchema) => void;
                          };
                          fieldState: FieldState;
                        }) => (
                          <>
                            {field.value.type !== "expression" && (
                              <div style={{ width: "100%" }}>
                                <ErrorContainer fieldState={fieldState}>
                                  <TypeDefault
                                    style={{ width: "100%" }}
                                    type={field.value.type}
                                    value={{
                                      type: field.value.type,
                                      default: field.value.content,
                                    }}
                                    onChange={(v) => {
                                      if (v && "default" in v) {
                                        field.onChange({
                                          type: field.value.type,
                                          content: v.default,
                                        });
                                      }
                                    }}
                                  />
                                </ErrorContainer>
                              </div>
                            )}
                          </>
                        )}
                      </Field>
                    </div>
                  </ConditionItem>
                </div>
              ))}
              <AddConditionButton
                onClick={() => {
                  addCondition(field);
                }}
              />
            </>
          )}
        </FieldArray>
      </ConditionContent>
    </IfConditionBox>
  );
};

const ElseSlideCondition = () => {
  const { t } = useTranslation();
  return (
    <ElseConditionBox>
      <ConditionTitle>{t("nodes.condition.form.relations.else")}</ConditionTitle>
    </ElseConditionBox>
  );
};

export function ConditionSlideInputs() {
  const { t } = useTranslation();
  const { form } = useNodeRender();
  const addCondition = (field: any) => {
    // 添加新的ELSEIF节点
    field.append({
      key: `${ConditionTypeEnum.ELSEIF}_${nanoid(5)}`,
      type: ConditionTypeEnum.ELSEIF,
      value: [defaultConditionValue, defaultConditionValueWithRelation],
    });
    // 查找ELSE节点的索引
    const elseIndex = field.value.findIndex(
      (item: any) => item.type === ConditionTypeEnum.ELSE
    );
    // 如果找到ELSE节点且它不在最后位置，将其移到最后
    if (elseIndex !== -1 && elseIndex !== field.value.length - 1) {
      field.swap(elseIndex, field.value.length - 1);
    }
  };

  return (
    <FieldArray name="inputsValues.conditions">
      {({ field, fieldState }) => (
        <div
          style={{
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>
              {t("nodes.condition.form.branches")}
            </span>
            <Button
              theme="borderless"
              icon={<IconPlus />}
              onClick={() => addCondition(field)}
            >
              {t("nodes.condition.form.addBranch")}
            </Button>
          </div>
          {field.map((child, index) => (
            <Field<ConditionValue> key={child.key} name={child.name}>
              {({ field: childField, fieldState: childState }) => (
                <>
                  {childField.value.type === ConditionTypeEnum.ELSE ? (
                    <ElseSlideCondition field={childField.value} />
                  ) : (
                    <IfSlideCondition field={childField.value} index={index} />
                  )}
                </>
              )}
            </Field>
          ))}
        </div>
      )}
    </FieldArray>
  );
}

const IfCondition = ({ field, index }: { field: any; index: number }) => {
  const { t } = useTranslation();
  const title = index === 0 ? t("nodes.condition.form.relations.if") : t("nodes.condition.form.relations.elseIf");

  const renderContent = (value: any) => {
    if (isArray(value) || isObject(value)) {
      return JSON.stringify(value, null, 2);
    }
    return value;
  };

  return (
    <IfConditionBox>
      <ConditionTitle>{title}</ConditionTitle>
      <ConditionContent>
        {field.value.map((item, index) => (
          <div key={item.key}>
            {"relation" in item && (
              <div>
                <ConditionRelationBox>{item?.relation}</ConditionRelationBox>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center" }}>
              <ConditionResultBox
                style={{
                  width: "calc(50% - 4px)",
                  backgroundColor: "rgb(238, 246, 255)",
                  border: "1px solid rgb(198, 217, 247)",
                }}
              >
                {item?.conationLeft}
              </ConditionResultBox>
              <div
                style={{ margin: "0 4px", width: "20px", textAlign: "center" }}
              >
                {item?.conationRelation}
              </div>
              <ConditionResultBox
                style={{
                  width: "calc(50% - 4px)",
                  backgroundColor: "rgb(238, 249, 242)",
                  border: "1px solid rgb(198, 230, 212)",
                }}
              >
                {renderContent(item?.conationRight?.content)}
              </ConditionResultBox>
            </div>
          </div>
        ))}
        <ConditionPort data-port-id={field.key} data-port-type="output" />
      </ConditionContent>
    </IfConditionBox>
  );
};

const ElseCondition = ({ field }: { field: any }) => {
  const { t } = useTranslation();
  return (
    <ElseConditionBox>
      <ConditionTitle>{t("nodes.condition.form.relations.else")}</ConditionTitle>
      <ConditionPort data-port-id={field.key} data-port-type="output" />
    </ElseConditionBox>
  );
};

export function ConditionInputs() {
  return (
    <div style={{ padding: "12px" }}>
      <FieldArray name="inputsValues.conditions">
        {({ field, fieldState }) => (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {field.map((child, index) => (
              <Field<ConditionValue> key={child.key} name={child.name}>
                {({ field: childField, fieldState: childState }) => (
                  <>
                    {childField.value.type === ConditionTypeEnum.ELSE ? (
                      <ElseCondition field={childField.value} />
                    ) : (
                      <IfCondition field={childField.value} index={index} />
                    )}
                  </>
                )}
              </Field>
            ))}
          </div>
        )}
      </FieldArray>
    </div>
  );
}
