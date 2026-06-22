import { request } from '../request';

export function fetchGetLabelTemplatePage(params: Wms.Label.TemplateSearchParams) {
  return request<Wms.Label.TemplateList>({
    url: '/labelTemplate/pageList',
    method: 'post',
    data: params
  });
}

export function fetchGetEnabledLabelTemplateList(businessType?: Wms.Label.TemplateKey) {
  return request<Wms.Label.TemplateEntity[]>({
    url: '/labelTemplate/enabledList',
    method: 'post',
    params: { businessType }
  });
}

export function fetchGetDefaultLabelTemplate(businessType: Wms.Label.TemplateKey) {
  return request<Wms.Label.TemplateEntity | null>({
    url: '/labelTemplate/findDefault',
    method: 'post',
    params: { businessType }
  });
}

export function fetchSaveLabelTemplate(data: Wms.Label.TemplateSaveParams) {
  return request<Wms.Label.TemplateEntity>({
    url: '/labelTemplate/save',
    method: 'post',
    data
  });
}

export function fetchUpdateLabelTemplateStatus(data: Wms.Label.TemplateStatusParams) {
  return request<boolean>({
    url: '/labelTemplate/updateStatus',
    method: 'post',
    data
  });
}

export function fetchSetDefaultLabelTemplate(id: number) {
  return request<boolean>({
    url: '/labelTemplate/setDefault',
    method: 'post',
    data: { id }
  });
}

export function fetchDeleteLabelTemplate(id: number) {
  return request<boolean>({
    url: `/labelTemplate/delete/${id}`,
    method: 'post'
  });
}
