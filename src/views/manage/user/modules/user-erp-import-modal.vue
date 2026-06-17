<script setup lang="tsx">
import { ref, watch } from 'vue';
import { fetchGetSystemErpUserList, fetchImportUsers } from '@/service/api';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';

defineOptions({ name: 'UserErpImportModal' });

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const importLoading = ref(false);
const selectedRows = ref<Api.SystemManage.ErpUser[]>([]);
const searchParams = ref(getInitSearchParams());

function getInitSearchParams(): Api.SystemManage.ErpUserSearchParams {
  return {
    current: 1,
    size: 10,
    code: undefined,
    name: undefined,
    department: undefined
  };
}

function isErpUserDisabled(disableFlag: Api.SystemManage.ErpUser['disableFlag']) {
  if (typeof disableFlag === 'boolean') {
    return disableFlag;
  }

  if (disableFlag === null || disableFlag === undefined) {
    return false;
  }

  return ['1', 'true', 'y', 'yes'].includes(String(disableFlag).toLowerCase());
}

const { columns, data, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => fetchGetSystemErpUserList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage ?? 1;
    searchParams.value.size = params.pageSize ?? 10;
  },
  columns: () => [
    { prop: 'selection', type: 'selection', width: 48, reserveSelection: true },
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'code', label: '工号', minWidth: 140 },
    { prop: 'name', label: '姓名', minWidth: 140 },
    { prop: 'department', label: '部门', minWidth: 160 },
    {
      prop: 'disableFlag',
      label: 'ERP状态',
      align: 'center',
      width: 100,
      formatter: row => (
        <ElTag type={isErpUserDisabled(row.disableFlag) ? 'warning' : 'success'}>
          {isErpUserDisabled(row.disableFlag) ? '禁用' : '启用'}
        </ElTag>
      )
    }
  ]
});

function closeModal() {
  visible.value = false;
}

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

async function handleImport() {
  if (selectedRows.value.length === 0) {
    window.$message?.warning('请至少选择一条 ERP 人员数据');
    return;
  }

  importLoading.value = true;

  const { error } = await fetchImportUsers(
    selectedRows.value.map(item => ({
      code: item.code,
      name: item.name,
      department: item.department || ''
    }))
  );

  importLoading.value = false;

  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    closeModal();
    emit('submitted');
  }
}

watch(visible, async newVisible => {
  if (!newVisible) {
    selectedRows.value = [];
    return;
  }

  selectedRows.value = [];
  await getDataByPage(1);
});
</script>

<template>
  <ElDialog v-model="visible" title="导入 ERP 人员" width="980px">
    <ElForm :model="searchParams" label-width="72">
      <ElRow :gutter="16">
        <ElCol :span="6">
          <ElFormItem label="工号">
            <ElInput v-model="searchParams.code" clearable placeholder="请输入工号" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="姓名">
            <ElInput v-model="searchParams.name" clearable placeholder="请输入姓名" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <ElFormItem label="部门">
            <ElInput v-model="searchParams.department" clearable placeholder="请输入部门" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="6">
          <div class="flex justify-end gap-12px">
            <ElButton @click="resetSearchParams">{{ $t('common.reset') }}</ElButton>
            <ElButton type="primary" plain @click="getDataByPage(1)">
              {{ $t('common.search') }}
            </ElButton>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>

    <ElTable
      v-loading="loading"
      :data="data"
      row-key="code"
      border
      height="420"
      class="mt-8px"
      @selection-change="selectedRows = $event"
    >
      <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
    </ElTable>

    <div class="mt-16px flex justify-end">
      <ElPagination
        v-if="mobilePagination.total"
        layout="total,prev,pager,next,sizes"
        v-bind="mobilePagination"
        @current-change="mobilePagination['current-change']"
        @size-change="mobilePagination['size-change']"
      />
    </div>

    <template #footer>
      <ElSpace>
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="importLoading" @click="handleImport">导入所选人员</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
