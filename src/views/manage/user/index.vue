<script setup lang="tsx">
import { ref } from 'vue';
import { ElPopconfirm, ElSpace } from 'element-plus';
import { enableStatusRecord } from '@/constants/business';
import { fetchGetUserList, fetchUpdateUserStatus } from '@/service/api';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import UserErpImportModal from './modules/user-erp-import-modal.vue';
import UserOperateDrawer from './modules/user-operate-drawer.vue';
import UserPasswordModal from './modules/user-password-modal.vue';
import UserSearch from './modules/user-search.vue';

defineOptions({ name: 'UserManage' });

const searchParams = ref(getInitSearchParams());
const drawerVisible = ref(false);
const passwordModalVisible = ref(false);
const erpImportVisible = ref(false);
const editingData = ref<Api.SystemManage.User | null>(null);
const { hasAuth } = useAuth();

const authCodes = {
  import: 'manage_user:import',
  updateRole: 'manage_user:update-role',
  resetPassword: 'manage_user:reset-password',
  updateStatus: 'manage_user:update-status'
} as const;

function getInitSearchParams(): Api.SystemManage.UserSearchParams {
  return {
    current: 1,
    size: 30,
    code: undefined,
    name: undefined,
    department: undefined,
    status: undefined
  };
}

function getStatusValue(status: Api.SystemManage.User['status']) {
  return String(status || '1') === '2' ? '2' : '1';
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => fetchGetUserList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage ?? 1;
    searchParams.value.size = params.pageSize ?? 30;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'code', label: '工号', minWidth: 130 },
    { prop: 'name', label: '姓名', minWidth: 120 },
    {
      prop: 'department',
      label: '部门',
      minWidth: 160,
      formatter: row => row.department || '-'
    },
    {
      prop: 'roleNames',
      label: '角色',
      minWidth: 180,
      formatter: row => row.roleNames?.join('、') || '-'
    },
    {
      prop: 'status',
      label: '状态',
      align: 'center',
      width: 100,
      formatter: row => {
        const status = getStatusValue(row.status);
        return <ElTag type={status === '1' ? 'success' : 'warning'}>{$t(enableStatusRecord[status])}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      align: 'center',
      width: 290,
      formatter: row => {
        const status = getStatusValue(row.status);
        const nextStatus = status === '1' ? '2' : '1';
        const actionText = nextStatus === '1' ? '启用' : '禁用';

        return (
          <ElSpace>
            {hasAuth(authCodes.updateRole) ? (
              <ElButton type="primary" plain size="small" onClick={() => handleEdit(row)}>
                编辑角色
              </ElButton>
            ) : null}
            {hasAuth(authCodes.resetPassword) ? (
              <ElButton plain size="small" onClick={() => handleResetPassword(row)}>
                重置密码
              </ElButton>
            ) : null}
            {hasAuth(authCodes.updateStatus) ? (
              <ElPopconfirm title={`确认${actionText}该用户吗？`} onConfirm={() => handleUpdateStatus(row, nextStatus)}>
                {{
                  reference: () => (
                    <ElButton type={nextStatus === '1' ? 'success' : 'warning'} plain size="small">
                      {actionText}
                    </ElButton>
                  )
                }}
              </ElPopconfirm>
            ) : null}
          </ElSpace>
        );
      }
    }
  ]
});

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

function handleImportErpUser() {
  if (!hasAuth(authCodes.import)) {
    return;
  }
  erpImportVisible.value = true;
}

function handleEdit(row: Api.SystemManage.User) {
  if (!hasAuth(authCodes.updateRole)) {
    return;
  }
  editingData.value = row;
  drawerVisible.value = true;
}

function handleResetPassword(row: Api.SystemManage.User) {
  if (!hasAuth(authCodes.resetPassword)) {
    return;
  }
  editingData.value = row;
  passwordModalVisible.value = true;
}

async function handleUpdateStatus(row: Api.SystemManage.User, status: Api.SystemManage.EnableStatus) {
  if (!hasAuth(authCodes.updateStatus)) {
    return;
  }
  const { error } = await fetchUpdateUserStatus({
    userId: row.id,
    status
  });

  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    await getData();
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <UserSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>用户管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default>
              <ElButton v-if="hasAuth(authCodes.import)" type="primary" plain @click="handleImportErpUser">
                <template #icon>
                  <icon-mdi-account-arrow-down-outline class="text-icon" />
                </template>
                导入 ERP 人员
              </ElButton>
            </template>
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

      <UserOperateDrawer v-model:visible="drawerVisible" :row-data="editingData" @submitted="getDataByPage" />
      <UserPasswordModal v-model:visible="passwordModalVisible" :row-data="editingData" @submitted="getData" />
      <UserErpImportModal v-model:visible="erpImportVisible" @submitted="getDataByPage" />
    </ElCard>
  </div>
</template>

<style scoped></style>
