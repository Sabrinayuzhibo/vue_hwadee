<template>
  <div class="backup-records">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" @click="createBackup" :loading="backupLoading">
            <el-icon><FolderAdd /></el-icon>
            创建备份
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="exportBackupList">
            <el-icon><Download /></el-icon>
            导出列表
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" @click="cleanOldBackups">
            <el-icon><Delete /></el-icon>
            清理过期
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" @click="showScheduleDialog = true">
            <el-icon><Timer /></el-icon>
            定时设置
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索条件 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="备份类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="数据库备份" value="database" />
            <el-option label="文件备份" value="files" />
            <el-option label="系统配置" value="config" />
            <el-option label="日志备份" value="logs" />
          </el-select>
        </el-form-item>
        <el-form-item label="备份状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="进行中" value="running" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchBackups">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 备份记录列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>备份记录</span>
          <div class="header-actions">
            <el-tag type="success">成功: {{ successCount }}</el-tag>
            <el-tag type="danger">失败: {{ failedCount }}</el-tag>
            <el-tag type="warning">总计: {{ totalCount }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="backupList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="备份ID" width="120" />
        <el-table-column prop="name" label="备份名称" width="200" />
        <el-table-column prop="type" label="备份类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时" width="100" />
        <el-table-column prop="creator" label="创建人" width="100" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="downloadBackup(scope.row)"
              :disabled="scope.row.status !== 'success'"
            >
              下载
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              @click="restoreBackup(scope.row)"
              :disabled="scope.row.status !== 'success'"
            >
              恢复
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="deleteBackup(scope.row)"
            >
              删除
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

    <!-- 定时备份设置对话框 -->
    <el-dialog v-model="showScheduleDialog" title="定时备份设置" width="600px">
      <el-form :model="scheduleForm" :rules="scheduleRules" ref="scheduleFormRef" label-width="120px">
        <el-form-item label="启用定时备份" prop="enabled">
          <el-switch v-model="scheduleForm.enabled" />
        </el-form-item>
        <el-form-item label="备份频率" prop="frequency" v-if="scheduleForm.enabled">
          <el-select v-model="scheduleForm.frequency" placeholder="请选择频率">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间" prop="time" v-if="scheduleForm.enabled">
          <el-time-picker
            v-model="scheduleForm.time"
            format="HH:mm"
            placeholder="选择执行时间"
          />
        </el-form-item>
        <el-form-item label="备份类型" prop="types" v-if="scheduleForm.enabled">
          <el-checkbox-group v-model="scheduleForm.types">
            <el-checkbox label="database">数据库备份</el-checkbox>
            <el-checkbox label="files">文件备份</el-checkbox>
            <el-checkbox label="config">系统配置</el-checkbox>
            <el-checkbox label="logs">日志备份</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="保留天数" prop="retentionDays" v-if="scheduleForm.enabled">
          <el-input-number 
            v-model="scheduleForm.retentionDays" 
            :min="1" 
            :max="365" 
            placeholder="备份保留天数"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showScheduleDialog = false">取消</el-button>
          <el-button type="primary" @click="saveSchedule">保存设置</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  FolderAdd, 
  Download, 
  Delete, 
  Timer,
  Refresh
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const backupLoading = ref(false)
const showScheduleDialog = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const successCount = ref(0)
const failedCount = ref(0)
const totalCount = ref(0)

// 搜索表单
const searchForm = reactive({
  type: '',
  status: '',
  dateRange: []
})

// 定时备份表单
const scheduleForm = reactive({
  enabled: true,
  frequency: 'daily',
  time: new Date(),
  types: ['database', 'files'],
  retentionDays: 30
})

// 表单验证规则
const scheduleRules = {
  frequency: [
    { required: true, message: '请选择备份频率', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择执行时间', trigger: 'change' }
  ],
  types: [
    { required: true, message: '请选择备份类型', trigger: 'change' }
  ]
}

// 备份记录列表
const backupList = ref([
  {
    id: 'BK20250713001',
    name: '系统数据库备份_20250713',
    type: 'database',
    size: '245.6MB',
    createTime: '2025-07-13 02:00:00',
    status: 'success',
    duration: '3分25秒',
    creator: '系统自动',
    path: '/backups/database/db_20250713_020000.sql'
  },
  {
    id: 'BK20250712002',
    name: '文件系统备份_20250712',
    type: 'files',
    size: '1.2GB',
    createTime: '2025-07-12 02:00:00',
    status: 'success',
    duration: '15分30秒',
    creator: '系统自动',
    path: '/backups/files/files_20250712_020000.tar.gz'
  },
  {
    id: 'BK20250711003',
    name: '系统配置备份_20250711',
    type: 'config',
    size: '2.3MB',
    createTime: '2025-07-11 14:30:00',
    status: 'success',
    duration: '45秒',
    creator: '管理员',
    path: '/backups/config/config_20250711_143000.tar'
  },
  {
    id: 'BK20250710004',
    name: '日志备份_20250710',
    type: 'logs',
    size: '856KB',
    createTime: '2025-07-10 18:00:00',
    status: 'failed',
    duration: '1分10秒',
    creator: '系统自动',
    error: '磁盘空间不足'
  }
])

// 获取类型标签
const getTypeTag = (type) => {
  const tags = {
    database: 'primary',
    files: 'success',
    config: 'warning',
    logs: 'info'
  }
  return tags[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const texts = {
    database: '数据库备份',
    files: '文件备份',
    config: '系统配置',
    logs: '日志备份'
  }
  return texts[type] || '未知'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    success: 'success',
    failed: 'danger',
    running: 'warning'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    success: '成功',
    failed: '失败',
    running: '进行中'
  }
  return texts[status] || '未知'
}

// 创建备份
const createBackup = () => {
  ElMessageBox.prompt('请输入备份名称', '创建备份', {
    confirmButtonText: '创建',
    cancelButtonText: '取消',
    inputPattern: /\S/,
    inputErrorMessage: '备份名称不能为空'
  }).then(({ value }) => {
    backupLoading.value = true
    
    // 模拟备份过程
    setTimeout(() => {
      const newBackup = {
        id: `BK${Date.now()}`,
        name: value,
        type: 'database',
        size: '156.8MB',
        createTime: new Date().toLocaleString(),
        status: 'success',
        duration: '2分15秒',
        creator: '当前用户',
        path: `/backups/manual/${value}_${Date.now()}.sql`
      }
      
      backupList.value.unshift(newBackup)
      successCount.value++
      totalCount.value++
      
      backupLoading.value = false
      ElMessage.success('备份创建成功')
    }, 3000)
  }).catch(() => {
    ElMessage.info('已取消备份创建')
  })
}

// 导出备份列表
const exportBackupList = () => {
  try {
    // 创建Excel数据
    const exportData = backupList.value.map(item => ({
      '备份ID': item.id,
      '备份名称': item.name,
      '备份类型': getTypeText(item.type),
      '文件大小': item.size,
      '创建时间': item.createTime,
      '状态': getStatusText(item.status),
      '耗时': item.duration,
      '创建人': item.creator,
      '备份路径': item.path || '-',
      '错误信息': item.error || '-'
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
    const filename = `备份记录列表_${dateStr}_${timeStr}.csv`
    
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    ElMessage.success(`备份列表已导出为 ${filename}`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 下载备份文件
const downloadBackup = (row) => {
  try {
    // 创建模拟备份文件内容
    const content = `备份文件：${row.name}
备份类型：${getTypeText(row.type)}
创建时间：${row.createTime}
文件大小：${row.size}
备份路径：${row.path}

这是一个模拟的备份文件内容。
在实际应用中，这里应该是真实的备份数据。`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    
    // 创建下载链接
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${row.name}.txt`)
    link.style.visibility = 'hidden'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    ElMessage.success(`${row.name} 下载成功`)
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 其他方法...
const viewDetail = (row) => {
  ElMessage.info(`查看备份详情: ${row.name}`)
}

const restoreBackup = (row) => {
  ElMessageBox.confirm(
    `确定要恢复备份 "${row.name}" 吗？此操作将覆盖当前数据！`,
    '确认恢复',
    {
      confirmButtonText: '确定恢复',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('备份恢复成功')
  }).catch(() => {
    ElMessage.info('已取消恢复操作')
  })
}

const deleteBackup = (row) => {
  ElMessageBox.confirm(
    `确定要删除备份 "${row.name}" 吗？`,
    '确认删除',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = backupList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      backupList.value.splice(index, 1)
      totalCount.value--
      if (row.status === 'success') {
        successCount.value--
      } else if (row.status === 'failed') {
        failedCount.value--
      }
    }
    ElMessage.success('备份删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除操作')
  })
}

const cleanOldBackups = () => {
  ElMessage.success('过期备份清理完成')
}

const searchBackups = () => {
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

const saveSchedule = () => {
  ElMessage.success('定时备份设置已保存')
  showScheduleDialog.value = false
}

const handleSizeChange = (size) => {
  pageSize.value = size
  searchBackups()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  searchBackups()
}

// 组件挂载时初始化数据
onMounted(() => {
  successCount.value = backupList.value.filter(item => item.status === 'success').length
  failedCount.value = backupList.value.filter(item => item.status === 'failed').length
  totalCount.value = backupList.value.length
  total.value = backupList.value.length
})
</script>

<style scoped>
.backup-records {
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
