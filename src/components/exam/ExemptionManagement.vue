<template>
  <div class="exemption-management">
    <!-- 功能操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" @click="showPolicyDialog = true">
            <el-icon><Setting /></el-icon>
            政策配置
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="showApplyDialog = true">
            <el-icon><Plus /></el-icon>
            免考申请
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" @click="showAuditDialog = true">
            <el-icon><Search /></el-icon>
            审核管理
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="info" @click="exportExemptionList" :loading="exportLoading">
            <el-icon><Download /></el-icon>
            导出名单
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索条件 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="考生姓名">
          <el-input v-model="searchForm.studentName" placeholder="请输入考生姓名" clearable />
        </el-form-item>
        <el-form-item label="考籍号">
          <el-input v-model="searchForm.studentId" placeholder="请输入考籍号" clearable />
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="初审通过" value="first_approved" />
            <el-option label="终审通过" value="final_approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placehold,r="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchExemptions">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 免考申请列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>免考申请列表</span>
          <div class="header-actions">
            <el-tag type="info">待审核: {{ pendingCount }}</el-tag>
            <el-tag type="success">已通过: {{ approvedCount }}</el-tag>
            <el-tag type="danger">已驳回: {{ rejectedCount }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="exemptionList" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="studentId" label="考籍号" width="120" />
        <el-table-column prop="studentName" label="考生姓名" width="100" />
        <el-table-column prop="major" label="专业" width="150" />
        <el-table-column prop="courseCode" label="课程代码" width="100" />
        <el-table-column prop="courseName" label="课程名称" width="150" />
        <el-table-column prop="exemptionType" label="免考类型" width="120">
          <template #default="scope">
            <el-tag :type="getExemptionTypeTag(scope.row.exemptionType)">
              {{ scope.row.exemptionType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="申请时间" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="auditor" label="审核人" width="100" />
        <el-table-column prop="auditDate" label="审核时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
            <el-button 
              size="small" 
              type="primary" 
              @click="auditExemption(scope.row)"
              v-if="scope.row.status === 'pending'"
            >
              审核
            </el-button>
            <el-button size="small" type="warning" @click="downloadMaterials(scope.row)">
              材料
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

    <!-- 免考政策配置对话框 -->
    <el-dialog v-model="showPolicyDialog" title="免考政策配置" width="800px">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="政策列表" name="policy-list">
          <div class="policy-actions">
            <el-button type="primary" @click="showAddPolicyDialog = true">
              <el-icon><Plus /></el-icon>
              新增政策
            </el-button>
          </div>
          <el-table :data="policyList" stripe style="width: 100%">
            <el-table-column prop="policyName" label="政策名称" />
            <el-table-column prop="courseCode" label="课程代码" width="100" />
            <el-table-column prop="courseName" label="课程名称" />
            <el-table-column prop="exemptionCondition" label="免考条件" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                  {{ scope.row.status === 'active' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="editPolicy(scope.row)">编辑</el-button>
                <el-button 
                  size="small" 
                  :type="scope.row.status === 'active' ? 'warning' : 'success'"
                  @click="togglePolicyStatus(scope.row)"
                >
                  {{ scope.row.status === 'active' ? '停用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="政策统计" name="policy-stats">
          <!-- 统计概览 -->
          <el-row :gutter="20" class="stats-overview">
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background-color: #e6f7ff;">
                    <el-icon :size="24" color="#1890ff">
                      <Document />
                    </el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ policyStats.totalPolicies }}</div>
                    <div class="stat-label">总政策数</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background-color: #f6ffed;">
                    <el-icon :size="24" color="#52c41a">
                      <CircleCheck />
                    </el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ policyStats.activePolicies }}</div>
                    <div class="stat-label">启用政策</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background-color: #fff7e6;">
                    <el-icon :size="24" color="#fa8c16">
                      <User />
                    </el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ policyStats.totalApplications }}</div>
                    <div class="stat-label">总申请数</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-content">
                  <div class="stat-icon" style="background-color: #f6ffed;">
                    <el-icon :size="24" color="#52c41a">
                      <Trophy />
                    </el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-number">{{ policyStats.approvalRate }}%</div>
                    <div class="stat-label">通过率</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 详细图表 -->
          <el-row :gutter="20" class="charts-section">
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>政策使用统计</span>
                    <el-select v-model="statsTimeRange" size="small" style="width: 120px;">
                      <el-option label="近7天" value="7days" />
                      <el-option label="近30天" value="30days" />
                      <el-option label="近3个月" value="3months" />
                    </el-select>
                  </div>
                </template>
                <div class="policy-usage-chart">
                  <el-table :data="policyUsageData" size="small" stripe>
                    <el-table-column prop="policyName" label="政策名称" width="200" />
                    <el-table-column prop="applications" label="申请次数" width="80" align="center" />
                    <el-table-column prop="approved" label="通过次数" width="80" align="center" />
                    <el-table-column label="通过率" width="80" align="center">
                      <template #default="scope">
                        <el-tag :type="getPassRateType(scope.row.passRate)">
                          {{ scope.row.passRate }}%
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="使用趋势" align="center">
                      <template #default="scope">
                        <div class="trend-indicator">
                          <el-icon :color="scope.row.trend === 'up' ? '#52c41a' : scope.row.trend === 'down' ? '#ff4d4f' : '#faad14'">
                            <component :is="getTrendIcon(scope.row.trend)" />
                          </el-icon>
                          <span :style="{ color: scope.row.trend === 'up' ? '#52c41a' : scope.row.trend === 'down' ? '#ff4d4f' : '#faad14' }">
                            {{ getTrendText(scope.row.trend) }}
                          </span>
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>月度申请趋势</span>
                    <el-button size="small" @click="refreshStats">
                      <el-icon><Refresh /></el-icon>
                      刷新
                    </el-button>
                  </div>
                </template>
                <div class="monthly-trend-chart">
                  <div class="chart-legend">
                    <div class="legend-item">
                      <span class="legend-color" style="background-color: #1890ff;"></span>
                      <span>申请数量</span>
                    </div>
                    <div class="legend-item">
                      <span class="legend-color" style="background-color: #52c41a;"></span>
                      <span>通过数量</span>
                    </div>
                  </div>
                  <div class="monthly-data">
                    <div v-for="month in monthlyTrendData" :key="month.month" class="month-item">
                      <div class="month-label">{{ month.month }}</div>
                      <div class="month-bars">
                        <div class="bar-container">
                          <div class="bar applications" :style="{ height: getBarHeight(month.applications, 'applications') }">
                            <span class="bar-value">{{ month.applications }}</span>
                          </div>
                        </div>
                        <div class="bar-container">
                          <div class="bar approved" :style="{ height: getBarHeight(month.approved, 'approved') }">
                            <span class="bar-value">{{ month.approved }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 课程免考分析 -->
          <el-row :gutter="20" class="course-analysis">
            <el-col :span="24">
              <el-card>
                <template #header>课程免考分析</template>
                <el-table :data="courseAnalysisData" stripe>
                  <el-table-column prop="courseCode" label="课程代码" width="100" />
                  <el-table-column prop="courseName" label="课程名称" width="150" />
                  <el-table-column prop="totalApplications" label="总申请数" width="100" align="center" />
                  <el-table-column prop="approvedApplications" label="通过数" width="100" align="center" />
                  <el-table-column label="通过率" width="100" align="center">
                    <template #default="scope">
                      <el-progress 
                        :percentage="scope.row.approvalRate" 
                        :color="getProgressColor(scope.row.approvalRate)"
                        :stroke-width="6"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="mainExemptionType" label="主要免考类型" width="120" />
                  <el-table-column label="热度" width="100" align="center">
                    <template #default="scope">
                      <el-rate 
                        v-model="scope.row.popularity" 
                        disabled 
                        show-score 
                        text-color="#ff9900"
                        :max="5"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="lastMonthGrowth" label="环比增长" width="100" align="center">
                    <template #default="scope">
                      <span :style="{ color: scope.row.lastMonthGrowth >= 0 ? '#52c41a' : '#ff4d4f' }">
                        {{ scope.row.lastMonthGrowth >= 0 ? '+' : '' }}{{ scope.row.lastMonthGrowth }}%
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 新增政策对话框 -->
    <el-dialog v-model="showAddPolicyDialog" title="新增政策" width="600px">
      <el-form :model="policyForm" :rules="policyRules" ref="policyFormRef" label-width="120px">
        <el-form-item label="政策名称" prop="policyName">
          <el-input v-model="policyForm.policyName" placeholder="请输入政策名称" />
        </el-form-item>
        <el-form-item label="适用课程" prop="courseCode">
          <el-select v-model="policyForm.courseCode" placeholder="请选择课程" @change="onPolicyCourseChange">
            <el-option 
              v-for="course in availableCourses" 
              :key="course.code" 
              :label="`${course.code} - ${course.name}`" 
              :value="course.code" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="policyForm.courseName" disabled />
        </el-form-item>
        <el-form-item label="免考条件" prop="exemptionCondition">
          <el-input 
            v-model="policyForm.exemptionCondition" 
            type="textarea" 
            :rows="3"
            placeholder="请详细描述免考条件，如：全国计算机等级考试二级及以上证书"
          />
        </el-form-item>
        <el-form-item label="适用范围" prop="scope">
          <el-checkbox-group v-model="policyForm.scope">
            <el-checkbox label="所有专业">所有专业</el-checkbox>
            <el-checkbox label="理工类专业">理工类专业</el-checkbox>
            <el-checkbox label="文史类专业">文史类专业</el-checkbox>
            <el-checkbox label="艺术类专业">艺术类专业</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="生效时间" prop="effectiveDate">
          <el-date-picker
            v-model="policyForm.effectiveDate"
            type="date"
            placeholder="选择生效时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="政策状态" prop="status">
          <el-radio-group v-model="policyForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input 
            v-model="policyForm.remark" 
            type="textarea" 
            :rows="2"
            placeholder="政策说明或备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelAddPolicy">取消</el-button>
          <el-button type="primary" @click="savePolicy">保存政策</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 免考申请对话框 -->
    <el-dialog v-model="showApplyDialog" title="免考申请" width="700px">
      <el-form :model="applyForm" :rules="applyRules" ref="applyFormRef" label-width="120px">
        <el-form-item label="考籍号" prop="studentId">
          <el-row :gutter="20">
            <el-col :span="16">
              <el-input v-model="applyForm.studentId" placeholder="请输入考籍号" clearable />
            </el-col>
            <el-col :span="8">
              <el-button type="primary" @click="searchStudent" :loading="searching">
                <el-icon><Search /></el-icon>
                查询考生
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="考生姓名" prop="studentName">
          <el-input 
            v-model="applyForm.studentName" 
            placeholder="请输入考生姓名" 
            :disabled="autoFillFromSearch"
            clearable 
          />
          <div class="form-tip" v-if="autoFillFromSearch">
            <el-icon><InfoFilled /></el-icon>
            该信息已通过考籍号自动填入，如需修改请手动编辑
          </div>
        </el-form-item>
        <el-form-item label="报考专业" prop="major">
          <el-input 
            v-model="applyForm.major" 
            placeholder="请输入报考专业" 
            :disabled="autoFillFromSearch"
            clearable 
          />
          <div class="form-tip" v-if="autoFillFromSearch">
            <el-icon><InfoFilled /></el-icon>
            该信息已通过考籍号自动填入，如需修改请手动编辑
          </div>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="manualInput" @change="toggleManualInput">
            手动输入考生信息（不通过考籍号查询）
          </el-checkbox>
        </el-form-item>
        <el-form-item label="免考课程" prop="courseCode">
          <el-select v-model="applyForm.courseCode" placeholder="请选择课程" @change="onCourseChange">
            <el-option 
              v-for="course in availableCourses" 
              :key="course.code" 
              :label="`${course.code} - ${course.name}`" 
              :value="course.code" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="免考类型" prop="exemptionType">
          <el-select v-model="applyForm.exemptionType" placeholder="请选择免考类型">
            <el-option label="全国计算机等级考试" value="计算机等级考试" />
            <el-option label="英语等级考试" value="英语等级考试" />
            <el-option label="职业资格证书" value="职业资格证书" />
            <el-option label="其他学历课程" value="其他学历课程" />
          </el-select>
        </el-form-item>
        <el-form-item label="证明材料" prop="materials">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleMaterialChange"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">请上传成绩单、证书等证明材料扫描件</div>
        </el-form-item>
        <el-form-item label="申请说明" prop="description">
          <el-input 
            v-model="applyForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请详细说明免考理由和相关情况"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showApplyDialog = false">取消</el-button>
          <el-button type="primary" @click="submitExemption">提交申请</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog v-model="showAuditDialog" title="免考审核" width="600px">
      <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-width="100px">
        <el-form-item label="审核结果" prop="result">
          <el-radio-group v-model="auditForm.result">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="comment">
          <el-input 
            v-model="auditForm.comment" 
            type="textarea" 
            :rows="4"
            placeholder="请填写审核意见"
          />
        </el-form-item>
        <el-form-item label="审核级别" prop="level">
          <el-select v-model="auditForm.level" placeholder="请选择审核级别">
            <el-option label="市州初审" value="city" />
            <el-option label="省考试院终审" value="province" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAuditDialog = false">取消</el-button>
          <el-button type="primary" @click="submitAudit">提交审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Setting, 
  Plus, 
  Search, 
  Download,
  Edit,
  Delete,
  InfoFilled,
  Document,
  CircleCheck,
  User,
  Trophy,
  Refresh,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue'
import {
  getExemptionListAPI,
  createExemptionAPI,
  auditExemptionAPI,
  getExemptionDetailAPI,
  getStudentInfoAPI,
  searchStudentAPI,
  uploadMaterialsAPI,
  downloadMaterialsAPI,
  exportExemptionListAPI,
  getPolicyListAPI,
  createPolicyAPI,
  updatePolicyAPI,
  togglePolicyStatusAPI,
  getAvailableCoursesAPI,
  getCourseInfoAPI,
  getPolicyStatsAPI,
  getPolicyUsageStatsAPI,
  getMonthlyTrendDataAPI,
  getCourseAnalysisDataAPI,
  getExemptionStatsAPI
} from '@/api/exemption'

// 表单引用
const applyFormRef = ref(null)
const auditFormRef = ref(null)
const policyFormRef = ref(null)

const searching = ref(false)
const autoFillFromSearch = ref(false)
const manualInput = ref(false)

// 统计时间范围
const statsTimeRange = ref('30days')

// 政策统计数据
const policyStats = ref({
  totalPolicies: 0,
  activePolicies: 0,
  totalApplications: 0,
  approvalRate: 0
})

// 政策使用数据
const policyUsageData = ref([
  {
    policyName: '全国计算机等级考试二级免考政策',
    applications: 45,
    approved: 42,
    passRate: 93.3,
    trend: 'up'
  },
  {
    policyName: '英语等级考试免考政策',
    applications: 38,
    approved: 35,
    passRate: 92.1,
    trend: 'up'
  },
  {
    policyName: '职业资格证书免考政策',
    applications: 22,
    approved: 18,
    passRate: 81.8,
    trend: 'stable'
  },
  {
    policyName: '其他学历课程免考政策',
    applications: 15,
    approved: 10,
    passRate: 66.7,
    trend: 'down'
  }
])

// 月度趋势数据
const monthlyTrendData = ref([
  { month: '1月', applications: 28, approved: 25 },
  { month: '2月', applications: 32, approved: 29 },
  { month: '3月', applications: 41, approved: 37 },
  { month: '4月', applications: 38, approved: 34 },
  { month: '5月', applications: 45, approved: 41 },
  { month: '6月', applications: 52, approved: 48 }
])

// 课程分析数据
const courseAnalysisData = ref([
  {
    courseCode: '001',
    courseName: '计算机应用基础',
    totalApplications: 67,
    approvedApplications: 62,
    approvalRate: 92.5,
    mainExemptionType: '计算机等级考试',
    popularity: 5,
    lastMonthGrowth: 15.2
  },
  {
    courseCode: '002',
    courseName: '大学英语',
    totalApplications: 53,
    approvedApplications: 48,
    approvalRate: 90.6,
    mainExemptionType: '英语等级考试',
    popularity: 4,
    lastMonthGrowth: 8.7
  },
  {
    courseCode: '003',
    courseName: '高等数学',
    totalApplications: 29,
    approvedApplications: 22,
    approvalRate: 75.9,
    mainExemptionType: '其他学历课程',
    popularity: 3,
    lastMonthGrowth: -5.3
  },
  {
    courseCode: '004',
    courseName: '马克思主义基本原理',
    totalApplications: 18,
    approvedApplications: 16,
    approvalRate: 88.9,
    mainExemptionType: '其他学历课程',
    popularity: 2,
    lastMonthGrowth: 2.1
  }
])

// 响应式数据
const loading = ref(false)
const exportLoading = ref(false)
const showPolicyDialog = ref(false)
const showApplyDialog = ref(false)
const showAuditDialog = ref(false)
const showAddPolicyDialog = ref(false)
const activeTab = ref('policy-list')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const pendingCount = ref(0)
const approvedCount = ref(0)
const rejectedCount = ref(0)

// 搜索表单
const searchForm = reactive({
  studentName: '',
  studentId: '',
  status: '',
  dateRange: []
})

// 申请表单
const applyForm = reactive({
  studentId: '',
  studentName: '',
  major: '',
  courseCode: '',
  courseName: '',
  exemptionType: '',
  materials: [],
  description: ''
})

// 政策表单
const policyForm = reactive({
  policyName: '',
  courseCode: '',
  courseName: '',
  exemptionCondition: '',
  scope: [],
  effectiveDate: '',
  status: 'active',
  remark: ''
})

// 审核表单
const auditForm = reactive({
  result: '',
  comment: '',
  level: ''
})

// 表单验证规则
const applyRules = {
  studentId: [
    { required: true, message: '请输入考籍号', trigger: 'blur' }
  ],
  studentName: [
    { required: true, message: '请输入考生姓名', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请输入报考专业', trigger: 'blur' }
  ],
  courseCode: [
    { required: true, message: '请选择免考课程', trigger: 'change' }
  ],
  exemptionType: [
    { required: true, message: '请选择免考类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请填写申请说明', trigger: 'blur' }
  ]
}

const policyRules = {
  policyName: [
    { required: true, message: '请输入政策名称', trigger: 'blur' }
  ],
  courseCode: [
    { required: true, message: '请选择适用课程', trigger: 'change' }
  ],
  exemptionCondition: [
    { required: true, message: '请输入免考条件', trigger: 'blur' }
  ],
  scope: [
    { required: true, message: '请选择适用范围', trigger: 'change' }
  ],
  effectiveDate: [
    { required: true, message: '请选择生效时间', trigger: 'change' }
  ]
}

const auditRules = {
  result: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请填写审核意见', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请选择审核级别', trigger: 'change' }
  ]
}

// 可用课程列表
const availableCourses = ref([
  { code: '001', name: '计算机应用基础' },
  { code: '002', name: '大学英语' },
  { code: '003', name: '高等数学' },
  { code: '004', name: '马克思主义基本原理' }
])

// 政策列表
const policyList = ref([
  {
    policyName: '全国计算机等级考试二级免考政策',
    courseCode: '001',
    courseName: '计算机应用基础',
    exemptionCondition: '全国计算机等级考试二级及以上证书',
    status: 'active'
  },
  {
    policyName: '英语等级考试免考政策',
    courseCode: '002',
    courseName: '大学英语',
    exemptionCondition: 'CET-4及以上证书',
    status: 'active'
  }
])

// 免考申请列表
const exemptionList = ref([])

// 加载免考申请列表
const loadExemptionList = async () => {
  try {
    loading.value = true
    const response = await getExemptionListAPI({
      page: currentPage.value,
      size: pageSize.value,
      status: searchForm.status,
      studentName: searchForm.studentName,
      studentId: searchForm.studentId,
      dateRange: searchForm.dateRange
    })
    exemptionList.value = response.data.records || []
    total.value = response.data.total || 0
    updateStatistics()
  } catch (error) {
    ElMessage.error('加载免考申请列表失败')
    console.error('Load exemption list error:', error)
  } finally {
    loading.value = false
  }
}

// 获取免考类型标签
const getExemptionTypeTag = (type) => {
  const tags = {
    '计算机等级考试': 'primary',
    '英语等级考试': 'success',
    '职业资格证书': 'warning',
    '其他学历课程': 'info'
  }
  return tags[type] || 'info'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    first_approved: 'info',
    final_approved: 'success',
    rejected: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待审核',
    first_approved: '初审通过',
    final_approved: '终审通过',
    rejected: '已驳回'
  }
  return texts[status] || '未知'
}

// 搜索免考申请
const searchExemptions = async () => {
  try {
    loading.value = true
    const response = await getExemptionListAPI({
      page: 1,
      size: pageSize.value,
      status: searchForm.status,
      studentName: searchForm.studentName,
      studentId: searchForm.studentId,
      dateRange: searchForm.dateRange
    })
    exemptionList.value = response.data.records || []
    total.value = response.data.total || 0
    currentPage.value = 1
    updateStatistics()
    ElMessage.success('搜索完成')
  } catch (error) {
    ElMessage.error('搜索失败')
    console.error('Search exemptions error:', error)
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

// 查看详情
const viewDetail = (row) => {
  // 显示详细信息对话框
  ElMessageBox({
    title: `免考申请详情 - ${row.studentName}`,
    message: h('div', { style: 'line-height: 1.6' }, [
      h('div', { style: 'margin-bottom: 15px' }, [
        h('h4', { style: 'margin: 0 0 10px 0; color: #409eff' }, '基本信息'),
        h('p', { style: 'margin: 5px 0' }, `考籍号：${row.studentId}`),
        h('p', { style: 'margin: 5px 0' }, `考生姓名：${row.studentName}`),
        h('p', { style: 'margin: 5px 0' }, `专业：${row.major}`),
        h('p', { style: 'margin: 5px 0' }, `免考课程：${row.courseCode} - ${row.courseName}`),
        h('p', { style: 'margin: 5px 0' }, `免考类型：${row.exemptionType}`)
      ]),
      h('div', { style: 'margin-bottom: 15px' }, [
        h('h4', { style: 'margin: 0 0 10px 0; color: #409eff' }, '申请信息'),
        h('p', { style: 'margin: 5px 0' }, `申请时间：${row.applyDate}`),
        h('p', { style: 'margin: 5px 0' }, `申请状态：${getStatusText(row.status)}`),
        h('p', { style: 'margin: 5px 0' }, `申请说明：${row.description || '无'}`),
      ]),
      h('div', [
        h('h4', { style: 'margin: 0 0 10px 0; color: #409eff' }, '审核信息'),
        h('p', { style: 'margin: 5px 0' }, `审核人：${row.auditor || '待审核'}`),
        h('p', { style: 'margin: 5px 0' }, `审核时间：${row.auditDate || '待审核'}`),
        h('p', { style: 'margin: 5px 0' }, `审核意见：${row.auditComment || '无'}`)
      ])
    ]),
    showCancelButton: false,
    confirmButtonText: '关闭',
    customClass: 'detail-message-box'
  })
}

// 下载材料
const downloadMaterials = (row) => {
  try {
    // 模拟材料数据
    const materialFiles = [
      { name: '身份证.jpg', url: 'mock-url-1', size: '1.2MB' },
      { name: '成绩单.pdf', url: 'mock-url-2', size: '856KB' },
      { name: '证书扫描件.jpg', url: 'mock-url-3', size: '2.1MB' }
    ]
    
    // 检查是否有材料
    if (!materialFiles || materialFiles.length === 0) {
      ElMessage.warning('该申请暂无上传材料')
      return
    }
    
    // 显示材料列表对话框
    ElMessageBox({
      title: `${row.studentName} - 证明材料下载`,
      message: h('div', [
        h('p', { style: 'margin-bottom: 15px; color: #666' }, '请选择要下载的材料：'),
        h('div', { style: 'max-height: 300px; overflow-y: auto' }, 
          materialFiles.map((file, index) => 
            h('div', { 
              key: index,
              style: 'display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #eee; margin-bottom: 8px; border-radius: 4px; background: #fafafa'
            }, [
              h('div', [
                h('div', { style: 'font-weight: 500; margin-bottom: 4px' }, file.name),
                h('div', { style: 'font-size: 12px; color: #999' }, `大小: ${file.size}`)
              ]),
              h('button', {
                style: 'padding: 5px 12px; background: #409eff; color: white; border: none; border-radius: 4px; cursor: pointer',
                onClick: () => downloadSingleFile(file, row.studentName)
              }, '下载')
            ])
          )
        ),
        h('div', { style: 'margin-top: 15px; text-align: center' }, [
          h('button', {
            style: 'padding: 8px 20px; background: #67c23a; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px',
            onClick: () => downloadAllMaterials(materialFiles, row.studentName)
          }, '下载全部'),
        ])
      ]),
      showCancelButton: true,
      confirmButtonText: '关闭',
      cancelButtonText: '取消',
      customClass: 'material-download-box'
    })
    
  } catch (error) {
    console.error('下载材料失败:', error)
    ElMessage.error('下载材料失败，请重试')
  }
}

// 下载单个文件
const downloadSingleFile = (file, studentName) => {
  try {
    // 创建模拟文件内容
    const content = `这是 ${studentName} 的 ${file.name} 文件内容（模拟数据）`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    
    // 创建下载链接
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${studentName}_${file.name}`)
    link.style.visibility = 'hidden'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    ElMessage.success(`${file.name} 下载成功`)
  } catch (error) {
    console.error('下载文件失败:', error)
    ElMessage.error(`下载 ${file.name} 失败`)
  }
}

// 下载全部材料
const downloadAllMaterials = (files, studentName) => {
  try {
    // 创建ZIP文件内容的模拟
    const zipContent = files.map(file => 
      `文件名: ${file.name}\n大小: ${file.size}\n内容: 这是${studentName}的${file.name}文件内容（模拟数据）\n\n`
    ).join('---\n\n')
    
    const blob = new Blob([zipContent], { type: 'text/plain;charset=utf-8' })
    
    // 创建下载链接
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    // 生成文件名
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const filename = `${studentName}_免考材料_${dateStr}.txt`
    
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    ElMessage.success(`全部材料已打包下载为 ${filename}`)
  } catch (error) {
    console.error('打包下载失败:', error)
    ElMessage.error('打包下载失败，请重试')
  }
}

// 导出免考名单
const exportExemptionList = async () => {
  try {
    exportLoading.value = true
    ElMessage.info('正在导出免考名单，请稍候...')
    
    // 调用API导出数据
    const response = await exportExemptionListAPI({
      status: searchForm.status,
      studentName: searchForm.studentName,
      studentId: searchForm.studentId,
      dateRange: searchForm.dateRange
    })
    
    // 检查响应
    if (!response || !response.data) {
      throw new Error('导出数据为空')
    }
    
    // 创建下载链接
    const blob = response.data instanceof Blob 
      ? response.data 
      : new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
    
    // 检查blob大小
    if (blob.size === 0) {
      throw new Error('导出文件为空')
    }
    
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    // 生成文件名
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-')
    const filename = `免考申请名单_${dateStr}_${timeStr}.xlsx`
    
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    // 添加到DOM并触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
    
    ElMessage.success(`免考名单已导出为 ${filename}`)
    
  } catch (error) {
    console.error('导出失败:', error)
    
    // 如果API调用失败，使用本地数据导出CSV
    try {
      await exportLocalData()
    } catch (fallbackError) {
      console.error('本地导出也失败:', fallbackError)
      ElMessage.error('导出失败，请重试')
    }
  } finally {
    exportLoading.value = false
  }
}

// 本地数据导出（备用方案）
const exportLocalData = async () => {
  if (!exemptionList.value || exemptionList.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  
  // 创建Excel数据
  const exportData = exemptionList.value.map(item => ({
    '考籍号': item.studentId || '',
    '考生姓名': item.studentName || '',
    '专业': item.major || '',
    '课程代码': item.courseCode || '',
    '课程名称': item.courseName || '',
    '免考类型': item.exemptionType || '',
    '申请时间': item.applyDate || '',
    '状态': getStatusText(item.status),
    '审核人': item.auditor || '-',
    '审核时间': item.auditDate || '-'
  }))

  // 创建CSV内容
  const headers = Object.keys(exportData[0] || {})
  const csvContent = [
    headers.join(','),
    ...exportData.map(row => 
      headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
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
  const filename = `免考申请名单_${dateStr}_${timeStr}.csv`
  
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  // 触发下载
  document.body.appendChild(link)
  link.click()
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
  
  ElMessage.success(`免考名单已导出为 ${filename}`)
}

// 搜索考生
const searchStudent = async () => {
  if (!applyForm.studentId.trim()) {
    ElMessage.warning('请先输入考籍号')
    return
  }
  
  searching.value = true
  
  try {
    // 调用API查询学生信息
    const response = await getStudentInfoAPI(applyForm.studentId)
    const studentData = response.data
    
    if (studentData) {
      applyForm.studentName = studentData.name
      applyForm.major = studentData.major
      autoFillFromSearch.value = true
      ElMessage.success('考生信息查询成功')
    } else {
      ElMessage.warning('未找到该考籍号对应的考生信息，请检查考籍号或手动输入')
      autoFillFromSearch.value = false
    }
  } catch (error) {
    ElMessage.error('查询考生信息失败，请重试')
    console.error('Search student error:', error)
  } finally {
    searching.value = false
  }
}

// 切换手动输入模式
const toggleManualInput = (value) => {
  autoFillFromSearch.value = !value
  if (value) {
    // 手动输入模式，清空并启用所有字段
    applyForm.studentName = ''
    applyForm.major = ''
  }
}

// 政策课程选择变化
const onPolicyCourseChange = (courseCode) => {
  const course = availableCourses.value.find(c => c.code === courseCode)
  if (course) {
    policyForm.courseName = course.name
  }
}

// 课程选择变化
const onCourseChange = (courseCode) => {
  const course = availableCourses.value.find(c => c.code === courseCode)
  if (course) {
    applyForm.courseName = course.name
  }
}

// 材料上传处理
const handleMaterialChange = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file.raw)
    formData.append('exemptionId', applyForm.studentId) // 使用学号作为临时标识
    
    const response = await uploadMaterialsAPI(formData)
    
    // 将上传成功的文件信息添加到表单中
    applyForm.materials.push({
      name: file.name,
      url: response.data.url,
      size: file.size
    })
    
    ElMessage.success('材料上传成功')
  } catch (error) {
    ElMessage.error('材料上传失败')
    console.error('Upload material error:', error)
  }
}

// 提交免考申请
const submitExemption = async () => {
  try {
    // 验证表单
    if (applyFormRef.value) {
      const valid = await applyFormRef.value.validate()
      if (!valid) return
    }
    
    // 准备申请数据
    const applicationData = {
      studentId: applyForm.studentId,
      studentName: applyForm.studentName,
      major: applyForm.major,
      courseCode: applyForm.courseCode,
      courseName: applyForm.courseName,
      exemptionType: applyForm.exemptionType,
      description: applyForm.description,
      materials: applyForm.materials
    }
    
    // 调用API提交申请
    const response = await createExemptionAPI(applicationData)
    
    ElMessage.success('免考申请提交成功')
    showApplyDialog.value = false
    
    // 重新加载列表
    await loadExemptionList()
    
    // 重置表单
    Object.keys(applyForm).forEach(key => {
      if (Array.isArray(applyForm[key])) {
        applyForm[key] = []
      } else {
        applyForm[key] = ''
      }
    })
    autoFillFromSearch.value = false
    manualInput.value = false
    
  } catch (error) {
    console.error('提交申请失败:', error)
    ElMessage.error('提交申请失败，请重试')
  }
}

// 审核免考申请
const auditExemption = async (row) => {
  try {
    // 显示审核对话框
    ElMessageBox.prompt('请输入审核意见', `审核申请 - ${row.studentName}`, {
      confirmButtonText: '通过',
      cancelButtonText: '驳回',
      inputPlaceholder: '请输入审核意见',
      inputType: 'textarea',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '请输入审核意见'
        }
        return true
      }
    }).then(async ({ value, action }) => {
      const auditData = {
        id: row.id || row.studentId,
        status: action === 'confirm' ? 'approved' : 'rejected',
        auditComment: value,
        auditor: '当前用户' // 从用户状态获取
      }
      
      await auditExemptionAPI(auditData)
      
      ElMessage.success(`审核${action === 'confirm' ? '通过' : '驳回'}成功`)
      
      // 重新加载列表
      await loadExemptionList()
      
    }).catch(() => {
      ElMessage.info('已取消审核')
    })
    
  } catch (error) {
    ElMessage.error('审核失败')
    console.error('Audit error:', error)
  }
}

// 提交审核
const submitAudit = () => {
  ElMessage.success('审核提交成功')
  showAuditDialog.value = false
}

// 编辑政策
const editPolicy = (row) => {
  ElMessage.info(`编辑政策: ${row.policyName}`)
}

// 切换政策状态
const togglePolicyStatus = (row) => {
  const action = row.status === 'active' ? '停用' : '启用'
  ElMessageBox.confirm(`确定要${action}该政策吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`政策已${action}`)
  })
}

// 取消新增政策
const cancelAddPolicy = () => {
  showAddPolicyDialog.value = false
  // 重置表单
  Object.keys(policyForm).forEach(key => {
    if (Array.isArray(policyForm[key])) {
      policyForm[key] = []
    } else {
      policyForm[key] = key === 'status' ? 'active' : ''
    }
  })
}

// 保存政策
const savePolicy = async () => {
  try {
    // 验证表单
    if (policyFormRef.value) {
      const valid = await policyFormRef.value.validate()
      if (!valid) return
    }
    
    // 创建新政策对象
    const newPolicy = {
      id: Date.now(), // 临时ID，实际应该由后端生成
      policyName: policyForm.policyName,
      courseCode: policyForm.courseCode,
      courseName: policyForm.courseName,
      exemptionCondition: policyForm.exemptionCondition,
      scope: policyForm.scope.join(', '),
      effectiveDate: policyForm.effectiveDate,
      status: policyForm.status,
      remark: policyForm.remark,
      createTime: new Date().toISOString().split('T')[0]
    }
    
    // 添加到政策列表
    policyList.value.push(newPolicy)
    
    ElMessage.success('政策新增成功')
    showAddPolicyDialog.value = false
    
    // 重置表单
    cancelAddPolicy()
    
  } catch (error) {
    console.error('保存政策失败:', error)
    ElMessage.error('保存政策失败，请重试')
  }
}

// 统计相关方法
const getPassRateType = (rate) => {
  if (rate >= 90) return 'success'
  if (rate >= 80) return 'warning'
  return 'danger'
}

const getTrendIcon = (trend) => {
  switch (trend) {
    case 'up': return 'ArrowUp'
    case 'down': return 'ArrowDown'
    case 'stable': return 'Minus'
    default: return 'Minus'
  }
}

const getTrendText = (trend) => {
  switch (trend) {
    case 'up': return '上升'
    case 'down': return '下降'
    case 'stable': return '稳定'
    default: return '稳定'
  }
}

const getBarHeight = (value, type) => {
  const maxValues = {
    applications: Math.max(...monthlyTrendData.value.map(m => m.applications)),
    approved: Math.max(...monthlyTrendData.value.map(m => m.approved))
  }
  const maxValue = maxValues[type] || 1
  return `${(value / maxValue) * 80}px`
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#52c41a'
  if (percentage >= 80) return '#faad14'
  if (percentage >= 70) return '#fa8c16'
  return '#ff4d4f'
}

const refreshStats = () => {
  ElMessage.success('统计数据已刷新')
  // 模拟数据刷新
  calculatePolicyStats()
}

const calculatePolicyStats = () => {
  // 计算政策统计
  policyStats.value.totalPolicies = policyList.value.length
  policyStats.value.activePolicies = policyList.value.filter(p => p.status === 'active').length
  policyStats.value.totalApplications = exemptionList.value.length
  
  // 计算通过率
  const approvedCount = exemptionList.value.filter(app => 
    app.status === 'final_approved' || app.status === 'first_approved'
  ).length
  policyStats.value.approvalRate = exemptionList.value.length > 0 
    ? Math.round((approvedCount / exemptionList.value.length) * 100) 
    : 0
}

// 分页处理
// 更新统计数据
const updateStatistics = () => {
  pendingCount.value = exemptionList.value.filter(item => item.status === 'pending').length
  approvedCount.value = exemptionList.value.filter(item => 
    item.status === 'final_approved' || item.status === 'first_approved'
  ).length
  rejectedCount.value = exemptionList.value.filter(item => item.status === 'rejected').length
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const response = await getExemptionStatsAPI()
    const stats = response.data
    pendingCount.value = stats.pending || 0
    approvedCount.value = stats.approved || 0
    rejectedCount.value = stats.rejected || 0
  } catch (error) {
    console.error('Load statistics error:', error)
  }
}

// 加载政策数据
const loadPolicyData = async () => {
  try {
    const response = await getPolicyListAPI()
    policyList.value = response.data.records || []
  } catch (error) {
    console.error('Load policy data error:', error)
  }
}

// 分页变化处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadExemptionList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadExemptionList()
}

// 组件挂载时初始化数据
onMounted(async () => {
  await loadExemptionList()
  await loadStatistics()
  await loadPolicyData()
  calculatePolicyStats()
})
</script>

<style scoped>
.exemption-management {
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

.policy-actions {
  margin-bottom: 20px;
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

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.form-tip {
  display: flex;
  align-items: center;
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}

.form-tip .el-icon {
  margin-right: 5px;
}

/* 统计相关样式 */
.stats-overview {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #1f2d3d;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.charts-section {
  margin-bottom: 20px;
}

.policy-usage-chart {
  height: 300px;
  overflow-y: auto;
}

.trend-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
}

.monthly-trend-chart {
  height: 300px;
  padding: 10px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.monthly-data {
  display: flex;
  justify-content: space-around;
  align-items: end;
  height: 200px;
  padding: 0 20px;
}

.month-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.month-label {
  font-size: 12px;
  color: #666;
}

.month-bars {
  display: flex;
  gap: 4px;
  align-items: end;
}

.bar-container {
  position: relative;
  width: 20px;
}

.bar {
  width: 100%;
  min-height: 8px;
  border-radius: 2px 2px 0 0;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
}

.bar.applications {
  background-color: #1890ff;
}

.bar.approved {
  background-color: #52c41a;
}

.bar-value {
  position: absolute;
  top: -20px;
  font-size: 10px;
  color: #666;
  white-space: nowrap;
}

.course-analysis {
  margin-top: 20px;
}

/* 详情对话框样式 */
:deep(.detail-message-box) {
  .el-message-box__content {
    padding: 20px;
  }
}

:deep(.material-download-box) {
  .el-message-box__content {
    padding: 20px;
  }
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