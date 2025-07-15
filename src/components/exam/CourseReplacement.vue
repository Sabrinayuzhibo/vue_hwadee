<template>
  <div class="course-replacement">
    <!-- 顶部按钮 -->
    <div style="margin-bottom: 16px;">
      
        <el-button type="primary" @click="showManualDialog = true">
          {{ userStore.role === '管理员' ? '手动审批顶替' : '手动申请顶替' }}
        </el-button>
      
      <el-button v-if="userStore.role === '管理员'" type="primary" style="margin-left: 8px;">自动审批顶替</el-button>
    </div>

    <!-- 课程顶替规则管理 -->
    <template v-if="userStore.role === '管理员'">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>课程顶替规则管理</span>
            <el-button type="primary" @click="showRuleDialog = true" style="margin-left: 12px;">
              <el-icon><Plus /></el-icon>
              新增顶替规则
            </el-button>
          </div>
        </template>
        <el-table :data="replacementList" stripe style="width: 100%">
          <el-table-column prop="oldCourseName" label="原课程名称" width="150" />
          <el-table-column prop="newCourseName" label="新课程名称" width="150" />
          <el-table-column prop="majorName" label="适用专业" width="150" />
          <!-- 移除生效时间和失效时间列 -->
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" type="danger" @click="deleteRule(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- 新增顶替规则对话框 -->
    <el-dialog v-model="showRuleDialog" title="新增顶替规则" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="原课程名称">
          <el-select v-model="ruleForm.oldCourseName" filterable placeholder="请选择原课程">
            <el-option v-for="item in courseOptions" :key="item.courseId" :label="item.courseName" :value="item.courseName" />
          </el-select>
        </el-form-item>
        <el-form-item label="新课程名称">
          <el-select v-model="ruleForm.newCourseName" filterable placeholder="请选择新课程">
            <el-option v-for="item in courseOptions" :key="item.courseId" :label="item.courseName" :value="item.courseName" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用专业">
          <el-select v-model="ruleForm.majorName" filterable placeholder="请选择专业">
            <el-option v-for="item in majorOptions" :key="item.majorCode" :label="item.majorName" :value="item.majorName" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker v-model="ruleForm.effectiveFrom" type="date" placeholder="选择生效日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="失效时间">
          <el-date-picker v-model="ruleForm.effectiveTo" type="date" placeholder="选择失效日期" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>

    <!-- 顶替记录 -->
   <el-card class="mt-4">
      <template #header><span>顶替记录</span></template>
      <el-table :data="recordList" stripe :row-class-name="statusRowClass">
        <el-table-column prop="applicationId" label="申请编号" />
        <el-table-column prop="oldCourseCode" label="原课程代码" />
        <el-table-column prop="oldCourseName" label="原课程名称" />
        <el-table-column prop="newCourseCode" label="新课程代码" />
        <el-table-column prop="newCourseName" label="新课程名称" />
        <el-table-column prop="reason" label="申请理由" />
        <el-table-column prop="status" label="审核状态" />
        <el-table-column prop="reviewReason" label="审核意见" />
        <el-table-column prop="updateTime" label="更新时间" />
      </el-table>
      <el-pagination
        v-if="userStore.role === '管理员'"
        class="mt-2"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        :page-sizes="[10,20,50]"
        :current-page="pageNum"
        @size-change="getRecords"
        @current-change="getRecords"
      />
    </el-card>

    <!-- 手动申请顶替对话框 -->
    <el-dialog v-model="showManualDialog" :title="userStore.role === '管理员' ? '手动审批顶替' : '手动申请顶替'" width="400px">
      <el-form :model="manualForm" label-width="100px">
        <template v-if="userStore.role === '管理员'">
          <el-form-item label="申请编号">
            <el-input v-model="manualForm.applicationId" />
          </el-form-item>
          <el-form-item label="审批状态">
            <el-select v-model="manualForm.status" placeholder="请选择审批状态">
              <el-option label="通过" value="通过" />
              <el-option label="驳回" value="驳回" />
              <el-option label="待审核" value="待审核" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核意见">
            <el-input v-model="manualForm.reviewReason" type="textarea" rows="2" />
          </el-form-item>
          <el-form-item label="审批人姓名">
            <el-input v-model="manualForm.adminName" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="原课程名称"><el-input v-model="manualForm.oldCourseName" /></el-form-item>
          <el-form-item label="新课程名称"><el-input v-model="manualForm.newCourseName" /></el-form-item>
          <el-form-item label="申请理由"><el-input v-model="manualForm.reason" type="textarea" rows="2" /></el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="showManualDialog = false">取消</el-button>
        <el-button type="primary" @click="submitManual">
          {{ userStore.role === '管理员' ? '提交审批' : '提交申请' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { fetchReplacementRules, createReplacementRule, deleteReplacementRule, fetchCourseList, fetchMajorList, autoMatchReplacement, submitReplacementRequest
  ,courseStudentLoad, courseAdminLoad
 } from '@/api/getCourseReplacement.js'

const replacementList = ref([])
const showRuleDialog = ref(false)
const ruleForm = reactive({ oldCourseName: '', newCourseName: '', majorName: '', effectiveFrom: '', effectiveTo: '' })
const manualForm = reactive({ oldCourseName: '', newCourseName: '', reason: '' })
const showManualDialog = ref(false)
const recordList = ref([])
const takenCourses = ref([])
const courseOptions = ref([])
const majorOptions = ref([])
const userStore = useUserStore()

const pageNum = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)  // 新增总条数

const getRules = async () => {
  const res = await fetchReplacementRules()
  if (res.data && Array.isArray(res.data.data)) {
    replacementList.value = res.data.data
  } else {
    replacementList.value = []
  }
}

const getCourseOptions = async () => {
  const res = await fetchCourseList()
  if (res.data && Array.isArray(res.data.data)) {
    courseOptions.value = res.data.data
  } else {
    courseOptions.value = []
  }
}

const getMajorOptions = async () => {
  const res = await fetchMajorList()
  if (res.data && Array.isArray(res.data.data)) {
    majorOptions.value = res.data.data
  } else {
    majorOptions.value = []
  }
}

const saveRule = async () => {
  // 日期格式化为 yyyy-MM-dd
  if (ruleForm.effectiveFrom instanceof Date) {
    ruleForm.effectiveFrom = ruleForm.effectiveFrom.toISOString().slice(0, 10)
  }
  if (ruleForm.effectiveTo instanceof Date) {
    ruleForm.effectiveTo = ruleForm.effectiveTo.toISOString().slice(0, 10)
  }
  await createReplacementRule(ruleForm)
  ElMessage.success('保存成功')
  showRuleDialog.value = false
  getRules()
  Object.keys(ruleForm).forEach(k => ruleForm[k] = '')
}
const deleteRule = async (row) => {
  await deleteReplacementRule(row)
  ElMessage.success('删除成功')
  getRules()
}
const submitManual = async () => {
  if (userStore.role !== '管理员') {
    if (!manualForm.oldCourseName || !manualForm.newCourseName) {
      ElMessage.warning('请填写完整信息')
      return
    }
  }

  try {
    if (userStore.role === '管理员') {
      // 管理员审批提交逻辑（示例，需根据实际接口调整）
      // 假设有对应的审批接口，暂时用 submitReplacementRequest 替代
      await submitReplacementRequest({
        applicationId: manualForm.applicationId,
        status: manualForm.status,
        reviewReason: manualForm.reviewReason,
        adminName: serStore.name,
      })
      ElMessage.success('审批提交成功')
    } else {
      await submitReplacementRequest({
        studentName: userStore.name,
        oldCourseName: manualForm.oldCourseName,
        newCourseName: manualForm.newCourseName,
        reason: manualForm.reason
      })
      ElMessage.success('课程替换申请提交成功')
    }
    showManualDialog.value = false
    Object.keys(manualForm).forEach(k => manualForm[k] = '')
    getRecords()
  } catch (e) {
    ElMessage.error(e?.response?.data?.msg || '提交失败，请稍后再试')
  }
}
const getRecords = async () => {
  try {
    let res
    if (userStore.role === '管理员') {
      res = await courseAdminLoad({ key: userStore.name, pageNum: pageNum.value, pageSize: pageSize.value })
      // 如果后端响应包含 total，则更新 totalCount
      if (res.data.data && res.data.data.length > 0) {
        totalCount.value = res.data.data.length
        console.log(totalCount.value)
      }
    } else {
      res = await courseStudentLoad(userStore.name)
      // 学生端暂不支持分页，总条数默认0
      totalCount.value = 0
    }

    if (res.data && Array.isArray(res.data.data)) {
      recordList.value = res.data.data
    } else {
      recordList.value = []
    }
  } catch (err) {
    ElMessage.error('加载顶替记录失败')
  }
}

const statusRowClass = ({ row }) => {
  if (row.status === '通过') return 'row-success'
  if (row.status === '驳回') return 'row-danger'
  if (row.status === '待审核') return 'row-pending'
  return ''
}

onMounted(() => {
  getRules()
  getRecords()
  getCourseOptions()
  getMajorOptions()
})
</script>

<style scoped>
.course-replacement {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.row-success {
  background-color: #f0f9eb;
}
.row-danger {
  background-color: #fef0f0;
}
.row-pending {
  background-color: #fdf6ec;
}
.mt-2 {
  margin-top: 12px;
}
</style>