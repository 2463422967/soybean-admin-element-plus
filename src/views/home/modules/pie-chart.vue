<script setup lang="ts">
import { watch } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';

defineOptions({ name: 'PieChart' });

const appStore = useAppStore();

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: '1%',
    left: 'center',
    itemStyle: {
      borderWidth: 0
    }
  },
  series: [
    {
      color: ['#0077b6', '#238b45', '#f2c94c', '#c2410c', '#667085'],
      name: '库存结构',
      type: 'pie',
      radius: ['48%', '72%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '12'
        }
      },
      labelLine: {
        show: false
      },
      data: [] as { name: string; value: number }[]
    }
  ]
}));

async function mockData() {
  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });

  updateOptions(opts => {
    opts.series[0].data = [
      { name: '原材料', value: 34 },
      { name: '半成品', value: 22 },
      { name: '成品', value: 31 },
      { name: '呆滞品', value: 7 },
      { name: '待质检', value: 6 }
    ];

    return opts;
  });
}

function updateLocale() {
  updateOptions((opts, factory) => {
    const originOpts = factory();

    opts.series[0].name = originOpts.series[0].name;

    opts.series[0].data = [
      { name: '原材料', value: 34 },
      { name: '半成品', value: 22 },
      { name: '成品', value: 31 },
      { name: '呆滞品', value: 7 },
      { name: '待质检', value: 6 }
    ];

    return opts;
  });
}

async function init() {
  mockData();
}

watch(
  () => appStore.locale,
  () => {
    updateLocale();
  }
);

// init
init();
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <div class="flex-y-center justify-between">
        <span class="font-semibold">库存占用结构</span>
        <ElTag type="success" effect="plain">总库容 78%</ElTag>
      </div>
    </template>
    <div ref="domRef" class="h-336px overflow-hidden"></div>
  </ElCard>
</template>

<style scoped></style>
