import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const Login = () => import("../components/content/login/Login.vue");
const Home = () => import("../views/home/Home.vue");

const routes = [
	{ path: "", redirect: "/login" },
	{ path: "/login", component: Login },
	{ path: "/home", component: Home },
];

const router = new VueRouter({
	routes,
});

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
	// to将要访问的路径
	// from代表从哪个路径跳转而来
	// next是一个函数，表示放行，next()放行，next('/login')表示强制跳转
	if (to.path === "/login") return next();
	// 获取token
	const tokenStr = window.sessionStorage.getItem("token");
	if (!tokenStr) return next("/login");
	next();
});

export default router;
