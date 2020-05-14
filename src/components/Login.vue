<template>
  <div class="login_container">
    <el-card header="请登录" class="login_card">
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //登录表单的数据绑定对象
      loginForm: {
        username: "admin",
        password: "123456"
      },
      //这是表单的验证规则
      loginFormRules: {
        //验证用户名是否合法
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在3到10个字符", trigger: "blur" }
        ],
        //验证密码是否合法
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在6到15个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    //点击重置按钮  重置表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status !== 200) {
          return this.$message.error("登录失败");
        }
        this.$message.success("登录成功");
        //将token保存到客户端的sessionStorage
        window.sessionStorage.setItem("token", res.data.token);
        //通过编程式导航跳转到后台主页面,路由地址是 /home
        this.$router.push("/home");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.login_card {
  width: 30rem;
  margin: 10rem auto;
}
.btns {
  text-align: right;
}
</style>