const finishedPrintFields: Wms.Label.FieldConfig[] = [
  { label: '客户编号', prop: 'customerCode', type: 'input' },
  { label: '订单号', prop: 'orderCode', type: 'input' },
  { label: '批号', prop: 'batchCode', type: 'input' },
  { label: '产品编码', prop: 'materialCode', type: 'input' },
  { label: '产品名称', prop: 'materialName', type: 'input' },
  { label: '型号规格', prop: 'modelSpec', type: 'input' },
  { label: '订单数量', prop: 'qty', type: 'input' },
  { label: '入库数量', prop: 'quantity', type: 'input' },
  { label: '备注', prop: 'remark', type: 'input' },
  { label: '校验结果/校验员', prop: 'checkResult', type: 'input' }
];

const siliconeFinishedPrintFields = finishedPrintFields.filter(field => field.prop !== 'materialCode');

const semiPrintFields: Wms.Label.FieldConfig[] = [
  { label: '产品名称', prop: 'materialName', type: 'input' },
  { label: '物料料号', prop: 'materialCode', type: 'input' },
  { label: '生产批号', prop: 'batchCode', type: 'input' },
  { label: '颜色', prop: 'color', type: 'input' },
  { label: '生产日期', prop: 'productionDate', type: 'date' },
  { label: '数量', prop: 'quantity', type: 'input' },
  { label: '作业员', prop: 'worker', type: 'input' },
  { label: '检验员', prop: 'inspector', type: 'input' }
];

const rawPrintFields: Wms.Label.FieldConfig[] = [
  { label: '产品名称', prop: 'materialName', type: 'input' },
  { label: '物料料号', prop: 'materialCode', type: 'input' },
  { label: '颜色', prop: 'color', type: 'input' },
  { label: '生产批号', prop: 'batchCode', type: 'input' },
  { label: '数量', prop: 'quantity', type: 'input' },
  { label: '日期', prop: 'productionDate', type: 'date' },
  { label: '检验员', prop: 'inspector', type: 'input' },
  { label: '供应商', prop: 'supplier', type: 'input' }
];

export const labelTemplates: Wms.Label.TemplateConfig[] = [
  {
    key: 'model1',
    title: '成品标识卡',
    label: '成品标识卡',
    sizeClass: 'label-size-finished',
    formFields: [
      {
        label: '批号',
        prop: 'batchCode',
        type: 'input',
        lookup: 'production',
        span: 12,
        placeholder: '输入批号后可带出成品信息'
      },
      {
        label: '客户订单号',
        prop: 'orderCode',
        type: 'select',
        optionsKey: 'productionOrders',
        isModel1Order: true,
        span: 12
      },
      { label: '客户编号', prop: 'customerCode', type: 'input', span: 12 },
      { label: '物料编码', prop: 'materialCode', type: 'input', lookup: 'material', span: 12 },
      { label: '产品名称', prop: 'materialName', type: 'input', span: 12 },
      { label: '型号规格', prop: 'modelSpec', type: 'input', span: 12 },
      { label: '订单数量', prop: 'qty', type: 'input', span: 12 },
      { label: '入库数量', prop: 'quantity', type: 'input', span: 12 },
      { label: '备注', prop: 'remark', type: 'input', span: 12 },
      { label: '校验结果/校验员', prop: 'checkResult', type: 'input', span: 12 }
    ],
    printFields: finishedPrintFields
  },
  {
    key: 'model4',
    title: '成品标识卡',
    label: '注塑硅胶成品标识卡',
    sizeClass: 'label-size-small',
    formFields: [
      {
        label: '批号',
        prop: 'batchCode',
        type: 'input',
        lookup: 'production',
        span: 12,
        placeholder: '输入批号后可带出成品信息'
      },
      {
        label: '客户订单号',
        prop: 'orderCode',
        type: 'select',
        optionsKey: 'productionOrders',
        isModel1Order: true,
        span: 12
      },
      { label: '客户编号', prop: 'customerCode', type: 'input', span: 12 },
      { label: '产品名称', prop: 'materialName', type: 'input', span: 12 },
      { label: '型号规格', prop: 'modelSpec', type: 'input', span: 12 },
      { label: '订单数量', prop: 'qty', type: 'input', span: 12 },
      { label: '入库数量', prop: 'quantity', type: 'input', span: 12 },
      { label: '备注', prop: 'remark', type: 'input', span: 12 },
      { label: '校验结果/校验员', prop: 'checkResult', type: 'input', span: 12 }
    ],
    printFields: siliconeFinishedPrintFields
  },
  {
    key: 'model2',
    title: '产品标识卡',
    label: '半成品标签',
    sizeClass: 'label-size-small',
    formFields: [
      {
        label: '生产批号',
        prop: 'batchCode',
        type: 'input',
        lookup: 'semiProduction',
        span: 12,
        placeholder: '输入批号后可带出半成品信息'
      },
      {
        label: '物料料号',
        prop: 'materialCode',
        type: 'select',
        optionsKey: 'semiMaterials',
        isModel2Material: true,
        span: 12
      },
      { label: '物料名称', prop: 'materialName', type: 'input', span: 12 },
      { label: '颜色', prop: 'color', type: 'input', span: 12 },
      { label: '生产日期', prop: 'productionDate', type: 'date', span: 12 },
      { label: '数量', prop: 'quantity', type: 'input', span: 12 },
      { label: '作业员', prop: 'worker', type: 'select', optionsKey: 'workers', span: 12 },
      { label: '检验员', prop: 'inspector', type: 'input', span: 12 }
    ],
    printFields: semiPrintFields
  },
  {
    key: 'model3',
    title: '产品标识卡',
    label: '原材料标签',
    sizeClass: 'label-size-small',
    formFields: [
      { label: '物料料号', prop: 'materialCode', type: 'input', lookup: 'material', span: 12 },
      { label: '物料名称', prop: 'materialName', type: 'input', span: 12 },
      { label: '颜色', prop: 'color', type: 'input', span: 12 },
      { label: '生产批号', prop: 'batchCode', type: 'input', span: 12 },
      { label: '日期', prop: 'productionDate', type: 'date', span: 12 },
      { label: '数量', prop: 'quantity', type: 'input', span: 12 },
      { label: '供应商', prop: 'supplier', type: 'select', optionsKey: 'suppliers', span: 12 },
      { label: '检验员', prop: 'inspector', type: 'input', span: 12 }
    ],
    printFields: rawPrintFields
  }
];

export function getLabelTemplate(key: Wms.Label.TemplateKey) {
  return labelTemplates.find(template => template.key === key) ?? labelTemplates[0];
}
