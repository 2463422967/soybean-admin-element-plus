import { request } from '../request';

/** get inventory list */
export function fetchGetInventoryList(params: Wms.Inventory.SearchParams) {
  return request<Wms.Inventory.InventoryList>({
    url: '/inventory/findInventoryList',
    method: 'post',
    data: params
  });
}

/** get inventory warning list */
export function fetchGetInventoryWarningList(params: Wms.Inventory.SearchParams) {
  return request<Wms.Inventory.WarningList>({
    url: '/inventory/findInventoryListByWarning',
    method: 'post',
    data: params
  });
}
