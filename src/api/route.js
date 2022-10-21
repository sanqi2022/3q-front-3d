import request from '@/utils/request'

export function saveRoute(data) {
  return request({
    url: '/nocodbv2/api/v1/db/data/noco/三奇数字孪生/巡更路线',
    method: 'post',
    data
  })
}

export function getRoutes(params) {
  return request({
    url: '/nocodbv2/api/v1/db/data/noco/三奇数字孪生/巡更路线',
    method: 'get',
    params
  })
}

export function deleteRoute() {
  return request({
    url: '/nocodbv2/api/v1/db/data/bulk/noco/三奇数字孪生/巡更路线/all',
    method: 'delete'
  })
}
