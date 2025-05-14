import React, { useEffect, useState } from "react";
import {
  Nav,
  Avatar,
  Dropdown,
  Button,
  Layout,
  Spin,
  Typography,
  Image,
  List,
  Modal,
  Form,
  Toast,
  Pagination,
} from "@douyinfe/semi-ui";
import { IconPlus } from "@douyinfe/semi-icons";
import logo from "@/assets/logo_o.svg";
import { getAllFlow, awaitWrapper, saveData } from "@/api";
import { StoreContext } from "@/store";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChangeLang } from "@/components";

interface CreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({
  visible,
  onCancel,
  onOk,
}) => {
  const [formApi, setFormApi] = useState<Form["formApi"] | null>(null);
  const { state, dispatch } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const handleCreateFlow = async () => {
    try {
      const formValues = formApi!.getValues();
      setLoading(true);
      // 假设我们使用saveData接口来创建新流程
      const [err, res] = await awaitWrapper(
        saveData({
          f_Caption: formValues.flowName,
          f_CreateUserId: state.userId,
          f_IndustryCategory: "",
          f_Description: formValues.flowDescription ?? "",
          f_OnionFlowSchemeData: "",
          f_Type: "0",
          f_TeamId: "",
          f_TeamOnionFlowFileGroup: "",
          // 其他必要的字段
        })
      );
      if (err) {
        Toast.error(t("boardPage.createModal.tip.createFailed"));
        setLoading(false);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
      onOk();
      Toast.success(t("boardPage.createModal.tip.createSuccess"));
    } catch (error) {
      setLoading(false);
      console.error("创建流程出错", error);
      Toast.error(t("boardPage.createModal.tip.createFailed"));
    }
  };
  const handleOk = async () => {
    try {
      const validateResult = await formApi!.validate();
      if (validateResult.errors) {
        return;
      }
      handleCreateFlow();
    } catch (error) {
      console.error("表单验证失败", error);
    }
  };

  return (
    <Modal
      title={t("boardPage.createModal.title")}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button
          loading={loading}
          key="submit"
          type="primary"
          onClick={handleOk}
        >
          {t("boardPage.createModal.okText")}
        </Button>,
      ]}
      width={600}
    >
      <Form getFormApi={setFormApi} style={{ padding: "12px 0" }}>
        <Form.Input
          field="flowName"
          label={t("boardPage.createModal.flowName.label")}
          placeholder={t("boardPage.createModal.flowName.placeholder")}
          rules={[
            {
              required: true,
              message: t("boardPage.createModal.flowName.errorRequired"),
            },
          ]}
        />
        <Form.TextArea
          field="flowDescription"
          label={t("boardPage.createModal.flowDescription.label")}
          placeholder={t("boardPage.createModal.flowDescription.placeholder")}
          rules={[
            {
              required: true,
              message: t("boardPage.createModal.flowDescription.errorRequired"),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};
export const Board: React.FC = () => {
  const { Header, Footer, Sider, Content } = Layout;
  const { Title, Text } = Typography;
  const [flowList, setFlowList] = useState<Array<any>>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { state, dispatch } = useContext(StoreContext);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "reset" });
    navigate("/login");
  };

  const TopHeader = () => (
    <Header style={{ backgroundColor: "var(--semi-color-bg-1)" }}>
      <div>
        <Nav
          mode={"horizontal"}
          // items={[{ itemKey: "user", text: "用户管理", icon: <IconStar /> }]}
          onSelect={(key) => console.log(key)}
          header={{
            logo: <img src={logo} style={{ height: "36px", fontSize: 36 }} />,
            text: t("boardPage.title"),
          }}
          footer={
            <div style={{ display: "flex", alignItems: "center" }}>
              <ChangeLang style={{ marginRight: 18 }} />
              <Dropdown
                position="bottomRight"
                render={
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleLogout}>
                      {t("boardPage.logout")}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                }
              >
                <Avatar size="small" color="light-blue" style={{ margin: 4 }}>
                  {t("boardPage.user")}
                </Avatar>
                <span>{state.userName}</span>
              </Dropdown>
            </div>
          }
        />
      </div>
    </Header>
  );

  const actGetFlowList = async () => {
    const [err, res] = await awaitWrapper(
      getAllFlow({
        userId: state.userId,
        pageIndex: currentPage,
        pageSize: 8,
      })
    );
    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };

  const getList = async () => {
    setLoading(true);

    const [err, data] = await actGetFlowList();
    if (data) {
      setFlowList(data.items);
      setTotal(data.totalCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    getList();
  }, [currentPage]);

  const toEditFlow = (item: any) => {
    const queryParams = new URLSearchParams();
    queryParams.set("flowId", item.f_Id);
    queryParams.set("flowName", item.f_Caption);
    queryParams.set("flowDescription", item.f_Description);
    queryParams.set("userId", state.userId);
    window.open(`/editor?${queryParams.toString()}`, "_blank");
  };
  return (
    <Layout
      style={{
        border: "1px solid var(--semi-color-border)",
        width: "100%",
        height: "100vh",
        padding: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <TopHeader />
      <Content
        style={{
          padding: "12px",
          backgroundColor: "var(--semi-color-bg-0)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "space-between",
          }}
        >
          <Title heading={5} style={{ margin: "8px 0" }}>
            {t("boardPage.allFlow")}
          </Title>
          <Button icon={<IconPlus />} onClick={() => setModalVisible(true)}>
            {t("boardPage.createFlow")}
          </Button>
        </div>
        <div
          style={{
            borderRadius: "10px",
            boxSizing: "border-box",
            border: "1px solid var(--semi-color-border)",
            height: "calc(100% - 40px)",
            backgroundColor: "var(--semi-color-bg-1)",
            padding: "32px",
            overflow: "auto",
          }}
        >
          {loading ? (
            <Spin
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          ) : (
            <>
              <List
                style={{ overflow: "hidden", padding: "16px" }} // 添加了内边距
                grid={{
                  gutter: 12,
                  xs: 0,
                  sm: 0,
                  md: 12,
                  lg: 8,
                  xl: 8,
                  xxl: 6,
                }}
                dataSource={flowList}
                renderItem={(item) => (
                  <List.Item
                    key={item.f_Id}
                    style={{
                      backgroundColor: "var(--semi-color-bg-0)", // 使用背景色变量
                      borderRadius: "8px", // 圆角
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // 阴影效果
                      marginBottom: "16px",
                      transition: "transform .2s ease-in-out", // 添加过渡效果
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        padding: "16px",
                        boxSizing: "border-box",
                      }}
                    >
                      {/* 判断 f_ImgUrl 是否为空，为空则显示提示文字 */}
                      {item.f_ImgUrl ? (
                        <Image
                          style={{ width: "100%", height: "150px" }}
                          imgStyle={{
                            width: "100%", // 图片宽度随父容器宽度变化
                            height: "150px", // 固定高度
                            objectFit: "cover", // 保持图片比例并裁剪超出部分
                            borderRadius: "8px",
                            marginBottom: "12px",
                          }}
                          src={item.f_ImgUrl}
                          alt={item.f_Caption}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 150,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "var(--semi-color-bg-3)", // 设置背景颜色
                            color: "var(--semi-color-text-2)",
                            borderRadius: "8px",
                            marginBottom: "12px",
                            fontSize: "14px", // 设置字体大小
                            fontWeight: 500, // 设置字体粗细
                            border: "1px dashed var(--semi-color-border)", // 可选：添加边框
                          }}
                        >
                          {t("boardPage.emptyImageText")}
                        </div>
                      )}
                      <Title
                        heading={6}
                        style={{ margin: "8px 0" }}
                        ellipsis={{ rows: 1, expandable: false }} // 启用省略号
                      >
                        {item.f_Caption}
                      </Title>
                      <Text
                        style={{ margin: "8px 0" }}
                        ellipsis={{ rows: 1, expandable: false }} // 启用省略号，允许两行显示
                      >
                        {item.f_Description}
                      </Text>
                      <Button
                        type="primary"
                        theme="solid"
                        onClick={() => toEditFlow(item)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "4px",
                        }}
                      >
                        {t("boardPage.editFlow")}
                      </Button>
                    </div>
                  </List.Item>
                )}
              />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                  total={total}
                  currentPage={currentPage}
                  pageSize={8}
                  onChange={(page) => {
                    setCurrentPage(page);
                    getList();
                  }}
                />
              </div>
            </>
          )}
        </div>
      </Content>

      <CreateModal
        onOk={() => {
          setModalVisible(false);
          getList();
        }}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
      />
    </Layout>
  );
};
