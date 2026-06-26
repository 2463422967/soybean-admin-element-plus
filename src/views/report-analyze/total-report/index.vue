<script setup lang="ts">
import InventoryReport from '../inventory-report/index.vue';
import OperationReport from '../operation-report/index.vue';
import { getReportPageClass } from '../modules/report-layout';

defineOptions({ name: 'TotalReport' });
</script>

<template>
  <div :class="getReportPageClass()">
    <ElCard class="card-wrapper">
      <div>
        <h2 class="m-0 text-20px font-semibold">仓储综合看板</h2>
        <p class="m-0 mt-6px text-13px text-[var(--el-text-color-secondary)]">
          汇总作业报表和库存报表，作为仓库运营综合分析入口。
        </p>
      </div>
    </ElCard>

    <OperationReport embedded />
    <InventoryReport embedded />
  </div>
</template>
