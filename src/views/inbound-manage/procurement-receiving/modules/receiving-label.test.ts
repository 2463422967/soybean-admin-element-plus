import assert from 'node:assert/strict';
import { buildRawMaterialLabelFormData } from './receiving-label';

const formData = buildRawMaterialLabelFormData({
  entryId: 2067175966366498800,
  materialCode: '8.12.999998',
  materialName: '模具修模（通用）',
  batchNo: '44',
  productionDate: '2026-06-18',
  receiveQty: 1,
  supplierName: '供应商332'
});

assert.deepEqual(formData, {
  materialCode: '8.12.999998',
  batchCode: '44',
  productionDate: '2026-06-18',
  supplier: '供应商332'
});

assert.equal('quantity' in formData, false);
