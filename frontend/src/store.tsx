import React, { createContext, useReducer, useEffect } from "react";

export enum VariableTypesEnum {
  "USER" = "user",
  "SYSTEM" = "system",
}

interface Variable {
  type: VariableTypesEnum; // 变量类型
  title: string; // 变量名称
  value: string; // 变量值
  description: string; // 变量描述
}

interface StoreState {
  flowId: string;
  userId: string;
  userName: string;
  flowName: string;
  flowDescription: string;
  variableList: Variable[];
}

// 初始状态
const initialState: StoreState = {
  flowId: "",
  userId: "",
  userName: "",
  flowName: "",
  flowDescription: "",
  variableList: [
    {
      type: VariableTypesEnum.SYSTEM,
      title: "sys_executeId",
      value: "",
      description: "系统执行Id",
    },
  ],
};

// 尝试从 localStorage 加载初始状态
const loadFromLocalStorage = (): StoreState => {
  try {
    const serializedState = localStorage.getItem("storeState");
    return serializedState ? JSON.parse(serializedState) : initialState;
  } catch (e) {
    console.warn("无法加载 localStorage 中的状态", e);
    return initialState;
  }
};

// 创建 Context
export const StoreContext = createContext<{ state: StoreState; dispatch: any }>({
  state: initialState,
  dispatch: () => {},
});

// Reducer 函数
function reducer(state: StoreState, action: any) {
  switch (action.type) {
    case "setFlowId":
      return { ...state, flowId: action.payload };
    case "setUserId":
      return { ...state, userId: action.payload };
    case "setFlowName":
      return { ...state, flowName: action.payload };
    case "setUserName":
      return { ...state, userName: action.payload };
    case "setFlowDescription":
      return { ...state, flowDescription: action.payload };
    case "setVariableList":
      return { ...state, variableList: action.payload };
    case "reset":
      // 清除 localStorage
      localStorage.removeItem("storeState");
      return initialState;
    default:
      return state;
  }
}

// Provider 组件
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    return loadFromLocalStorage();
  });

  // 当 state 更新时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem("storeState", JSON.stringify(state));
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}