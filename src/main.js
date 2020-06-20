import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./plugins/element.js";
import "assets/css/global.css";
import ZkTable from "vue-table-with-tree-grid";

// 导入进度条控制器
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// 设置默认的请求根路径
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";
// 添加请求拦截器，为每次请求添加Authorization字段
// 在request拦截器中，展示进度条
axios.interceptors.request.use((config) => {
	// 展示进度条
	NProgress.start();
	config.headers.Authorization = window.sessionStorage.getItem("token");
	return config;
});
// 在response拦截器中，隐藏进度条
axios.interceptors.response.use((config) => {
	// 隐藏进度条
	NProgress.done();
	return config;
});
Vue.prototype.$http = axios;

// 导入富文本编辑器
import VueQuillEditor from "vue-quill-editor";
// 导入富文本编辑对应的样式
import "quill/dist/quill.core.css"; // import styles
import "quill/dist/quill.snow.css"; // for snow theme
import "quill/dist/quill.bubble.css"; // for bubble theme
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor);

Vue.config.productionTip = false;
// 导入树形表格
Vue.component("tree-table", ZkTable);
// 定义的全局时间过滤器
Vue.filter("dateFormat", function(originVal) {
	const dt = new Date(originVal);

	const y = dt.getFullYear();
	const m = (dt.getMonth() + 1 + "").padStart(2, "0");
	const d = (dt.getDate() + "").padStart(2, "0");

	const hh = (dt.getHours() + "").padStart(2, "0");
	const mm = (dt.getMinutes() + "").padStart(2, "0");
	const ss = (dt.getSeconds() + "").padStart(2, "0");

	return `${y}-${m}-${d} ${hh}-${mm}-${ss}`;
});

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount("#app");
