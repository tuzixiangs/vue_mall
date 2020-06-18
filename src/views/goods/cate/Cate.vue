<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-button type="primary" @click="addCategories">添加分类</el-button>
      </el-row>

      <!-- 表格区域 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="treeTable"
      >
        <!-- 渲染是否有效图标 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:#00e500" v-if="scope.row.cat_deleted !== true"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>

        <!-- 渲染排序文字 -->
        <template slot="sort" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success" size="mini">二级</el-tag>
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>

        <!-- 渲染操作按钮 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="editCate(scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageData.pagenum"
        :page-size="pageData.pagesize"
        :page-sizes="[2, 5, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="cateDialogVisible" width="50%" @close="closeCateDialog">
      <!-- 头部表单 -->
      <el-form :model="cateForm" :rules="cateFormRules" ref="cateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="cateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- :options用来指定数据源 -->
          <!-- :props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="cateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="defineCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="cateFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDefineCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      pageData: {
        // 当前页码值
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5
      },
      // 所有商品分类数据列表
      cateList: [],
      // 总的页码值
      total: 0,
      // 树形表格列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          prop: "cat_deleted",
          // 将当前列定义为模板列
          type: "template",
          // 当前模板列的名称
          template: "isok"
        },
        {
          label: "排序",
          prop: "cat_level",
          // 将当前列定义为模板列
          type: "template",
          // 当前模板列的名称
          template: "sort"
        },
        {
          label: "操作",
          // 将当前列定义为模板列
          type: "template",
          width: "200px",
          // 当前模板列的名称
          template: "opt"
        }
      ],
      // 控制添加分类弹框
      cateDialogVisible: false,
      // 待添加的分类
      cateForm: {
        cat_name: "",
        // 父级分类id
        cat_pid: 0,
        // 默认添加一级分类
        cat_level: 0
      },
      // 添加分类表单验证规则
      cateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 3, max: 6, message: "长度在 3 到 6 个字符", trigger: "blur" }
        ]
      },
      // 父级分类数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true
      },
      // 选中的父级分类的ID数组
      selectedKeys: [],
      // 控制编辑分类弹框
      editDialogVisible: false,
      // 编辑的分类
      editForm: {
        cat_name: "",
        cat_id: 0
      }
    };
  },
  created() {
    this.getGoodsCategories();
  },
  methods: {
    // 获得商品分类数据列表
    async getGoodsCategories() {
      const { data: res } = await this.$http.get("categories", {
        params: this.pageData
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败!");
      }
      // 保存商品分类数据
      this.cateList = res.data.result;
      this.total = res.data.total;
      // console.log(res);
    },
    // 监听pagesize的改变
    handleSizeChange(newSize) {
      this.pageData.pagesize = newSize;
      this.getGoodsCategories();
    },
    // 监听 页码值 改变
    handleCurrentChange(newPage) {
      this.pageData.pagenum = newPage;
      this.getGoodsCategories();
    },
    // 添加分类按钮开始
    // 添加商品分类
    addCategories() {
      // 获取父级分类列表
      this.getParentCateList();
      // 显示添加分类对话框
      this.cateDialogVisible = true;
    },
    // 获取父级分类列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类失败!");
      }
      this.parentCateList = res.data;
      // console.log(this.parentCateList);
    },
    // 选择项发生改变触发这个函数
    parentCateChange() {
      // console.log(this.selectedKeys);
      // 如果selectedKeys数组的长度大于0,证明选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
        // 当前分类的等级
        this.cateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 父级分类的id
        this.cateForm.cat_pid = 0;
        // 当前分类的等级
        this.cateForm.cat_level = 0;
      }
    },
    // 点击确定，添加新的分类
    defineCate() {
      this.$refs.cateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.cateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败!");
        }
        this.$message.success("添加用户成功!");
        // 重新渲染页面
        this.getGoodsCategories();
        // 关闭对话框
        this.cateDialogVisible = false;
      });
    },
    // 监听对话框关闭,清空表单数据
    closeCateDialog() {
      this.$refs.cateFormRef.resetFields();
      this.selectedKeys = [];
      this.cateForm.cat_pid = 0;
      this.cateForm.cat_level = 0;
    },
    // 添加分类按钮事件结束

    // 编辑按钮事件开始
    // 显示对话框，并得到当前要编辑的分类的信息
    editCate(row) {
      // console.log(row);
      // 得到当前编辑分类的名字和id
      this.editForm.cat_name = row.cat_name;
      this.editForm.cat_id = row.cat_id;
      // 显示编辑分类对话框
      this.editDialogVisible = true;
    },
    // 点击确定，修改名称完成
    editDefineCate() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name
          }
        );
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error("更新分类失败!");
        }

        this.$message.success("更新分类成功!");
        // console.log(this.editForm.cat_pid);
        // 重新渲染页面
        this.getGoodsCategories();
        // 关闭对话框
        this.editDialogVisible = false;
      });
    },
    // 编辑按钮事件结束

    // 删除按钮事件按钮开始
    // 点击按钮删除商品分类
    async removeCate(id) {
      const conformResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      // 如果用户确认删除，则返值为字符串confirm
      // 如果用户取消了删除，则返值为字符串cancel
      if (conformResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类失败!");
      }
      this.$message.success("删除分类成功!");
      // 重新渲染页面
      this.getGoodsCategories();
    }
    // 删除按钮事件按钮结束
  }
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>