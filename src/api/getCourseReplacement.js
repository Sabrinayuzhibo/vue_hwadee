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

