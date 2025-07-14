# 考籍管理系统 API 使用说明

## 考籍建档功能实现

### 1. API 接口

#### 创建考籍档案
- **URL**: `/student/createArchive`
- **方法**: POST
- **请求头**: 
  ```
  Content-Type: application/json
  token: [用户登录token]
  ```

#### 请求参数
```json
{
  "name": "张三",
  "idCard": "110101199001011234",
  "major": "计算机科学与技术",
  "phone": "13800138000",
  "address": "北京市朝阳区xxx街道xxx号",
  "registerDate": "2024-01-15"
}
```

#### 响应格式
```json
{
  "status": 200,
  "message": "创建成功",
  "data": {
    "studentId": "2024001",
    "name": "张三",
    "idCard": "110101199001011234",
    "major": "计算机科学与技术",
    "registerDate": "2024-01-15",
    "status": "normal"
  }
}
```

### 2. 前端实现

#### 主要功能
1. **表单验证**: 使用 Element Plus 的表单验证规则
2. **数据提交**: 通过 POST 请求发送到后端
3. **错误处理**: 分类处理不同类型的错误
4. **状态管理**: 加载状态和用户反馈

#### 核心代码
```javascript
// 创建考生
const createStudent = async () => {
  try {
    // 表单验证
    const valid = await createFormRef.value.validate()
    if (!valid) return

    // 设置加载状态
    createLoading.value = true

    // 准备提交的数据
    const submitData = {
      name: createForm.name,
      idCard: createForm.idCard,
      major: createForm.major,
      phone: createForm.phone,
      address: createForm.address,
      registerDate: createForm.registerDate ? new Date(createForm.registerDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }

    // 调用API创建考籍档案
    const response = await createStudentArchive(submitData)

    // 处理响应
    if (response.status === 200) {
      ElMessage.success('考籍建档成功')
      
      // 重置表单
      createFormRef.value.resetFields()
      
      // 关闭对话框
      showCreateDialog.value = false
      
      // 刷新列表数据
      searchStudents()
    } else {
      ElMessage.error(response.message || '考籍建档失败')
    }
  } catch (error) {
    // 错误处理逻辑
    console.error('考籍建档失败:', error)
    
    if (error.response) {
      const status = error.response.status
      if (status === 400) {
        ElMessage.error('请求参数错误，请检查输入信息')
      } else if (status === 409) {
        ElMessage.error('该身份证号已存在考籍档案')
      } else if (status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试')
      } else {
        ElMessage.error(`创建失败 (${status})`)
      }
    } else if (error.request) {
      ElMessage.error('网络连接错误，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }
  } finally {
    createLoading.value = false
  }
}
```

### 3. 表单验证规则

```javascript
const createRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '身份证号格式不正确', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请选择专业', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}
```

### 4. 错误处理

#### HTTP 状态码处理
- **400**: 请求参数错误
- **401**: 未授权访问
- **409**: 身份证号已存在
- **500**: 服务器内部错误

#### 网络错误处理
- 网络连接错误
- 请求超时
- 请求配置错误

### 5. 测试方法

1. 启动开发服务器: `npm run dev`
2. 访问测试页面: `http://localhost:5173/test`
3. 填写测试数据并点击"测试创建"按钮
4. 查看控制台和页面反馈

### 6. 后端接口要求

后端需要实现以下接口：

```java
@PostMapping("/student/createArchive")
public ResponseEntity<?> createStudentArchive(@RequestBody StudentArchiveRequest request) {
    // 验证请求参数
    // 检查身份证号是否已存在
    // 创建考籍档案
    // 返回响应
}
```

### 7. 注意事项

1. **Token 认证**: 所有请求都需要在请求头中携带用户登录token
2. **数据格式**: 日期格式使用 ISO 8601 标准 (YYYY-MM-DD)
3. **错误处理**: 前端需要处理各种可能的错误情况
4. **表单重置**: 创建成功后需要重置表单数据
5. **数据刷新**: 创建成功后需要刷新列表数据

### 8. 文件结构

```
src/
├── api/
│   └── getStudent.js          # 考籍相关API
├── components/exam/
│   └── StudentArchive.vue     # 考籍管理组件
├── utils/
│   └── request.js             # HTTP请求工具
└── views/
    └── TestView.vue           # API测试页面
``` 