<template>
  <div class="graduation-management">
    <!-- 管理员端毕业申请列表 -->
    <el-card class="table-card" v-if="userStore.role === '管理员'">
      <template #header>
        <div class="card-header">
          <span>毕业学生列表</span>
        </div>
      </template>

      <el-table :data="currentPageList" stripe style="width: 100%" v-loading="loading">
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

      <el-pagination
        class="pagination-wrapper"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        :current-page="pageNum"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 学生端毕业核验按钮及弹窗 -->
    <div v-else>
      <div class="graduation-management">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>毕业信息总览</span>
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="毕业情况">
              <el-tag v-if="form.averageScores >= 80" type="success">表现优异</el-tag>
              <el-tag v-else-if="form.msg" type="warning">{{ form.msg }}</el-tag>
              <el-tag v-else type="danger">未知状态</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="姓名">{{ form.studentName }}</el-descriptions-item>
            <el-descriptions-item label="考籍号">{{ form.studentId }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ form.studentIdNumber }}</el-descriptions-item>
            <el-descriptions-item label="性别">
              <el-tag :type="form.gender === '男' ? 'primary' : 'danger'" effect="plain">{{ form.gender }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="考试院">{{ form.examCenterName }}</el-descriptions-item>
            <el-descriptions-item label="专业">{{ form.majorName }}</el-descriptions-item>
            <el-descriptions-item label="总修课程数">{{ form.numOfCourses || '无' }}</el-descriptions-item>
            <el-descriptions-item label="总修学分数">{{ form.numOfCredits || '无' }}</el-descriptions-item>
            <el-descriptions-item label="均分">{{ form.averageScores || '无' }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">已修课程清单</el-divider>
          <el-table :data="currentCourses" style="width: 100%" v-if="form.coursesList.length > 0">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="courseName" label="课程名称" min-width="200" :show-overflow-tooltip="true" />
          </el-table>
          <el-pagination
            class="pagination-wrapper"
            background
            layout="prev, pager, next"
            :total="form.coursesList.length"
            :page-size="coursePageSize"
            :current-page="coursePageNum"
            @current-change="handleCoursePageChange"
            v-if="form.coursesList.length > coursePageSize"
          />
          <div v-else style="color: #999;">暂无课程记录</div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getGraduationList, postGraduateVerify } from '@/api/getGraduation'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const dialogVisible = ref(false)

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

// 学生端毕业核验
const handleGraduateVerify = async () => {
  dialogVisible.value = true
  const name = userStore.name
  if (!name) {
    ElMessage.error('未获取到当前用户姓名')
    return
  }
  try {
    const res = await postGraduateVerify(name)
    console.log('postGraduateVerify 返回原始数据:', res.data)
    if (res.data && res.data.data) {
      const data = res.data.data
      console.log('毕业核验接口 data:', data)
      console.log('原始 coursesList:', data.coursesList)
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
      form.coursesList = Array.isArray(data.coursesList)
        ? data.coursesList.map(course => {
            return typeof course === 'string'
              ? { courseName: course }
              : course && typeof course === 'object' && 'courseName' in course
              ? { courseName: course.courseName }
              : { courseName: '' }
          })
        : []
    } else {
      ElMessage.error(res.data?.msg || '未查到毕业信息')
    }
  } catch (e) {
    ElMessage.error('毕业核验失败')
  }
}

// 管理员端分页及数据
const loading = ref(false)
const graduationList = ref([])
const total = ref(0)
const pageSize = ref(10)
const pageNum = ref(1)

const currentPageList = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  return graduationList.value.slice(start, end)
})

const handlePageChange = (val) => {
  pageNum.value = val
}

const handleSizeChange = (val) => {
  pageSize.value = val
  pageNum.value = 1
}

const coursePageSize = ref(10)
const coursePageNum = ref(1)

const currentCourses = computed(() => {
  const start = (coursePageNum.value - 1) * coursePageSize.value
  const end = start + coursePageSize.value
  return form.coursesList.slice(start, end)
})

const handleCoursePageChange = (val) => {
  coursePageNum.value = val
}

const fetchGraduationList = async () => {
  loading.value = true
  try {
    const res = await getGraduationList()
    const list = res.data?.data || res.data || []
    graduationList.value = list.map(item => ({
      studentName: item.studentName,
      studentId: item.studentId,
      studentIdNumber: item.studentIdNumber,
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

onMounted(() => {
  fetchGraduationList()
  if (userStore.role !== '管理员') {
    handleGraduateVerify()
  }
})
</script>

<style scoped>
.graduation-management {
  padding: 20px;
}
.operation-bar {
  margin-bottom: 20px;
}
.table-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>