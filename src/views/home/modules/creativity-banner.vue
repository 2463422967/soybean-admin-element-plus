<script setup lang="ts">
defineOptions({ name: 'CreativityBanner' });

interface QueueItem {
  id: number;
  title: string;
  value: number;
  type: 'primary' | 'success' | 'warning' | 'danger';
}

const queues: QueueItem[] = [
  { id: 1, title: '库存差异待审核', value: 4, type: 'danger' },
  { id: 2, title: '超时未上架', value: 8, type: 'warning' },
  { id: 3, title: '待补货库位', value: 12, type: 'primary' },
  { id: 4, title: '已冻结批次', value: 3, type: 'success' }
];

const healthItems = [
  { label: '库容利用率', value: 78, status: '稳定' },
  { label: '拣货准时率', value: 92, status: '达标' },
  { label: 'PDA 在线率', value: 96, status: '正常' }
];
</script>

<template>
  <ElCard class="h-full card-wrapper">
    <template #header>
      <div class="flex-y-center justify-between">
        <span class="font-semibold">待处理队列</span>
        <ElTag type="warning" effect="plain">27 项</ElTag>
      </div>
    </template>
    <div class="queue-panel">
      <div class="queue-panel__list">
        <div v-for="item in queues" :key="item.id" class="queue-panel__item">
          <ElTag :type="item.type" effect="light">{{ item.value }}</ElTag>
          <span>{{ item.title }}</span>
          <ElButton text type="primary">处理</ElButton>
        </div>
      </div>

      <div class="queue-panel__health">
        <div v-for="item in healthItems" :key="item.label" class="queue-panel__health-item">
          <div class="flex-y-center justify-between">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}%</strong>
          </div>
          <ElProgress :percentage="item.value" :show-text="false" :stroke-width="8" />
          <small>{{ item.status }}</small>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped lang="scss">
.queue-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.queue-panel__list {
  display: grid;
  gap: 10px;
}

.queue-panel__item {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fbfdff;

  span {
    overflow: hidden;
    color: #344054;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.queue-panel__health {
  display: grid;
  gap: 12px;
  border-top: 1px solid #edf2f7;
  padding-top: 16px;
}

.queue-panel__health-item {
  color: #475467;

  strong {
    color: #101828;
  }

  small {
    display: block;
    margin-top: 4px;
    color: #98a2b3;
  }
}
</style>
