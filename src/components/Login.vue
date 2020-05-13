<template>
  <div class="login_container">
    <el-card header="请登录" class="login_card">
      <el-form :model="loginForm">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary">登录</el-button>
          <el-button type="info">重置</el-button>
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
        username: "",
        password: ""
      }
    };
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