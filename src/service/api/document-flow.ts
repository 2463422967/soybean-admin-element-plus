import { request } from '../request';

export function fetchGetSourceDocumentMappings(params: Wms.DocumentFlow.MappingQueryParams) {
  return request<Wms.DocumentFlow.SourceDocumentMapping[]>({
    url: '/documentflow/sourceDocumentMapping/list',
    method: 'post',
    data: params
  });
}

export function fetchSaveSourceDocumentMappings(mappings: Wms.DocumentFlow.SourceDocumentMappingSaveParams[]) {
  return request<boolean>({
    url: '/documentflow/sourceDocumentMapping/saveBatch',
    method: 'post',
    data: { mappings }
  });
}

export function fetchRestoreDefaultSourceDocumentMappings(operationCategory: string) {
  return request<boolean>({
    url: '/documentflow/sourceDocumentMapping/restoreDefault',
    method: 'post',
    data: { operationCategory }
  });
}

export function fetchGetSourceDocumentOptions(params: Wms.DocumentFlow.SourceDocumentOptionQueryParams) {
  return request<Wms.DocumentFlow.SourceDocumentOption[]>({
    url: '/documentflow/sourceDocumentMapping/options',
    method: 'post',
    data: params
  });
}

// 来源单据选择弹窗接入时复用该查询接口。
export function fetchGetSourceDocumentPage(params: Wms.DocumentFlow.SourceDocumentQueryParams) {
  return request<Wms.DocumentFlow.SourceDocumentPage>({
    url: '/documentflow/sourceDocument/page',
    method: 'post',
    data: params
  });
}

// 来源单据选择弹窗接入时复用该详情接口。
export function fetchGetSourceDocumentDetail(params: Wms.DocumentFlow.SourceDocumentQueryParams) {
  return request<Wms.DocumentFlow.SourceDocument>({
    url: '/documentflow/sourceDocument/detail',
    method: 'post',
    data: params
  });
}
