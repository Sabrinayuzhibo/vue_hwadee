<template>
  <div class="course-replacement">
    <!-- 顶部按钮 -->
    <div class="top-buttons" style="margin-bottom: 24px;">
      
        <el-button type="primary" @click="showManualDialog = true">
          {{ userStore.role === '管理员' ? '手动审批免考' : '手动申请免考' }}
        </el-button>
    
    </div>

    <!-- 课程顶替规则管理 -->
    <template v-if="userStore.role === '管理员'">
      <el-card class="card-container">
        <template #header>
          <div class="card-header">
            <span>课程免考规则管理</span>
            <el-button type="primary" @click="showRuleDialog = true" class="header-button">
              <el-icon><Plus /></el-icon>
              新增免考规则
            </el-button>
          </div>
        </template>
        <el-table :data="replacementList" stripe style="width: 100%">
          <el-table-column prop="ruleId" label="免考规则Id" />
          <el-table-column prop="courseName" label="免考课程名称" />
          <el-table-column prop="courseCode" label="免考课程代码" />
          <el-table-column prop="name" label="免考规则" />
          <el-table-column prop="description" label="规则描述" />
          <!-- 移除生效时间和失效时间列 -->
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" type="danger" @click="deleteRule(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>

    <!-- 新增顶替规则对话框 -->
    <el-dialog v-model="showRuleDialog" title="新增免考规则" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="免考课程名称">
          <el-select v-model="ruleForm.oldCourseName" filterable placeholder="请选择免考课程">
            <el-option v-for="item in courseOptions" :key="item.courseId" :label="item.courseName" :value="item.courseName" />
          </el-select>
        </el-form-item>
        <el-form-item label="免考规则名称">
          <el-input v-model="ruleForm.newCourseName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="免考规则描述">
          <el-input type="textarea" v-model="ruleForm.majorName" placeholder="请输入规则描述" :rows="3" />
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
   <el-card class="mt-4 card-container">
      <template #header><span>免考申请记录</span></template>
      <el-table :data="recordList" stripe style="width: 100%">
        <el-table-column prop="applicationId" label="申请编号" />
        <el-table-column prop="studentId" label="考籍号" />
        <el-table-column prop="adminId" label="管理员Id" />
        <el-table-column prop="courseCode" label="课程代码" />
        <el-table-column prop="courseName" label="课程名称" />
        <el-table-column label="审核状态">
          <template #default="scope">
            <el-tag
              :type="getStatusTagType(scope.row.status)"
              disable-transitions
              effect="plain"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
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
    <el-dialog v-model="showManualDialog" :title="userStore.role === '管理员' ? '手动审批免考' : '手动申请免考'" width="400px">
      <el-form :model="manualForm" label-width="100px">
        <template v-if="userStore.role === '管理员'">
          <el-form-item label="申请编号">
            <el-select
              v-model="manualForm.applicationId"
              placeholder="请选择申请编号"
              filterable
              @change="onApplicationIdChange"
            >
              <el-option
                v-for="item in recordList"
                :key="item.applicationId"
                :label="item.applicationId"
                :value="item.applicationId"
              />
            </el-select>
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
        </template>
        <template v-else>
          <el-form-item label="免考课程名称">
            <el-select v-model="manualForm.oldCourseName" filterable placeholder="请选择原课程">
              <el-option v-for="item in courseOptions" :key="item.courseId" :label="item.courseName" :value="item.courseName" />
            </el-select>
          </el-form-item>
          <el-form-item label="免考规则依据">
            <el-select v-model="manualForm.ruleName" filterable placeholder="请选择免考规则">
              <el-option v-for="item in ruleOptions" :key="item.name" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
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
import { fetchReplacementRules, createReplacementRule, deleteReplacementRule, fetchCourseList, fetchMajorList, autoMatchReplacement, submitReplacementRequest, submitAdminApproval
  ,courseStudentLoad, courseAdminLoad, autoAdminApply
 } from '@/api/getCourseReplacement.js'

import {
  fetchAllExemptionRules,
  addExemptionRule,
  deleteExemptionRule,
  submitStudentExemption,
  approveExemptionApplication,
  loadStudentExemptionApplications,
  loadAdminExemptionApplications,
  fetchCourseList as fetchExemptionCourseList,
  fetchMajorList as fetchExemptionMajorList
} from '@/api/exemption.js'

const replacementList = ref([])
const showRuleDialog = ref(false)
const ruleForm = reactive({ oldCourseName: '', newCourseName: '', majorName: '', effectiveFrom: '', effectiveTo: '' })
const manualForm = reactive({ oldCourseName: '', newCourseName: '', reason: '', ruleName: '' })
const showManualDialog = ref(false)
const recordList = ref([])
const takenCourses = ref([])
const courseOptions = ref([])
const ruleOptions = ref([])
const majorOptions = ref([])
const userStore = useUserStore()

const pageNum = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)  // 新增总条数

const getRules = async () => {
  const res = await fetchAllExemptionRules()
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

const getRuleOptions = async () => {
  const res = await fetchAllExemptionRules()
  if (res.data && Array.isArray(res.data.data)) {
    ruleOptions.value = res.data.data
  } else {
    ruleOptions.value = []
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
  await addExemptionRule({"name": ruleForm.majorName,"description": ruleForm.newCourseName, "courseName": ruleForm.oldCourseName})
  ElMessage.success('保存成功')
  showRuleDialog.value = false
  getRules()
  Object.keys(ruleForm).forEach(k => ruleForm[k] = '')
}
const deleteRule = async (row) => {
  console.log(row.ruleId)
  await deleteExemptionRule(row.ruleId)
  ElMessage.success('删除成功')
  getRules()
}
const submitManual = async () => {
  if (userStore.role !== '管理员') {
    if (!manualForm.oldCourseName || !manualForm.ruleName) {
      ElMessage.failed('检查字段')
    }
    const ret = await submitStudentExemption({
      studentName: userStore.name,
      courseName: manualForm.oldCourseName,
      ruleName: manualForm.ruleName,
    })
    ElMessage.success('审批提交成功')
  }

  try {
    if (userStore.role === '管理员') {
      // 管理员审批提交逻辑（示例，需根据实际接口调整）
      // 假设有对应的审批接口，暂时用 submitAdminApproval 替代
      const ret = await approveExemptionApplication({
        applicationId: manualForm.applicationId,
        status: manualForm.status,
        reviewReason: manualForm.reviewReason,
        adminName: userStore.name,
      })
      console.log(ret.data)
      ElMessage.success('审批提交成功')
    } else {
      await submitStudentExemption({
        studentName: userStore.name,
        courseName: manualForm.oldCourseName,
        ruleName: manualForm.ruleName
      })
      ElMessage.success('课程替换申请提交成功')
    }
    await getRecords()
    recordList.value = [...recordList.value]
    Object.keys(manualForm).forEach(k => manualForm[k] = '')
    showManualDialog.value = false
  } catch (e) {
    ElMessage.error(e?.response?.data?.msg || '提交失败，请稍后再试')
  }
}
const getRecords = async () => {
  try {
    let res
    if (userStore.role === '管理员') {
      res = await loadAdminExemptionApplications({ key: userStore.name, pageNum: pageNum.value, pageSize: pageSize.value })
      // 如果后端响应包含 total，则更新 totalCount
      if (res.data.data && res.data.data.length > 0) {
        totalCount.value = res.data.data.length
        console.log(totalCount.value)
      }
    } else {
      res = await loadStudentExemptionApplications(userStore.name)
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

const statusCellStyle = ({ row, column }) => {
  if (column.property !== 'status') return {}

  if (row.status === '通过') {
    return { backgroundColor: '#e6f7e6', color: '#2f855a' }
  }
  if (row.status === '驳回') {
    return { backgroundColor: '#fdeaea', color: '#c53030' }
  }
  if (row.status === '待审核') {
    return { backgroundColor: '#fff8e1', color: '#b7791f' }
  }
  return {}
}

const getStatusTagType = (status) => {
  switch (status) {
    case '通过':
      return 'success'
    case '驳回':
      return 'danger'
    case '待审核':
      return 'warning'
    default:
      return ''
  }
}

const onApplicationIdChange = (val) => {
  const selected = recordList.value.find(item => item.applicationId === val)
  if (selected) {
    manualForm.oldCourseName = selected.oldCourseName || ''
    manualForm.newCourseName = selected.newCourseName || ''
    manualForm.status = selected.status || ''
    manualForm.reviewReason = selected.reviewReason || ''
    manualForm.adminName = selected.adminName || ''
  } else {
    manualForm.oldCourseName = ''
    manualForm.newCourseName = ''
    manualForm.status = ''
    manualForm.reviewReason = ''
    manualForm.adminName = ''
  }
}

onMounted(() => {
  getRules()
  getRecords()
  getCourseOptions()
  getMajorOptions()
  getRuleOptions()
})
</script>

<style scoped>
.course-replacement {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-button {
  margin-left: 12px;
  padding: 6px 12px;
  font-size: 14px;
}

.mt-2 {
  margin-top: 12px;
}

.mt-4 {
  margin-top: 24px;
}

.card-container {
  width: 100%;
  margin-bottom: 24px;
}

/* 顶部按钮容器间距 */
.top-buttons {
  margin-bottom: 24px;
}

/* 响应式表格边距，保持间距合理 */
.el-table {
  margin-bottom: 16px;
}
</style>