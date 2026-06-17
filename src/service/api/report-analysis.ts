import { request } from '../request';

/** get inventory report */
export function fetchGetInventoryReport() {
  return request<Wms.ReportAnalysis.InventoryReport>({
    url: '/board/reportAnalysis/inventoryReport',
    method: 'post'
  });
}

/** get homework report */
export function fetchGetHomeworkReport() {
  return request<Wms.ReportAnalysis.HomeworkReport>({
    url: '/board/reportAnalysis/homeworkReport',
    method: 'post'
  });
}
