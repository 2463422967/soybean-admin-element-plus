# Report Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the WMS report analysis module into Soybean pages with real backend report APIs and reusable ECharts components.

**Architecture:** Add a report-analysis API module and typed `Wms.ReportAnalysis` models, then build three pages under `src/views/report-analyze`: inventory report, operation report, and a combined total report. Charts use the existing `useEcharts` hook and Element Plus cards instead of copying the old dark CSS and duplicated scrolling DOM.

**Tech Stack:** Vue 3, TypeScript, Element Plus, UnoCSS, Elegant Router, ECharts via `useEcharts`, existing request wrapper.

---

### Task 1: API and Types

**Files:**
- Create: `src/service/api/report-analysis.ts`
- Modify: `src/service/api/index.ts`
- Modify: `src/typings/wms.d.ts`

- [ ] Add request functions:
  - `fetchGetInventoryReport()`
  - `fetchGetHomeworkReport()`
- [ ] Add inventory report data types:
  - `InventoryWarningDetails`
  - `InventoryCategoryRatio`
  - `InventoryWarningDistribution`
  - `InventoryStockComparison`
  - `InventoryReport`
- [ ] Add homework report data types:
  - `AssignmentTypeDistribution`
  - `PersonPerformanceComparison`
  - `WorkloadTrend`
  - `WorkQualityAnalysis`
  - `HomeworkReport`

### Task 2: Shared Report Modules

**Files:**
- Create: `src/views/report-analyze/modules/report-chart-card.vue`
- Create: `src/views/report-analyze/modules/chart-options.ts`

- [ ] Build a small card wrapper for report charts.
- [ ] Centralize chart color constants and option builders.
- [ ] Keep the module local to report analysis because it is not yet reused elsewhere.

### Task 3: Inventory Report Page

**Files:**
- Create: `src/views/report-analyze/inventory-report/index.vue`

- [ ] Fetch `/board/reportAnalysis/inventoryReport` on mount.
- [ ] Refresh data every 60 seconds.
- [ ] Render inventory warning details as a table.
- [ ] Render inventory classification, warning distribution, and stock comparison charts.

### Task 4: Operation Report Page

**Files:**
- Create: `src/views/report-analyze/operation-report/index.vue`

- [ ] Fetch `/board/reportAnalysis/homeworkReport` on mount.
- [ ] Refresh data every 60 seconds.
- [ ] Render workload trend, assignment type distribution, yesterday performance, seven-day performance, and work analysis charts.

### Task 5: Total Report Page and Router

**Files:**
- Create: `src/views/report-analyze/total-report/index.vue`
- Modify: `src/router/elegant/routes.ts`
- Modify: `src/router/elegant/imports.ts`
- Modify: `src/router/elegant/transform.ts`
- Modify: `src/typings/elegant-router.d.ts`
- Modify: `src/locales/langs/zh-cn.ts`
- Modify: `src/locales/langs/en-us.ts`

- [ ] Add the report analysis menu.
- [ ] Add three report pages.
- [ ] Use business titles and Iconify icons.
- [ ] Run route/type/build verification.
