import assert from 'node:assert/strict';
import { buildShelfQrText } from './shelf-qrcode';

const qrText = buildShelfQrText({
  id: 12,
  shelfCode: 'YCLHJ01',
  shelfName: '原材料货架01'
});

assert.equal(qrText, JSON.stringify({ c: 12, n: '原材料货架01', sc: 'YCLHJ01' }));
