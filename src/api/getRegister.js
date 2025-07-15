import request from '@/utils/request'

// 获取所有专业
export function getMajors() {
  return request({
    url: '/get-majors',
    method: 'get'
  })
}

// 获取所有考试院
export function getExamCenters() {
  return request({
    url: '/get-examCenters',
    method: 'get'
  })
}
