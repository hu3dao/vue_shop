<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table
        :data="catelist"
        style="width: 100%;margin-bottom: 20px;"
        row-key="cat_id"
        border
        lazy
        :tree-props="{children: 'children', hasChildren: 'Children'}"
      >
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>

        <el-table-column prop="cat_deleted" label="是否有效">
          <template v-slot="slot">
            <i
              class="el-icon-success"
              v-if="slot.row.cat_deleted === false"
              style="color: lightgreen"
            ></i>
            <i class="el-icon-error" v-else style="color: lightred"></i>
          </template>
        </el-table-column>

        <el-table-column prop="cat_level" label="排序">
          <template v-slot="slot">
            <el-tag v-if="slot.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="slot.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" v-else-if="slot.row.cat_level === 2">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="slot">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(slot.row.cat_id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeCateById(slot.row.cat_id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader
            v-model="selectdKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true }"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="30%" @close="editDialogClose">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      //总数据条数
      total: 0,
      //   控制添加分类对话框的显示与隐藏
      addDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        //   将要添加的分类名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0
      },
      //   添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //   父级分类的列表
      parentCateList: [],
      // 选中的父级分类的id数字
      selectdKeys: [],
      // 控制编辑分类对话框显示与隐藏
      editDialogVisible: false,
      // 编辑分类表单数据
      editCateForm: {},
      // 编辑分类表单的验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败");
      // 把数据列表赋值给catelist
      this.catelist = res.data.result;

      //   为总数据条数据赋值
      this.total = res.data.total;
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取父级分类数据失败");
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发此函数
    parentCateChange() {
      //   如果selectedKeys数组的lenght大于0，证明大于0,证明选择的父级分类
      if (this.selectdKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectdKeys[
          this.selectdKeys.length - 1
        ];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectdKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮，添加新分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) return this.$message.error("添加分类失败");
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addDialogVisible = false;
      });
    },
    // 监听对话框的关闭事件，重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectdKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 点击按钮，显示编辑分类对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) return this.$message.error("获取分类失败");
      this.editCateForm = res.data;
      this.editDialogVisible = true;
    },
    // 关闭编辑分类对话框，重置表单
    editDialogClose() {
      this.$refs.editCateFormRef.resetFields();
    },
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        );
        if (res.meta.status !== 200)
          return this.$message.error("修改商品分类失败");
        this.getCateList();
        this.$message.success("修改商品分类成功");
        this.editDialogVisible = false;
      });
    },
    async removeCateById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200)
        return this.$message.error("删除商品分类失败");
      this.queryInfo.pagenum = 1;
      this.getCateList();
      this.$message.success("删除商品分类成功");
    }
  }
};
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 15px;
}
.el-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>