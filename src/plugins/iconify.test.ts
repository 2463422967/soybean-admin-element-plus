import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { iconLoaded } from '@iconify/vue';
import { LOCAL_ICONIFY_COLLECTION_PREFIXES, setupLocalIconifyCollections } from './iconify';

const rootPath = process.cwd();
const iconNamePattern = /["']([a-z0-9-]+:[a-z0-9][a-z0-9-]*)["']/gi;
const envIconNamePattern = /\b([a-z0-9-]+:[a-z0-9][a-z0-9-]*)\b/gi;

function collectIconsFromText(text: string, pattern: RegExp, icons: Set<string>) {
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    icons.add(match[1]);
  }
}

function collectIconsFromDirectory(dirPath: string, icons: Set<string>) {
  readdirSync(dirPath, { withFileTypes: true }).forEach(entry => {
    const filePath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'typings') {
        collectIconsFromDirectory(filePath, icons);
      }
      return;
    }

    if (/\.(ts|vue)$/.test(entry.name)) {
      collectIconsFromText(readFileSync(filePath, 'utf-8'), iconNamePattern, icons);
    }
  });
}

function collectProjectDynamicIcons() {
  const icons = new Set<string>();

  collectIconsFromDirectory(join(rootPath, 'src'), icons);

  ['.env', '.env.test', '.env.prod'].forEach(file => {
    const filePath = join(rootPath, file);
    if (existsSync(filePath)) {
      collectIconsFromText(readFileSync(filePath, 'utf-8'), envIconNamePattern, icons);
    }
  });

  return [...icons].filter(icon => LOCAL_ICONIFY_COLLECTION_PREFIXES.includes(icon.split(':')[0]));
}

setupLocalIconifyCollections();

assert.ok(LOCAL_ICONIFY_COLLECTION_PREFIXES.includes('mdi'));
assert.ok(LOCAL_ICONIFY_COLLECTION_PREFIXES.includes('carbon'));
assert.ok(LOCAL_ICONIFY_COLLECTION_PREFIXES.includes('ant-design'));
assert.equal(iconLoaded('mdi:menu'), true);
assert.equal(iconLoaded('carbon:data-base'), true);
assert.equal(iconLoaded('ant-design:close-outlined'), true);
assert.equal(iconLoaded('line-md:loading-twotone-loop'), true);
assert.equal(iconLoaded('logos:vue'), true);

collectProjectDynamicIcons().forEach(icon => {
  assert.equal(iconLoaded(icon), true, `${icon} should be registered locally`);
});
