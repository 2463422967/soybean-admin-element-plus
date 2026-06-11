<script setup lang="tsx">
import { ref } from 'vue';
import { fetchGetMaterialList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import BasicKeywordSearch from '../modules/basic-keyword-search.vue';

defineOptions({ name: 'MaterialManagement' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.BaseInfo.MaterialSearchParams {
  return {
    current: 1,
    size: 30,
    keyWords: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => fetchGetMaterialList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage ?? 1;
    searchParams.value.size = params.pageSize ?? 30;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    { prop: 'materialSpec', label: '规格型号', minWidth: 150 },
    { prop: 'unit', label: '单位', width: 90 },
    { prop: 'color', label: '颜色', width: 100 },
    { prop: 'stockName', label: '默认仓库', minWidth: 140 },
    { prop: 'positionName', label: '默认库位', minWidth: 140 },
    { prop: 'safeInventory', label: '安全库存', minWidth: 110 },
    { prop: 'maxInventory', label: '最高存量', minWidth: 110 },
    { prop: 'lifeUnit', label: '保质期单位', minWidth: 110 },
    { prop: 'life', label: '保质期', width: 100 },
    {
      prop: 'status',
      label: '状态',
      align: 'center',
      width: 100,
      formatter: row => {
        const disabled = row.status === 'B';

        return <ElTag type={disabled ? 'warning' : 'success'}>{disabled ? '禁用' : '可用'}</ElTag>;
      }
    }
  ]
});

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <BasicKeywordSearch
      v-model:model="searchParams"
      collapse-name="material-search"
      placeholder="请输入物料编码、名称或规格"
      @reset="resetSearchParams"
      @search="getDataByPage"
    />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>物料管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default></template>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="materialCode">
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
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
