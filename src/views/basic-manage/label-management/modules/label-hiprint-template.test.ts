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
const materialNameValueElement = rawElements.find(
  element => element.tid === 'defaultModule.text' && element.options.field === 'materialName'
);
const qrcodeElement = rawElements.find(element => element.tid === 'defaultModule.qrcode');
const titleElement = rawElements.find(
  element => element.tid === 'defaultModule.text' && element.options.title === '产品标识卡'
);

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
assert.equal(qrcodeElement?.options.left, 158);
assert.equal(qrcodeElement?.options.width, 52);
assert.equal(titleElement?.options.left, 82);
assert.equal(titleElement?.options.fontSize, 20);
assert.equal(materialNameValueElement?.options.left, 92);
assert.equal(materialNameValueElement?.options.top, 67);
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

const semiTemplate = createBusinessHiprintTemplate(getLabelTemplate('model2'));
const semiElements = semiTemplate.panels[0].printElements;
const semiQrcodeElement = semiElements.find(element => element.tid === 'defaultModule.qrcode');
const semiMaterialNameElement = semiElements.find(
  element => element.tid === 'defaultModule.text' && element.options.field === 'materialName'
);

assert.equal(semiTemplate.panels[0].width, 80);
assert.equal(semiTemplate.panels[0].height, 80);
assert.equal(semiQrcodeElement?.options.left, 158);
assert.equal(semiQrcodeElement?.options.width, 52);
assert.equal(semiMaterialNameElement?.options.left, 92);
assert.equal(semiMaterialNameElement?.options.top, 67);
assert.equal(
  semiElements.some(element => element.tid === 'defaultModule.rect'),
  false
);
assert.equal(
  semiElements.some(element => element.tid === 'defaultModule.text' && element.options.field === 'worker'),
  true
);
assert.equal(
  semiElements.some(element => element.tid === 'defaultModule.text' && element.options.field === 'inspector'),
  true
);

const siliconeTemplate = createBusinessHiprintTemplate(getLabelTemplate('model4'));
const siliconeElements = siliconeTemplate.panels[0].printElements;
const siliconeQrcodeElement = siliconeElements.find(element => element.tid === 'defaultModule.qrcode');
const siliconeMaterialNameElement = siliconeElements.find(
  element => element.tid === 'defaultModule.text' && element.options.field === 'materialName'
);

assert.equal(siliconeTemplate.panels[0].width, 80);
assert.equal(siliconeTemplate.panels[0].height, 80);
assert.equal(siliconeQrcodeElement?.options.left, 158);
assert.equal(siliconeQrcodeElement?.options.width, 52);
assert.equal(siliconeMaterialNameElement?.options.left, 92);
assert.equal(siliconeMaterialNameElement?.options.top, 67);
assert.equal(
  siliconeElements.some(element => element.tid === 'defaultModule.rect'),
  false
);
assert.equal(
  siliconeElements.some(element => element.tid === 'defaultModule.text' && element.options.field === 'materialCode'),
  false
);
assert.equal(
  siliconeElements.some(element => element.tid === 'defaultModule.text' && element.options.field === 'checkResult'),
  true
);
assert.equal(
  siliconeElements.some(
    element => element.tid === 'defaultModule.text' && String(element.options.title).includes('校验结果/校验员')
  ),
  false
);
assert.equal(
  siliconeElements.some(element => element.tid === 'defaultModule.text' && element.options.title === '校验员:'),
  true
);

const finishedTemplate = createBusinessHiprintTemplate(getLabelTemplate('model1'));
const finishedElements = finishedTemplate.panels[0].printElements;
const finishedQrcodeElement = finishedElements.find(element => element.tid === 'defaultModule.qrcode');
const finishedTitleElement = finishedElements.find(
  element => element.tid === 'defaultModule.text' && element.options.title === '成品标识卡'
);
const finishedMaterialNameElement = finishedElements.find(
  element => element.tid === 'defaultModule.text' && element.options.field === 'materialName'
);

assert.equal(finishedTemplate.panels[0].width, 100);
assert.equal(finishedTemplate.panels[0].height, 140);
assert.equal(finishedTemplate.panels[0].paperFooter, 396.9);
assert.equal(finishedQrcodeElement?.options.left, 210);
assert.equal(finishedQrcodeElement?.options.width, 64);
assert.equal(finishedTitleElement?.options.left, 94);
assert.equal(finishedTitleElement?.options.fontSize, 22);
assert.equal(finishedMaterialNameElement?.options.left, 102);
assert.equal(finishedMaterialNameElement?.options.top, 95);
assert.equal(
  finishedElements.some(element => element.tid === 'defaultModule.rect'),
  false
);
assert.equal(
  finishedElements.some(element => element.tid === 'defaultModule.text' && element.options.field === 'checkResult'),
  true
);
assert.equal(
  finishedElements.some(
    element => element.tid === 'defaultModule.text' && String(element.options.title).includes('校验结果/校验员')
  ),
  false
);
assert.equal(
  finishedElements.some(element => element.tid === 'defaultModule.text' && element.options.title === '校验员:'),
  true
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
  true
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
