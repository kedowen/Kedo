import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";
import './utils/i18n';
import "./style.css";

import { StoreProvider } from "./store";
import { routes } from "./routes";

const AppRoutes = () => {
  const element = useRoutes(routes);
  return element;
};
const app = createRoot(document.getElementById("root")!);
app.render(
  <StoreProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StoreProvider>
);
