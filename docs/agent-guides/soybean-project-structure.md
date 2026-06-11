# Soybean 项目结构指南摘要

来源：

- 快速上手：https://docs.soybeanjs.cn/zh/guide/quick-start

## 使用原则

- 目录职责以 SoybeanAdmin 官方快速上手为基础，以本仓库真实目录为准。
- 新文件优先放入既有职责目录，不要为了单个页面新增横向平行目录。
- 自动生成目录、构建配置和共享包不要随业务页面迁移随意改动。
- 页面迁移时先判断文件类型：页面、接口、类型、常量、枚举、组件、Hook、工具函数分别落到对应目录。

## 根目录

- `.vscode`：项目推荐插件、调试配置和工作区设置。
- `build`：Vite 构建配置和插件。
  - `build/config`：构建打包、代理、时间等配置。
  - `build/plugins`：路由、UnoCSS、自动导入、HTML、DevTools 等构建插件。
- `packages`：项目内共享包和脚本，不是业务页面目录。
- `public`：原样复制到构建产物根目录的公共资源。
- `src`：应用源码。
- `.env`、`.env.test`、`.env.prod`：环境变量。
- `eslint.config.js`、`uno.config.ts`、`vite.config.ts`、`tsconfig.json`：工程配置。
- `package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`：包管理和 workspace 配置。

## packages

- `packages/axios`、`packages/ofetch`、`packages/alova`：请求能力封装。
- `packages/hooks`：可跨项目或跨模块复用的组合式函数。
- `packages/materials`：组件物料。
- `packages/scripts`：Soybean CLI 脚本来源，`sa` 命令相关逻辑在这里。
- `packages/uno-preset`：UnoCSS preset 配置。
- `packages/utils`：共享工具函数。
- 业务页面迁移通常不改 `packages`；只有确实需要沉淀通用能力时才考虑。

## src 目录

- `src/assets`：静态资源。
  - `src/assets/imgs`：图片资源。
  - `src/assets/svg-icon`：本地 SVG 图标，配合本地图标前缀使用。
- `src/components`：全局组件。
  - `advanced`：复杂或高级通用组件。
  - `common`：通用基础组件。
  - `custom`：项目定制组件。
- `src/constants`：常量。
  - `app.ts`：应用常量。
  - `business.ts`：业务常量。
  - `common.ts`：通用常量。
  - `reg.ts`：正则常量。
- `src/enum`：枚举定义。
- `src/hooks`：组合式函数。
  - `business`：业务相关 Hook。
  - `common`：通用 Hook，例如表格、表单、图标、路由等。
- `src/layouts`：布局组件和布局上下文。
- `src/locales`：国际化配置。
- `src/plugins`：应用启动时安装的插件和依赖样式导入。
- `src/router`：Vue Router 和 Elegant Router 生成产物。
- `src/service`：默认请求接口和请求实例。
  - `api`：业务接口函数。
  - `request`：请求实例、拦截、后端响应转换和类型。
- `src/service-alova`：Alova 请求示例或 Alova 请求体系。
- `src/store`：Pinia 状态管理。
- `src/styles`：全局 CSS/SCSS。
- `src/theme`：主题配置和主题变量。
- `src/typings`：全局类型声明、自动导入类型、路由类型和 UI 类型。
- `src/utils`：纯工具函数，不承载组件状态。
- `src/views`：页面目录，也是 Elegant Router 生成路由的主要来源。

## 页面迁移落点

- 页面主体放 `src/views`，并按 `soybean-router.md` 的命名和层级规则创建目录。
- 页面专属小组件优先放在页面目录内部；可复用组件再提升到 `src/components`。
- 接口函数放 `src/service/api`，请求实例和响应转换放 `src/service/request`。
- 接口响应和业务模型类型优先放现有类型声明位置；跨页面复用时再沉淀到 `src/typings` 或模块内类型文件。
- 常量放 `src/constants`，枚举放 `src/enum`。
- 页面状态复用逻辑放 `src/hooks/business`；纯 UI 或通用逻辑放 `src/hooks/common`。
- 工具函数放 `src/utils`，保持纯函数，不依赖组件实例和页面状态。

## 不要随意修改

- 不要手动编辑 `src/router/elegant` 生成文件。
- 不要为了单个业务页修改 `build/plugins`、`build/config` 或 `packages/scripts`。
- 不要把旧系统页面结构、静态资源结构或 CSS 目录原样搬入本项目。
- 不要把业务 API、页面组件和工具函数混在同一个目录里。
