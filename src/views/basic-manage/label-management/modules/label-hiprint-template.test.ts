import assert from 'node:assert/strict';
import { createHiprintPrintPageStyle, resolvePrintableHiprintTemplate } from './label-hiprint-template';

const templateJson = {
  panels: [
    {
      index: 0,
      name: '原材料标签',
      width: 80,
      height: 80,
      paperHeader: 0,
      paperFooter: 226.8,
      printElements: [
        { tid: 'defaultModule.text', options: { field: 'materialCode', left: 1, top: 1, width: 10, height: 8 } }
      ]
    }
  ]
};

const resolvedTemplate = resolvePrintableHiprintTemplate({
  id: 1,
  templateCode: 'model3-default',
  templateName: '原材料标签默认模板',
  businessType: 'model3',
  paperWidth: 80,
  paperHeight: 80,
  templateJson,
  enabled: true,
  defaultTemplate: true
});

assert.equal(resolvedTemplate.panels[0].printElements[0].tid, 'defaultModule.text');
assert.equal(resolvedTemplate.panels[0].printElements[0].options.field, 'materialCode');
assert.match(createHiprintPrintPageStyle(resolvedTemplate), /@page\s*\{\s*size:\s*80mm 80mm;\s*margin:\s*0;/);
