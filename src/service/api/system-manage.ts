import { request } from '../request';

/** get user list */
export function fetchGetUserList(data?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/system/user/page',
    method: 'post',
    data
  });
}

/** get ERP user list for system user import */
export function fetchGetSystemErpUserList(data?: Api.SystemManage.ErpUserSearchParams) {
  return request<Api.SystemManage.ErpUserList>({
    url: '/system/user/erp-page',
    method: 'post',
    data
  });
}

/** import users from ERP */
export function fetchImportUsers(data: Api.SystemManage.ImportUser[]) {
  return request<boolean>({
    url: '/system/user/import',
    method: 'post',
    data
  });
}

/** update user roles */
export function fetchUpdateUserRoles(data: Api.SystemManage.UpdateUserRolesParams) {
  return request<boolean>({
    url: '/system/user/roles',
    method: 'post',
    data
  });
}

/** update user password */
export function fetchUpdateUserPassword(data: Api.SystemManage.UpdateUserPasswordParams) {
  return request<boolean>({
    url: '/system/user/password',
    method: 'post',
    data
  });
}

/** update user status */
export function fetchUpdateUserStatus(data: Api.SystemManage.UpdateUserStatusParams) {
  return request<boolean>({
    url: '/system/user/status',
    method: 'post',
    data
  });
}

/** get role list */
export function fetchGetRoleList(data?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/system/role/page',
    method: 'post',
    data
  });
}

/** get all enabled roles */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/system/role/list',
    method: 'get'
  });
}

/** get role info */
export function fetchGetRoleInfo(id: Api.SystemManage.Id) {
  return request<Api.SystemManage.Role>({
    url: `/system/role/info/${id}`,
    method: 'get'
  });
}

/** add role */
export function fetchAddRole(data: Api.SystemManage.SaveRoleParams) {
  return request<boolean>({
    url: '/system/role/add',
    method: 'post',
    data
  });
}

/** update role */
export function fetchUpdateRole(data: Api.SystemManage.UpdateRoleParams) {
  return request<boolean>({
    url: '/system/role/update',
    method: 'post',
    data
  });
}

/** delete role */
export function fetchDeleteRole(id: Api.SystemManage.Id) {
  return request<boolean>({
    url: `/system/role/delete/${id}`,
    method: 'post'
  });
}

/** update role menus */
export function fetchUpdateRoleMenus(data: Api.SystemManage.UpdateRoleMenusParams) {
  return request<boolean>({
    url: '/system/role/menus',
    method: 'post',
    data
  });
}

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.MenuList>({
    url: '/system/menu/list',
    method: 'get'
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/system/menu/tree',
    method: 'get'
  });
}

/** add menu */
export function fetchAddMenu(data: Api.SystemManage.SaveMenuParams) {
  return request<boolean>({
    url: '/system/menu/add',
    method: 'post',
    data
  });
}

/** update menu */
export function fetchUpdateMenu(data: Api.SystemManage.UpdateMenuParams) {
  return request<boolean>({
    url: '/system/menu/update',
    method: 'post',
    data
  });
}

/** delete menu */
export function fetchDeleteMenu(id: Api.SystemManage.Id) {
  return request<boolean>({
    url: `/system/menu/delete/${id}`,
    method: 'post'
  });
}
