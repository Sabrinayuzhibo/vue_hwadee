import request from '@/utils/request'

// 查询学生总数
export function fetchStudentCount() {
  return request({
    url: '/countStudent',
    method: 'get'
  })
}

// 查询专业总数
export function fetchMajorCount() {
  return request({
    url: '/numOfMajor',
    method: 'get'
  })
}

// 查询课程总数
export function fetchCourseCount() {
  return request({
    url: '/numOfCourse',
    method: 'get'
  })
}

// 查询考试院总数
export function fetchExamCenterCount() {
  return request({
    url: '/numOfExamCenters',
    method: 'get'
  })
}

// 查询管理员总数
export function fetchAdminCount() {
  return request({
    url: '/admin-info/count',
    method: 'get'
  })
}

// 获取所有专业信息（VO 格式）
export function fetchAllMajors() {
  return request({
    url: '/get-majors',
    method: 'get'
  })
}

