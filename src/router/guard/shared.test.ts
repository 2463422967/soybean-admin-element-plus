import assert from 'node:assert/strict';
import { resolveAuthorizedHomeRedirect } from './shared';

assert.equal(
  resolveAuthorizedHomeRedirect({
    authorizedHome: 'basic-manage_label-management',
    configuredHome: 'home',
    configuredHomePath: '/home',
    currentPath: '/home'
  }),
  'basic-manage_label-management'
);

assert.equal(
  resolveAuthorizedHomeRedirect({
    authorizedHome: 'basic-manage_label-management',
    configuredHome: 'home',
    configuredHomePath: '/home',
    currentPath: '/manage/user'
  }),
  null
);
assert.equal(
  resolveAuthorizedHomeRedirect({
    authorizedHome: 'home',
    configuredHome: 'home',
    configuredHomePath: '/home',
    currentPath: '/home'
  }),
  null
);
