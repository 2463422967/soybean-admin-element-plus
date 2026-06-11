import { request } from '../request';

/** get warehouse list */
export function fetchGetWarehouseList(params: Wms.BaseInfo.WarehouseSearchParams) {
  return request<Wms.BaseInfo.WarehouseList>({
    url: '/baseInfo/findStockList',
    method: 'post',
    data: params
  });
}

/** get position list */
export function fetchGetPositionList(params: Wms.BaseInfo.PositionSearchParams) {
  return request<Wms.BaseInfo.PositionList>({
    url: '/baseInfo/findPositionList',
    method: 'post',
    data: params
  });
}

/** get material list */
export function fetchGetMaterialList(params: Wms.BaseInfo.MaterialSearchParams) {
  return request<Wms.BaseInfo.MaterialList>({
    url: '/baseInfo/findMaterialList',
    method: 'post',
    data: params
  });
}

/** get shelf list */
export function fetchGetShelfList(params: Wms.BaseInfo.ShelfSearchParams) {
  return request<Wms.BaseInfo.ShelfList>({
    url: '/shelf/pageList',
    method: 'post',
    data: params
  });
}

/** get user list */
export function fetchGetBaseInfoUserList(params: Wms.BaseInfo.UserSearchParams) {
  return request<Wms.BaseInfo.UserList>({
    url: '/user/pageUserList',
    method: 'post',
    data: params
  });
}

/** get role list */
export function fetchGetBaseInfoRoleList(params: Wms.BaseInfo.RoleSearchParams) {
  return request<Wms.BaseInfo.RoleList>({
    url: '/role/pageRoleList',
    method: 'post',
    data: params
  });
}

/** get app version list */
export function fetchGetAppVersionList(params: Wms.BaseInfo.AppVersionSearchParams) {
  return request<Wms.BaseInfo.AppVersionList>({
    url: '/app/findAppManagementPage',
    method: 'post',
    data: params
  });
}
