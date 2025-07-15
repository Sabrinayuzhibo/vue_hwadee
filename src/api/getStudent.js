import request from '@/utils/request.js'

// ================== 考籍建档 ==================
/**
 * 创建考籍档案
 * 
 * 接口URL: POST /student/createArchive
 * 
 * 请求参数(JSON):
 * {
 *   name: string,         // 姓名
 *   idCard: string,       // 身份证号
 *   major: string,        // 报考专业
 *   phone: string,        // 联系电话
 *   address: string,      // 住址
 *   registerDate: string  // 注册时间(yyyy-MM-dd)
 * }
 */
export const createStudentArchive = (data) => {
	return request({
		url: '/student/createArchive',
		method: 'post',
		data
	})
}



// ================== 搜索考生 ==================
/**
 * 搜索考生
 * 
 * 接口URL: GET /student/search
 * 
 * 请求参数(query):
 * {
 *   studentId?: string, // 考籍号（可选）
 *   idCard?: string,    // 身份证号（可选）
 *   name?: string,      // 姓名（可选）
 *   page?: number,      // 页码（可选）
 *   size?: number       // 每页条数（可选）
 * }
 */
export const searchStudents = (params) => {
	return request({
		url: '/student/search',
		method: 'get',
		params
	})
}

// ================== 更新考生信息 ==================
/**
 * 更新考生信息（全部字段）
 * 
 * 接口URL: PUT /student/update
 * 
 * 请求参数(JSON):
 * {
 *   studentId: string,   // 考籍号
 *   name: string,        // 姓名
 *   idCard: string,      // 身份证号
 *   major: string,       // 专业
 *   phone: string,       // 联系电话
 *   address: string,     // 住址
 *   registerDate: string // 注册时间
 * }
 */
export const updateStudent = (data) => {
	return request({
		url: '/student/update',
		method: 'put',
		data
	})
}

// ================== 删除考生 ==================
/**
 * 删除考生
 * 
 * 接口URL: DELETE /student/delete/{id}
 * 
 * 请求参数:
 *   id: string // 考籍号
 */
export const deleteStudent = (id) => {
	return request({
		url: `/student/delete/${id}`,
		method: 'delete',
	})
}





// ================== 获取变更申请列表 ==================
/**
 * 获取关键信息变更申请列表
 * 
 * 接口URL: GET /student/changeApplications
 * 
 * 请求参数(query):
 * {
 *   page?: number,    // 页码（可选）
 *   size?: number     // 每页条数（可选）
 * }
 */
export const getChangeApplications = (params) => {
	return request({
		url: '/student/changeApplications',
		method: 'get',
		params
	})
}

// ================== 获取考生成绩列表 ==================
/**
 * 获取考生成绩列表（按考籍号查询）
 * 
 * 接口URL: GET /student/scores/{archiveNumber}
 * 
 * 请求参数:
 *   archiveNumber: string // 考籍号
 */
export const getStudentScores = (archiveNumber) => {
	return request({
		url: `/student/scores/${archiveNumber}`,
		method: 'get',
	})
}

// ================== 成绩补录 ==================
/**
 * 成绩补录
 * 
 * 接口URL: POST /student/scores/add
 * 
 * 请求参数(JSON):
 * {
 *   archiveNumber: string, // 考籍号
 *   courseCode: string,    // 课程代码
 *   courseName: string,    // 课程名称
 *   courseType: string,    // 课程类型（theory/practice/thesis）
 *   examDate: string,      // 考试时间(yyyy-MM-dd)
 *   score: number,         // 成绩
 *   remark?: string        // 备注（可选）
 * }
 */
export const addStudentScore = (data) => {
	return request({
		url: '/student/scores/add',
		method: 'post',
		data
	})
}

// ================== 成绩更正 ==================
/**
 * 成绩更正
 * 
 * 接口URL: PUT /student/scores/update
 * 
 * 请求参数(JSON):
 * {
 *   archiveNumber: string, // 考籍号
 *   courseCode: string,    // 课程代码
 *   originalScore: number, // 原成绩
 *   correctedScore: number,// 更正后成绩
 *   correctionReason: string, // 更正原因
 *   evidenceFiles: array   // 证明材料（文件列表）
 * }
 */
export const updateStudentScore = (data) => {
	return request({
		url: '/student/scores/update',
		method: 'put',
		data
	})
}

// ================== 获取成绩更正申请列表 ==================
/**
 * 获取成绩更正申请列表
 * 
 * 接口URL: GET /student/scores/corrections
 * 
 * 请求参数(query):
 * {
 *   page?: number,    // 页码（可选）
 *   size?: number     // 每页条数（可选）
 * }
 */
export const getScoreCorrectionApplications = (params) => {
	return request({
		url: '/student/scores/corrections',
		method: 'get',
		params
	})
}

// ================== 提交成绩更正申请 ==================
/**
 * 提交成绩更正申请
 * 
 * 接口URL: POST /student/scores/correction/submit
 * 
 * 请求参数(JSON):
 * {
 *   archiveNumber: string, // 考籍号
 *   courseCode: string,    // 课程代码
 *   originalScore: number, // 原成绩
 *   correctedScore: number,// 更正后成绩
 *   correctionReason: string, // 更正原因
 *   evidenceFiles: array   // 证明材料（文件列表）
 * }
 */
export const submitScoreCorrection = (data) => {
	return request({
		url: '/student/scores/correction/submit',
		method: 'post',
		data
	})
}

// ================== 审核成绩更正申请 ==================
/**
 * 审核成绩更正申请
 * 
 * 接口URL: PUT /student/scores/correction/approve
 * 
 * 请求参数(JSON):
 * {
 *   applicationId: string, // 更正申请ID
 *   approve: boolean,      // 是否通过
 *   remark?: string        // 审核备注（可选）
 * }
 */
export const approveScoreCorrection = (data) => {
	return request({
		url: '/student/scores/correction/approve',
		method: 'put',
		data
	})
}






//7.14
///
///
// ================== 按身份证号查询考生 ==================
/**
 * 按身份证号查询考生信息
 * 
 * 接口URL: POST /student-info/loadByIdNumber
 * 
 * 请求参数(JSON):
 *   idNumber: string // 身份证号
 * 
 * 返回: StudentInfo
 */
export const loadStudentByIdCardNumber = (idCardNumber) => {
  return request({
    url: '/student-info/loadByIdNumber',
    method: 'post',
    data: idCardNumber
  })
}
// ================== 按考籍号查询考生 ==================
/**
 * 按考籍号查询考生信息
 * 
 * 接口URL: POST /student-info/loadById
 * 
 * 请求参数(JSON):
 *   id: string // 考籍号
 * 
 * 返回: StudentInfo
 */
export const loadStudentByStudentId = (student_obj) => {
	return request({
	  url: '/student-info/loadById',
	  method: 'post',
	  data: student_obj
	})
  }

// ================== 按姓名查询考生 ==================
/**
 * 按姓名查询考生信息
 * 
 * 接口URL: POST /student-info/loadByName
 * 
 * 请求参数(JSON):
 *   name: string // 姓名
 * 
 * 返回: StudentInfo
 */
export const loadStudentByName = (name) => {
  return request({
    url: '/student-info/loadByName',
    method: 'post',
    data: name
  })
}

/**
 * 根据专业查询学生列表
 * 接口 URL: POST /student-info/pageByMajor
 * 请求参数: {key: '专业代码'}
 * 返回值: 学生信息列表
 */
export const loadStudentsByMajor = (major) => {
  return request({
    url: '/student-info/pageByMajor',
    method: 'post',
    data: major
  })
}

/**
 * 根据性别分页查询学生列表
 * 接口 URL: POST /student-info/pageByGender
 * 请求参数: { key, pageNum, pageSize }
 * 返回值: 分页的学生信息列表
 */
export const loadStudentsByGender = (params) => {
  return request({
    url: '/student-info/pageByGender',
    method: 'post',
    data: params
  })
}

/**
 * 根据考试院名称查询学生列表
 * 接口 URL: POST /student-info/loadByExamCenterName
 * 请求参数: {key: '考试院名称'}
 * 返回值: 学生信息列表
 */
export const loadStudentsByExamCenterName = (examCenterName) => {
  return request({
    url: '/student-info/pageByExamCenter',
    method: 'post',
    data: examCenterName
  })
}
/**
 * 更新考生非关键信息（仅限地址与电话）
 * 
 * 接口URL: POST /student-change
 * 
 * 请求参数(JSON):
 * {
 *   name: string,    // 学生姓名
 *   address: string, // 新地址
 *   phone: string    // 新手机号
 * }
 */
export const updateNonKeyStudentInfo = (data) => {
	return request({
	  url: '/student-info/student-change',
	  method: 'post',
	  data
	})
  }
  // ================== 提交关键信息变更申请 ==================
/**
 * 学生关键信息变更（姓名、身份证号、冻结/注销）
 * 
 * 接口URL: POST /student-info-update
 * 
 * 请求参数(JSON):
 * {
 *   name: string,      // 原姓名
 *   newName: string,   // 新姓名
 *   numberId: string,  // 新身份证号
 *   frozened: boolean, // 是否冻结
 *   isDeleted: boolean // 是否注销
 * }
 */
export const submitKeyInfoChange = (data) => {
  return request({
    url: '/student-info/student-info-update',
    method: 'post',
    data
  })
}
// ================== 获取考生列表 ==================
/**
 * 分页查询所有学生信息（不支持模糊匹配）
 * 接口 URL: GET /student-info/page-all
 * 请求参数:
 *   - pageNum: 当前页码（从 1 开始）
 *   - pageSize: 每页条数
 * 返回值: 分页后的学生信息列表
 */
export const getStudentList = (params) => {
	return request({
	  url: '/student-info/page-all',
	  method: 'get',
	  params
	})
  }
 
/**
 * 根据学生姓名查询其所修课程信息
 * @param {string} name 学生姓名
 * @returns Promise
 */
export const getStudentCoursesByName = (name) => {
  return request({
    url: '/student-info/student-courses',
    method: 'post',
    data: name
  })
}
 
/**
 * 更新或新增学生课程成绩
 * @param {Object} data - { studentName: string, courseName: string, score: number }
 * @returns Promise
 */
export const updateStudentCourse = (data) => {
  return request({
    url: '/student-info/update-course',
    method: 'post',
    data
  })
}
 

