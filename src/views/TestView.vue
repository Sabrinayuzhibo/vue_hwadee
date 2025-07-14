<template>
  <div class="test-container">
    <h2>考籍建档API测试</h2>
    
    <el-card>
      <template #header>
        <span>测试数据</span>
      </template>
      
      <el-form :model="testForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="testForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="testForm.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="专业">
          <el-select v-model="testForm.major" placeholder="请选择专业">
            <el-option label="计算机科学与技术" value="计算机科学与技术" />
            <el-option label="汉语言文学" value="汉语言文学" />
            <el-option label="工商管理" value="工商管理" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="testForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="住址">
          <el-input v-model="testForm.address" type="textarea" placeholder="请输入住址" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="testCreateStudent" :loading="loading">
            {{ loading ? '测试中...' : '测试创建' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>测试结果</span>
      </template>
      
      <div v-if="testResult">
        <el-alert :title="testResult.success ? '测试成功' : '测试失败'" 
                  :type="testResult.success ? 'success' : 'error'"
                  :description="testResult.message"
                  show-icon />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { createStudentArchive } from '@/api/getStudent.js'

const loading = ref(false)
const testResult = ref(null)

const testForm = reactive({
  name: '测试用户',
  idCard: '110101199001011234',
  major: '计算机科学与技术',
  phone: '13800138000',
  address: '北京市朝阳区测试街道123号'
})

const testCreateStudent = async () => {
  try {
    loading.value = true
    testResult.value = null

    const response = await createStudentArchive(testForm)
    
    testResult.value = {
      success: true,
      message: `API调用成功！响应状态: ${response.status}`
    }
    
    ElMessage.success('测试成功')
  } catch (error) {
    console.error('测试失败:', error)
    
    testResult.value = {
      success: false,
      message: `API调用失败: ${error.message || '未知错误'}`
    }
    
    ElMessage.error('测试失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}
</style> 