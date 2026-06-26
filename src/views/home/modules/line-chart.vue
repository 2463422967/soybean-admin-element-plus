<script setup lang="ts">
import { watch } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';

defineOptions({ name: 'LineChart' });

const appStore = useAppStore();

const { domRef, updateOptions } = useEcharts(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    right: 16,
    top: 8,
    data: ['入库完成', '出库完成', '库内移动']
  },
  grid: {
    left: '2%',
    right: '3%',
    bottom: '2%',
    top: 54,
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [] as string[]
  },
  yAxis: {
    type: 'value',
    name: '单据数',
    splitLine: {
      lineStyle: {
        color: '#edf2f7'
      }
    }
  },
  series: [
    {
      color: '#0077b6',
      name: '入库完成',
      type: 'line',
      smooth: true,
      symbolSize: 7,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0.25,
              color: 'rgba(0, 119, 182, 0.26)'
            },
            {
              offset: 1,
              color: 'rgba(0, 119, 182, 0.02)'
            }
          ]
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: [] as number[]
    },
    {
      color: '#238b45',
      name: '出库完成',
      type: 'line',
      smooth: true,
      symbolSize: 7,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0.25,
              color: 'rgba(35, 139, 69, 0.22)'
            },
            {
              offset: 1,
              color: 'rgba(35, 139, 69, 0.02)'
            }
          ]
        }
      },
      emphasis: {
        focus: 'series'
      },
      data: [] as number[]
    },
    {
      color: '#b7791f',
      name: '库内移动',
      type: 'bar',
      barWidth: 10,
      itemStyle: {
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        focus: 'series'
      },
      data: [] as number[]
    }
  ]
}));

async function mockData() {
  await new Promise(resolve => {
    setTimeout(resolve, 1000);
  });

  updateOptions(opts => {
    opts.xAxis.data = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    opts.series[0].data = [12, 21, 34, 48, 65, 82, 113, 128];
    opts.series[1].data = [8, 17, 26, 39, 54, 68, 84, 96];
    opts.series[2].data = [5, 9, 8, 13, 17, 16, 21, 24];

    return opts;
  });
}

function updateLocale() {
  updateOptions((opts, factory) => {
    const originOpts = factory();

    opts.legend.data = originOpts.legend.data;
    opts.series[0].name = originOpts.series[0].name;
    opts.series[1].name = originOpts.series[1].name;
    opts.series[2].name = originOpts.series[2].name;

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
        <span class="font-semibold">今日作业节拍</span>
        <ElTag type="info" effect="plain">按完成时间统计</ElTag>
      </div>
    </template>
    <div ref="domRef" class="h-336px overflow-hidden"></div>
  </ElCard>
</template>

<style scoped></style>
