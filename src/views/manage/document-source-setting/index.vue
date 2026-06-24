<script setup lang="ts">
import { computed, ref } from 'vue';

defineOptions({ name: 'DocumentSourceSetting' });

type WorkType = 'receiving' | 'picking';

interface SourceOption {
  label: string;
  value: string;
}

interface DocumentSourceItem {
  id: string;
  workType: WorkType;
  workName: string;
  businessName: string;
  options: SourceOption[];
  defaultSource: string;
  remark: string;
}

interface EditableDocumentSourceItem extends DocumentSourceItem {
  selectedSource: string;
}

const storageKey = 'zanbo-wms-demo-document-source-setting';

const workTypeOptions: { label: string; value: WorkType }[] = [
  { label: '收货作业', value: 'receiving' },
  { label: '拣货作业', value: 'picking' }
];

const sourceItems: DocumentSourceItem[] = [
  {
    id: 'purchase-receiving',
    workType: 'receiving',
    workName: '收货作业',
    businessName: '采购收货',
    options: [{ label: '采购订单', value: '采购订单' }],
    defaultSource: '采购订单',
    remark: ''
  },
  {
    id: 'production-receiving',
    workType: 'receiving',
    workName: '收货作业',
    businessName: '生产收货',
    options: [
      { label: '生产订单', value: '生产订单' },
      { label: '生产汇报单', value: '生产汇报单' }
    ],
    defaultSource: '生产订单',
    remark: '目前生产订单'
  },
  {
    id: 'sales-return',
    workType: 'receiving',
    workName: '收货作业',
    businessName: '销售退货',
    options: [{ label: '退货通知单', value: '退货通知单' }],
    defaultSource: '退货通知单',
    remark: ''
  },
  {
    id: 'production-return-material',
    workType: 'receiving',
    workName: '收货作业',
    businessName: '生产退料',
    options: [{ label: '生产退料单', value: '生产退料单' }],
    defaultSource: '生产退料单',
    remark: ''
  },
  {
    id: 'outsourcing-return-material',
    workType: 'receiving',
    workName: '收货作业',
    businessName: '委外退料',
    options: [{ label: '委外退料单', value: '委外退料单' }],
    defaultSource: '委外退料单',
    remark: ''
  },
  {
    id: 'other-inbound',
    workType: 'receiving',
    workName: '收货作业',
    businessName: '其他入库',
    options: [
      { label: '其他入库单', value: '其他入库单' },
      { label: '手工创建', value: '手工创建' }
    ],
    defaultSource: '手工创建',
    remark: '目前无'
  },
  {
    id: 'other-outbound-return',
    workType: 'receiving',
    workName: '收货作业',
    businessName: '其他出库退回',
    options: [{ label: '手工创建', value: '手工创建' }],
    defaultSource: '手工创建',
    remark: '目前无'
  },
  {
    id: 'sales-outbound',
    workType: 'picking',
    workName: '拣货作业',
    businessName: '销售出库',
    options: [
      { label: '销售订单', value: '销售订单' },
      { label: '发货通知单', value: '发货通知单' }
    ],
    defaultSource: '发货通知单',
    remark: '目前发货通知单'
  },
  {
    id: 'purchase-return-material',
    workType: 'picking',
    workName: '拣货作业',
    businessName: '采购退料',
    options: [
      { label: '退料申请单', value: '退料申请单' },
      { label: '采购退料单', value: '采购退料单' }
    ],
    defaultSource: '采购退料单',
    remark: '目前采购退料单'
  },
  {
    id: 'production-picking',
    workType: 'picking',
    workName: '拣货作业',
    businessName: '生产领料',
    options: [
      { label: '生产用料清单', value: '生产用料清单' },
      { label: '生产领料单', value: '生产领料单' }
    ],
    defaultSource: '生产领料单',
    remark: '目前生产领料单'
  },
  {
    id: 'production-replenishment',
    workType: 'picking',
    workName: '拣货作业',
    businessName: '生产补料',
    options: [{ label: '生产退料单', value: '生产退料单' }],
    defaultSource: '生产退料单',
    remark: ''
  },
  {
    id: 'outsourcing-picking',
    workType: 'picking',
    workName: '拣货作业',
    businessName: '委外领料',
    options: [
      { label: '委外用料清单', value: '委外用料清单' },
      { label: '委外领料单', value: '委外领料单' }
    ],
    defaultSource: '委外领料单',
    remark: '目前委外领料单'
  },
  {
    id: 'outsourcing-replenishment',
    workType: 'picking',
    workName: '拣货作业',
    businessName: '委外补料',
    options: [{ label: '委外退料单', value: '委外退料单' }],
    defaultSource: '委外退料单',
    remark: ''
  },
  {
    id: 'other-outbound',
    workType: 'picking',
    workName: '拣货作业',
    businessName: '其他出库',
    options: [
      { label: '其他出库单', value: '其他出库单' },
      { label: '手工创建', value: '手工创建' }
    ],
    defaultSource: '其他出库单',
    remark: '目前其他出库单'
  },
  {
    id: 'other-inbound-return',
    workType: 'picking',
    workName: '拣货作业',
    businessName: '其他入库退回',
    options: [{ label: '手工创建', value: '手工创建' }],
    defaultSource: '手工创建',
    remark: '目前无'
  }
];

function getSavedSources() {
  try {
    const rawValue = localStorage.getItem(storageKey);

    return rawValue ? (JSON.parse(rawValue) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function createEditableItems() {
  const savedSources = getSavedSources();

  return sourceItems.map(item => ({
    ...item,
    selectedSource: savedSources[item.id] || item.defaultSource
  }));
}

const activeWorkType = ref<WorkType>('receiving');
const tableData = ref<EditableDocumentSourceItem[]>(createEditableItems());

const filteredData = computed(() => tableData.value.filter(item => item.workType === activeWorkType.value));
const changedCount = computed(() => tableData.value.filter(item => item.selectedSource !== item.defaultSource).length);
const manualCount = computed(() => tableData.value.filter(item => item.selectedSource === '手工创建').length);
const optionCount = computed(() => sourceItems.reduce((total, item) => total + item.options.length, 0));

function getSourceText(options: SourceOption[]) {
  return options.map(item => item.label).join(' / ');
}

function resetDefaults() {
  tableData.value = sourceItems.map(item => ({
    ...item,
    selectedSource: item.defaultSource
  }));
  localStorage.removeItem(storageKey);
  window.$message?.success('已恢复默认演示配置');
}

function saveDemoConfig() {
  const payload = tableData.value.reduce<Record<string, string>>((result, item) => {
    result[item.id] = item.selectedSource;

    return result;
  }, {});

  localStorage.setItem(storageKey, JSON.stringify(payload));
  window.$message?.success('演示配置已保存到浏览器本地');
}
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
              配置 WMS 作业与 ERP 来源单据的对应关系
            </p>
          </div>
        </div>

        <ElSpace wrap>
          <ElButton @click="resetDefaults">
            <template #icon>
              <icon-ic-round-refresh class="text-icon" />
            </template>
            恢复默认
          </ElButton>
          <ElButton type="primary" @click="saveDemoConfig">
            <template #icon>
              <icon-ic-round-save class="text-icon" />
            </template>
            保存演示配置
          </ElButton>
        </ElSpace>
      </div>
    </ElCard>

    <ElRow :gutter="16">
      <ElCol :xs="24" :sm="8">
        <ElCard shadow="never" class="card-wrapper">
          <div class="flex items-center justify-between">
            <span class="text-[var(--el-text-color-secondary)]">业务项</span>
            <icon-mdi-file-document-multiple-outline class="text-22px text-primary" />
          </div>
          <div class="mt-8px text-24px font-700">{{ tableData.length }}</div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="8" class="lt-sm:mt-12px">
        <ElCard shadow="never" class="card-wrapper">
          <div class="flex items-center justify-between">
            <span class="text-[var(--el-text-color-secondary)]">可选来源</span>
            <icon-mdi-source-branch class="text-22px text-success" />
          </div>
          <div class="mt-8px text-24px font-700">{{ optionCount }}</div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="8" class="lt-sm:mt-12px">
        <ElCard shadow="never" class="card-wrapper">
          <div class="flex items-center justify-between">
            <span class="text-[var(--el-text-color-secondary)]">已调整/手工</span>
            <icon-mdi-pencil-ruler class="text-22px text-warning" />
          </div>
          <div class="mt-8px text-24px font-700">{{ changedCount }} / {{ manualCount }}</div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-12px">
          <ElSegmented v-model="activeWorkType" :options="workTypeOptions" />
          <ElTag type="info" effect="plain">纯前端演示，不调用后端接口</ElTag>
        </div>
      </template>

      <ElTable height="100%" border class="sm:h-full" :data="filteredData" row-key="id">
        <ElTableColumn prop="workName" label="作业类别" width="120" />
        <ElTableColumn prop="businessName" label="业务场景" min-width="140" />
        <ElTableColumn label="可对接 ERP 单据" min-width="240">
          <template #default="{ row }: { row: EditableDocumentSourceItem }">
            <span>{{ getSourceText(row.options) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="当前选择" min-width="220">
          <template #default="{ row }: { row: EditableDocumentSourceItem }">
            <ElSelect v-model="row.selectedSource" class="w-full" placeholder="请选择单据来源">
              <ElOption v-for="option in row.options" :key="option.value" :label="option.label" :value="option.value" />
            </ElSelect>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="remark" label="说明" min-width="180">
          <template #default="{ row }: { row: EditableDocumentSourceItem }">
            <ElTag v-if="row.remark" :type="row.remark === '目前无' ? 'warning' : 'success'" effect="plain">
              {{ row.remark }}
            </ElTag>
            <span v-else class="text-[var(--el-text-color-placeholder)]">-</span>
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
