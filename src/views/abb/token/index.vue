<!-- Token数据管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="token名称" prop="tokenName">
          <el-input
            v-model="queryParams.tokenName"
            placeholder="请输入token名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="tokenID" prop="tokenCode">
          <el-input
            v-model="queryParams.tokenCode"
            placeholder="请输入tokenID"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog()">新增</el-button>
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :on-change="handleImport"
          >
            <el-button type="primary" icon="upload">导入</el-button>
          </el-upload>
          <el-button type="default" icon="download" @click="handleDownloadTemplate">
            下载模板
          </el-button>
          <el-button type="danger" icon="delete" :disabled="!hasSelection" @click="handleDelete()">
            删除
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        class="data-table__content"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="token名称" prop="tokenName" min-width="120" />
        <el-table-column label="tokenID" prop="tokenCode" min-width="120" />
        <el-table-column
          label="门板预装时间_预"
          prop="doorPreinstallTime"
          min-width="120"
          align="center"
        />
        <el-table-column label="门板时间_预" prop="doorTime" min-width="100" align="center" />
        <el-table-column
          label="网格预装时间_预"
          prop="gridPreinstallTime"
          min-width="120"
          align="center"
        />
        <el-table-column label="网格时间_预" prop="gridTime" min-width="100" align="center" />
        <el-table-column label="顶板时间_预" prop="topPlateTime" min-width="100" align="center" />
        <el-table-column
          label="底板时间_预"
          prop="bottomPlateTime"
          min-width="100"
          align="center"
        />
        <el-table-column
          label="壳体组装_预"
          prop="shellAssemblyTime"
          min-width="100"
          align="center"
        />
        <el-table-column
          label="总成时间_预"
          prop="totalAssemblyTime"
          min-width="100"
          align="center"
        />
        <el-table-column label="操作" fixed="right" min-width="160">
          <template #default="scope">
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              icon="delete"
              link
              size="small"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchTokenList"
      />
    </el-card>

    <!-- Token表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="tokenFormRef" :model="formData" :rules="rules as any" label-width="160px">
        <el-form-item label="token名称" prop="tokenName">
          <el-input
            v-model="formData.tokenName"
            :readonly="!!formData.id"
            placeholder="请输入token名称"
          />
        </el-form-item>

        <el-form-item label="tokenID" prop="tokenCode">
          <el-input v-model="formData.tokenCode" placeholder="请输入tokenID" style="width: 100%" />
        </el-form-item>

        <el-form-item label="门板预装时间_预" prop="doorPreinstallTime">
          <el-input-number
            v-model="formData.doorPreinstallTime"
            placeholder="请输入门板预装时间_预"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="门板时间_预" prop="doorTime">
          <el-input-number
            v-model="formData.doorTime"
            placeholder="请输入门板时间_预"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="网格预装时间_预" prop="gridPreinstallTime">
          <el-input-number
            v-model="formData.gridPreinstallTime"
            placeholder="请输入网格预装时间_预"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="网格时间_预" prop="gridTime">
          <el-input-number
            v-model="formData.gridTime"
            placeholder="请输入网格时间_预"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="顶板时间_预" prop="topPlateTime">
          <el-input-number
            v-model="formData.topPlateTime"
            placeholder="请输入顶板时间_预"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="底板时间_预" prop="bottomPlateTime">
          <el-input-number
            v-model="formData.bottomPlateTime"
            placeholder="请输入底板时间_预"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="壳体组装_预" prop="shellAssemblyTime">
          <el-input-number
            v-model="formData.shellAssemblyTime"
            placeholder="请输入壳体组装_预"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="总成时间_预" prop="totalAssemblyTime">
          <el-input-number
            v-model="formData.totalAssemblyTime"
            placeholder="请输入总成时间_预"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { TokenAPI } from "@/api/abb/token-api";
import type { Token, TokenForm, TokenQuery } from "@/api/abb/token-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<Token[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const drawerSize = ref("60%");

// 表单数据
const formData = ref<TokenForm>({
  id: undefined,
  tokenName: undefined,
  tokenCode: undefined,
  doorPreinstallTime: undefined,
  doorTime: undefined,
  gridPreinstallTime: undefined,
  gridTime: undefined,
  topPlateTime: undefined,
  bottomPlateTime: undefined,
  shellAssemblyTime: undefined,
  totalAssemblyTime: undefined,
});

// 对话框配置
const dialog = reactive({
  visible: false,
  title: "",
});

// 查询参数
const queryParams = reactive<TokenQuery>({
  pageNum: 1,
  pageSize: 10,
  tokenName: undefined,
  keywords: undefined,
  tokenCode: undefined,
});

// 表单验证规则
const rules = {
  tokenName: [
    { required: true, message: "token名称不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "token名称长度在1-100个字符之间", trigger: "blur" },
  ],
  tokenCode: [
    { required: true, message: "tokenID不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "tokenID长度在1-100个字符之间", trigger: "blur" },
  ],
};

// 表单引用
const queryFormRef = ref();
const tokenFormRef = ref();

// 获取Token分页列表
const fetchTokenList = async () => {
  loading.value = true;
  try {
    const response = await TokenAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchTokenList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchTokenList();
};

// 选择行变化
const handleSelectionChange = (selection: any[]) => {
  selectionIds.value = selection.map((item) => item.id);
  hasSelection.value = selectionIds.value.length > 0;
};

// 打开对话框
const handleOpenDialog = async (id?: number) => {
  if (id) {
    // 编辑
    const response = await TokenAPI.getFormData(id);
    Object.assign(formData.value, response || {});
    dialog.title = "编辑Token";
  } else {
    // 新增
    formData.value = {
      id: undefined,
      tokenName: undefined,
      tokenCode: undefined,
      doorPreinstallTime: undefined,
      doorTime: undefined,
      gridPreinstallTime: undefined,
      gridTime: undefined,
      topPlateTime: undefined,
      bottomPlateTime: undefined,
      shellAssemblyTime: undefined,
      totalAssemblyTime: undefined,
    };
    dialog.title = "新增Token";
  }
  dialog.visible = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  tokenFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  await tokenFormRef.value?.validate();

  if (formData.value.id) {
    // 更新
    await TokenAPI.update(formData.value.id, formData.value);
    ElMessage.success("更新成功");
  } else {
    // 新增
    await TokenAPI.create(formData.value);
    ElMessage.success("新增成功");
  }

  dialog.visible = false;
  fetchTokenList();
};

// 删除
const handleDelete = async (id?: number) => {
  const ids = id ? [id] : selectionIds.value;
  if (!ids.length) {
    ElMessage.warning("请选择要删除的数据");
    return;
  }

  try {
    await ElMessageBox.confirm("确认删除已选中的数据项？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    const idsStr = ids.join(",");
    await TokenAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchTokenList();
  } catch {
    // 用户取消删除
  }
};

// 处理文件导入
const handleImport = async (file: any) => {
  const { raw } = file;
  if (!raw) return;

  try {
    const formData = new FormData();
    formData.append("file", raw);

    await TokenAPI.import(formData);
    ElMessage.success("导入成功");
    fetchTokenList(); // 重新加载数据
  } catch (error) {
    console.error("导入失败:", error);
    ElMessage.error("导入失败，请检查文件格式是否正确");
  }
};

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const response = await TokenAPI.downloadTemplate();

    // 从响应头中获取文件名
    const contentDisposition = response.headers["content-disposition"];
    let filename = "token导入模板.xlsx"; // 默认文件名

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "");
        // 解码URI编码的文件名
        filename = decodeURIComponent(filename);
      }
    }

    // 创建Blob对象并下载文件
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename); // 使用从响应头获取的文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("下载模板失败:", error);
    ElMessage.error("下载模板失败");
  }
};

// 初始化数据
onMounted(() => {
  fetchTokenList();
});
</script>

<style scoped>
/* 保持与现有样式一致 */
.data-table__content {
  width: 100% !important;
}

.data-table__content :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 确保固定列正确对齐 */
:deep(.el-table__fixed-right) {
  height: auto !important;
}
</style>
