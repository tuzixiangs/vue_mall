import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/element.js";
import "assets/css/global.css";

// 设置默认的请求根路径
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// 添加请求拦截器，为每次请求添加Authorization字段
axios.interceptors.request.use((config) => {
	config.headers.Authorization = window.sessionStorage.getItem("token");
	return config;
});
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");
