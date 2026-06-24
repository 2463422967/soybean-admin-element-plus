import assert from 'node:assert/strict';
import {
  createBusinessHiprintTemplate,
  createHiprintPrintPageStyle,
  normalizeHiprintTemplateForPrint,
  resolvePrintableHiprintTemplate
} from './label-hiprint-template';
import { getLabelTemplate } from './label-templates';

const rawTemplate = createBusinessHiprintTemplate(getLabelTemplate('model3'));
const rawPanel = rawTemplate.panels[0];
const rawElements = rawPanel.printElements;

assert.equal(rawPanel.width, 80);
assert.equal(rawPanel.height, 80);
assert.equal(rawPanel.paperHeader, 0);
assert.equal(rawPanel.paperFooter, 226.8);

assert.equal(
  rawElements.some(
    element =>
      element.tid === 'defaultModule.qrcode' &&
      element.options.field === 'qrcode' &&
      element.options.textType === 'qrcode'
  ),
  true
);
assert.equal(
  rawElements.some(
    element => element.tid === 'defaultModule.text' && String(element.options.title).includes('物料料号')
  ),
  true
);
assert.equal(
  rawElements.some(element => element.tid === 'defaultModule.image' && String(element.options.src).includes('LOGO')),
  true
);
assert.equal(
  rawElements.some(
    element => element.tid === 'defaultModule.text' && element.options.title === '厦门康勃医疗科技有限公司'
  ),
  true
);
assert.equal(
  rawElements.some(element => element.tid === 'defaultModule.rect'),
  false
);
assert.equal(
  rawElements.some(element => element.tid === 'defaultModule.text' && element.options.field === 'materialCode'),
  true
);
assert.equal(
  rawElements.some(element => element.tid === 'defaultModule.text' && String(element.options.title).includes('供应商')),
  true
);
assert.equal(
  rawElements.some(element => 'printElementType' in element),
  false
);

const normalized = normalizeHiprintTemplateForPrint({
  panels: [
    {
      index: 0,
      name: '旧模板',
      width: 80,
      height: 80,
      paperHeader: 0,
      paperFooter: 226.8,
      printElements: [
        {
          tid: 'defaultModule.qrcode',
          options: { field: 'qrcode', title: 'qrcode', textType: 'qrcode' }
        },
        {
          options: { field: 'barcode', title: 'barcode', textType: 'barcode' },
          printElementType: { type: 'barcode', title: '条形码' }
        }
      ]
    }
  ]
});

const normalizedElements = normalized.panels[0].printElements;

assert.equal(normalizedElements[0].tid, 'defaultModule.qrcode');
assert.equal(normalizedElements[0].options.textType, 'qrcode');
assert.equal(normalizedElements[0].options.title, '');
assert.equal(normalizedElements[0].options.hideTitle, true);
assert.equal(normalizedElements[1].tid, 'defaultModule.barcode');
assert.equal(normalizedElements[1].options.textType, 'barcode');
assert.equal(normalizedElements[1].options.title, '');
assert.equal(normalizedElements[1].options.hideTitle, true);
assert.equal(
  normalizedElements.some(element => 'printElementType' in element),
  false
);

const normalizedLegacyText = normalizeHiprintTemplateForPrint({
  panels: [
    {
      index: 0,
      name: '旧文本模板',
      width: 100,
      height: 140,
      paperHeader: 0,
      paperFooter: 396.9,
      printElements: [
        {
          options: { field: 'materialCode', title: '文本', left: 10, top: 10, width: 40, height: 8 },
          printElementType: { type: 'text', title: '文本' }
        }
      ]
    }
  ]
});

assert.equal(normalizedLegacyText.panels[0].printElements[0].tid, 'defaultModule.text');
assert.equal(normalizedLegacyText.panels[0].printElements[0].options.field, 'materialCode');
assert.equal('printElementType' in normalizedLegacyText.panels[0].printElements[0], false);

const resolvedSystemRawTemplate = resolvePrintableHiprintTemplate(
  {
    id: 1,
    templateCode: 'model3-default',
    templateName: '原材料标签默认模板',
    businessType: 'model3',
    paperWidth: 80,
    paperHeight: 80,
    templateJson: {
      panels: [
        {
          index: 0,
          name: '数据库默认模板',
          width: 80,
          height: 80,
          paperHeader: 0,
          paperFooter: 226.8,
          printElements: [{ tid: 'defaultModule.rect', options: { left: 1, top: 1, width: 10, height: 10 } }]
        }
      ]
    },
    enabled: true,
    defaultTemplate: true
  },
  getLabelTemplate('model3')
);

assert.equal(
  resolvedSystemRawTemplate.panels[0].printElements.some(element => element.tid === 'defaultModule.rect'),
  false
);

const customRawTemplate = resolvePrintableHiprintTemplate(
  {
    id: 2,
    templateCode: 'custom-model3',
    templateName: '自定义原材料标签',
    businessType: 'model3',
    paperWidth: 80,
    paperHeight: 80,
    templateJson: {
      panels: [
        {
          index: 0,
          name: '自定义模板',
          width: 80,
          height: 80,
          paperHeader: 0,
          paperFooter: 226.8,
          printElements: [{ tid: 'defaultModule.rect', options: { left: 1, top: 1, width: 10, height: 10 } }]
        }
      ]
    },
    enabled: true,
    defaultTemplate: true
  },
  getLabelTemplate('model3')
);

assert.equal(
  customRawTemplate.panels[0].printElements.some(element => element.tid === 'defaultModule.rect'),
  true
);

assert.match(createHiprintPrintPageStyle(rawTemplate), /@page\s*\{\s*size:\s*80mm 80mm;\s*margin:\s*0;/);
