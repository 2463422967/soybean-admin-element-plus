<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import QRCode from 'qrcode';
import { buildLabelQrText, createLabelIdentity } from './label-qrcode';

defineOptions({ name: 'LabelPreview' });

const props = defineProps<{
  template: Wms.Label.TemplateConfig;
  formData: Wms.Label.FormData;
}>();

const identity = ref(createLabelIdentity());
const qrCodeUrl = ref('');

const qrText = computed(() => buildLabelQrText(props.formData, identity.value));

watch(
  qrText,
  async value => {
    qrCodeUrl.value = await QRCode.toDataURL(value, {
      errorCorrectionLevel: 'H',
      margin: 0,
      width: 96
    });
  },
  { immediate: true }
);

function getValue(field: Wms.Label.FieldConfig) {
  const value = props.formData[field.prop];

  return value === undefined || value === null || value === '' ? ' ' : String(value);
}
</script>

<template>
  <div class="label-preview" :class="[template.sizeClass, `label-template-${template.key}`]">
    <div class="label-preview__header">
      <div>
        <p class="label-preview__company">赞伯WMS标签</p>
        <p class="label-preview__title">{{ template.title }}</p>
      </div>
      <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="标签二维码" class="label-preview__qr" />
    </div>

    <div class="label-preview__body">
      <div v-for="field in template.printFields" :key="field.prop" class="label-preview__row">
        <span class="label-preview__label">{{ field.label }}</span>
        <span class="label-preview__value">{{ getValue(field) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.label-preview {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #111827;
  background: #fff;
  color: #111827;
  break-after: page;
  page-break-after: always;
}

.label-size-finished {
  width: 100mm;
  min-height: 140mm;
  padding: 8mm;
}

.label-size-small {
  width: 80mm;
  min-height: 80mm;
  padding: 5mm;
}

.label-preview__header {
  display: flex;
  min-height: 24mm;
  align-items: flex-start;
  justify-content: space-between;
  gap: 5mm;
  border-bottom: 1px solid #111827;
  padding-bottom: 4mm;
}

.label-preview__company {
  margin: 0 0 2mm;
  font-size: 12px;
  font-weight: 700;
}

.label-preview__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.label-preview__qr {
  width: 24mm;
  height: 24mm;
  flex: 0 0 auto;
}

.label-preview__body {
  display: grid;
  grid-template-columns: 1fr;
  padding-top: 4mm;
}

.label-preview__row {
  display: grid;
  min-height: 9mm;
  grid-template-columns: 30mm minmax(0, 1fr);
  border-right: 1px solid #111827;
  border-bottom: 1px solid #111827;
  border-left: 1px solid #111827;
  font-size: 14px;
}

.label-preview__row:first-child {
  border-top: 1px solid #111827;
}

.label-preview__label,
.label-preview__value {
  display: flex;
  min-width: 0;
  align-items: center;
  padding: 1.5mm 2mm;
  overflow-wrap: anywhere;
}

.label-preview__label {
  border-right: 1px solid #111827;
  font-weight: 700;
}

.label-template-model4 .label-preview__row,
.label-template-model2 .label-preview__row,
.label-template-model3 .label-preview__row {
  min-height: 7mm;
  grid-template-columns: 24mm minmax(0, 1fr);
  font-size: 12px;
}

.label-template-model4 .label-preview__title,
.label-template-model2 .label-preview__title,
.label-template-model3 .label-preview__title {
  font-size: 18px;
}

@media print {
  .label-preview {
    box-shadow: none;
  }
}
</style>
