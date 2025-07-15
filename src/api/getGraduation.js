// 毕业核验 POST
export function postGraduateVerify(name) {
  return request({
    url: '/graduate',
    method: 'post',
    data: { name }
  })
}
import request from '@/utils/request'

export function getGraduationList() {
  return request({
    url: '/loadAll',
    method: 'get'
  })
}
