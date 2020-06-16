<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区试图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-button type="primary" @click="rolesDialogVisible = true">添加角色</el-button>
      <!-- 列表模板区 -->
      <el-table :data="rolesList" style="width: 100%" stripe border>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="['btBorder',i1 === 0 ? 'topBorder' : '']"
            >
              <el-col :span="5">
                <el-tag closable @close="removeRolesById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'topBorder']"
                >
                  <el-col :span="7">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRolesById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="17">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRolesById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <!-- 索引列 -->
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="350">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showPowerList(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="powerDialogVisible" width="50%" @close="removeDefKeys">
      <!-- 树形权限列表 -->
      <el-tree
        :data="treeList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="powerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="rolesDialogVisible" width="50%" @close="addDialogClosed">
      <el-form ref="rolesFormRef" :model="rolesForm" label-width="80px" :rules="rolesRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" ref="editFormRef" label-width="80px" :rules="rolesRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesRef">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 控制添加角色弹框
      rolesDialogVisible: false,
      // 添加角色对话框双向绑定数据
      rolesForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加角色表单验证规则
      rolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 2, max: 6, message: "长度在 2 到 6 个字符", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ]
      },
      // 控制编辑角色弹框
      editDialogVisible: false,
      //编辑角色信息数据保存
      editForm: {},
      // 控制分配权限对话框
      powerDialogVisible: false,
      // 所有权限列表数据
      treeList: [],
      // 树形表格数据模式
      treeProps: {
        children: "children",
        label: "authName"
      },
      // 默认选中的三级权限ID
      defKeys: [],
      // 当前即将分配权限的id
      roleId: ""
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.erro("获取角色列表失败!");
      }
      this.rolesList = res.data;
      // console.log(this.rolesList);
    },
    // 每次刷新页面重置表单数据
    addDialogClosed() {
      this.$refs.rolesFormRef.resetFields();
    },
    // 添加角色，并重置表单数据
    addRoles() {
      // console.log(this.$refs);
      this.$refs.rolesFormRef.validate(async valid => {
        // 校验表格是否验证成功，验证成功则发送网络请求
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.rolesForm);
        if (res.meta.status !== 201) {
          return this.$message.erro("创建角色失败!");
        }
        this.$message.success("创建角色成功!");
        // 关闭表单
        this.rolesDialogVisible = false;
        //  渲染角色列表
        this.getRolesList();
      });
    },
    // 查询角色
    async editRoles(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.erro("获取角色信息失败!");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
      // console.log(this.$refs);
    },
    editDialogClosed() {
      // console.log(this.$refs);
      this.$refs.editFormRef.resetFields();
    },

    // 提交编辑角色信息
    editRolesRef() {
      // console.log(this.$refs);
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.erro("修改角色信息失败!");
        }
        this.$message.success("修改角色信息成功!");
        // 关闭弹框
        this.editDialogVisible = false;
        // 重新渲染页面
        this.getRolesList();
      });
    },
    // 删除角色
    async removRoles(id) {
      const conformResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
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
      // 确认删除则发送网络请求
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.erro("删除角色失败!");
      }
      this.$message.success("删除角色成功!");
      // 重新渲染页面
      this.getRolesList();
    },
    //根据ID删除对应的角色权限
    async removeRolesById(role, rightId) {
      const conformResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
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
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.erro("删除权限失败!");
      }
      this.$message.success("删除权限成功!");
      // 重新渲染角色权限列表
      role.children = res.data;
    },
    // 展示分配权限列表
    async showPowerList(role) {
      // 得到当前角色id并保存
      this.roleId = role.id;
      // 得到所有权限列表数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.erro("获取权限列表失败!");
      }
      this.treeList = res.data;
      // 递归获取三级权限ID
      this.getLeadfKeys(role, this.defKeys);

      // 显示分配权限列表
      this.powerDialogVisible = true;
    },
    // 得到当前角色选中的三级权限
    getLeadfKeys(node, arr) {
      // 如果当前node节点不含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      // 如果不是则通过递归方式找到三级节点
      node.children.forEach(item => {
        this.getLeadfKeys(item, arr);
      });
    },
    // 监听权限列表关闭，清空defKeys的值，以保持值干净
    removeDefKeys() {
      this.defKeys = [];
    },
    // 点击为角色分配权限
    async allotRights() {
      // 通过函数获得选中的权限id并合并
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      // console.log(keys);
      // 把选中的权限id以逗号分隔拼接为字符串
      const idStr = keys.join(",");
      // 发起网络请求
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.erro("分配权限失败!");
      }
      this.$message.success("分配权限成功!");
      // 重新渲染页面
      this.getRolesList();
      // 关闭分配权限列表
      this.powerDialogVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.el-row {
  display: flex;
  align-items: center;
}
.btBorder {
  border-bottom: 1px solid #eee;
}
.topBorder {
  border-top: 1px solid #eee;
}
</style>