import { request } from '../request';

const unReceiveApiMap: Record<Wms.Receiving.ReceiveType, string> = {
  procurement: '/order/findPurchaseOrderList',
  production: '/order/findProductionOrderList',
  sales_return: '/order/findReturnNoticeList',
  production_return: '/order/findProductionReturnList',
  outsourcing_return: '/order/findOutsourceReturnList',
  other_return: '/order/findOtherOutStoreList'
};

const recentReceiveApiMap: Record<Wms.Receiving.ReceiveType, string> = {
  procurement: '/order/findMaterialReceiptNoticeList',
  production: '/order/findProductionReportList',
  sales_return: '/order/findSaleReturnLastReceiveList',
  production_return: '/order/findProductionReturnLastReceiveList',
  outsourcing_return: '/order/findOutsourceReturnLastReceiveList',
  other_return: '/order/findOtherOutStoreLastReceiveList'
};

export function fetchGetReceivingList(
  type: Wms.Receiving.ReceiveType,
  listTab: Wms.Receiving.ListTab,
  params: Wms.Receiving.SearchParams
) {
  return request<Wms.Receiving.ItemList>({
    url: listTab === 'unReceive' ? unReceiveApiMap[type] : recentReceiveApiMap[type],
    method: 'post',
    data: params
  });
}

export function fetchUpdatePrintStatus(entryIds: number[]) {
  return request<unknown>({
    url: '/order/updatePrintStatus',
    method: 'post',
    data: entryIds
  });
}
