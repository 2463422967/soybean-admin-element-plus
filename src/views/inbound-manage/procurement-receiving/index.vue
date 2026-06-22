<script setup lang="tsx">
import { nextTick, ref, watch } from 'vue';
import { fetchGetReceivingList, fetchUpdatePrintStatus } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import LabelManagement from '@/views/basic-manage/label-management/index.vue';
import { buildRawMaterialLabelFormData } from './modules/receiving-label';

defineOptions({ name: 'ProcurementReceiving' });

const receiveTypes: Array<{ label: string; value: Wms.Receiving.ReceiveType }> = [
  { label: '采购收货', value: 'procurement' },
  { label: '生产收货', value: 'production' },
  { label: '销售退货收货', value: 'sales_return' },
  { label: '生产退料收货', value: 'production_return' },
  { label: '委外退料收货', value: 'outsourcing_return' },
  { label: '其他出库退货', value: 'other_return' }
];

const activeType = ref<Wms.Receiving.ReceiveType>('procurement');
const activeListTab = ref<Wms.Receiving.ListTab>('unReceive');
const searchParams = ref(getInitSearchParams());
const printDialogVisible = ref(false);
const labelManagementRef = ref<InstanceType<typeof LabelManagement>>();

function getInitSearchParams(): Wms.Receiving.SearchParams {
  return {
    current: 1,
    size: 30,
    receiptNoticeNo: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, reloadColumns } =
  useUIPaginatedTable({
    paginationProps: {
      currentPage: searchParams.value.current,
      pageSize: searchParams.value.size
    },
    api: () => fetchGetReceivingList(activeType.value, activeListTab.value, searchParams.value),
    transform: response => defaultTransform(response),
    onPaginationParamsChange: params => {
      searchParams.value.current = params.currentPage ?? 1;
      searchParams.value.size = params.pageSize ?? 30;
    },
    columns: () => getColumns()
  });

watch([activeType, activeListTab], async () => {
  reloadColumns();
  await getDataByPage(1);
});

function getColumns(): UI.TableColumn<Wms.Receiving.Item>[] {
  const recentUsesReceiveFields =
    activeListTab.value === 'recent' && ['procurement', 'production'].includes(activeType.value);
  const quantityProp = activeListTab.value === 'recent' && !recentUsesReceiveFields ? 'receiptQty' : 'receiveQty';
  const locationProp = activeListTab.value === 'recent' && !recentUsesReceiveFields ? 'location' : 'warehouseLocation';
  const receiverProp = activeListTab.value === 'recent' && !recentUsesReceiveFields ? 'receiver' : 'receivePerson';
  const timeProp = activeListTab.value === 'recent' && !recentUsesReceiveFields ? 'receiptTime' : 'receiveTime';
  const statusProp = activeListTab.value === 'recent' && !recentUsesReceiveFields ? 'status' : 'receiveStatus';
  const common: UI.TableColumn<Wms.Receiving.Item>[] = [
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    { prop: 'batchNo', label: '批号', minWidth: 130 },
    { prop: quantityProp, label: activeListTab.value === 'recent' ? '收货数量' : '数量', minWidth: 100 },
    { prop: 'waitQty', label: '待收货数量', minWidth: 120 },
    { prop: 'warehouse', label: '仓库', minWidth: 130 },
    { prop: locationProp, label: '库位', minWidth: 130 },
    { prop: receiverProp, label: '收货人', minWidth: 110 },
    { prop: timeProp, label: '收货时间', minWidth: 160 },
    {
      prop: statusProp,
      label: '状态',
      align: 'center',
      width: 120,
      formatter: row => (
        <ElTag type={activeListTab.value === 'recent' ? 'success' : 'warning'}>{row.status || row.receiveStatus}</ElTag>
      )
    }
  ];

  return [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    ...getTypeColumns(),
    ...common,
    ...getOperationColumns()
  ];
}

function getTypeColumns(): UI.TableColumn<Wms.Receiving.Item>[] {
  if (activeType.value === 'procurement') {
    return [
      { prop: 'purchaseOrderNo', label: '采购订单号', minWidth: 160 },
      { prop: 'supplierName', label: '供应商', minWidth: 150 },
      { prop: 'receiveType', label: '收货类型', minWidth: 120 }
    ];
  }

  if (activeType.value === 'production') {
    return [
      { prop: 'productionOrderNo', label: '生产订单号', minWidth: 160 },
      { prop: 'saleOrderNo', label: '销售订单号', minWidth: 160 },
      { prop: 'customerNo', label: '客户编号', minWidth: 140 }
    ];
  }

  if (activeType.value === 'sales_return') {
    return [
      { prop: activeListTab.value === 'recent' ? 'orderNo' : 'saleOrderNo', label: '销售订单号', minWidth: 160 },
      { prop: 'customerCode', label: '客户编号', minWidth: 140 }
    ];
  }

  if (activeType.value === 'production_return') {
    return [
      { prop: activeListTab.value === 'recent' ? 'orderNo' : 'productionOrderNo', label: '生产订单号', minWidth: 160 },
      { prop: 'workOrderBatchNo', label: '工单批号', minWidth: 140 }
    ];
  }

  if (activeType.value === 'outsourcing_return') {
    return [
      { prop: activeListTab.value === 'recent' ? 'orderNo' : 'outsourceOrderNo', label: '委外订单号', minWidth: 160 }
    ];
  }

  return [{ prop: activeListTab.value === 'recent' ? 'orderNo' : 'outStoreNo', label: '出库订单号', minWidth: 160 }];
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

function getOperationColumns(): UI.TableColumn<Wms.Receiving.Item>[] {
  if (activeType.value !== 'procurement' || activeListTab.value !== 'recent') {
    return [];
  }

  return [
    {
      prop: 'operation',
      label: '操作',
      align: 'center',
      fixed: 'right',
      width: 110,
      formatter: row => (
        <ElButton type="primary" size="small" plain disabled={!row.entryId} onClick={() => openPrintDialog(row)}>
          {{
            icon: () => <icon-mdi-printer class="text-icon" />,
            default: () => '打印'
          }}
        </ElButton>
      )
    }
  ];
}

async function openPrintDialog(row: Wms.Receiving.Item) {
  if (!row.entryId) {
    window.$message?.warning('当前记录缺少收料通知单分录ID，无法更新打印状态');
    return;
  }

  printDialogVisible.value = true;
  await nextTick();

  await labelManagementRef.value?.setTemplateAndData({
    templateKey: 'model3',
    formData: buildRawMaterialLabelFormData(row),
    printCopies: 1,
    afterPrint: async () => {
      await fetchUpdatePrintStatus([Number(row.entryId)]);
      window.$message?.success('打印状态已更新');
      await getData();
    }
  });
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem title="搜索" name="receiving-search">
          <ElForm :model="searchParams" label-position="right" :label-width="90">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="单据号">
                  <ElInput
                    v-model="searchParams.receiptNoticeNo"
                    clearable
                    placeholder="请输入收货相关单号"
                    @keyup.enter="getDataByPage(1)"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="18" :md="16" :sm="24">
                <ElSpace class="w-full justify-end" alignment="end">
                  <ElButton @click="resetSearchParams">
                    <template #icon>
                      <icon-ic-round-refresh class="text-icon" />
                    </template>
                    重置
                  </ElButton>
                  <ElButton type="primary" plain @click="getDataByPage(1)">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    搜索
                  </ElButton>
                </ElSpace>
              </ElCol>
            </ElRow>
          </ElForm>
        </ElCollapseItem>
      </ElCollapse>
    </ElCard>

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-12px">
          <ElTabs v-model="activeType" class="min-w-560px">
            <ElTabPane v-for="item in receiveTypes" :key="item.value" :label="item.label" :name="item.value" />
          </ElTabs>
          <ElSegmented
            v-model="activeListTab"
            :options="[
              { label: '待收货任务', value: 'unReceive' },
              { label: '最近收货记录', value: 'recent' }
            ]"
          />
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default></template>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="entryId">
          <ElTableColumn v-for="col in columns" :key="String(col.prop)" v-bind="col" />
        </ElTable>
      </div>
      <div class="mt-20px flex justify-end">
        <ElPagination
          v-if="mobilePagination.total"
          layout="total,prev,pager,next,sizes"
          v-bind="mobilePagination"
          @current-change="mobilePagination['current-change']"
          @size-change="mobilePagination['size-change']"
        />
      </div>
    </ElCard>

    <ElDialog v-model="printDialogVisible" title="打印标签" width="980px" destroy-on-close>
      <LabelManagement ref="labelManagementRef" />
    </ElDialog>
  </div>
</template>
