import { request } from '../request';

export function fetchGetStockCountHeaderList(params: Wms.StockCount.HeaderSearchParams) {
  return request<Wms.StockCount.HeaderList>({
    url: '/baseInfo/findInventoryCountVOByHeaderVO',
    method: 'post',
    data: params
  });
}

export function fetchGetStockCountBodyList(params: Wms.StockCount.BodySearchParams) {
  return request<Wms.StockCount.BodyList>({
    url: '/baseInfo/findInventoryCountVOByBodyVO',
    method: 'post',
    data: params
  });
}
