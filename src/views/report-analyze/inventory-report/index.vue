<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchGetInventoryReport } from '@/service/api';
import { useEcharts } from '@/hooks/common/echarts';
import ReportChartCard from '../modules/report-chart-card.vue';
import {
  getInventoryCategoryOptions,
  getInventoryWarningDistributionOptions,
  getWarehouseComparisonOptions
} from '../modules/chart-options';
import { getReportPageClass } from '../modules/report-layout';

defineOptions({ name: 'InventoryReport' });

withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  {
    embedded: false
  }
);

const loading = ref(false);
const reportData = ref<Wms.ReportAnalysis.InventoryReport>({});

let refreshTimer: ReturnType<typeof setInterval> | undefined;

const warningDetails = computed(() => reportData.value.inventoryWarning || []);
const stockComparison = computed(() => reportData.value.inventoryStockComparison || []);
const totalStockQty = computed(() =>
  stockComparison.value.reduce((sum, item) => {
    const parsed = Number(item.stockNum ?? 0);

    return sum + (Number.isNaN(parsed) ? 0 : parsed);
  }, 0)
);

const { domRef: categoryChartRef, setOptions: setCategoryOptions } = useEcharts(() => getInventoryCategoryOptions([]), {
  onRender(chart) {
    chart.setOption(getInventoryCategoryOptions(reportData.value.inventoryClassification || []));
  }
});
const { domRef: warningChartRef, setOptions: setWarningOptions } = useEcharts(
  () => getInventoryWarningDistributionOptions([]),
  {
    onRender(chart) {
      chart.setOption(getInventoryWarningDistributionOptions(reportData.value.inventoryWarningDistribution || []));
    }
  }
);
const { domRef: warehouseChartRef, setOptions: setWarehouseOptions } = useEcharts(
  () => getWarehouseComparisonOptions([]),
  {
    onRender(chart) {
      chart.setOption(getWarehouseComparisonOptions(reportData.value.inventoryStockComparison || []));
    }
  }
);

function updateCharts() {
  setCategoryOptions(getInventoryCategoryOptions(reportData.value.inventoryClassification || []));
  setWarningOptions(getInventoryWarningDistributionOptions(reportData.value.inventoryWarningDistribution || []));
  setWarehouseOptions(getWarehouseComparisonOptions(reportData.value.inventoryStockComparison || []));
}

async function getData() {
  loading.value = true;

  try {
    const { data, error } = await fetchGetInventoryReport();

    if (!error) {
      reportData.value = data || {};
      updateCharts();
    }
  } catch {
    ElMessage.error('库存报表数据加载失败');
  } finally {
    loading.value = false;
  }
}

function startRefresh() {
  refreshTimer = setInterval(() => {
    getData();
  }, 60 * 1000);
}

onMounted(() => {
  getData();
  startRefresh();
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<template>
  <div :class="getReportPageClass(embedded)">
    <ElCard v-if="!embedded" class="card-wrapper">
      <div class="flex flex-wrap items-center justify-between gap-12px">
        <div>
          <h2 class="m-0 text-20px font-semibold">库存报表</h2>
          <p class="m-0 mt-6px text-13px text-[var(--el-text-color-secondary)]">
            汇总库存预警、分类占比、预警分布和仓库库存对比。
          </p>
        </div>
        <ElButton type="primary" plain :loading="loading" @click="getData">
          <template #icon>
            <icon-ic-round-refresh class="text-icon" />
          </template>
          刷新
        </ElButton>
      </div>
    </ElCard>

    <ElRow :gutter="16">
      <ElCol :lg="6" :md="12" :sm="24">
        <ElCard class="card-wrapper">
          <div class="text-13px text-[var(--el-text-color-secondary)]">预警物料</div>
          <div class="mt-8px text-28px font-semibold">{{ warningDetails.length }}</div>
        </ElCard>
      </ElCol>
      <ElCol :lg="6" :md="12" :sm="24">
        <ElCard class="card-wrapper">
          <div class="text-13px text-[var(--el-text-color-secondary)]">库存分类</div>
          <div class="mt-8px text-28px font-semibold">{{ reportData.inventoryClassification?.length || 0 }}</div>
        </ElCard>
      </ElCol>
      <ElCol :lg="6" :md="12" :sm="24">
        <ElCard class="card-wrapper">
          <div class="text-13px text-[var(--el-text-color-secondary)]">统计仓库</div>
          <div class="mt-8px text-28px font-semibold">{{ stockComparison.length }}</div>
        </ElCard>
      </ElCol>
      <ElCol :lg="6" :md="12" :sm="24">
        <ElCard class="card-wrapper">
          <div class="text-13px text-[var(--el-text-color-secondary)]">库存总量</div>
          <div class="mt-8px text-28px font-semibold">{{ totalStockQty }}</div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <ElCol :lg="12" :md="24">
        <ReportChartCard title="库存预警明细" :loading="loading" height="360px">
          <ElTable height="100%" border :data="warningDetails" empty-text="暂无库存预警">
            <ElTableColumn prop="materialCode" label="物料编码" min-width="150" />
            <ElTableColumn prop="materialName" label="物料名称" min-width="180" />
            <ElTableColumn prop="stockNum" label="库存数量" min-width="110" />
            <ElTableColumn prop="warningSituation" label="预警情况" min-width="120" align="center">
              <template #default="{ row }">
                <ElTag :type="row.warningSituation === '高库存预警' ? 'danger' : 'warning'">
                  {{ row.warningSituation }}
                </ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </ReportChartCard>
      </ElCol>
      <ElCol :lg="12" :md="24">
        <ReportChartCard title="库存分类占比" :loading="loading" height="360px">
          <div ref="categoryChartRef" class="h-full w-full"></div>
        </ReportChartCard>
      </ElCol>
      <ElCol :lg="12" :md="24">
        <ReportChartCard title="库存预警分布" :loading="loading" height="360px">
          <div ref="warningChartRef" class="h-full w-full"></div>
        </ReportChartCard>
      </ElCol>
      <ElCol :lg="12" :md="24">
        <ReportChartCard title="仓库库存对比" :loading="loading" height="360px">
          <div ref="warehouseChartRef" class="h-full w-full"></div>
        </ReportChartCard>
      </ElCol>
    </ElRow>
  </div>
</template>
