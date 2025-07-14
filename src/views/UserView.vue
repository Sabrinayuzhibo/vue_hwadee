<template>
	<div >
		<!-- 顶部导航栏组件 -->
		<HeaderBar />
		<div class="main-layout">
			<!-- 侧边栏菜单组件，传递菜单数据和当前激活菜单 -->
			<SidebarMenu :menus="menus" :active-menu="activeMenu" />
			<div class="main-content">
				<!-- 搜索表单区域 -->
				<el-form :inline="true" :model="formInline" class="demo-form-inline">
					<el-form-item label="姓名">
						<el-input v-model="formInline.name" placeholder="姓名"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="findUserList">查询</el-button>
						<el-button type="success" @click="addFormVisible = true">新增</el-button>
					</el-form-item>
				</el-form>

				<!-- 用户数据表格 -->
				<el-table
						:data="tableData"
						stripe
						style="width: 100%">
					<el-table-column prop="name" label="姓名" width="180"></el-table-column>
					<el-table-column prop="account" label="账号名"></el-table-column>
					<el-table-column prop="phone" label="手机号"></el-table-column>
					<el-table-column label="操作">
						<template #default="scope">  <!-- 操作列模板 -->
							<el-button size="mini" @click="openUpdateForm(scope.row)">编辑</el-button>
							<el-button size="mini" type="danger" 
									@click="deleteUserByUserId(scope.$index, scope.row)">删除
							</el-button>
						</template>
					</el-table-column>
				</el-table>
				<!-- 分页组件 -->
				<div style="padding-top: 30px;">
					<el-pagination
					v-model:current-page="currentPage"
					v-model:page-size="pageSize"
					:page-sizes="[5, 10, 20]"
					:total="total"
					layout="sizes, prev, pager, next, jumper"
					prev-text="上一页"
					next-text="下一页"
					@current-change="findUserList"
					@size-change="handleSizeChange"
				/>
				</div>
			</div>
		</div>
		<!-- 底部导航栏组件 -->
		<FooterBar />

		<!-- 新增用户对话框 -->
		<el-dialog title="新增用户" v-model="addFormVisible" :close-on-click-modal="false">
			<el-form :model="form">
				<el-form-item label="姓名" :label-width="formLabelWidth">
					<el-input v-model="form.name" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="账号名" :label-width="formLabelWidth">
					<el-input v-model="form.account" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="手机号" :label-width="formLabelWidth">
					<el-input v-model="form.phone" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="密码" :label-width="formLabelWidth">
					<el-input type="password" v-model="form.password" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="再次输入密码" :label-width="formLabelWidth">
					<el-input type="password" v-model="form.password1" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="addFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUserClick">确 定</el-button>
			</div>
		</el-dialog>
		<!-- 修改用户信息对话框 -->
		<el-dialog title="修改用户基本信息" v-model="updateFormVisible" :close-on-click-modal="false">
			<el-form :model="form">
				<el-form-item label="姓名" :label-width="formLabelWidth">
					<el-input v-model="form.name" autocomplete="off"></el-input>
				</el-form-item>
				<el-form-item label="手机号" :label-width="formLabelWidth">
					<el-input v-model="form.phone" autocomplete="off"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="updateFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="updateUserClick">确 定</el-button>
			</div>
		</el-dialog>
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
		CircleCheck
	} from '@element-plus/icons-vue'
	import { logout } from '@/api/getLogin.js'; // 导入登出API函数
  	import { Document, Setting, Monitor } from '@element-plus/icons-vue'
	// 导入自定义组件
	import HeaderBar from '@/components/HeaderBar.vue'
	import FooterBar from '@/components/FooterBar.vue' 
	import SidebarMenu from '@/components/SidebarMenu.vue'
	// 导入用户相关API函数
	import { getUserList, deleteUser, updateUser, addUser } from '@/api/getUser.js'

	// 获取路由实例
	const router = useRouter()
	// 响应式数据定义
	const errorMsg = ref('') // 错误信息
	const countUser = ref(0) // 用户总数
	const menus = ref(JSON.parse(localStorage.getItem('menus')) || '[]') // 从本地存储获取菜单数据
  	const activeMenu = computed(() => router.currentRoute.value.path) // 计算当前激活的菜单

	// 表单相关响应式数据
	const addFormVisible = ref(false) // 控制新增用户对话框显示
	const updateFormVisible = ref(false) // 控制修改用户对话框显示
	const formLabelWidth = ref('120px') // 表单标签宽度
	const formInline = ref({
		name: '', // 搜索表单中的姓名字段
	})
	const form = ref({
		name: '', // 用户姓名
		account: '', // 用户账号
		phone: '', // 用户手机号
		password: '', // 用户密码
		password1: '', // 确认密码
	})
	const updateUserId = ref(0) // 当前编辑的用户ID
	const tableData = ref([]) // 表格数据

	// 分页相关响应式数据
	const currentPage = ref(1) // 当前页码
	const pageSize = ref(5) // 每页显示条数
	const total = ref(0) // 总记录数

	// 查询用户列表函数
	const findUserList = async () => {
		try {
			// 构建查询参数
			const params = {
                    name: formInline.value.name,
                    offset: (currentPage.value - 1) * pageSize.value,
      				limit: pageSize.value,
                }
			// 调用API获取用户列表
			const response = await getUserList(params);
			tableData.value = response.data.rows; // 更新表格数据
			total.value = response.data.total; // 更新总记录数
		} catch (error) {
			ElMessage.error('获取用户列表失败');
		}
	};
	
	// 处理每页条数改变的函数
	const handleSizeChange = (newSize) => {
		pageSize.value = newSize
		findUserList() // 重新获取数据
	}

	// 新增用户函数
	const addUserClick = async () => {
		// 验证两次密码输入是否一致
		if (form.value.password !== form.value.password1) {
			return ElMessage.error('两次输入密码不一致');
		}
		
		try {
			// 调用新增用户API
			await addUser({
				...form.value,
				password: form.value.password
			});
			ElMessage.success('新增成功');
			addFormVisible.value = false; // 关闭对话框
			findUserList(); // 刷新用户列表
		} catch (error) {
			ElMessage.error('新增用户失败');
		}
	};

	// 打开编辑表单函数
	const openUpdateForm = (row) => {
		// 填充表单数据
		form.value = {
			name: row.name,
			phone: row.phone
		};
		updateUserId.value = row.userId; // 设置当前编辑的用户ID
		updateFormVisible.value = true; // 显示编辑对话框
	};

	// 更新用户信息函数
	const updateUserClick = async () => {
		try {
			// 调用更新用户API
			await updateUser({
				userId: updateUserId.value,
				name: form.value.name,
				phone: form.value.phone
			});
			ElMessage.success('更新成功');
			updateFormVisible.value = false; // 关闭对话框
			findUserList(); // 刷新用户列表
		} catch (error) {
			ElMessage.error('更新用户失败');
		}
	};

	// 删除用户函数
	const deleteUserByUserId = async (index, row) => {
		try {
			// 调用删除用户API
			await deleteUser(row.userId);
			ElMessage.success('删除成功');
			tableData.value.splice(index, 1); // 从表格中移除该行
		} catch (error) {
			ElMessage.error('删除用户失败');
		} 
	};

	// 组件挂载时执行
	onMounted(() => {
		findUserList(); // 初始化时获取用户列表
	});

	
</script>

<style scoped>
	/* 主布局样式 */
	.main-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* 主内容区域样式 */
	.main-content {
		flex: 1;
		padding: 30px;
		overflow-y: auto;
		height: calc(100vh - 120px); /* 计算高度，减去头部和底部的高度 */
	}
</style>