import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const componentPath = fileURLToPath(new URL('./table-header-operation.vue', import.meta.url));
const source = readFileSync(componentPath, 'utf-8');

assert.match(source, /showDefaultActions\?: boolean/);
assert.match(source, /withDefaults\(defineProps<Props>\(\),\s*\{\s*showDefaultActions:\s*false/s);
assert.match(source, /<slot[^>]*v-if="\$slots\.default \|\| showDefaultActions"[^>]*name="default"[^>]*>/);
