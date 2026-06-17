<script setup lang="tsx">
import { ref } from 'vue';
import { useBoolean } from '@sa/hooks';
import { enableStatusRecord, menuTypeRecord } from '@/constants/business';
import { fetchDeleteMenu, fetchGetMenuTree } from '@/service/api';
import { $t } from '@/locales';
import SvgIcon from '@/components/custom/svg-icon.vue';
import MenuOperateModal, { type OperateType } from './modules/menu-operate-modal.vue';

defineOptions({ name: 'MenuManage' });

const { bool: visible, setTrue: openModal } = useBoolean();

const loading = ref(false);
const data = ref<Api.SystemManage.Menu[]>([]);
const operateType = ref<OperateType>('add');
const editingData = ref<Api.SystemManage.Menu | null>(null);

function getStatusValue(status: Api.SystemManage.Menu['status']) {
  return String(status || '1') as Api.Common.EnableStatus;
}

function getMenuTypeValue(type: Api.SystemManage.MenuType) {
  return Number(type || 2) as Api.SystemManage.MenuType;
}

async function getData() {
  loading.value = true;
  const { data: menus, error } = await fetchGetMenuTree();

  if (!error) {
    data.value = menus || [];
  }

  loading.value = false;
}

function handleAdd() {
  operateType.value = 'add';
  editingData.value = null;
  openModal();
}

function handleAddChildMenu(row: Api.SystemManage.Menu) {
  operateType.value = 'addChild';
  editingData.value = { ...row };
  openModal();
}

function handleEdit(row: Api.SystemManage.Menu) {
  operateType.value = 'edit';
  editingData.value = { ...row };
  openModal();
}

async function handleDelete(id: number) {
  const { error } = await fetchDeleteMenu(id);

  if (!error) {
    window.$message?.success($t('common.deleteSuccess'));
    getData();
  }
}

function init() {
  getData();
}

init();
</script>

<template>
  <div class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>{{ $t('page.manage.menu.title') }}</p>
          <ElSpace>
            <ElButton :loading="loading" @click="getData">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              {{ $t('common.refresh') }}
            </ElButton>
            <ElButton type="primary" plain @click="handleAdd">
              <template #icon>
                <icon-ic-round-plus class="text-icon" />
              </template>
              {{ $t('page.manage.menu.addMenu') }}
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElTable v-loading="loading" height="100%" border class="sm:h-full" :data="data" row-key="id" default-expand-all>
        <ElTableColumn prop="title" :label="$t('page.manage.menu.menuName')" min-width="180" />
        <ElTableColumn prop="type" :label="$t('page.manage.menu.menuType')" width="100">
          <template #default="{ row }">
            <ElTag
              :type="
                getMenuTypeValue(row.type) === 1 ? 'info' : getMenuTypeValue(row.type) === 2 ? 'primary' : 'warning'
              "
            >
              {{ $t(menuTypeRecord[getMenuTypeValue(row.type)]) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="icon" :label="$t('page.manage.menu.icon')" width="90">
          <template #default="{ row }">
            <div class="flex-center">
              <SvgIcon v-if="row.icon" :icon="row.icon" class="text-icon" />
              <span v-else>-</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="name" :label="$t('page.manage.menu.routeName')" min-width="180" />
        <ElTableColumn prop="path" :label="$t('page.manage.menu.routePath')" min-width="220" />
        <ElTableColumn
          prop="component"
          :label="$t('page.manage.menu.component')"
          min-width="220"
          show-overflow-tooltip
        />
        <ElTableColumn prop="permission" :label="$t('page.manage.menu.permission')" min-width="180" />
        <ElTableColumn prop="status" :label="$t('page.manage.menu.menuStatus')" width="100">
          <template #default="{ row }">
            <ElTag :type="getStatusValue(row.status) === '1' ? 'success' : 'warning'">
              {{ $t(enableStatusRecord[getStatusValue(row.status)]) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="isHidden" :label="$t('page.manage.menu.hideInMenu')" width="100">
          <template #default="{ row }">
            <ElTag :type="row.isHidden ? 'danger' : 'info'">
              {{ row.isHidden ? $t('common.yesOrNo.yes') : $t('common.yesOrNo.no') }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sort" :label="$t('page.manage.menu.order')" width="80" />
        <ElTableColumn :label="$t('common.operate')" width="250" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton
                v-if="getMenuTypeValue(row.type) !== 3"
                type="primary"
                plain
                size="small"
                @click="handleAddChildMenu(row)"
              >
                {{ $t('page.manage.menu.addChildMenu') }}
              </ElButton>
              <ElButton type="primary" plain size="small" @click="handleEdit(row)">
                {{ $t('common.edit') }}
              </ElButton>
              <ElPopconfirm :title="$t('common.confirmDelete')" @confirm="handleDelete(row.id)">
                <template #reference>
                  <ElButton type="danger" plain size="small" :disabled="row.isSystem">
                    {{ $t('common.delete') }}
                  </ElButton>
                </template>
              </ElPopconfirm>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <MenuOperateModal
        v-model:visible="visible"
        :operate-type="operateType"
        :row-data="editingData"
        :menus="data"
        @submitted="getData"
      />
    </ElCard>
  </div>
</template>
