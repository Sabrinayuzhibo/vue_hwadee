import request from '@/utils/request.js'

// 获取用户列表
export const getUserList = async (params) => {
    try {
        const response = await request({
            url: '/user/list',
            method: 'get',
            params
        })
        return response.data
    } catch (error) {
        console.error('获取用户列表失败', error)
        throw error
    }
}
// 删除用户
export const deleteUser = async (id) => {
    try {
        const response = await request({
            url: '/user/delete',
            method: 'delete',
            params: {
                id: id
            }
        })
        return response.data
    } catch (error) {
        console.error('删除用户失败', error)
        throw error
    }
}
// 更新用户
export const updateUser = async (data) => {
    try {
        const response = await request({
            url: '/user/edit',
            method: 'post',
            data
        })
        return response.data
    } catch (error) {
        console.error('更新用户失败', error)
        throw error
    }
}
// 新增用户
export const addUser = async (data) => {
    try {
        const response = await request({
            url: '/user/add',
            method: 'post',
            data
        })
        return response.data
    } catch (error) {
        console.error('新增用户失败', error)
        throw error
    }
}
