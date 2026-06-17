<script setup lang="tsx">
import { ref, watch } from 'vue';
import { fetchGetInStoreList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';

defineOptions({ name: 'InboundOperation' });

const tabOptions: Array<{ label: string; value: Wms.InStore.InStoreType }> = [
  { label: '采购入库', value: 'procurement' },
  { label: '生产入库', value: 'production' },
  { label: '销售退货入库', value: 'sales_return' },
  { label: '生产退料入库', value: 'production_return' },
  { label: '委外退料入库', value: 'outsourcing_return' },
  { label: '其他入库', value: 'other_in' },
  { label: '其他出库', value: 'other_out' }
];

const activeType = ref<Wms.InStore.InStoreType>('procurement');
const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.InStore.SearchParams {
  return {
    current: 1,
    size: 30,
    keyWords: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, reloadColumns } =
  useUIPaginatedTable({
    paginationProps: {
      currentPage: searchParams.value.current,
      pageSize: searchParams.value.size
    },
    api: () => fetchGetInStoreList(activeType.value, searchParams.value),
    transform: response => defaultTransform(response),
    onPaginationParamsChange: params => {
      searchParams.value.current = params.currentPage ?? 1;
      searchParams.value.size = params.pageSize ?? 30;
    },
    columns: () => getColumns()
  });

watch(activeType, async () => {
  reloadColumns();
  await getDataByPage(1);
});

function getTypeColumns(): UI.TableColumn<Wms.InStore.Item>[] {
  if (activeType.value === 'procurement') {
    return [
      { prop: 'purchaseOrderNo', label: '采购订单号', minWidth: 160 },
      { prop: 'supplierName', label: '供应商', minWidth: 150 }
    ];
  }

  if (activeType.value === 'sales_return') {
    return [
      { prop: 'saleOrderNo', label: '销售订单号', minWidth: 160 },
      { prop: 'customerName', label: '客户', minWidth: 150 }
    ];
  }

  if (activeType.value === 'production') {
    return [
      { prop: 'productionOrderNo', label: '生产订单号', minWidth: 160 },
      { prop: 'inStoreType', label: '入库类型', minWidth: 120 }
    ];
  }

  if (activeType.value === 'production_return') {
    return [
      { prop: 'productionOrderNo', label: '生产订单号', minWidth: 160 },
      { prop: 'inStoreType', label: '入库类型', minWidth: 120 }
    ];
  }

  if (activeType.value === 'outsourcing_return') {
    return [
      { prop: 'outboundNo', label: '委外出库单号', minWidth: 160 },
      { prop: 'inStoreType', label: '入库类型', minWidth: 120 }
    ];
  }

  if (activeType.value === 'other_out') {
    return [{ prop: 'inStoreType', label: '出库类型', minWidth: 120 }];
  }

  return [{ prop: 'inStoreType', label: '入库类型', minWidth: 120 }];
}

function getColumns(): UI.TableColumn<Wms.InStore.Item>[] {
  return [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'taskNo', label: '任务单号', minWidth: 160 },
    ...getTypeColumns(),
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    { prop: 'qty', label: '入库数量', minWidth: 110 },
    { prop: 'batchNo', label: '批次号', minWidth: 140 },
    { prop: 'warehouse', label: '仓库', minWidth: 140 },
    { prop: 'warehouseLocation', label: '库位', minWidth: 140 },
    { prop: 'inStoreTime', label: '入库时间', minWidth: 170 }
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
        <ElCollapseItem title="搜索" name="inbound-operation-search">
          <ElForm :model="searchParams" label-position="right" :label-width="80">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="关键词">
                  <ElInput
                    v-model="searchParams.keyWords"
                    clearable
                    placeholder="请输入任务单号、物料或批次"
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
        <div class="flex items-center justify-between">
          <ElTabs v-model="activeType" class="min-w-560px">
            <ElTabPane v-for="item in tabOptions" :key="item.value" :label="item.label" :name="item.value" />
          </ElTabs>
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
