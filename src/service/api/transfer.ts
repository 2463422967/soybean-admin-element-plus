import { request } from '../request';

export function fetchGetTransferList(params: Wms.Transfer.SearchParams) {
  return request<Wms.Transfer.ItemList>({
    url: '/transfer/findTransferList',
    method: 'post',
    data: params
  });
}
