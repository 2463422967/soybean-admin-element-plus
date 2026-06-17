<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { enableStatusOptions, menuTypeOptions } from '@/constants/business';
import { fetchAddMenu, fetchUpdateMenu } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { $t } from '@/locales';

defineOptions({ name: 'MenuOperateModal' });

export type OperateType = UI.TableOperateType | 'addChild';

interface Props {
  operateType: OperateType;
  rowData?: Api.SystemManage.Menu | null;
  menus: Api.SystemManage.Menu[];
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

type Model = {
  parentId: Api.SystemManage.Id;
  title: string;
  type: Api.SystemManage.MenuType;
  path: string;
  name: string;
  component: string;
  icon: string;
  permission: string;
  sort: number;
  status: 1 | 2;
  isHidden: boolean;
};

const { formRef, validate, restoreValidation } = useForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<OperateType, string> = {
    add: $t('page.manage.menu.addMenu'),
    addChild: $t('page.manage.menu.addChildMenu'),
    edit: $t('page.manage.menu.editMenu')
  };

  return titles[props.operateType];
});

const rules: Record<Extract<keyof Model, 'title' | 'type'>, App.Global.FormRule> = {
  title: defaultRequiredRule,
  type: defaultRequiredRule
};

const model = ref(createDefaultModel());

function createDefaultModel(): Model {
  return {
    parentId: 0,
    title: '',
    type: 2,
    path: '',
    name: '',
    component: '',
    icon: '',
    permission: '',
    sort: 0,
    status: 1,
    isHidden: false
  };
}

function normalizeStatus(status: Api.SystemManage.EnableStatus | null | undefined): 1 | 2 {
  return Number(status || 1) === 2 ? 2 : 1;
}

function normalizeType(type: Api.SystemManage.MenuType | null | undefined): Api.SystemManage.MenuType {
  const value = Number(type || 2);

  if (value === 1 || value === 2 || value === 3) {
    return value;
  }

  return 2;
}

function flattenMenus(menus: Api.SystemManage.Menu[]) {
  const result: CommonType.Option<Api.SystemManage.Id>[] = [{ label: $t('page.manage.menu.rootMenu'), value: 0 }];

  function walk(items: Api.SystemManage.Menu[], level = 0) {
    items.forEach(item => {
      if (props.operateType === 'edit' && item.id === props.rowData?.id) {
        return;
      }

      result.push({
        label: `${'　'.repeat(level)}${item.title}`,
        value: item.id
      });

      if (item.children?.length) {
        walk(item.children, level + 1);
      }
    });
  }

  walk(menus);

  return result;
}

const parentOptions = computed(() => flattenMenus(props.menus));

const menuTypeSelectOptions = computed(() =>
  menuTypeOptions.map(item => ({
    label: $t(item.label),
    value: Number(item.value) as Api.SystemManage.MenuType
  }))
);

const statusSelectOptions = computed(() =>
  enableStatusOptions.map(item => ({
    label: $t(item.label),
    value: Number(item.value) as 1 | 2
  }))
);

function handleInitModel() {
  model.value = createDefaultModel();

  if (props.operateType === 'addChild' && props.rowData) {
    model.value.parentId = props.rowData.id;
  }

  if (props.operateType === 'edit' && props.rowData) {
    model.value = {
      parentId: props.rowData.parentId ?? 0,
      title: props.rowData.title,
      type: normalizeType(props.rowData.type),
      path: props.rowData.path || '',
      name: props.rowData.name || '',
      component: props.rowData.component || '',
      icon: props.rowData.icon || '',
      permission: props.rowData.permission || '',
      sort: props.rowData.sort ?? 0,
      status: normalizeStatus(props.rowData.status),
      isHidden: Boolean(props.rowData.isHidden)
    };
  }
}

function closeModal() {
  visible.value = false;
}

function getSubmitParams(): Api.SystemManage.SaveMenuParams {
  return {
    parentId: model.value.parentId,
    title: model.value.title,
    type: normalizeType(model.value.type),
    path: model.value.path || null,
    name: model.value.name || null,
    component: model.value.component || null,
    icon: model.value.icon || null,
    permission: model.value.permission || null,
    sort: model.value.sort ?? 0,
    status: normalizeStatus(model.value.status),
    isHidden: Boolean(model.value.isHidden)
  };
}

async function handleSubmit() {
  await validate();

  const params = getSubmitParams();
  const request =
    props.operateType === 'edit' && props.rowData
      ? fetchUpdateMenu({ ...params, id: props.rowData.id })
      : fetchAddMenu(params);

  const { error } = await request;

  if (!error) {
    window.$message?.success(props.operateType === 'add' ? $t('common.addSuccess') : $t('common.updateSuccess'));
    closeModal();
    emit('submitted');
  }
}

watch(visible, () => {
  if (visible.value) {
    handleInitModel();
    restoreValidation();
  }
});
</script>

<template>
  <ElDialog v-model="visible" :title="title" class="w-720px">
    <ElForm ref="formRef" :model="model" :rules="rules" label-position="right" :label-width="100">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.parentId')" prop="parentId">
            <ElSelect v-model="model.parentId" filterable :placeholder="$t('page.manage.menu.form.parentId')">
              <ElOption v-for="{ label, value } in parentOptions" :key="value" :label="label" :value="value" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.menuType')" prop="type">
            <ElSelect v-model="model.type" :placeholder="$t('page.manage.menu.form.menuType')">
              <ElOption v-for="{ label, value } in menuTypeSelectOptions" :key="value" :label="label" :value="value" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.menuName')" prop="title">
            <ElInput v-model="model.title" :placeholder="$t('page.manage.menu.form.menuName')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.routeName')" prop="name">
            <ElInput v-model="model.name" :placeholder="$t('page.manage.menu.form.routeName')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.routePath')" prop="path">
            <ElInput v-model="model.path" :placeholder="$t('page.manage.menu.form.routePath')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.component')" prop="component">
            <ElInput v-model="model.component" :placeholder="$t('page.manage.menu.form.component')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.icon')" prop="icon">
            <ElInput v-model="model.icon" :placeholder="$t('page.manage.menu.form.icon')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.permission')" prop="permission">
            <ElInput v-model="model.permission" :placeholder="$t('page.manage.menu.form.permission')" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.order')" prop="sort">
            <ElInputNumber v-model="model.sort" class="w-full" :min="0" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.menuStatus')" prop="status">
            <ElSelect v-model="model.status" :placeholder="$t('page.manage.menu.form.menuStatus')">
              <ElOption v-for="{ label, value } in statusSelectOptions" :key="value" :label="label" :value="value" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="$t('page.manage.menu.hideInMenu')" prop="isHidden">
            <ElSwitch v-model="model.isHidden" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElSpace :size="16">
        <ElButton @click="closeModal">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>
