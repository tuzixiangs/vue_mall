import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);
const Login = () => import("../components/content/login/Login.vue");
const Home = () => import("../views/home/Home.vue");
const Welcome = () => import("../views/home/welcome/Welcome.vue");
const User = () => import("../views/user/User.vue");
const Rights = () => import("../views/home/rights/Rights.vue");
const Roles = () => import("../views/home/roles/Roles.vue");
const Cate = () => import("../views/goods/cate/Cate.vue");
const Params = () => import("../views/goods/params/Params.vue");
const GoodsList = () => import("../views/goods/goodsList/GoodsList.vue");
const AddPage = () => import("../views/goods/goodsList/AddPage.vue");
const Order = () => import("../views/home/order/Order.vue");
const Report = () => import("../views/home/report/Report.vue");

const routes = [
	{ path: "", redirect: "/login" },
	{ path: "/login", component: Login },
	{
		path: "/home",
		component: Home,
		redirect: "/welcome",
		children: [
			{ path: "/welcome", component: Welcome },
			{ path: "/users", component: User },
			{ path: "/rights", component: Rights },
			{ path: "/roles", component: Roles },
			{ path: "/categories", component: Cate },
			{ path: "/params", component: Params },
			{ path: "/goods", component: GoodsList },
			{ path: "/goods/add", component: AddPage },
			{ path: "/orders", component: Order },
			{ path: "/reports", component: Report },
		],
	},
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
