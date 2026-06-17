<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { fetchGetHomeworkReport } from '@/service/api';
import { useEcharts } from '@/hooks/common/echarts';
import ReportChartCard from '../modules/report-chart-card.vue';
import {
  getAssignmentTypeOptions,
  getPersonPerformanceOptions,
  getWorkQualityAnalysisOptions,
  getWorkloadTrendOptions
} from '../modules/chart-options';

defineOptions({ name: 'OperationReport' });

withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  {
    embedded: false
  }
);

const loading = ref(false);
const reportData = ref<Wms.ReportAnalysis.HomeworkReport>({});

let refreshTimer: ReturnType<typeof setInterval> | undefined;

const qualityAnalysis = computed(() => reportData.value.workQualityAnalysis || {});
const totalCount = computed(() => qualityAnalysis.value.totalCount || 0);

const { domRef: workloadChartRef, setOptions: setWorkloadOptions } = useEcharts(() => getWorkloadTrendOptions([]), {
  onRender(chart) {
    chart.setOption(getWorkloadTrendOptions(reportData.value.workloadTrend || []));
  }
});
const { domRef: assignmentChartRef, setOptions: setAssignmentOptions } = useEcharts(
  () => getAssignmentTypeOptions([]),
  {
    onRender(chart) {
      chart.setOption(getAssignmentTypeOptions(reportData.value.assignmentTypeDistribution || []));
    }
  }
);
const { domRef: yesterdayPerformanceChartRef, setOptions: setYesterdayPerformanceOptions } = useEcharts(
  () => getPersonPerformanceOptions([]),
  {
    onRender(chart) {
      chart.setOption(getPersonPerformanceOptions(reportData.value.personPerformanceComparisonYesterday || []));
    }
  }
);
const { domRef: weekPerformanceChartRef, setOptions: setWeekPerformanceOptions } = useEcharts(
  () => getPersonPerformanceOptions([]),
  {
    onRender(chart) {
      chart.setOption(getPersonPerformanceOptions(reportData.value.personPerformanceComparison7Days || []));
    }
  }
);
const { domRef: qualityChartRef, setOptions: setQualityOptions } = useEcharts(() => getWorkQualityAnalysisOptions({}), {
  onRender(chart) {
    chart.setOption(getWorkQualityAnalysisOptions(reportData.value.workQualityAnalysis || {}));
  }
});

function updateCharts() {
  setWorkloadOptions(getWorkloadTrendOptions(reportData.value.workloadTrend || []));
  setAssignmentOptions(getAssignmentTypeOptions(reportData.value.assignmentTypeDistribution || []));
  setYesterdayPerformanceOptions(
    getPersonPerformanceOptions(reportData.value.personPerformanceComparisonYesterday || [])
  );
  setWeekPerformanceOptions(getPersonPerformanceOptions(reportData.value.personPerformanceComparison7Days || []));
  setQualityOptions(getWorkQualityAnalysisOptions(reportData.value.workQualityAnalysis || {}));
}

async function getData() {
  loading.value = true;

  try {
    const { data, error } = await fetchGetHomeworkReport();

    if (!error) {
      reportData.value = data || {};
      updateCharts();
    }
  } catch {
    ElMessage.error('作业报表数据加载失败');
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
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard v-if="!embedded" class="card-wrapper">
      <div class="flex flex-wrap items-center justify-between gap-12px">
        <div>
          <h2 class="m-0 text-20px font-semibold">作业报表</h2>
          <p class="m-0 mt-6px text-13px text-[var(--el-text-color-secondary)]">
            汇总近七天作业趋势、作业类型、人员绩效和作业量分析。
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
          <div class="text-13px text-[var(--el-text-color-secondary)]">作业总量</div>
          <div class="mt-8px text-28px font-semibold">{{ totalCount }}</div>
        </ElCard>
      </ElCol>
      <ElCol :lg="6" :md="12" :sm="24">
        <ElCard class="card-wrapper">
          <div class="text-13px text-[var(--el-text-color-secondary)]">收货作业</div>
          <div class="mt-8px text-28px font-semibold">{{ qualityAnalysis.receivingCount || 0 }}</div>
        </ElCard>
      </ElCol>
      <ElCol :lg="6" :md="12" :sm="24">
        <ElCard class="card-wrapper">
          <div class="text-13px text-[var(--el-text-color-secondary)]">拣货作业</div>
          <div class="mt-8px text-28px font-semibold">{{ qualityAnalysis.pickingCount || 0 }}</div>
        </ElCard>
      </ElCol>
      <ElCol :lg="6" :md="12" :sm="24">
        <ElCard class="card-wrapper">
          <div class="text-13px text-[var(--el-text-color-secondary)]">待上架/待检验</div>
          <div class="mt-8px text-28px font-semibold">
            {{ (qualityAnalysis.waitShelfCount || 0) + (qualityAnalysis.waitInspectionCount || 0) }}
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <ElCol :lg="12" :md="24">
        <ReportChartCard title="作业量趋势" :loading="loading" height="360px">
          <div ref="workloadChartRef" class="h-full w-full"></div>
        </ReportChartCard>
      </ElCol>
      <ElCol :lg="12" :md="24">
        <ReportChartCard title="作业类型分布" :loading="loading" height="360px">
          <div ref="assignmentChartRef" class="h-full w-full"></div>
        </ReportChartCard>
      </ElCol>
      <ElCol :lg="12" :md="24">
        <ReportChartCard title="人员绩效对比（昨日）" :loading="loading" height="360px">
          <div ref="yesterdayPerformanceChartRef" class="h-full w-full"></div>
        </ReportChartCard>
      </ElCol>
      <ElCol :lg="12" :md="24">
        <ReportChartCard title="人员绩效对比（近七天）" :loading="loading" height="360px">
          <div ref="weekPerformanceChartRef" class="h-full w-full"></div>
        </ReportChartCard>
      </ElCol>
      <ElCol :span="24">
        <ReportChartCard title="作业量分析" :loading="loading" height="360px">
          <div ref="qualityChartRef" class="h-full w-full"></div>
        </ReportChartCard>
      </ElCol>
    </ElRow>
  </div>
</template>
