export function buildRawMaterialLabelFormData(row: Wms.Receiving.Item): Wms.Label.FormData {
  return {
    materialCode: row.materialCode,
    materialName: row.materialName,
    batchCode: row.batchNo,
    productionDate: row.productionDate,
    quantity: row.receiveQty ?? row.receiptQty,
    supplier: row.supplierName
  };
}
