import { RouteObject } from 'react-router-dom';
import { Editor } from '@/pages/editor';
import { Board } from '@/pages/board';
import { Login } from '@/pages/login';

// 定义路由配置
export const routes: RouteObject[] = [
  {
    path: '/editor',
    element: <Editor />,
  },
  {
    path: '/',
    element: <Board />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  // 在这里添加更多路由配置
  // {
  //   path: '/about',
  //   element: <About />,
  // },
  // {
  //   path: '/settings',
  //   element: <Settings />,
  // },
]; 