<template>
  <div class="exam-management">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-content">
        <h1>考籍管理系统</h1>
        <div class="user-info">
          <!-- 新增：审核结果信息框 -->
          <el-alert
            v-if="auditResultMessage"
            :title="auditResultMessage"
            type="info"
            show-icon
            class="audit-result-alert"
            style="margin-right: 16px; min-width: 180px;"
            :closable="false"
          />
          <el-dropdown>
            <span class="user-dropdown">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">{{user_role}}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToUserCenter">个人中心</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="main-container">
      <!-- 左侧功能模块导航 -->
      <div class="sidebar">
        <div class="module-nav">
          <div 
            v-for="module in moduleList" 
            :key="module.key"
            class="module-item"
            :class="{ active: currentModuleKey === module.key }"
            @click="switchModule(module.key)"
          >
            <div class="module-icon">
              <span class="icon-text">{{ module.icon }}</span>
            </div>
            <div class="module-info">
              <h3>{{ module.name }}</h3>
              <p>{{ module.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <div class="content-header">
          <h2>{{ currentModule }}</h2>
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>考籍管理</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentModule }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>

        <div class="content-body">
          <!-- 动态组件切换 -->
          <component 
            :is="currentComponent" 
            v-if="currentComponent"
            @module-change="handleModuleChange"
          />
          
          <!-- 默认欢迎页面 -->
          <div v-else class="welcome-page">
            <div class="welcome-content">
              <div class="welcome-icon">🎓</div>
              <h3>欢迎使用考籍管理系统</h3>
              <p>请从左侧选择要管理的功能模块</p>
              <div class="quick-stats">
                <el-row :gutter="20">
                  <el-col :span="4">
                    <el-card class="stat-card">
                      <div class="stat-number">{{ studentCount }}</div>
                      <div class="stat-label">总考生数</div>
                    </el-card>
                  </el-col>
                  <el-col :span="4">
                    <el-card class="stat-card">
                      <div class="stat-number">{{ majorCount }}</div>
                      <div class="stat-label">专业数</div>
                    </el-card>
                  </el-col>
                  <el-col :span="4">
                    <el-card class="stat-card">
                      <div class="stat-number">{{ courseCount }}</div>
                      <div class="stat-label">课程数</div>
                    </el-card>
                  </el-col>
                  <el-col :span="4">
                    <el-card class="stat-card">
                      <div class="stat-number">{{ examCenterCount }}</div>
                      <div class="stat-label">考试院数</div>
                    </el-card>
                  </el-col>
                  <el-col :span="4">
                    <el-card class="stat-card">
                      <div class="stat-number">{{ adminCount }}</div>
                      <div class="stat-label">管理员数</div>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { fetchStudentCount, fetchMajorCount, fetchCourseCount, fetchExamCenterCount, fetchAdminCount } from '@/api/getCommon'

// 导入功能模块组件
import StudentArchive from '../components/exam/StudentArchive.vue'
import ExemptionManagement from '../components/exam/ExemptionManagement.vue'
import CourseReplacement from '../components/exam/CourseReplacement.vue'
import TransferManagement from '../components/exam/TransferManagement.vue'
import GraduationManagement from '../components/exam/GraduationManagement.vue'
import LogManagement from '../components/exam/LogManagement.vue'
import {useUserStore} from '@/store/user'
const userStore = useUserStore()
const user_role=userStore.role
const router = useRouter()

// 响应式数据
const currentModuleKey = ref('')
const studentCount = ref('-')
const majorCount = ref('-')
const courseCount = ref('-')
const examCenterCount = ref('-')
const adminCount = ref('-')

onMounted(async () => {
  try {
    const [stuRes, majorRes, courseRes, examRes, adminRes] = await Promise.all([
      fetchStudentCount(),
      fetchMajorCount(),
      fetchCourseCount(),
      fetchExamCenterCount(),
      fetchAdminCount()
    ])
    studentCount.value = (stuRes && stuRes.data && stuRes.data.code === 100000) ? stuRes.data.data : '-'
    majorCount.value = (majorRes && majorRes.data && majorRes.data.code === 100000) ? majorRes.data.data : '-'
    courseCount.value = (courseRes && courseRes.data && courseRes.data.code === 100000) ? courseRes.data.data : '-'
    examCenterCount.value = (examRes && examRes.data && examRes.data.code === 100000) ? examRes.data.data : '-'
    adminCount.value = (adminRes && adminRes.data && adminRes.data.code === 100000) ? adminRes.data.data : '-'
  } catch (e) {
    studentCount.value = majorCount.value = courseCount.value = examCenterCount.value = adminCount.value = '-'
  }
})

// 功能模块配置
const moduleList = ref([
  {
    key: 'student-archive',
    name: '考生考籍档案管理',
    description: '考籍建档、信息维护、成绩关联、状态管理',
    icon: '👤',
    component: markRaw(StudentArchive)
  },
  {
    key: 'exemption-management',
    name: '考生免考管理',
    description: '免考政策配置、申请审核、结果归档',
    icon: '📄',
    component: markRaw(ExemptionManagement)
  },
  {
    key: 'course-replacement',
    name: '课程顶替管理',
    description: '顶替规则管理、自动匹配、手动申请',
    icon: '🔄',
    component: markRaw(CourseReplacement)
  },
  {
    key: 'transfer-management',
    name: '考籍转入转出管理',
    description: '转入申请、转出申请、审核流程',
    icon: '📤',
    component: markRaw(TransferManagement)
  },
  {
    key: 'graduation-management',
    name: '毕业管理',
    description: '毕业申请、资格审核、证书发放',
    icon: '🎓',
    component: markRaw(GraduationManagement)
  },
  {
    key: 'log-management',
    name: '日志管理',
    description: '操作日志、查询统计、异常预警',
    icon: '📋',
    component: markRaw(LogManagement)
  }
])

// 计算属性
const currentModule = computed(() => {
  const module = moduleList.value.find(m => m.key === currentModuleKey.value)
  return module ? module.name : ''
})

const currentComponent = computed(() => {
  const module = moduleList.value.find(m => m.key === currentModuleKey.value)
  return module ? module.component : null
})

// 切换功能模块
const switchModule = (moduleKey) => {
  currentModuleKey.value = moduleKey
  const module = moduleList.value.find(m => m.key === moduleKey)
  if (module) {
    ElMessage.success(`已切换到 ${module.name}`)
  }
}

// 处理子组件事件
const handleModuleChange = (data) => {
  console.log('子组件事件:', data)
  ElMessage.success('操作成功')
}

// 用户相关功能
const goToUserCenter = () => {
  router.push('/user')
}

const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 清除登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户取消
  }
}

// 审核结果信息（可根据实际业务动态赋值）
const auditResultMessage = ref('暂无审核结果')
</script>

<style scoped>
.exam-management {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 顶部导航栏 */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  min-width: 0;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
  flex-shrink: 0;
  min-width: 0;
  white-space: nowrap;
}

.user-dropdown:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #fff;
}

/* 主容器 */
.main-container {
  display: flex;
  min-height: calc(100vh - 64px);
}

/* 侧边栏 */
.sidebar {
  width: 320px;
  background: white;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.module-nav {
  padding: 20px;
}

.module-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.module-item:hover {
  background-color: #f5f7fa;
  transform: translateX(4px);
}

.module-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-right: 12px;
}

.icon-text {
  font-size: 20px;
}

.module-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.module-info p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.content-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.breadcrumb {
  font-size: 14px;
}

/* 内容主体 */
.content-body {
  background: white;
  border-radius: 8px;
  min-height: calc(100vh - 200px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 欢迎页面 */
.welcome-page {
  padding: 60px 40px;
  text-align: center;
}

.welcome-content {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.welcome-content h3 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 16px;
}

.welcome-content p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 40px;
}

.quick-stats {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  max-width: 800px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.stat-card {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  height: 100%;
  box-sizing: border-box;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
  width: 100%;
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar {
    width: 280px;
  }
  
  .module-nav {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .content-area {
    padding: 16px;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .welcome-page {
    padding: 40px 20px;
  }
  
  .quick-stats .el-col {
    margin-bottom: 16px;
  }
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.content-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.sidebar::-webkit-scrollbar-thumb,
.content-area::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.content-area::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.audit-result-alert {
  padding: 0 8px;
  height: 36px;
  display: flex;
  align-items: center;
  font-size: 13px;
  background: rgba(255,255,255,0.15);
  border-radius: 6px;
  margin-right: 12px;
  max-width: 220px;
  min-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}
</style>