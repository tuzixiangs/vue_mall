<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="~assets/img/home/heima.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="quit">退出</el-button>
    </el-header>
    <!-- 页面主体区 -->
    <el-container>
      <!-- 页面侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'200px' ">
        <!-- 收缩栏 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="items.id + ''" v-for="items in menList" :key="items.id">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <i :class="iconObj[items.id]"></i>
              <span>{{items.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+item.path"
              v-for="item in items.children"
              :key="item.id"
              @click="saveNavState('/'+item.path)"
            >
              <!-- 二级菜单模板区 -->
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{item.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 页面主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      // 左侧菜单数据
      menList: [],
      iconObj: {
        "125": "el-icon-s-custom",
        "103": "el-icon-s-tools",
        "101": "el-icon-s-goods",
        "102": "el-icon-s-order",
        "145": "el-icon-s-marketing"
      },
      // 是否折返
      isCollapse: false,
      // 被激活的链接
      activePath: ""
    };
  },
  created() {
    // 页面创建好就获取所有的菜单
    this.getMenList();
    // 拿到被激活的路由链接
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    quit() {
      // 清空token
      window.sessionStorage.clear();
      // 跳转路由
      this.$router.push("/login");
    },
    // 获取所有的菜单
    async getMenList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.menList = res.data;
      console.log(res);
    },
    // 设置侧边栏切换隐藏
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    }
  }
};
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373c41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 22px;
  div {
    display: flex;
    align-items: center;
    span {
      padding-left: 15px;
    }
  }
}
.el-aside {
  background-color: #323744;
  .el-menu {
    border: 0;
  }
  .toggle-button {
    background-color: #4a5064;
    letter-spacing: 0.2em;
    color: #fff;
    font-size: 10px;
    line-height: 24px;
    text-align: center;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eaedf2;
}
.el-container {
  height: 100%;
}
</style>

