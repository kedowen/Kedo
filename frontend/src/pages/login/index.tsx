import logo from "@/assets/logo-kedo.png";
import { LoginContainer, FooterContainer } from "./styles";
import { Form, Button, Input, Tabs, Checkbox, Toast } from "@douyinfe/semi-ui";
import { IconUser, IconLock, IconMail } from "@douyinfe/semi-icons";
import { useState } from "react";
import {
  register,
  getCaptcha,
  loginByPassword,
  loginByCaptcha,
  awaitWrapper,
} from "@/api";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "@/store";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { ChangeLang } from "@/components";
export const Login: React.FC = () => {
  const [formType, setFormType] = useState("login");
  const navigate = useNavigate();
  const { state, dispatch } = useContext(StoreContext);
  const { t } = useTranslation();
  const Header = () => {
    return (
      <div
        style={{
          width: "1400px",
          margin: "0 auto",
          height: "100px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <img src={logo} style={{ height: "48px" }} />
        <ChangeLang />
      </div>
    );
  };
  const actGetCaptcha = async (mobile: string) => {
    const [err, res] = await awaitWrapper(getCaptcha({ phoneNum: mobile }));
    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };

  const actLoginByPassword = async (account: string, password: string) => {
    const [err, res] = await awaitWrapper(
      loginByPassword({ f_Account: account, f_Password: password })
    );
    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };

  const actLoginByCaptcha = async (account: string, captcha: string) => {
    const [err, res] = await awaitWrapper(
      loginByCaptcha({ f_Account: account, f_VerificationCode: captcha })
    );
    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };

  const actRegister = async (
    account: string,
    password: string,
    captcha: string
  ) => {
    const [err, res] = await awaitWrapper(
      register({
        f_UserName: "",
        f_Mobile: account,
        f_CompanyName: "",
        f_Email: "",
        f_IndustryCategory: "",
        f_Job: "",
        f_VerificationCode: captcha,
        f_Password: password,
        f_Secretkey: "",
      })
    );
    if (res && res.data) {
      return [null, res.data];
    } else {
      return [err, null];
    }
  };
  const LoginForm = () => {
    const [loginType, setLoginType] = useState("password");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [formApi, setFormApi] = useState<any>(null);
    const handleLogin = async () => {
      const validateResult = await formApi.validate();
      if (validateResult.errors) {
        return;
      }
      setLoading(true);
      try {
        const formValues = formApi.getValues();
        const mobile = formValues.mobile;
        let err, data;
        if (loginType === "password") {
          const password = formValues.password;
          [err, data] = await actLoginByPassword(mobile, password);
        } else {
          const captcha = formValues.captcha;
          [err, data] = await actLoginByCaptcha(mobile, captcha);
        }
        if (!err) {
          // token
          localStorage.setItem("token", data.token);
          // 存储用户信息
          dispatch({
            type: "setUserId",
            payload: data.f_UserId,
          });
          dispatch({
            type: "setUserName",
            payload: data.f_Account,
          });
          Toast.success(t("loginPage.tip.loginSuccess"));
          navigate("/", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    const handleGetCaptcha = async () => {
      const { mobile } = formApi.getValues();
      const validateResult = await formApi.validate(["mobile"]);

      if (validateResult.errors && validateResult.errors.mobile) {
        return;
      }
      setCaptchaLoading(true);
      try {
        const [err, res] = await actGetCaptcha(mobile);
        if (!err) {
          Toast.success(t("loginPage.tip.getCaptchaSuccess"));
        }
      } finally {
        setCaptchaLoading(false);
      }
    };

    return (
      <div className="login-form" style={{ width: "400px", padding: "20px 0" }}>
        <Tabs type="line" onChange={(key) => setLoginType(key)}>
          <Tabs.TabPane
            tab={t("loginPage.tabs.passwordLogin")}
            itemKey="password"
          />
          <Tabs.TabPane tab={t("loginPage.tabs.captchaLogin")} itemKey="code" />
        </Tabs>
        <Form
          style={{ marginTop: "24px" }}
          getFormApi={(api) => setFormApi(api)}
          onSubmit={handleLogin}
        >
          <Form.Input
            field="mobile"
            label={t("loginPage.phone.label")}
            placeholder={t("loginPage.phone.placeholder")}
            prefix={<IconUser />}
            size="large"
            rules={[
              { required: true, message: t("loginPage.phone.errorRequired") },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: t("loginPage.phone.errorFormat"),
              },
            ]}
          />

          {loginType === "password" ? (
            <Form.Input
              field="password"
              label={t("loginPage.password.label")}
              placeholder={t("loginPage.password.placeholder")}
              prefix={<IconLock />}
              mode="password"
              size="large"
              rules={[
                {
                  required: true,
                  message: t("loginPage.password.errorRequired"),
                },
              ]}
            />
          ) : (
            <Form.Input
              field="captcha"
              label={t("loginPage.captcha.label")}
              placeholder={t("loginPage.captcha.placeholder")}
              prefix={<IconMail />}
              size="large"
              style={{ flex: 1 }}
              rules={[
                {
                  required: true,
                  message: t("loginPage.captcha.errorRequired"),
                },
              ]}
              suffix={
                <Button
                  theme="borderless"
                  type="tertiary"
                  onClick={handleGetCaptcha}
                  loading={captchaLoading}
                >
                  {t("loginPage.captcha.getLabel")}
                </Button>
              }
            />
          )}

          {/* <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <Checkbox>记住密码</Checkbox> */}
          {/* <a href="#" style={{ color: "#0064C8" }}>
              忘记密码？
            </a> */}
          {/* </div> */}

          <Button
            theme="solid"
            type="primary"
            size="large"
            style={{ width: "100%", height: "44px", fontSize: "16px" }}
            htmlType="submit"
            loading={loading}
          >
            {t("loginPage.loginBtn.title")}
          </Button>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            {t("loginPage.switchLabel.login.title")}
            <a
              href="#"
              onClick={() => setFormType("register")}
              style={{ color: "#0064C8" }}
            >
              {t("loginPage.switchLabel.login.link")}
            </a>
          </div>
        </Form>
      </div>
    );
  };

  const RegisterForm = () => {
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [formApi, setFormApi] = useState<any>(null);
    const handleGetCaptcha = async () => {
      const { mobile } = formApi.getValues();
      const validateResult = await formApi.validate(["mobile"]);

      if (validateResult.errors && validateResult.errors.mobile) {
        return;
      }
      setCaptchaLoading(true);
      try {
        const [err, res] = await actGetCaptcha(mobile);
        if (!err) {
          Toast.success(t("loginPage.tip.getCaptchaSuccess"));
        }
      } finally {
        setCaptchaLoading(false);
      }
    };

    const handleRegister = async () => {
      const validateResult = await formApi.validate();
      if (validateResult.errors) {
        return;
      }
      setRegisterLoading(true);
      try {
        const formValues = formApi.getValues();
        const { mobile, captcha, password } = formValues;
        const [err, res] = await actRegister(mobile, password, captcha);
        if (!err) {
          Toast.success(t("loginPage.tip.registerSuccess"));
          // 注册成功后延迟切换到登录页面
          setTimeout(() => {
            setFormType("login");
          }, 1500);
        }
      } finally {
        setRegisterLoading(false);
      }
    };

    // 自定义校验函数：确认两次密码是否一致
    const validateConfirmPassword = (rule: any, value: string) => {
      const { password, confirmPassword } = formApi.getValues();
      if (password !== confirmPassword) {
        return false;
      }
      return true;
    };

    return (
      <div
        className="register-form"
        style={{ width: "400px", padding: "20px 0" }}
      >
        <Form
          style={{ marginTop: "24px" }}
          getFormApi={(api) => setFormApi(api)}
          onSubmit={handleRegister}
        >
          <Form.Input
            field="mobile"
            label={t("loginPage.phone.label")}
            placeholder={t("loginPage.phone.placeholder")}
            prefix={<IconUser />}
            size="large"
            rules={[
              { required: true, message: t("loginPage.phone.errorRequired") },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: t("loginPage.phone.errorFormat"),
              },
            ]}
          />
          <Form.Input
            field="captcha"
            label={t("loginPage.captcha.label")}
            placeholder={t("loginPage.captcha.placeholder")}
            prefix={<IconMail />}
            size="large"
            style={{ flex: 1 }}
            rules={[
              { required: true, message: t("loginPage.captcha.errorRequired") },
            ]}
            suffix={
              <Button
                theme="borderless"
                type="tertiary"
                onClick={handleGetCaptcha}
                loading={captchaLoading}
              >
                {t("loginPage.captcha.getLabel")}
              </Button>
            }
          />
          <Form.Input
            field="password"
            label={t("loginPage.password.label")}
            placeholder={t("loginPage.password.placeholder")}
            prefix={<IconLock />}
            mode="password"
            size="large"
            rules={[
              {
                required: true,
                message: t("loginPage.password.errorRequired"),
              },
            ]}
          />
          <Form.Input
            field="confirmPassword"
            label={t("loginPage.confirmPassword.label")}
            placeholder={t("loginPage.confirmPassword.placeholder")}
            prefix={<IconLock />}
            mode="password"
            size="large"
            rules={[
              {
                required: true,
                message: t("loginPage.confirmPassword.errorRequired"),
              },
              {
                validator: validateConfirmPassword,
                message: t("loginPage.confirmPassword.errorNotMatch"),
              },
            ]}
          />

          <Button
            theme="solid"
            type="primary"
            size="large"
            style={{ width: "100%", height: "44px", fontSize: "16px" }}
            htmlType="submit"
            loading={registerLoading}
          >
            {t("loginPage.registerBtn.title")}
          </Button>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            {t("loginPage.switchLabel.register.title")}
            <a
              href="#"
              onClick={() => setFormType("login")}
              style={{ color: "#0064C8" }}
            >
              {t("loginPage.switchLabel.register.link")}
            </a>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <LoginContainer>
      <Header />
      <div
        className="login-text"
        style={{ width: "400px", margin: "0 auto", marginTop: "40px" }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {formType === "login"
            ? t("loginPage.welcomeLogin")
            : t("loginPage.welcomeRegister")}
        </h1>
        {formType === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
      {/* <Footer /> */}
    </LoginContainer>
  );
};
