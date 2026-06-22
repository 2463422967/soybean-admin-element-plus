import { addAPIProvider, addCollection } from '@iconify/vue';
import { localIconifyCollections } from './iconify-local-collections';

type IconifyCollection = Parameters<typeof addCollection>[0];

const iconifyCollections = localIconifyCollections as unknown as IconifyCollection[];

export const LOCAL_ICONIFY_COLLECTION_PREFIXES = iconifyCollections.map(collection => collection.prefix);

export function setupLocalIconifyCollections() {
  iconifyCollections.forEach(collection => {
    addCollection(collection);
  });
}

/** Setup the iconify offline */
export function setupIconifyOffline() {
  setupLocalIconifyCollections();

  const { VITE_ICONIFY_URL } = import.meta.env;

  if (VITE_ICONIFY_URL) {
    addAPIProvider('', { resources: [VITE_ICONIFY_URL] });
  }
}
