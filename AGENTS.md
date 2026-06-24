# soybean-admin-element-plus 开发手册入口

本文件是 Codex 和子代理在本项目中的入口目录。详细规则拆在 `docs/agent-guides/`，按任务类型阅读，不要把所有规范堆到本文件里。

## 必读顺序

1. 所有任务先读本文件。
2. 写 Vue/TS/样式代码前，读 `docs/agent-guides/soybean-development.md`。
3. 判断文件落点或调整目录前，读 `docs/agent-guides/soybean-project-structure.md`。
4. 使用图标前，读 `docs/agent-guides/soybean-icons.md`。
5. 新增、移动、重命名页面或处理菜单/路由前，读 `docs/agent-guides/soybean-router.md`。
6. 写接口、请求实例、代理或后端响应适配前，读 `docs/agent-guides/soybean-request.md`。
7. 使用 Soybean CLI、路由生成或 Git hooks 前，读 `docs/agent-guides/soybean-cli.md`。
8. 写列表、分页表格、列显隐或增删改查表格状态前，读 `docs/agent-guides/soybean-table-hooks.md`。
9. 从旧 WMS 前端迁移业务页面、字段、接口或打印工具页前，读 `docs/agent-guides/wms-page-migration.md`。

## 手册范围

- 本目录只沉淀 SoybeanAdmin 官方开发、项目结构、路由、图标、请求、命令行和 Hooks 规则。
- 不在本目录记录任务计划、权限绕行策略或一次性项目目标。
- 项目阶段性决策应单独放到 `docs/decisions/` 或任务设计文档中。
- 本项目优先遵循 Soybean 既有技术栈：Vue 3、TypeScript、Vite/rolldown-vite、Element Plus、Pinia、UnoCSS、Iconify、Elegant Router。

## WMS 页面迁移规则

- 旧前端只作为字段、接口、业务含义和特殊数据格式的来源，不迁移旧样式、旧路由路径或旧页面布局。
- 新页面优先套用 Soybean/Element Plus 现有列表、搜索、表格、打印和图标模式。
- 列表页优先落到嵌套业务目录，搜索组件、预览组件、模板配置等拆到页面内 `modules/`。
- 权限、动态路由和登录鉴权不是页面迁移的前置条件；页面可先按本地静态路由和已确认后端响应结构接入。
- 旧前端存在特殊编码、二维码内容、打印内容或接口字段映射时，必须在迁移页中保持业务数据格式一致。

## 常用命令

- 包管理和脚本使用 `pnpm`。
- 常用验证命令：
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build:test`
- 新增或移动路由页面后，根据项目需要运行 `pnpm gen-route`。

## 外部工具与后端关联

- 前端测试、页面交互验证和浏览器自动化优先使用 Playwright MCP。
- 数据库查询、数据核对和只读排查优先使用 DBX MCP。
- 关联后端目录为 `D:\Work\WMS\kb-wms-backend`。
- 关联后端分支为 `origin/demo/prod-soybeanjs`。

## 子代理要求

- 子代理处理页面迁移时，必须先读本文件和对应指南。
- 子代理不得擅自改动路由总策略、请求总封装或后端契约。
- 子代理每次只迁移一个清晰业务页面或一个小模块，保持变更可审查。
- 子代理输出需说明已阅读的指南、复用的 Soybean 模板、涉及文件、接入接口和验证结果。
