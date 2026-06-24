<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue';
import $ from 'jquery';
import { defaultElementTypeProvider as DefaultElementTypeProvider, disAutoConnect, hiprint } from 'vue-plugin-hiprint';
import {
  fetchDeleteLabelTemplate,
  fetchGetLabelTemplatePage,
  fetchSaveLabelTemplate,
  fetchSetDefaultLabelTemplate,
  fetchUpdateLabelTemplateStatus
} from '@/service/api';
import {
  createBlankTemplate,
  createPrintSampleData,
  designerComponents,
  getPaperOption,
  paperOptions
} from './modules/designer-template';
import type { DesignerPaperKey, HiprintTemplateJson } from './modules/designer-template';
import {
  createTemplateCode,
  createTemplateName,
  getLabelBusinessOption,
  labelBusinessOptions
} from './modules/label-template-business';

defineOptions({ name: 'LabelDesign' });

type PageMode = 'list' | 'designer';

const storageKey = 'zanbo-wms-label-designer-generic-poc';

const pageMode = ref<PageMode>('list');
const selectedTemplateId = ref<number>();
const selectedPaperKey = ref<DesignerPaperKey>('label100x140');
const designJsonText = ref('');
const templateList = ref<Wms.Label.TemplateEntity[]>([]);
const templateLoading = ref(false);
const saveLoading = ref(false);
const hiprintReady = ref(false);
const hiprintError = ref('');
const hiprintTemplateRef = shallowRef<any>(null);
const previewVisible = ref(false);
const previewLoading = ref(false);
const previewTemplateJson = shallowRef<Record<string, unknown> | null>(null);

const searchForm = reactive({
  keyWords: '',
  businessType: '' as Wms.Label.TemplateKey | '',
  enabled: undefined as boolean | undefined
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
});

const templateForm = reactive({
  templateCode: createTemplateCode(),
  templateName: createTemplateName(),
  businessType: 'model1' as Wms.Label.TemplateKey,
  enabled: true,
  defaultTemplate: false,
  remark: ''
});

const baseComponents = computed(() => designerComponents.filter(item => item.group === 'base'));
const assistComponents = computed(() => designerComponents.filter(item => item.group === 'assist'));
const currentPaper = computed(() => getPaperOption(selectedPaperKey.value));
const currentBusinessOption = computed(() => getLabelBusinessOption(templateForm.businessType));

function getBusinessLabel(businessType: Wms.Label.TemplateKey) {
  return getLabelBusinessOption(businessType).label;
}

function formatPaperSize(template: Pick<Wms.Label.TemplateEntity, 'paperWidth' | 'paperHeight'>) {
  return `${template.paperWidth}mm x ${template.paperHeight}mm`;
}

function getPaperKeyBySize(width: number, height: number) {
  return (
    paperOptions.find(item => Number(item.width) === Number(width) && Number(item.height) === Number(height))?.key ??
    'label100x140'
  );
}

function resetTemplateForm(businessType: Wms.Label.TemplateKey = 'model1') {
  selectedTemplateId.value = undefined;
  templateForm.businessType = businessType;
  selectedPaperKey.value = getLabelBusinessOption(businessType).paperKey;
  templateForm.templateCode = createTemplateCode();
  templateForm.templateName = createTemplateName();
  templateForm.enabled = true;
  templateForm.defaultTemplate = false;
  templateForm.remark = '';
}

function applyTemplateRecord(record: Wms.Label.TemplateEntity) {
  selectedTemplateId.value = record.id;
  templateForm.businessType = record.businessType;
  selectedPaperKey.value = getPaperKeyBySize(record.paperWidth, record.paperHeight);
  templateForm.templateCode = record.templateCode;
  templateForm.templateName = record.templateName;
  templateForm.enabled = record.enabled;
  templateForm.defaultTemplate = record.defaultTemplate;
  templateForm.remark = record.remark || '';
  designJsonText.value = JSON.stringify(record.templateJson, null, 2);
}

function getCurrentTemplateJson(): HiprintTemplateJson | Record<string, unknown> {
  if (!designJsonText.value) return createBlankTemplate(selectedPaperKey.value);

  try {
    return JSON.parse(designJsonText.value) as Record<string, unknown>;
  } catch {
    return createBlankTemplate(selectedPaperKey.value);
  }
}

function syncJsonFromDesigner() {
  const instance = hiprintTemplateRef.value;

  if (!instance?.getJson) return;

  designJsonText.value = JSON.stringify(instance.getJson(), null, 2);
}

async function mountHiprintDesigner(templateJson = getCurrentTemplateJson()) {
  await nextTick();

  const designContainer = $('#hiprint-printTemplate');
  const settingContainer = $('#PrintElementOptionSetting');

  if (!designContainer.length || !settingContainer.length) return;

  hiprintReady.value = false;
  hiprintError.value = '';
  designContainer.empty();
  settingContainer.empty();

  try {
    disAutoConnect();
    hiprint.init({
      providers: [new DefaultElementTypeProvider()]
    });
    hiprint.PrintElementTypeManager.buildByHtml($('.label-designer__component-card'));

    hiprintTemplateRef.value = new hiprint.PrintTemplate({
      template: templateJson,
      settingContainer: '#PrintElementOptionSetting',
      paginationContainer: '.hiprint-printPagination',
      dataMode: 1,
      history: true,
      onDataChanged: syncJsonFromDesigner
    });
    hiprintTemplateRef.value.design('#hiprint-printTemplate');
    syncJsonFromDesigner();
    hiprintReady.value = true;
  } catch (error) {
    hiprintError.value = error instanceof Error ? error.message : String(error);
    window.$message?.error(`hiprint设计器初始化失败：${hiprintError.value}`);
  }
}

async function loadTemplateList() {
  templateLoading.value = true;
  try {
    const { data: page, error } = await fetchGetLabelTemplatePage({
      current: pagination.current,
      size: pagination.size,
      keyWords: searchForm.keyWords.trim() || undefined,
      businessType: searchForm.businessType || undefined,
      enabled: searchForm.enabled
    });

    if (error || !page) return;

    templateList.value = page.records || [];
    pagination.total = Number(page.total || 0);
  } finally {
    templateLoading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
  loadTemplateList();
}

function resetSearch() {
  searchForm.keyWords = '';
  searchForm.businessType = '';
  searchForm.enabled = undefined;
  handleSearch();
}

function loadBlankTemplate() {
  const json = createBlankTemplate(selectedPaperKey.value);

  designJsonText.value = JSON.stringify(json, null, 2);
  mountHiprintDesigner(json);
}

async function createNewTemplate() {
  resetTemplateForm((searchForm.businessType || 'model1') as Wms.Label.TemplateKey);
  const json = createBlankTemplate(selectedPaperKey.value);
  designJsonText.value = JSON.stringify(json, null, 2);
  pageMode.value = 'designer';
  await mountHiprintDesigner(json);
}

async function designTemplate(record: Wms.Label.TemplateEntity) {
  applyTemplateRecord(record);
  pageMode.value = 'designer';
  await mountHiprintDesigner(record.templateJson);
}

function backToList() {
  pageMode.value = 'list';
  hiprintTemplateRef.value = null;
  hiprintReady.value = false;
  loadTemplateList();
}

function handlePaperChange() {
  loadBlankTemplate();
}

function handleBusinessChange() {
  if (!selectedTemplateId.value) {
    selectedPaperKey.value = currentBusinessOption.value.paperKey;
    loadBlankTemplate();
  }
}

function applyJsonToDesigner() {
  try {
    const parsed = JSON.parse(designJsonText.value) as Record<string, unknown>;

    mountHiprintDesigner(parsed);
    window.$message?.success('JSON已应用到设计器');
  } catch {
    window.$message?.error('JSON格式不正确');
  }
}

function parseDesignerJson() {
  syncJsonFromDesigner();

  try {
    return JSON.parse(designJsonText.value) as Record<string, unknown>;
  } catch {
    window.$message?.error('JSON格式不正确');
    return null;
  }
}

function appendPreviewHtml(container: JQuery<HTMLElement>, html: unknown) {
  container.empty();

  if (typeof html === 'string') {
    container.html(html);
    return;
  }

  if (html instanceof HTMLElement) {
    container.append(html);
    return;
  }

  if (html && typeof html === 'object' && 'jquery' in html) {
    container.append(html as JQuery<HTMLElement>);
    return;
  }

  throw new Error('hiprint未返回可预览的HTML内容');
}

function renderTemplatePreview() {
  const templateJson = previewTemplateJson.value;
  const previewContainer = $('#label-template-preview');

  if (!templateJson || !previewContainer.length) return;

  previewLoading.value = true;

  try {
    const previewTemplate = new hiprint.PrintTemplate({
      template: templateJson,
      dataMode: 1
    });

    if (!previewTemplate?.getHtml) {
      throw new Error('当前hiprint实例不支持getHtml预览');
    }

    appendPreviewHtml(previewContainer, previewTemplate.getHtml(createPrintSampleData()));
  } catch (error) {
    previewContainer.empty();
    window.$message?.error(`模板预览失败：${error instanceof Error ? error.message : String(error)}`);
  } finally {
    previewLoading.value = false;
  }
}

async function openTemplatePreview() {
  const templateJson = parseDesignerJson();

  if (!templateJson) return;

  previewTemplateJson.value = templateJson;
  previewVisible.value = true;
  await nextTick();
  renderTemplatePreview();
}

async function saveTemplateToBackend() {
  const templateJson = parseDesignerJson();

  if (!templateJson) return;

  const templateCode = templateForm.templateCode.trim();
  const templateName = templateForm.templateName.trim();

  if (!templateCode || !templateName) {
    window.$message?.warning('请填写模板编码和模板名称');
    return;
  }

  saveLoading.value = true;
  try {
    const { data: saved, error } = await fetchSaveLabelTemplate({
      id: selectedTemplateId.value,
      templateCode,
      templateName,
      businessType: templateForm.businessType,
      paperWidth: currentPaper.value.width,
      paperHeight: currentPaper.value.height,
      templateJson,
      enabled: templateForm.enabled,
      defaultTemplate: templateForm.defaultTemplate,
      remark: templateForm.remark.trim()
    });

    if (error || !saved) return;

    window.$message?.success('标签模板已保存');
    applyTemplateRecord(saved);
    await loadTemplateList();
  } finally {
    saveLoading.value = false;
  }
}

async function deleteTemplate(record: Wms.Label.TemplateEntity) {
  await window.$messageBox?.confirm(`确认删除标签模板“${record.templateName}”？`, '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  });

  const { error } = await fetchDeleteLabelTemplate(record.id);

  if (error) return;

  window.$message?.success('标签模板已删除');
  await loadTemplateList();
}

async function deleteCurrentTemplate() {
  if (!selectedTemplateId.value) {
    window.$message?.warning('当前模板尚未保存');
    return;
  }

  await deleteTemplate({
    id: selectedTemplateId.value,
    templateCode: templateForm.templateCode,
    templateName: templateForm.templateName,
    businessType: templateForm.businessType,
    paperWidth: currentPaper.value.width,
    paperHeight: currentPaper.value.height,
    templateJson: getCurrentTemplateJson() as Record<string, unknown>,
    enabled: templateForm.enabled,
    defaultTemplate: templateForm.defaultTemplate,
    remark: templateForm.remark
  });
  backToList();
}

async function setTemplateAsDefault(record: Wms.Label.TemplateEntity) {
  const { error } = await fetchSetDefaultLabelTemplate(record.id);

  if (error) return;

  window.$message?.success('已设为默认模板');
  await loadTemplateList();
}

async function setCurrentAsDefault() {
  if (!selectedTemplateId.value) {
    templateForm.defaultTemplate = true;
    return;
  }

  const { error } = await fetchSetDefaultLabelTemplate(selectedTemplateId.value);

  if (error) return;

  window.$message?.success('已设为默认模板');
  templateForm.defaultTemplate = true;
  await loadTemplateList();
}

async function updateTemplateStatus(record: Wms.Label.TemplateEntity, enabled: boolean | string | number) {
  const { error } = await fetchUpdateLabelTemplateStatus({
    id: record.id,
    enabled: Boolean(enabled)
  });

  if (error) {
    record.enabled = !enabled;
    return;
  }

  await loadTemplateList();
}

async function handleEnabledChange(enabled: boolean | string | number) {
  if (!selectedTemplateId.value) return;

  const { error } = await fetchUpdateLabelTemplateStatus({
    id: selectedTemplateId.value,
    enabled: Boolean(enabled)
  });

  if (error) return;

  await loadTemplateList();
}

async function copyTemplate(record: Wms.Label.TemplateEntity) {
  const { error } = await fetchSaveLabelTemplate({
    templateCode: createTemplateCode(),
    templateName: `${record.templateName} 副本`,
    businessType: record.businessType,
    paperWidth: record.paperWidth,
    paperHeight: record.paperHeight,
    templateJson: record.templateJson,
    enabled: true,
    defaultTemplate: false,
    remark: record.remark || ''
  });

  if (error) return;

  window.$message?.success('标签模板已复制');
  await loadTemplateList();
}

function loadJsonFromLocal() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    window.$message?.warning('浏览器本地暂无已保存的模板JSON');
    return;
  }

  designJsonText.value = saved;
  applyJsonToDesigner();
}

function printByBrowser() {
  syncJsonFromDesigner();

  const instance = hiprintTemplateRef.value;

  if (!instance?.print) {
    window.$message?.warning('设计器尚未准备完成');
    return;
  }

  instance.print(
    createPrintSampleData(),
    {},
    {
      styleHandler: () => '<link rel="stylesheet" type="text/css" media="print" href="/print-lock.css" />'
    }
  );
}

onMounted(() => {
  loadTemplateList();
});

onBeforeUnmount(() => {
  hiprintTemplateRef.value = null;
});
</script>

<template>
  <div class="label-designer min-h-640px flex-col-stretch gap-16px overflow-hidden">
    <ElCard v-if="pageMode === 'list'" class="label-designer__list-card card-wrapper sm:flex-1-hidden">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-12px">
          <div>
            <p class="text-16px font-medium">标签管理</p>
            <p class="mt-4px text-12px text-gray-500">管理标签模板记录；点击设计进入 hiprint 版式设计器</p>
          </div>
          <ElButton type="primary" @click="createNewTemplate">
            <template #icon>
              <icon-ic-round-plus />
            </template>
            新增模板
          </ElButton>
        </div>
      </template>

      <div class="label-designer__list-body">
        <ElForm :model="searchForm" inline label-width="76px" class="label-template-search">
          <ElFormItem label="关键词">
            <ElInput
              v-model="searchForm.keyWords"
              clearable
              class="w-220px"
              placeholder="模板名称/编码"
              @keyup.enter="handleSearch"
            />
          </ElFormItem>
          <ElFormItem label="标签类型">
            <ElSelect v-model="searchForm.businessType" clearable class="w-180px" placeholder="全部类型">
              <ElOption
                v-for="business in labelBusinessOptions"
                :key="business.key"
                :label="business.label"
                :value="business.key"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="状态">
            <ElSelect v-model="searchForm.enabled" clearable class="w-140px" placeholder="全部状态">
              <ElOption label="启用" :value="true" />
              <ElOption label="停用" :value="false" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleSearch">查询</ElButton>
            <ElButton @click="resetSearch">重置</ElButton>
          </ElFormItem>
        </ElForm>

        <div class="label-designer__table-wrap">
          <ElTable v-loading="templateLoading" :data="templateList" border height="100%">
            <ElTableColumn prop="templateName" label="模板名称" min-width="180" show-overflow-tooltip />
            <ElTableColumn prop="templateCode" label="模板编码" min-width="170" show-overflow-tooltip />
            <ElTableColumn label="标签类型" min-width="160">
              <template #default="{ row }">
                {{ getBusinessLabel(row.businessType) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="尺寸" width="140">
              <template #default="{ row }">
                {{ formatPaperSize(row) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="默认" width="90" align="center">
              <template #default="{ row }">
                <ElTag :type="row.defaultTemplate ? 'success' : 'info'">{{ row.defaultTemplate ? '是' : '否' }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="启用状态" width="120" align="center">
              <template #default="{ row }">
                <ElSwitch
                  v-model="row.enabled"
                  inline-prompt
                  active-text="启用"
                  inactive-text="停用"
                  @change="value => updateTemplateStatus(row, value)"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="updateTime" label="更新时间" min-width="170" show-overflow-tooltip />
            <ElTableColumn label="操作" width="300" fixed="right" align="center">
              <template #default="{ row }">
                <ElButton size="small" type="primary" plain @click="designTemplate(row)">设计</ElButton>
                <ElButton size="small" @click="copyTemplate(row)">复制</ElButton>
                <ElButton
                  size="small"
                  :disabled="row.defaultTemplate || !row.enabled"
                  @click="setTemplateAsDefault(row)"
                >
                  设为默认
                </ElButton>
                <ElButton size="small" type="danger" plain @click="deleteTemplate(row)">删除</ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="label-designer__pagination">
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            @size-change="handleSearch"
            @current-change="loadTemplateList"
          />
        </div>
      </div>
    </ElCard>

    <template v-else>
      <ElCard class="card-wrapper">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-12px">
            <div>
              <p class="text-16px font-medium">模板设计</p>
              <p class="mt-4px text-12px text-gray-500">版式由 hiprint 维护，业务字段和打印数据由 WMS 标签打印维护</p>
            </div>
            <div class="flex flex-wrap items-center justify-end gap-10px">
              <ElButton @click="backToList">返回列表</ElButton>
              <ElButton @click="setCurrentAsDefault">设为默认</ElButton>
              <ElButton :disabled="!selectedTemplateId" type="danger" plain @click="deleteCurrentTemplate">
                删除
              </ElButton>
              <ElButton @click="loadBlankTemplate">清空画布</ElButton>
              <ElButton @click="loadJsonFromLocal">读取本地JSON</ElButton>
              <ElButton type="primary" :loading="saveLoading" @click="saveTemplateToBackend">保存模板</ElButton>
              <ElButton @click="openTemplatePreview">预览</ElButton>
              <ElButton type="success" @click="printByBrowser">
                <template #icon>
                  <icon-mdi-printer />
                </template>
                浏览器打印
              </ElButton>
            </div>
          </div>
        </template>

        <ElAlert v-if="hiprintError" :title="hiprintError" type="error" show-icon :closable="false" class="mb-12px" />

        <ElForm :model="templateForm" label-width="78px" class="label-template-form">
          <ElRow :gutter="12">
            <ElCol :xl="5" :lg="6" :md="8" :sm="12">
              <ElFormItem label="模板名称">
                <ElInput v-model="templateForm.templateName" placeholder="请输入模板名称" />
              </ElFormItem>
            </ElCol>
            <ElCol :xl="5" :lg="6" :md="8" :sm="12">
              <ElFormItem label="模板编码">
                <ElInput v-model="templateForm.templateCode" placeholder="请输入模板编码" />
              </ElFormItem>
            </ElCol>
            <ElCol :xl="4" :lg="5" :md="8" :sm="12">
              <ElFormItem label="标签类型">
                <ElSelect v-model="templateForm.businessType" class="w-full" @change="handleBusinessChange">
                  <ElOption
                    v-for="business in labelBusinessOptions"
                    :key="business.key"
                    :label="business.label"
                    :value="business.key"
                  />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :xl="4" :lg="5" :md="8" :sm="12">
              <ElFormItem label="纸张尺寸">
                <ElSelect v-model="selectedPaperKey" class="w-full" @change="handlePaperChange">
                  <ElOption v-for="paper in paperOptions" :key="paper.key" :label="paper.label" :value="paper.key" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol :xl="3" :lg="4" :md="8" :sm="12">
              <ElFormItem label="启用">
                <ElSwitch
                  v-model="templateForm.enabled"
                  inline-prompt
                  active-text="启用"
                  inactive-text="停用"
                  @change="handleEnabledChange"
                />
              </ElFormItem>
            </ElCol>
            <ElCol :xl="3" :lg="4" :md="8" :sm="12">
              <ElFormItem label="默认">
                <ElSwitch v-model="templateForm.defaultTemplate" inline-prompt active-text="是" inactive-text="否" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="24">
              <ElFormItem label="备注">
                <ElInput v-model="templateForm.remark" placeholder="请输入备注" />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>

        <div class="label-designer__meta">
          <ElTag type="info">{{ currentBusinessOption.label }}</ElTag>
          <ElTag :type="templateForm.defaultTemplate ? 'success' : 'info'">
            {{ templateForm.defaultTemplate ? '默认模板' : '普通模板' }}
          </ElTag>
          <ElTag>{{ currentPaper.width }}mm x {{ currentPaper.height }}mm</ElTag>
          <ElTag :type="hiprintReady ? 'success' : 'warning'">
            {{ hiprintReady ? '设计器已就绪' : '设计器初始化中' }}
          </ElTag>
        </div>
      </ElCard>

      <div class="label-designer__workspace sm:flex-1-hidden">
        <aside class="label-designer__panel label-designer__components">
          <div class="label-designer__panel-title">拖拽组件列表</div>
          <ElScrollbar>
            <div class="label-designer__component-section">
              <p class="label-designer__section-title">基础</p>
              <div class="label-designer__component-grid">
                <button
                  v-for="item in baseComponents"
                  :key="item.tid"
                  class="label-designer__component-card ep-draggable-item"
                  type="button"
                  :tid="item.tid"
                >
                  <span class="label-designer__component-icon">{{ item.iconText }}</span>
                  <span class="label-designer__component-name">{{ item.label }}</span>
                  <span class="label-designer__component-desc">{{ item.description }}</span>
                </button>
              </div>
            </div>

            <div class="label-designer__component-section">
              <p class="label-designer__section-title">辅助</p>
              <div class="label-designer__component-grid">
                <button
                  v-for="item in assistComponents"
                  :key="item.tid"
                  class="label-designer__component-card ep-draggable-item"
                  type="button"
                  :tid="item.tid"
                >
                  <span class="label-designer__component-icon">{{ item.iconText }}</span>
                  <span class="label-designer__component-name">{{ item.label }}</span>
                  <span class="label-designer__component-desc">{{ item.description }}</span>
                </button>
              </div>
            </div>
          </ElScrollbar>
        </aside>

        <main class="label-designer__canvas">
          <div class="label-designer__canvas-toolbar">
            <span>hiprint设计画布</span>
            <div class="hiprint-printPagination"></div>
          </div>
          <ElScrollbar class="label-designer__canvas-scroll">
            <div id="hiprint-printTemplate" class="label-designer__hiprint"></div>
          </ElScrollbar>
        </main>

        <aside class="label-designer__panel label-designer__settings">
          <ElTabs model-value="setting" class="h-full">
            <ElTabPane label="属性" name="setting">
              <ElScrollbar height="520px">
                <div id="PrintElementOptionSetting" class="label-designer__option-setting"></div>
              </ElScrollbar>
            </ElTabPane>
            <ElTabPane label="JSON" name="json">
              <div class="label-designer__json-actions">
                <ElButton size="small" @click="syncJsonFromDesigner">刷新JSON</ElButton>
                <ElButton size="small" type="primary" @click="applyJsonToDesigner">应用JSON</ElButton>
              </div>
              <ElInput v-model="designJsonText" type="textarea" :rows="22" resize="none" spellcheck="false" />
            </ElTabPane>
          </ElTabs>
        </aside>
      </div>

      <ElDialog
        v-model="previewVisible"
        title="模板预览"
        width="min(1100px, 92vw)"
        destroy-on-close
        append-to-body
        @opened="renderTemplatePreview"
      >
        <div v-loading="previewLoading" class="label-designer__preview-stage">
          <div id="label-template-preview" class="label-designer__preview-content"></div>
        </div>
      </ElDialog>
    </template>
  </div>
</template>

<style scoped>
.label-template-search {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.label-template-form {
  margin-bottom: 4px;
}

.label-designer__list-card {
  display: flex;
  min-height: 0;
  flex-direction: column;
}

.label-designer__list-card :deep(.el-card__header) {
  flex-shrink: 0;
}

.label-designer__list-card :deep(.el-card__body) {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.label-designer__list-body {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.label-designer__table-wrap {
  min-height: 320px;
  flex: 1;
}

.label-designer__pagination {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  margin-top: 12px;
}

.label-designer__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-designer__workspace {
  display: grid;
  flex: 1;
  min-height: 560px;
  grid-template-columns: 240px minmax(0, 1fr) 360px;
  align-items: stretch;
  gap: 16px;
}

.label-designer__panel,
.label-designer__canvas {
  min-height: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.label-designer__panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.label-designer__panel-title,
.label-designer__canvas-toolbar {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
}

.label-designer__component-section {
  padding: 12px;
}

.label-designer__component-section + .label-designer__component-section {
  border-top: 1px solid var(--el-border-color-lighter);
}

.label-designer__section-title {
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 700;
}

.label-designer__component-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.label-designer__component-card {
  display: grid;
  min-height: 92px;
  cursor: grab;
  place-items: center;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 10px 6px;
  background: var(--el-fill-color-lighter);
  color: var(--el-color-primary);
  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
}

.label-designer__component-card:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: 0 4px 12px rgb(64 112 255 / 12%);
}

.label-designer__component-icon {
  display: grid;
  min-width: 34px;
  min-height: 30px;
  place-items: center;
  font-family: Consolas, monospace;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.label-designer__component-name {
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.label-designer__component-desc {
  color: var(--el-text-color-secondary);
  font-size: 11px;
  line-height: 1.2;
}

.label-designer__canvas {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.label-designer__canvas-scroll {
  flex: 1;
  background: #eef0f4;
}

.label-designer__hiprint {
  min-height: 560px;
  padding: 24px;
}

.label-designer__settings {
  padding: 0 12px 12px;
}

.label-designer__option-setting {
  min-height: 480px;
  padding: 8px 0;
}

.label-designer__json-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

.label-designer__preview-stage {
  min-height: 420px;
  max-height: 72vh;
  overflow: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 24px;
  background: #eef0f4;
}

.label-designer__preview-content {
  display: flex;
  min-width: max-content;
  justify-content: center;
}

.label-designer__preview-content :deep(.hiprint-printPaper) {
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 8px 24px rgb(15 23 42 / 12%);
}

@media (max-width: 1280px) {
  .label-designer__workspace {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .label-designer__settings {
    grid-column: 1 / -1;
    min-height: 360px;
  }
}

@media (max-width: 768px) {
  .label-designer {
    overflow: auto;
  }

  .label-designer__workspace {
    grid-template-columns: 1fr;
  }
}
</style>
