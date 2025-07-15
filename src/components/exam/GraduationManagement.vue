<template>
  <div class="graduation-management">
    <!-- 功能操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
    <el-col :span="6">
      <el-button type="primary" @click="dialogVisible = true">
        <el-icon><Plus /></el-icon>
        毕业申请
      </el-button>
  <!-- 毕业申请表单弹窗 -->
  <el-dialog v-model="dialogVisible" title="毕业申请" width="500px" :close-on-click-modal="false">
    <el-form :model="form" label-width="110px">
      <el-form-item label="毕业情况：">
      </el-form-item>
      <el-form-item label="姓名：">
      </el-form-item>
      <el-form-item label="考籍号：">
      </el-form-item>
      <el-form-item label="身份证号：">
      </el-form-item>
      <el-form-item label="性别：">
      </el-form-item>
      <el-form-item label="考试院：">
      </el-form-item>
      <el-form-item label="专业：">
      </el-form-item>
      <el-form-item label="总修课程数：">
      </el-form-item>
      <el-form-item label="总修学分数：">
      </el-form-item>
      <el-form-item label="均分：">
      </el-form-item>
      <el-form-item label="已修课程清单：">
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

// 弹窗显示控制
const dialogVisible = ref(false)

// 表单数据
const form = reactive({
  graduationStatus: '',
  studentName: '',
  studentId: '',
  idNumber: '',
  gender: '',
  examInstitute: '',
  major: '',
  courseCount: '',
  totalCredits: '',
  averageScore: '',
  courseList: ''
})
const formRef = ref()

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