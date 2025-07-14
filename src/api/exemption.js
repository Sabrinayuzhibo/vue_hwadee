import request from '@/utils/request'

/**
 * 免考申请管理API接口
 * 专门处理学生免考申请相关的后端交互
 */

// 获取免考申请列表
export const getExemptionListAPI = (params) => {
  return request({
    url: '/api/exemption/list',
    method: 'get',
    params: params
  })
}

// 提交免考申请
export const submitExemptionAPI = (data) => {
  return request({
    url: '/api/exemption/submit',
    method: 'post',
    data: data
  })
}

// 查询学生信息
export const searchStudentAPI = (params) => {
  return request({
    url: '/api/student/search',
    method: 'get',
    params: params
  })
}

// 获取可免考课程列表
export const getAvailableCoursesAPI = (params) => {
  return request({
    url: '/api/course/available',
    method: 'get',
    params: params
  })
}

// 审核免考申请
export const auditExemptionAPI = (data) => {
  return request({
    url: '/api/exemption/audit',
    method: 'post',
    data: data
  })
}

// 批量审核免考申请
export const batchAuditExemptionAPI = (data) => {
  return request({
    url: '/api/exemption/batch-audit',
    method: 'post',
    data: data
  })
}

// 下载申请材料
export const downloadMaterialsAPI = (params) => {
  return request({
    url: '/api/exemption/download-materials',
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}

// 导出免考名单
export const exportExemptionListAPI = (params) => {
  return request({
    url: '/api/exemption/export',
    method: 'get',
    params: params,
    responseType: 'blob'
  })
}

// 上传申请材料
export const uploadMaterialsAPI = (formData) => {
  return request({
    url: '/api/exemption/upload-materials',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取申请详情
export const getExemptionDetailAPI = (id) => {
  return request({
    url: `/api/exemption/detail/${id}`,
    method: 'get'
  })
}

// 撤销免考申请
export const withdrawExemptionAPI = (id) => {
  return request({
    url: `/api/exemption/withdraw/${id}`,
    method: 'post'
  })
}

// 获取审核历史
export const getAuditHistoryAPI = (exemptionId) => {
  return request({
    url: `/api/exemption/audit-history/${exemptionId}`,
    method: 'get'
  })
}

// 获取免考统计数据
export const getExemptionStatsAPI = (params) => {
  return request({
    url: '/api/exemption/stats',
    method: 'get',
    params: params
  })
}
