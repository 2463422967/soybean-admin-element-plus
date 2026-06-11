<script setup lang="tsx">
import { ref } from 'vue';
import { fetchGetShelfList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import BasicKeywordSearch from '../modules/basic-keyword-search.vue';

defineOptions({ name: 'ShelfManagement' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.BaseInfo.ShelfSearchParams {
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
  api: () => fetchGetShelfList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage ?? 1;
    searchParams.value.size = params.pageSize ?? 30;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'shelfCode', label: '货架编码', minWidth: 140 },
    { prop: 'shelfName', label: '货架名称', minWidth: 160 },
    { prop: 'createTime', label: '创建时间', minWidth: 180 }
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
      collapse-name="shelf-search"
      placeholder="请输入货架编码或名称"
      @reset="resetSearchParams"
      @search="getDataByPage"
    />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>货架管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default></template>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="id">
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
