<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  fetchGetSourceDocumentMappings,
  fetchGetSourceDocumentOptions,
  fetchRestoreDefaultSourceDocumentMappings,
  fetchSaveSourceDocumentMappings
} from '@/service/api';

defineOptions({ name: 'DocumentSourceSetting' });

type WorkType = 'receiving' | 'picking';
type OperationCategory = 'RECEIVE' | 'PICK';

interface SourceOption extends Wms.DocumentFlow.SourceDocumentOption {
  value: string;
}

interface EditableDocumentSourceItem extends Wms.DocumentFlow.SourceDocumentMapping {
  rowKey: string;
  workType: WorkType;
  workName: string;
  businessName: string;
  options: SourceOption[];
  selectedSource: string;
  defaultSource: string;
}

const workTypeOptions: { label: string; value: WorkType }[] = [
  { label: '收货作业', value: 'receiving' },
  { label: '拣货作业', value: 'picking' }
];

const workTypeCategoryMap: Record<WorkType, OperationCategory> = {
  receiving: 'RECEIVE',
  picking: 'PICK'
};

const categoryWorkTypeMap: Record<string, WorkType> = {
  RECEIVE: 'receiving',
  PICK: 'picking'
};

const categoryNameMap: Record<OperationCategory, string> = {
  RECEIVE: '收货作业',
  PICK: '拣货作业'
};

const activeWorkType = ref<WorkType>('receiving');
const loading = ref(false);
const saving = ref(false);
const restoring = ref(false);
const tableData = ref<EditableDocumentSourceItem[]>([]);

const activeOperationCategory = computed(() => workTypeCategoryMap[activeWorkType.value]);

function getOptionValue(option: Partial<Wms.DocumentFlow.SourceDocumentOption>) {
  return [
    option.sourceMode || '',
    option.kingdeeFormId || '',
    option.kingdeeBillType || '',
    option.adapterCode || ''
  ].join('::');
}

function getMappingValue(mapping: Wms.DocumentFlow.SourceDocumentMapping) {
  return getOptionValue({
    sourceMode: mapping.sourceMode,
    kingdeeFormId: mapping.kingdeeFormId,
    kingdeeBillType: mapping.kingdeeBillType,
    adapterCode: mapping.adapterCode
  });
}

function getMappingLabel(mapping: Wms.DocumentFlow.SourceDocumentMapping) {
  if (mapping.sourceMode === 'MANUAL') {
    return '手工创建';
  }

  return mapping.kingdeeBillType || mapping.kingdeeFormId || '金蝶来源单据';
}

function createCurrentOption(mapping: Wms.DocumentFlow.SourceDocumentMapping): SourceOption {
  return {
    label: getMappingLabel(mapping),
    sourceMode: mapping.sourceMode,
    kingdeeFormId: mapping.kingdeeFormId,
    kingdeeBillType: mapping.kingdeeBillType,
    adapterCode: mapping.adapterCode,
    defaultOption: mapping.defaultMapping,
    value: getMappingValue(mapping)
  };
}

function normalizeOptions(
  options: Wms.DocumentFlow.SourceDocumentOption[],
  mapping: Wms.DocumentFlow.SourceDocumentMapping
) {
  const currentOption = createCurrentOption(mapping);
  const normalizedOptions = options.map(option => ({
    ...option,
    value: getOptionValue(option)
  }));

  if (!normalizedOptions.some(option => option.value === currentOption.value)) {
    normalizedOptions.unshift(currentOption);
  }

  return normalizedOptions;
}

async function buildEditableItem(mapping: Wms.DocumentFlow.SourceDocumentMapping): Promise<EditableDocumentSourceItem> {
  const { data: options, error } = await fetchGetSourceDocumentOptions({
    operationCategory: mapping.operationCategory,
    operationScene: mapping.operationScene
  });
  const normalizedOptions = normalizeOptions(error ? [] : options || [], mapping);
  const selectedSource = getMappingValue(mapping);
  const defaultSource = normalizedOptions.find(option => option.defaultOption)?.value || selectedSource;

  return {
    ...mapping,
    rowKey: mapping.id ? String(mapping.id) : mapping.operationScene,
    workType: categoryWorkTypeMap[mapping.operationCategory] || activeWorkType.value,
    workName: mapping.operationCategoryName || categoryNameMap[activeOperationCategory.value],
    businessName: mapping.operationSceneName,
    options: normalizedOptions,
    selectedSource,
    defaultSource
  };
}

async function loadMappings() {
  loading.value = true;

  try {
    const { data: mappings, error } = await fetchGetSourceDocumentMappings({
      operationCategory: activeOperationCategory.value
    });

    tableData.value = error ? [] : await Promise.all((mappings || []).map(mapping => buildEditableItem(mapping)));
  } finally {
    loading.value = false;
  }
}

function buildSaveItem(item: EditableDocumentSourceItem): Wms.DocumentFlow.SourceDocumentMappingSaveParams {
  const selectedOption = item.options.find(option => option.value === item.selectedSource);

  return {
    id: item.id,
    operationCategory: item.operationCategory,
    operationCategoryName: item.operationCategoryName,
    operationScene: item.operationScene,
    operationSceneName: item.operationSceneName,
    sourceMode: selectedOption?.sourceMode || item.sourceMode,
    kingdeeFormId: selectedOption?.kingdeeFormId,
    kingdeeBillType: selectedOption?.kingdeeBillType,
    adapterCode: selectedOption?.adapterCode,
    queryTemplateCode: item.queryTemplateCode,
    enabled: item.enabled,
    defaultMapping: item.defaultMapping,
    sort: item.sort,
    remark: item.remark
  };
}

async function resetDefaults() {
  restoring.value = true;

  try {
    const { error } = await fetchRestoreDefaultSourceDocumentMappings(activeOperationCategory.value);

    if (!error) {
      await loadMappings();
      window.$message?.success('已恢复默认配置');
    }
  } finally {
    restoring.value = false;
  }
}

async function saveConfig() {
  saving.value = true;

  try {
    const { error } = await fetchSaveSourceDocumentMappings(tableData.value.map(item => buildSaveItem(item)));

    if (!error) {
      await loadMappings();
      window.$message?.success('单据来源配置已保存');
    }
  } finally {
    saving.value = false;
  }
}

watch(activeWorkType, () => {
  loadMappings();
});

onMounted(() => {
  loadMappings();
});
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-lg:overflow-auto">
    <ElCard class="card-wrapper">
      <div class="flex flex-wrap items-center justify-between gap-16px">
        <div class="flex items-center gap-12px">
          <div class="size-42px flex-center rounded-6px bg-primary/10 text-primary">
            <icon-mdi-file-cog-outline class="text-24px" />
          </div>
          <div>
            <h2 class="m-0 text-18px text-[var(--el-text-color-primary)] font-600">单据参数设置</h2>
            <p class="m-0 mt-4px text-13px text-[var(--el-text-color-secondary)]">
              维护 WMS 作业与 ERP 来源单据的对应关系
            </p>
          </div>
        </div>

        <ElSpace wrap>
          <ElButton :loading="restoring" :disabled="loading || saving" @click="resetDefaults">
            <template #icon>
              <icon-ic-round-refresh class="text-icon" />
            </template>
            恢复默认
          </ElButton>
          <ElButton type="primary" :loading="saving" :disabled="loading || restoring" @click="saveConfig">
            <template #icon>
              <icon-ic-round-save class="text-icon" />
            </template>
            保存配置
          </ElButton>
        </ElSpace>
      </div>
    </ElCard>

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex flex-wrap items-center gap-12px">
          <ElSegmented v-model="activeWorkType" :options="workTypeOptions" :disabled="loading || saving || restoring" />
        </div>
      </template>

      <ElTable
        v-loading="loading"
        height="100%"
        border
        class="sm:h-full"
        :data="tableData"
        row-key="rowKey"
        empty-text="暂无单据来源配置"
      >
        <ElTableColumn prop="workName" label="作业类别" width="120" />
        <ElTableColumn prop="businessName" label="业务场景" min-width="140" />
        <ElTableColumn label="当前选择" min-width="220">
          <template #default="{ row }: { row: EditableDocumentSourceItem }">
            <ElSelect
              v-model="row.selectedSource"
              class="w-full"
              placeholder="请选择单据来源"
              :disabled="saving || restoring"
            >
              <ElOption v-for="option in row.options" :key="option.value" :label="option.label" :value="option.value" />
            </ElSelect>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="110">
          <template #default="{ row }: { row: EditableDocumentSourceItem }">
            <ElTag :type="row.selectedSource === row.defaultSource ? 'info' : 'primary'" effect="light">
              {{ row.selectedSource === row.defaultSource ? '默认' : '已调整' }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>
