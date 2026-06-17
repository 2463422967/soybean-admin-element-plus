<script setup lang="tsx">
import { ref } from 'vue';
import { fetchGetTransferList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';

defineOptions({ name: 'WarehouseTransfer' });

const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.Transfer.SearchParams {
  return {
    current: 1,
    size: 30,
    billNo: undefined,
    sourceStock: undefined,
    targetStock: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    stock: 'B'
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
    { prop: 'billNo', label: '调拨单号', minWidth: 160 },
    { prop: 'sourceStockName', label: '来源仓库', minWidth: 140 },
    { prop: 'sourcePositionName', label: '来源仓位', minWidth: 140 },
    { prop: 'targetStockName', label: '目标仓库', minWidth: 140 },
    { prop: 'targetPositionName', label: '目标仓位', minWidth: 140 },
    { prop: 'qty', label: '商品数量', minWidth: 110 },
    { prop: 'createDate', label: '创建时间', minWidth: 170 },
    {
      prop: 'status',
      label: '状态',
      align: 'center',
      width: 110,
      formatter: row => <ElTag type={row.status === 'C' ? 'success' : 'warning'}>{getStatusText(row.status)}</ElTag>
    }
  ]
});

function getStatusText(status?: string) {
  const statusMap: Record<string, string> = {
    B: '调拨中',
    C: '已完成'
  };

  return status ? statusMap[status] || status : '';
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper">
      <ElCollapse>
        <ElCollapseItem title="搜索" name="warehouse-transfer-search">
          <ElForm :model="searchParams" label-position="right" :label-width="90">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="调拨单号">
                  <ElInput
                    v-model="searchParams.billNo"
                    clearable
                    placeholder="请输入调拨单号"
                    @keyup.enter="getDataByPage(1)"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="来源仓库">
                  <ElInput
                    v-model="searchParams.sourceStock"
                    clearable
                    placeholder="请输入来源仓库"
                    @keyup.enter="getDataByPage(1)"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="目标仓库">
                  <ElInput
                    v-model="searchParams.targetStock"
                    clearable
                    placeholder="请输入目标仓库"
                    @keyup.enter="getDataByPage(1)"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="状态">
                  <ElSelect v-model="searchParams.status" clearable placeholder="请选择状态">
                    <ElOption label="调拨中" value="B" />
                    <ElOption label="已完成" value="C" />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="开始日期">
                  <ElDatePicker
                    v-model="searchParams.startDate"
                    class="w-full"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择开始日期"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="结束日期">
                  <ElDatePicker
                    v-model="searchParams.endDate"
                    class="w-full"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="请选择结束日期"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="12" :md="16" :sm="24">
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
          <p>仓库调拨作业</p>
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
