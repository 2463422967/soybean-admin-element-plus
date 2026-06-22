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

    interface TemplateEntity {
      id: number;
      templateCode: string;
      templateName: string;
      businessType: TemplateKey;
      paperWidth: number;
      paperHeight: number;
      templateJson: Record<string, unknown>;
      enabled: boolean;
      defaultTemplate: boolean;
      remark?: string;
      createTime?: string;
      updateTime?: string;
    }

    interface TemplateSearchParams extends Api.Common.CommonSearchParams {
      businessType?: TemplateKey;
      enabled?: boolean;
    }

    type TemplateList = Api.Common.PaginatingQueryRecord<TemplateEntity>;

    interface TemplateSaveParams {
      id?: number;
      templateCode: string;
      templateName: string;
      businessType: TemplateKey;
      paperWidth: number;
      paperHeight: number;
      templateJson: Record<string, unknown>;
      enabled?: boolean;
      defaultTemplate?: boolean;
      remark?: string;
    }

    interface TemplateStatusParams {
      id: number;
      enabled: boolean;
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

    interface ExternalTemplateData {
      templateKey: TemplateKey;
      formData: FormData;
      printCopies?: number;
      afterPrint?: () => void | Promise<void>;
      lookupMaterial?: boolean;
    }

    interface QrPayload {
      m?: string | number;
      b?: string | number;
      p?: string | number;
      q?: string | number;
      i: string;
    }
  }

  namespace Inventory {
    interface SearchParams {
      current: number;
      size: number;
      keyWords?: string;
      materialCode?: string;
      stockNumber?: string;
      positionName?: string;
      flot?: string;
    }

    interface InventoryItem {
      materialCode: string;
      materialName: string;
      flot?: string;
      stockName?: string;
      positionName?: string;
      unit?: string;
      stockQty?: number;
      safeQty?: number;
      status?: string;
    }

    interface WarningItem extends InventoryItem {
      maxQty?: number;
    }

    type InventoryList = Api.Common.PaginatingQueryRecord<InventoryItem>;

    type WarningList = Api.Common.PaginatingQueryRecord<WarningItem>;
  }

  namespace ListingAssignment {
    interface SearchParams {
      current: number;
      size: number;
      keyWords?: string;
    }

    interface Item {
      entryId: number;
      taskNo: string;
      receiveType: string;
      materialCode: string;
      materialName: string;
      waitQty: number;
      listingQty?: number;
      batchNo: string;
      warehouse: string;
      warehouseLocation: string;
      receiveStatus: string;
      listingPerson?: string;
      billDate?: string;
    }

    type ItemList = Api.Common.PaginatingQueryRecord<Item>;
  }

  namespace InStore {
    type InStoreType =
      | 'procurement'
      | 'production'
      | 'sales_return'
      | 'production_return'
      | 'outsourcing_return'
      | 'other_in'
      | 'other_out';

    interface SearchParams {
      current: number;
      size: number;
      keyWords?: string;
    }

    interface Item {
      entryId: number;
      taskNo: string;
      inStoreType: string;
      materialCode: string;
      materialName: string;
      qty: number;
      batchNo: string;
      warehouse: string;
      warehouseLocation: string;
      inStoreTime?: string;
      purchaseOrderNo?: string;
      supplierName?: string;
      saleOrderNo?: string;
      customerName?: string;
      productionOrderNo?: string;
      outboundNo?: string;
    }

    type ItemList = Api.Common.PaginatingQueryRecord<Item>;
  }

  namespace Receiving {
    type ReceiveType =
      | 'procurement'
      | 'production'
      | 'sales_return'
      | 'production_return'
      | 'outsourcing_return'
      | 'other_return';

    type ListTab = 'unReceive' | 'recent';

    interface SearchParams {
      current: number;
      size: number;
      receiptNoticeNo?: string;
    }

    interface Item {
      entryId?: number;
      taskNo?: string;
      receiveType?: string;
      materialCode?: string;
      materialName?: string;
      receiveQty?: number;
      waitQty?: number;
      batchNo?: string;
      warehouse?: string;
      warehouseLocation?: string;
      receiveStatus?: string;
      purchaseOrderNo?: string;
      supplierName?: string;
      productionOrderNo?: string;
      saleOrderNo?: string;
      customerNo?: string;
      customerCode?: string;
      workshopName?: string;
      orderNo?: string;
      receiptQty?: number;
      location?: string;
      receiver?: string;
      receiptTime?: string;
      receivePerson?: string;
      receiveTime?: string;
      productionDate?: string;
      printStatus?: string;
      status?: string;
      workOrderBatchNo?: string;
      outsourceOrderNo?: string;
      outStoreNo?: string;
    }

    type ItemList = Api.Common.PaginatingQueryRecord<Item>;
  }

  namespace Outbound {
    type OutboundType =
      | 'sales'
      | 'purchase_return'
      | 'production_picking'
      | 'production_supplement'
      | 'subcontract_picking'
      | 'subcontract_supplement'
      | 'other';

    type ListTab = 'pendingTasks' | 'recentRecords';

    interface SearchParams {
      current: number;
      size: number;
      taskId?: string;
      keyWords?: string;
      itCompleted?: boolean;
    }

    interface Item {
      id?: number;
      entryId?: string;
      taskNo?: string;
      billNo?: string;
      saleOrderNo?: string;
      saleNo?: string;
      customer?: string;
      supplier?: string;
      orderNo?: string;
      materialCode?: string;
      materialName?: string;
      qty?: number;
      waitQty?: number;
      pickQty?: number;
      pickStatus?: number | string;
      stockName?: string;
      positionName?: string;
      warehouse?: string;
      position?: string;
      batchNo?: string;
      flot?: string;
      orderNo?: string;
      pickPerson?: string;
      pickTime?: string;
    }

    type ItemList = Api.Common.PaginatingQueryRecord<Item>;
  }

  namespace Transfer {
    interface SearchParams {
      current: number;
      size: number;
      billNo?: string;
      sourceStock?: string;
      targetStock?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      stock?: 'A' | 'B';
    }

    interface Item {
      fid?: number;
      billNo: string;
      materialCode?: string;
      materialName?: string;
      qty: number;
      flot?: string;
      sourceStockName?: string;
      sourcePositionName?: string;
      targetStockName?: string;
      targetPositionName?: string;
      createDate: string;
      status: string;
    }

    type ItemList = Api.Common.PaginatingQueryRecord<Item>;
  }

  namespace StockCount {
    interface HeaderSearchParams {
      current: number;
      size: number;
      fid: number;
    }

    interface BodySearchParams {
      current: number;
      size: number;
      fid: number;
    }

    interface Header {
      fid?: number;
      billNo?: string;
      backUpDate?: string;
      status?: string;
    }

    interface Body {
      stock?: string;
      position?: string;
      materialCode?: string;
      materialName?: string;
      materialSpec?: string;
      batchNo?: string;
      unit?: string;
      baseAcctQty?: number;
      accountQty?: number;
      egaingQty?: number;
      lossQty?: number;
    }

    type HeaderList = Api.Common.PaginatingQueryRecord<Header>;

    type BodyList = Api.Common.PaginatingQueryRecord<Body>;
  }

  namespace ReportAnalysis {
    interface InventoryWarningDetails {
      materialCode?: string;
      materialName?: string;
      stockNum?: number | string;
      warningSituation?: string;
    }

    interface InventoryCategoryRatio {
      materialGroupName?: string;
      materialGroupNum?: number | string;
      itemStyle?: {
        color?: string;
      };
    }

    interface InventoryWarningDistribution {
      warningGroupName?: string;
      warningNum?: number;
    }

    interface InventoryStockComparison {
      warehouseName?: string;
      stockNum?: number | string;
    }

    interface InventoryReport {
      inventoryWarning?: InventoryWarningDetails[];
      inventoryClassification?: InventoryCategoryRatio[];
      inventoryWarningDistribution?: InventoryWarningDistribution[];
      inventoryStockComparison?: InventoryStockComparison[];
    }

    interface AssignmentTypeDistribution {
      assignmentType?: string;
      assignmentCount?: number;
      itemStyle?: {
        color?: string;
      };
    }

    interface PersonPerformanceComparison {
      personName?: string;
      receivingCount?: number;
      pickingCount?: number;
    }

    interface WorkloadTrend {
      date?: string;
      receivingCount?: number;
      pickingCount?: number;
      internalCount?: number;
    }

    interface WorkQualityAnalysis {
      receivingCount?: number;
      shelfCount?: number;
      pickingCount?: number;
      internalCount?: number;
      waitShelfCount?: number;
      waitInspectionCount?: number;
      totalCount?: number;
    }

    interface HomeworkReport {
      assignmentTypeDistribution?: AssignmentTypeDistribution[];
      personPerformanceComparisonYesterday?: PersonPerformanceComparison[];
      personPerformanceComparison7Days?: PersonPerformanceComparison[];
      workloadTrend?: WorkloadTrend[];
      workQualityAnalysis?: WorkQualityAnalysis;
    }
  }
}
