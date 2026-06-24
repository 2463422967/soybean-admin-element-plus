# Soybean 开发规范摘要

来源：

- SoybeanAdmin 规范入口：https://docs.soybeanjs.cn/zh/standard/
- 格式化检查：https://docs.soybeanjs.cn/zh/standard/lint
- 命名规范：https://docs.soybeanjs.cn/zh/standard/naming
- Vue 写法规范：https://docs.soybeanjs.cn/zh/standard/vue
- TS 写法规范：https://docs.soybeanjs.cn/zh/standard/ts

## 基础约定

- 使用本项目已有栈：Vue 3、TypeScript、Vite/rolldown-vite、Element Plus、Pinia、UnoCSS、Iconify、Elegant Router。
- 代码格式化和检查以项目已有 ESLint/Prettier 配置为准，优先遵循 `@soybeanjs/eslint-config`。
- 提交前尽量保证 `pnpm typecheck`、`pnpm lint` 通过；不要为了通过检查而隐藏真实类型问题。

## 命名

- 文件和文件夹使用小写加连字符命名，例如 `material-list`。
- Vue 组件名、class、构造函数、TS type/interface 使用 PascalCase。
- 普通变量和函数使用 camelCase。
- 常量使用大写字母加下划线。
- CSS class 使用小写加连字符。
- 请求函数统一以 `fetch` 开头，例如 `fetchMaterialList`。
- 图标优先使用 Iconify 组件，图标组件名使用 kebab-case。

## Vue SFC 写法

- Vue 文件优先使用 `<script setup lang="ts">`。
- import 顺序按依赖层级组织：Vue、Vue Router、Pinia、VueUse、UI 库、其他第三方依赖、monorepo 包、`@/` 别名、本地相对路径。
- 类型导入使用 `import type`，并尽量靠近对应运行时导入。
- `script` 内部推荐顺序：
  - `defineOptions`
  - Props/Emits 类型定义
  - `defineProps` / `defineEmits`
  - hooks 和 store 调用
  - state、computed、业务函数
  - 初始化函数
  - watch/watchEffect
  - 生命周期钩子
  - `defineExpose`
- 初始化逻辑集中到清晰的 `init` 或 `getData` 函数中，避免分散在多个生命周期片段里。

## 页面和组件

- 列表页优先复用 Soybean 现有管理页结构，不复制外部项目的 DOM 和 CSS。
- Element Plus 组件按项目现有写法使用，优先配合 UnoCSS 工具类。
- 页面文案、字段名和业务术语应保持当前业务域的统一表达。

## 前端交互测试

- 新增页面、修改页面、调整弹窗、打印、标签设计、表格操作后，优先使用 Codex 内置浏览器验证当前项目页面。
- 默认复用用户已经打开并登录的 `http://localhost:9528` 前端服务，不要额外启动新的 Vite 服务；额外服务通常没有现成登录态，会卡在登录环节，也容易验证到错误实例。
- 如果当前浏览器没有登录态，需要登录时使用测试账号：`admin`，密码：`123456`。
- 测试流程优先为：刷新当前内置浏览器标签页，进入目标菜单或当前 URL，执行本次改动相关的最小交互，读取 DOM 文本、截图或页面状态确认结果。
- 只有在 `localhost:9528` 不可访问、用户明确要求独立服务，或当前任务确实需要验证启动流程时，才考虑运行 `pnpm dev`；启动前先说明原因，并避免占用已有端口。
- 浏览器验证不能替代基础静态检查。页面代码变更后仍应按风险运行 `pnpm typecheck`、`pnpm lint`，必要时再运行 `pnpm build:test`。
