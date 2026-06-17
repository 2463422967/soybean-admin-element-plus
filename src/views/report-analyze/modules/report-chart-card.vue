<script setup lang="ts">
defineOptions({ name: 'ReportChartCard' });

withDefaults(
  defineProps<{
    title: string;
    loading?: boolean;
    height?: string;
  }>(),
  {
    loading: false,
    height: '320px'
  }
);
</script>

<template>
  <ElCard class="h-full card-wrapper">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="text-15px font-medium">{{ title }}</span>
        <slot name="extra"></slot>
      </div>
    </template>
    <div v-loading="loading" class="w-full" :style="{ height }">
      <slot></slot>
    </div>
  </ElCard>
</template>
