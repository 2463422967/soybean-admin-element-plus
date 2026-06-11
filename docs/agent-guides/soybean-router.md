# Soybean 路由指南摘要

来源：

- 路由概述：https://docs.soybeanjs.cn/zh/guide/router/intro.html
- 路由创建：https://docs.soybeanjs.cn/zh/guide/router/create.html
- 路由结构：https://docs.soybeanjs.cn/zh/guide/router/structure.html
- 路由组件：https://docs.soybeanjs.cn/zh/guide/router/component.html
- 路由缓存：https://docs.soybeanjs.cn/zh/guide/router/cache.html
- 路由跳转：https://docs.soybeanjs.cn/zh/guide/router/push.html
- 路由权限：https://docs.soybeanjs.cn/zh/guide/router/dynamic.html

## 核心原则

- 本项目路由基于 Elegant Router。
- 路由是 `src/views` 文件结构的副产物；删除页面文件会导致路由消失。
- `src/router/elegant` 是自动生成目录，不要手动编辑其中的导入、路由定义和转换文件。
- 自动生成不会覆盖路由的 `component` 和 `meta` 信息；需要改标题、图标、排序、缓存、隐藏菜单时改 `meta`。
- 因页面过渡使用 `<Transition>`，页面 `.vue` 的 `template` 必须只有一个根元素，不能有多个根节点、顶层注释或顶层纯文本。

## 创建和命名

- 优先用 `pnpm gen-route` 创建路由页面；它是交互式创建命令，不等同于强制刷新已存在页面的路由产物。
- 手动创建时，每层路由文件夹名称就是路由名称，页面组件是该文件夹下的 `index.vue` 或参数页 `[id].vue`。
- 一级路由名使用小写加连字符，例如 `material`、`material-list`。
- 二级及以上路由用 `_` 表示层级，例如 `basic-manage_material`、`report-analyze_inventory-report`。
- 不要出现同一层级下 `index.vue` 与子文件夹并列作为同一路由组的结构。
- 以下划线 `_` 开头的文件夹会被忽略，并把其下页面聚合到上一级路由；仅在明确需要聚合时使用。

## 路由结构

- 单级路由会生成 `layout.base$view.[RouteKey]`，表示布局和页面混合组件。
- 二级路由第一层是布局路由，第二层是页面路由，默认重定向到第一个子路由。
- 多级路由最终会转换成两层 Vue 路由，避免多级 keep-alive 问题。
- 多级菜单推荐用两层文件夹加 `_` 表达层级，避免目录过深。
- 参数路由使用 `[id].vue`，生成类似 `/user/:id` 的路径。

## RouteMeta 使用

- `title`：路由标题，菜单和文档标题的基础。
- `i18nKey`：存在时优先使用国际化文案。
- `roles`：静态路由模式下的角色过滤；需要真实权限时应与后端权限模型、菜单数据和路由模式保持一致。
- `keepAlive`：是否缓存页面。
- `constant`：无需登录即可访问的固定路由。
- `icon`：Iconify 图标；`localIcon`：本地 SVG 图标，存在时优先于 `icon`。
- `order`：菜单排序。
- `href`：外链。
- `hideInMenu`：页面存在但不显示在菜单，例如详情页。
- `activeMenu`：详情页等隐藏页面进入时激活的菜单 key。
- `multiTab`：相同路径是否允许多个标签页。
- `fixedIndexInTab`：固定标签页顺序。
- `query`：点击菜单进入时自动携带的 query 参数。

## 缓存和跳转

- 页面缓存通过 `meta.keepAlive` 控制。
- 缓存依赖组件 `name`，项目会通过 Elegant Router 自动注入页面组件名；不要手动破坏页面组件命名。
- 项目内跳转优先使用 `useRouterPush`。
- 在 `setup` 外使用 `useRouterPush` 时传入 `false`。
- 推荐用 `routerPushByKey(routeKey)` 按路由 key 跳转，而不是散落硬编码 path。

## 权限和动态路由

- 静态路由模式下，默认路由需要登录；`meta.constant=true` 表示无需登录。
- 静态路由权限可用 `meta.roles` 匹配 `UserInfo.roles`。
- 动态路由模式由 `.env` 的 `VITE_AUTH_ROUTE_MODE=dynamic` 开启。
- 动态路由来源是 `fetchGetConstantRoutes` 和 `fetchGetUserRoutes`。
- 动态路由接口返回的数据结构必须与前端静态路由表一致。

## 业务路由维护注意

- 新页面优先按 Soybean 命名规则创建。
- 如果需要兼容旧路径或后端菜单路径，必须在路由设计中显式说明，不要私自混用两套路由命名。
- 详情页、弹窗承载页、隐藏工具页使用 `hideInMenu`，并用 `activeMenu` 指向所属列表页。
- 新增或移动页面后，检查 `src/typings/elegant-router.d.ts`、`src/router/elegant/routes.ts`、`src/router/elegant/imports.ts` 是否已刷新。
- 如果 `pnpm gen-route` 进入创建页面交互而不是刷新产物，可通过 `pnpm dev` 或构建流程触发 Vite/Elegant Router 插件生成，再检查产物 diff。
