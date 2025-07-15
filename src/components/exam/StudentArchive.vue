<template>
  <div class="student-archive">
    <!-- 功能操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            考籍建档
          </el-button>
        </el-col>
        <el-col :span="12">
          <el-button type="info" @click="openStatisticsDialog">
            <el-icon><Search /></el-icon>
            统计分析
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索条件 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="考籍号">
          <el-input v-model="searchForm.studentId" placeholder="请输入考籍号" clearable />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="searchForm.idCard" placeholder="请输入身份证号" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="专业">
          <el-input v-model="searchForm.major" placeholder="请输入专业" clearable />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="searchForm.gender" placeholder="请选择性别" clearable style="width: 180px;">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <el-form-item label="考试院">
          <el-input v-model="searchForm.examInstitute" placeholder="请输入考试院名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchStudents">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button v-if="userStore.role === '管理员'" type="success" @click="fetchAllStudents" style="margin-left:1000px;">查询全部学生</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 考生列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>考生考籍档案列表</span>
          <div class="header-actions">
            <el-tag type="info">当前页面总数: {{ totalCount }}</el-tag>
            <el-tag type="success">当前页面正常: {{ normalCount }}</el-tag>
            <el-tag type="primary">当前页面冻结: {{ frozenCount }}</el-tag>
            <el-tag type="danger">当前页面注销: {{ cancelledCount }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="studentList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="studentId" label="考籍号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="idNumber" label="身份证号" width="180" />
        <el-table-column prop="majorCode" label="专业代码" width="150" />
        <el-table-column prop="examCenterName" label="考试院" width="150" />
        <el-table-column prop="birthDate" label="出生日期" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="address" label="住址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="activate" label="激活" width="80" />
        <el-table-column prop="frozened" label="冻结" width="80" />
        <el-table-column prop="isDeleted" label="已删除" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewStudent(scope.row)">查看</el-button>
            <el-button size="small" type="warning" @click="viewScores(scope.row)" style="margin-left: 8px;">成绩</el-button>
            <el-dropdown @command="handleCommand" trigger="click" style="margin-left: 8px;">
              <el-button size="small" type="info">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'editNonKeyInfo', row: scope.row }">
                    编辑非关键信息
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'keyInfoChange', row: scope.row }">
                    关键信息变更
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10,20,50,100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 考籍建档对话框 -->
    <el-dialog v-model="showCreateDialog" title="考籍建档" width="600px" @close="handleCreateDialogClose">
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="createForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="报考专业" prop="major">
          <el-select v-model="createForm.major" placeholder="请选择专业">
            <el-option label="计算机科学与技术" value="计算机科学与技术" />
            <el-option label="汉语言文学" value="汉语言文学" />
            <el-option label="工商管理" value="工商管理" />
            <el-option label="会计学" value="会计学" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="createForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="住址" prop="address">
          <el-input v-model="createForm.address" type="textarea" placeholder="请输入详细住址" />
        </el-form-item>
        <el-form-item label="注册时间" prop="registerDate">
          <el-date-picker v-model="createForm.registerDate" type="date" placeholder="选择注册时间" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCreateDialogClose" :disabled="createLoading">取消</el-button>
          <el-button type="primary" @click="createStudent" :loading="createLoading">
            {{ createLoading ? '创建中...' : '确定' }}
          </el-button>
        </span>
      </template>
    </el-dialog>



    <!-- 查看学生详情对话框 -->
    <el-dialog 
      v-model="showStudentDetailDialog" 
      title="学生详情" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="考籍号">{{ currentDetailStudent?.studentId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ currentDetailStudent?.name }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ currentDetailStudent?.idNumber }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{ currentDetailStudent?.majorCode }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentDetailStudent?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(getStudentStatus(currentDetailStudent))">
            {{ getStatusText(getStudentStatus(currentDetailStudent)) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentDetailStudent?.phone }}</el-descriptions-item>
        <el-descriptions-item label="住址" :span="2">{{ currentDetailStudent?.address }}</el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showStudentDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="viewScores(currentDetailStudent)">查看成绩</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 统计分析对话框 -->
    <el-dialog v-model="showStatisticsDialog" title="统计分析" width="800px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>专业分布</template>
            <div id="major-chart" style="height:300px;width:100%"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>性别比例</template>
            <div id="gender-chart" style="height:300px;width:100%"></div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card>
            <template #header>年龄分布</template>
            <div id="age-chart" style="height:300px;width:100%"></div>
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 非关键信息编辑对话框 -->
    <el-dialog v-model="showNonKeyInfoDialog" title="编辑考生非关键信息" width="500px">
      <el-alert
        title="非关键信息修改说明"
        type="info"
        description="联系电话和住址为非关键信息，修改后需经市州招考机构审核。"
        show-icon
        style="margin-bottom: 20px;"
      />
      <el-form :model="nonKeyInfoForm" :rules="nonKeyInfoRules" ref="nonKeyInfoFormRef" label-width="100px">
        <el-form-item label="考生姓名">
          <el-input :value="currentEditStudent?.name" disabled />
        </el-form-item>
        <el-form-item label="考籍号">
          <el-input :value="currentEditStudent?.studentId" disabled />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="nonKeyInfoForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="住址" prop="address">
          <el-input v-model="nonKeyInfoForm.address" type="textarea" placeholder="请输入详细住址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNonKeyInfoDialog = false">取消</el-button>
          <el-button type="primary" @click="submitNonKeyInfo" :loading="nonKeyInfoLoading">
            {{ nonKeyInfoLoading ? '提交中...' : '提交修改' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关键信息变更对话框 -->
    <el-dialog v-model="showKeyInfoDialog" title="关键信息变更申请" width="700px">
      <el-alert
        title="关键信息变更说明"
        type="warning"
        description="姓名和身份证号为关键信息，变更需提交纸质证明材料，由市州初审后报省考试院终审。考籍状态变更也需要审核。"
        show-icon
        style="margin-bottom: 20px;"
      />
      <el-form :model="keyInfoForm" :rules="keyInfoRules" ref="keyInfoFormRef" label-width="120px">
        <el-form-item label="考籍号">
          <el-input :value="currentEditStudent?.studentId" disabled />
        </el-form-item>
        <el-form-item label="原姓名">
          <el-input :value="keyInfoForm.oldName" disabled />
        </el-form-item>
        <el-form-item label="新姓名" prop="newName">
          <el-input v-model="keyInfoForm.newName" placeholder="请输入新姓名" />
        </el-form-item>
        <el-form-item label="原身份证号">
          <el-input :value="keyInfoForm.oldIdCard" disabled />
        </el-form-item>
        <el-form-item label="新身份证号" prop="newIdCard">
          <el-input v-model="keyInfoForm.newIdCard" placeholder="请输入新身份证号" />
        </el-form-item>
        <el-form-item label="考籍状态变更">
          <el-radio-group v-model="keyInfoForm.statusChange">
            <el-radio label="none">无状态变更</el-radio>
            <el-radio label="freeze">冻结考籍</el-radio>
            <el-radio label="unfreeze">解冻考籍</el-radio>
            <el-radio label="cancel">注销考籍</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="变更原因" prop="reason">
          <el-input v-model="keyInfoForm.reason" type="textarea" placeholder="请详细说明变更原因" />
        </el-form-item>
        <el-form-item label="证明材料">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
          >
            <el-button type="primary">上传证明材料</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、JPG、PNG 格式，单个文件不超过 5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showKeyInfoDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitKeyInfoChange" :loading="keyInfoLoading">
            {{ keyInfoLoading ? '提交中...' : '提交申请' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 成绩管理对话框 -->
    <el-dialog 
      v-model="showScoreDialog" 
      title="成绩管理" 
      width="90%" 
      :close-on-click-modal="false"
      class="score-dialog"
    >
      <div class="score-dialog-header">
        <!-- 学生基本信息 -->
        <el-descriptions :column="3" border style="margin-bottom: 20px;">
          <el-descriptions-item label="考籍号">{{ currentScoreStudent?.studentId }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ currentScoreStudent?.name }}</el-descriptions-item>
          <el-descriptions-item label="专业">{{ currentScoreStudent?.majorCode }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 课程信息概览 -->
        <div class="course-overview">
          <h4>课程信息概览</h4>
          <div class="table-container">
            <el-table :data="currentScoreStudent?.courses || []" border size="small" style="margin-top: 10px;">
              <el-table-column prop="courseCode" label="课程代码" width="100" />
              <el-table-column prop="courseName" label="课程名称" width="200" />
              <el-table-column prop="examDate" label="考试时间" width="120" />
              <el-table-column prop="score" label="成绩" width="80">
                <template #default="{ row }">
                  <span :class="{ 'pass-score': row.score >= 60, 'fail-score': row.score < 60 }">
                    {{ row.score }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="getScoreStatusTag(row.status)" size="small">
                    {{ getScoreStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      
      <!-- 成绩管理组件 -->
      <ScoreManagement 
        v-if="showScoreDialog" 
        :archive-number="currentScoreStudent?.studentId"
        @close="showScoreDialog = false"
      />
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Search, 
  Edit, 
  Delete,
  ArrowDown
} from '@element-plus/icons-vue'
import { createStudentArchive, searchStudents as searchStudentsAPI, updateNonKeyStudentInfo, submitKeyInfoChange } from '@/api/getStudent.js'
import ScoreManagement from './ScoreManagement.vue'
import * as echarts from 'echarts'
import { getStudentList ,getStudentListNoPage} from '@/api/getStudent.js'
import {loadStudentByIdCardNumber,loadStudentByStudentId,loadStudentByName} from '@/api/getStudent.js'
import{ loadStudentsByMajor, loadStudentsByGender, loadStudentsByExamCenterName } from'@/api/getStudent.js'
import { useUserStore } from '@/store/user'
// 响应式数据
const loading = ref(false)
const showCreateDialog = ref(false)
const showStatisticsDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalCount = ref(0)
const normalCount = ref(0)
const frozenCount = ref(0)
const cancelledCount = ref(0)
const createFormRef = ref(null) // 创建表单引用
const createLoading = ref(false) // 创建加载状态

// 信息维护相关
const showNonKeyInfoDialog = ref(false) // 非关键信息编辑对话框
const showKeyInfoDialog = ref(false) // 关键信息变更对话框
const nonKeyInfoFormRef = ref(null) // 非关键信息表单引用
const keyInfoFormRef = ref(null) // 关键信息表单引用
const nonKeyInfoLoading = ref(false) // 非关键信息加载状态
const keyInfoLoading = ref(false) // 关键信息加载状态
const currentEditStudent = ref(null) // 当前编辑的学生

// 成绩管理相关
const showScoreDialog = ref(false) // 成绩管理对话框
const currentScoreStudent = ref(null) // 当前查看成绩的学生

// 学生详情相关
const showStudentDetailDialog = ref(false) // 学生详情对话框
const currentDetailStudent = ref(null) // 当前查看详情的学生
// 用户角色
const userStore=useUserStore()

// 搜索表单
const searchForm = reactive({
  studentId: '',
  idCard: '',
  name: '',
  major: '',
  gender: '',
  examInstitute: '' // 新增
})

// 创建表单
const createForm = reactive({
  name: '',
  idCard: '',
  major: '',
  phone: '',
  address: '',
  registerDate: ''
})

// 非关键信息编辑表单
const nonKeyInfoForm = reactive({
  phone: '',
  address: ''
})

// 关键信息变更表单
const keyInfoForm = reactive({
  oldName: '',
  newName: '',
  oldIdCard: '',
  newIdCard: '',
  statusChange: 'none', // 考籍状态变更
  reason: '',
  attachments: []
})

// 表单验证规则
const createRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '身份证号格式不正确', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请选择专业', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 非关键信息表单验证规则
const nonKeyInfoRules = {
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 关键信息变更验证规则
const keyInfoRules = {
  newName: [
    { required: true, message: '请输入新姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  newIdCard: [
    { required: true, message: '请输入新身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '身份证号格式不正确', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入变更原因', trigger: 'blur' },
    { min: 10, max: 200, message: '变更原因长度在 10 到 200 个字符', trigger: 'blur' }
  ],
  statusChange: [
    { required: true, message: '请选择考籍状态变更', trigger: 'change' }
  ]
}

// 学生列表数据
const studentList = ref([])

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    normal: 'success',
    frozen: 'primary',
    cancelled: 'danger',
    pending: 'warning',    // 待审核
    approved: 'success',   // 已通过
    rejected: 'danger'     // 已拒绝
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    normal: '正常',
    frozen: '冻结',
    cancelled: '注销',
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || '未知'
}

// 获取统计数据
// 用于统计当前页不同状态的数量
const getStatistics = () => {
  const students = studentList.value
  totalCount.value = students.length
  normalCount.value = students.filter(s => s.activate === true && !s.frozened && !s.isDeleted).length
  frozenCount.value = students.filter(s => s.frozened === true).length
  cancelledCount.value = students.filter(s => s.isDeleted === true).length
}

// 课程类型相关工具函数
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

// 成绩状态相关工具函数
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

// 搜索考生
const searchStudents = async () => {
  queryMode.value = 'search'
  try {
    loading.value = true
    let res = null
    // 1. 优先考籍号精确查找
    if (searchForm.studentId && searchForm.studentId.trim() !== '') {
      res = await loadStudentByStudentId({key: searchForm.studentId.trim()})
      const data = res.data.data
      studentList.value = data ? [data] : []
      total.value = studentList.value.length
      ElMessage.success(`查询完成，共找到 ${total.value} 条记录`)
      getStatistics()
      return
    }
    // 2. 身份证号精确查找
    if (searchForm.idCard && searchForm.idCard.trim() !== '') {
      res = await loadStudentByIdCardNumber({key: searchForm.idCard.trim()})
      const data = res.data.data
      studentList.value = data ? [data] : []
      total.value = studentList.value.length
      ElMessage.success(`查询完成，共找到 ${total.value} 条记录`)
      getStatistics()
      return
    }
  
    // 3. 姓名精确查找
    if (searchForm.name && searchForm.name.trim() !== '') {
      res = await loadStudentByName({key: searchForm.name.trim()})
      const data = res.data.data
      studentList.value = data ? [data] : []
      total.value = studentList.value.length
      ElMessage.success(`查询完成，共找到 ${total.value} 条记录`)
      getStatistics()
      return
    }




      ///以下都分页
    // 4. 专业模糊查找
    if (searchForm.major && searchForm.major.trim() !== '') {
      res = await loadStudentsByMajor({
        key: searchForm.major.trim(),
        pageNum:currentPage.value,
        pageSize:pageSize.value
      })
      const data = res.data.data.records
      const total_num=res.data.data.total//总的请求数
      studentList.value = Array.isArray(data) ? data : []
      total.value =total_num//把分页查询的总数改了
      ElMessage.success(`查询完成，共找到 ${total.value} 条记录`)
      getStatistics()
      return
    }
    // 5. 性别模糊查找
    if (searchForm.gender && searchForm.gender.trim() !== '') {
      console.log(currentPage.value)
      res = await loadStudentsByGender({
        key: searchForm.gender.trim(),
        pageNum:currentPage.value,
        pageSize:pageSize.value
      })
      const data = res.data.data.records
      const total_num=res.data.data.total
      console.log(res.data)
      studentList.value = Array.isArray(data) ? data : []
      total.value = total_num
      ElMessage.success(`查询完成，共找到 ${total.value} 条记录`)
      getStatistics()
      return
    }
    // 6. 考试院模糊查找
    if (searchForm.examInstitute && searchForm.examInstitute.trim() !== '') {
      res = await loadStudentsByExamCenterName({
        key: searchForm.examInstitute.trim(),
        pageNum:currentPage.value,
        pageSize:pageSize.value
      })
      const data = res.data.data.records
      const total_num=res.data.data.total
      studentList.value = Array.isArray(data) ? data : []
      total.value = total_num
      ElMessage.success(`查询完成，共找到 ${total.value} 条记录`)
      getStatistics()
      return
    }
    // 7. 全部为空
    ElMessage.warning('请至少输入一个查询条件')
    studentList.value = []
    total.value = 0
    getStatistics()
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
    studentList.value = []
    total.value = 0
    getStatistics()
  } finally {
    loading.value = false
  }
}
// 新增：查询全部学生方法
const fetchAllStudents = async () => {
  queryMode.value = 'all'
  try {
    loading.value = true
    const res = await getStudentList({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    const data = res.data.data
    studentList.value = Array.isArray(data.records) ? data.records : []
    total.value = data.total || 0
  
    ElMessage.success(`${userStore.role}查询完成，共找到 ${total.value} 条记录`)
    getStatistics()
  } catch (error) {
    console.error('查询全部学生失败:', error)
    ElMessage.error('查询全部学生失败，请重试')
    studentList.value = []
    total.value = 0
    getStatistics()
  } finally {
    loading.value = false
  }
}
// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  // 重置分页
  currentPage.value = 1
  // 重新搜索
  searchStudents()
}

// 重置创建表单
const resetCreateForm = () => {
  if (createFormRef.value) {
    createFormRef.value.resetFields()
  }
  // 手动重置日期字段
  createForm.registerDate = ''
}

// 监听对话框关闭事件
const handleCreateDialogClose = () => {
  resetCreateForm()
}

// 创建考生
const createStudent = async () => {
  try {
    // 表单验证
    const valid = await createFormRef.value.validate()
    if (!valid) return

    // 设置加载状态
    createLoading.value = true

    // 准备提交的数据
    const submitData = {
      name: createForm.name,
      idCard: createForm.idCard,
      major: createForm.major,
      phone: createForm.phone,
      address: createForm.address,
      registerDate: createForm.registerDate ? new Date(createForm.registerDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }

    // 调用API创建考籍档案
    const response = await createStudentArchive(submitData)

    // 处理响应
    if (response.status === 200) {
      ElMessage.success('考籍建档成功')
      
      // 重置表单
      createFormRef.value.resetFields()
      
      // 关闭对话框
      showCreateDialog.value = false
      
      // 刷新列表数据
      searchStudents()
      
      // 更新统计数据
      getStatistics()
    } else {
      ElMessage.error(response.message || '考籍建档失败')
    }
  } catch (error) {
    console.error('考籍建档失败:', error)
    
    // 错误处理
    if (error.response) {
      const status = error.response.status
      if (status === 400) {
        ElMessage.error('请求参数错误，请检查输入信息')
      } else if (status === 409) {
        ElMessage.error('该身份证号已存在考籍档案')
      } else if (status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试')
      } else {
        ElMessage.error(`创建失败 (${status})`)
      }
    } else if (error.request) {
      ElMessage.error('网络连接错误，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }
  } finally {
    createLoading.value = false
  }
}

// 查看考生详情
const viewStudent = (row) => {
  currentDetailStudent.value = row
  showStudentDetailDialog.value = true
}

// 编辑考生非关键信息
const editNonKeyInfo = (row) => {
  currentEditStudent.value = row
  // 填充非关键信息表单
  nonKeyInfoForm.phone = row.phone || ''
  nonKeyInfoForm.address = row.address || ''
  showNonKeyInfoDialog.value = true
}

// 提交非关键信息修改
const submitNonKeyInfo = async () => {
  try {
    // 表单验证
    const valid = await nonKeyInfoFormRef.value.validate()
    if (!valid) return

    nonKeyInfoLoading.value = true

    const submitData = {
      name: currentEditStudent.value.name,
      address: nonKeyInfoForm.address,
      phone: nonKeyInfoForm.phone
     
    }
    console.log(submitData)

    const response = await updateNonKeyStudentInfo(submitData)

    if (response.status === 200) {
      ElMessage.success('非关键信息修改已提交，等待审核')
      showNonKeyInfoDialog.value = false
      // 刷新列表
      searchStudents()
    } else {
      ElMessage.error(response.message || '提交失败')
    }
  } catch (error) {
    console.error('提交非关键信息修改失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    nonKeyInfoLoading.value = false
  }
}

// 打开关键信息变更对话框
const openKeyInfoChange = (row) => {
  currentEditStudent.value = row
  // 填充关键信息表单
  keyInfoForm.oldName = row.name
  keyInfoForm.oldIdCard = row.idCard
  keyInfoForm.newName = ''
  keyInfoForm.newIdCard = ''
  keyInfoForm.statusChange = 'none'
  keyInfoForm.reason = ''
  keyInfoForm.attachments = []
  showKeyInfoDialog.value = true
}

// 提交关键信息变更申请
const handleSubmitKeyInfoChange = async () => {
  try {
    // 表单验证
    const valid = await keyInfoFormRef.value.validate()
    if (!valid) return

    keyInfoLoading.value = true
    const isDeleted=false
    const frozened=false

    const submitData = {
      name: keyInfoForm.oldName,
      newName: keyInfoForm.newName,
      numberId: keyInfoForm.newIdCard,
      // 状态字段
      frozened: keyInfoForm.statusChange === 'freeze',
      isDeleted: keyInfoForm.statusChange === 'cancel'
    }

    const response = await submitKeyInfoChange(submitData)

    if (response.status === 200) {
      ElMessage.success('关键信息变更申请已提交，请等待审核')
      showKeyInfoDialog.value = false
    } else {
      ElMessage.error(response.message || '提交失败')
    }
  } catch (error) {
    console.error('提交关键信息变更失败:', error)
    ElMessage.error('提交失败，请重试')
  } finally {
    keyInfoLoading.value = false
  }
}



// 查看成绩
const viewScores = (row) => {
  currentScoreStudent.value = row
  showScoreDialog.value = true
  // 如果是从详情对话框调用的，关闭详情对话框
  if (showStudentDetailDialog.value) {
    showStudentDetailDialog.value = false
  }
}

// 处理下拉菜单命令
const handleCommand = ({ action, row }) => {
  switch (action) {
    case 'editNonKeyInfo':
      editNonKeyInfo(row)
      break
    case 'keyInfoChange':
      openKeyInfoChange(row)
      break
  }
}

// 文件上传处理
const handleFileChange = (file) => {
  console.log('选择的文件:', file)
  // 添加到关键信息变更表单的附件列表
  if (showKeyInfoDialog.value) {
    keyInfoForm.attachments.push({
      name: file.name,
      size: file.size,
      type: file.type,
      raw: file.raw
    })
  }
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  if (queryMode.value === 'all') {
    fetchAllStudents()
  } else {
    searchStudents()
  }
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  if (queryMode.value === 'all') {
    fetchAllStudents()
  } else {
    searchStudents()
  }
}

// 统计分析弹窗显示状态
// 学生列表数据
// ECharts实例
let majorChart = null
let genderChart = null
let ageChart = null

// 拉取统计数据
const fetchStatistics = async () => {
  const res = await getStudentListNoPage({})
  if (res.status === 200) {
    studentList.value = res.data.data
    await nextTick()
    drawCharts()
  }
}

// 统计并绘制图表
const drawCharts = () => {
  // 1. 专业分布
  const majorMap = {}
  studentList.value.forEach(s => {
    majorMap[s.major] = (majorMap[s.major] || 0) + 1
  })
  const majorNames = Object.keys(majorMap)
  const majorCounts = Object.values(majorMap)

  // 2. 性别比例
  const genderMap = { 男: 0, 女: 0 }
  studentList.value.forEach(s => {
    if (s.gender === '男' || s.gender === '女') {
      genderMap[s.gender]++
    }
  })
  const genderData = Object.entries(genderMap).map(([name, value]) => ({ name, value }))

  // 3. 年龄分布
  const ageMap = {}
  const nowYear = new Date().getFullYear()
  studentList.value.forEach(s => {
    if (s.birthDate) {
      const year = new Date(s.birthDate).getFullYear()
      const age = nowYear - year
      ageMap[age] = (ageMap[age] || 0) + 1
    }
  })
  const ageList = Object.keys(ageMap).sort((a, b) => a - b)
  const ageCounts = ageList.map(age => ageMap[age])

  // 渲染专业分布柱形图
  if (!majorChart) {
    majorChart = echarts.init(document.getElementById('major-chart'))
  } else {
    majorChart.dispose()
    majorChart = echarts.init(document.getElementById('major-chart'))
  }
  majorChart.setOption({
    title: { text: '专业分布' },
    xAxis: { type: 'category', data: majorNames },
    yAxis: { type: 'value' },
    series: [{ data: majorCounts, type: 'bar' }]
  })

  // 渲染性别比例饼图
  if (!genderChart) {
    genderChart = echarts.init(document.getElementById('gender-chart'))
  } else {
    genderChart.dispose()
    genderChart = echarts.init(document.getElementById('gender-chart'))
  }
  genderChart.setOption({
    title: { text: '性别比例', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: genderData
    }]
  })

  // 渲染年龄分布折线图
  if (!ageChart) {
    ageChart = echarts.init(document.getElementById('age-chart'))
  } else {
    ageChart.dispose()
    ageChart = echarts.init(document.getElementById('age-chart'))
  }
  ageChart.setOption({
    title: { text: '年龄分布' },
    xAxis: { type: 'category', data: ageList },
    yAxis: { type: 'value' },
    series: [{ data: ageCounts, type: 'line' }]
  })
}

// 打开统计对话框时拉取数据
const openStatisticsDialog = () => {
  showStatisticsDialog.value = true
  fetchStatistics()
}

// 关闭弹窗时销毁图表实例，防止内存泄漏
const destroyCharts = () => {
  if (majorChart) { majorChart.dispose(); majorChart = null }
  if (genderChart) { genderChart.dispose(); genderChart = null }
  if (ageChart) { ageChart.dispose(); ageChart = null }
}

// 监听弹窗关闭事件
watch(showStatisticsDialog, (val) => {
  if (!val) destroyCharts()
})

onBeforeUnmount(() => {
  destroyCharts()
})

// 组件挂载时初始化数据
onMounted(() => {
  // 页面加载时自动搜索
  searchStudents()
  
  // 初始化统计数据
  getStatistics()
})

const queryMode = ref('all') // 'all' 或 'search'

const getStudentStatus = (student) => {
  if (student.isDeleted) return 'cancelled'
  if (student.frozened) return 'frozen'
  if (student.activate) return 'normal'
  return '未知'
}

</script>

<style scoped>
.student-archive {
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

/* 成绩管理对话框样式 */
.score-dialog {
  .el-dialog__body {
    padding: 0;
  }
}

.score-dialog-header {
  padding: 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.course-overview {
  margin-top: 15px;
}

.course-overview h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.table-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.pass-score {
  color: #67c23a;
  font-weight: bold;
}

.fail-score {
  color: #f56c6c;
  font-weight: bold;
}
</style> 