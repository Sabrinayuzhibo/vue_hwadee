import request from '@/utils/request'

// 免考申请相关接口

/**
 * 获取免考申请列表
 * 
 * @param {Object} params - 查询参数
 *  page: 页码
 *  size: 每页数量
 *  status: 申请状态
 *  studentName: 学生姓名
 *  studentId: 学号
 *  dateRange: 申请日期范围
 */
export const getExemptionListAPI =
    (params) => {
      return request({url: '/exemption/list', method: 'get', params})
    }

/**
 * 创建免考申请
 *
 * @param {Object} data - 申请信息
 *  studentId: 学号
 *  studentName: 学生姓名
 *  major: applyForm.major,
 *  courseCode: 课程代码,
 *  courseName: 免考课程,
 *  exemptionType: 免修类型,
 *  description: 申请说明,
 *  materials: 申请材料
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
 *
 *data(Object): {
 * id: row.id || row.studentId,
 * status: action === 'confirm' ? 'approved' : 'rejected',
 * description: value,
 * studentName: row.studentName // 从用户状态获取
 * }
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
      return request({url: `/exemption/student/info/${studentId}`, method: 'get'})
    }

/**
 * 搜索学生信息
 */
export const searchStudentAPI =
    (keyword) => {
      return request(
          {url: '/exemption/student/search', method: 'get', params: {keyword}})
    }

// 课程相关接口

/**
 * 获取可免考课程列表
 */
export const getAvailableCoursesAPI =
    () => {
      return request({url: '/exemption/course/available', method: 'get'})
    }

/**
 * 根据课程代码获取课程信息
 */
export const getCourseInfoAPI =
    (courseCode) => {
      return request(
          {url: `/exemption/course/info/${courseCode}`, method: 'get'})
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
        headers: {'Content-Type': '/exemptionmultipart/form-data'}
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
      return request({url: '/exemption-rule/all', method: 'get', params})
    }

/**
 * 创建免考政策
 * name: policyForm.policyName,
 * courseName: policyForm.courseName,
 * description: policyForm.exemptionCondition
 *
 */
export const createPolicyAPI =
    (data) => {
      return request({url: '/exemption-rule/add', method: 'post', data})
    }

/**
 * 更新免考政策
 */
export const updatePolicyAPI =
    (id, data) => {
      return request({url: `/exemption/policy/update/${id}`, method: 'put', data})
    }

/**
 * 删除免考政策
 */
export const deletePolicyAPI =
    (id) => {
      return request({url: `/exemption/policy/delete/${id}`, method: 'delete'})
    }

/**
 * 切换政策状态
 */
export const togglePolicyStatusAPI =
    (id, status) => {
      return request(
          {url: `/exemption/policy/toggle-status/${id}`, method: 'patch', data: {status}})
    }

// 统计相关接口

/**
 * 获取政策统计数据
 */
export const getPolicyStatsAPI =
    () => {
      return request({url: '/exemption/policy/stats', method: 'get'})
    }

/**
 * 获取政策使用统计
 */
export const getPolicyUsageStatsAPI =
    (timeRange) => {
      return request({
        url: '/exemption/policy/usage-stats',
        method: 'get',
        params: {timeRange}
      })
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
