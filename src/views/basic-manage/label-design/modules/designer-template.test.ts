import assert from 'node:assert/strict';
import {
  createBlankTemplate,
  createDemoTemplate,
  createPrintSampleData,
  designerComponents,
  getPaperOption,
  paperOptions
} from './designer-template';

assert.equal(paperOptions.length >= 3, true);
assert.equal(getPaperOption('label100x140').width, 100);
assert.equal(getPaperOption('label100x140').height, 140);

assert.equal(
  designerComponents.some(component => component.tid === 'defaultModule.text' && component.label === '文本'),
  true
);
assert.equal(
  designerComponents.some(component => component.tid === 'defaultModule.barcode' && component.label === '条形码'),
  true
);
assert.equal(
  designerComponents.some(component => component.tid === 'defaultModule.qrcode' && component.label === '二维码'),
  true
);

const blankTemplate = createBlankTemplate('label80x80');

assert.equal(blankTemplate.panels[0].width, 80);
assert.equal(blankTemplate.panels[0].height, 80);
assert.equal(blankTemplate.panels[0].printElements.length, 0);

const demoTemplate = createDemoTemplate('label100x140');
const demoElements = demoTemplate.panels[0].printElements;

assert.equal(demoTemplate.panels[0].width, 100);
assert.equal(demoTemplate.panels[0].height, 140);
assert.equal(
  demoElements.some(element => element.tid === 'defaultModule.text'),
  true
);
assert.equal(
  demoElements.some(element => element.tid === 'defaultModule.barcode' && element.options.textType === 'barcode'),
  true
);
assert.equal(
  demoElements.some(element => element.tid === 'defaultModule.qrcode' && element.options.textType === 'qrcode'),
  true
);
assert.equal(
  demoElements.some(
    element => JSON.stringify(element).includes('materialCode') || JSON.stringify(element).includes('batchCode')
  ),
  false
);

const printData = createPrintSampleData();

assert.equal(printData.barcode, '1234567890');
assert.match(String(printData.qrcode), /vue-plugin-hiprint/);
