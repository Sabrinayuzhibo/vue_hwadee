<template>
	<div >
		<!-- 顶部导航栏组件 -->
		<HeaderBar />
		<div class="main-layout">
			<!-- 侧边栏菜单组件，传递菜单数据和当前激活菜单 -->
			<SidebarMenu :menus="menus" :active-menu="activeMenu" />
			<div class="main-content">
				<!-- 欢迎标题区域 -->
				<h1 class="welcome">欢迎访问系统！</h1>
				<p class="subtitle">您已成功登录系统，可以使用所有功能</p>

				<!-- 仪表板内容区域 -->
				<div class="dashboard">
					<!-- 用户统计卡片 -->
					<el-card shadow="hover" class="stat-card">
						<div class="card-content">
							<div class="stat-icon" style="background-color: #e6f7ff;">
								<el-icon :size="32" color="#1890ff">
									<User />
								</el-icon>
							</div>
							<div class="stat-text">
								<h3 class="stat-title">用户总数</h3>
								<p class="stat-value">{{countUser}}</p>
							</div>
						</div>
					</el-card>

					<!-- 信息卡片区域 -->
					<div class="info-card">
						<!-- 系统公告卡片 -->
						<el-card class="card">
							<template #header>
								<div class="card-header">
									<h3>系统公告</h3>
									<el-button type="text">更多</el-button>
								</div>
							</template>
							<div class="notice-list">
								<div v-for="(item, index) in notices" :key="index" class="notice-item">
									<el-icon :size="18" color="#409eff">
										<CircleCheck />
									</el-icon>
									<span>{{ item }}</span>
								</div>
							</div>
						</el-card>

						<!-- 最近活动卡片 -->
						<el-card class="card">
							<template #header>
								<div class="card-header">
									<h3>最近活动</h3>
									<el-button type="text">更多</el-button>
								</div>
							</template>
							<div class="activity-list">
								<div v-for="(item, index) in activities" :key="index" class="activity-item">
									<el-tag size="small" :type="item.type">{{ item.time }}</el-tag>
									<span>{{ item.content }}</span>
								</div>
							</div>
						</el-card>
					</div>
				</div>
			</div>
		</div>

		<!-- 底部导航栏组件 -->
		<FooterBar />
	</div>
</template>

<script setup>
	// 导入Vue 3 Composition API相关函数
	import {
		ref,
		computed,
		onMounted,
		h
	} from 'vue'
	import axios from 'axios';
	import {
		useRouter
	} from 'vue-router'
	import {
		ElMessage
	} from 'element-plus';
	import {
		User,
		CircleCheck,
    Monitor,
    Setting,
    Document
	} from '@element-plus/icons-vue'
	// 导入自定义组件
	import HeaderBar from '@/components/HeaderBar.vue'
	import FooterBar from '@/components/FooterBar.vue' 
	import SidebarMenu from '@/components/SidebarMenu.vue'

	// 获取路由实例
	const router = useRouter()
	// 响应式数据定义
	const errorMsg = ref('') // 错误信息
	const countUser = ref(0) // 用户总数

	const menus = ref(JSON.parse(localStorage.getItem('menus')) || '[]') // 从本地存储获取菜单数据
  	const activeMenu = computed(() => router.currentRoute.value.path) // 计算当前激活的菜单

	// 系统公告数据
	const notices = ref([
		'系统将于本周五凌晨进行维护升级',
		'新增用户管理功能已上线',
		'请及时修改您的初始密码',
		'系统使用手册已更新'
	])

	// 最近活动数据
	const activities = ref([{
			time: '今天',
			content: '您登录了系统',
			type: 'success'
		},
		{
			time: '昨天',
			content: '您查看了用户管理',
			type: ''
		},
		{
			time: '2天前',
			content: '您更新了个人资料',
			type: 'info'
		},
		{
			time: '3天前',
			content: '您设置了新的密码',
			type: 'warning'
		}
	])

	
</script>

<style scoped>
	/* 主布局样式 */
	.main-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* 头部样式 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 30px;
		background-color: #fff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	/* 主内容区域样式 */
	.main-content {
		flex: 1;
		padding: 30px;
		overflow-y: auto;
		height: calc(100vh - 120px); /* 计算高度，减去头部和底部的高度 */
	}

	/* 欢迎标题样式 */
	.welcome {
		font-size: 28px;
		font-weight: 600;
		color: #333;
		margin-bottom: 10px;
	}

	/* 副标题样式 */
	.subtitle {
		font-size: 16px;
		color: #666;
		margin-bottom: 30px;
	}

	/* 仪表板样式 */
	.dashboard {
		margin-top: 30px;
	}

	/* 统计卡片样式 */
	.stat-card {
		margin-bottom: 20px;
		border-radius: 8px;
	}

	/* 卡片内容样式 */
	.card-content {
		display: flex;
		align-items: center;
	}

	/* 统计图标样式 */
	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 12px;
		margin-right: 20px;
	}

	/* 统计标题样式 */
	.stat-title {
		font-size: 18px;
		font-weight: 500;
		color: #606266;
		margin-bottom: 5px;
	}

	/* 统计数值样式 */
	.stat-value {
		font-size: 28px;
		font-weight: 600;
		color: #1f2d3d;
	}

	/* 信息卡片区域样式 */
	.info-card {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); /* 响应式网格布局 */
		gap: 20px;
		margin-top: 30px;
	}

	/* 卡片样式 */
	.card {
		border-radius: 8px;
		height: 100%;
	}

	/* 卡片头部样式 */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0;
	}

	/* 公告项和活动项基础样式 */
	.notice-item,
	.activity-item {
		display: flex;
		align-items: center;
		padding: 12px 0;
		border-bottom: 1px solid #ebeef5;
	}

	/* 最后一个项目不显示底部边框 */
	.notice-item:last-child,
	.activity-item:last-child {
		border-bottom: none;
	}

	/* 公告项图标样式 */
	.notice-item .el-icon {
		margin-right: 10px;
	}

	/* 活动项样式 */
	.activity-item {
		padding: 8px 0;
	}

	/* 活动项标签样式 */
	.activity-item .el-tag {
		margin-right: 10px;
		width: 60px;
		text-align: center;
	}

	/* 响应式设计 - 移动端适配 */
	@media (max-width: 768px) {
		.info-card {
			grid-template-columns: 1fr; /* 移动端单列显示 */
		}

		.header {
			flex-direction: column;
			padding: 15px;
		}

		.user-info {
			margin-top: 10px;
		}
	}
</style>