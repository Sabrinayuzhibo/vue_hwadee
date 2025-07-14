<template>
  <div class="graduation-management">
    <!-- 功能操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" @click="showApplyDialog = true">
            <el-icon><Plus /></el-icon>
            毕业申请
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="showAuditDialog = true">
            <el-icon><Search /></el-icon>
            资格审核
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索条件 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="考生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入考生姓名" clearable />
        </el-form-item>
        <el-form-item label="考籍号">
          <el-input v-model="searchForm.studentId" placeholder="请输入考籍号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchGraduations">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 毕业申请列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>毕业申请列表</span>
        </div>
      </template>

      <el-table :data="graduationList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="studentId" label="考籍号" width="120" />
        <el-table-column prop="studentName" label="考生姓名" width="100" />
        <el-table-column prop="major" label="专业" width="150" />
        <!-- 申请时间已删除 -->
        <el-table-column prop="courseCount" label="课程数" width="80" />
        <el-table-column prop="totalCredits" label="总学分" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getGraduationStatusType(scope.row.status)">
              {{ getGraduationStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditor" label="审核人" width="100" />
        <!-- 审核时间已删除 -->
        <!-- 操作列已删除 -->
      </el-table>

    </el-card>

    <!-- 毕业申请对话框 -->
    <el-dialog v-model="showApplyDialog" title="毕业申请" width="700px">
      <el-form :model="applyForm" :rules="applyRules" ref="applyFormRef" label-width="120px">
        <el-form-item label="考籍号">
          <el-input v-model="applyForm.studentId" placeholder="请输入考籍号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showApplyDialog = false">取消</el-button>
          <el-button type="primary" @click="submitGraduation">提交申请</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 资格审核对话框 -->
    <el-dialog v-model="showAuditDialog" title="毕业资格审核" width="600px">
      <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="120px">
        <el-form-item label="审核结果" prop="result">
          <el-radio-group v-model="auditForm.result">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否符合毕业条件" prop="qualified" label-width="180px">
          <!-- 选项已移除 -->
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAuditDialog = false">取消</el-button>
          <el-button type="primary" @click="submitAudit">确认申请</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Search, 
  Document, 
  Download
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showApplyDialog = ref(false)
const showAuditDialog = ref(false)

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)


// 搜索表单
const searchForm = reactive({
  studentName: '',
  studentId: ''
})

// 申请表单
const applyForm = reactive({
  studentId: '',
  studentName: '',
  major: ''
})

// 审核表单
const auditForm = reactive({
  result: '',
  qualified: null
})

// 表单验证规则
const applyRules = {}

const auditRules = {
  result: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  qualified: [
    { required: true, message: '请选择是否符合毕业条件', trigger: 'change' }
  ]
}

// 毕业申请列表
const graduationList = ref([])



// 获取毕业状态类型
const getGraduationStatusType = (status) => {
  const types = {
    pending: 'warning',
    first_approved: 'info',
    final_approved: 'success',
    certified: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取毕业状态文本
const getGraduationStatusText = (status) => {
  const texts = {
    pending: '待审核',
    first_approved: '初审通过',
    final_approved: '终审通过',
    certified: '已发证',
    rejected: '已驳回'
  }
  return texts[status] || '未知'
}

// 搜索毕业申请
const searchGraduations = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

// 查看详情
const viewDetail = (row) => {
  ElMessage.info(`查看毕业申请详情: ${row.studentName}`)
}

// 审核毕业申请
const auditGraduation = (row) => {
  showAuditDialog.value = true
  ElMessage.info(`审核毕业申请: ${row.studentName}`)
}

// 发证
const issueCertificate = (row) => {
  ElMessageBox.confirm(`确定要为考生 ${row.studentName} 发放毕业证书吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('毕业证书发放成功')
  })
}



// 搜索考生
const searchStudent = () => {
  // 模拟查询考生信息
  applyForm.studentName = '张三'
  applyForm.major = '计算机科学与技术'
}



// 提交毕业申请
const submitGraduation = () => {
  ElMessage.success('毕业申请提交成功')
  showApplyDialog.value = false
}

// 提交审核
const submitAudit = () => {
  ElMessage.success('审核提交成功')
  showAuditDialog.value = false
}



// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  searchGraduations()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  searchGraduations()
}

// 组件挂载时初始化数据
onMounted(() => {
  total.value = graduationList.value.length
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