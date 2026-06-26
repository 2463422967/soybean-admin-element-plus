<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({ name: 'HeaderBanner' });

const appStore = useAppStore();
const authStore = useAuthStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));

interface StatisticData {
  id: number;
  title: string;
  value: string | number;
  description: string;
}

const statisticData = computed<StatisticData[]>(() => [
  { id: 0, title: '今日入库', value: 128, description: '待上架 18 单' },
  { id: 1, title: '今日出库', value: 96, description: '波次完成率 82%' },
  { id: 2, title: '库存准确率', value: '99.4%', description: '较昨日 +0.3%' }
]);
</script>

<template>
  <ElCard class="home-hero card-wrapper">
    <ElRow :gutter="gap" class="px-8px" align="middle">
      <ElCol :lg="14" :md="13" :sm="24">
        <div class="home-hero__main">
          <div class="home-hero__icon">
            <SvgIcon icon="carbon:inventory-management" class="text-34px" />
          </div>
          <div class="min-w-0">
            <div class="flex-y-center flex-wrap gap-8px">
              <h2 class="home-hero__title">WMS 运营驾驶舱</h2>
              <ElTag type="success" effect="light" round>仓库运行正常</ElTag>
            </div>
            <p class="home-hero__desc">
              {{ authStore.userInfo.userName }}，当前聚焦收货、上架、拣货、盘点和异常任务的实时处理效率。
            </p>
            <div class="home-hero__chips">
              <span>主仓 A 区</span>
              <span>在线作业员 42 人</span>
              <span>AGV 任务 36 条</span>
            </div>
          </div>
        </div>
      </ElCol>
      <ElCol :lg="10" :md="11" :sm="24">
        <div class="home-hero__stats">
          <div v-for="item in statisticData" :key="item.id" class="home-hero__stat">
            <span>{{ item.title }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.description }}</small>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </ElCard>
</template>

<style scoped lang="scss">
.home-hero {
  :deep(.el-card__body) {
    padding: 18px 20px;
  }
}

.home-hero__main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.home-hero__icon {
  display: flex;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 119, 182, 0.16);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(0, 119, 182, 0.12), rgba(56, 176, 0, 0.1));
  color: #0077b6;
}

.home-hero__title {
  margin: 0;
  color: #1f2937;
  font-size: 22px;
  font-weight: 700;
  line-height: 30px;
}

.home-hero__desc {
  margin: 6px 0 0;
  color: #667085;
  line-height: 24px;
}

.home-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  span {
    border: 1px solid #d8e3ef;
    border-radius: 6px;
    padding: 4px 8px;
    background: #f7fafc;
    color: #475467;
    font-size: 12px;
  }
}

.home-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.home-hero__stat {
  min-width: 0;
  border-left: 3px solid #0077b6;
  border-radius: 6px;
  padding: 10px 12px;
  background: #f8fbff;

  span,
  small {
    display: block;
    overflow: hidden;
    color: #667085;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    display: block;
    margin: 4px 0;
    color: #101828;
    font-size: 24px;
    line-height: 30px;
  }
}

@media (max-width: 768px) {
  .home-hero__stats {
    grid-template-columns: 1fr;
    margin-top: 16px;
  }
}
</style>
