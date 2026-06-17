# 系统管理人员角色菜单重构设计

## 目标

将人员、角色、菜单统一重构到 Soybean 的“系统管理”模块下，使 `soybean-admin-element-plus` 能通过 `kb-wms-backend` 的 dev 环境接口正常完成：

- 人员分页查询、从 ERP 人员导入、分配角色、启用/禁用、重置密码。
- 角色分页查询、新增、编辑、删除、分配菜单。
- 菜单树查询、新增、编辑、删除，并作为角色授权的数据源。

## 当前确认

- 后端工作分支：`demo/prod-soybeanjs`。
- 后端 dev 配置：`kb-wms-backend/src/main/resources/application-dev.yml`。
- dev 数据库：PostgreSQL `kb_wms`，schema `public`。
- dev 环境已设置 `kbwms.auth.enabled=false`，页面重构阶段不启用 Sa-Token 路由鉴权。
- dev 库已存在更适合新权限模型的表：
  - `sys_user`
  - `sys_role`
  - `sys_menu`
  - `sys_user_role`
  - `sys_role_menu`
- 旧表 `user`、`role` 和空表 `menu` 仍存在；现有后端 Controller 主要使用旧 `user.user_role`、`role.role_menu` JSONB 字段。
- `sys_menu` 当前数据仍使用旧前端 camelCase 路径，例如 `/basicManage/personnelManagement`，需要迁移到 Soybean 路由，例如 `/basic-manage/personnel-management`。

## 设计选择

采用 `sys_*` 表作为新的人员、角色、菜单主模型。

不继续把权限功能建立在旧 JSONB 字段上，原因：

- `sys_user_role` 和 `sys_role_menu` 更符合人员-角色-菜单多对多关系。
- `sys_menu` 已能承载目录、菜单、按钮、路径、组件名、图标、权限码、排序、状态、隐藏状态。
- 后续接入动态路由或 Sa-Token 权限时，可以直接从关系表计算用户菜单和权限码。

旧 `user`、`role` 表暂不删除，避免影响旧接口和迁移期数据回退。

## 前端落点

页面放到 Soybean 的“系统管理”模块：

- `src/views/manage/user/index.vue`
- `src/views/manage/role/index.vue`
- `src/views/manage/menu/index.vue`
- 对应 `modules/` 下搜索、抽屉、弹窗组件。

原 `basic-manage/personnel-management` 和 `basic-manage/role-management` 已迁移页面不作为最终系统权限入口；后续可隐藏或保留为临时业务页，但本次人员、角色、菜单功能以 `manage/*` 为准。

## 前端接口契约

统一在 `src/service/api/system-manage.ts` 内对接后端真实接口，页面不直接写 URL。

建议接口：

- `fetchGetUserList(params)`：分页查询 `sys_user`。
- `fetchGetErpUserList(params)`：分页查询 ERP 人员。
- `fetchAddUsers(payload)`：批量导入 ERP 人员到 `sys_user`。
- `fetchUpdateUserRoles(payload)`：更新用户角色。
- `fetchUpdateUserPassword(payload)`：重置密码。
- `fetchUpdateUserStatus(payload)`：启用/禁用人员。
- `fetchGetRoleList(params)`：分页查询 `sys_role`。
- `fetchGetAllRoles()`：查询启用角色下拉。
- `fetchAddRole(payload)`：新增角色。
- `fetchUpdateRole(payload)`：编辑角色。
- `fetchDeleteRole(id)`：删除角色。
- `fetchUpdateRoleMenus(payload)`：更新角色菜单。
- `fetchGetMenuList()`：查询菜单树或平铺树表数据。
- `fetchGetMenuTree()`：查询授权树。
- `fetchAddMenu(payload)`：新增菜单。
- `fetchUpdateMenu(payload)`：编辑菜单。
- `fetchDeleteMenu(id)`：删除菜单。

后端响应仍使用已适配的 `{ success, code, message, data }`，成功码 `200`，分页数据使用 `records/current/size/total`。

## 后端接口设计

新增或改造 Controller 时优先使用清晰前缀：

- `/system/user/*`
- `/system/role/*`
- `/system/menu/*`

保留旧 `/user/*`、`/role/*` 接口以降低迁移风险，但新 Soybean 系统管理页面不再依赖旧接口。

核心 DTO/VO：

- 用户列表 VO：`id/code/username/name/department/status/isSystem/roleIds/roleNames/createTime/updateTime`。
- 角色列表 VO：`id/name/code/description/sort/status/isSystem/menuIds/createTime/updateTime`。
- 菜单 VO：`id/parentId/title/type/path/name/component/icon/permission/sort/status/isHidden/createTime/updateTime/children`。

状态约定：

- `status=1`：启用。
- `status=2`：禁用。
- `type=1`：目录。
- `type=2`：菜单。
- `type=3`：按钮。

## 菜单数据迁移

`sys_menu` 需要迁移为 Soybean 当前路由命名：

- 路径使用 kebab-case，例如 `/basic-manage/personnel-management`。
- 菜单权限值和角色授权值优先使用 Soybean 路由 key，例如 `basic-manage_personnel-management`。
- `title/icon/sort/is_hidden/status` 与 `src/router/elegant/routes.ts` 保持一致。

迁移 SQL 需要幂等：

- 已存在相同 `id` 时更新字段。
- 不删除未知菜单，除非它明确属于旧前端废弃菜单并且不会再使用。
- 同步 `sys_role_menu` 保留现有角色权限语义，例如旧 admin 角色仍应拥有全部 WMS 菜单。

## 登录和权限接入边界

本次目标是系统管理页面可正常 CRUD 和授权，不把动态路由和 Sa-Token 注解鉴权作为前置条件。

实现时可以：

- 继续保持 dev 环境 `kbwms.auth.enabled=false`。
- 登录仍按现有 `/auth/login` 返回 token 和用户基础信息。
- 不在业务页面写权限判断。

后续接权限时再处理：

- 登录后从 `sys_user -> sys_user_role -> sys_role_menu -> sys_menu` 计算用户菜单。
- 将 `UserInfo.roles/buttons` 与菜单树或权限码统一。
- 根据需要启用 `VITE_AUTH_ROUTE_MODE=dynamic` 或静态路由过滤。

## 验证

前端至少运行：

```bash
pnpm typecheck
pnpm lint
pnpm build:test
```

后端至少运行：

```bash
$env:JAVA_HOME='C:\Users\24634\.jdks\ms-21.0.8'
$env:Path='C:\Users\24634\.jdks\ms-21.0.8\bin;D:\Tools\apache-maven-3.9.10\bin;' + $env:Path
mvn -Pdev test
```

数据库验证：

- `sys_menu` 路径和 name 已切换到 Soybean 当前路由。
- `sys_role_menu` 能查到角色对应菜单。
- `sys_user_role` 能查到用户对应角色。
- 前端新增、编辑、删除、授权操作能刷新列表并反映到数据库。
