<script setup lang="ts">
import { useForm } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'BasicKeywordSearch' });

interface Props {
  collapseName: string;
  placeholder: string;
}

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();

const { formRef, restoreValidation } = useForm();

const model = defineModel<Wms.BaseInfo.PageSearchParams>('model', { required: true });

async function reset() {
  await restoreValidation();
  emit('reset');
}

function search() {
  emit('search');
}
</script>

<template>
  <ElCard class="card-wrapper">
    <ElCollapse>
      <ElCollapseItem title="搜索" :name="collapseName">
        <ElForm ref="formRef" :model="model" label-position="right" :label-width="80">
          <ElRow :gutter="24">
            <ElCol :lg="6" :md="8" :sm="12">
              <ElFormItem label="关键词" prop="keyWords">
                <ElInput v-model="model.keyWords" clearable :placeholder="placeholder" @keyup.enter="search" />
              </ElFormItem>
            </ElCol>
            <ElCol :lg="18" :md="16" :sm="24">
              <ElSpace class="w-full justify-end" alignment="end">
                <ElButton @click="reset">
                  <template #icon>
                    <icon-ic-round-refresh class="text-icon" />
                  </template>
                  {{ $t('common.reset') }}
                </ElButton>
                <ElButton type="primary" plain @click="search">
                  <template #icon>
                    <icon-ic-round-search class="text-icon" />
                  </template>
                  {{ $t('common.search') }}
                </ElButton>
              </ElSpace>
            </ElCol>
          </ElRow>
        </ElForm>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>
