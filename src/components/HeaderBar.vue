<template>
  <div class="header">
    <div class="logo">后台管理系统</div>
    <div class="user-info">
      <span class="account">欢迎，{{ account }}</span>
      <el-button type="text" class="logout-btn" @click="handleLogout">
        退出登录
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { logout } from '@/api/getLogin.js'
import { User } from '@element-plus/icons-vue'

const router = useRouter()

const account = computed(() => {
  return localStorage.getItem('account') || '用户'
})

const handleLogout = async () => {
  // 保持原有退出逻辑
  const response = await logout({});
  if (response.status === 200) {
    ElMessage.success({ message: '退出登录成功!', duration: 2000 });
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('menus')
    router.push('/login')
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.user-info {
  display: flex;
  align-items: center;
}

.account {
  font-size: 16px;
  color: #606266;
  margin-right: 15px;
}

.logout-btn {
  font-size: 14px;
  color: #f56c6c;
}
</style>
