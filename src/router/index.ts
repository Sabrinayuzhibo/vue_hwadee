import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import UserView from '../views/UserView.vue'
import ExamManagementView from '../views/ExamManagementView.vue'
import TestView from '../views/TestView.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false, title: '登录' }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false, title: '注册' }
    },
    {
      path: '/user',
      name: 'user',
      component: UserView,
      meta: { requiresAuth: true, title: '用户中心' }
    },
    {
      path: '/',
      name: 'exam-management',
      component: ExamManagementView,

    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
      meta: { requiresAuth: false, title: '测试页面' }
    }
  ],
})

// 路由守卫 - 检查用户是否已登录
router.beforeEach((to, from, next) => {
  // 判断本地存储中是否有token，用于判断用户是否已登录
  const isAuthenticated = !!localStorage.getItem('token')
  
  // 判断目标路由是否需要登录权限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果目标路由需要登录，但用户未登录，则跳转到登录页
    if (!isAuthenticated) {
      next('/login')
    } else {
      // 已登录则允许访问目标页面
      next()
    }
  } else {
    // 如果目标路由不需要登录
    // 并且用户已登录还想访问登录页，则重定向到登录页（此处建议跳转到首页更合理）
    if (to.path === '/login' && isAuthenticated) {
      next('/login')
    } else {
      // 其他情况正常放行
      next()
    }
  }
})

export default router
