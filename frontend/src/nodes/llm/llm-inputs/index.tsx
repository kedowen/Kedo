import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Select,
  Input,
  Button,
  Tabs,
  Typography,
  TextArea,
  Divider,
  Collapse,
} from "@douyinfe/semi-ui";
import { useTranslation } from 'react-i18next';
import { IconPlus, IconDelete, IconEdit } from "@douyinfe/semi-icons";
import { Field, FieldArray, useForm } from "@flowgram.ai/free-layout-editor";

import { FormItem } from "@/form-components/form-item";
import { FxExpression } from "@/form-components";
import { TypeSelect } from "@/form-components/type-select";
import { Feedback } from "@/form-components/feedback";
import { useIsSidebar } from "../../../hooks";
import {
  FlowLiteralValueSchema,
  FlowRefValueSchema,
  JsonSchema,
} from "../../../typings";
import { LLMParamsEditor } from "./llm-params-editor"; // 旧的参数编辑器组件
import CustomParamsEditor from "./CustomParamsEditor"; // 新的数组参数编辑器组件
import { awaitWrapper, getChatLLMList } from "@/api";
import { log } from "console";

const { Text } = Typography;

// 样式
const SpaceStyle = { width: "100%", marginBottom: "16px" };
const FlexContainer = {
  display: "flex",
  alignItems: "center",
  marginBottom: "12px",
};
const FlexContent = { flex: 1, marginRight: "8px" };
const ButtonContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "16px",
  marginBottom: "24px",
};
const ParamContainer = {
  padding: "12px",
  border: "1px solid #e0e0e0",
  borderRadius: "4px",
  marginBottom: "16px",
  background: "#fafafa",
};
const LabelText = {
  fontSize: "12px",
  color: "#666",
  marginBottom: "4px",
  display: "block",
};

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CustomParamsEditor 错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "12px",
              border: "1px solid #FFCCC7",
              borderRadius: "4px",
              background: "#FFF1F0",
            }}
          >
            <Text>参数编辑器加载错误，请刷新页面重试。</Text>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// 单个参数行组件
const ParamItem = React.memo(
  ({
    paramName,
    paramType,
    disabled,
    onRename,
    onTypeChange,
    onDelete,
  }: {
    paramName: string;
    paramType: string;
    disabled?: boolean;
    onRename: (newName: string) => void;
    onTypeChange: (newType: string) => void;
    onDelete: () => void;
  }) => {
    const { t } = useTranslation();
    const [editingName, setEditingName] = useState(paramName);

    // 当参数名称变化时，更新编辑状态
    useEffect(() => {
      setEditingName(paramName);
    }, [paramName]);

    // 处理名称变更
    const handleNameChange = (value: string) => {
      setEditingName(value);
    };

    // 处理名称变更提交
    const handleNameBlur = () => {
      if (editingName !== paramName) {
        onRename(editingName.trim() || paramName);
      }
    };

    return (
      <div style={FlexContainer}>
        <div style={FlexContent}>
          <Text style={LabelText}>{t('nodes.llm.inputs.key')}</Text>
          <Input
            value={editingName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onEnterPress={handleNameBlur}
            disabled={disabled}
            placeholder={t('nodes.llm.form.enterParamName')}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ width: "140px", marginRight: "8px" }}>
          <Text style={LabelText}>{t('formComponents.formOutputs.type')}</Text>
          <TypeSelect
            value={paramType}
            onChange={onTypeChange}
            disabled={disabled}
            style={{ width: "100%" }}
          />
        </div>
        {!disabled && (
          <Button
            type="danger"
            theme="borderless"
            icon={<IconDelete />}
            onClick={onDelete}
            style={{ marginTop: "20px" }}
          />
        )}
      </div>
    );
  }
);

// 参数值编辑器组件
const ParamValueEditor = React.memo(
  ({
    paramName,
    paramType,
    disabled,
  }: {
    paramName: string;
    paramType: string;
    disabled?: boolean;
  }) => {
    const { t } = useTranslation();
    return (
      <div>
        <Text style={LabelText}>{t('nodes.llm.inputs.value')}</Text>
        <Field
          name={`inputsValues.${paramName}`}
          render={({ field }) => (
            <FxExpression
              value={field.value as FlowLiteralValueSchema | FlowRefValueSchema}
              onChange={field.onChange}
              readonly={disabled}
              placeholder={t('nodes.llm.form.enterParamValueOrReference')}
              useTextArea={
                paramType === "string" &&
                paramName.toLowerCase().includes("prompt")
              }
              // JSON类型处理 - 根据FxExpression组件实际支持的属性
              // 如果FxExpression不支持useJsonView，则移除此属性
              // useJsonView={paramType === 'object' || paramType === 'array'}
            />
          )}
        />
      </div>
    );
  }
);

// 单个完整的参数编辑器组件 (包含名称、类型和值)
const ParameterEditor = React.memo(
  ({
    paramName,
    disabled,
    onRename,
    onDelete,
  }: {
    paramName: string;
    disabled?: boolean;
    onRename: (oldName: string, newName: string) => void;
    onDelete: (name: string) => void;
  }) => {
    // 获取参数类型
    const [paramType, setParamType] = useState("string");

    // 从表单中获取类型
    const form = useForm();

    useEffect(() => {
      if (form && form.values) {
        const type =
          form.values.inputs?.properties?.[paramName]?.type || "string";
        setParamType(type);
      }
    }, [form, paramName]);

    // 处理类型变更
    const handleTypeChange = useCallback(
      (newType: string) => {
        if (form && form.values) {
          const properties = form.values.inputs?.properties || {};
          const property = properties[paramName] || {};

          // 更新类型
          form.setValueIn(`inputs.properties.${paramName}`, {
            ...property,
            type: newType,
          });

          setParamType(newType);
        }
      },
      [form, paramName]
    );

    // 处理重命名
    const handleRename = useCallback(
      (newName: string) => {
        if (newName !== paramName) {
          onRename(paramName, newName);
        }
      },
      [paramName, onRename]
    );

    // 处理删除
    const handleDelete = useCallback(() => {
      onDelete(paramName);
    }, [paramName, onDelete]);

    return (
      <div style={ParamContainer}>
        <ParamItem
          paramName={paramName}
          paramType={paramType}
          disabled={disabled}
          onRename={handleRename}
          onTypeChange={handleTypeChange}
          onDelete={handleDelete}
        />
        <ParamValueEditor
          paramName={paramName}
          paramType={paramType}
          disabled={disabled}
        />
      </div>
    );
  }
);

// 系统预设参数列表
const BUILT_IN_PARAMS = ["modelType", "temperature", "systemPrompt", "prompt"];

// 用户自定义参数编辑器 - 使用新的数组参数编辑器组件
// const CustomParamsEditor = () => {
//   const readonly = !useIsSidebar();
//   const form = useForm();
//   console.log(form, "form");

//   // 当参数变化时同步表单
//   const handleFormSync = useCallback(() => {
//     console.log("开始同步表单...");
//     if (!form) {
//       console.error("表单实例不存在，无法同步");
//       return;
//     }

//     const formAny = form as any;
//     console.log("表单实例:", formAny);

//     try {
//       if (typeof formAny.submit === "function") {
//         console.log("调用form.submit()");
//         formAny.submit();
//       } else if (typeof formAny.handleSubmit === "function") {
//         console.log("调用form.handleSubmit()");
//         formAny.handleSubmit();
//       } else {
//         console.warn("找不到表单提交方法");
//       }
//       console.log("表单同步完成");
//     } catch (err) {
//       console.error("表单同步出错:", err);
//     }
//   }, [form]);

//   return (
//     <div style={{ marginBottom: "20px" }}>
//       {/* <div style={{ marginBottom: '16px' }}>
//         <Text strong>自定义输入参数</Text>
//       </div>
//        */}
//       <Field
//         name="inputs.properties"
//         render={({ field: { value, onChange } }) => {
//           // 过滤内置参数
//           const customParams: Record<string, JsonSchema> = {};
//           if (value && typeof value === "object") {
//             // 使用类型断言确保value是一个有效的索引对象
//             const typedValue = value as Record<string, any>;
//             Object.keys(typedValue).forEach((key) => {
//               if (!BUILT_IN_PARAMS.includes(key)) {
//                 customParams[key] = typedValue[key] as JsonSchema;
//               }
//             });
//           }

//           // 处理属性变更
//           const handlePropertyChange = (
//             newProps: Record<string, JsonSchema>
//           ) => {
//             console.log("handlePropertyChange接收到新参数:", newProps);
//             // 提交变更
//             onChange(newProps);
//             console.log("已调用onChange更新表单数据");

//             // 强制表单提交
//             setTimeout(() => {
//               console.log("准备同步表单...");
//               handleFormSync();
//               console.log("表单同步完成");
//             }, 0);
//           };

//           // 处理属性删除
//           const handlePropertyDelete = (key: string) => {
//             // 创建新的属性对象，排除要删除的键
//             const updatedProps: Record<string, JsonSchema> = {
//               ...(value || {}),
//             } as Record<string, JsonSchema>;
//             delete updatedProps[key];

//             // 同时删除参数值
//             if (form && form.values && form.values.inputsValues) {
//               const inputsValues = { ...(form.values.inputsValues || {}) };
//               delete inputsValues[key];
//               form.setValueIn("inputsValues", inputsValues);
//             }

//             // 提交变更
//             onChange(updatedProps);
//             handleFormSync();
//           };

//           // 处理添加属性
//           const handleAddProperty = () => {
//             // 使用时间戳作为参数名，避免排序问题，直接追加到末尾
//             const timestamp = Date.now();
//             const tempName = `param_${timestamp}`;

//             // 创建新属性
//             const updatedProps: Record<string, JsonSchema> = {
//               ...((value || {}) as Record<string, JsonSchema>),
//               [tempName]: {
//                 type: "string",
//                 description: `自定义参数: ${tempName}`,
//               },
//             };

//             // 初始化参数值
//             if (form && form.values) {
//               form.setValueIn(`inputsValues.${tempName}`, "");
//             }

//             // 提交变更
//             onChange(updatedProps);
//             // handleFormSync();
//           };

//           return (
//             <>
//               <LLMParamsEditor
//                 properties={customParams}
//                 onChange={handlePropertyChange}
//                 onDelete={handlePropertyDelete}
//                 disabled={readonly}
//                 form={form}
//               />

//               {!readonly && (
//                 <div style={ButtonContainerStyle}>
//                   <Button
//                     theme="light"
//                     type="primary"
//                     icon={<IconPlus />}
//                     onClick={handleAddProperty}
//                   >
//                     添加参数
//                   </Button>
//                 </div>
//               )}
//             </>
//           );
//         }}
//       />
//     </div>
//   );
// };

// 模型类型选择器
const ModelTypeSelector = () => {
  const readonly = !useIsSidebar();
  const [modelList, setModelList] = useState([]);
  const [defaultModelType, setDefaultModelType] = useState();

  const actGetModelList = async () => {
    const [err, res] = await awaitWrapper(getChatLLMList());
    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };

  useEffect(() => {
    const getList = async () => {
      const [err, data] = await actGetModelList();
      if (data) {
        console.log(data);
        setModelList(data);
      }
    };
    getList();
  }, []);

  return (
    <Field<string> name="inputsValues.modelType">
      {({ field, fieldState }) => (
        <>
          <Select
            onChangeWithObject
            defaultValue={defaultModelType}
            value={field.value}
            onChange={(val) => {
              field.onChange({
                value: val.title,
                label: val.label,
              });
            }}
            disabled={readonly}
            style={{ width: "100%" }}
            optionList={
              modelList.map((item: any) => ({
                label: item.itemValue,
                value: item.itemDetailId,
                title: item.itemName,
              })) || []
            }
          />
          <Feedback errors={fieldState?.errors} />
        </>
      )}
    </Field>
  );
};

// 温度设置
const TemperatureSelector = () => {
  const readonly = !useIsSidebar();
  const { t } = useTranslation();

  return (
    <Field<number> name="inputsValues.temperature">
      {({ field, fieldState }) => (
        <FormItem name={t('nodes.llm.form.temperature')} type="number" required>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={field.value === undefined ? 0.7 : field.value}
            onChange={(val) => field.onChange(parseFloat(val))}
            disabled={readonly}
            style={{ width: "100%" }}
          />
          <Feedback errors={fieldState?.errors} />
        </FormItem>
      )}
    </Field>
  );
};
// 系统提示词
const SystemPromptInput = () => {
  const readonly = !useIsSidebar();
  const { t } = useTranslation();

  return (
    <Field<string> name="inputsValues.systemPrompt">
      {({ field }) => (
        <>
          <TextArea
            value={field.value as FlowLiteralValueSchema | FlowRefValueSchema}
            onChange={(val: any) => field.onChange(val)}
            readonly={readonly}
            useTextArea={true}
            rows={4}
            placeholder={t('nodes.llm.form.systemPromptPlaceholder')}
          />
        </>
      )}
    </Field>
  );
};

// 用户提示词
const PromptInput = () => {
  const readonly = !useIsSidebar();
  const { t } = useTranslation();

  return (
    <Field<string> name="inputsValues.prompt">
      {({ field, fieldState }) => (
        <>
          <TextArea
            value={field.value as FlowLiteralValueSchema | FlowRefValueSchema}
            onChange={(val: any) => field.onChange(val)}
            readonly={readonly}
            useTextArea={true}
            rows={6}
            placeholder={t('nodes.llm.form.userPromptPlaceholder')}
          />
          <Feedback errors={fieldState?.errors} />
        </>
      )}
    </Field>
  );
};

// LLM输入组件
export const LLMInputs = React.memo(() => {
  const { t } = useTranslation();
  return (
    <Collapse
      expandIconPosition="left"
      defaultActiveKey={[
        "customParams",
        "modelSettings",
        "systemPrompts",
        "userPrompts",
      ]}
      keepDOM
    >
      <Collapse.Panel itemKey="customParams" header={t('nodes.llm.form.inputParams')}>
        <ErrorBoundary>
          <CustomParamsEditor />
        </ErrorBoundary>
      </Collapse.Panel>
      <Collapse.Panel itemKey="modelSettings" header={t('nodes.llm.form.modelSettings')}>
        <FormItem name={t('nodes.llm.form.modelType')} type="string" required>
          <ModelTypeSelector />
        </FormItem>
        <TemperatureSelector />
      </Collapse.Panel>
      <Collapse.Panel itemKey="systemPrompts" header={t('nodes.llm.form.systemPrompt')}>
        <SystemPromptInput />
      </Collapse.Panel>
      <Collapse.Panel itemKey="userPrompts" header={t('nodes.llm.form.userPrompt')}>
        <PromptInput />
      </Collapse.Panel>
    </Collapse>
  );
});
