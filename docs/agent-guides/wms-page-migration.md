# WMS 页面迁移经验手册

本手册记录旧 WMS 前端迁移到 `soybean-admin-element-plus` 时已经验证过的做法。它是业务页面迁移指南，不记录一次性计划、阶段目标或临时讨论结论。

## 基本原则

- 旧前端只保留字段、接口、业务语义、枚举含义和特殊数据格式。
- 不保留旧前端的页面路径、样式体系、布局习惯、暗色块、旧按钮排布和旧交互外观。
- 新页面必须优先使用 Soybean 当前项目里的 Element Plus、UnoCSS、Iconify、Elegant Router、请求封装和表格 Hooks。
- 后端权限、动态路由、菜单权限可以后置，页面迁移先用本地静态路由把业务界面跑通。
- 每次迁移应控制在一个清晰页面或一个小模块内，方便回归和审查。

## 迁移前检查

迁移一个旧页面前，先确认这些信息：

- 旧路由中页面属于哪个一级模块、哪个二级页面。
- 旧页面实际使用了哪些接口，哪些只是 mock、注释、废弃代码或未调用逻辑。
- 旧页面表格列、搜索字段、表单字段、状态展示、接口参数和接口返回字段。
- 是否存在二维码、打印、导入导出、文件上传、批量操作、弹窗选择等特殊交互。
- 后端接口返回是否能直接适配 `{ success, code, message, data }`，以及分页数据是否是 `records/current/size/total`。

## 路由和目录

- 新路由不兼容旧路径，按 Soybean 菜单语义重新命名。
- 业务页面使用嵌套目录，例如 `src/views/basic-manage/warehouse-management/index.vue`。
- 页面内部组件放到当前页面的 `modules/`，例如 `warehouse-management/modules/warehouse-search.vue`。
- 多个基础资料页面共用的小组件可以放到模块公共目录，例如 `src/views/basic-manage/modules/basic-keyword-search.vue`。
- 新增页面后需要同步 Elegant Router 生成文件、路由 locale 和类型声明。
- 路由标题、图标、排序应按 Soybean 菜单体验设置，不照搬旧系统菜单顺序。

## 列表页模式

基础资料类列表已经验证的迁移模式：

- 页面使用 `useUIPaginatedTable`，分页接口使用 `defaultTransform`。
- 搜索参数用 `ref(getInitSearchParams())` 初始化，默认保留 `current`、`size` 和旧接口需要的关键词字段。
- 搜索组件通过 `v-model:model` 修改搜索参数，通过 `search` 触发 `getDataByPage`。
- 重置搜索时重新赋值初始化参数，不在多个字段上零散清空。
- 表格放在 `ElCard` 中，表头使用 `TableHeaderOperation` 提供刷新和列显隐。
- 表格列使用稳定的 `prop`，宽度使用 `width` 或 `minWidth` 控制。
- 状态字段用 `ElTag` 显示业务含义，例如仓库 `status === 'A'` 显示可用。
- 分页使用 `mobilePagination`，页码和 pageSize 在 `onPaginationParamsChange` 中回写搜索参数。

已迁移列表页包括：

- 仓库管理：`/baseInfo/findStockList`
- 货架管理：`/shelf/pageList`
- 库位管理：`/baseInfo/findPositionList`
- 物料管理：`/baseInfo/findMaterialList`
- 人员管理：`/user/pageUserList`
- 角色管理：`/role/pageRoleList`
- App 版本管理：`/app/findAppManagementPage`

## 字段迁移

- 字段名优先保留后端接口字段，不为了前端展示重命名后端字段。
- 展示标签可以改成更清晰的中文，但 `prop` 应与接口字段保持一致。
- 旧页面字段如果只是样式辅助、前端临时变量或未展示字段，不要迁移到新表格。
- 搜索字段只迁移当前页面真实可用的过滤条件，不把旧页面里未接接口的控件搬过来。
- 类型集中写到 `src/typings/wms.d.ts`，按业务命名空间扩展，不在页面中散落 `any`。
- 页面需要对请求返回做窄化时，用局部 `toList<T>`、`toMaterial` 这类小函数兜底，不把未知结构强行扩散到全局类型。

## 接口接入

- 请求函数放在 `src/service/api` 的领域文件中，命名以 `fetch` 开头。
- 页面不直接拼 URL，不直接创建 axios 或绕过项目请求实例。
- 后端统一响应已经按 `{ success, code, message, data }` 适配，业务页面只消费转换后的数据。
- 成功码通过 `VITE_SERVICE_SUCCESS_CODE=200` 管理。
- 登录请求已按后端 Sa-Token 接口补齐 `deviceType: 'PC'`，业务页面不再处理登录细节。
- 如果旧后端分页结构是 `records/current/size/total`，直接使用 `defaultTransform`。
- 如果某个接口返回数组或对象不稳定，应在 service 类型和页面窄化函数中明确处理，不把异常结构埋进表格渲染。

## 搜索组件

- 单页专用搜索组件放到该页面 `modules/`。
- 多页复用的关键词搜索可以提取公共组件，但不要过早抽象复杂业务表单。
- 搜索组件只负责表单输入和触发事件，数据请求仍放在页面容器。
- 搜索、重置按钮使用项目既有按钮和图标风格。
- 重置后应从第一页重新查询。

## 标签和二维码打印页

标签管理不是普通列表页，迁移时按“可手动录入并打印”的独立工具页处理。

已验证的拆分方式：

- `index.vue`：模板选择、字段录入、接口联想、打印张数、打印动作。
- `modules/label-templates.ts`：标签模板、字段配置、下拉选项 key、接口 lookup 标记。
- `modules/label-preview.vue`：标签预览和打印内容渲染。
- `modules/label-qrcode.ts`：二维码内容生成。

二维码规则必须保持旧前端业务格式：

```ts
JSON.stringify({
  m: formData.materialCode,
  b: formData.batchCode,
  p: formData.productionDate,
  q: formData.quantity,
  i: identity
});
```

迁移经验：

- 业务逻辑使用二维码，不使用一维码。
- 二维码内容字段名必须保持 `m/b/p/q/i`，不能改成完整英文名。
- `i` 是每张标签的随机标识，同一预览实例保持稳定，打印多张时每张各自生成。
- 使用 `qrcode` 生成二维码图片，使用 `print-js` 打印 HTML。
- 打印区域放到屏幕外隐藏容器，例如 `#label-print-area`，打印前通过 `nextTick` 确保内容已渲染。
- 标签模板可以按旧前端的 model1/model2/model3/model4 保留业务含义，但 UI 样式应按 Soybean/Element Plus 重建。
- 模板字段配置化，避免在模板和表单里重复维护字段列表。

## 标签接口经验

标签页中旧前端可复用的接口：

- `/baseInfo/findMaterial`：按物料编码查询物料信息。
- `/baseInfo/findProduction`：按批次查询成品生产信息。
- `/baseInfo/findProductionDTOBySemi`：按批次查询半成品生产信息。
- `/baseInfo/findSupplierList`：查询供应商列表。
- `/user/ErpUserList`：查询人员列表。

联动规则：

- 物料编码失焦后查询物料，回填物料编码、物料名称、颜色、包装数量。
- 批次号失焦后按模板类型查询成品或半成品信息。
- 成品模板可用销售单号或物料编码作为下拉选项。
- 半成品模板如果查询到多条记录，应让用户确认物料料号，不要自动覆盖。
- 人员和供应商作为基础选项加载，接口失败时页面仍允许手动录入。

## 不应迁移的内容

- 旧前端全局样式、页面色块、旧卡片层级和旧表格样式。
- 旧路由 path、旧菜单 key 和旧权限码。
- mock 数据列表，除非后端暂无接口且用户明确要求先占位。
- 旧页面里没有真实调用的按钮和搜索条件。
- 与当前页面无关的权限判断、动态路由判断和登录状态分支。
- 页面内硬编码请求 host、token header 或后端响应解包逻辑。

## 验证要求

页面迁移后至少运行：

```bash
pnpm typecheck
pnpm lint
```

涉及路由、构建产物、依赖或打印组件时再运行：

```bash
pnpm build:test
```

验证重点：

- TypeScript 类型不通过时，先修 service 类型和局部窄化，不用 `any` 掩盖。
- Lint 自动修复后需要再跑一次类型检查。
- 新依赖必须写入 `package.json` 和 lockfile。
- 新路由必须能通过 Elegant Router 类型检查。
- 打印页至少确认二维码内容生成函数与旧前端 JSON 字段一致。
