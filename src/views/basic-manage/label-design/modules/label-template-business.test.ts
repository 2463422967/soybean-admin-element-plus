import assert from 'node:assert/strict';
import {
  createTemplateCode,
  createTemplateName,
  getLabelBusinessOption,
  labelBusinessOptions
} from './label-template-business';

assert.equal(labelBusinessOptions.length >= 4, true);
assert.equal(getLabelBusinessOption('model1').label, '成品标识卡');

const code = createTemplateCode();

assert.match(code, /^label-\d{14}$/);
assert.notEqual(code, 'model1-default');
assert.equal(createTemplateName(), '新建标签模板');
