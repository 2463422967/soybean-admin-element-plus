<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ name: 'ProjectNews' });

interface NewsItem {
  id: number;
  type: 'success' | 'warning' | 'primary' | 'info' | 'danger';
  tag: string;
  content: string;
  time: string;
}

const newses = computed<NewsItem[]>(() => [
  { id: 1, type: 'success', tag: '收货', content: '采购单 PO240624-018 已完成质检，等待 A-03 区上架。', time: '09:18' },
  {
    id: 2,
    type: 'primary',
    tag: '拣货',
    content: '波次 WB240624-006 已释放，涉及 18 个库位、42 个 SKU。',
    time: '09:42'
  },
  { id: 3, type: 'warning', tag: '盘点', content: 'C-12-04 库位盘点差异 6 件，已生成复盘任务。', time: '10:06' },
  { id: 4, type: 'info', tag: '移库', content: '呆滞物料从 B 区转入缓冲区，预计释放 12 个托盘位。', time: '10:31' },
  { id: 5, type: 'danger', tag: '异常', content: 'PDA 离线任务 3 条超过 20 分钟未回传，请班组长确认。', time: '10:48' }
]);
</script>

<template>
  <ElCard class="card-wrapper">
    <template #header>
      <div class="flex-y-center justify-between">
        <span class="font-semibold">作业动态</span>
        <ElButton text type="primary">查看全部</ElButton>
      </div>
    </template>
    <ElTimeline class="operation-timeline">
      <ElTimelineItem v-for="item in newses" :key="item.id" :timestamp="item.time" placement="top" :type="item.type">
        <div class="operation-timeline__item">
          <ElTag :type="item.type" effect="light">{{ item.tag }}</ElTag>
          <p>{{ item.content }}</p>
        </div>
      </ElTimelineItem>
    </ElTimeline>
  </ElCard>
</template>

<style scoped lang="scss">
.operation-timeline {
  --el-timeline-node-size-normal: 11px;
}

.operation-timeline__item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 38px;

  p {
    margin: 1px 0 0;
    color: #344054;
    line-height: 22px;
  }
}
</style>
