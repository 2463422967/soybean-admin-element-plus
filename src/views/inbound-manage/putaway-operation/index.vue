<script setup lang="tsx">
import { ref, watch } from 'vue';
import { fetchGetListingAssignmentList, fetchGetListingCompletedList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';

defineOptions({ name: 'PutawayOperation' });

type PutawayTab = 'pendingTasks' | 'recentRecords';

const activeTab = ref<PutawayTab>('pendingTasks');
const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.ListingAssignment.SearchParams {
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
    api: () => {
      if (activeTab.value === 'recentRecords') {
        return fetchGetListingCompletedList(searchParams.value);
      }

      return fetchGetListingAssignmentList(searchParams.value);
    },
    transform: response => defaultTransform(response),
    onPaginationParamsChange: params => {
      searchParams.value.current = params.currentPage ?? 1;
      searchParams.value.size = params.pageSize ?? 30;
    },
    columns: () => getColumns()
  });

watch(activeTab, async () => {
  reloadColumns();
  await getDataByPage(1);
});

function getColumns(): UI.TableColumn<Wms.ListingAssignment.Item>[] {
  const quantityColumn: UI.TableColumn<Wms.ListingAssignment.Item> =
    activeTab.value === 'recentRecords'
      ? { prop: 'listingQty', label: '已上架数量', minWidth: 120 }
      : { prop: 'waitQty', label: '待上架数量', minWidth: 120 };

  const statusColumns: UI.TableColumn<Wms.ListingAssignment.Item>[] =
    activeTab.value === 'recentRecords'
      ? [
          { prop: 'listingPerson', label: '上架人', minWidth: 110 },
          { prop: 'billDate', label: '上架时间', minWidth: 160 }
        ]
      : [
          {
            prop: 'receiveStatus',
            label: '收货状态',
            align: 'center',
            width: 120,
            formatter: row => <ElTag type="warning">{row.receiveStatus}</ElTag>
          }
        ];

  return [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'taskNo', label: '任务单号', minWidth: 160 },
    { prop: 'receiveType', label: '收货类型', minWidth: 120 },
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    quantityColumn,
    { prop: 'batchNo', label: '批次号', minWidth: 140 },
    { prop: 'warehouse', label: '仓库', minWidth: 140 },
    { prop: 'warehouseLocation', label: '库位', minWidth: 140 },
    ...statusColumns
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
        <ElCollapseItem title="搜索" name="putaway-search">
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
          <ElTabs v-model="activeTab" class="min-w-300px">
            <ElTabPane label="待上架任务" name="pendingTasks" />
            <ElTabPane label="已完成上架" name="recentRecords" />
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
