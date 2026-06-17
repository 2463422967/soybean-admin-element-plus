<script setup lang="tsx">
import { ref } from 'vue';
import { ElPopconfirm, ElSpace } from 'element-plus';
import { enableStatusRecord } from '@/constants/business';
import { fetchDeleteRole, fetchGetRoleList } from '@/service/api';
import { useAuth } from '@/hooks/business/auth';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import MenuAuthModal from './modules/menu-auth-modal.vue';
import RoleOperateDrawer from './modules/role-operate-drawer.vue';
import RoleSearch from './modules/role-search.vue';

defineOptions({ name: 'RoleManage' });

const searchParams = ref(getInitSearchParams());
const drawerVisible = ref(false);
const menuAuthVisible = ref(false);
const operateType = ref<UI.TableOperateType>('add');
const editingData = ref<Api.SystemManage.Role | null>(null);
const currentMenuRoleId = ref<Api.SystemManage.Id>('');
const { hasAuth } = useAuth();

const authCodes = {
  add: 'manage_role:add',
  update: 'manage_role:update',
  delete: 'manage_role:delete',
  menu: 'manage_role:menu'
} as const;

function getInitSearchParams(): Api.SystemManage.RoleSearchParams {
  return {
    current: 1,
    size: 10,
    name: undefined,
    code: undefined,
    status: undefined
  };
}

function getStatusValue(status: Api.SystemManage.Role['status']) {
  return String(status || '1') === '2' ? '2' : '1';
}

const { columns, columnChecks, data, loading, getData, getDataByPage, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => fetchGetRoleList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage ?? 1;
    searchParams.value.size = params.pageSize ?? 10;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: $t('common.index'), width: 64 },
    { prop: 'name', label: '角色名称', minWidth: 140 },
    { prop: 'code', label: '角色编码', minWidth: 140 },
    {
      prop: 'description',
      label: '角色描述',
      minWidth: 220,
      formatter: row => row.description || '-'
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      align: 'center',
      formatter: row => {
        const status = getStatusValue(row.status);
        return <ElTag type={status === '1' ? 'success' : 'warning'}>{$t(enableStatusRecord[status])}</ElTag>;
      }
    },
    {
      prop: 'operate',
      label: $t('common.operate'),
      width: 260,
      align: 'center',
      formatter: row => (
        <ElSpace>
          {hasAuth(authCodes.update) ? (
            <ElButton type="primary" plain size="small" onClick={() => handleEdit(row)}>
              {$t('common.edit')}
            </ElButton>
          ) : null}
          {hasAuth(authCodes.menu) ? (
            <ElButton plain size="small" onClick={() => openMenuAuth(row)}>
              菜单权限
            </ElButton>
          ) : null}
          {hasAuth(authCodes.delete) ? (
            <ElPopconfirm title={$t('common.confirmDelete')} onConfirm={() => handleDelete(row)}>
              {{
                reference: () => (
                  <ElButton type="danger" plain size="small" disabled={row.isSystem}>
                    {$t('common.delete')}
                  </ElButton>
                )
              }}
            </ElPopconfirm>
          ) : null}
        </ElSpace>
      )
    }
  ]
});

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

function handleAdd() {
  if (!hasAuth(authCodes.add)) {
    return;
  }
  operateType.value = 'add';
  editingData.value = null;
  drawerVisible.value = true;
}

function handleEdit(row: Api.SystemManage.Role) {
  if (!hasAuth(authCodes.update)) {
    return;
  }
  operateType.value = 'edit';
  editingData.value = row;
  drawerVisible.value = true;
}

function openMenuAuth(row: Api.SystemManage.Role) {
  if (!hasAuth(authCodes.menu)) {
    return;
  }
  currentMenuRoleId.value = row.id;
  menuAuthVisible.value = true;
}

async function handleDelete(row: Api.SystemManage.Role) {
  if (!hasAuth(authCodes.delete)) {
    return;
  }
  const { error } = await fetchDeleteRole(row.id);

  if (!error) {
    window.$message?.success($t('common.deleteSuccess'));
    await getData();
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <RoleSearch v-model:model="searchParams" @reset="resetSearchParams" @search="getDataByPage" />

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>角色管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default>
              <ElButton v-if="hasAuth(authCodes.add)" type="primary" plain @click="handleAdd">
                <template #icon>
                  <icon-ic-round-plus class="text-icon" />
                </template>
                新增角色
              </ElButton>
            </template>
          </TableHeaderOperation>
        </div>
      </template>

      <div class="h-[calc(100%-52px)]">
        <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="id">
          <ElTableColumn v-for="col in columns" :key="col.prop" v-bind="col" />
        </ElTable>
        <div class="mt-20px flex justify-end">
          <ElPagination
            v-if="mobilePagination.total"
            layout="total,prev,pager,next,sizes"
            v-bind="mobilePagination"
            @current-change="mobilePagination['current-change']"
            @size-change="mobilePagination['size-change']"
          />
        </div>
      </div>

      <RoleOperateDrawer
        v-model:visible="drawerVisible"
        :operate-type="operateType"
        :row-data="editingData"
        @submitted="getDataByPage"
      />
      <MenuAuthModal v-model:visible="menuAuthVisible" :role-id="currentMenuRoleId" />
    </ElCard>
  </div>
</template>

<style scoped></style>
