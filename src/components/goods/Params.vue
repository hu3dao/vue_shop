<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>

          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover', ...cateProps }"
            @change="handleChange"
            clearable
            style="width: 300px"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slot">
                <el-tag
                  v-for="(item, i) in slot.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, slot.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slot.row.inputVisible"
                  v-model="slot.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slot.row)"
                  @blur="handleInputConfirm(slot.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slot.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slot">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(slot.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(slot.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 动态静态表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="slot">
                <el-tag
                  v-for="(item, i) in slot.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, slot.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="slot.row.inputVisible"
                  v-model="slot.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slot.row)"
                  @blur="handleInputConfirm(slot.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(slot.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="slot">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(slot.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(slot.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClose"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormrEF" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClose"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: "many",
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [{ required: true, message: "内容不为空", trigger: "blur" }]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [{ required: true, message: "内容不为空", trigger: "blur" }]
      }
    };
  },
  created() {
    //   获取所有商品分类的列表
    this.getCateList();
  },
  methods: {
    //   获取所有的商品分类
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败");

      this.cateList = res.data;
    },
    // 级联选择框选择项变化，会触发这个函数
    handleChange() {
      this.getParamsData();
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
    },

    async getParamsData() {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }

      // 证明选中的是三级分类,根据所选分类的id和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) this.$message.error("获取参数列表失败");
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });
      console.log(res.data);

      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    addDialogClose() {
      this.$refs.addFormrEF.resetFields();
    },

    addParams() {
      this.$refs.addFormrEF.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) this.$message.error("添加参数失败");
        this.$message.success("添加参数成功");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) this.$message.error("获取参数信息失败");
      this.editForm = res.data;
      console.log(this.editForm);

      this.editDialogVisible = true;
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.editForm.attr_sel
          }
        );
        if (res.meta.status !== 200) this.$message.error("修改参数失败");
        this.$message.success("修改参数成功");
        this.saveAttrVals(this.editForm);
        this.getParamsData();

        this.editDialogVisible = false;
      });
    },
    async removeParams(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") return this.$message.info("已取消删除");

      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      );
      if (res.meta.status !== 200) this.$message.error("删除参数失败");
      this.$message.success("删除参数成功");
      this.getParamsData();
    },
    // 文本框失去焦点或者按下enter都会触发
    async handleInputConfirm(params) {
      if (params.inputValue.trim().length === 0) {
        params.inputValue = "";
        params.inputVisible = false;
        return;
      }
      params.attr_vals.push(params.inputValue.trim());
      params.inputValue = "";
      params.inputVisible = false;
      this.saveAttrVals(params);
    },
    async saveAttrVals(params) {
      console.log(params);

      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${params.attr_id}`,
        {
          attr_name: params.attr_name,
          attr_sel: params.attr_sel,
          attr_vals:
            params.attr_vals instanceof Array
              ? params.attr_vals.join(",")
              : params.attr_vals
        }
      );
      if (res.meta.status !== 200) this.$message.error("修改参数项失败");
      this.$message.success("修改参数项成功");
    },
    showInput(params) {
      params.inputVisible = true;

      // $nextTick 的作用：当页面上元素被重新渲染后  才会指定回调函数的代码
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleClose(i, row) {
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    }
  },
  computed: {
    //   如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    // 当前选择的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态计算对话框的标题
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      } else {
        return "静态属性";
      }
    }
  }
};
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 15px;
}
.el-row {
  margin: 15px 0;
}
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin-right: 15px;
}
.input-new-tag {
  width: 150px;
}
</style>