# Soybean 命令行指南摘要

来源：

- 命令行概述：https://docs.soybeanjs.cn/zh/guide/cli/intro.html
- 命令：https://docs.soybeanjs.cn/zh/guide/cli/command.html
- Git Hooks：https://docs.soybeanjs.cn/zh/guide/cli/git-hooks.html

## sa 命令

- Soybean 的 `sa` 命令由 `packages/scripts` 提供。
- 本项目脚本通过 `pnpm` 调用，优先使用 `package.json` 中已有 scripts。

## 常用命令含义

- `sa cleanup`：删除 `node_modules`、`dist` 等目录。
- `sa update-pkg`：更新 `package.json` 依赖版本。
- `sa git-commit`：生成符合 Conventional Commits 标准的提交信息。
- `sa git-commit-verify`：验证提交信息是否符合 Conventional Commits。
- `sa changelog`：生成 changelog。
- `sa release`：发布、更新版本、生成 changelog、提交代码。
- `sa gen-route`：交互式创建路由页面。

## 本项目脚本

- 开发：`pnpm dev`
- 生产模式开发：`pnpm dev:prod`
- 构建：`pnpm build`
- 测试环境构建：`pnpm build:test`
- 类型检查：`pnpm typecheck`
- lint：`pnpm lint`
- 路由创建：`pnpm gen-route`
- 清理：`pnpm cleanup`

## Git Hooks

- 项目使用 `simple-git-hooks` 做提交校验。
- `commit-msg` 通常执行 `pnpm sa git-commit-verify`。
- `pre-commit` 通常执行类型检查、lint，并检查是否有自动修复后的未提交 diff。
- 不要默认跳过 hooks；只有在明确知道风险并记录原因时，才可临时使用 `--no-verify`。
- 不要为了绕过 hooks 删除 `package.json` 中的 hooks 配置。

## 使用注意

- `cleanup`、`update-pkg`、`release` 会产生较大影响，除非任务明确要求，不要擅自运行。
- 新增、删除、移动 `src/views` 页面后，检查 `src/router/elegant/*` 和 `src/typings/elegant-router.d.ts` 是否已刷新。
- 在本项目中，`pnpm gen-route` 更适合创建路由页面；路由产物刷新通常由 Vite/Elegant Router 插件在 `pnpm dev` 或构建流程中触发。
- 提交相关请求必须遵循仓库级提交规范和用户指定的 git 流程。
