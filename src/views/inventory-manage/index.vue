<script setup lang="tsx">
import { ref, watch } from 'vue';
import { fetchGetInventoryList, fetchGetInventoryWarningList } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';

defineOptions({ name: 'InventoryManage' });

type InventoryTab = 'inventory' | 'warning';
type InventoryRow = Wms.Inventory.InventoryItem | Wms.Inventory.WarningItem;

const activeTab = ref<InventoryTab>('inventory');
const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Wms.Inventory.SearchParams {
  return {
    current: 1,
    size: 30,
    keyWords: undefined,
    materialCode: undefined,
    stockNumber: undefined,
    positionName: undefined,
    flot: undefined
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination, reloadColumns } =
  useUIPaginatedTable({
    paginationProps: {
      currentPage: searchParams.value.current,
      pageSize: searchParams.value.size
    },
    api: () => {
      if (activeTab.value === 'warning') {
        return fetchGetInventoryWarningList(searchParams.value);
      }

      return fetchGetInventoryList(searchParams.value);
    },
    transform: response => defaultTransform(response),
    onPaginationParamsChange: params => {
      searchParams.value.current = params.currentPage ?? 1;
      searchParams.value.size = params.pageSize ?? 30;
    },
    columns: () => {
      if (activeTab.value === 'warning') {
        return getWarningColumns();
      }

      return getInventoryColumns();
    }
  });

watch(activeTab, async () => {
  reloadColumns();
  await getDataByPage(1);
});

function getInventoryColumns(): UI.TableColumn<InventoryRow>[] {
  return [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    { prop: 'flot', label: '批次号', minWidth: 140 },
    { prop: 'stockName', label: '仓库', minWidth: 140 },
    { prop: 'positionName', label: '库位', minWidth: 140 },
    { prop: 'unit', label: '单位', width: 90 },
    { prop: 'stockQty', label: '库存数量', minWidth: 110 },
    { prop: 'safeQty', label: '安全库存', minWidth: 110 },
    {
      prop: 'status',
      label: '库存状态',
      align: 'center',
      width: 110,
      formatter: row => {
        const status = String(row.status || '正常');
        const warning = status.includes('缺') || status.includes('预警');

        return <ElTag type={warning ? 'warning' : 'success'}>{status}</ElTag>;
      }
    }
  ];
}

function getWarningColumns(): UI.TableColumn<InventoryRow>[] {
  return [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'materialCode', label: '物料编码', minWidth: 150 },
    { prop: 'materialName', label: '物料名称', minWidth: 180 },
    { prop: 'stockQty', label: '库存数量', minWidth: 110 },
    { prop: 'safeQty', label: '安全库存', minWidth: 110 },
    { prop: 'maxQty', label: '最高存量', minWidth: 110 },
    {
      prop: 'status',
      label: '预警状态',
      align: 'center',
      width: 110,
      formatter: row => <ElTag type="warning">{row.status || '预警'}</ElTag>
    }
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
        <ElCollapseItem title="搜索" name="inventory-search">
          <ElForm :model="searchParams" label-position="right" :label-width="90">
            <ElRow :gutter="24">
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="关键词">
                  <ElInput
                    v-model="searchParams.keyWords"
                    clearable
                    placeholder="请输入物料编码、名称或批次"
                    @keyup.enter="getDataByPage(1)"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="物料编码">
                  <ElInput
                    v-model="searchParams.materialCode"
                    clearable
                    placeholder="请输入物料编码"
                    @keyup.enter="getDataByPage(1)"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="仓库编码">
                  <ElInput
                    v-model="searchParams.stockNumber"
                    clearable
                    placeholder="请输入仓库编码"
                    @keyup.enter="getDataByPage(1)"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="库位">
                  <ElInput
                    v-model="searchParams.positionName"
                    clearable
                    placeholder="请输入库位"
                    @keyup.enter="getDataByPage(1)"
                  />
                </ElFormItem>
              </ElCol>
              <ElCol :lg="6" :md="8" :sm="12">
                <ElFormItem label="批次号">
                  <ElInput
                    v-model="searchParams.flot"
                    clearable
                    placeholder="请输入批次号"
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
          <ElTabs v-model="activeTab" class="min-w-260px">
            <ElTabPane label="实时库存" name="inventory" />
            <ElTabPane label="库存预警" name="warning" />
          </ElTabs>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default></template>
          </TableHeaderOperation>
        </div>
      </template>
      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="materialCode">
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
