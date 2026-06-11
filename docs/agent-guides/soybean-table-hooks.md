# Soybean 表格 Hooks 指南摘要

来源：

- useTable 函数：https://docs.soybeanjs.cn/zh/guide/hooks/use-table.html

## 基础概念

- `useTable` 只处理数据获取、数据转换、列配置、列显隐和 loading 状态，不绑定具体 UI 库。
- 本 Element Plus 项目已在 `src/hooks/common/table.ts` 中封装 Element Plus 版本，如 `useUITable`、`useUIPaginatedTable`、`useTableOperate`、`defaultTransform`。
- 写业务列表时优先使用项目已有 Element Plus 封装，不照搬 Naive UI 示例代码。

## useTable 关键参数

- `api`：获取表格数据的函数。
- `pagination`：是否启用分页。
- `transform`：把 API 响应转换为表格数据或分页数据。
- `columns`：列定义工厂函数。
- `getColumnChecks`：根据列生成列显隐配置。
- `getColumns`：根据列显隐配置得到最终列。
- `onFetched`：数据获取完成后的回调。
- `immediate`：是否初始化时立即拉取数据，默认通常为 true。

## Element Plus 分页表格

- 分页列表优先用 `useUIPaginatedTable`。
- 搜索参数中保留 `current`、`size` 或项目约定的分页字段。
- 在 `onPaginationParamsChange` 中把分页组件的页码和页大小同步回搜索参数。
- 筛选条件变化时，优先调用 `getDataByPage(1)` 从第一页重新查。
- 使用 `mobilePagination` 适配小屏分页展示。

## defaultTransform

- 如果接口返回分页数据包含 `records`、`current`、`size`、`total`，可直接用 `defaultTransform` 转为表格分页数据。
- 如果后端分页结构不同，写一个同类统一转换函数传给 `transform`。
- 不要在每个页面重复写分页转换逻辑。

## 列和列显隐

- `columns` 使用工厂函数，便于 i18n 切换或业务状态变化时重新生成。
- `columnChecks` 用于列显隐，配合 `TableHeaderOperation`。
- 表格列应设置稳定的 `prop` / `key`。
- 宽表建议设置 `width` 或 `minWidth`，避免布局抖动。
- selection、index、expand、operate 等列也要有稳定标识。

## useTableOperate

- `useTableOperate` 封装新增、编辑、批量删除、单项删除的通用 UI 状态和成功回调。
- 常见返回：
  - `drawerVisible`
  - `operateType`
  - `editingData`
  - `handleAdd`
  - `handleEdit`
  - `checkedRowKeys`
  - `onBatchDeleted`
  - `onDeleted`
- 编辑时通过主键从当前表格数据定位行数据。
- 删除成功后调用 `onBatchDeleted` 或 `onDeleted` 处理提示、清空选择和刷新。

## 业务列表建议

- 列表页负责搜索参数、表格 hook、列定义和操作入口。
- 搜索表单拆到 `modules/*-search.vue`。
- 新增/编辑表单拆到 drawer/modal 组件。
- 请求函数放在 `src/service/api` 或领域 service 文件中，页面不直接写 URL 拼接逻辑。
