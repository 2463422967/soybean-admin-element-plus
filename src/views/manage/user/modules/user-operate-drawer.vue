<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchGetAllRoles, fetchUpdateUserRoles } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'UserOperateDrawer' });

interface Props {
  rowData?: Api.SystemManage.User | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

type Model = {
  userId?: number;
  code: string;
  name: string;
  department: string;
  roleIds: Api.SystemManage.Id[];
};

const model = ref<Model>(createDefaultModel());
const roleOptions = ref<CommonType.Option<Api.SystemManage.Id>[]>([]);

const title = computed(() => '编辑用户角色');

const rules: Partial<Record<keyof Model, App.Global.FormRule>> = {
  userId: defaultRequiredRule
};

function createDefaultModel(): Model {
  return {
    userId: undefined,
    code: '',
    name: '',
    department: '',
    roleIds: []
  };
}

async function getRoleOptions() {
  const { error, data } = await fetchGetAllRoles();

  if (!error) {
    roleOptions.value = data.map(item => ({
      label: item.name || item.roleName || item.code || item.roleCode,
      value: item.id
    }));
  }
}

function initModel() {
  const rowData = props.rowData;

  model.value = {
    userId: rowData?.id,
    code: rowData?.code || '',
    name: rowData?.name || '',
    department: rowData?.department || '',
    roleIds: rowData?.roleIds ? [...rowData.roleIds] : []
  };
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  if (!model.value.userId) {
    return;
  }

  await validate();

  const { error } = await fetchUpdateUserRoles({
    userId: model.value.userId,
    roleIds: model.value.roleIds
  });

  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    closeDrawer();
    emit('submitted');
  }
}

watch(visible, async newVisible => {
  if (!newVisible) {
    return;
  }

  initModel();
  await restoreValidation();
  await getRoleOptions();
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" :size="420">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem label="工号">
        <ElInput :model-value="model.code" disabled />
      </ElFormItem>
      <ElFormItem label="姓名">
        <ElInput :model-value="model.name" disabled />
      </ElFormItem>
      <ElFormItem label="部门">
        <ElInput :model-value="model.department" disabled />
      </ElFormItem>
      <ElFormItem label="角色">
        <ElSelect v-model="model.roleIds" multiple filterable collapse-tags placeholder="请选择角色">
          <ElOption v-for="{ label, value } in roleOptions" :key="value" :label="label" :value="value" />
        </ElSelect>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElSpace :size="16">
        <ElButton @click="closeDrawer">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<style scoped></style>
