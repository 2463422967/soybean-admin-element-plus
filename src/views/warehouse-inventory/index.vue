<script setup lang="tsx">
import { computed, ref } from 'vue';
import { fetchGetStockCountBodyList, fetchGetStockCountHeaderList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';

defineOptions({ name: 'WarehouseInventory' });

const detailVisible = ref(false);
const selectedHeader = ref<Wms.StockCount.Header | null>(null);
const headerSearchParams = ref<Wms.StockCount.HeaderSearchParams>({ current: 1, size: 30, fid: 1 });
const bodySearchParams = computed<Wms.StockCount.BodySearchParams>(() => ({
  current: 1,
  size: 100,
  fid: selectedHeader.value?.fid || 0
}));

const { columns, columnChecks, data, getData, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: headerSearchParams.value.current,
    pageSize: headerSearchParams.value.size
  },
  api: () => fetchGetStockCountHeaderList(headerSearchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    headerSearchParams.value.current = params.currentPage ?? 1;
    headerSearchParams.value.size = params.pageSize ?? 30;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'billNo', label: '单据编号', minWidth: 180 },
    { prop: 'backUpDate', label: '账存日期', minWidth: 160 },
    {
      prop: 'status',
      label: '状态',
      align: 'center',
      width: 110,
      formatter: row => <ElTag type={row.status === 'C' ? 'success' : 'warning'}>{getStatusText(row.status)}</ElTag>
    },
    {
      prop: 'operate',
      label: '操作',
      fixed: 'right',
      width: 100,
      formatter: row => (
        <ElButton type="primary" link onClick={() => openDetail(row)}>
          查看
        </ElButton>
      )
    }
  ]
});

const {
  columns: detailColumns,
  data: detailData,
  getData: getDetailData,
  loading: detailLoading
} = useUIPaginatedTable({
  paginationProps: {
    currentPage: 1,
    pageSize: 100
  },
  api: () => fetchGetStockCountBodyList(bodySearchParams.value),
  transform: response => defaultTransform(response),
  columns: () => [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'stock', label: '仓库', minWidth: 130 },
    { prop: 'position', label: '库位', minWidth: 130 },
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    { prop: 'materialSpec', label: '型号规格', minWidth: 150 },
    { prop: 'batchNo', label: '批号', minWidth: 130 },
    { prop: 'unit', label: '单位', width: 90 },
    { prop: 'baseAcctQty', label: '账存数量', minWidth: 110 },
    { prop: 'accountQty', label: '盘点数量', minWidth: 110 },
    { prop: 'egaingQty', label: '盘盈数量', minWidth: 110 },
    { prop: 'lossQty', label: '盘亏数量', minWidth: 110 }
  ],
  immediate: false
});

function getStatusText(status?: string) {
  const statusMap: Record<string, string> = {
    A: '创建',
    B: '审核中',
    C: '已审核'
  };

  return status ? statusMap[status] || status : '';
}

async function openDetail(row: Wms.StockCount.Header) {
  selectedHeader.value = row;
  detailVisible.value = true;
  await getDetailData();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>库存盘点</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default></template>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="fid">
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

    <ElDialog v-model="detailVisible" title="盘点明细" width="86%" destroy-on-close>
      <div class="mb-16px flex flex-wrap gap-24px text-14px">
        <span>单据编号：{{ selectedHeader?.billNo || '-' }}</span>
        <span>账存日期：{{ selectedHeader?.backUpDate || '-' }}</span>
      </div>
      <ElTable v-loading="detailLoading" height="60vh" border :data="detailData" row-key="materialCode">
        <ElTableColumn v-for="col in detailColumns" :key="String(col.prop)" v-bind="col" />
      </ElTable>
    </ElDialog>
  </div>
</template>
