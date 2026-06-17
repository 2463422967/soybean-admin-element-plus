import { request } from '../request';

const inStoreApiMap: Record<Wms.InStore.InStoreType, string> = {
  procurement: '/inStore/findPurchaseInStoreList',
  production: '/inStore/findProductionInStoreList',
  sales_return: '/inStore/findSaleReturnInStoreList',
  production_return: '/inStore/findProductionReturnList',
  outsourcing_return: '/inStore/findOutboundReturnList',
  other_in: '/inStore/findOtherInStoreList',
  other_out: '/inStore/findOtherOutStoreList'
};

/** get inbound operation list by business type */
export function fetchGetInStoreList(type: Wms.InStore.InStoreType, params: Wms.InStore.SearchParams) {
  return request<Wms.InStore.ItemList>({
    url: inStoreApiMap[type],
    method: 'post',
    data: params
  });
}
