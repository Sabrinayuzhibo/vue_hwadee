import request from '@/utils/request.js'

// 登录
export const login = (data) => {
	return request({
		url: '/login/accountLogin',//请求接口
		method: 'post',//请求方式
		data//请求参数
	})
}

//注册
export const register = (data) => {
	return request({
		url: '/login/register',//请求接口
		method: 'post',//请求方式
		data//请求参数
	})
}

//退出登录
export const logout = (data) => {
	return request({
		url: '/login/logout',//请求接口
		method: 'get',//请求方式
		data//请求参数
	})
}

// 获取报考专业列表
export const getMajors = () => {
  return request({
    url: '/api/majors', // 请根据实际后端接口调整
    method: 'get'
  })
}

// 获取州级考试院列表
export const getExamInstitutes = () => {
  return request({
    url: '/api/exam-institutes', // 请根据实际后端接口调整
    method: 'get'
  })
}
