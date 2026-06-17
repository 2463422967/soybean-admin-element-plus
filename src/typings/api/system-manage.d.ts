declare namespace Api {
  /**
   * namespace SystemManage
   *
   * backend api module: "system"
   */
  namespace SystemManage {
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    type EnableStatus = Api.Common.EnableStatus | 1 | 2;

    type Id = string | number;

    type MenuType = 1 | 2 | 3;

    type UserGender = '1' | '2';

    type IconType = '1' | '2';

    type CommonRecordFields = {
      createBy: string;
      createTime: string;
      updateBy: string;
      updateTime: string;
      status: Api.Common.EnableStatus | undefined;
    };

    type User = CommonRecordFields & {
      id: number;
      code: string;
      username: string;
      name: string;
      department?: string | null;
      isSystem: boolean;
      roleIds?: Id[] | null;
      roleNames?: string[] | null;
      /** legacy demo field */
      userName: string;
      /** legacy demo field */
      userGender: UserGender | undefined;
      /** legacy demo field */
      nickName: string;
      /** legacy demo field */
      userPhone: string;
      /** legacy demo field */
      userEmail: string;
      /** legacy demo field */
      userRoles: string[];
    };

    type UserSearchParams = CommonType.RecordNullable<
      Pick<
        User,
        | 'code'
        | 'username'
        | 'name'
        | 'department'
        | 'userName'
        | 'userGender'
        | 'nickName'
        | 'userPhone'
        | 'userEmail'
        | 'status'
      > &
        CommonSearchParams
    >;

    type ErpUser = {
      code: string;
      name: string;
      department?: string | null;
      disableFlag?: boolean | string | null;
    };

    type ErpUserSearchParams = CommonType.RecordNullable<
      Pick<ErpUser, 'code' | 'name' | 'department'> & CommonSearchParams
    >;

    type ImportUser = Pick<ErpUser, 'code' | 'name' | 'department'>;

    type UpdateUserRolesParams = {
      userId: number;
      roleIds: Id[];
    };

    type UpdateUserPasswordParams = {
      userId: number;
      password: string;
    };

    type UpdateUserStatusParams = {
      userId: number;
      status: EnableStatus;
    };

    type UserList = Common.PaginatingQueryRecord<User>;

    type ErpUserList = Common.PaginatingQueryRecord<ErpUser>;

    type Role = CommonRecordFields & {
      id: Id;
      name: string;
      code: string;
      description?: string | null;
      sort: number;
      isSystem: boolean;
      menuIds?: Id[] | null;
      /** legacy demo field */
      roleName: string;
      /** legacy demo field */
      roleCode: string;
      /** legacy demo field */
      roleDesc: string;
    };

    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Role, 'name' | 'code' | 'roleName' | 'roleCode' | 'status'> & CommonSearchParams
    >;

    type RoleList = Common.PaginatingQueryRecord<Role>;

    type AllRole = Pick<Role, 'id' | 'name' | 'code' | 'roleName' | 'roleCode' | 'status'>;

    type MenuButton = {
      code: string;
      desc?: string | null;
    };

    type SaveRoleParams = {
      name: string;
      code: string;
      description?: string | null;
      sort?: number | null;
      status?: EnableStatus | null;
      menuIds?: Id[];
    };

    type UpdateRoleParams = SaveRoleParams & {
      id: Id;
    };

    type UpdateRoleMenusParams = {
      roleId: Id;
      menuIds: Id[];
    };

    type Menu = CommonRecordFields & {
      id: Id;
      parentId: Id;
      title: string;
      type: MenuType;
      path?: string | null;
      name?: string | null;
      component?: string | null;
      icon?: string | null;
      permission?: string | null;
      sort: number;
      isHidden: boolean;
      isSystem: boolean;
      children?: Menu[];
      /** legacy Soybean manage-menu field */
      menuType: MenuType;
      /** legacy Soybean manage-menu field */
      menuName: string;
      /** legacy Soybean manage-menu field */
      routeName: string;
      /** legacy Soybean manage-menu field */
      routePath: string;
      /** legacy Soybean manage-menu field */
      iconType: IconType;
      /** legacy Soybean manage-menu field */
      hideInMenu: boolean;
      /** legacy Soybean manage-menu field */
      order: number;
      /** legacy Soybean manage-menu field */
      buttons?: MenuButton[] | null;
      /** legacy Soybean manage-menu field */
      query?: NonNullable<import('vue-router').RouteMeta['query']>;
      i18nKey?: import('vue-router').RouteMeta['i18nKey'];
      keepAlive?: import('vue-router').RouteMeta['keepAlive'];
      constant?: import('vue-router').RouteMeta['constant'];
      href?: import('vue-router').RouteMeta['href'];
      activeMenu?: import('vue-router').RouteMeta['activeMenu'];
      multiTab?: import('vue-router').RouteMeta['multiTab'];
      fixedIndexInTab?: import('vue-router').RouteMeta['fixedIndexInTab'];
    };

    type MenuList = Menu[];

    type MenuTree = Menu;

    type SaveMenuParams = {
      parentId?: Id | null;
      title: string;
      type: MenuType;
      path?: string | null;
      name?: string | null;
      component?: string | null;
      icon?: string | null;
      permission?: string | null;
      sort?: number | null;
      status?: EnableStatus | null;
      isHidden?: boolean | null;
    };

    type UpdateMenuParams = SaveMenuParams & {
      id: Id;
    };
  }
}
