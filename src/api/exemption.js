import request from '@/utils/request'

// 学生提交免考申请（对应后端 /application/student-apply）
export const submitStudentExemption = ({ studentName, courseName, ruleName }) => {
  return request({
    url: '/application/student-apply',
    method: 'post',
    data: { studentName, courseName, ruleName }
  })
}

// 管理员审批免考申请（对应后端 /application/admin-apply）
export const approveExemptionApplication = ({ applicationId, status, reviewReason }) => {
  return request({
    url: '/application/admin-apply',
    method: 'post',
    data: { applicationId, status, reviewReason }
  })
}

// 根据学生姓名查询其免考申请记录（对应后端 /application/student-load）
export const loadStudentExemptionApplications = (name) => {
  return request({
    url: '/application/student-load',
    method: 'post',
    data: { name }
  })
}

// 管理员分页加载审批记录（对应后端 /application/admin-load）
export const loadAdminExemptionApplications = ({ key, pageNum = 1, pageSize = 10 }) => {
  return request({
    url: '/application/admin-load',
    method: 'post',
    data: { key, pageNum, pageSize }
  })
}

// 查询所有免考规则（对应后端 GET /exemption-rule/all）
export const fetchAllExemptionRules = () => {
  return request({
    url: '/exemption-rule/all',
    method: 'get'
  })
}

// 添加免考规则（对应后端 POST /exemption-rule/add）
export const addExemptionRule = ({ name, description, courseName }) => {
  return request({
    url: '/exemption-rule/add',
    method: 'post',
    data: { name, description, courseName }
  })
}

// 删除免考规则（对应后端 POST /exemption-rule/delete）
export const deleteExemptionRule = (ruleId) => {
  return request({
    url: '/exemption-rule/delete',
    method: 'post',
    data: { ruleId }
  })
}

// 获取所有专业列表
export const fetchMajorList = () => {
    return request({
        url: '/get-majors',
        method: 'get'
    })
}
// 获取所有课程列表
export const fetchCourseList = () => {
    return request({
        url: '/get-courses',
        method: 'get'
    })
}