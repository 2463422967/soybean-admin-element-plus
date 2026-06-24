# soybean-admin-element-plus 开发手册入口

本文件是 Codex 和子代理在本项目中的入口目录。详细规则拆在 `docs/agent-guides/`，不要把所有细节堆到本文件里。

## 必读顺序

1. 所有任务先读本文件。
2. 写 Vue/TS/样式代码前，读 `docs/agent-guides/soybean-development.md`。
3. 判断文件落点或调整目录前，读 `docs/agent-guides/soybean-project-structure.md`。
4. 使用图标前，读 `docs/agent-guides/soybean-icons.md`。
5. 新增、移动、重命名页面或处理菜单/路由前，读 `docs/agent-guides/soybean-router.md`。
6. 写接口、请求实例、代理或后端响应适配前，读 `docs/agent-guides/soybean-request.md`。
7. 使用 Soybean CLI、路由生成或 Git hooks 前，读 `docs/agent-guides/soybean-cli.md`。
8. 写列表、分页表格、列显隐或增删改查表格状态前，读 `docs/agent-guides/soybean-table-hooks.md`。
9. 从旧 WMS 前端迁移业务页面、字段、接口、二维码、标签或打印工具页前，读 `docs/agent-guides/wms-page-migration.md`。

## 当前项目边界

- 当前前端目录：`D:\Work\WMS\soybean-admin-element-plus`。
- 关联后端目录：`D:\Work\WMS\kb-wms-backend`。
- 前端主工作分支通常为 `dev`，后端重构分支通常为 `demo/prod-soybeanjs`；动手前以 `git status --short --branch` 实际结果为准。
- 当前联调以 dev 环境为主，后端配置优先看 `application-dev.yml` 和 Maven `dev` profile。
- 本项目不是旧前端换皮；旧前端只作为字段、接口、业务语义和特殊数据格式来源。

## 当前技术栈

- 前端：Vue 3、TypeScript、Vite/rolldown-vite、Element Plus、Pinia、UnoCSS、Iconify、Elegant Router。
- 表格：优先使用 `useUIPaginatedTable`、`defaultTransform`、`TableHeaderOperation` 和列显隐配置。
- 请求：统一走 `src/service/request` 和 `src/service/api/*`，请求函数以 `fetch` 开头。
- 打印/二维码：已使用 `qrcode`、`print-js`，标签设计相关代码可能使用 `vue-plugin-hiprint`、`html2canvas`。
- 后端：Java 21、Spring Boot 3.5.x、MyBatis-Plus、dynamic-datasource、Redis、Sa-Token、SpringDoc。

## 重构后前端模块

- `src/views/basic-manage/`：基础管理，包含仓库、货架、库位、物料、App 版本、标签打印、标签设计等页面。
- `src/views/inbound-manage/`：入库管理，包含收货、上架、入库作业。
- `src/views/outbound-manage/`：出库管理，当前包含拣货作业。
- `src/views/internal-manage/`：库内管理，包含仓库调拨、仓位移动。
- `src/views/inventory-manage/`、`src/views/warehouse-inventory/`：库存管理和库存盘点。
- `src/views/report-analyze/`：库存报表、作业报表、仓储综合看板。
- `src/views/manage/`：系统管理，当前人员、角色、菜单和单据参数设置应放在这里，不要再放到旧的基础资料人员/角色列表模式里。
- `src/views/plugin/`、`src/views/function/`、`src/views/alova/`、`src/views/multi-menu/` 是 Soybean 示例能力；真实 WMS 菜单不应默认展示示例菜单，除非用户明确要求。

## 后端联动边界

- 登录接口：前端 `fetchLogin` 调 `/auth/login`，请求体必须包含 `account`、`password`、`deviceType: 'PC'`。
- 后端统一响应：业务接口按 `{ success, code, message, data }` 返回，前端成功码配置为 `VITE_SERVICE_SUCCESS_CODE=200`。
- 动态路由：前端 `.env` 使用 `VITE_AUTH_ROUTE_MODE=dynamic`，路由接口为 `/route/getConstantRoutes`、`/route/getUserRoutes`、`/route/isRouteExist`。
- 系统管理接口：前端 `src/service/api/system-manage.ts` 对应后端 `/system/user`、`/system/role`、`/system/menu`。
- 后端权限入口：`SaTokenConfigure` 负责登录拦截，`SaTokenPermissionProvider` 从 `RouteService` 提供权限，系统管理 controller 使用 `@SaCheckPermission`。
- 菜单种子和 dev 数据优先看 `kb-wms-backend/src/main/resources/sql/dev-system-management-menu.sql`。
- 除非用户明确要求，前端不要绕过动态路由和权限判断，后端不要临时关闭 `kbwms.auth.enabled`。

## WMS 页面迁移规则

- 不保留旧前端路由、页面样式、暗色主题、旧布局和旧按钮排布。
- 新页面优先套用 Soybean/Element Plus 的列表、搜索、表格、弹窗、打印和图标模式。
- 页面目录使用嵌套业务目录；页面内部组件、模板、二维码生成、打印配置放到当前页面的 `modules/`。
- 列表页默认不显示新增、删除、批量删除、批量生成等操作；旧系统没有的操作不要为了通用模板补上。
- `TableHeaderOperation` 的默认新增/批量删除必须显式开启或用自定义 slot 提供；普通只读列表只保留刷新和列设置。
- 旧前端存在特殊编码、二维码内容、打印内容或接口字段映射时，必须保持业务数据格式一致。
- 标签/货架等二维码内容要写小型测试锁定 JSON 字段，避免后续改成看起来更友好但不兼容旧业务的格式。

## 常用命令

- 包管理和脚本使用 `pnpm`。
- 常用验证命令：
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build:test`
- 新增或移动路由页面后，根据项目需要运行 `pnpm gen-route`，并检查 `src/router/elegant/*`、`src/typings/elegant-router.d.ts` 和 locale 文件变化。
- 后端需要验证时使用 Java 21 和 Maven；先设置 `JAVA_HOME=C:\Users\24634\.jdks\ms-21.0.8`，再运行 Maven 命令。

## 外部工具

- 前端页面交互验证和浏览器自动化优先使用内置浏览器和 Playwright MCP；新增或修改页面后测试前，先读 `docs/agent-guides/soybean-development.md` 的“前端交互测试”。
- 数据库查询、数据核对和只读排查优先使用 DBX MCP。
- 多代理迁移时，每个子代理只处理一个清晰页面或一个小模块，不要并行修改共享路由、请求封装或权限总策略。

## 子代理要求

- 子代理处理页面迁移时，必须先读本文件和对应指南。
- 子代理不得擅自改动路由总策略、请求总封装、后端响应契约或 Sa-Token 权限入口。
- 子代理输出需说明已阅读的指南、复用的 Soybean 模式、涉及文件、接入接口和验证结果。
- 子代理遇到旧系统有而新系统缺的按钮或打印功能时，先核对旧页面真实接口和业务格式，再按新 UI 模式补齐。
