import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  Button,
  Input,
  Typography,
  Modal,
  Space,
  Empty,
  Spin,
  RadioGroup,
  Radio,
  Select,
  Collapse,
  Tooltip,
  Table,
} from "@douyinfe/semi-ui";
import {
  IconPlus,
  IconDelete,
  IconHelpCircle,
  IconEdit,
  IconMinus,
  IconSearch,
  IconPlusCircle,
  IconRefresh,
} from "@douyinfe/semi-icons";
import { useTranslation } from "react-i18next";

import { Field, FormRenderProps } from "@flowgram.ai/free-layout-editor";
import { FlowNodeJSON } from "../../typings";
import { TypeSelect } from "../../form-components";
import { FxExpression, FxIcon } from "../../form-components/fx-expression";
import { ParamsArrayEditor } from "@/components";
import { OutputParamsEditor } from "@/components/output-params-editor";

const { Text } = Typography;

// 系统预设的知识库输入参数
const KB_BUILT_IN_INPUTS = ["knowledgeBase", "customParams"];
// 系统预设的知识库输出参数
const KB_BUILT_IN_OUTPUTS = ["outputList", "rowNum"];

// 定义JsonSchema类型
interface JsonSchema {
  type?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  [key: string]: any;
}

// 数据类型选项
const DATA_TYPES = [
  { label: "String", value: "string" },
  { label: "Number", value: "number" },
  { label: "Integer", value: "integer" },
  { label: "Boolean", value: "boolean" },
  { label: "Array", value: "array" },
  { label: "Object", value: "object" },
  { label: "表达式", value: "expression" },
];

// 自定义节点区块组件
const SectionBlock = ({
  title,
  children,
  action,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div style={{ marginBottom: "16px" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "8px",
      }}
    >
      <Text strong style={{ fontSize: "14px" }}>
        {title}
      </Text>
      {action}
    </div>
    <div>{children}</div>
  </div>
);

// 修改模拟的知识库列表
const mockKnowledgeBases = [
  {
    id: "kb_support",
    name: "客户支持知识库",
    type: "知识库",
    desc: "包含客户服务常见问题和解决方案",
  },
  {
    id: "kb_product_manual",
    name: "产品手册",
    type: "知识库",
    desc: "产品使用指南和功能说明",
  },
  {
    id: "kb_technical_docs",
    name: "技术文档",
    type: "知识库",
    desc: "技术规范和API文档",
  },
  {
    id: "kb_faq",
    name: "常见问题解答",
    type: "知识库",
    desc: "用户常见问题汇总",
  },
  {
    id: "kb_internal_policy",
    name: "内部政策",
    type: "知识库",
    desc: "公司内部规章制度和流程",
  },
];

// 创建一个上下文来共享知识库状态
const KnowledgeBaseContext = React.createContext<{
  knowledgeBases: Array<{
    id: string;
    name: string;
    type: string;
    desc: string;
  }>;
  setKnowledgeBases: React.Dispatch<
    React.SetStateAction<
      Array<{ id: string; name: string; type: string; desc: string }>
    >
  >;
}>({
  knowledgeBases: mockKnowledgeBases,
  setKnowledgeBases: () => {},
});

// 知识库选择器模态框
interface KnowledgeBaseSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (knowledgeBaseId: string) => void;
  currentSelected: string | null;
}

// 知识库选择弹窗组件
const KnowledgeBaseSelectorModal: React.FC<KnowledgeBaseSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  currentSelected,
}) => {
  const { t } = useTranslation();
  // 使用上下文中的知识库
  const { knowledgeBases, setKnowledgeBases } =
    useContext(KnowledgeBaseContext);

  // 状态管理
  const [selectedKB, setSelectedKB] = useState<string | null>(currentSelected);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  // 组件加载时初始化
  useEffect(() => {
    if (visible) {
      setSelectedKB(currentSelected);
      setSearchText("");
      // 模拟加载知识库
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [visible, currentSelected]);

  // 选择知识库
  const handleSelectKB = (kbId: string) => {
    setSelectedKB(kbId);
  };

  // 刷新知识库
  const refreshKnowledgeBases = () => {
    setLoading(true);
    // 模拟刷新过程
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedKB) {
      onSelect(selectedKB);
      onClose();
    }
  };

  // 过滤知识库
  const getFilteredKnowledgeBases = () => {
    if (!searchText) return knowledgeBases;

    return knowledgeBases.filter(
      (kb) =>
        kb.name.toLowerCase().includes(searchText.toLowerCase()) ||
        kb.desc.toLowerCase().includes(searchText.toLowerCase()) ||
        kb.type.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  return (
    <Modal
      title={t("nodes.knowledge_base.knowledgeBaseSelector.title")}
      visible={visible}
      onCancel={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="tertiary" onClick={onClose} style={{ marginRight: 8 }}>
            {t("nodes.knowledge_base.knowledgeBaseSelector.cancel")}
          </Button>
          <Button type="primary" onClick={handleConfirm} disabled={!selectedKB}>
            {t("nodes.knowledge_base.knowledgeBaseSelector.confirm")}
          </Button>
        </div>
      }
      width={800}
    >
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input
          prefix={<IconSearch />}
          placeholder={t("nodes.knowledge_base.knowledgeBaseSelector.search")}
          value={searchText}
          onChange={setSearchText}
          style={{ width: "300px" }}
        />
        <div>
          <Button
            icon={<IconRefresh />}
            type="tertiary"
            onClick={refreshKnowledgeBases}
          >
            {t("nodes.knowledge_base.knowledgeBaseSelector.refresh")}
          </Button>
        </div>
      </div>

      <Table
        loading={loading}
        dataSource={getFilteredKnowledgeBases()}
        rowKey="id"
        pagination={false}
        onRow={(record) => {
          if (!record) return {};
          return {
            onClick: () => handleSelectKB(record.id),
            style: {
              cursor: "pointer",
              background: selectedKB === record.id ? "#f0f8ff" : "transparent",
            },
          };
        }}
        columns={[
          {
            title: t("nodes.knowledge_base.knowledgeBaseSelector.columns.name"),
            dataIndex: "name",
            width: 180,
            render: (text) => <Text strong>{text}</Text>,
          },
          {
            title: t("nodes.knowledge_base.knowledgeBaseSelector.columns.type"),
            dataIndex: "type",
            width: 120,
          },
          {
            title: t("nodes.knowledge_base.knowledgeBaseSelector.columns.description"),
            dataIndex: "desc",
            width: 150,
          },
        ]}
        empty={<Empty description={t("nodes.knowledge_base.knowledgeBaseSelector.emptyDescription")} style={{ padding: "40px 0" }} />}
      />
    </Modal>
  );
};

// 知识库输入组件
export const KnowledgeBaseInputs = ({
  form,
}: FormRenderProps<FlowNodeJSON>) => {
  const { t } = useTranslation();
  const [knowledgeBases, setKnowledgeBases] = useState(mockKnowledgeBases);
  const [kbSelectorVisible, setKbSelectorVisible] = useState(false);
  const [activeKeys, setActiveKeys] = useState([
    t("nodes.knowledge_base.form.inputParams"),
    t("nodes.knowledge_base.form.knowledgeBaseSettings"),
    t("nodes.knowledge_base.form.outputParams"),
  ]);
  const [rerender, setRerender] = useState(false); // 用于强制刷新组件的状态

  // 加载初始知识库和确保输出参数初始化
  useEffect(() => {
    try {
      // 确保输出参数已经初始化
      const currentOutputs = form.getValueIn("outputs.properties") || {};
      if (!currentOutputs.outputList) {
        // 添加默认的输出参数
        const defaultOutputs = {
          ...currentOutputs,
          outputList: {
            type: "array",
            title: t("nodes.knowledge_base.outputs.outputList"),
            description: t("nodes.knowledge_base.description"),
            items: {
              type: "object",
            },
          },
          rowNum: {
            type: "integer",
            title: t("nodes.knowledge_base.outputs.rowNum"),
            description: t("nodes.knowledge_base.outputs.rowNum"),
          },
        };
        form.setValueIn("outputs.properties", defaultOutputs);

        // 确保通过表单提交来同步状态
        safeSubmitForm();
      }
    } catch (error) {
      console.error(t("common.errors.initParams"), error);
    }
  }, [form, t]);

  // 添加自定义参数
  const handleAddInputParam = useCallback(() => {
    const timestamp = Date.now();
    const tempName = `param_${timestamp}`;

    // 获取当前输入属性
    const currentInputs = form.getValueIn("inputs.properties") || {};
    const updatedInputs = {
      ...currentInputs,
      [tempName]: {
        type: "string",
        title: tempName,
        description: `${t("nodes.knowledge_base.inputs.customParams")}: ${tempName}`,
      },
    };

    // 获取当前输入值
    const currentValues = form.getValueIn("inputsValues") || {};
    const updatedValues = { ...currentValues, [tempName]: "" };

    // 分别更新属性和值
    form.setValueIn("inputs.properties", updatedInputs);
    form.setValueIn("inputsValues", updatedValues);

    // 确保通过表单提交来同步状态
    const formAny = form as any;
    if (typeof formAny.submit === "function") {
      setTimeout(() => {
        formAny.submit();
      }, 10);
    }

    // 强制刷新界面
    setRerender((prev) => !prev);
  }, [form, t]);

  // 删除参数
  const handleDeleteInputParam = useCallback(
    (key: string) => {
      // 更新参数定义
      const inputs = { ...form.getValueIn("inputs.properties") };
      delete inputs[key];
      form.setValueIn("inputs.properties", inputs);

      // 更新参数值
      const inputsValues = { ...form.getValueIn("inputsValues") };
      delete inputsValues[key];
      form.setValueIn("inputsValues", inputsValues);

      // 确保通过表单提交来同步状态
      const formAny = form as any;
      if (typeof formAny.submit === "function") {
        setTimeout(() => {
          formAny.submit();
        }, 10);
      }

      // 强制刷新界面
      setRerender((prev) => !prev);
    },
    [form]
  );

  // 更新所有参数的函数
  const safeSubmitForm = () => {
    try {
      const formAny = form as any;
      if (typeof formAny.submit === "function") {
        setTimeout(() => {
          try {
            formAny.submit();
          } catch (error) {
            console.error(t("common.errors.formSubmit"), error);
          }
        }, 0);
      }
    } catch (error) {
      console.error(t("common.errors.prepareFormSubmit"), error);
    }
  };

  // 参数定义变更处理
  const handlePropertyChange = useCallback(
    (newProps: Record<string, JsonSchema>) => {
      try {
        // 获取当前输入属性
        const inputs = form.getValueIn("inputs.properties") || {};

        // 准备最终的属性对象，先只包含内置参数
        const builtInProps: Record<string, JsonSchema> = {};
        Object.keys(inputs).forEach((key) => {
          if (KB_BUILT_IN_INPUTS.includes(key)) {
            builtInProps[key] = inputs[key];
          }
        });

        // 合并内置参数和新的自定义参数
        const finalUpdatedProps = {
          ...builtInProps,
          ...newProps,
        };

        // 更新属性
        form.setValueIn("inputs.properties", finalUpdatedProps);

        // 确保通过表单提交来同步状态
        safeSubmitForm();
      } catch (error) {
        console.error(t("common.errors.updateParamProps"), error);
      }
    },
    [form, t]
  );

  // -- 知识库选择逻辑 --
  // 输出参数处理回调
  const handleOutputChange = useCallback(
    (path: string, value: JsonSchema) => {
      try {
        form.setValueIn(path, value);
        safeSubmitForm();
      } catch (error) {
        console.error(t("common.errors.updateOutputParam"), error);
      }
    },
    [form, t]
  );

  const handleDeleteOutput = useCallback(
    (path: string, key: string) => {
      try {
        // 如果是内置输出参数，不允许删除
        if (KB_BUILT_IN_OUTPUTS.includes(key)) {
          return;
        }

        const parentPropertiesPath = `${path}.properties`;
        const parentProps = form.getValueIn(parentPropertiesPath) as
          | Record<string, JsonSchema>
          | undefined;
        if (parentProps) {
          const newProps = { ...parentProps };
          delete newProps[key];
          form.setValueIn(parentPropertiesPath, newProps);

          // 确保通过表单提交来同步状态
          safeSubmitForm();
        }
      } catch (error) {
        console.error(t("common.errors.deleteOutputParam"), error);
      }
    },
    [form, t]
  );

  const handleRenameKey = useCallback(
    (path: string, oldKey: string, newKey: string) => {
      // 如果是内置输出参数，不允许重命名
      if (KB_BUILT_IN_OUTPUTS.includes(oldKey)) {
        return;
      }

      const propertiesPath = `${path}.properties`;
      const currentProps = form.getValueIn(propertiesPath) as
        | Record<string, JsonSchema>
        | undefined;
      if (!currentProps || currentProps[newKey]) return; // 如果已存在同名属性，不执行重命名

      const updatedProps = Object.entries(currentProps).reduce(
        (acc, [propKey, propValue]) => {
          acc[propKey === oldKey ? newKey : propKey] = propValue;
          return acc;
        },
        {} as Record<string, JsonSchema>
      );

      form.setValueIn(propertiesPath, updatedProps);

      // 确保通过表单提交来同步状态
      const formAny = form as any;
      if (typeof formAny.submit === "function") {
        setTimeout(() => {
          formAny.submit();
        }, 10);
      }
    },
    [form]
  );

  const handleAddChildOutput = useCallback(
    (path: string) => {
      try {
        const propertiesPath = `${path}.properties`;
        const currentProps =
          (form.getValueIn(propertiesPath) as Record<string, JsonSchema>) || {};
        let newKey = `child${Object.keys(currentProps).length}`;
        while (currentProps[newKey]) {
          newKey = `child${parseInt(newKey.replace("child", ""), 10) + 1}`;
        }

        const newProps = {
          ...currentProps,
          [newKey]: { type: "string", description: t("components.outputParamsEditor.newProperty", { name: newKey }) },
        };
        form.setValueIn(propertiesPath, newProps);

        // 确保通过表单提交来同步状态
        safeSubmitForm();
      } catch (error) {
        console.error(t("common.errors.addChildParam"), error);
      }
    },
    [form, t]
  );

  const addTopLevelOutput = useCallback(() => {
    try {
      const propertiesPath = "outputs.properties";
      const currentProps =
        (form.getValueIn(propertiesPath) as Record<string, JsonSchema>) || {};
      // 过滤掉内置输出参数
      const customKeys = Object.keys(currentProps).filter(
        (k) => !KB_BUILT_IN_OUTPUTS.includes(k)
      );
      let newKey = `key${customKeys.length}`;
      while (currentProps[newKey]) {
        newKey = `key${parseInt(newKey.replace("key", ""), 10) + 1}`;
      }

      const newProps = {
        ...currentProps,
        [newKey]: { type: "string", description: t("components.outputParamsEditor.newOutput", { name: newKey }) },
      };
      form.setValueIn(propertiesPath, newProps);

      // 确保通过表单提交来同步状态
      safeSubmitForm();
    } catch (error) {
      console.error(t("common.errors.addTopLevelOutputParam"), error);
    }
  }, [form, t]);

  // -- 知识库选择逻辑 --
  const handleAddKnowledgeBase = () => setKbSelectorVisible(true);

  const handleKnowledgeBaseSelect = (knowledgeBaseId: string) => {
    try {
      // 查找选择的知识库
      const knowledgeBase = knowledgeBases.find(
        (kb) => kb.id === knowledgeBaseId
      );
      if (!knowledgeBase) {
        // 尝试直接使用ID作为名称（应急方案）
        form.setValueIn(
          "inputsValues.knowledgeBase",
          `${t("nodes.knowledge_base.simplifiedView.knowledgeBase")} ${knowledgeBaseId}`
        );
      } else {
        // 直接保存知识库名称
        form.setValueIn("inputsValues.knowledgeBase", knowledgeBase.name);
      }

      // 强制刷新界面
      setRerender((prev) => !prev);

      // 立即提交更改
      safeSubmitForm();
    } catch (error) {
      console.error(t("common.errors.selectKnowledgeBase"), error);
    }
  };

  const handleClearKnowledgeBase = () => {
    try {
      // 直接更新表单值
      form.setValueIn("inputsValues.knowledgeBase", "");

      // 强制刷新界面
      setRerender((prev) => !prev);

      // 确保通过表单提交来同步状态
      safeSubmitForm();
    } catch (error) {
      console.error(t("common.errors.clearKnowledgeBase"), error);
    }
  };

  const selectedKnowledgeBase =
    form.getValueIn("inputsValues.knowledgeBase") || "";

  const renderSelectedKnowledgeBase = () => {
    if (!selectedKnowledgeBase) {
      return (
        <div
          style={{
            padding: "12px 16px",
            color: "#888",
            textAlign: "center",
            border: "1px dashed #ccc",
            borderRadius: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          <span>{t("nodes.knowledge_base.form.noDataSourceSelected")}</span>
        </div>
      );
    }

    return (
      <div
        style={{
          padding: "8px 12px",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f5f5f5",
        }}
      >
        <Text strong>{selectedKnowledgeBase}</Text>
        <div>
          <Button
            type="danger"
            theme="borderless"
            size="small"
            onClick={handleClearKnowledgeBase}
          >
            {t("nodes.sql_executor.dataSource.remove")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <KnowledgeBaseContext.Provider
      value={{ knowledgeBases, setKnowledgeBases }}
    >
      <div>
        {/* 使用Collapse组件组织各部分 */}
        <Collapse
          expandIconPosition="left"
          activeKey={activeKeys}
          onChange={(keys) => setActiveKeys(keys as string[])}
        >
          {/* 自定义输入参数部分 - 参考SQL执行器的实现 */}
          <Collapse.Panel
            header={
              <div
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
              >
                <span>{t("nodes.knowledge_base.form.inputParams")}</span>
                <Tooltip
                  content={t("nodes.knowledge_base.form.noCustomParams")}
                  position="right"
                >
                  <IconHelpCircle
                    style={{ marginLeft: 4, color: "#888", cursor: "help" }}
                  />
                </Tooltip>
              </div>
            }
            itemKey={t("nodes.knowledge_base.form.inputParams")}
          >
            <div style={{ padding: "8px 0" }}>
              <ParamsArrayEditor
                arrayName="customParams"
                disabled={false}
                emptyText={t("nodes.knowledge_base.form.noCustomParams")}
                onSync={safeSubmitForm}
              />
            </div>
          </Collapse.Panel>

          {/* 知识库部分 */}
          <Collapse.Panel
            header={<Typography.Text strong>{t("nodes.knowledge_base.form.knowledgeBaseSettings")}</Typography.Text>}
            itemKey={t("nodes.knowledge_base.form.knowledgeBaseSettings")}
            extra={
              <Button
                icon={<IconPlusCircle />}
                theme="borderless"
                type="tertiary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // 阻止点击事件传播，避免触发面板折叠
                  handleAddKnowledgeBase();
                }}
                disabled={!!selectedKnowledgeBase}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  visibility: "visible",
                }}
              />
            }
          >
            {/* 添加key属性以确保在数据变化时重新渲染 */}
            <div
              key={`knowledge-base-${selectedKnowledgeBase}-${rerender}`}
              style={{ position: "relative" }}
            >
              {renderSelectedKnowledgeBase()}

              {/* 在面板内部也添加一个加号按钮，确保在展开状态也能看到 */}
              {!selectedKnowledgeBase && (
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    zIndex: 1,
                  }}
                >
                  <Button
                    icon={<IconPlusCircle />}
                    theme="borderless"
                    type="tertiary"
                    size="small"
                    onClick={handleAddKnowledgeBase}
                  />
                </div>
              )}
            </div>
          </Collapse.Panel>

          {/* 输出参数部分 - 参考SQL执行器实现 */}
          <Collapse.Panel
            header={
              <div
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
              >
                <span>{t("nodes.knowledge_base.form.outputParams")}</span>
                <Tooltip
                  content={t("components.outputParamsEditor.tooltip")}
                  position="right"
                >
                  <IconHelpCircle
                    style={{ marginLeft: 4, color: "#888", cursor: "help" }}
                  />
                </Tooltip>
              </div>
            }
            itemKey={t("nodes.knowledge_base.form.outputParams")}
          >
            <div style={{ padding: "8px 0" }}>
              {/* 使用通用的OutputParamsEditor替代原来的自定义实现 */}
              <Field name="outputs">
                {({ field }) => <OutputParamsEditor paramPath="outputs" />}
              </Field>
            </div>
          </Collapse.Panel>
        </Collapse>

        {/* 知识库选择模态框 */}
        <KnowledgeBaseSelectorModal
          visible={kbSelectorVisible}
          onClose={() => setKbSelectorVisible(false)}
          onSelect={handleKnowledgeBaseSelect}
          currentSelected={null}
        />
      </div>
    </KnowledgeBaseContext.Provider>
  );
};
