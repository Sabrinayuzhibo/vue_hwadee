// src/store/user.js 或 src/store/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    role: '', // 角色
    // 其他用户信息
  }),
  actions: {
    setRole(role) {
      this.role = role
    }
  }
})
