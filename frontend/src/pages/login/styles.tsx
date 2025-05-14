import styled from "styled-components";

export const LoginContainer = styled.div`
  background: linear-gradient(
    135deg,
    rgba(236, 228, 255, 0.5),
    rgb(255, 255, 255) 21%,
    rgb(255, 255, 255) 49%,
    rgba(255, 255, 255, 0.72) 78%,
    rgba(222, 238, 255, 0.5)
  );
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  
  .login-text {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 30px;
  }
  
  .semi-tabs-content {
    padding-top: 10px;
  }
  
  .semi-tabs-bar-line .semi-tabs-tab.semi-tabs-tab-active {
    color: #0064C8;
    font-weight: 600;
  }
  
  .semi-tabs-bar-line .semi-tabs-ink-bar {
    background-color: #0064C8;
  }
`;

export const FooterContainer = styled.div`
  position: absolute;
  left: 0;
  bottom: 5px;
  width: 100%;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
