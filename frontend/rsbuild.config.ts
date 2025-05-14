import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';
import { defineConfig } from '@rsbuild/core';
import TerserPlugin from 'terser-webpack-plugin'; // 引入 Terser 插件
import type { MinifyOptions as TerserOptions } from "terser";

export default defineConfig({
  plugins: [pluginReact(), pluginLess()],
  source: {
    entry: {
      index: './src/app.tsx',
    },
    /**
     * support inversify @injectable() and @inject decorators
     */
    decorators: {
      version: 'legacy',
    },
  },
  html: {
    title: 'KedoAiFlow',
    favicon: './src/assets/logo_o.svg',
  },
  tools: {
    bundlerChain(chain, { CHAIN_ID, isProd }) {
      if (isProd) {
        chain.optimization.minimizer(CHAIN_ID.MINIMIZER.JS).use(TerserPlugin<TerserOptions>, [
          {
            minify: TerserPlugin.terserMinify,
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                unused: true,
              },
              format: {
                comments: false,    // 删除注释
              },
            },
          },
        ]);
      }
    },
  },
});
