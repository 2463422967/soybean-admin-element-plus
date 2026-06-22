<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import printJS from 'print-js';
import {
  fetchGetErpUserList,
  fetchGetMaterialInfo,
  fetchGetProductionList,
  fetchGetSemiProductionList,
  fetchGetSupplierList
} from '@/service/api';
import { labelPrintStyle } from './modules/label-print';
import { getLabelTemplate, labelTemplates } from './modules/label-templates';
import LabelPreview from './modules/label-preview.vue';

defineOptions({ name: 'LabelManagement' });

const selectedTemplateKey = ref<Wms.Label.TemplateKey>('model1');
const printCopies = ref(1);
const formData = reactive<Wms.Label.FormData>({});
const lookupLoading = ref(false);
const afterPrintCallback = ref<NonNullable<Wms.Label.ExternalTemplateData['afterPrint']> | null>(null);

const fieldOptions = reactive<Record<NonNullable<Wms.Label.FieldConfig['optionsKey']>, Wms.Label.FieldOption[]>>({
  productionOrders: [],
  semiMaterials: [],
  workers: [],
  suppliers: []
});

const currentTemplate = computed(() => getLabelTemplate(selectedTemplateKey.value));

const printCopyItems = computed(() => {
  const count = Number(printCopies.value);
  const safeCount = Number.isFinite(count) ? Math.min(Math.max(Math.trunc(count), 1), 100) : 1;

  return Array.from({ length: safeCount }, (_, index) => index);
});

function toList<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function toMaterial(value: unknown) {
  if (value && typeof value === 'object' && 'materialCode' in value) {
    return value as Wms.BaseInfo.Material;
  }

  return null;
}

watch(selectedTemplateKey, () => {
  resetForm();
});

onMounted(() => {
  loadBaseOptions();
});

async function loadBaseOptions() {
  const [users, suppliers] = await Promise.allSettled([
    fetchGetErpUserList({ current: 1, size: 10000 }),
    fetchGetSupplierList()
  ]);

  if (users.status === 'fulfilled') {
    const names = new Set(
      toList<Wms.BaseInfo.User>(users.value)
        .map(item => item.name)
        .filter(Boolean)
    );
    fieldOptions.workers = Array.from(names).map(name => ({ label: name, value: name }));
  }

  if (suppliers.status === 'fulfilled') {
    const names = new Map<string, Wms.BaseInfo.Supplier>();
    toList<Wms.BaseInfo.Supplier>(suppliers.value).forEach(item => {
      if (item.name && !names.has(item.name)) {
        names.set(item.name, item);
      }
    });
    fieldOptions.suppliers = Array.from(names.values()).map(item => ({
      label: item.name,
      value: item.name,
      item
    }));
  }
}

function resetForm() {
  labelTemplates
    .flatMap(template => template.formFields)
    .forEach(field => {
      formData[field.prop] = undefined;
    });
  fieldOptions.productionOrders = [];
  fieldOptions.semiMaterials = [];
  printCopies.value = 1;
}

function getOptions(field: Wms.Label.FieldConfig) {
  return field.optionsKey ? fieldOptions[field.optionsKey] : [];
}

function applyMaterial(material?: Wms.BaseInfo.Material | null) {
  if (!material) return;

  formData.materialCode = material.materialCode || formData.materialCode;
  formData.materialName = material.materialName || ' ';
  formData.color = material.color || ' ';
  formData.quantity = material.boxQty || formData.quantity || 0;
}

function applyProduction(production?: Wms.BaseInfo.Production | null) {
  if (!production) return;

  formData.customerCode = production.customer || '';
  formData.materialName = production.materialName || '';
  formData.materialCode = production.materialCode || '';
  formData.quantity = production.box || 0;
  formData.modelSpec = production.materialSpec || '';
  formData.qty = production.qty || '';
  formData.orderCode = production.saleNo || formData.orderCode || '';
  formData.color = production.color || formData.color || '';
}

async function handleFieldBlur(field: Wms.Label.FieldConfig) {
  if (!field.lookup) return;

  if (field.lookup === 'material') {
    const materialCode = String(formData.materialCode || '').trim();
    if (!materialCode) return;

    lookupLoading.value = true;
    try {
      applyMaterial(toMaterial(await fetchGetMaterialInfo(materialCode)));
    } finally {
      lookupLoading.value = false;
    }
  }

  if (field.lookup === 'production') {
    const batchCode = String(formData.batchCode || '').trim();
    if (!batchCode) return;

    lookupLoading.value = true;
    try {
      const list = toList<Wms.BaseInfo.Production>(await fetchGetProductionList(batchCode));
      fieldOptions.productionOrders = list.map(item => ({
        label: item.saleNo || item.materialCode || '',
        value: item.saleNo || item.materialCode || '',
        item
      }));
      if (list.length === 0) {
        window.$message?.warning('未查询到相关成品信息');
      } else {
        applyProduction(list[0]);
      }
    } finally {
      lookupLoading.value = false;
    }
  }

  if (field.lookup === 'semiProduction') {
    const batchCode = String(formData.batchCode || '').trim();
    if (!batchCode) return;

    lookupLoading.value = true;
    try {
      const list = toList<Wms.BaseInfo.Production>(await fetchGetSemiProductionList(batchCode));
      fieldOptions.semiMaterials = list.map(item => ({
        label: item.materialCode || item.materialName || '',
        value: item.materialCode || item.materialName || '',
        item
      }));
      if (list.length === 0) {
        window.$message?.warning('未查询到相关半成品信息');
      } else if (list.length === 1) {
        applyProduction(list[0]);
      } else {
        window.$message?.info(`查询到${list.length}条数据，请确认物料料号`);
      }
    } finally {
      lookupLoading.value = false;
    }
  }
}

function handleSelectChange(value: string, field: Wms.Label.FieldConfig) {
  const option = getOptions(field).find(item => item.value === value);

  if (field.isModel1Order) {
    applyProduction(option?.item as Wms.BaseInfo.Production | undefined);
  }

  if (field.isModel2Material) {
    applyProduction(option?.item as Wms.BaseInfo.Production | undefined);
  }
}

async function printLabels() {
  await nextTick();

  printJS({
    printable: 'label-print-area',
    type: 'html',
    scanStyles: true,
    targetStyles: ['*'],
    style: labelPrintStyle,
    onPrintDialogClose: () => {
      const callback = afterPrintCallback.value;
      afterPrintCallback.value = null;
      callback?.();
    }
  });
}

async function setTemplateAndData(options: Wms.Label.ExternalTemplateData) {
  selectedTemplateKey.value = options.templateKey;
  await nextTick();

  resetForm();
  Object.assign(formData, options.formData);
  printCopies.value = options.printCopies ?? 1;
  afterPrintCallback.value = options.afterPrint ?? null;

  if (options.lookupMaterial === false || !formData.materialCode) return;

  lookupLoading.value = true;
  try {
    applyMaterial(toMaterial(await fetchGetMaterialInfo(String(formData.materialCode))));
  } finally {
    lookupLoading.value = false;
  }
}

defineExpose({
  printLabels,
  setTemplateAndData
});
</script>

<template>
  <div class="label-management min-h-500px flex-col-stretch gap-16px overflow-hidden lt-lg:overflow-auto">
    <ElCard class="card-wrapper">
      <template #header>
        <div class="flex items-center justify-between">
          <p>标签管理</p>
          <div class="flex items-center gap-12px">
            <ElButton @click="resetForm">重置</ElButton>
            <ElButton type="primary" @click="printLabels">
              <template #icon>
                <icon-mdi-printer />
              </template>
              打印标签
            </ElButton>
          </div>
        </div>
      </template>

      <ElForm v-loading="lookupLoading" :model="formData" label-width="112px" label-position="right">
        <ElRow :gutter="16">
          <ElCol :lg="8" :md="12" :sm="24">
            <ElFormItem label="标签模板">
              <ElSelect v-model="selectedTemplateKey" class="w-full" placeholder="请选择标签模板">
                <ElOption
                  v-for="template in labelTemplates"
                  :key="template.key"
                  :label="template.label"
                  :value="template.key"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :lg="8" :md="12" :sm="24">
            <ElFormItem label="打印张数">
              <ElInputNumber v-model="printCopies" class="w-full" :min="1" :max="100" :precision="0" />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElDivider content-position="left">标签字段</ElDivider>

        <ElRow :gutter="16">
          <ElCol v-for="field in currentTemplate.formFields" :key="field.prop" :lg="field.span || 8" :md="12" :sm="24">
            <ElFormItem :label="field.label" :prop="field.prop">
              <ElInput
                v-if="field.type === 'input'"
                v-model="formData[field.prop]"
                clearable
                :placeholder="field.placeholder || `请输入${field.label}`"
                @blur="handleFieldBlur(field)"
              />
              <ElDatePicker
                v-else-if="field.type === 'date'"
                v-model="formData[field.prop]"
                class="w-full"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="field.placeholder || `请选择${field.label}`"
              />
              <ElSelect
                v-else
                v-model="formData[field.prop]"
                class="w-full"
                filterable
                allow-create
                clearable
                :placeholder="field.placeholder || `请选择${field.label}`"
                @change="value => handleSelectChange(String(value), field)"
              >
                <ElOption
                  v-for="option in getOptions(field)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </ElCard>

    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>标签预览</p>
          <ElTag type="info">{{ currentTemplate.label }}</ElTag>
        </div>
      </template>
      <ElScrollbar class="h-full">
        <div class="label-preview-stage">
          <LabelPreview :template="currentTemplate" :form-data="formData" />
        </div>
      </ElScrollbar>
    </ElCard>

    <div id="label-print-area" class="label-print-source">
      <LabelPreview
        v-for="item in printCopyItems"
        :key="`${currentTemplate.key}-${item}`"
        :template="currentTemplate"
        :form-data="formData"
      />
    </div>
  </div>
</template>

<style scoped>
.label-preview-stage {
  display: flex;
  min-height: 360px;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  background: #f3f4f6;
}

.label-print-source {
  position: fixed;
  top: 0;
  left: -10000px;
  width: 120mm;
  background: #fff;
}
</style>
