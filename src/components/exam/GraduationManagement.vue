<template>
  <div class="graduation-management">
    <!-- 功能操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
    <el-col :span="6">
      <el-button type="primary" @click="handleGraduateVerify">
        <el-icon><Plus /></el-icon>
        毕业核验
      </el-button>
  <!-- 毕业核验表单弹窗 -->
  <el-dialog v-model="dialogVisible" title="毕业核验" width="500px" :close-on-click-modal="false">
    <el-form :model="form" label-width="110px">
      <el-form-item label="毕业情况：">
        <div v-if="form.msg !== ''" style="color: green;">
          {{ form.msg }}
        </div>
        <div v-else style="color: red;">
          未知状态
        </div>
      </el-form-item>
      <el-form-item label="姓名：">
        <span>{{ form.studentName }}</span>
      </el-form-item>
      <el-form-item label="考籍号：">
        <span>{{ form.studentId }}</span>
      </el-form-item>
      <el-form-item label="身份证号：">
        <span>{{ form.studentIdNumber }}</span>
      </el-form-item>
      <el-form-item label="性别：">
        <span>{{ form.gender }}</span>
      </el-form-item>
      <el-form-item label="考试院：">
        <span>{{ form.examCenterName }}</span>
      </el-form-item>
      <el-form-item label="专业：">
        <span>{{ form.majorName }}</span>
      </el-form-item>
      <el-form-item label="总修课程数：">
        <span>{{ form.numOfCourses || '无' }}</span>
      </el-form-item>
      <el-form-item label="总修学分数：">
        <span>{{ form.numOfCredits || '无' }}</span>
      </el-form-item>
      <el-form-item label="均分：">
        <span>{{ form.averageScores || '无' }}</span>
      </el-form-item>
      <el-form-item label="已修课程清单：">
  <div v-if="form.coursesList.length > 0">
    <el-table :data="form.coursesList" style="width: 100%">
      <el-table-column 
        prop="courseName" 
        label="课程名称"
        min-width="200"
        :show-overflow-tooltip="true"
      />
    </el-table>
  </div>
  <div v-else>
    暂无课程记录
  </div>
</el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关 闭</el-button>
      </span>
    </template>
  </el-dialog>
    </el-col>
      </el-row>
    </div>


    <!-- 毕业申请列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>毕业申请列表</span>
        </div>
      </template>

      <el-table :data="graduationList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="studentName" label="姓名" />
        <el-table-column prop="studentId" label="考籍号" />
        <el-table-column prop="studentIdNumber" label="身份证号" />
        <el-table-column prop="gender" label="性别" />
        <el-table-column prop="examCenterName" label="考试院" />
        <el-table-column prop="majorName" label="专业" />
        <el-table-column prop="numOfCourses" label="总课程" />
        <el-table-column prop="numOfCredits" label="总学分" />
        <el-table-column prop="averageScores" label="均分" />
      </el-table>

    </el-card>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Document, Download } from '@element-plus/icons-vue'
import { getGraduationList } from '@/api/getGraduation'
import { postGraduateVerify } from '@/api/getGraduation'
import { useUserStore } from '@/store/user'

// 弹窗显示控制
const dialogVisible = ref(false)

// 当前登录用户信息（假设有 userStore，实际按你的项目获取用户名）
const userStore = useUserStore()

// 毕业核验表单数据
const form = reactive({
  msg: '',
  studentName: '',
  studentId: '',
  studentIdNumber: '',
  gender: '',
  examCenterName: '',
  majorId: '',
  majorName: '',
  numOfCourses: '',
  numOfCredits: '',
  averageScores: '',
  coursesList: []
})

// 毕业核验按钮点击
const handleGraduateVerify = async () => {
  dialogVisible.value = true
  // 获取当前登录用户姓名
  const name = userStore.name
  const role = userStore.role
  console.log('当前用户角色:', role)
  console.log('当前用户姓名:', name)
  if (!name) {
    ElMessage.error('未获取到当前用户姓名')
    return
  }
  try {
    const res = await postGraduateVerify(name)
    if (res.data && res.data.data) {
      const data = res.data.data
      // 填充表单
      form.msg = data.msg || ''
      form.studentName = data.studentName || ''
      form.studentId = data.studentId || ''
      form.studentIdNumber = data.studentIdNumber || ''
      form.gender = data.gender || ''
      form.examCenterName = data.examCenterName || ''
      form.majorId = data.majorId || ''
      form.majorName = data.majorName || ''
      form.numOfCourses = data.numOfCourses || ''
      form.numOfCredits = data.numOfCredits || ''
      form.averageScores = data.averageScores || ''
      form.coursesList = data.coursesList?.map(courseName => ({
        courseName: courseName,
      })) || []
    } else {
      ElMessage.error(res.data?.msg || '未查到毕业信息')
    }
  } catch (e) {
    ElMessage.error('毕业核验失败')
  }
}

// 响应式数据
const loading = ref(false)
const total = ref(0)
// 毕业申请列表
const graduationList = ref([])

// 获取毕业生列表
const fetchGraduationList = async () => {
  loading.value = true
  try {
    const res = await getGraduationList()
    // 兼容 axios 响应结构
    const list = res.data?.data || res.data || []
    graduationList.value = list.map(item => ({
      studentName: item.studentName,
      studentId: item.studentId, // 正确显示考籍号
      studentIdNumber: item.studentIdNumber, // 身份证号，如需显示可加一列
      gender: item.gender,
      examCenterName: item.examCenterName,
      majorName: item.majorName,
      numOfCourses: item.numOfCourses,
      numOfCredits: item.numOfCredits,
      averageScores: item.averageScores
    }))
    total.value = graduationList.value.length
  } catch (e) {
    ElMessage.error('获取毕业申请列表失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  fetchGraduationList()
})
</script>

<style scoped>
.graduation-management {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.chart-placeholder {
  color: #909399;
  font-size: 14px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style>