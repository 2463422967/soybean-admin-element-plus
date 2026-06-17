<script setup lang="tsx">
import { ref, watch } from 'vue';
import { fetchGetOutboundList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';

defineOptions({ name: 'SalesOutbound' });

const outboundTypes: Array<{ label: string; value: Wms.Outbound.OutboundType }> = [
  { label: '销售出库', value: 'sales' },
  { label: '采购退料', value: 'purchase_return' },
  { label: '生产领料', value: 'production_picking' },
  { label: '生产补料', value: 'production_supplement' },
  { label: '委外领料', value: 'subcontract_picking' },
  { label: '委外补料', value: 'subcontract_supplement' },
  { label: '其他出库', value: 'other' }
];

const activeType = ref<Wms.Outbound.OutboundType>('sales');
const activeListTab = ref<Wms.Outbound.ListTab>('pendingTasks');
const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.Outbound.SearchParams {
  return {
    current: 1,
    size: 30,
    taskId: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, reloadColumns } =
  useUIPaginatedTable({
    paginationProps: {
      currentPage: searchParams.value.current,
      pageSize: searchParams.value.size
    },
    api: () => fetchGetOutboundList(activeType.value, activeListTab.value, searchParams.value),
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

function getColumns(): UI.TableColumn<Wms.Outbound.Item>[] {
  const common: UI.TableColumn<Wms.Outbound.Item>[] = [
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    {
      prop: activeListTab.value === 'recentRecords' ? 'pickQty' : 'qty',
      label: activeListTab.value === 'recentRecords' ? '拣货数量' : '数量',
      minWidth: 110
    },
    { prop: 'waitQty', label: '待拣货数量', minWidth: 120 },
    { prop: activeListTab.value === 'recentRecords' ? 'warehouse' : 'stockName', label: '仓库', minWidth: 130 },
    { prop: activeListTab.value === 'recentRecords' ? 'position' : 'positionName', label: '库位', minWidth: 130 },
    { prop: activeListTab.value === 'recentRecords' ? 'flot' : 'batchNo', label: '批号', minWidth: 130 }
  ];

  return [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    ...getTypeColumns(),
    ...common,
    ...(activeListTab.value === 'recentRecords'
      ? [
          { prop: 'pickPerson', label: '拣货人', minWidth: 110 },
          { prop: 'pickTime', label: '拣货时间', minWidth: 160 }
        ]
      : []),
    {
      prop: 'pickStatus',
      label: '状态',
      align: 'center',
      width: 120,
      formatter: row => {
        const picked = Number(row.pickQty || 0) > 0 || activeListTab.value === 'recentRecords';

        return <ElTag type={picked ? 'success' : 'warning'}>{picked ? '已拣货' : '待拣货'}</ElTag>;
      }
    }
  ];
}

function getTypeColumns(): UI.TableColumn<Wms.Outbound.Item>[] {
  if (activeType.value === 'sales') {
    return [
      { prop: 'taskNo', label: '任务单号', minWidth: 150 },
      { prop: activeListTab.value === 'recentRecords' ? 'saleNo' : 'saleOrderNo', label: '销售订单号', minWidth: 160 },
      { prop: 'customer', label: '客户', minWidth: 150 }
    ];
  }

  if (activeType.value === 'purchase_return') {
    return [
      { prop: activeListTab.value === 'recentRecords' ? 'taskNo' : 'billNo', label: '任务单号', minWidth: 150 },
      {
        prop: activeListTab.value === 'recentRecords' ? 'saleNo' : 'supplier',
        label: activeListTab.value === 'recentRecords' ? '采购订单号' : '供应商',
        minWidth: 160
      }
    ];
  }

  if (activeType.value === 'production_picking') {
    return [
      { prop: 'taskNo', label: '任务单号', minWidth: 150 },
      { prop: activeListTab.value === 'recentRecords' ? 'saleNo' : 'billNo', label: '生产订单号', minWidth: 160 },
      { prop: activeListTab.value === 'recentRecords' ? 'orderNo' : 'batchNo', label: '工单批号', minWidth: 140 }
    ];
  }

  if (activeType.value === 'production_supplement') {
    return [
      { prop: 'taskNo', label: '任务单号', minWidth: 150 },
      { prop: activeListTab.value === 'recentRecords' ? 'saleNo' : 'billNo', label: '生产订单号', minWidth: 160 }
    ];
  }

  if (activeType.value === 'subcontract_picking' || activeType.value === 'subcontract_supplement') {
    return [
      { prop: 'taskNo', label: '任务单号', minWidth: 150 },
      { prop: activeListTab.value === 'recentRecords' ? 'saleNo' : 'billNo', label: '委外订单号', minWidth: 160 }
    ];
  }

  if (activeType.value === 'other') {
    return [{ prop: activeListTab.value === 'recentRecords' ? 'taskNo' : 'billNo', label: '任务单号', minWidth: 150 }];
  }

  return [
    { prop: activeListTab.value === 'recentRecords' ? 'taskNo' : 'billNo', label: '任务单号', minWidth: 150 },
    { prop: activeListTab.value === 'recentRecords' ? 'saleNo' : 'billNo', label: '来源单号', minWidth: 160 }
  ];
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem title="搜索" name="outbound-search">
          <ElForm :model="searchParams" label-position="right" :label-width="90">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="任务单号">
                  <ElInput
                    v-model="searchParams.taskId"
                    clearable
                    placeholder="请输入任务单号"
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
            <ElTabPane v-for="item in outboundTypes" :key="item.value" :label="item.label" :name="item.value" />
          </ElTabs>
          <ElSegmented
            v-model="activeListTab"
            :options="[
              { label: '待拣货任务', value: 'pendingTasks' },
              { label: '最近拣货记录', value: 'recentRecords' }
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
  </div>
</template>
