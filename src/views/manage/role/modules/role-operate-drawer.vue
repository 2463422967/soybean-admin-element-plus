<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchAddRole, fetchGetRoleInfo, fetchUpdateRole } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'RoleOperateDrawer' });

interface Props {
  operateType: UI.TableOperateType;
  rowData?: Api.SystemManage.Role | null;
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
  name: string;
  code: string;
  description: string;
  sort: number;
  status: Api.SystemManage.EnableStatus;
};

const loading = ref(false);
const model = ref<Model>(createDefaultModel());

const title = computed(() => (props.operateType === 'add' ? '新增角色' : '编辑角色'));

const rules: Record<Exclude<keyof Model, 'description' | 'sort'>, App.Global.FormRule> = {
  name: defaultRequiredRule,
  code: defaultRequiredRule,
  status: defaultRequiredRule
};

function createDefaultModel(): Model {
  return {
    name: '',
    code: '',
    description: '',
    sort: 0,
    status: '1'
  };
}

async function initModel() {
  model.value = createDefaultModel();

  if (props.operateType !== 'edit' || !props.rowData?.id) {
    return;
  }

  loading.value = true;

  const { error, data } = await fetchGetRoleInfo(props.rowData.id);

  loading.value = false;

  if (!error) {
    model.value = {
      name: data.name || '',
      code: data.code || '',
      description: data.description || '',
      sort: data.sort ?? 0,
      status: (String(data.status || '1') === '2' ? '2' : '1') as Api.SystemManage.EnableStatus
    };
    return;
  }

  model.value = {
    name: props.rowData.name || '',
    code: props.rowData.code || '',
    description: props.rowData.description || '',
    sort: props.rowData.sort ?? 0,
    status: (String(props.rowData.status || '1') === '2' ? '2' : '1') as Api.SystemManage.EnableStatus
  };
}

function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();

  const payload: Api.SystemManage.SaveRoleParams = {
    name: model.value.name.trim(),
    code: model.value.code.trim(),
    description: model.value.description.trim() || null,
    sort: model.value.sort,
    status: model.value.status
  };

  const request =
    props.operateType === 'add' || !props.rowData?.id
      ? fetchAddRole(payload)
      : fetchUpdateRole({
          ...payload,
          id: props.rowData.id
        });

  const { error } = await request;

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

  await restoreValidation();
  await initModel();
});
</script>

<template>
  <ElDrawer v-model="visible" :title="title" :size="420">
    <ElForm ref="formRef" v-loading="loading" :model="model" :rules="rules" label-position="top">
      <ElFormItem label="角色名称" prop="name">
        <ElInput v-model="model.name" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="角色编码" prop="code">
        <ElInput v-model="model.code" placeholder="请输入角色编码" />
      </ElFormItem>
      <ElFormItem label="角色描述" prop="description">
        <ElInput v-model="model.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
      </ElFormItem>
      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="model.sort" class="w-full" :min="0" :step="1" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="model.status">
          <ElRadio value="1" label="启用" />
          <ElRadio value="2" label="禁用" />
        </ElRadioGroup>
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
