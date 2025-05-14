import { useCallback, useContext, useState, useRef } from "react";
import { useClientContext, useRefresh } from "@flowgram.ai/free-layout-editor";
import { useTranslation } from "react-i18next";

import {
  Button,
  Tooltip,
  Modal,
  Table,
  Typography,
  Empty,
  Collapse,
  Form,
  Toast,
} from "@douyinfe/semi-ui";
import type { FormApi } from "@douyinfe/semi-ui/lib/es/form";
import {
  IconSetting,
  IconPlus,
  IconDelete,
  IconEdit,
} from "@douyinfe/semi-icons";
import { StoreContext, VariableTypesEnum } from "@/store";

const { Text } = Typography;

export function GlobalVariable(props: { disabled: boolean }) {
  const { playground } = useClientContext();
  const refresh = useRefresh();
  const { state, dispatch } = useContext(StoreContext);
  const [visible, setVisible] = useState(false);
  const context = useClientContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariable, setEditingVariable] = useState<any>(null);
  const formRef = useRef<FormApi>();
  const [activeKeys, setActiveKeys] = useState<string[]>(["system", "user"]);
  const { t } = useTranslation();

  // 筛选用户变量和系统变量
  const userVariables = state.variableList.filter(
    (variable) => variable.type === VariableTypesEnum.USER
  );
  const systemVariables = state.variableList.filter(
    (variable) => variable.type === VariableTypesEnum.SYSTEM
  );

  const handleConfig = useCallback(async () => {
    setVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setVisible(false);
  }, []);

  // 添加新的用户变量
  const handleAddVariable = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVariable(null);
    setShowAddForm(true);
    // 确保用户变量面板展开
    if (!activeKeys.includes("user")) {
      setActiveKeys([...activeKeys, "user"]);
    }
  };

  // 处理面板展开状态变化
  const handleCollapseChange = (activeKey: string | string[] | undefined) => {
    if (activeKey) {
      setActiveKeys(Array.isArray(activeKey) ? activeKey : [activeKey]);
    } else {
      setActiveKeys([]);
    }
  };

  // 保存新变量
  const handleSaveVariable = useCallback(() => {
    formRef.current
      ?.validate()
      .then((values) => {
        const { title, value, description } = values;

        if (editingVariable) {
          // 编辑现有变量
          const updatedVariables = state.variableList.map((variable) => {
            if (
              variable.title === editingVariable.title &&
              variable.type === VariableTypesEnum.USER
            ) {
              return {
                ...variable,
                title,
                value,
                description,
              };
            }
            return variable;
          });

          dispatch({
            type: "setVariableList",
            payload: updatedVariables,
          });
          Toast.success(t("tools.globalVariable.modal.tip.editSuccess"));
        } else {
          // 添加新变量
          if (state.variableList.find((item) => item.title === title)) {
            Toast.error(t("tools.globalVariable.modal.tip.duplicateError"));
            return;
          }
          dispatch({
            type: "setVariableList",
            payload: [
              ...state.variableList,
              {
                title,
                value,
                description,
                type: VariableTypesEnum.USER,
              },
            ],
          });
          Toast.success(t("tools.globalVariable.modal.tip.addSuccess"));
        }

        formRef.current?.reset();
        setShowAddForm(false);
        setEditingVariable(null);
      })
      .catch((errors) => {
        console.log(errors);
      });
  }, [state, dispatch, editingVariable]);

  const hideHandler = useCallback(() => {
    formRef.current?.reset();
    setShowAddForm(false);
    setEditingVariable(null);
  }, []);

  // 编辑变量
  const handleEditVariable = (variable: any) => {
    setEditingVariable(variable);
    setShowAddForm(true);

    // 确保用户变量面板展开
    if (!activeKeys.includes("user")) {
      setActiveKeys([...activeKeys, "user"]);
    }

    // 设置表单初始值
    setTimeout(() => {
      formRef.current?.setValues({
        title: variable.title,
        value: variable.value,
        description: variable.description,
      });
    }, 0);
  };

  // 删除变量
  const handleDeleteVariable = (index: number) => {
    const updatedVariables = [...state.variableList];
    // 找到用户变量中对应索引在总变量列表中的位置
    const userVarIndex = state.variableList.findIndex(
      (v, i) =>
        v.type === VariableTypesEnum.USER &&
        userVariables.findIndex(
          (uv, ui) => ui === index && uv.title === v.title
        ) !== -1
    );

    if (userVarIndex !== -1) {
      updatedVariables.splice(userVarIndex, 1);
      dispatch({
        type: "setVariableList",
        payload: updatedVariables,
      });
      Toast.success(t("tools.globalVariable.modal.tip.deleteSuccess"));
    }
  };

  // 用户变量表格列定义
  const userColumns = [
    {
      title: () => {
        return t("tools.globalVariable.modal.user.columns.name");
      },
      dataIndex: "title",
      key: "title",
    },
    {
      title: () => {
        return t("tools.globalVariable.modal.user.columns.value");
      },
      dataIndex: "value",
      key: "value",
    },
    {
      title: () => {
        return t("tools.globalVariable.modal.user.columns.description");
      },
      dataIndex: "description",
      key: "description",
    },
    {
      title: () => {
        return t("tools.globalVariable.modal.user.columns.action");
      },
      key: "action",
      render: (_text: any, record: any, index: number) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            theme="borderless"
            icon={<IconEdit />}
            size="small"
            onClick={() => handleEditVariable(record)}
          />
          <Button
            type="danger"
            theme="borderless"
            icon={<IconDelete />}
            size="small"
            onClick={() => handleDeleteVariable(index)}
          />
        </div>
      ),
    },
  ];

  // 自定义校验变量名是否重复
  const validateVariableName = (rule: any, value: string) => {
    // 如果是编辑状态且变量名没有改变，则跳过重复检查
    if (editingVariable && editingVariable.title === value) {
      return true;
    }

    if (state.variableList.find((item) => item.title === value)) {
      return false;
    }
    return true;
  };

  // 系统变量表格列定义
  const systemColumns = [
    {
      title: () => {
        return t("tools.globalVariable.modal.system.columns.name");
      },
      dataIndex: "title",
      key: "title",
    },
    {
      title: () => {
        return t("tools.globalVariable.modal.system.columns.value");
      },
      dataIndex: "value",
      key: "value",
      render: () => <Text>--</Text>,
    },
    {
      title: () => {
        return t("tools.globalVariable.modal.system.columns.description");
      },
      dataIndex: "description",
      key: "description",
    },
  ];

  return (
    <>
      <Tooltip content={t("tools.globalVariable.description")}>
        <Button
          icon={<IconSetting />}
          disabled={props.disabled}
          onClick={handleConfig}
          style={{
            backgroundColor: "rgba(171,181,255,0.3)",
            borderRadius: "8px",
          }}
        >
          {t("tools.globalVariable.title")}
        </Button>
      </Tooltip>

      <Modal
        title={t("tools.globalVariable.modal.title")}
        visible={visible}
        onCancel={handleCloseModal}
        footer={null}
        closeOnEsc={true}
        width={600}
      >
        <div style={{ padding: "12px 0" }}>
          <Collapse
            accordion={false}
            expandIconPosition="left"
            activeKey={activeKeys}
            onChange={handleCollapseChange}
          >
            <Collapse.Panel
              header={t("tools.globalVariable.modal.system.title")}
              itemKey="system"
            >
              <Table
                columns={systemColumns}
                dataSource={systemVariables}
                pagination={false}
                size="small"
                empty={
                  <Empty
                    image={
                      <div style={{ marginBottom: 16 }}>
                        {t("tools.globalVariable.modal.system.empty.title")}
                      </div>
                    }
                    description={t(
                      "tools.globalVariable.modal.system.empty.description"
                    )}
                  />
                }
              />
            </Collapse.Panel>
            <Collapse.Panel
              header={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <span>
                    {t("tools.globalVariable.modal.system.columns.description")}
                  </span>
                  <Button
                    type="primary"
                    icon={<IconPlus />}
                    size="small"
                    onClick={handleAddVariable}
                  />
                </div>
              }
              itemKey="user"
            >
              {showAddForm && (
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px",
                    border: "1px solid var(--semi-color-border)",
                    borderRadius: "4px",
                  }}
                >
                  <Form getFormApi={(api) => (formRef.current = api)}>
                    <Form.Input
                      field="title"
                      label={t(
                        "tools.globalVariable.modal.user.form.name.label"
                      )}
                      placeholder={t(
                        "tools.globalVariable.modal.user.form.name.placeholder"
                      )}
                      rules={[
                        {
                          required: true,
                          message: t(
                            "tools.globalVariable.modal.user.form.name.emptyError"
                          ),
                        },
                        {
                          validator: validateVariableName,
                          message: t(
                            "tools.globalVariable.modal.user.form.name.duplicateError"
                          ),
                        },
                      ]}
                      disabled={!!editingVariable}
                    />
                    <Form.Input
                      field="value"
                      label={t(
                        "tools.globalVariable.modal.user.form.value.label"
                      )}
                      placeholder={t(
                        "tools.globalVariable.modal.user.form.value.placeholder"
                      )}
                      rules={[
                        {
                          required: true,
                          message: t(
                            "tools.globalVariable.modal.user.form.value.emptyError"
                          ),
                        },
                      ]}
                    />
                    <Form.Input
                      field="description"
                      label={t(
                        "tools.globalVariable.modal.user.form.description.label"
                      )}
                      placeholder={t(
                        "tools.globalVariable.modal.user.form.description.placeholder"
                      )}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                        marginTop: "12px",
                      }}
                    >
                      <Button onClick={hideHandler}>
                        {t(
                          "tools.globalVariable.modal.user.form.action.cancel"
                        )}
                      </Button>
                      <Button type="primary" onClick={handleSaveVariable}>
                        {editingVariable
                          ? t(
                              "tools.globalVariable.modal.user.form.action.edit"
                            )
                          : t(
                              "tools.globalVariable.modal.user.form.action.save"
                            )}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
              <Table
                columns={userColumns}
                dataSource={userVariables}
                pagination={false}
                empty={
                  <Empty
                    image={
                      <div style={{ marginBottom: 16 }}>
                        {t("tools.globalVariable.modal.user.empty.title")}
                      </div>
                    }
                    description={t(
                      "tools.globalVariable.modal.user.empty.description"
                    )}
                  />
                }
                size="small"
              />
            </Collapse.Panel>
          </Collapse>
        </div>
      </Modal>
    </>
  );
}
