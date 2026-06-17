import { request } from '../request';

/** get pending putaway assignment list */
export function fetchGetListingAssignmentList(params: Wms.ListingAssignment.SearchParams) {
  return request<Wms.ListingAssignment.ItemList>({
    url: '/listingAssignment/findListingAssignmentList',
    method: 'post',
    data: params
  });
}

/** get completed putaway assignment list */
export function fetchGetListingCompletedList(params: Wms.ListingAssignment.SearchParams) {
  return request<Wms.ListingAssignment.ItemList>({
    url: '/listingAssignment/findListingCompletedList',
    method: 'post',
    data: params
  });
}
