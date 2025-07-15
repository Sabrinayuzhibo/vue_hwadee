import request from '@/utils/request'

export function getGraduationList() {
  return request({
    url: '/loadAll',
    method: 'get'
  })
}
