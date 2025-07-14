<template>
  <div class="operation-logs">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" @click="exportLogs">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="exportSelectedLogs" :disabled="selectedLogs.length === 0">
            <el-icon><DocumentCopy /></el-icon>
            导出选中
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" @click="clearLogs">
            <el-icon><Delete /></el-icon>
            清空日志
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" @click="refreshLogs">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索条件 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作用户">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.operationType" placeholder="请选择类型" clearable>
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="新增" value="create" />
            <el-option label="修改" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="查询" value="query" />
            <el-option label="导出" value="export" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作模块">
          <el-select v-model="searchForm.module" placeholder="请选择模块" clearable>
            <el-option label="用户管理" value="user" />
            <el-option label="免考管理" value="exemption" />
            <el-option label="日志管理" value="log" />
            <el-option label="系统设置" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input v-model="searchForm.ipAddress" placeholder="请输入IP地址" clearable />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchOperationLogs">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作日志列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <div class="header-actions">
            <el-tag type="info">今日操作: {{ todayCount }}</el-tag>
            <el-tag type="success">总记录: {{ totalCount }}</el-tag>
          </div>
        </div>
      </template>

      <el-table 
        :data="logList" 
        stripe 
        style="width: 100%" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="日志ID" width="100" />
        <el-table-column prop="username" label="操作用户" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="100" />
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="scope">
            <el-tag :type="getOperationTypeTag(scope.row.operationType)">
              {{ getOperationTypeText(scope.row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="操作模块" width="120">
          <template #default="scope">
            <el-tag :type="getModuleTag(scope.row.module)">
              {{ getModuleText(scope.row.module) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="200" />
        <el-table-column prop="ipAddress" label="IP地址" width="130" />
        <el-table-column prop="userAgent" label="浏览器" width="150" show-overflow-tooltip />
        <el-table-column prop="operationTime" label="操作时间" width="160" />
        <el-table-column prop="duration" label="耗时(ms)" width="100" align="center" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button size="small" type="primary" @click="exportSingleLog(scope.row)">导出</el-button>
            <el-button size="small" type="danger" @click="deleteLog(scope.row)">删除</el-button>
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
    <el-dialog v-model="showDetailDialog" :title="`日志详情 - ${currentLog?.id}`" width="700px">
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
          <el-descriptions-item label="操作用户">{{ currentLog.username }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentLog.realName }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationTypeTag(currentLog.operationType)">
              {{ getOperationTypeText(currentLog.operationType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作模块">
            <el-tag :type="getModuleTag(currentLog.module)">
              {{ getModuleText(currentLog.module) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ipAddress }}</el-descriptions-item>
          <el-descriptions-item label="操作时间" :span="2">{{ currentLog.operationTime }}</el-descriptions-item>
          <el-descriptions-item label="操作描述" :span="2">{{ currentLog.description }}</el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">{{ currentLog.userAgent }}</el-descriptions-item>
          <el-descriptions-item label="请求参数" :span="2">
            <pre class="json-content">{{ formatJSON(currentLog.requestParams) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="响应结果" :span="2">
            <pre class="json-content">{{ formatJSON(currentLog.response) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="exportSingleLog(currentLog)">导出此日志</el-button>
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
  DocumentCopy, 
  Delete, 
  Refresh 
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showDetailDialog = ref(false)
const currentLog = ref(null)
const selectedLogs = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const todayCount = ref(0)
const totalCount = ref(0)

// 搜索表单
const searchForm = reactive({
  username: '',
  operationType: '',
  module: '',
  ipAddress: '',
  dateRange: []
})

// 操作日志列表
const logList = ref([
  {
    id: 'LOG20250713001',
    username: 'admin',
    realName: '系统管理员',
    operationType: 'login',
    module: 'system',
    description: '用户登录系统',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    operationTime: '2025-07-13 09:30:15',
    duration: 245,
    requestParams: { username: 'admin' },
    response: { code: 200, message: '登录成功' }
  },
  {
    id: 'LOG20250713002',
    username: 'admin',
    realName: '系统管理员',
    operationType: 'create',
    module: 'exemption',
    description: '新增免考政策：全国计算机等级考试二级免考政策',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    operationTime: '2025-07-13 10:15:30',
    duration: 156,
    requestParams: { policyName: '全国计算机等级考试二级免考政策', courseCode: '001' },
    response: { code: 200, message: '创建成功', id: 'POL123' }
  },
  {
    id: 'LOG20250713003',
    username: 'user001',
    realName: '张三',
    operationType: 'update',
    module: 'user',
    description: '修改个人信息',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    operationTime: '2025-07-13 11:20:45',
    duration: 89,
    requestParams: { userId: 'user001', phone: '13812345678' },
    response: { code: 200, message: '修改成功' }
  },
  {
    id: 'LOG20250713004',
    username: 'admin',
    realName: '系统管理员',
    operationType: 'export',
    module: 'exemption',
    description: '导出免考申请名单',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    operationTime: '2025-07-13 14:35:20',
    duration: 1234,
    requestParams: { startDate: '2025-07-01', endDate: '2025-07-13' },
    response: { code: 200, message: '导出成功', fileName: '免考申请名单_20250713.csv' }
  }
])

// 获取操作类型标签
const getOperationTypeTag = (type) => {
  const tags = {
    login: 'success',
    logout: 'info',
    create: 'primary',
    update: 'warning',
    delete: 'danger',
    query: 'info',
    export: 'success'
  }
  return tags[type] || 'info'
}

// 获取操作类型文本
const getOperationTypeText = (type) => {
  const texts = {
    login: '登录',
    logout: '登出',
    create: '新增',
    update: '修改',
    delete: '删除',
    query: '查询',
    export: '导出'
  }
  return texts[type] || '未知'
}

// 获取模块标签
const getModuleTag = (module) => {
  const tags = {
    user: 'primary',
    exemption: 'success',
    log: 'warning',
    system: 'info'
  }
  return tags[module] || 'info'
}

// 获取模块文本
const getModuleText = (module) => {
  const texts = {
    user: '用户管理',
    exemption: '免考管理',
    log: '日志管理',
    system: '系统设置'
  }
  return texts[module] || '未知'
}

// 格式化JSON
const formatJSON = (obj) => {
  if (!obj) return ''
  return JSON.stringify(obj, null, 2)
}

// 导出所有日志
const exportLogs = () => {
  try {
    // 创建Excel数据
    const exportData = logList.value.map(item => ({
      '日志ID': item.id,
      '操作用户': item.username,
      '真实姓名': item.realName,
      '操作类型': getOperationTypeText(item.operationType),
      '操作模块': getModuleText(item.module),
      '操作描述': item.description,
      'IP地址': item.ipAddress,
      '操作时间': item.operationTime,
      '耗时(ms)': item.duration,
      '用户代理': item.userAgent,
      '请求参数': JSON.stringify(item.requestParams),
      '响应结果': JSON.stringify(item.response)
    }))

    // 创建CSV内容
    const headers = Object.keys(exportData[0] || {})
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n')

    // 创建Blob对象
    const blob = new Blob(['\uFEFF' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    })

    // 创建下载链接
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    // 生成文件名
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
    const filename = `操作日志_${dateStr}_${timeStr}.csv`
    
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    ElMessage.success(`操作日志已导出为 ${filename}`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 导出选中日志
const exportSelectedLogs = () => {
  if (selectedLogs.value.length === 0) {
    ElMessage.warning('请先选择要导出的日志')
    return
  }

  try {
    // 创建Excel数据
    const exportData = selectedLogs.value.map(item => ({
      '日志ID': item.id,
      '操作用户': item.username,
      '真实姓名': item.realName,
      '操作类型': getOperationTypeText(item.operationType),
      '操作模块': getModuleText(item.module),
      '操作描述': item.description,
      'IP地址': item.ipAddress,
      '操作时间': item.operationTime,
      '耗时(ms)': item.duration,
      '用户代理': item.userAgent,
      '请求参数': JSON.stringify(item.requestParams),
      '响应结果': JSON.stringify(item.response)
    }))

    // 创建CSV内容
    const headers = Object.keys(exportData[0] || {})
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n')

    // 创建Blob对象
    const blob = new Blob(['\uFEFF' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    })

    // 创建下载链接
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    // 生成文件名
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
    const filename = `选中操作日志_${selectedLogs.value.length}条_${dateStr}_${timeStr}.csv`
    
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    ElMessage.success(`已导出选中的 ${selectedLogs.value.length} 条日志`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 导出单条日志
const exportSingleLog = (log) => {
  try {
    const content = `操作日志详情

日志ID: ${log.id}
操作用户: ${log.username}
真实姓名: ${log.realName}
操作类型: ${getOperationTypeText(log.operationType)}
操作模块: ${getModuleText(log.module)}
操作描述: ${log.description}
IP地址: ${log.ipAddress}
操作时间: ${log.operationTime}
执行耗时: ${log.duration}ms
用户代理: ${log.userAgent}

请求参数:
${JSON.stringify(log.requestParams, null, 2)}

响应结果:
${JSON.stringify(log.response, null, 2)}`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    
    // 创建下载链接
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `操作日志_${log.id}.txt`)
    link.style.visibility = 'hidden'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    ElMessage.success(`日志 ${log.id} 导出成功`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 其他方法
const viewDetail = (row) => {
  currentLog.value = row
  showDetailDialog.value = true
}

const deleteLog = (row) => {
  ElMessageBox.confirm(
    `确定要删除日志 "${row.id}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = logList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      logList.value.splice(index, 1)
      totalCount.value--
    }
    ElMessage.success('日志删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除操作')
  })
}

const clearLogs = () => {
  ElMessageBox.confirm(
    '确定要清空所有操作日志吗？此操作不可恢复！',
    '确认清空',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    logList.value = []
    totalCount.value = 0
    todayCount.value = 0
    ElMessage.success('操作日志已清空')
  }).catch(() => {
    ElMessage.info('已取消清空操作')
  })
}

const refreshLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('日志数据已刷新')
  }, 1000)
}

const searchOperationLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('搜索完成')
  }, 1000)
}

const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

const handleSelectionChange = (selection) => {
  selectedLogs.value = selection
}

const handleSizeChange = (size) => {
  pageSize.value = size
  searchOperationLogs()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  searchOperationLogs()
}

// 组件挂载时初始化数据
onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  todayCount.value = logList.value.filter(item => 
    item.operationTime.startsWith(today)
  ).length
  totalCount.value = logList.value.length
  total.value = logList.value.length
})
</script>

<style scoped>
.operation-logs {
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

.log-detail {
  max-height: 500px;
  overflow-y: auto;
}

.json-content {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
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
