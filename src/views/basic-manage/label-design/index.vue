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
  createDemoTemplate,
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

const storageKey = 'zanbo-wms-label-designer-generic-poc';

const selectedBusinessType = ref<Wms.Label.TemplateKey>('model1');
const selectedTemplateId = ref<number>();
const selectedPaperKey = ref<DesignerPaperKey>('label100x140');
const designJsonText = ref('');
const templateList = ref<Wms.Label.TemplateEntity[]>([]);
const templateLoading = ref(false);
const saveLoading = ref(false);
const hiprintReady = ref(false);
const hiprintError = ref('');
const hiprintTemplateRef = shallowRef<any>(null);

const templateForm = reactive({
  templateCode: createTemplateCode('model1'),
  templateName: createTemplateName('model1'),
  enabled: true,
  defaultTemplate: true,
  remark: ''
});

const baseComponents = computed(() => designerComponents.filter(item => item.group === 'base'));
const assistComponents = computed(() => designerComponents.filter(item => item.group === 'assist'));
const currentPaper = computed(() => getPaperOption(selectedPaperKey.value));
const currentBusinessOption = computed(() => getLabelBusinessOption(selectedBusinessType.value));
const currentTemplateRecord = computed(() => templateList.value.find(item => item.id === selectedTemplateId.value));

function getPaperKeyBySize(width: number, height: number) {
  return (
    paperOptions.find(item => Number(item.width) === Number(width) && Number(item.height) === Number(height))?.key ??
    currentBusinessOption.value.paperKey
  );
}

function resetTemplateForm() {
  selectedTemplateId.value = undefined;
  selectedPaperKey.value = currentBusinessOption.value.paperKey;
  templateForm.templateCode = createTemplateCode(selectedBusinessType.value);
  templateForm.templateName = createTemplateName(selectedBusinessType.value);
  templateForm.enabled = true;
  templateForm.defaultTemplate = templateList.value.length === 0;
  templateForm.remark = '';
}

function applyTemplateRecord(record: Wms.Label.TemplateEntity) {
  selectedTemplateId.value = record.id;
  selectedBusinessType.value = record.businessType;
  selectedPaperKey.value = getPaperKeyBySize(record.paperWidth, record.paperHeight);
  templateForm.templateCode = record.templateCode;
  templateForm.templateName = record.templateName;
  templateForm.enabled = record.enabled;
  templateForm.defaultTemplate = record.defaultTemplate;
  templateForm.remark = record.remark || '';
  designJsonText.value = JSON.stringify(record.templateJson, null, 2);
  mountHiprintDesigner(record.templateJson);
}

function getCurrentTemplateJson(): HiprintTemplateJson | Record<string, unknown> {
  if (!designJsonText.value) return createDemoTemplate(selectedPaperKey.value);

  try {
    return JSON.parse(designJsonText.value) as Record<string, unknown>;
  } catch {
    return createDemoTemplate(selectedPaperKey.value);
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

async function loadTemplateList(selectId?: number) {
  templateLoading.value = true;
  try {
    const { data: page, error } = await fetchGetLabelTemplatePage({
      current: 1,
      size: 100,
      businessType: selectedBusinessType.value
    });

    if (error || !page) return;

    templateList.value = page.records || [];

    const nextRecord =
      templateList.value.find(item => item.id === selectId) ??
      templateList.value.find(item => item.defaultTemplate) ??
      templateList.value[0];

    if (nextRecord) {
      applyTemplateRecord(nextRecord);
    } else {
      resetTemplateForm();
      loadDemoTemplate();
    }
  } finally {
    templateLoading.value = false;
  }
}

function loadDemoTemplate() {
  const json = createDemoTemplate(selectedPaperKey.value);

  designJsonText.value = JSON.stringify(json, null, 2);
  mountHiprintDesigner(json);
}

function loadBlankTemplate() {
  const json = createBlankTemplate(selectedPaperKey.value);

  designJsonText.value = JSON.stringify(json, null, 2);
  mountHiprintDesigner(json);
}

function createNewTemplate() {
  resetTemplateForm();
  loadDemoTemplate();
}

function handlePaperChange() {
  loadDemoTemplate();
}

function handleBusinessChange() {
  loadTemplateList();
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
      businessType: selectedBusinessType.value,
      paperWidth: currentPaper.value.width,
      paperHeight: currentPaper.value.height,
      templateJson,
      enabled: templateForm.enabled,
      defaultTemplate: templateForm.defaultTemplate,
      remark: templateForm.remark.trim()
    });

    if (error || !saved) return;

    window.$message?.success('标签模板已保存');
    await loadTemplateList(saved.id);
  } finally {
    saveLoading.value = false;
  }
}

async function deleteCurrentTemplate() {
  if (!selectedTemplateId.value) {
    window.$message?.warning('当前模板尚未保存');
    return;
  }

  await window.$messageBox?.confirm('确认删除当前标签模板？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  });

  const { error } = await fetchDeleteLabelTemplate(selectedTemplateId.value);

  if (error) return;

  window.$message?.success('标签模板已删除');
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
  await loadTemplateList(selectedTemplateId.value);
}

async function handleEnabledChange(enabled: boolean | string | number) {
  if (!selectedTemplateId.value) return;

  const { error } = await fetchUpdateLabelTemplateStatus({
    id: selectedTemplateId.value,
    enabled: Boolean(enabled)
  });

  if (error) return;

  await loadTemplateList(selectedTemplateId.value);
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
    <ElCard class="card-wrapper">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-12px">
          <div>
            <p class="text-16px font-medium">标签设计</p>
            <p class="mt-4px text-12px text-gray-500">
              独立版式设计器：版式由 hiprint 维护，业务字段和打印数据仍由 WMS 标签管理维护
            </p>
          </div>
          <div v-loading="templateLoading" class="flex flex-wrap items-center justify-end gap-10px">
            <ElSelect v-model="selectedBusinessType" class="w-180px" @change="handleBusinessChange">
              <ElOption
                v-for="business in labelBusinessOptions"
                :key="business.key"
                :label="business.label"
                :value="business.key"
              />
            </ElSelect>
            <ElSelect
              v-model="selectedTemplateId"
              class="w-220px"
              clearable
              placeholder="请选择模板"
              @change="id => currentTemplateRecord && applyTemplateRecord(currentTemplateRecord)"
            >
              <ElOption
                v-for="template in templateList"
                :key="template.id"
                :label="template.defaultTemplate ? `${template.templateName}（默认）` : template.templateName"
                :value="template.id"
              />
            </ElSelect>
            <ElInput v-model="templateForm.templateName" class="w-180px" placeholder="模板名称" />
            <ElInput v-model="templateForm.templateCode" class="w-180px" placeholder="模板编码" />
            <ElSelect v-model="selectedPaperKey" class="w-180px" @change="handlePaperChange">
              <ElOption v-for="paper in paperOptions" :key="paper.key" :label="paper.label" :value="paper.key" />
            </ElSelect>
            <ElSwitch
              v-model="templateForm.enabled"
              inline-prompt
              active-text="启用"
              inactive-text="停用"
              @change="handleEnabledChange"
            />
            <ElButton @click="createNewTemplate">新建模板</ElButton>
            <ElButton :disabled="!selectedTemplateId" @click="setCurrentAsDefault">设为默认</ElButton>
            <ElButton :disabled="!selectedTemplateId" type="danger" plain @click="deleteCurrentTemplate">删除</ElButton>
            <ElButton @click="loadDemoTemplate">恢复示例</ElButton>
            <ElButton @click="loadBlankTemplate">清空画布</ElButton>
            <ElButton @click="loadJsonFromLocal">读取本地JSON</ElButton>
            <ElButton type="primary" :loading="saveLoading" @click="saveTemplateToBackend">保存模板</ElButton>
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

      <div class="label-designer__meta">
        <ElTag type="info">{{ currentBusinessOption.label }}</ElTag>
        <ElTag :type="templateForm.defaultTemplate ? 'success' : 'info'">
          {{ templateForm.defaultTemplate ? '默认模板' : '普通模板' }}
        </ElTag>
        <ElTag>{{ templateList.length }} 个模板</ElTag>
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
  </div>
</template>

<style scoped>
.label-designer__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.label-designer__workspace {
  display: grid;
  min-height: 0;
  grid-template-columns: 240px minmax(0, 1fr) 360px;
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
