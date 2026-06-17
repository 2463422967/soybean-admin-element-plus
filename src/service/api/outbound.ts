import { request } from '../request';

const pendingApiMap: Record<Wms.Outbound.OutboundType, string> = {
  sales: '/outbound/findShippingAdviceList',
  purchase_return: '/outbound/findPurchaseReturnList',
  production_picking: '/outbound/findMaterialRequisitionList',
  production_supplement: '/outbound/findProductionReturnList',
  subcontract_picking: '/outbound/findOutsourcedMaterialRequisitionList',
  subcontract_supplement: '/outbound/findOutsourcedReturnMaterialList',
  other: '/outbound/findOtherOutBoundList'
};

const recentApiMap: Record<Wms.Outbound.OutboundType, string> = {
  sales: '/outbound/findPickRecordList',
  purchase_return: '/outbound/findPickRecordListByPurchaseReturn',
  production_picking: '/outbound/findPickRecordListByMaterialRequisition',
  production_supplement: '/outbound/findPickRecordListByProductionReturn',
  subcontract_picking: '/outbound/findPickRecordListByOutsourcedMaterialRequisition',
  subcontract_supplement: '/outbound/findPickRecordListByOutsourcedReturnMaterial',
  other: '/outbound/findPickRecordListByOtherOutBound'
};

export function fetchGetOutboundList(
  type: Wms.Outbound.OutboundType,
  listTab: Wms.Outbound.ListTab,
  params: Wms.Outbound.SearchParams
) {
  return request<Wms.Outbound.ItemList>({
    url: listTab === 'pendingTasks' ? pendingApiMap[type] : recentApiMap[type],
    method: 'post',
    data: listTab === 'pendingTasks' ? { ...params, itCompleted: false } : params
  });
}
