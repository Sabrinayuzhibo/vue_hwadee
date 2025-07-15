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
//注册
export const register = (data) => {
	return request({
		url: '/register-student',//请求接口
		method: 'post',//请求方式
		data//请求参数
	})
}