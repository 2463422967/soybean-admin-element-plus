declare namespace Wms {
  namespace BaseInfo {
    interface PageSearchParams {
      current: number;
      size: number;
      keyWords?: string;
    }

    interface Warehouse {
      stockId?: number;
      stockNumber: string;
      stockName: string;
      stockStaff: string;
      status: string;
      stockType: string;
    }

    interface WarehouseSearchParams {
      current: number;
      size: number;
      keyWords?: string;
    }

    type WarehouseList = Api.Common.PaginatingQueryRecord<Warehouse>;

    interface Position {
      positionId?: number;
      stockName: string;
      stockNumber: string;
      positionNumber: string;
      positionName: string;
      status: string;
      positionKey?: string;
    }

    type PositionSearchParams = PageSearchParams;

    type PositionList = Api.Common.PaginatingQueryRecord<Position>;

    interface Material {
      status: string;
      materialCode: string;
      materialName: string;
      materialGroupName?: string;
      materialSpec: string;
      unit: string;
      color?: string;
      stockName?: string;
      positionName?: string;
      safeInventory?: number | string;
      maxInventory?: number | string;
      lifeUnit?: string;
      life?: number;
      unitNumber?: string;
      stockNumber?: string;
      positionNumber?: string;
      sourceKey?: string;
      boxQty?: string;
    }

    type MaterialSearchParams = PageSearchParams;

    type MaterialList = Api.Common.PaginatingQueryRecord<Material>;

    interface Shelf {
      id: number;
      shelfName: string;
      shelfCode: string;
      createTime?: string;
    }

    type ShelfSearchParams = PageSearchParams;

    type ShelfList = Api.Common.PaginatingQueryRecord<Shelf>;

    interface User {
      code: string;
      department?: string;
      name: string;
      disableFlag?: boolean;
      userRole?: number[];
      userRoleName?: string[];
    }

    type UserSearchParams = PageSearchParams;

    type UserList = Api.Common.PaginatingQueryRecord<User>;

    interface Role {
      id: number;
      roleName: string;
      roleRemark?: string;
      createTime?: string;
      disableFlag?: boolean;
      roleMenu?: string[];
    }

    type RoleSearchParams = PageSearchParams;

    type RoleList = Api.Common.PaginatingQueryRecord<Role>;

    interface AppVersion {
      id: number;
      version: string;
      remark?: string;
      fileId?: string;
      createTime?: string;
    }

    type AppVersionSearchParams = PageSearchParams;

    type AppVersionList = Api.Common.PaginatingQueryRecord<AppVersion>;
  }
}
