type ShelfQrSource = Pick<Wms.BaseInfo.Shelf, 'id' | 'shelfCode' | 'shelfName'>;

export function buildShelfQrPayload(shelf: ShelfQrSource) {
  return {
    c: shelf.id,
    n: shelf.shelfName,
    sc: shelf.shelfCode
  };
}

export function buildShelfQrText(shelf: ShelfQrSource) {
  return JSON.stringify(buildShelfQrPayload(shelf));
}
