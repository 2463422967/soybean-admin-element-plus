export function buildRawMaterialLabelFormData(row: Wms.Receiving.Item): Wms.Label.FormData {
  return {
    materialCode: row.materialCode,
    batchCode: row.batchNo,
    productionDate: row.productionDate,
    supplier: row.supplierName
  };
}
