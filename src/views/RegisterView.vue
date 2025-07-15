<template>
    <!-- 注册页面容器 -->
    <div class="login-container">
      <!-- 背景动画效果 -->
      <div class="login-bg-animation">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
  
      <!-- 注册卡片 -->
      <div class="login-card">
        <!-- 注册页面头部 -->
        <div class="login-header">
          <div class="logo">
            <!-- 使用相同的logo -->
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <h1 class="title">用户注册</h1>
          <p class="subtitle">请填写注册信息</p>
        </div>
  
        <!-- 注册表单 -->
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="100px" label-position="top"
          @submit.prevent="handleRegister">
          <!-- 姓名输入框 -->
          <el-form-item label="姓名" prop="name">
            <el-input v-model="registerForm.name" placeholder="请输入真实姓名" size="large" :prefix-icon="User" />
          </el-form-item>

          <!-- 身份证号输入框 -->
          <el-form-item label="身份证号" prop="idCard">
            <el-input v-model="registerForm.idCard" placeholder="请输入身份证号" size="large" />
          </el-form-item>

          <!-- 密码输入框 -->
          <el-form-item label="密码" prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large"
              show-password :prefix-icon="Lock" />
          </el-form-item>

          <!-- 报考专业下拉 -->
          <el-form-item label="报考专业" prop="major">
            <el-select v-model="registerForm.major" placeholder="请选择报考专业" size="large">
              <el-option v-for="item in majorOptions" :key="item.id" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>

          <!-- 州级考试院下拉 -->
          <el-form-item label="州级考试院" prop="examInstitute">
            <el-select v-model="registerForm.examInstitute" placeholder="请选择州级考试院" size="large">
              <el-option v-for="item in examInstituteOptions" :key="item.id" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>

          <!-- 性别下拉 -->
          <el-form-item label="性别" prop="gender">
            <el-select v-model="registerForm.gender" placeholder="请选择性别" size="large">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </el-form-item>

          <!-- 出生日期选择器 -->
          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker v-model="registerForm.birthDate" type="date" placeholder="请选择出生日期" size="large" style="width: 100%;" />
          </el-form-item>

          <!-- 联系电话输入框 -->
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="registerForm.phone" placeholder="请输入联系电话" size="large" />
          </el-form-item>

          <!-- 住址输入框 -->
          <el-form-item label="住址" prop="address">
            <el-input v-model="registerForm.address" placeholder="请输入住址" size="large" />
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button type="primary" size="large" class="login-button" :loading="loading" native-type="submit">
              {{ loading ? '注册中...' : '立即注册' }}
            </el-button>
          </el-form-item>
        </el-form>
  
        <!-- 注册页面底部 -->
        <div class="login-footer">
          <!-- 错误信息显示 -->
          <p class="error-message" v-if="errorMsg">{{ errorMsg }}</p>
          <!-- 额外链接 -->
          <div class="extra-links">
            <el-link type="primary" @click="$router.push('/login')">已有账号？立即登录</el-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // 导入Vue 3 Composition API相关函数
  import { ref, reactive, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router'
  import { User, Lock } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
import { register } from '@/api/getRegister.js'; // 导入注册API函数
import { getMajors, getExamCenters } from '@/api/getRegister.js'
import { fetchAllMajors } from '@/api/getCommon.js'
const majorOptions = ref([])
const examInstituteOptions = ref([])
const majorList = ref([])

onMounted(async () => {
  // 获取报考专业
  const majorsRes = await getMajors()
  if (majorsRes.status === 200) {
    // majorsRes.data.data 是 [{ majorCode, majorName }]
    majorOptions.value = majorsRes.data.data.map(item => ({
      id: item.majorCode,
      name: item.majorName
    }))
  }
  // 获取考试院
  const examRes = await getExamCenters()
  if (examRes.status === 200) {
    // examRes.data.data 是 ["四川省教育考试院", ...]
    examInstituteOptions.value = examRes.data.data.map((name, idx) => ({
      id: idx,
      name
    }))
  }

 
})

  // 注册表单响应式数据
  const registerForm = reactive({
    name: '', // 姓名
    idCard: '', // 身份证号
    password: '', // 密码
    major: '', // 报考专业
    examInstitute: '', // 州级考试院
    gender: '', // 性别
    birthDate: '', // 出生日期
    phone: '', // 联系电话
    address: '' // 住址
  });
  
  const router = useRouter() // 获取路由实例
  const loading = ref(false); // 加载状态
  const errorMsg = ref(''); // 错误信息
  const registerFormRef = ref(null); // 表单引用
  
  // 表单验证规则
  const registerRules = reactive({
    name: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
      { min: 2, max: 6, message: '姓名长度2-6个字符', trigger: 'blur' }
    ],
    idCard: [
      { required: true, message: '请输入身份证号', trigger: 'blur' },
      { pattern: /^\d{17}[\dXx]$/, message: '身份证号格式不正确', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度6-20个字符', trigger: 'blur' }
    ],
    major: [
      { required: true, message: '请选择报考专业', trigger: 'change' }
    ],
    examInstitute: [
      { required: true, message: '请选择州级考试院', trigger: 'change' }
    ],
    gender: [
      { required: true, message: '请选择性别', trigger: 'change' }
    ],
    birthDate: [
      { required: true, message: '请选择出生日期', trigger: 'change' }
    ],
    phone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    address: [
      { required: true, message: '请输入住址', trigger: 'blur' }
    ]
  });
  
  // 注册处理函数
  const handleRegister = async () => {
    try {
      // 表单验证
      const valid = await registerFormRef.value.validate();
      if (!valid) return;
  
      // 重置错误信息
      errorMsg.value = '';
      loading.value = true;

      const majorRes = await fetchAllMajors()
      console.log( majorRes)
      if (majorRes.status === 200) {
        majorList.value = majorRes.data.data
      }
      console.log(majorList.value) 
      const getMajorCodeByName = (name) => {
        const found = majorList.value.find(item => item.majorName === name)
        return found ? found.majorCode : ''
      }

      const submit_data = {
        name: registerForm.name,
        idNumber: registerForm.idCard,
        password: registerForm.password,
        majorCode: getMajorCodeByName(registerForm.major), // 这里做转换
        examCenterName: registerForm.examInstitute,
        gender: registerForm.gender,
        birthDate: registerForm.birthDate ? registerForm.birthDate.toISOString().slice(0, 10) : '',
        phone: registerForm.phone,
        address: registerForm.address
      }
      console.log(submit_data)
      // 调用注册API
      const response = await register(submit_data);
      console.log(response)
      // 处理注册响应
      if (response.data && response.data.msg === "学生注册成功") {
        ElMessage.success({
          message: '学生注册成功',
          duration: 2000
        });
        // 注册成功后延迟跳转到登录页面
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        errorMsg.value = response.data?.message || '注册失败，请重试';
      }
    } catch (error) {
      // 错误处理逻辑与登录页面保持一致
      if (error.response) {
        const status = error.response.status;
        errorMsg.value = status === 400 ? '请求参数错误' : `服务器错误 (${status})`;
      } else {
        errorMsg.value = '网络连接异常';
      }
      console.error('注册失败:', error);
    } finally {
      loading.value = false; // 无论成功失败都要关闭加载状态
    }
  };
  </script>
  
  <style scoped>
  /* 注册页面容器样式 */
  .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #6e8efb, #a777e3); /* 渐变背景 */
          padding: 20px;
          position: relative;
          overflow: hidden;
      }
  
      /* 背景动画容器 */
      .login-bg-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 0;
      }
  
      /* 浮动圆圈基础样式 */
      .circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px); /* 模糊效果 */
          opacity: 0.2;
          animation-duration: 12s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
      }
  
      /* 第一个浮动圆圈 */
      .circle-1 {
          width: 300px;
          height: 300px;
          background: #ff7eb3;
          top: 20%;
          left: 10%;
          animation-name: float-1;
      }
  
      /* 第二个浮动圆圈 */
      .circle-2 {
          width: 400px;
          height: 400px;
          background: #7fc1ff;
          bottom: 15%;
          right: 10%;
          animation-name: float-2;
      }
  
      /* 第三个浮动圆圈 */
      .circle-3 {
          width: 250px;
          height: 250px;
          background: #ffcc66;
          top: 50%;
          right: 20%;
          animation-name: float-3;
      }
  
      /* 第一个圆圈的浮动动画 */
      @keyframes float-1 {
          0% {
              transform: translate(0, 0) scale(1);
          }
  
          50% {
              transform: translate(40px, 50px) scale(1.05);
          }
  
          100% {
              transform: translate(0, 0) scale(1);
          }
      }
  
      /* 第二个圆圈的浮动动画 */
      @keyframes float-2 {
          0% {
              transform: translate(0, 0) scale(1);
          }
  
          50% {
              transform: translate(-50px, -30px) scale(1.07);
          }
  
          100% {
              transform: translate(0, 0) scale(1);
          }
      }
  
      /* 第三个圆圈的浮动动画 */
      @keyframes float-3 {
          0% {
              transform: translate(0, 0) scale(1);
          }
  
          50% {
              transform: translate(30px, -40px) scale(1.03);
          }
  
          100% {
              transform: translate(0, 0) scale(1);
          }
      }
  
      /* 注册卡片样式 */
      .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.95); /* 半透明白色背景 */
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          z-index: 1;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
      }
  
      /* 注册卡片顶部装饰条 */
      .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #6e8efb, #a777e3);
      }
  
      /* 注册卡片悬停效果 */
      .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
      }
  
      /* 注册页面头部样式 */
      .login-header {
          text-align: center;
          margin-bottom: 30px;
      }
  
      /* Logo样式 */
      .logo {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
      }
  
      .logo svg {
          color: #6e8efb;
          background: rgba(110, 142, 251, 0.1);
          padding: 10px;
          border-radius: 50%;
      }
  
      /* 标题样式 */
      .title {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
      }
  
      /* 副标题样式 */
      .subtitle {
          font-size: 14px;
          color: #666;
      }
  
      /* 表单项样式 */
      .el-form-item {
          margin-bottom: 24px;
      }
  
      /* 表单标签样式 */
      .el-form-item :deep(.el-form-item__label) {
          font-weight: 500;
          color: #555;
          padding-bottom: 6px;
      }
  
      /* 注册按钮样式 */
      .login-button {
          width: 100%;
          font-weight: 500;
          letter-spacing: 1px;
          background: linear-gradient(to right, #6e8efb, #a777e3); /* 渐变背景 */
          border: none;
          height: 48px;
          margin-top: 10px;
          transition: all 0.3s;
      }
  
      /* 注册按钮悬停效果 */
      .login-button:hover {
          background: linear-gradient(to right, #5d7cea, #8e66d6);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
      }
  
      /* 注册页面底部样式 */
      .login-footer {
          text-align: center;
          margin-top: 20px;
      }
  
      /* 错误信息样式 */
      .error-message {
          color: #f56c6c;
          font-size: 14px;
          margin-bottom: 15px;
          min-height: 20px;
          text-align: center;
      }
  
      /* 额外链接样式 */
      .extra-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 10px;
      }
  
      /* 响应式设计 - 移动端适配 */
      @media (max-width: 480px) {
          .login-card {
              padding: 30px 20px;
          }
  
          .title {
              font-size: 22px;
          }
  
          .login-button {
              height: 44px;
          }
      }
  </style>
  