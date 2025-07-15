<template>
  <div class="score-management">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="学生姓名">
              <el-input 
                v-model="searchForm.name" 
                placeholder="请输入学生姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="课程代码">
              <el-input 
                v-model="searchForm.courseName" 
                placeholder="请输入课程名字"
                clearable
                 @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">

          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-button type="primary" @click="handleSearch" :loading="searchLoading">
              <el-icon><Search /></el-icon>
              查询成绩
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="success" @click="showAddScoreDialog" v-if="hasPermission('score_add')">
              <el-icon><Plus /></el-icon>
              成绩补录
            </el-button>
            <el-button type="warning" @click="showCorrectionDialog" v-if="hasPermission('score_correction')">
              <el-icon><Edit /></el-icon>
              成绩更正申请
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 成绩列表 -->
    <el-card class="score-list-card" v-if="scoreList.length > 0">
      <template #header>
        <div class="card-header">
          <span>成绩列表</span>
          <div class="header-actions">
            <el-button type="primary" size="small" @click="exportScores">
              <el-icon><Download /></el-icon>
              导出成绩
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="scoreList" border stripe>
        <el-table-column prop="courseCode" label="课程代码" width="120" />
        <el-table-column prop="courseName" label="课程名称" width="200" />
        <el-table-column prop="courseScore" label="成绩" width="100">
          <template #default="{ row }">
            <span :class="{ 'pass-score': row.courseScore >= 60, 'fail-score': row.courseScore < 60 }">
              {{ row.courseScore }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 成绩补录对话框 -->
    <el-dialog 
      v-model="addScoreDialogVisible" 
      title="成绩补录" 
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="addScoreFormRef" 
        :model="addScoreForm" 
        :rules="addScoreRules" 
        label-width="100px"
      >
        <el-form-item label="学生姓名" prop="name">
          <el-input v-model="addScoreForm.name" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="addScoreForm.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="成绩" prop="courseScore">
          <el-input-number v-model="addScoreForm.courseScore" :min="0" :max="100" :precision="2" placeholder="请输入成绩" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addScoreDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddScore" :loading="addScoreLoading">确认补录</el-button>
      </template>
    </el-dialog>

    <!-- 成绩更正申请对话框 -->
    <el-dialog 
      v-model="correctionDialogVisible" 
      title="成绩更正申请" 
      width="500px"
    >
      <el-form 
        ref="correctionFormRef" 
        :model="correctionForm" 
        :rules="correctionRules" 
        label-width="100px"
      >
        <el-form-item label="学生姓名" prop="name">
          <el-input v-model="correctionForm.name" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="correctionForm.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="更正成绩" prop="score">
          <el-input-number 
            v-model="correctionForm.score" 
            :min="0" 
            :max="100" 
            :precision="1"
            placeholder="请输入更正后的成绩"
          />
        </el-form-item>
        <el-form-item label="更正原因" prop="correctionReason">
          <el-input 
            v-model="correctionForm.correctionReason" 
            type="textarea" 
            :rows="3"
            placeholder="请详细说明更正原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="correctionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCorrection" :loading="correctionLoading">
          提交申请
        </el-button>
      </template>
    </el-dialog>

    <!-- 成绩详情对话框 -->
    <el-dialog 
      v-model="scoreDetailDialogVisible" 
      title="成绩详情" 
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="考籍号">{{ scoreDetail.archiveNumber }}</el-descriptions-item>
        <el-descriptions-item label="课程代码">{{ scoreDetail.courseCode }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ scoreDetail.courseName }}</el-descriptions-item>
        <el-descriptions-item label="课程类型">
          <el-tag :type="getCourseTypeTag(scoreDetail.courseType)">
            {{ getCourseTypeText(scoreDetail.courseType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="考试时间">{{ scoreDetail.examDate }}</el-descriptions-item>
        <el-descriptions-item label="成绩">
          <span :class="{ 'pass-score': scoreDetail.score >= 60, 'fail-score': scoreDetail.score < 60 }">
            {{ scoreDetail.score }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getScoreStatusTag(scoreDetail.status)">
            {{ getScoreStatusText(scoreDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="录入时间">{{ scoreDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ scoreDetail.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ scoreDetail.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Edit, Download } from '@element-plus/icons-vue'
import { 
  getStudentCoursesByName, 
  addStudentScore, 
  submitScoreCorrection,
  updateStudentCourse
} from '@/api/getStudent.js'

// 定义组件属性
const props = defineProps({
  name: {
    type: String,
    default: ''
  }
})

// 定义组件事件
const emit = defineEmits(['close', 'refresh'])

// 响应式数据
const searchForm = reactive({
  name: '',
  courseName: ''
})

const allCourses = ref([])
const scoreList = ref([])
const searchLoading = ref(false)
const addScoreDialogVisible = ref(false)
const correctionDialogVisible = ref(false)
const scoreDetailDialogVisible = ref(false)
const addScoreLoading = ref(false)
const correctionLoading = ref(false)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 成绩补录表单
const addScoreFormRef = ref()
const addScoreForm = reactive({
  name: '',         // 学生姓名
  courseName: '',   // 课程名称
  courseScore: null // 课程成绩
})

const addScoreRules = {
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  courseName: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  courseScore: [
    { required: true, message: '请输入成绩', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '成绩必须在0-100之间', trigger: 'blur' }
  ]
}

// 成绩更正表单
const correctionFormRef = ref()
const correctionForm = reactive({
  name: '',               // 学生姓名
  courseName: '',         // 课程名称
  score: null,   // 更正后的成绩
})

const correctionRules = {
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  courseName: [
    { required: true, message: '请输入课程名称', trigger: 'blur' }
  ],
  score: [
    { required: true, message: '请输入更正成绩', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '成绩必须在0-100之间', trigger: 'blur' }
  ],
  correctionReason: [
    { required: true, message: '请输入更正原因', trigger: 'blur' },
    { min: 10, message: '更正原因至少10个字符', trigger: 'blur' }
  ]
}

// 成绩详情
const scoreDetail = ref({})

// 上传相关
const uploadRef = ref()
const uploadUrl = '/api/upload' // 实际的上传接口
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

// 权限检查
const hasPermission = (permission) => {
  // 这里应该根据实际权限系统实现
  const userRole = localStorage.getItem('userRole') || 'admin'
  const permissions = {
    admin: ['score_add', 'score_edit', 'score_correction'],
    teacher: ['score_add', 'score_edit'],
    student: []
  }
  return permissions[userRole]?.includes(permission) || false
}

// 搜索成绩
const handleSearch = async () => {
  if (!searchForm.name) {
    ElMessage.warning('请输入学生姓名进行查询')
    return
  }
  
  // 每次查询都重新请求数据，确保数据最新
  searchLoading.value = true
  try {
    const res = await getStudentCoursesByName({ name: searchForm.name })
    if (res.data && Array.isArray(res.data.data)) {
      allCourses.value = res.data.data
      // 根据课程名筛选
      if (!searchForm.courseName) {
        scoreList.value = allCourses.value
      } else {
        scoreList.value = allCourses.value.filter(item =>
          item.courseName && item.courseName.includes(searchForm.courseName)
        )
      }
      pagination.total = scoreList.value.length
      if (scoreList.value.length > 0) {
        ElMessage.success('查询成功')
      } else {
        ElMessage.warning('未找到匹配的课程')
      }
    } else {
      allCourses.value = []
      scoreList.value = []
      pagination.total = 0
      ElMessage.error(res.data?.msg || '未查询到成绩')
    }
  } catch (error) {
    console.error('查询成绩失败:', error)
    allCourses.value = []
    scoreList.value = []
    pagination.total = 0
    ElMessage.error('查询失败，请重试')
  } finally {
    searchLoading.value = false
  }
}

// 监听考籍号变化，自动填充搜索表单
watch(() => props.name, (newValue) => {
  if (newValue) {
    searchForm.name = newValue
    allCourses.value = [] // 切换学生时清空
  }
}, { immediate: true })

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    courseCode: ''
  })
  scoreList.value = []
  pagination.total = 0
}

// 显示成绩补录对话框
const showAddScoreDialog = () => {
  addScoreDialogVisible.value = true
  Object.assign(addScoreForm, {
    name: props.name || '',
    courseName: '',
    courseScore: null
  })
}

// 提交补录表单
const submitAddScore = async () => {
  if (!addScoreFormRef.value) return
  try {
    await addScoreFormRef.value.validate()
    addScoreLoading.value = true
    // 只传这三个字段
    console.log(addScoreForm)
    const response = await updateStudentCourse({
      studentName: addScoreForm.name,
      courseName: addScoreForm.courseName,
      score: addScoreForm.courseScore
    })
    ElMessage.success('成绩补录成功')
    addScoreDialogVisible.value = false
    // 触发刷新事件，通知父组件重新查询
    emit('refresh')
    
    // 同时刷新当前组件的成绩列表
    if (searchForm.name) {
      // 如果当前有查询条件，则重新查询
      await handleSearch()
    }
  } catch (error) {
    ElMessage.error('成绩补录失败')
  } finally {
    addScoreLoading.value = false
  }
}

// 显示成绩更正对话框
const showCorrectionDialog = () => {
  correctionDialogVisible.value = true
  Object.assign(correctionForm, {
    name: props.name || '', // 确保姓名也被填充
    courseName: '',
    score: null
  })
}

// 提交成绩更正申请
const submitCorrection = async () => {
  if (!correctionFormRef.value) return

  try {
    await correctionFormRef.value.validate()
    correctionLoading.value = true

    // 使用新的字段结构提交
    const response = await updateStudentCourse({
      studentName: correctionForm.name,
      courseName: correctionForm.courseName,
      score: correctionForm.score
    })
    
    ElMessage.success('成绩更正申请提交成功')
    correctionDialogVisible.value = false
    
    // 触发刷新事件，通知父组件重新查询
    emit('refresh')
    
    // 如果当前有查询条件，刷新列表
    if (searchForm.name) {
      await handleSearch()
    }
  } catch (error) {
    console.error('提交更正申请失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    correctionLoading.value = false
  }
}

// 查看成绩详情
const viewScoreDetail = (row) => {
  scoreDetail.value = { ...row }
  scoreDetailDialogVisible.value = true
}

// 编辑成绩
const editScore = (row) => {
  // 这里可以实现编辑功能，或者跳转到编辑页面
  ElMessage.info('编辑功能开发中...')
}

// 导出成绩
const exportScores = () => {
  ElMessage.info('导出功能开发中...')
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
}

// 文件上传处理
const handleUploadSuccess = (response, file) => {
  correctionForm.evidenceFiles.push({
    name: file.name,
    url: response.url
  })
  ElMessage.success('文件上传成功')
}

const handleUploadError = (error) => {
  ElMessage.error('文件上传失败')
}

const beforeUpload = (file) => {
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传PDF、Word或图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  return true
}

// 工具函数
const getCourseTypeTag = (type) => {
  const tags = {
    theory: 'primary',
    practice: 'success',
    thesis: 'warning'
  }
  return tags[type] || 'info'
}

const getCourseTypeText = (type) => {
  const texts = {
    theory: '理论课',
    practice: '实践课',
    thesis: '毕业论文'
  }
  return texts[type] || '未知'
}

const getScoreStatusTag = (status) => {
  const tags = {
    normal: 'success',
    corrected: 'warning',
    pending: 'info'
  }
  return tags[status] || 'info'
}

const getScoreStatusText = (status) => {
  const texts = {
    normal: '正常',
    corrected: '已更正',
    pending: '待审核'
  }
  return texts[status] || '未知'
}

// 组件挂载时初始化
onMounted(() => {
  // 可以在这里加载一些初始数据
})
</script>

<style scoped>
.score-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  padding: 20px 0;
}

.score-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

.pass-score {
  color: #67c23a;
  font-weight: bold;
}

.fail-score {
  color: #f56c6c;
  font-weight: bold;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}
</style>