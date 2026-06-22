import assert from 'node:assert/strict';
import { labelPrintStyle } from './label-print';

assert.match(labelPrintStyle, /#label-print-area/);
assert.match(labelPrintStyle, /position:\s*static\s*!important/);
assert.match(labelPrintStyle, /left:\s*0\s*!important/);
assert.match(labelPrintStyle, /overflow:\s*visible\s*!important/);
