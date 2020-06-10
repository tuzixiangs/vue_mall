<template>
  <div>
    <el-button type="info" @click="quit">退出</el-button>
  </div>
</template>

<script>
export default {
  name: "Home",
  methods: {
    quit() {
      // 清空token
      window.sessionStorage.clear();
      // 跳转路由
      this.$router.push("/login");
    }
  }
};
</script>

<style>
</style>