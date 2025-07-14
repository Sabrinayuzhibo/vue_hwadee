import request from '@/utils/request'

// 免考申请相关接口

/**
 * 获取免考申请列表
 */
export const getExemptionListAPI =
    (params) => {
      return request({url: '/exemption/list', method: 'get', params})
    }

/**
 * 创建免考申请
 */
export const createExemptionAPI =
    (data) => {
      return request({url: '/exemption/create', method: 'post', data})
    }

/**
 * 获取免考申请详情
 */
export const getExemptionDetailAPI =
    (id) => {
      return request({url: `/exemption/detail/${id}`, method: 'get'})
    }

/**
 * 审核免考申请
 */
export const auditExemptionAPI =
    (data) => {
      return request({url: '/exemption/audit', method: 'post', data})
    }

/**
 * 删除免考申请
 */
export const deleteExemptionAPI =
    (id) => {
      return request({url: `/exemption/delete/${id}`, method: 'delete'})
    }

/**
 * 批量审核免考申请
 */
export const batchAuditExemptionAPI =
    (data) => {
      return request({url: '/exemption/batch-audit', method: 'post', data})
    }

/**
 * 导出免考申请列表
 */
export const exportExemptionListAPI =
    (params) => {
      return request({
        url: '/exemption/export',
        method: 'get',
        params,
        responseType: 'blob'
      })
    }

// 学生信息相关接口

/**
 * 根据学号查询学生信息
 */
export const getStudentInfoAPI =
    (studentId) => {
      return request({url: `/student/info/${studentId}`, method: 'get'})
    }

/**
 * 搜索学生信息
 */
export const searchStudentAPI =
    (keyword) => {
      return request({url: '/student/search', method: 'get', params: {keyword}})
    }

// 课程相关接口

/**
 * 获取可免考课程列表
 */
export const getAvailableCoursesAPI =
    () => {
      return request({url: '/course/available', method: 'get'})
    }

/**
 * 根据课程代码获取课程信息
 */
export const getCourseInfoAPI =
    (courseCode) => {
      return request({url: `/course/info/${courseCode}`, method: 'get'})
    }

// 文件上传下载相关接口

/**
 * 上传证明材料
 */
export const uploadMaterialsAPI =
    (formData) => {
      return request({
        url: '/exemption/upload',
        method: 'post',
        data: formData,
        headers: {'Content-Type': 'multipart/form-data'}
      })
    }

/**
 * 下载证明材料
 */
export const downloadMaterialsAPI =
    (exemptionId) => {
      return request({
        url: `/exemption/download/${exemptionId}`,
        method: 'get',
        responseType: 'blob'
      })
    }

/**
 * 获取材料文件列表
 */
export const getMaterialListAPI =
    (exemptionId) => {
      return request(
          {url: `/exemption/materials/${exemptionId}`, method: 'get'})
    }

// 免考政策相关接口

/**
 * 获取免考政策列表
 */
export const getPolicyListAPI =
    (params) => {
      return request({url: '/policy/list', method: 'get', params})
    }

/**
 * 创建免考政策
 */
export const createPolicyAPI =
    (data) => {
      return request({url: '/policy/create', method: 'post', data})
    }

/**
 * 更新免考政策
 */
export const updatePolicyAPI =
    (id, data) => {
      return request({url: `/policy/update/${id}`, method: 'put', data})
    }

/**
 * 删除免考政策
 */
export const deletePolicyAPI =
    (id) => {
      return request({url: `/policy/delete/${id}`, method: 'delete'})
    }

/**
 * 切换政策状态
 */
export const togglePolicyStatusAPI =
    (id, status) => {
      return request(
          {url: `/policy/toggle-status/${id}`, method: 'patch', data: {status}})
    }

// 统计相关接口

/**
 * 获取政策统计数据
 */
export const getPolicyStatsAPI =
    () => {
      return request({url: '/policy/stats', method: 'get'})
    }

/**
 * 获取政策使用统计
 */
export const getPolicyUsageStatsAPI =
    (timeRange) => {
      return request(
          {url: '/policy/usage-stats', method: 'get', params: {timeRange}})
    }

/**
 * 获取月度趋势数据
 */
export const getMonthlyTrendDataAPI =
    () => {
      return request({url: '/exemption/monthly-trend', method: 'get'})
    }

/**
 * 获取课程分析数据
 */
export const getCourseAnalysisDataAPI =
    () => {
      return request({url: '/exemption/course-analysis', method: 'get'})
    }

/**
 * 获取免考申请统计
 */
export const getExemptionStatsAPI = (params) => {
  return request({url: '/exemption/stats', method: 'get', params})
}
