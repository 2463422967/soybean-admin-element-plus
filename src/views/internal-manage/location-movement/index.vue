<script setup lang="tsx">
import { ref } from 'vue';
import { fetchGetTransferList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';

defineOptions({ name: 'LocationMovement' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.Transfer.SearchParams {
  return {
    current: 1,
    size: 30,
    billNo: undefined,
    stock: 'A'
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => fetchGetTransferList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage ?? 1;
    searchParams.value.size = params.pageSize ?? 30;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'billNo', label: '任务单号', minWidth: 160 },
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    { prop: 'qty', label: '数量', minWidth: 100 },
    { prop: 'flot', label: '批号', minWidth: 130 },
    { prop: 'sourceStockName', label: '仓库', minWidth: 130 },
    { prop: 'sourcePositionName', label: '调出库位', minWidth: 130 },
    { prop: 'targetPositionName', label: '调入库位', minWidth: 130 },
    { prop: 'createDate', label: '创建时间', minWidth: 170 },
    {
      prop: 'status',
      label: '状态',
      align: 'center',
      width: 110,
      formatter: row => (
        <ElTag type={row.status === 'C' ? 'success' : 'warning'}>{row.status === 'C' ? '已完成' : row.status}</ElTag>
      )
    }
  ]
});

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem title="搜索" name="location-movement-search">
          <ElForm :model="searchParams" label-position="right" :label-width="90">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="任务单号">
                  <ElInput
                    v-model="searchParams.billNo"
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
        <div class="flex items-center justify-between">
          <p>仓位移动作业</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default></template>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="billNo">
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
