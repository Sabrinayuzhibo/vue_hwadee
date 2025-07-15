<template>
	<!-- 登录页面容器 -->
	<div class="login-container">
		<!-- 背景动画效果 -->
		<div class="login-bg-animation">
			<div class="circle circle-1"></div>
			<div class="circle circle-2"></div>
			<div class="circle circle-3"></div>
		</div>

		<!-- 登录卡片 -->
		<div class="login-card">
			<!-- 登录页面头部 -->
			<div class="login-header">
				<div class="logo">
					<!-- 系统Logo SVG图标 -->
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round" />
						<path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
							stroke-linejoin="round" />
						<path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
				</div>
				<h1 class="title">欢迎登录省考试院自学考试考籍管理系统</h1>
				<p class="subtitle">请填写您的个人信息</p>
			</div>

			<!-- 登录表单 -->
			<el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px" label-position="top"
				@submit.prevent="handleLogin">
				<!-- 用户名输入框 -->
				<el-form-item label="姓名" prop="name">
					<el-input v-model="loginForm.name" placeholder="请输入姓名" size="large" :prefix-icon="User" />
				</el-form-item>

				<!-- 密码输入框 -->
				<el-form-item label="密码" prop="password">
					<el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large"
						show-password :prefix-icon="Lock" />
				</el-form-item>

				<!-- 记住登录选项 -->
				<el-form-item>
					<el-checkbox v-model="loginForm.remember">记住登录</el-checkbox>
				</el-form-item>

				<!-- 登录按钮 -->
				<el-form-item>
					<el-button type="primary" size="large" class="login-button" :loading="loading" native-type="submit">
						{{ loading ? '登录中...' : '登 录' }}
					</el-button>
				</el-form-item>
			</el-form>

			<!-- 登录页面底部 -->
			<div class="login-footer">
				<!-- 错误信息显示 -->
				<p class="error-message" v-if="errorMsg">{{ errorMsg }}</p>
				<!-- 额外链接 -->
				<div class="extra-links">
					<el-link type="primary" >忘记密码?</el-link>
					<el-divider direction="vertical" />
					<el-link type="primary" @click="handleRegister">注册账号</el-link>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	// 导入Vue 3 Composition API相关函数
	import { ref, reactive } from 'vue';
	import { useRouter } from 'vue-router';
	import { User, Lock } from '@element-plus/icons-vue';
	import { ElMessage } from 'element-plus';
	import { login } from '@/api/getLogin.js'; // 导入登录API函数
	import { useUserStore } from '@/store/user'

	const router = useRouter(); // 增加这一行
	const userStore = useUserStore()

	// 响应式数据
	const loginForm = reactive({
		name: '',
		password: '',
		remember: false
	});

	const loading = ref(false);
	const errorMsg = ref(''); // 增加这一行
	const loginFormRef = ref(null); // 增加这一行

	// 校验规则
	const loginRules = reactive({
		name: [
			{ required: true, message: '请输入姓名', trigger: 'blur' },
			{ min: 2, max: 16, message: '姓名长度在2-16个字符', trigger: 'blur' }
		],
		password: [
			{ required: true, message: '请输入密码', trigger: 'blur' },
			{ min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' }
		]
	});

	// 登录处理
	const handleLogin = async () => {
		try {
			// 表单验证
			const valid = await loginFormRef.value.validate();
			if (!valid) return;

			// 重置错误信息
			errorMsg.value = '';
			loading.value = true;

			// 调用登录接口
			const response = await login({
				name: loginForm.name,
				password: loginForm.password
			});
			// 处理响应
			if (response.status === 200) {
				// 登录成功处理
				ElMessage.success({
					message: '登录成功!',
					duration: 2000
				});
				console.log(response)
				const role=response.data.msg
				console.log(role);

		
				// 延迟跳转，实际项目中需替换为路由器跳转
				setTimeout(() => {
					// 跳转到主页
					router.push('/')
					userStore.setRole(role) // 登录成功后
					userStore.setName(loginForm.name) // 添加这行，保存姓名
				}, 1000);
			} else {
				// API返回的错误处理
				errorMsg.value = response.message || '登录失败，请重试';
			}
		} catch (error) {
			// 错误处理
			if (error.response) {
				// 请求已发出，但服务器响应的状态码不在 2xx 范围内
				const status = error.response.status;
				if (status === 401) {
					errorMsg.value = '用户名或密码错误';
				} else if (status === 403) {
					errorMsg.value = '无访问权限，请联系管理员';
				} else {
					errorMsg.value = `服务器错误 (${status})`;
				}
			} else if (error.request) {
				// 请求已发出，但没有收到响应
				errorMsg.value = '网络连接错误，请检查网络';
			} else {
				// 在设置请求时出现问题
				errorMsg.value = '请求配置错误';
			}
			console.error('登录失败:', error);
		} finally {
			loading.value = false; // 无论成功失败都要关闭加载状态
		}
	};
	
	// 注册账号跳转函数
	const handleRegister = () => {
		router.push('/register') // 跳转到注册页面
	}	
</script>

<style scoped>
	/* 登录页面容器样式 */
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

	/* 登录卡片样式 */
	.login-card {
		width: 100%;
		max-width: 520px; /* 原420px，放大 */
		background: rgba(255, 255, 255, 0.95);
		border-radius: 20px; /* 原16px，略大 */
		padding: 56px; /* 原40px，放大 */
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18); /* 阴影略大 */
		z-index: 1;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	/* 登录卡片顶部装饰条 */
	.login-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #6e8efb, #a777e3);
	}

	/* 登录卡片悬停效果 */
	.login-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
	}

	/* 登录页面头部样式 */
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
		font-size: 30px; /* 原24px，放大 */
		font-weight: 600;
		color: #333;
		margin-bottom: 12px;
	}

	/* 副标题样式 */
	.subtitle {
		font-size: 18px; /* 原14px，放大 */
		color: #666;
	}

	/* 表单项样式 */
	.el-form-item {
		margin-bottom: 32px; /* 原24px，放大 */
	}

	/* 表单标签样式 */
	.el-form-item :deep(.el-form-item__label) {
		font-weight: 500;
		color: #555;
		padding-bottom: 6px;
	}

	/* 登录按钮样式 */
	.login-button {
		width: 100%;
		font-weight: 500;
		letter-spacing: 1px;
		background: linear-gradient(to right, #6e8efb, #a777e3);
		border: none;
		height: 56px; /* 原48px，放大 */
		margin-top: 16px; /* 原10px，放大 */
		font-size: 18px; /* 按钮文字更大 */
		transition: all 0.3s;
	}

	/* 登录按钮悬停效果 */
	.login-button:hover {
		background: linear-gradient(to right, #5d7cea, #8e66d6);
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(110, 142, 251, 0.4);
	}

	/* 输入框字体和高度放大 */
	:deep(.el-input__inner) {
		font-size: 18px;
		height: 48px;
	}

	/* 登录页面底部样式 */
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
			padding: 32px 12px;
			max-width: 98vw;
		}
		.title {
			font-size: 22px;
		}
		.login-button {
			height: 44px;
			font-size: 16px;
		}
	}
</style>