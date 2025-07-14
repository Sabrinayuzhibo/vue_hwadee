import request from '@/utils/request.js'

// 获取顶替规则列表（支持按条件筛选）
export const fetchReplacementRules = (params) => {
    return request({
        url: '/courseReplacement/rules',
        method: 'get',
        params
    })
}

// 新增顶替规则（对应后端 /course-replacement/add）
export const createReplacementRule = (data) => {
    return request({
        url: '/course-replacement/add',
        method: 'post',
        data
    })
}


// 删除顶替规则（对应后端 /course-replacement/delete）
export const deleteReplacementRule = (data) => {
    return request({
        url: '/course-replacement/delete',
        method: 'post',
        data
    })
}

