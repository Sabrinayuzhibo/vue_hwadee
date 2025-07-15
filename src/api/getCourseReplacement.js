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
import request from '@/utils/request.js'

// 获取所有顶替规则（无分页）
export const fetchReplacementRules = () => {
    return request({
        url: '/course-replacement/list-all',
        method: 'get'
    })
}

// 新增顶替规则（对应后端 /course-replacement/add）
export const createReplacementRule = (data) => {
    // 适配后端字段
    const postData = {
        oldCourseName: data.oldCourseName,
        newCourseName: data.newCourseName,
        majorName: data.majorName,
        effectiveFrom: data.effectiveFrom || '',
        effectiveTo: data.effectiveTo || ''
    }
    return request({
        url: '/course-replacement/add',
        method: 'post',
        data: postData
    })
}

// 删除顶替规则（对应后端 /course-replacement/delete）
export const deleteReplacementRule = (row) => {
    // 适配后端字段
    const postData = {
        oldCourseName: row.oldCourseName,
        newCourseName: row.newCourseName,
        majorName: row.majorName,
        effectiveFrom: row.effectiveFrom || '',
        effectiveTo: row.effectiveTo || ''
    }
    return request({
        url: '/course-replacement/delete',
        method: 'post',
        data: postData
    })
}

// 自动加载课程替换建议（对应后端 /application/course/auto-student-load）
export const autoMatchReplacement = (name) => {
    return request({
        url: '/application/course/auto-student-load',
        method: 'post',
        data: { name }
    })
}

// 提交课程替换申请（对应后端 /application/course/student-apply）
export const submitReplacementRequest = (data) => {
  return request({
    url: '/application/course/student-apply',
    method: 'post',
    data: {
      studentName: data.studentName,       // 学生姓名
      oldCourseName: data.oldCourseName,   // 原课程名称
      newCourseName: data.newCourseName,   // 新课程名称
      reason: data.reason || ''            // 替换理由
    }
  })
}

// 提交课程替换申请（对应后端 /application/course/student-load）
export const courseStudentLoad = (name) => {
  return request({
        url: '/application/course/student-load',
        method: 'post',
        data: { name }
    })
}

// 提交课程替换申请（对应后端 /application/course/admin-load）
export const courseAdminLoad = ({ key, pageNum = 1, pageSize = 10 }) => {
  return request({
    url: '/application/course/admin-load',
    method: 'post',
    data: { key, pageNum, pageSize }
  })
}