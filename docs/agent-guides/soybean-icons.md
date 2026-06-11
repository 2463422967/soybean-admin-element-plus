# Soybean 系统图标指南摘要

来源：

- 系统图标概述：https://docs.soybeanjs.cn/zh/guide/icon/intro.html
- 图标使用：https://docs.soybeanjs.cn/zh/guide/icon/usage.html

## 图标体系

- Iconify 图标通过 `unplugin-icons` 将 Iconify SVG JSON 数据转换为 Vue 组件。
- 本地 SVG 图标通过 `unplugin-icons` 和 `vite-plugin-svg-icons` 转换为 Vue 组件。
- 本地 SVG 图标文件放在 `src/assets/svg-icon`。
- `.env` 中的关键配置：
  - `VITE_ICON_PREFIX`：Iconify 图标组件前缀。
  - `VITE_ICON_LOCAL_PREFIX`：本地 SVG 图标组件前缀，格式遵循 `{VITE_ICON_PREFIX}-`。

## 静态图标

- Iconify 图标可直接在模板中写组件名。
- 组件名前缀来自 `VITE_ICON_PREFIX`，默认形态类似 `icon-mdi-emoticon`。
- 可通过 class 或 style 设置大小和颜色，例如 UnoCSS 的 `text-24px text-red`。
- 本地 SVG 图标使用本地前缀和文件名，例如 `custom-icon.svg` 对应 `icon-local-custom-icon`。

## 动态图标

- 动态 Iconify 图标使用全局 `SvgIcon` 组件的 `icon` 属性，例如 `icon="mdi-emoticon"`。
- 动态本地图标使用 `local-icon` 属性，例如 `local-icon="custom-icon"`。
- 批量渲染图标时，用图标名称作为稳定 key。

## Render 函数图标

- 需要在 render/TSX 场景生成图标 VNode 时，使用 `useSvgIcon`。
- Iconify 图标传 `icon`，本地图标传 `localIcon`。
- Element Plus 项目中优先使用已有全局图标组件和 Iconify 组件；只有 render/TSX formatter 里再考虑 VNode 方式。

## 离线图标集合

- 项目已包含 `@iconify/vue` 和 `@iconify/json` 时，可从 `@iconify/json/json/<collection>.json` 引入图标集。
- 使用 `addCollection` 注册离线图标集合。
- 只有确认需要离线图标集时才新增集合，避免无意义扩大包体。

## 注意事项

- SVG 被转换为静态资源后，修改 SVG 源文件不会自动热更新；修改本地 SVG 后需要重启项目。
- 新功能优先使用 Iconify，不新增 Font Awesome 依赖或旧图标体系。
- 菜单图标优先使用 `RouteMeta.icon`；确需本地图标时使用 `RouteMeta.localIcon`。
