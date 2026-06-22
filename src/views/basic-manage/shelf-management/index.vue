<script setup lang="tsx">
import { computed, nextTick, reactive, ref } from 'vue';
import printJS from 'print-js';
import QRCode from 'qrcode';
import { fetchAddShelf, fetchGetShelfList } from '@/service/api';
import { useForm, useFormRules } from '@/hooks/common/form';
import { defaultTransform, useUIPaginatedTable } from '@/hooks/common/table';
import { $t } from '@/locales';
import BasicKeywordSearch from '../modules/basic-keyword-search.vue';
import { buildShelfQrText } from './modules/shelf-qrcode';

defineOptions({ name: 'ShelfManagement' });

const searchParams = ref(getInitSearchParams());
const addVisible = ref(false);
const addSubmitting = ref(false);
const printLoading = ref(false);
const printItems = ref<Wms.BaseInfo.ShelfPrintItem[]>([]);
const addForm = reactive<Wms.BaseInfo.ShelfAddParams>(createDefaultAddForm());
const { formRef, validate, restoreValidation } = useForm();
const { createRequiredRule } = useFormRules();

const addRules = computed<Partial<Record<keyof Wms.BaseInfo.ShelfAddParams, App.Global.FormRule[]>>>(() => ({
  shelfCode: [createRequiredRule('请输入货架编码')],
  shelfName: [createRequiredRule('请输入货架名称')]
}));

const shelfPrintStyle = `
  @page { margin: 8mm; }
  body { margin: 0; color: #111827; font-family: Arial, "Microsoft YaHei", sans-serif; }
  .shelf-print-list { display: flex; flex-direction: column; align-items: center; gap: 10mm; }
  .shelf-print-item { page-break-inside: avoid; text-align: center; }
  .shelf-print-item + .shelf-print-item { page-break-before: always; }
  .shelf-print-card { width: 48mm; padding: 4mm; border: 1px solid #d1d5db; box-sizing: border-box; }
  .shelf-print-card img { width: 34mm; height: 34mm; object-fit: contain; }
  .shelf-print-title { margin: 2mm 0 0; font-size: 13px; font-weight: 700; }
  .shelf-print-text { margin: 1.5mm 0 0; font-size: 11px; line-height: 1.4; }
`;

function getInitSearchParams(): Wms.BaseInfo.ShelfSearchParams {
  return {
    current: 1,
    size: 30,
    keyWords: undefined
  };
}

function createDefaultAddForm(): Wms.BaseInfo.ShelfAddParams {
  return {
    shelfCode: '',
    shelfName: '',
    detailList: []
  };
}

const { columns, columnChecks, data, getData, getDataByPage, loading, mobilePagination } = useUIPaginatedTable({
  paginationProps: {
    currentPage: searchParams.value.current,
    pageSize: searchParams.value.size
  },
  api: () => fetchGetShelfList(searchParams.value),
  transform: response => defaultTransform(response),
  onPaginationParamsChange: params => {
    searchParams.value.current = params.currentPage ?? 1;
    searchParams.value.size = params.pageSize ?? 30;
  },
  columns: () => [
    { prop: 'index', type: 'index', label: '序号', width: 64 },
    { prop: 'shelfCode', label: '货架编码', minWidth: 140 },
    { prop: 'shelfName', label: '货架名称', minWidth: 160 },
    { prop: 'createTime', label: '创建时间', minWidth: 180 }
  ]
});

function resetSearchParams() {
  searchParams.value = getInitSearchParams();
}

async function openAddShelf() {
  Object.assign(addForm, createDefaultAddForm());
  addVisible.value = true;
  await nextTick();
  await restoreValidation();
}

function closeAddDialog() {
  addVisible.value = false;
}

async function submitAddShelf() {
  await validate();

  addSubmitting.value = true;
  try {
    const { error } = await fetchAddShelf({
      shelfCode: addForm.shelfCode.trim(),
      shelfName: addForm.shelfName.trim(),
      detailList: addForm.detailList
    });

    if (!error) {
      window.$message?.success($t('common.addSuccess'));
      closeAddDialog();
      await getDataByPage();
    }
  } finally {
    addSubmitting.value = false;
  }
}

async function createShelfPrintItem(shelf: Wms.BaseInfo.Shelf): Promise<Wms.BaseInfo.ShelfPrintItem> {
  const qrCodeUrl = await QRCode.toDataURL(buildShelfQrText(shelf), {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 180
  });

  return {
    ...shelf,
    qrCodeUrl
  };
}

async function printAllShelves() {
  if (!data.value.length) {
    window.$message?.warning('当前列表没有可打印的货架');
    return;
  }

  printLoading.value = true;
  try {
    printItems.value = await Promise.all(data.value.map(item => createShelfPrintItem(item)));
    await nextTick();

    printJS({
      printable: 'shelf-print-area',
      type: 'html',
      scanStyles: true,
      targetStyles: ['*'],
      style: shelfPrintStyle
    });
  } finally {
    printLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <BasicKeywordSearch
      v-model:model="searchParams"
      collapse-name="shelf-search"
      placeholder="请输入货架编码或名称"
      @reset="resetSearchParams"
      @search="getDataByPage"
    />
    <ElCard class="card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex items-center justify-between">
          <p>货架管理</p>
          <TableHeaderOperation v-model:columns="columnChecks" :loading="loading" @refresh="getData">
            <template #default>
              <ElButton plain type="primary" @click="openAddShelf">
                <template #icon>
                  <icon-ic-round-plus class="text-icon" />
                </template>
                新增货架
              </ElButton>
              <ElButton :loading="printLoading" @click="printAllShelves">
                <template #icon>
                  <icon-mdi-printer class="text-icon" />
                </template>
                打印全部货架
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
    </ElCard>

    <ElDialog v-model="addVisible" title="新增货架" width="520px">
      <ElForm ref="formRef" :model="addForm" :rules="addRules" label-position="top">
        <ElFormItem label="货架编码" prop="shelfCode">
          <ElInput v-model="addForm.shelfCode" clearable placeholder="请输入货架编码" />
        </ElFormItem>
        <ElFormItem label="货架名称" prop="shelfName">
          <ElInput v-model="addForm.shelfName" clearable placeholder="请输入货架名称" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElSpace>
          <ElButton @click="closeAddDialog">{{ $t('common.cancel') }}</ElButton>
          <ElButton type="primary" :loading="addSubmitting" @click="submitAddShelf">
            {{ $t('common.confirm') }}
          </ElButton>
        </ElSpace>
      </template>
    </ElDialog>

    <div id="shelf-print-area" class="shelf-print-source">
      <div class="shelf-print-list">
        <div v-for="shelf in printItems" :key="shelf.id" class="shelf-print-item">
          <div class="shelf-print-card">
            <img :src="shelf.qrCodeUrl" alt="货架二维码" />
            <p class="shelf-print-title">货架二维码</p>
            <p class="shelf-print-text">货架编码：{{ shelf.shelfCode }}</p>
            <p class="shelf-print-text">货架名称：{{ shelf.shelfName }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shelf-print-source {
  position: fixed;
  top: 0;
  left: -10000px;
  width: 60mm;
  background: #fff;
}
</style>
