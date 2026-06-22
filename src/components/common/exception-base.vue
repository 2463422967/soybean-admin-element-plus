<script lang="ts" setup>
import { computed } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useRouterPush } from '@/hooks/common/router';
import { $t } from '@/locales';

defineOptions({ name: 'ExceptionBase' });

type ExceptionType = '403' | '404' | '500';

interface Props {
  /**
   * Exception type
   *
   * - 403: no permission
   * - 404: not found
   * - 500: service error
   */
  type: ExceptionType;
}

const props = defineProps<Props>();

const { routerPushByKey } = useRouterPush();
const authStore = useAuthStore();

const iconMap: Record<ExceptionType, string> = {
  '403': 'no-permission',
  '404': 'not-found',
  '500': 'service-error'
};

const icon = computed(() => iconMap[props.type]);

function logout() {
  authStore.resetStore();
}
</script>

<template>
  <div class="size-full min-h-520px flex-col-center gap-24px overflow-hidden">
    <div class="flex text-400px text-primary">
      <SvgIcon :local-icon="icon" />
    </div>
    <ElSpace>
      <ElButton type="primary" @click="routerPushByKey('root')">{{ $t('common.backToHome') }}</ElButton>
      <ElButton v-if="type === '403'" @click="logout">{{ $t('common.logout') }}</ElButton>
    </ElSpace>
  </div>
</template>

<style scoped></style>
