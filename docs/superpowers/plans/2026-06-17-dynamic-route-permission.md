# Dynamic Route Permission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Soybean 示例菜单从界面隐藏，并用后端 `sys_menu` / `sys_role_menu` 提供动态路由和按钮权限。

**Architecture:** 后端新增 `/route/*` 接口，把启用的 `sys_menu` 转成 Soybean `ElegantConstRoute`。前端切换为 dynamic route mode，登录后只装载后端授权路由；系统管理页面的新增、编辑、删除、授权等操作用 `permission` 按钮码控制。

**Tech Stack:** Spring Boot 3.5、Sa-Token、MyBatis-Plus、JUnit 5、Mockito、Vue 3、Pinia、Vue Router、Soybean Elegant Router、Element Plus。

---

### Task 1: Backend Route API

**Files:**
- Create: `D:\Work\WMS\kb-wms-backend\src\main\java\com\zbcloud\service\kbwms\entity\vo\route\SoybeanRouteMetaVO.java`
- Create: `D:\Work\WMS\kb-wms-backend\src\main\java\com\zbcloud\service\kbwms\entity\vo\route\SoybeanRouteVO.java`
- Create: `D:\Work\WMS\kb-wms-backend\src\main\java\com\zbcloud\service\kbwms\entity\vo\route\UserRouteVO.java`
- Create: `D:\Work\WMS\kb-wms-backend\src\main\java\com\zbcloud\service\kbwms\service\RouteService.java`
- Create: `D:\Work\WMS\kb-wms-backend\src\main\java\com\zbcloud\service\kbwms\service\impl\RouteServiceImpl.java`
- Create: `D:\Work\WMS\kb-wms-backend\src\main\java\com\zbcloud\service\kbwms\controller\RouteController.java`
- Test: `D:\Work\WMS\kb-wms-backend\src\test\java\com\zbcloud\service\kbwms\service\impl\RouteServiceImplTest.java`

- [ ] **Step 1: Write failing tests**

```java
@Test
void getUserRoutesShouldReturnOnlyEnabledMenuRoutesForCurrentUserRoles() {
    // menu type 1/2 should become routes; type 3 should not become routes.
    // disabled menus and unassigned role menus should be excluded.
}

@Test
void getCurrentUserButtonsShouldReturnEnabledButtonPermissions() {
    // type 3 menu with permission should become a button auth code.
}

@Test
void isRouteExistShouldReturnTrueOnlyForEnabledSystemMenuRouteNames() {
    // checks route existence by sys_menu.name and status=1.
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
$env:JAVA_HOME='C:\Users\24634\.jdks\ms-21.0.8'
$env:Path='C:\Users\24634\.jdks\ms-21.0.8\bin;D:\Tools\apache-maven-3.9.10\bin;' + $env:Path
mvn -Pdev -Dtest=RouteServiceImplTest test
```

Expected: compilation fails because `RouteServiceImplTest` references missing `RouteServiceImpl`.

- [ ] **Step 3: Implement minimal backend route service and controller**

Implement:
- `getConstantRoutes()` returns only blank-layout constant routes needed by Soybean: `403`, `404`, `500`, `login`, `iframe-page`.
- `getUserRoutes()` reads current login session user roles, filters enabled `sys_menu` rows by assigned `sys_role_menu`, ignores `type=3`, builds a tree from `parent_id=0`, and returns `{ routes, home }`.
- `isRouteExist(routeName)` checks enabled `sys_menu.name`.
- `getCurrentUserButtons()` returns enabled `type=3` permissions for current roles.

- [ ] **Step 4: Run backend route tests to verify pass**

Run:

```powershell
$env:JAVA_HOME='C:\Users\24634\.jdks\ms-21.0.8'
$env:Path='C:\Users\24634\.jdks\ms-21.0.8\bin;D:\Tools\apache-maven-3.9.10\bin;' + $env:Path
mvn -Pdev -Dtest=RouteServiceImplTest test
```

Expected: PASS.

### Task 2: Backend Login Permission Payload

**Files:**
- Modify: `D:\Work\WMS\kb-wms-backend\src\main\java\com\zbcloud\service\kbwms\service\impl\AuthServiceImpl.java`
- Modify: `D:\Work\WMS\kb-wms-backend\src\main\java\com\zbcloud\service\kbwms\entity\vo\base\UserLoginVO.java`
- Test: `D:\Work\WMS\kb-wms-backend\src\test\java\com\zbcloud\service\kbwms\service\impl\RouteServiceImplTest.java`

- [ ] **Step 1: Write failing login permission expectation**

```java
@Test
void getCurrentUserButtonsShouldReturnEmptyListWhenUserHasNoRole() {
    // No role ids means no button permissions and no exception.
}
```

- [ ] **Step 2: Run test to verify it fails**

Run `mvn -Pdev -Dtest=RouteServiceImplTest test`.

Expected: FAIL or compilation failure until permission helper exists.

- [ ] **Step 3: Update login mapping**

Use route service helper logic so login result continues returning route paths in `roleMenu`, and additionally returns button permission codes in `buttons`.

- [ ] **Step 4: Run targeted tests**

Run `mvn -Pdev -Dtest=RouteServiceImplTest test`.

Expected: PASS.

### Task 3: Frontend Dynamic Route Mode

**Files:**
- Modify: `D:\Work\WMS\soybean-admin-element-plus\.env`
- Modify: `D:\Work\WMS\soybean-admin-element-plus\src\typings\api\auth.d.ts`
- Modify: `D:\Work\WMS\soybean-admin-element-plus\src\store\modules\auth\index.ts`
- Modify: `D:\Work\WMS\soybean-admin-element-plus\src\store\modules\route\index.ts`
- Modify: `D:\Work\WMS\soybean-admin-element-plus\src\service\api\route.ts`

- [ ] **Step 1: Make dynamic mode the default**

Set:

```dotenv
VITE_AUTH_ROUTE_MODE=dynamic
```

- [ ] **Step 2: Map backend button permissions**

Change login user mapping so:

```ts
buttons: loginResult.buttons || []
```

and keep route permissions in `roleMenu` only as backend compatibility data.

- [ ] **Step 3: Avoid static fallback exposing example menus**

In dynamic mode, if `/route/getUserRoutes` fails, reset auth instead of falling back to static generated routes. Static fallback remains only for constant routes.

- [ ] **Step 4: Run frontend typecheck**

Run:

```powershell
pnpm typecheck
```

Expected: PASS.

### Task 4: Frontend Button Permission Gates

**Files:**
- Modify: `D:\Work\WMS\soybean-admin-element-plus\src\views\manage\user\index.vue`
- Modify: `D:\Work\WMS\soybean-admin-element-plus\src\views\manage\role\index.vue`
- Modify: `D:\Work\WMS\soybean-admin-element-plus\src\views\manage\menu\index.vue`

- [ ] **Step 1: Add permission checks**

Use `useAuth().hasAuth()` with these codes:
- `manage_user:import`
- `manage_user:update-role`
- `manage_user:reset-password`
- `manage_user:update-status`
- `manage_role:add`
- `manage_role:update`
- `manage_role:delete`
- `manage_role:menu`
- `manage_menu:add`
- `manage_menu:update`
- `manage_menu:delete`

- [ ] **Step 2: Hide unauthorized buttons**

Render add/edit/delete/auth buttons only when the corresponding code exists. Operation columns remain visible but show no restricted action when no code exists.

- [ ] **Step 3: Guard handlers**

Each restricted handler returns immediately and shows no success path if called without permission.

- [ ] **Step 4: Run frontend checks**

Run:

```powershell
pnpm typecheck
pnpm lint
pnpm build:test
```

Expected: PASS.

### Task 5: Seed Button Permissions

**Files:**
- Modify: `D:\Work\WMS\kb-wms-backend\src\main\resources\sql\dev-system-management-menu.sql`

- [ ] **Step 1: Add button menu rows**

Insert type `3` rows under system-management pages for the codes in Task 4.

- [ ] **Step 2: Assign admin role**

Add the new button menu IDs to admin/system role mappings in `sys_role_menu`.

- [ ] **Step 3: Sync fallback role_menu**

Keep the existing `role_menu` sync logic path-only so old login route paths remain compatible.

- [ ] **Step 4: Run full backend tests**

Run:

```powershell
$env:JAVA_HOME='C:\Users\24634\.jdks\ms-21.0.8'
$env:Path='C:\Users\24634\.jdks\ms-21.0.8\bin;D:\Tools\apache-maven-3.9.10\bin;' + $env:Path
mvn -Pdev test
```

Expected: PASS.
