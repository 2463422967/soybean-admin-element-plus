# Soybean 请求指南摘要

来源：

- 请求概述：https://docs.soybeanjs.cn/zh/guide/request/intro.html
- 请求使用：https://docs.soybeanjs.cn/zh/guide/request/usage.html
- 请求代理：https://docs.soybeanjs.cn/zh/guide/request/proxy.html
- 对接后端：https://docs.soybeanjs.cn/zh/guide/request/backend.html

## 环境和基础地址

- 项目通过环境文件区分请求环境，常见环境文件包括 `.env.test`、`.env.prod`。
- `.env` 中请求相关配置：
  - `VITE_SERVICE_SUCCESS_CODE`：后端请求成功 code。
  - `VITE_SERVICE_LOGOUT_CODES`：需要退出登录的 code，多个值用逗号分隔。
  - `VITE_SERVICE_MODAL_LOGOUT_CODES`：需要弹窗提醒并退出登录的 code。
  - `VITE_SERVICE_EXPIRED_TOKEN_CODES`：token 过期并尝试刷新 token 的 code。
- `.env.test` / `.env.prod` 中请求地址配置：
  - `VITE_SERVICE_BASE_URL`
  - `VITE_OTHER_SERVICE_BASE_URL`
- 使用 `getServiceBaseURL(import.meta.env, isHttpProxy)` 获取 `baseURL` 和 `otherBaseURL`。

## 请求实例

- 项目请求实例由 `createRequest` 或 `createFlatRequest` 创建。
- `createRequest`：请求成功后直接返回转换后的数据。
- `createFlatRequest`：把结果包装成扁平对象，调用侧通过 `{ data, error }` 判断和取值。
- 本项目优先延续现有 `src/service/request/index.ts` 封装，不在页面里直接创建 axios 实例。

## RequestOption 要点

- `onRequest`：请求发送前处理配置，通常用于注入 token、业务 header。
- `isBackendSuccess`：根据后端响应判断业务是否成功，通常对比 `response.data.code` 和 `VITE_SERVICE_SUCCESS_CODE`。
- `onBackendFail`：业务失败时处理登出、弹窗登出、token 刷新和重试。
- `transform` / `transformBackendResponse`：把后端响应转换成调用侧需要的数据。
- `onError`：统一错误展示和异常兜底。

## 类型约定

- 后端统一响应类型通常定义为 `App.Service.Response<T>`。
- 默认形态是 `{ code, msg, data }`，但实际项目要按后端返回调整。
- 如果后端 code 是数字，而环境变量读取为字符串，比较前必须转换到同一类型。
- 每个请求函数都要声明清楚返回数据类型，例如 `request<Api.Auth.LoginToken>(...)`。
- 请求函数命名以 `fetch` 开头，例如 `fetchLogin`、`fetchMaterialList`。

## 代理

- 代理开关由 `VITE_HTTP_PROXY` 控制。
- 代码中通常用 `import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y'` 得到 `isHttpProxy`。
- Soybean 使用 `/proxy-default`、`/proxy-{key}` 这类匹配字符串区分多个服务。
- 如果代理匹配字符串不是后端真实路径的一部分，需要配置 `rewrite` 去掉匹配前缀。
- 新服务代理先通过 `createServiceConfig` 和现有 `createViteProxy` 机制接入，不直接在页面里硬编码 host。

## 对接后端

- 对接前先确认后端响应结构，并同步修改 `App.Service.Response`。
- 再配置 `VITE_SERVICE_SUCCESS_CODE` 和其他 logout/expired token code。
- token header、刷新 token、登出逻辑应集中在请求封装和 auth store，不写进业务页面。
- 分页接口的响应结构差异应通过统一 transform 处理，不在每个页面重复转换。
