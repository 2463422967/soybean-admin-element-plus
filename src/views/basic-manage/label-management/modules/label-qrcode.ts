export function createLabelIdentity() {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
}

export function buildLabelQrPayload(
  formData: Wms.Label.FormData,
  identity = createLabelIdentity()
): Wms.Label.QrPayload {
  return {
    m: formData.materialCode,
    b: formData.batchCode,
    p: formData.productionDate,
    q: formData.quantity,
    i: identity
  };
}

export function buildLabelQrText(formData: Wms.Label.FormData, identity?: string) {
  return JSON.stringify(buildLabelQrPayload(formData, identity));
}
