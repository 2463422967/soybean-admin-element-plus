<script setup lang="tsx">
import { ref } from 'vue';
import { fetchGetBaseInfoUserList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import BasicKeywordSearch from '../modules/basic-keyword-search.vue';

defineOptions({ name: 'PersonnelManagement' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.BaseInfo.UserSearchParams {
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
  api: () => fetchGetBaseInfoUserList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage ?? 1;
    searchParams.value.size = params.pageSize ?? 30;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'code', label: '工号', minWidth: 130 },
    { prop: 'name', label: '姓名', minWidth: 140 },
    { prop: 'department', label: '部门', minWidth: 150 },
    {
      prop: 'userRoleName',
      label: '角色',
      minWidth: 180,
      formatter: row => row.userRoleName?.join('、') || '-'
    },
    {
      prop: 'disableFlag',
      label: '状态',
      align: 'center',
      width: 100,
      formatter: row => {
        return <ElTag type={row.disableFlag ? 'warning' : 'success'}>{row.disableFlag ? '禁用' : '启用'}</ElTag>;
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
      collapse-name="personnel-search"
      placeholder="请输入工号、姓名或部门"
      @reset="resetSearchParams"
      @search="getDataByPage"
    />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>人员管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default></template>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="code">
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
