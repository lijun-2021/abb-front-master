<!-- 变迁数据管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="变迁名称" prop="transitionName">
          <el-input
            v-model="queryParams.transitionName"
            placeholder="请输入变迁名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="前置库所" prop="prePlace">
          <el-input
            v-model="queryParams.prePlace"
            placeholder="请输入前置库所"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="后置库所" prop="postPlace">
          <el-input
            v-model="queryParams.postPlace"
            placeholder="请输入后置库所"
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
        <el-table-column label="变迁名称" prop="transitionName" min-width="120" />
        <el-table-column label="前置库所" prop="prePlace" min-width="120" />
        <el-table-column label="后置库所" prop="postPlace" min-width="120" />
        <el-table-column label="place_check标志位" min-width="150" align="center">
          <template #default="scope">
            {{
              scope.row.placeCheckFlag !== null && scope.row.placeCheckFlag !== undefined
                ? scope.row.placeCheckFlag.toString()
                : ""
            }}
          </template>
        </el-table-column>
        <el-table-column label="place_lock标志位" min-width="150" align="center">
          <template #default="scope">
            {{
              scope.row.placeLockFlag !== null && scope.row.placeLockFlag !== undefined
                ? scope.row.placeLockFlag.toString()
                : ""
            }}
          </template>
        </el-table-column>
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
        @pagination="fetchTransitionList"
      />
    </el-card>

    <!-- 变迁表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="transitionFormRef" :model="formData" :rules="rules as any" label-width="160px">
        <el-form-item label="变迁名称" prop="transitionName">
          <el-input
            v-model="formData.transitionName"
            :readonly="!!formData.id"
            placeholder="请输入变迁名称"
          />
        </el-form-item>

        <el-form-item label="前置库所" prop="prePlace">
          <el-input v-model="formData.prePlace" placeholder="请输入前置库所" style="width: 100%" />
        </el-form-item>

        <el-form-item label="后置库所" prop="postPlace">
          <el-input v-model="formData.postPlace" placeholder="请输入后置库所" style="width: 100%" />
        </el-form-item>

        <el-form-item label="place_check标志位" prop="placeCheckFlag">
          <el-select v-model="formData.placeCheckFlag" placeholder="请选择">
            <el-option label="true" :value="true" />
            <el-option label="false" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="place_lock标志位" prop="placeLockFlag">
          <el-select v-model="formData.placeLockFlag" placeholder="请选择">
            <el-option label="true" :value="true" />
            <el-option label="false" :value="false" />
          </el-select>
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
import { TransitionAPI } from "@/api/abb/transition-api";
import type { Transition, TransitionForm, TransitionQuery } from "@/api/abb/transition-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<Transition[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const drawerSize = ref("50%");

// 表单数据
const formData = ref<TransitionForm>({
  id: undefined,
  transitionName: undefined,
  prePlace: undefined,
  postPlace: undefined,
  placeCheckFlag: undefined,
  placeLockFlag: undefined,
});

// 对话框配置
const dialog = reactive({
  visible: false,
  title: "",
});

// 查询参数
const queryParams = reactive<TransitionQuery>({
  pageNum: 1,
  pageSize: 10,
  transitionName: undefined,
  prePlace: undefined,
  postPlace: undefined,
});

drawerSize.value = "60%";

// 表单验证规则
const rules = {
  transitionName: [
    { required: true, message: "变迁名称不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "变迁名称长度在1-100个字符之间", trigger: "blur" },
  ],
  prePlace: [
    { required: true, message: "前置库所不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "前置库所长度在1-100个字符之间", trigger: "blur" },
  ],
  postPlace: [
    { required: true, message: "后置库所不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "后置库所长度在1-100个字符之间", trigger: "blur" },
  ],
  placeCheckFlag: [{ required: true, message: "place_check标志位不能为空", trigger: "change" }],
  placeLockFlag: [{ required: true, message: "place_lock标志位不能为空", trigger: "change" }],
};

// 表单引用
const queryFormRef = ref();
const transitionFormRef = ref();

// 获取变迁分页列表
const fetchTransitionList = async () => {
  loading.value = true;
  try {
    const response = await TransitionAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchTransitionList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchTransitionList();
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
    const response = await TransitionAPI.getFormData(id);
    Object.assign(formData.value, response || {});
    dialog.title = "编辑变迁";
  } else {
    // 新增
    formData.value = {
      id: undefined,
      transitionName: undefined,
      prePlace: undefined,
      postPlace: undefined,
      placeCheckFlag: undefined,
      placeLockFlag: undefined,
    };
    dialog.title = "新增变迁";
  }
  dialog.visible = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  transitionFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  await transitionFormRef.value?.validate();

  if (formData.value.id) {
    // 更新
    await TransitionAPI.update(formData.value.id, formData.value);
    ElMessage.success("更新成功");
  } else {
    // 新增
    await TransitionAPI.create(formData.value);
    ElMessage.success("新增成功");
  }

  dialog.visible = false;
  fetchTransitionList();
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
    await TransitionAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchTransitionList();
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

    await TransitionAPI.import(formData);
    ElMessage.success("导入成功");
    fetchTransitionList(); // 重新加载数据
  } catch (error) {
    console.error("导入失败:", error);
    ElMessage.error("导入失败，请检查文件格式是否正确");
  }
};

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const response = await TransitionAPI.downloadTemplate();

    // 从响应头中获取文件名
    const contentDisposition = response.headers["content-disposition"];
    let filename = "transition导入模板.xlsx"; // 默认文件名

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
  fetchTransitionList();
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
