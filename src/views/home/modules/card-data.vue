<script setup lang="ts">
import { computed } from 'vue';
import { createReusableTemplate } from '@vueuse/core';

defineOptions({ name: 'CardData' });

interface CardData {
  key: string;
  title: string;
  value: string | number;
  unit: string;
  tone: string;
  icon: string;
  caption: string;
  trend: string;
}

const cardData = computed<CardData[]>(() => [
  {
    key: 'inbound',
    title: '待收货/待上架',
    value: 46,
    unit: '单',
    tone: 'blue',
    icon: 'carbon:delivery',
    caption: '采购收货 28 单，生产退料 18 单',
    trend: '优先处理 8 单'
  },
  {
    key: 'outbound',
    title: '待拣货/待复核',
    value: 73,
    unit: '单',
    tone: 'green',
    icon: 'carbon:send-alt',
    caption: '销售出库 51 单，调拨出库 22 单',
    trend: '波次 12 个'
  },
  {
    key: 'inventory',
    title: '库内任务',
    value: 31,
    unit: '条',
    tone: 'amber',
    icon: 'carbon:inventory-management',
    caption: '移库 14 条，盘点 11 条，补货 6 条',
    trend: '超时 3 条'
  },
  {
    key: 'risk',
    title: '异常预警',
    value: 9,
    unit: '项',
    tone: 'red',
    icon: 'carbon:warning-alt',
    caption: '库存差异 4 项，库位拥堵 5 项',
    trend: '需主管确认'
  }
]);

interface MetricCardProps {
  tone: string;
}

const [DefineMetricCard, MetricCard] = createReusableTemplate<MetricCardProps>();
</script>

<template>
  <ElCard class="card-wrapper">
    <DefineMetricCard v-slot="{ $slots, tone }">
      <div class="metric-card" :class="`metric-card--${tone}`">
        <component :is="$slots.default" />
      </div>
    </DefineMetricCard>
    <ElRow :gutter="16">
      <ElCol v-for="item in cardData" :key="item.key" :lg="6" :md="12" :sm="24" class="my-8px">
        <MetricCard :tone="item.tone" class="flex-1">
          <div class="metric-card__header">
            <span>{{ item.title }}</span>
            <SvgIcon :icon="item.icon" class="text-24px" />
          </div>
          <div class="metric-card__value">
            <CountTo v-if="typeof item.value === 'number'" :start-value="1" :end-value="item.value" />
            <span v-else>{{ item.value }}</span>
            <small>{{ item.unit }}</small>
          </div>
          <p>{{ item.caption }}</p>
          <div class="metric-card__trend">{{ item.trend }}</div>
        </MetricCard>
      </ElCol>
    </ElRow>
  </ElCard>
</template>

<style scoped lang="scss">
.metric-card {
  min-height: 142px;
  border: 1px solid var(--metric-border);
  border-radius: 8px;
  padding: 14px 16px;
  background: linear-gradient(180deg, var(--metric-bg), #fff);
  color: #101828;
}

.metric-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #475467;
  font-weight: 600;
}

.metric-card__value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 14px;
  color: var(--metric-color);
  font-size: 34px;
  font-weight: 700;
  line-height: 40px;

  small {
    color: #667085;
    font-size: 14px;
    font-weight: 500;
  }
}

.metric-card p {
  min-height: 22px;
  margin: 8px 0 10px;
  overflow: hidden;
  color: #667085;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card__trend {
  display: inline-flex;
  border-radius: 6px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--metric-color);
  font-size: 12px;
  font-weight: 600;
}

.metric-card--blue {
  --metric-bg: #eef7ff;
  --metric-border: #c9e6ff;
  --metric-color: #0077b6;
}

.metric-card--green {
  --metric-bg: #effaf4;
  --metric-border: #cbeedb;
  --metric-color: #238b45;
}

.metric-card--amber {
  --metric-bg: #fff8e7;
  --metric-border: #f4dc9b;
  --metric-color: #b7791f;
}

.metric-card--red {
  --metric-bg: #fff1f0;
  --metric-border: #ffd0ca;
  --metric-color: #c2410c;
}
</style>
