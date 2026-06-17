<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fetchUpdateUserPassword } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'UserPasswordModal' });

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
const { formRules, createConfirmPwdRule } = useFormRules();

type FormModel = {
  password: string;
  confirmPassword: string;
};

const model = ref<FormModel>(createDefaultModel());

function createDefaultModel(): FormModel {
  return {
    password: '',
    confirmPassword: ''
  };
}

const title = computed(() => '重置密码');

const rules = computed<Partial<Record<keyof FormModel, App.Global.FormRule[]>>>(() => {
  return {
    password: formRules.pwd,
    confirmPassword: createConfirmPwdRule(model.value.password)
  };
});

function closeModal() {
  visible.value = false;
}

async function handleSubmit() {
  if (!props.rowData) {
    return;
  }

  await validate();

  const { error } = await fetchUpdateUserPassword({
    userId: props.rowData.id,
    password: model.value.password
  });

  if (!error) {
    window.$message?.success($t('common.updateSuccess'));
    closeModal();
    emit('submitted');
  }
}

watch(visible, async newVisible => {
  if (!newVisible) {
    return;
  }

  model.value = createDefaultModel();
  await restoreValidation();
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" width="420px">
    <div
      class="mb-16px rounded-2 bg-[var(--el-fill-color-light)] px-12px py-10px text-14px text-[var(--el-text-color-regular)]"
    >
      <div>工号：{{ rowData?.code || '-' }}</div>
      <div class="mt-6px">姓名：{{ rowData?.name || '-' }}</div>
    </div>

    <ElForm ref="formRef" :model="model" :rules="rules" label-position="top">
      <ElFormItem label="新密码" prop="password">
        <ElInput
          v-model="model.password"
          type="password"
          show-password
          show-password-on="click"
          :placeholder="$t('page.login.common.passwordPlaceholder')"
        />
      </ElFormItem>
      <ElFormItem label="确认密码" prop="confirmPassword">
        <ElInput
          v-model="model.confirmPassword"
          type="password"
          show-password
          show-password-on="click"
          :placeholder="$t('page.login.common.confirmPasswordPlaceholder')"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElSpace>
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<style scoped></style>
