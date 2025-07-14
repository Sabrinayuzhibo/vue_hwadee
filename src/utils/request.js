import axios from 'axios';
import {ElMessage } from 'element-plus';
import Router from '@/router';
const URL =  "http://localhost:8848";
// create an axios instance
const service = axios.create({
    baseURL: URL, // url = base url + request url
    timeout: 10000, // request timeout
    crossDomain: true
})

// http request 拦截器
service.interceptors.request.use(
    config => {
        config.headers['token'] = localStorage.getItem('token')
        return config
    },
    error => {
        return Promise.reject(error)
    }
)
// http response 拦截器
service.interceptors.response.use(
    response => {
        if(response){//服务器返回了数据
            //对自己的返回结果做判断
            if(response.status == 200){
                return response
            }else if(response.status == -2){
                //登录失效, 跳转到登录页面
                //提示
                ElMessage({
                    message: response.message,
                    type: "error",
                    duration: 2000
                });
                //跳转到登录页面
                Router.push({path: "/"})
                return false;
            }else{
                //提示
                ElMessage({
                    message: response.message,
                    type: "error",
                    duration: 2000
                });
            }
            return -1;
        }

    },
    error => {
        return Promise.reject(error)
    }
)

export default service