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

    interface Production {
      customer?: string;
      materialName?: string;
      qty?: number | string;
      materialSpec?: string;
      materialCode?: string;
      box?: number | string;
      color?: string;
      saleNo?: string;
    }

    interface Supplier {
      code: string;
      name: string;
    }

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

  namespace Label {
    type TemplateKey = 'model1' | 'model2' | 'model3' | 'model4';

    type FieldType = 'input' | 'date' | 'select';

    interface FieldOption {
      label: string;
      value: string;
      item?: Wms.BaseInfo.Production | Wms.BaseInfo.Supplier | Wms.BaseInfo.User;
    }

    interface FieldConfig {
      label: string;
      prop: keyof FormData;
      type: FieldType;
      span?: number;
      placeholder?: string;
      lookup?: 'material' | 'production' | 'semiProduction';
      optionsKey?: 'productionOrders' | 'semiMaterials' | 'workers' | 'suppliers';
      isModel1Order?: boolean;
      isModel2Material?: boolean;
    }

    interface TemplateConfig {
      key: TemplateKey;
      title: string;
      label: string;
      sizeClass: string;
      formFields: FieldConfig[];
      printFields: FieldConfig[];
    }

    interface FormData {
      customerCode?: string;
      orderCode?: string;
      batchCode?: string;
      materialCode?: string;
      materialName?: string;
      modelSpec?: string;
      qty?: string | number;
      quantity?: string | number;
      color?: string;
      productionDate?: string;
      worker?: string;
      inspector?: string;
      supplier?: string;
      remark?: string;
      checkResult?: string;
    }

    interface QrPayload {
      m?: string | number;
      b?: string | number;
      p?: string | number;
      q?: string | number;
      i: string;
    }
  }
}
