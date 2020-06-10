<template>
  <div id="login">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="~assets/img/login/logo.png" alt />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        label-width="0px"
        class="login-from"
        :model="loginFrom"
        :rules="loginRules"
        ref="loginFromRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="loginFrom.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="loginFrom.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="login-btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginFrom">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    // 这里是表单的数据绑定对象
    return {
      //表单的双向绑定
      loginFrom: {
        username: "admin",
        password: "123456"
      },
      // 表单的数据验证
      loginRules: {
        username: [
          { required: true, message: "请输入登录账户", trigger: "blur" },
          { min: 3, max: 8, message: "长度在 3 到 8 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    // 重置表单
    resetLoginFrom() {
      // console.log(this);
      this.$refs.loginFromRef.resetFields();
    },
    //
    login() {
      this.$refs.loginFromRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("login", this.loginFrom);
        if (res.meta.status !== 200) return this.$message.error("登录失败");
        this.$message.success("登录成功");
        // 1.将登录成功后的 token 保存到客户端的 sessionStorage中
        window.sessionStorage.setItem("token", res.data.token);
        // 2.设置路由地址是 /home
        this.$router.push("/home");
      });
    }
  }
};
</script>

<style lang="less" scoped>
#login {
  background-color: #2b4b6b;
  height: 100%;
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 1px 1px 1px rgba(255, 255, 255, 0.5);

  .avatar-box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .login-btns {
    display: flex;
    justify-content: flex-end;
  }
  .login-from {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
  }
}
</style>