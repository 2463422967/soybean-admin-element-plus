# System Management Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild user, role, and menu management under Soybean System Management so the frontend can operate against `kb-wms-backend` dev APIs and `sys_*` tables.

**Architecture:** Use `sys_user`, `sys_role`, `sys_menu`, `sys_user_role`, and `sys_role_menu` as the new authority model. Keep old `/user/*` and `/role/*` endpoints untouched, and add `/system/user/*`, `/system/role/*`, `/system/menu/*` for the Soybean pages.

**Tech Stack:** Vue 3, TypeScript, Element Plus, Soybean table hooks, Spring Boot 3.5.6, Java 21, MyBatis-Plus, PostgreSQL, Sa-Token with dev auth disabled.

---

## File Structure

Backend repository: `D:\Work\WMS\kb-wms-backend`

- Create `src/main/java/com/zbcloud/service/kbwms/entity/po/SysUser.java`: maps `public.sys_user`.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/po/SysRole.java`: maps `public.sys_role`.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/po/SysMenu.java`: maps `public.sys_menu`.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/po/SysRoleMenu.java`: maps `public.sys_role_menu`.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/po/SysUserRole.java`: maps `public.sys_user_role`.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/dto/SystemUserDTO.java`: user query/import/status/password/role DTOs.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/dto/SystemRoleDTO.java`: role query/create/update/menu DTOs.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/dto/SystemMenuDTO.java`: menu create/update DTOs.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/vo/system/SystemUserVO.java`: user list rows with role IDs/names.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/vo/system/SystemRoleVO.java`: role list rows with menu IDs.
- Create `src/main/java/com/zbcloud/service/kbwms/entity/vo/system/SystemMenuVO.java`: menu tree rows.
- Create mappers in `src/main/java/com/zbcloud/service/kbwms/mapper/local/`: `SysUserMapper`, `SysRoleMapper`, `SysMenuMapper`, `SysRoleMenuMapper`, `SysUserRoleMapper`.
- Create services in `src/main/java/com/zbcloud/service/kbwms/service/`: `SystemUserService`, `SystemRoleService`, `SystemMenuService`.
- Create service implementations in `src/main/java/com/zbcloud/service/kbwms/service/impl/`.
- Create controllers in `src/main/java/com/zbcloud/service/kbwms/controller/`: `SystemUserController`, `SystemRoleController`, `SystemMenuController`.
- Create `src/main/resources/sql/dev-system-management-menu.sql`: idempotent dev menu seed/update SQL.

Frontend repository: `D:\Work\WMS\soybean-admin-element-plus`

- Modify `src/typings/api/system-manage.d.ts`: replace mock system management types with WMS `sys_*` fields.
- Modify `src/service/api/system-manage.ts`: call new `/system/*` endpoints.
- Modify `src/views/manage/user/index.vue`: WMS user list and operations.
- Modify `src/views/manage/user/modules/user-search.vue`: code/name/department keyword search.
- Modify `src/views/manage/user/modules/user-operate-drawer.vue`: import/edit roles/password/status UI.
- Modify `src/views/manage/role/index.vue`: WMS role CRUD and menu auth entry.
- Modify `src/views/manage/role/modules/role-search.vue`: keyword/status search.
- Modify `src/views/manage/role/modules/role-operate-drawer.vue`: name/code/description/status CRUD.
- Modify `src/views/manage/role/modules/menu-auth-modal.vue`: load role menu IDs and save menu IDs.
- Modify `src/views/manage/menu/index.vue`: menu tree table, CRUD, delete.
- Modify `src/views/manage/menu/modules/menu-operate-modal.vue`: map Soybean fields to WMS menu DTO.
- Modify `src/locales/langs/zh-cn.ts` and `src/locales/langs/en-us.ts`: system management labels for WMS fields.

## Task 1: Backend `sys_*` Model And CRUD APIs

**Files:**
- Create backend PO/DTO/VO/Mapper/Service/Controller files listed above.
- Do not modify old `UserController` or `RoleController`.

- [ ] **Step 1: Add PO mappings**

Create PO classes using this pattern:

```java
@TableName("\"public\".\"sys_user\"")
@Data
public class SysUser {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    @TableField("code")
    private String code;
    @TableField("username")
    private String username;
    @TableField("name")
    private String name;
    @TableField("department")
    private String department;
    @TableField("password")
    private String password;
    @TableField("status")
    private Integer status;
    @TableField("is_system")
    private Boolean isSystem;
    @TableField("create_time")
    private LocalDateTime createTime;
    @TableField("update_time")
    private LocalDateTime updateTime;
}
```

Use the same explicit `@TableField` style for `SysRole`, `SysMenu`, `SysRoleMenu`, and `SysUserRole`.

- [ ] **Step 2: Add DTO and VO classes**

Use `PageParams.CommonPageDTO` for paginated queries:

```java
@EqualsAndHashCode(callSuper = true)
@Data
public static class Query extends PageParams.CommonPageDTO {
    private String code;
    private String username;
    private String name;
    private String department;
    private Integer status;
}
```

VOs must expose frontend fields exactly:

```java
@Data
public class SystemUserVO {
    private Long id;
    private String code;
    private String username;
    private String name;
    private String department;
    private Integer status;
    private Boolean isSystem;
    private List<Long> roleIds;
    private List<String> roleNames;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

- [ ] **Step 3: Add mappers**

Each mapper extends `BaseMapper<T>`:

```java
@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}
```

- [ ] **Step 4: Implement services**

Service methods:

```java
IPage<SystemUserVO> pageUsers(SystemUserDTO.Query query);
IPage<UserListVO> pageErpUsers(UserDTO.QueryUserByPage query);
Boolean importUsers(List<SystemUserDTO.ImportUser> users);
Boolean updateUserRoles(SystemUserDTO.UpdateUserRoles payload);
Boolean updateUserPassword(SystemUserDTO.UpdatePassword payload);
Boolean updateUserStatus(SystemUserDTO.UpdateStatus payload);
IPage<SystemRoleVO> pageRoles(SystemRoleDTO.Query query);
List<SystemRoleVO> listEnabledRoles();
Boolean addRole(SystemRoleDTO.Save payload);
Boolean updateRole(SystemRoleDTO.Update payload);
Boolean deleteRole(Long id);
SystemRoleVO getRoleInfo(Long id);
Boolean updateRoleMenus(SystemRoleDTO.UpdateMenus payload);
List<SystemMenuVO> listMenus();
List<SystemMenuVO> treeMenus();
Boolean addMenu(SystemMenuDTO.Save payload);
Boolean updateMenu(SystemMenuDTO.Update payload);
Boolean deleteMenu(Long id);
```

Implementation details:

- Use `@DS("kbPGSQL")` on `System*ServiceImpl`.
- Use `@DSTransactional(rollbackFor = Exception.class)` for writes touching relation tables.
- On user import, use `username=code`, trim line breaks from `name`, encrypt default password with existing `SystemConstant.USER_PASSWORD_ENCRYPT_KEY` and `SystemConstant.USER_DEFAULT_PASSWORD`.
- On user role update, delete existing `sys_user_role` rows for user ID then insert selected role IDs.
- On role menu update, delete existing `sys_role_menu` rows for role ID then insert selected menu IDs.
- Prevent deleting system roles/users/menus when `isSystem=true`.

- [ ] **Step 5: Add controllers**

Use response wrapper `Result.success(...)`:

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/system/user")
@Tag(name = "系统用户管理")
public class SystemUserController {
    private final SystemUserService systemUserService;

    @PostMapping("/page")
    public Result<IPage<SystemUserVO>> page(@RequestBody SystemUserDTO.Query query) {
        return Result.success(systemUserService.pageUsers(query));
    }
}
```

Add equivalent endpoints for every service method.

- [ ] **Step 6: Verify backend compile**

Run in `D:\Work\WMS\kb-wms-backend`:

```powershell
$env:JAVA_HOME='C:\Users\24634\.jdks\ms-21.0.8'
$env:Path='C:\Users\24634\.jdks\ms-21.0.8\bin;D:\Tools\apache-maven-3.9.10\bin;' + $env:Path
mvn -Pdev test
```

Expected: build succeeds, or failures are unrelated existing tests with exact failing class reported.

## Task 2: Dev Database Menu Seed And Route Name Migration

**Files:**
- Create backend `src/main/resources/sql/dev-system-management-menu.sql`.
- Execute against DBX connection `kb-wms-dev-pg`, database `kb_wms`.

- [ ] **Step 1: Create idempotent SQL**

The SQL should upsert Soybean route rows into `public.sys_menu` using existing IDs where possible. Example row shape:

```sql
insert into public.sys_menu
  (id, parent_id, title, type, path, name, component, icon, permission, sort, status, is_hidden)
values
  (1900, 0, '系统管理', 1, '/manage', 'manage', 'layout.base', 'carbon:cloud-service-management', 'manage', 190, 1, false),
  (1910, 1900, '用户管理', 2, '/manage/user', 'manage_user', 'view.manage_user', 'ic:round-manage-accounts', 'manage_user', 1910, 1, false),
  (1920, 1900, '角色管理', 2, '/manage/role', 'manage_role', 'view.manage_role', 'carbon:user-role', 'manage_role', 1920, 1, false),
  (1930, 1900, '菜单管理', 2, '/manage/menu', 'manage_menu', 'view.manage_menu', 'material-symbols:route', 'manage_menu', 1930, 1, false)
on conflict (id) do update set
  parent_id = excluded.parent_id,
  title = excluded.title,
  type = excluded.type,
  path = excluded.path,
  name = excluded.name,
  component = excluded.component,
  icon = excluded.icon,
  permission = excluded.permission,
  sort = excluded.sort,
  status = excluded.status,
  is_hidden = excluded.is_hidden,
  update_time = now();
```

Also update existing WMS route rows from camelCase paths to kebab-case paths and route keys.

- [ ] **Step 2: Preserve admin access**

Ensure admin role `id=7` has menu IDs `1900, 1910, 1920, 1930`:

```sql
insert into public.sys_role_menu (role_id, menu_id)
select 7, id
from public.sys_menu
where id in (1900, 1910, 1920, 1930)
on conflict do nothing;
```

- [ ] **Step 3: Execute SQL with DBX**

Run the final SQL against `kb-wms-dev-pg`.

- [ ] **Step 4: Verify SQL**

Run:

```sql
select id, parent_id, title, path, name, permission
from public.sys_menu
where id between 1900 and 1930
order by id;

select role_id, menu_id
from public.sys_role_menu
where role_id = 7 and menu_id between 1900 and 1930
order by menu_id;
```

Expected: four system management rows and four admin mappings.

## Task 3: Frontend API Types And Request Layer

**Files:**
- Modify `D:\Work\WMS\soybean-admin-element-plus\src\typings\api\system-manage.d.ts`.
- Modify `D:\Work\WMS\soybean-admin-element-plus\src\service\api\system-manage.ts`.

- [ ] **Step 1: Replace mock types**

Use numeric status and WMS fields:

```ts
type EnableStatus = 1 | 2;
type MenuType = 1 | 2 | 3;

type User = {
  id: number;
  code: string;
  username: string;
  name: string;
  department?: string | null;
  status: EnableStatus;
  isSystem: boolean;
  roleIds: number[];
  roleNames: string[];
  createTime?: string;
  updateTime?: string;
};
```

Define `Role`, `Menu`, `MenuTree`, query DTOs, and save DTOs using backend field names.

- [ ] **Step 2: Replace request URLs**

Use:

```ts
export function fetchGetUserList(data?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({ url: '/system/user/page', method: 'post', data });
}
```

Add request functions for all endpoints in the spec.

- [ ] **Step 3: Verify type usage**

Run:

```powershell
pnpm typecheck
```

Expected: current type errors are only from pages not yet migrated in later tasks.

## Task 4: Frontend User And Role Pages

**Files:**
- Modify `src/views/manage/user/index.vue`.
- Modify `src/views/manage/user/modules/user-search.vue`.
- Modify `src/views/manage/user/modules/user-operate-drawer.vue`.
- Modify `src/views/manage/role/index.vue`.
- Modify `src/views/manage/role/modules/role-search.vue`.
- Modify `src/views/manage/role/modules/role-operate-drawer.vue`.
- Modify `src/views/manage/role/modules/menu-auth-modal.vue`.
- Modify locale files.

- [ ] **Step 1: User list fields**

Columns must be:

```ts
[
  { prop: 'selection', type: 'selection', width: 48 },
  { prop: 'index', type: 'index', label: '序号', width: 64 },
  { prop: 'code', label: '工号', minWidth: 130 },
  { prop: 'name', label: '姓名', minWidth: 140 },
  { prop: 'department', label: '部门', minWidth: 160 },
  { prop: 'roleNames', label: '角色', minWidth: 180 },
  { prop: 'status', label: '状态', width: 100 }
]
```

Render `status === 1` as `启用`, `status === 2` as `禁用`.

- [ ] **Step 2: User operations**

Implement:

- Refresh list.
- Edit role assignment through drawer.
- Reset password.
- Enable/disable.
- Optional ERP import drawer or modal using `fetchGetErpUserList` and `fetchAddUsers`.

- [ ] **Step 3: Role list fields**

Columns must be:

```ts
[
  { prop: 'selection', type: 'selection', width: 48 },
  { prop: 'index', type: 'index', label: '序号', width: 64 },
  { prop: 'name', label: '角色名称', minWidth: 140 },
  { prop: 'code', label: '角色编码', minWidth: 140 },
  { prop: 'description', label: '角色说明', minWidth: 200 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'operate', label: '操作', width: 220 }
]
```

- [ ] **Step 4: Role menu authorization**

`menu-auth-modal.vue` must:

- Load `fetchGetMenuTree()`.
- Load `fetchGetRoleInfo(roleId)` and set checked menu IDs from `menuIds`.
- Save with `fetchUpdateRoleMenus({ roleId, menuIds: checks.value })`.
- Close and emit refresh after successful save.

- [ ] **Step 5: Verify**

Run:

```powershell
pnpm typecheck
pnpm lint
```

Expected: both pass for user/role pages.

## Task 5: Frontend Menu Page

**Files:**
- Modify `src/views/manage/menu/index.vue`.
- Modify `src/views/manage/menu/modules/menu-operate-modal.vue`.
- Modify `src/views/manage/menu/modules/shared.ts` only if route-name helpers need WMS field adjustments.
- Modify locale files if labels are missing.

- [ ] **Step 1: Render tree data**

Use `fetchGetMenuList()` to load tree table rows. Do not paginate the menu tree; remove pagination if data is a tree.

- [ ] **Step 2: Map fields**

Display:

```ts
id, type, title, icon, name, path, component, permission, status, isHidden, parentId, sort
```

Map labels to Chinese UI:

- `type=1` 目录
- `type=2` 菜单
- `type=3` 按钮
- `status=1` 启用
- `status=2` 禁用

- [ ] **Step 3: Implement modal submit**

For add:

```ts
await fetchAddMenu(params);
```

For edit:

```ts
await fetchUpdateMenu({ ...params, id: props.rowData.id });
```

For delete:

```ts
await fetchDeleteMenu(id);
```

- [ ] **Step 4: Verify**

Run:

```powershell
pnpm typecheck
pnpm lint
```

Expected: both pass for menu page.

## Task 6: End-To-End Verification And Cleanup

**Files:**
- Modify only files needed to fix issues from verification.

- [ ] **Step 1: Verify frontend**

Run in `D:\Work\WMS\soybean-admin-element-plus`:

```powershell
pnpm typecheck
pnpm lint
pnpm build:test
```

- [ ] **Step 2: Verify backend**

Run in `D:\Work\WMS\kb-wms-backend`:

```powershell
$env:JAVA_HOME='C:\Users\24634\.jdks\ms-21.0.8'
$env:Path='C:\Users\24634\.jdks\ms-21.0.8\bin;D:\Tools\apache-maven-3.9.10\bin;' + $env:Path
mvn -Pdev test
```

- [ ] **Step 3: Verify database**

Run through DBX on `kb-wms-dev-pg`:

```sql
select count(*) from public.sys_user;
select count(*) from public.sys_role;
select count(*) from public.sys_menu;
select count(*) from public.sys_role_menu;
select count(*) from public.sys_user_role;
```

- [ ] **Step 4: Manual smoke checklist**

Start backend and frontend if needed, then verify:

- Login as `admin`.
- Open `系统管理 / 用户管理`.
- Change a user's roles and refresh.
- Reset a user's password.
- Open `系统管理 / 角色管理`.
- Create, edit, delete a non-system role.
- Configure role menus and verify `sys_role_menu`.
- Open `系统管理 / 菜单管理`.
- Create, edit, delete a test menu.

- [ ] **Step 5: Final status**

Run:

```powershell
git -C D:\Work\WMS\soybean-admin-element-plus status --short
git -C D:\Work\WMS\kb-wms-backend status --short
```

Expected: only intentional implementation files are modified.
