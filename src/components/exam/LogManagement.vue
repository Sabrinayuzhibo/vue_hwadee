<template>
  <div class="log-management">
    <!-- 功能操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" @click="exportLogs">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" @click="showBackupDialog = true">
            <el-icon><Upload /></el-icon>
            备份日志
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="cleanLogs">
            <el-icon><Delete /></el-icon>
            清理日志
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" @click="showStatsDialog = true">
            <el-icon><Search /></el-icon>
            统计分析
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索条件 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人" clearable />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.operationType" placeholder="请选择操作类型" clearable>
            <el-option label="考籍修改" value="student_edit" />
            <el-option label="免考审核" value="exemption_audit" />
            <el-option label="毕业审核" value="graduation_audit" />
            <el-option label="系统登录" value="login" />
            <el-option label="数据导出" value="export" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="操作结果">
          <el-select v-model="searchForm.result" placeholder="请选择结果" clearable>
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="请输入关键字" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchLogs">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>操作日志列表</span>
          <div class="header-actions">
            <el-tag type="success">总记录: {{ totalCount }}</el-tag>
            <el-tag type="warning">今日: {{ todayCount }}</el-tag>
            <el-tag type="danger">异常: {{ errorCount }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="logList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="timestamp" label="操作时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operationType" label="操作类型" width="120">
          <template #default="scope">
            <el-tag :type="getOperationTypeTag(scope.row.operationType)">
              {{ getOperationTypeText(scope.row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operation" label="操作内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ipAddress" label="IP地址" width="120" />
        <el-table-column prop="result" label="操作结果" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.result === 'success' ? 'success' : 'danger'">
              {{ scope.row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时(ms)" width="100" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewLogDetail(scope.row)">详情</el-button>
            <el-button size="small" type="warning" @click="markAsAbnormal(scope.row)">
              标记异常
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="日志详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="操作时间">{{ selectedLog.timestamp }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ selectedLog.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">{{ getOperationTypeText(selectedLog.operationType) }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ selectedLog.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="操作结果">
          <el-tag :type="selectedLog.result === 'success' ? 'success' : 'danger'">
            {{ selectedLog.result === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="耗时">{{ selectedLog.duration }}ms</el-descriptions-item>
        <el-descriptions-item label="操作内容" :span="2">{{ selectedLog.operation }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre>{{ selectedLog.requestParams }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="响应结果" :span="2">
          <pre>{{ selectedLog.responseResult }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="selectedLog.errorMessage">
          <pre class="error-message">{{ selectedLog.errorMessage }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 统计分析对话框 -->
    <el-dialog v-model="showStatsDialog" title="日志统计分析" width="1000px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>操作类型分布</template>
            <div class="chart-container">
              <div class="chart-placeholder">操作类型分布图表</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>操作时间分布</template>
            <div class="chart-container">
              <div class="chart-placeholder">操作时间分布图表</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>异常操作统计</template>
            <div class="chart-container">
              <div class="chart-placeholder">异常操作统计图表</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>用户活跃度</template>
            <div class="chart-container">
              <div class="chart-placeholder">用户活跃度图表</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 备份日志对话框 -->
    <el-dialog v-model="showBackupDialog" title="日志备份" width="500px">
      <el-form :model="backupForm" label-width="120px">
        <el-form-item label="备份时间范围">
          <el-date-picker
            v-model="backupForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="备份格式">
          <el-radio-group v-model="backupForm.format">
            <el-radio label="json">JSON</el-radio>
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="excel">Excel</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="压缩备份">
          <el-switch v-model="backupForm.compress" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBackupDialog = false">取消</el-button>
          <el-button type="primary" @click="startBackup">开始备份</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Download, 
  Upload, 
  Delete, 
  Search
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showDetailDialog = ref(false)
const showStatsDialog = ref(false)
const showBackupDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const totalCount = ref(0)
const todayCount = ref(0)
const errorCount = ref(0)
const selectedLog = ref({})

// 搜索表单
const searchForm = reactive({
  operator: '',
  operationType: '',
  dateRange: [],
  result: '',
  keyword: ''
})

// 备份表单
const backupForm = reactive({
  dateRange: [],
  format: 'json',
  compress: true
})

// 日志列表
const logList = ref([
  {
    timestamp: '2024-01-15 10:30:25',
    operator: 'admin',
    operationType: 'student_edit',
    operation: '修改考生张三的基本信息',
    ipAddress: '192.168.1.100',
    result: 'success',
    duration: 150,
    requestParams: '{"studentId": "2024001", "name": "张三", "phone": "13800138001"}',
    responseResult: '{"code": 200, "message": "修改成功"}',
    errorMessage: ''
  },
  {
    timestamp: '2024-01-15 09:15:10',
    operator: 'auditor1',
    operationType: 'exemption_audit',
    operation: '审核免考申请',
    ipAddress: '192.168.1.101',
    result: 'success',
    duration: 200,
    requestParams: '{"applicationId": "EX001", "result": "approve"}',
    responseResult: '{"code": 200, "message": "审核通过"}',
    errorMessage: ''
  },
  {
    timestamp: '2024-01-15 08:45:30',
    operator: 'user1',
    operationType: 'login',
    operation: '用户登录',
    ipAddress: '192.168.1.102',
    result: 'failed',
    duration: 50,
    requestParams: '{"username": "user1", "password": "***"}',
    responseResult: '{"code": 401, "message": "用户名或密码错误"}',
    errorMessage: 'Authentication failed: Invalid credentials'
  }
])

// 获取操作类型标签
const getOperationTypeTag = (type) => {
  const tags = {
    student_edit: 'primary',
    exemption_audit: 'success',
    graduation_audit: 'warning',
    login: 'info',
    export: 'danger'
  }
  return tags[type] || 'info'
}

// 获取操作类型文本
const getOperationTypeText = (type) => {
  const texts = {
    student_edit: '考籍修改',
    exemption_audit: '免考审核',
    graduation_audit: '毕业审核',
    login: '系统登录',
    export: '数据导出'
  }
  return texts[type] || '未知'
}

// 搜索日志
const searchLogs = () => {
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

// 查看日志详情
const viewLogDetail = (row) => {
  selectedLog.value = row
  showDetailDialog.value = true
}

// 标记异常
const markAsAbnormal = (row) => {
  ElMessageBox.confirm(`确定要标记该操作为异常吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('已标记为异常操作')
  })
}

// 导出日志
const exportLogs = () => {
  ElMessage.success('日志导出成功')
}

// 清理日志
const cleanLogs = () => {
  ElMessageBox.confirm('确定要清理过期日志吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('日志清理成功')
  })
}

// 开始备份
const startBackup = () => {
  ElMessage.success('日志备份开始')
  showBackupDialog.value = false
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  searchLogs()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  searchLogs()
}

// 组件挂载时初始化数据
onMounted(() => {
  totalCount.value = 12500
  todayCount.value = 150
  errorCount.value = 5
  total.value = logList.value.length
})
</script>

<style scoped>
.log-management {
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

pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-message {
  color: #f56c6c;
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