# 仓库管理迁移打样决策

## 背景

当前前端重构重点是把旧 WMS 前端页面迁移到 `soybean-admin-element-plus`，先验证页面、路由、请求和列表模式，不把登录权限和动态路由作为前置阻塞。

本决策只适用于仓库管理首个打样页。长期开发规范仍以 `AGENTS.md` 和 `docs/agent-guides/` 为准。

## 打样目标

- 用 SoybeanAdmin Element Plus 项目结构重建仓库管理页。
- 保留旧系统业务字段、接口参数和响应数据含义。
- 不保留旧系统页面样式、布局容器、自定义表格、Font Awesome 图标和手写 router modules。
- 形成后续基础资料类列表页可复用的迁移样板。

## 路由决策

旧系统路由：

- 一级业务模块：基础管理
- 二级页面：仓库管理
- 旧路径：`/basicManage/warehouseManagement`

新系统不兼容旧路径，使用 Soybean 嵌套目录：

```text
src/views/basic-manage/
  warehouse-management/
    index.vue
    modules/
      warehouse-search.vue
```

预期 Elegant Router 生成：

- 一级路由：`basic-manage`
- 一级路径：`/basic-manage`
- 二级路由：`basic-manage_warehouse-management`
- 二级路径：`/basic-manage/warehouse-management`

建议路由 meta：

- `basic-manage.title`：`基础管理`
- `basic-manage.icon`：使用 Iconify 图标，例如 `carbon:data-base`
- `basic-manage_warehouse-management.title`：`仓库管理`
- `basic-manage_warehouse-management.icon`：使用 Iconify 图标，例如 `mdi:warehouse`
- `basic-manage_warehouse-management.keepAlive`：`true`

## 页面范围

首版只做只读列表：

- 关键词搜索
- 分页
- 刷新
- 列显隐
- 状态标签展示

首版不做：

- 新增
- 编辑
- 删除
- 批量删除
- 详情页
- 旧路径跳转兼容
- 动态菜单和角色权限

## 字段映射

旧页面字段来自 `Warehouse`：

| 字段 | 含义 | 展示 |
| --- | --- | --- |
| `stockNumber` | 仓库编码 | 文本 |
| `stockName` | 仓库名称 | 文本 |
| `stockStaff` | 仓库负责人 | 文本 |
| `stockType` | 仓库属性 | 文本 |
| `status` | 状态 | `A` 显示可用，其他显示禁用 |

状态展示使用 `ElTag`，不复用旧 CSS class。

## 请求决策

旧后端接口：

```text
POST /baseInfo/findStockList
```

请求参数：

```ts
{
  current: number;
  size: number;
  keyWords?: string;
}
```

分页响应数据使用旧后端结构：

```ts
{
  records: Warehouse[];
  current: number;
  size: number;
  total: number;
}
```

接口函数放到 Soybean 项目：

```text
src/service/api/base-info.ts
```

建议函数名：

```ts
fetchGetWarehouseList
```

页面使用 `useUIPaginatedTable` 和 `defaultTransform`。如果后端分页结构保持 `records/current/size/total`，不单独写页面级分页转换。

## 响应结构决策

后端当前统一返回：

```ts
{
  success: boolean;
  code: number;
  message: string;
  data: T;
}
```

迁移期不修改后端 `Result<T>` 响应结构。由 Soybean 前端请求层适配旧后端：

- `App.Service.Response<T>` 改为包含 `success`、`code`、`message`、`data`。
- 成功码使用 `200`，即 `.env` 中 `VITE_SERVICE_SUCCESS_CODE=200`。
- `isBackendSuccess` 继续按 `code` 判断成功。
- `transform` 继续返回 `response.data.data`。
- 错误提示从 `response.data.message` 读取。

不采用后端改成 `code/msg/data` 的 Soybean 默认结构，避免影响旧前端、移动端、接口文档和现有异常处理。

## 权限临时策略

页面迁移期先禁用后端 Sa-Token 登录校验，避免权限链路阻塞页面重构。

后端权限入口：

```text
kb-wms-backend/src/main/java/com/zbcloud/service/kbwms/common/config/SaTokenConfigure.java
```

当前校验核心：

```java
SaRouter.match("/**")
    .notMatch("/notifyMessage/createNotifyMessageRecord")
    .check(r -> StpUtil.checkLogin());
```

推荐加配置开关，不删除校验代码：

```yaml
kbwms:
  auth:
    enabled: false
```

行为：

- `enabled=true`：注册 Sa-Token 拦截器，保持现有登录校验。
- `enabled=false`：不注册 Sa-Token 拦截器，测试分支接口临时放行。

该开关只用于测试分支和页面迁移期。页面迁移稳定后再恢复登录、用户信息、菜单权限和动态路由接入。

## 文件落点

前端目标文件：

```text
src/views/basic-manage/warehouse-management/index.vue
src/views/basic-manage/warehouse-management/modules/warehouse-search.vue
src/service/api/base-info.ts
src/typings/wms.d.ts
```

后端目标文件：

```text
kb-wms-backend/src/main/java/com/zbcloud/service/kbwms/common/config/SaTokenConfigure.java
kb-wms-backend/src/main/resources/application-dev.yml
```

如需保持 prod/master 环境安全，权限绕行配置只写入当前测试使用的 profile。

## 验证标准

前端：

- `pnpm gen-route`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build:test`

页面：

- 菜单中能看到 `基础管理 -> 仓库管理`。
- 访问 `/basic-manage/warehouse-management`。
- 首次进入自动加载仓库列表。
- 搜索关键词后从第一页重新查询。
- 分页切换能同步 `current` 和 `size`。
- 状态列正确显示可用和禁用标签。

后端：

- 测试 profile 下接口无需 token 可访问。
- 关闭绕行开关后 Sa-Token 登录校验恢复。
