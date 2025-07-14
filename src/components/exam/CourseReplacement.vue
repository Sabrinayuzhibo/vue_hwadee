
<template>
  <div class="course-replacement">
    <!-- 顶部按钮 -->
    <div style="margin-bottom: 16px;">
      <el-button type="primary" @click="showManualDialog = true">手动申请顶替</el-button>
      <el-button type="primary" style="margin-left: 8px;">自动匹配课程</el-button>
    </div>

    <!-- 课程顶替规则管理 -->
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

    <!-- 新增顶替规则对话框 -->
    <el-dialog v-model="showRuleDialog" title="新增顶替规则" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="原课程名称">
          <el-input v-model="ruleForm.oldCourseName" />
        </el-form-item>
        <el-form-item label="新课程名称">
          <el-input v-model="ruleForm.newCourseName" />
        </el-form-item>
        <el-form-item label="适用专业">
          <el-input v-model="ruleForm.majorName" />
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
      <el-table :data="recordList" stripe>
        <el-table-column prop="oldCourseCode" label="原课程" />
        <el-table-column prop="newCourseCode" label="新课程" />
        <el-table-column prop="replaceTime" label="顶替时间" />
      </el-table>
    </el-card>

    <!-- 所修课程信息 -->
    <el-card class="mt-4">
      <template #header><span>所修课程</span></template>
      <div>
        <el-table :data="takenCourses" stripe>
          <el-table-column prop="courseCode" label="课程代码" width="120" />
          <el-table-column prop="courseName" label="课程名称" width="180" />
          <el-table-column prop="credit" label="学分" width="80" />
        </el-table>
      </div>
    </el-card>

    <!-- 手动申请顶替对话框 -->
    <el-dialog v-model="showManualDialog" title="手动申请顶替" width="400px">
      <el-form :model="manualForm" label-width="100px">
        <el-form-item label="原课程名称"><el-input v-model="manualForm.oldCourseName" /></el-form-item>
        <el-form-item label="新课程名称"><el-input v-model="manualForm.newCourseName" /></el-form-item>
        <el-form-item label="申请理由"><el-input v-model="manualForm.reason" type="textarea" rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showManualDialog = false">取消</el-button>
        <el-button type="primary" @click="submitManual">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fetchReplacementRules, createReplacementRule, deleteReplacementRule } from '@/api/getCourseReplacement.js'

const replacementList = ref([])
const showRuleDialog = ref(false)
const ruleForm = reactive({ oldCourseName: '', newCourseName: '', majorName: '', effectiveFrom: '', effectiveTo: '' })
const manualForm = reactive({ oldCourseName: '', newCourseName: '', reason: '' })
const showManualDialog = ref(false)
const recordList = ref([])
const takenCourses = ref([])

const getRules = async () => {
  const res = await fetchReplacementRules()
  if (res.data && Array.isArray(res.data.data)) {
    replacementList.value = res.data.data
  } else {
    replacementList.value = []
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
  // 这里应有 submitReplacementRequest 方法
  ElMessage.success('申请已提交')
  showManualDialog.value = false
}
const getRecords = async () => {
  // 这里应有 fetchReplacementRecords 方法
  recordList.value = []
}
onMounted(() => {
  getRules()
  getRecords()
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
</style> ·