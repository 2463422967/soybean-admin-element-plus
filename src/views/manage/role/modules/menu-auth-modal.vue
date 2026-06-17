<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { fetchGetMenuTree, fetchGetRoleInfo, fetchUpdateRoleMenus } from '@/service/api';
import { $t } from '@/locales';

defineOptions({ name: 'MenuAuthModal' });

interface Props {
  roleId: Api.SystemManage.Id;
}

const props = defineProps<Props>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type TreeInstance = {
  getCheckedKeys: (leafOnly?: boolean) => Api.SystemManage.Id[];
  getHalfCheckedKeys: () => Api.SystemManage.Id[];
  setCheckedKeys: (keys: Api.SystemManage.Id[], leafOnly?: boolean) => void;
};

const loading = ref(false);
const submitting = ref(false);
const treeRef = ref<TreeInstance | null>(null);
const treeData = ref<Api.SystemManage.MenuTree[]>([]);
const checkedKeys = ref<Api.SystemManage.Id[]>([]);

const title = computed(() => '菜单权限');

const treeProps = {
  label: 'title',
  children: 'children'
} as const;

function closeModal() {
  visible.value = false;
}

async function init() {
  if (!props.roleId) {
    return;
  }

  loading.value = true;

  const [{ error: menuError, data: menus }, { error: roleError, data: roleInfo }] = await Promise.all([
    fetchGetMenuTree(),
    fetchGetRoleInfo(props.roleId)
  ]);

  loading.value = false;

  if (!menuError) {
    treeData.value = menus || [];
  }

  checkedKeys.value = roleError ? [] : roleInfo.menuIds || [];

  await nextTick();
  treeRef.value?.setCheckedKeys(checkedKeys.value);
}

async function handleSubmit() {
  if (!props.roleId) {
    return;
  }

  const currentCheckedKeys = treeRef.value?.getCheckedKeys(false) || checkedKeys.value;
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || [];
  const menuIds = Array.from(new Set([...currentCheckedKeys, ...halfCheckedKeys]));

  submitting.value = true;

  const { error } = await fetchUpdateRoleMenus({
    roleId: props.roleId,
    menuIds
  });

  submitting.value = false;

  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    closeModal();
  }
}

watch(visible, async newVisible => {
  if (newVisible) {
    await init();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" width="680px">
    <ElTree
      ref="treeRef"
      v-loading="loading"
      :data="treeData"
      :props="treeProps"
      node-key="id"
      show-checkbox
      default-expand-all
      class="max-h-520px overflow-y-auto border border-[var(--el-border-color)] rounded-2 p-12px"
    />

    <template #footer>
      <ElSpace class="w-full justify-end">
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ $t('common.confirm') }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
