<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图区 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>

      <!-- 选择商品分类区 -->
      <el-row>
        <span>选择商品分类：</span>
        <!-- 级联选择框 -->
        <el-cascader
          v-model="selectedList"
          :options="cateList"
          :props="cateProps"
          @change="handleChange"
        ></el-cascader>
      </el-row>

      <!-- tabs表格区 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            @click="showAddDialogVisible"
          >添加参数</el-button>
          <el-table :data="manyTableData" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="props">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item,index) in props.row.attr_vals"
                  :key="index"
                  @close="handleClose(index,props.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="props.row.inputVisible"
                  v-model="props.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(props.row)"
                  @blur="handleInputConfirm(props.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(props.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditParams(scope.row)"
                >编辑</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisabled"
            @click="showAddDialogVisible"
          >添加属性</el-button>
          <el-table :data="onlyTableData" style="width: 100%">
            <el-table-column type="expand">
              <template slot-scope="props">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  closable
                  v-for="(item,index) in props.row.attr_vals"
                  :key="index"
                  @close="handleClose(index,props.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="props.row.inputVisible"
                  v-model="props.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(props.row)"
                  @blur="handleInputConfirm(props.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(props.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 编辑按钮 -->
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditParams(scope.row)"
                >编辑</el-button>
                <!-- 删除按钮 -->
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数/静态属性 -->
    <el-dialog
      :title="'添加'+textTitle"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="closeDialogVisible"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数 -->
    <el-dialog
      :title="'修改'+textTitle"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="closeDialogVisible"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
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
  name: "Params",
  data() {
    return {
      // 所有的分类选项
      cateList: [],
      // 级联菜单配置选项
      cateProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      // 级联选择框双向绑定的值
      selectedList: [],
      // tabs表格默认选择值
      activeName: "many",
      // 动态参数数据
      manyTableData: [],
      // 静态参数数据
      onlyTableData: [],
      // 控制添加参数对话框
      addDialogVisible: false,
      // 动态绑定要添加的分类参数/静态属性
      addForm: {
        attr_name: ""
      },
      // 添加分类参数/静态属性 的表单验证
      addRules: {
        attr_name: [
          { required: true, message: "请添加参数", trigger: "blur" },
          { min: 2, max: 10, message: "长度在  到 10 个字符", trigger: "blur" }
        ]
      },
      // 控制编辑对话框隐藏与出现
      editDialogVisible: false,
      // 参数ID
      attr_id: ""
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有商品分类
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200) {
        return this.$message.error("获取所有商品分类失败!");
      }
      this.cateList = res.data;
    },
    // 监听级联选择框分选中变化
    async handleChange() {
      this.getParamsData();
    },
    // tab页签点击事件处理函数
    handleTabClick() {
      this.getParamsData();
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 选中分类时发起网络请求得到动态参数和静态属性
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数列表失败!");
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        // 控制按钮和文本框的显示
        item.inputVisible = false;
        // 文本框输入的内容
        item.inputValue = "";
      });
      console.log(res.data);
      // 判断当前获取的是动态参数还是静态属性，并分别赋值
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    // 监听添加参数对话框关闭,清楚表单数据
    closeDialogVisible() {
      this.$refs.addFormRef.resetFields();
    },
    // 显示对话框和清空addForm默认数据
    showAddDialogVisible() {
      this.addForm.attr_name = "";
      this.addDialogVisible = true;
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败!");
        }
        this.$message.success("添加参数成功!");
        // 重新渲染页面
        this.getParamsData();
        // 关闭对话框
        this.addDialogVisible = false;
      });
    },
    // 控制编辑对话框的出现
    showEditParams(row) {
      // 获得当前参数id并保存
      this.attr_id = row.attr_id;
      this.addForm.attr_name = row.attr_name;
      this.editDialogVisible = true;
    },
    // 点击确认修改参数
    editParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.attr_id}`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败!");
        }
        this.$message.success("修改参数成功!");
        // 重新渲染页面
        this.getParamsData();
        // 关闭对话框
        this.editDialogVisible = false;
      });
    },
    // 删除参数
    async removeParams(row) {
      // console.log(row.attr_id, this.cateId);
      // 询问用户是否删除数据
      const conformResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
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
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${row.attr_id}`
      );
      if (res.meta.status !== 200) {
        console.log(res);
        return this.$message.error("删除参数失败!");
      }
      this.$message.success("删除参数成功!");
      // 重新渲染页面
      this.getParamsData();
    },
    // 文本框失去焦点或者按下enter 都会触发
    async handleInputConfirm(row) {
      // 失去焦点时判断inputValue值是否为0,为0代表校验失败
      if (row.inputValue.trim().length === 0) {
        // 失败则重新赋值为空，并隐藏输入框
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      // 校验成功则给attr_vals添加输入的值
      row.attr_vals.push(row.inputValue.trim());
      // 重新赋值为空并隐藏输入框
      row.inputValue = "";
      row.inputVisible = false;
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row);
    },
    // 删除tag标签
    handleClose(index, row) {
      row.attr_vals.splice(index, 1);
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row);
    },
    // 获保存attr_vals 的值保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数失败!");
      }
      this.$message.success("修改参数成功!");
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick 就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    }
  },
  computed: {
    // 按钮禁用为true,不禁用为false
    isBtnDisabled() {
      if (this.selectedList.length !== 3) {
        return true;
      }
      return false;
    },
    // 获得三级id的值
    cateId() {
      if (this.selectedList.length !== 3) {
        return null;
      }
      return this.selectedList[this.selectedList.length - 1];
    },
    // 控制对话框标题文本显示
    textTitle() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>

<style lang="less" scoped>
.el-alert {
  margin-bottom: 20px;
}
.el-tag {
  margin: 0 10px 10px 0;
}
.input-new-tag {
  width: 120px;
}
</style>