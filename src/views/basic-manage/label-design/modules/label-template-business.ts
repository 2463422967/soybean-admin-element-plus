import { labelTemplates } from '../../label-management/modules/label-templates';
import type { DesignerPaperKey } from './designer-template';

export interface LabelBusinessOption {
  key: Wms.Label.TemplateKey;
  label: string;
  paperKey: DesignerPaperKey;
}

const paperKeyMap: Record<Wms.Label.TemplateKey, DesignerPaperKey> = {
  model1: 'label100x140',
  model2: 'label80x80',
  model3: 'label80x80',
  model4: 'label80x80'
};

export const labelBusinessOptions: LabelBusinessOption[] = labelTemplates.map(template => ({
  key: template.key,
  label: template.label,
  paperKey: paperKeyMap[template.key]
}));

export function getLabelBusinessOption(key: Wms.Label.TemplateKey) {
  return labelBusinessOptions.find(item => item.key === key) ?? labelBusinessOptions[0];
}

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

export function createTemplateCode(date = new Date()) {
  const stamp = [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
    padNumber(date.getHours()),
    padNumber(date.getMinutes()),
    padNumber(date.getSeconds())
  ].join('');

  return `label-${stamp}`;
}

export function createTemplateName() {
  return '新建标签模板';
}
