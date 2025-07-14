<template>
  <div class="transfer-management">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="考籍转入" name="transfer-in">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>转入申请列表</span>
              <el-button type="primary" @click="showInDialog = true">
                <el-icon><Plus /></el-icon>
                接收转入
              </el-button>
            </div>
          </template>
          
          <el-table :data="transferInList" stripe style="width: 100%">
            <el-table-column prop="studentId" label="考籍号" width="120" />
            <el-table-column prop="studentName" label="考生姓名" width="100" />
            <el-table-column prop="fromProvince" label="来源省份" width="100" />
            <el-table-column prop="major" label="专业" width="150" />
            <el-table-column prop="courseCount" label="课程数" width="80" />
            <el-table-column prop="applyDate" label="申请时间" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getTransferStatusType(scope.row.status)">
                  {{ getTransferStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="viewTransferDetail(scope.row)">详情</el-button>
                <el-button size="small" type="warning" v-if="scope.row.status === 'pending'" @click="auditTransferIn(scope.row)">审核</el-button>
                <el-button size="small" type="warning" v-else @click="cancelTransfer(scope.row)">取消</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="考籍转出" name="transfer-out">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>转出申请列表</span>
              <el-button type="success" @click="showOutDialog = true">
                <el-icon><Plus /></el-icon>
                申请转出
              </el-button>
            </div>
          </template>

          <el-table :data="transferOutList" stripe style="width: 100%">
            <el-table-column prop="studentId" label="考籍号" width="120" />
            <el-table-column prop="studentName" label="考生姓名" width="100" />
            <el-table-column prop="toProvince" label="目标省份" width="100" />
            <el-table-column prop="major" label="专业" width="150" />
            <el-table-column prop="courseCount" label="课程数" width="80" />
            <el-table-column prop="studentStatus" label="考生状态" width="120" />
            <el-table-column prop="applyDate" label="申请时间" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getTransferStatusType(scope.row.status)">
                  {{ getTransferStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="scope">
                <el-button size="small" @click="viewTransferDetail(scope.row)">详情</el-button>
                <el-button
                    size="small"
                    type="warning"
                    v-if="scope.row.status === 'pending'"
                    @click="auditTransferIn(scope.row)"
                >
                  审核
                </el-button>
                <el-button
                    size="small"
                    type="primary"
                    v-else-if="scope.row.status === 'approved' && !scope.row.transferredOut"
                    @click="showConfirmTransferOutDialog(scope.row)"
                >
                  确认转出
                </el-button>
                <el-button
                    size="small"
                    type="info"
                    v-else-if="scope.row.transferredOut"
                >
                  已发送至{{scope.row.toProvince}}省/市
                </el-button>
                <el-button
                    size="small"
                    type="warning"
                    v-if="scope.row.status !== 'pending' && !scope.row.transferredOut"
                    @click="cancelTransfer(scope.row)"
                >
                  取消
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
    <!-- 确认转出对话框 -->
    <el-dialog v-model="showConfirmOutDialog" title="确认转出" width="600px">
      <div style="line-height: 2.5;">
        <p><strong>考籍号：</strong>{{ currentTransferOut.studentId }}</p>
        <p><strong>考生姓名：</strong>{{ currentTransferOut.studentName }}</p>
        <p><strong>身份证号：</strong>{{ currentTransferOut.idCard }}</p>
        <p><strong>目标省份：</strong>{{ currentTransferOut.toProvince }}</p>
        <p><strong>专业：</strong>{{ currentTransferOut.major }}</p>
        <p><strong>课程数：</strong>{{ currentTransferOut.courseCount }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConfirmOutDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmTransferOut">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>

    <!-- 转入申请对话框 -->
    <el-dialog v-model="showInDialog" title="接收转入申请" width="600px">
      <el-form :model="transferInForm" label-width="120px" ref="inFormRef">
        <el-form-item label="来源省份" prop="fromProvince" :rules="[{ required: true, message: '请选择来源省份', trigger: 'change' }]">
          <el-select v-model="transferInForm.fromProvince" placeholder="请选择来源省份">
            <el-option label="北京市" value="北京" />
            <el-option label="上海市" value="上海" />
            <el-option label="广东省" value="广东" />
          </el-select>
        </el-form-item>
        <el-form-item label="考生姓名" prop="studentName" :rules="[{ required: true, message: '请输入考生姓名', trigger: 'blur' }]">
          <el-input v-model="transferInForm.studentName" placeholder="请输入考生姓名" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard" :rules="[{ required:true, validator: validateIdCard, trigger: 'blur' }]">
          <el-input v-model="transferInForm.idCard" placeholder="请输入身份证号" maxlength="18" show-word-limit />
        </el-form-item>
        <el-form-item label="专业" prop="major" :rules="[{ required:true, validator: validateMajor, trigger: 'blur' }]">
          <el-input v-model="transferInForm.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="课程数" prop="courseCount" :rules="[{ required:true, validator: validateCourseCount, trigger: 'blur' }]">
          <el-input v-model.number="transferInForm.courseCount" placeholder="请输入课程数(1-99)" type="number" min="1" max="99" />
        </el-form-item>
        <el-form-item label="转考原因">
          <el-input v-model="transferInForm.reason" type="textarea" placeholder="请输入转考原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showInDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm(inFormRef, submitTransferIn)">接收</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 转出申请对话框 -->
    <el-dialog v-model="showOutDialog" title="申请转出" width="600px">
      <el-form :model="transferOutForm" label-width="120px" ref="outFormRef">
        <el-form-item label="考籍号" prop="studentId" :rules="[{ required: true, message: '请输入考籍号', trigger: 'blur' },{ validator: validateStudentId, trigger: 'blur' }]">
          <el-input v-model="transferOutForm.studentId" placeholder="请输入7位数字考籍号" maxlength="7" show-word-limit />
        </el-form-item>
        <el-form-item label="考生姓名" prop="studentName" :rules="[{ required: true, message: '请输入考生姓名', trigger: 'blur' }]">
          <el-input v-model="transferOutForm.studentName" placeholder="请输入考生姓名" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard" :rules="[{ required:true, validator: validateIdCard, trigger: 'blur' }]">
          <el-input v-model="transferOutForm.idCard" placeholder="请输入身份证号" maxlength="18" show-word-limit />
        </el-form-item>
        <el-form-item label="专业" prop="major" :rules="[{ required:true, validator: validateMajor, trigger: 'blur' }]">
          <el-input v-model="transferOutForm.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="课程数" prop="courseCount" :rules="[{ required:true, validator: validateCourseCount, trigger: 'blur' }]">
          <el-input v-model.number="transferOutForm.courseCount" placeholder="请输入课程数(1-99)" type="number" min="1" max="99" />
        </el-form-item>
        <el-form-item label="目标省份" prop="toProvince" :rules="[{ required: true, message: '请选择目标省份', trigger: 'change' }]">
          <el-select v-model="transferOutForm.toProvince" placeholder="请选择目标省份">
            <el-option label="北京市" value="北京" />
            <el-option label="上海市" value="上海" />
            <el-option label="广东省" value="广东" />
          </el-select>
        </el-form-item>
        <el-form-item label="考生状态" prop="studentStatus" :rules="[{ required:true, validator: validateStudentStatus, trigger: 'blur' }]">
          <el-input v-model="transferOutForm.studentStatus" placeholder="请输入考生状态" />
        </el-form-item>
        <el-form-item label="转考原因">
          <el-input v-model="transferOutForm.reason" type="textarea" placeholder="请输入转考原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showOutDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm(outFormRef, submitTransferOut)">申请</el-button>
        </span>
      </template>
    </el-dialog>

</template>

<script setup>
import { ref, reactive } from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('transfer-in')
const showInDialog = ref(false)
const showOutDialog = ref(false)
const showConfirmOutDialog = ref(false)
const currentTransferOut = reactive({
  studentId: '',
  studentName: '',
  idCard: '',
  toProvince: '',
  major: '',
  courseCount: '',
  index: -1
})
// 新增的ref和验证函数
const inFormRef = ref(null)
const outFormRef = ref(null)
// 本省专业课程目录
const majorList = ref(['计算机科学与技术', '汉语言文学'])
//考生状态
const studentStatusList = ref(['正常', '违规'])

const transferInList = ref([
  {
    studentId: 'BJ2024001',
    idCard: '114514123412341234',
    studentName: '王五',
    fromProvince: '北京',
    major: '计算机科学与技术',
    courseCount: 8,
    applyDate: '2024-01-15',
    status: 'pending'
  }
])

const transferOutList = ref([
  {
    studentId: '2024001',
    idCard: '114514123412341234',
    studentName: '张三',
    toProvince: '上海',
    major: '计算机科学与技术',
    courseCount: 10,
    studentStatus:'正常',
    applyDate: '2024-01-10',
    status: 'approved'
  }
])

const transferInForm = reactive({
  fromProvince: '',
  studentName: '',
  idCard: '',
  major:'',
  courseCount:'',
  reason: ''
})

const transferOutForm = reactive({
  studentId: '',
  studentName:'',
  idCard:'',
  major:'',
  courseCount:'',
  toProvince: '',
  reason: '',
  studentStatus:''
})
// 验证身份证号
const validateIdCard = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入身份证号'))
    return
  }
  // 验证16位数字或15位数字加x
  const reg = /^[0-9]{17}[0-9xX]$|^[0-9]{18}$/
  if (!reg.test(value)) {
    callback(new Error('身份证号应为16位数字或15位数字加x'))
  } else {
    callback()
  }
}

// 验证专业
const validateMajor = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入专业'))
    return
  }
  if (!majorList.value.includes(value)) {
    callback(new Error('专业不在本省专业目录中'))
  } else {
    callback()
  }
}

// 验证课程数
const validateCourseCount = (rule, value, callback) => {
  if (!value && value !== 0) {
    callback(new Error('请输入课程数'))
    return
  }
  const num = Number(value)
  if (isNaN(num)) {
    callback(new Error('请输入有效的数字'))
  } else if (num < 1 || num > 99) {
    callback(new Error('课程数应为1-99之间的整数'))
  } else if (!Number.isInteger(num)) {
    callback(new Error('课程数应为整数'))
  } else {
    callback()
  }
}
//验证考生状态
const validateStudentStatus = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入考生状态'))
    return
  }
  if (!studentStatusList.value.includes(value)) {
    callback(new Error('考生状态不合法'))
  } else {
    callback()
  }
}
//验证考籍号
const validateStudentId = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入考籍号'))
    return
  }

  // 验证是否为7位数字
  if (!/^\d{7}$/.test(value)) {
    callback(new Error('考籍号必须为7位数字'))
    return
  }

  // 验证是否已存在（检查转出列表）
  const exists = transferOutList.value.some(item => item.studentId === value)
  if (exists) {
    callback(new Error('该考籍号已存在，请勿重复提交'))
  } else {
    callback()
  }
}
// 表单提交前验证
const submitForm = async (formRef, submitFunc) => {
  if (!formRef) return
  try {
    await formRef.validate()
    submitFunc()
  } catch (error) {
    ElMessage.warning('请正确填写表单')
  }
}
const getTransferStatusType = (status) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'info'
  }
  return types[status] || 'info'
}

const getTransferStatusText = (status) => {
  const texts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    completed: '已完成'
  }
  return texts[status] || '未知'
}

const auditTransferIn = (row) => {
  ElMessageBox.confirm(
      `确定要审核考生 ${row.studentName} 的转入申请吗?`,
      '审核转入申请',
      {
        distinguishCancelAndClose: true,
        confirmButtonText: '通过',
        cancelButtonText: '拒绝',
        type: 'warning'
      }
  )
      .then(() => {
        // 通过审核
        row.status = 'approved'
        ElMessage.success(`已通过 ${row.studentName} 的转入申请`)
      })
      .catch((action) => {
        if (action === 'cancel') {
          // 拒绝审核
          row.status = 'rejected'
          ElMessage.warning(`已驳回 ${row.studentName} 的转入申请`)
        }
      })
}

const viewTransferDetail = (row) => {
  ElMessageBox({
    title: '转考详情',
    message: `
      <div style="line-height: 2;">
        <p><strong>考籍号：</strong>${row.studentId || '无'}</p>
        <p><strong>考生姓名：</strong>${row.studentName || '无'}</p>
        <p><strong>身份证号：</strong>${row.idCard || '无'}</p>
        <p><strong>${row.fromProvince ? '来源省份' : '目标省份'}：</strong>${row.fromProvince || row.toProvince || '无'}</p>
        <p><strong>专业：</strong>${row.major || '无'}</p>
        <p><strong>课程数：</strong>${row.courseCount || '0'}</p>
        <p><strong>申请时间：</strong>${row.applyDate || '无'}</p>
        <p><strong>转考理由：</strong>${row.reason || '无'}</p>
      </div>
    `,
    dangerouslyUseHTMLString: true,
    showCancelButton: false,
    confirmButtonText: '关闭',
    customClass: 'transfer-detail-dialog'
  })
}

const cancelTransfer = (row) => {
  ElMessageBox.confirm(
      `确定要取消考生 ${row.studentName} 的转出申请吗?`,
      '取消转出申请',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  )
      .then(() => {
        row.status = 'pending'
        ElMessage.success(`已取消 ${row.studentName} 的转出申请`)
      })
      .catch(() => {
        // 用户点击了取消
      })
}

const submitTransferIn = () => {
  // 验证省份选择
  if (!['北京', '上海', '广东'].includes(transferInForm.fromProvince)) {
    ElMessage.error('请选择有效的来源省份（北京、上海或广东）')
    return
  }

  // 省份前缀映射
  const provincePrefixMap = {
    '北京': 'BJ',
    '上海': 'SH',
    '广东': 'GD'
  }
  const provincePrefix = provincePrefixMap[transferInForm.fromProvince]

  // 获取当前年份
  const currentYear = new Date().getFullYear()

  // 查找当年所有的考籍号（仅匹配相同省份前缀的）
  const currentYearTransfers = transferInList.value.filter(item =>
      item.studentId.startsWith(provincePrefix) &&
      item.studentId.includes(currentYear.toString().slice(-4)))

  // 获取当年最大的序号
  const maxSeq = currentYearTransfers.reduce((max, item) => {
    const seqStr = item.studentId.match(/\d{7}$/)?.[0] || '0000000'
    const seq = parseInt(seqStr.slice(-3))
    return seq > max ? seq : max
  }, 0)

  // 生成新的序号（最大序号+1，不足3位前面补0）
  const newSeq = String(maxSeq + 1).padStart(3, '0')

  // 生成新的考籍号（前缀2位+年份4位+序号3位）
  const newStudentId = `${provincePrefix}${currentYear}${newSeq}`

  // 获取当前日期
  const today = new Date()
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // 创建新的转入申请条目
  const newTransfer = {
    studentId: newStudentId,
    studentName: transferInForm.studentName,
    fromProvince: transferInForm.fromProvince,
    major: transferInForm.major,
    courseCount: transferInForm.courseCount,
    applyDate: formattedDate,
    status: 'pending',
    idCard: transferInForm.idCard,
    reason: transferInForm.reason
  }

  // 添加到转入列表
  transferInList.value = [newTransfer, ...transferInList.value]

  // 重置表单
  Object.keys(transferInForm).forEach(key => {
    transferInForm[key] = ''
  })

  ElMessage.success(`转入申请接收成功，考籍号：${newStudentId}`)
  showInDialog.value = false
}

const submitTransferOut = () => {
  // 验证必填字段
  if (!transferOutForm.studentId) {
    ElMessage.error('请输入考籍号')
    return
  }

  if (!transferOutForm.toProvince) {
    ElMessage.error('请选择目标省份')
    return
  }

  // 获取当前日期
  const today = new Date()
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // 创建新的转出申请条目
  const newTransfer = {
    studentId: transferOutForm.studentId,
    studentName: transferOutForm.studentName,
    toProvince: transferOutForm.toProvince,
    major: transferOutForm.major,
    courseCount: transferOutForm.courseCount,
    applyDate: formattedDate,
    studentStatus:transferOutForm.studentStatus,
    status: 'pending',
    reason: transferOutForm.reason || '无'
  }

  // 添加到转出列表
  transferOutList.value = [newTransfer, ...transferOutList.value]

  // 重置表单
  Object.keys(transferOutForm).forEach(key => {
    transferOutForm[key] = ''
  })

  ElMessage.success('转出申请提交成功')
  showOutDialog.value = false
}
//确认转出
const showConfirmTransferOutDialog = (row) => {
  Object.assign(currentTransferOut, {
    studentId: row.studentId,
    studentName: row.studentName,
    idCard: row.idCard,
    toProvince: row.toProvince,
    major: row.major,
    courseCount: row.courseCount,
    index: transferOutList.value.indexOf(row)
  })
  showConfirmOutDialog.value = true
}
const confirmTransferOut = () => {
  if (currentTransferOut.index >= 0) {
    transferOutList.value[currentTransferOut.index].transferredOut = true
    ElMessage.success(`已确认将考生 ${currentTransferOut.studentName} 的考籍转出至${currentTransferOut.toProvince}`)
    showConfirmOutDialog.value = false
  }
}


</script>

<style scoped>
.transfer-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 