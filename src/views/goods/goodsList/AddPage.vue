<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区视图区 -->
    <el-card>
      <!-- 提示信息 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false"></el-alert>

      <!-- 步骤条区域 -->
      <el-steps :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tabs信息栏 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeStep"
          :before-leave="beforeTabLeave"
          @tab-click="switchTabs"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catList"
                :props="catProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyGoodsData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyGoodsData"
              :key="item.attr_id"
              label-width="100"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action图片要上传到的后台api地址 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览弹框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  name: "AddPage",
  data() {
    return {
      // 控制步骤条
      activeStep: "0",
      // 双向绑定添加商品的数据
      addForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        // 商品所属分类的数组
        goods_cat: [],
        // 上传图片的数组
        pics: [],
        // 商品详情描述
        goods_introduce: "",
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ]
      },
      // 所有的商品列表
      catList: [],
      // 级联选择器配置项
      catProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover"
      },
      // 动态参数数据
      manyGoodsData: [],
      // 静态属性数据
      onlyGoodsData: [],
      // 图片上传组件的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 预览图片的路径
      previewPath: "",
      // 控制预览框的出现
      previewVisible: false
    };
  },
  created() {
    this.getCatList();
  },
  methods: {
    // 获得所有的商品列表
    async getCatList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败!");
      }
      this.catList = res.data;
      // console.log(this.catList);
    },
    // 级联选择器变化会触发这个函数
    handleChange() {},
    // tabs表格切换时会触发这个函数
    beforeTabLeave(newActiveName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类!");
        return false;
      }
    },
    // 切换选项卡获得数据
    async switchTabs() {
      // console.log(this.activeStep);
      // 获取动态参数的数据
      if (this.activeStep === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many"
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取参数失败!");
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        this.manyGoodsData = res.data;
        // console.log(this.manyGoodsData);
      }
      // 获取静态属性数据
      else if (this.activeStep === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only"
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取属性失败!");
        }
        console.log(res.data);
        this.onlyGoodsData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 处理图片删除操作
    handleRemove(file) {
      const filePath = file.response.data.tmp_path;
      // 得到删除图片在pics数组中的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath);
      // 删除图片临时路径
      this.addForm.pics.split(i, 1);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 先得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo);
    },
    // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项目!");
        }
        // 执行添加的业务逻辑
        // 处理goods_cat
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        // 处理动态参数
        this.manyGoodsData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(",")
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyGoodsData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;

        // 发起请求添加商品
        const { data: res } = await this.$http.post("goods", form);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败!");
        }
        this.$message.success("添加商品成功!");
        this.$router.push("/goods");
      });
    }
  },
  computed: {
    cateId() {
      return this.addForm.goods_cat[2];
    }
  }
};
</script>

<style lang="less" scoped>
.el-tabs {
  margin-top: 20px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.el-upload__tip {
  margin-top: 10px;
  font-size: 14px;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>