import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    role: '', // 角色
    name: '', // 添加 name 字段
    // 其他用户信息
  }),
  actions: {
    setRole(role) {
      this.role = role
    },
    setName(name) {
      this.name = name
    }
  }
})
