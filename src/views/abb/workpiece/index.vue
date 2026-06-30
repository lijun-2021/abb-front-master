<!-- 工件数据管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="SN" prop="sn">
          <el-input
            v-model="queryParams.sn"
            placeholder="请输入SN"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="编号" prop="code">
          <el-input
            v-model="queryParams.code"
            placeholder="请输入编号"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="型号" prop="model">
          <el-input
            v-model="queryParams.model"
            placeholder="请输入型号"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="当前状态" prop="currentStatus">
          <el-select
            v-model="queryParams.currentStatus"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="待加工" value="待加工" />
            <el-option label="加工中" value="加工中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="已出库" value="已出库" />
          </el-select>
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
        <el-table-column label="SN" prop="sn" min-width="120" />
        <el-table-column label="编号" prop="code" min-width="100" align="center" />
        <el-table-column label="型号" prop="model" min-width="100" align="center" />
        <el-table-column label="线束根数" prop="harnessCount" min-width="100" align="center" />
        <el-table-column label="线束类型" prop="harnessType" min-width="100" align="center" />
        <el-table-column label="端子类型" prop="terminalType" min-width="100" align="center" />
        <el-table-column label="长度" prop="length" min-width="80" align="center" />
        <el-table-column label="宽度" prop="width" min-width="80" align="center" />
        <el-table-column label="高度" prop="height" min-width="80" align="center" />
        <el-table-column label="加工流程" prop="processFlow" min-width="120" align="center" />
        <el-table-column label="当前状态" prop="currentStatus" min-width="100" align="center" />
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
        @pagination="fetchWorkpieceList"
      />
    </el-card>

    <!-- 工件表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="workpieceFormRef" :model="formData" :rules="rules as any" label-width="140px">
        <el-form-item label="SN" prop="sn">
          <el-input v-model="formData.sn" :readonly="!!formData.id" placeholder="请输入SN" />
        </el-form-item>

        <el-form-item label="编号" prop="code">
          <el-input v-model="formData.code" placeholder="请输入编号" style="width: 100%" />
        </el-form-item>

        <el-form-item label="型号" prop="model">
          <el-input v-model="formData.model" placeholder="请输入型号" style="width: 100%" />
        </el-form-item>

        <el-form-item label="线束根数" prop="harnessCount">
          <el-input-number
            v-model="formData.harnessCount"
            :min="0"
            :max="999999"
            placeholder="请输入线束根数"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="线束类型" prop="harnessType">
          <el-input
            v-model="formData.harnessType"
            placeholder="请输入线束类型"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="端子类型" prop="terminalType">
          <el-input
            v-model="formData.terminalType"
            placeholder="请输入端子类型"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="长度" prop="length">
          <el-input v-model="formData.length" placeholder="请输入长度" style="width: 100%" />
        </el-form-item>

        <el-form-item label="宽度" prop="width">
          <el-input v-model="formData.width" placeholder="请输入宽度" style="width: 100%" />
        </el-form-item>

        <el-form-item label="高度" prop="height">
          <el-input v-model="formData.height" placeholder="请输入高度" style="width: 100%" />
        </el-form-item>

        <el-form-item label="加工流程" prop="processFlow">
          <el-input
            v-model="formData.processFlow"
            placeholder="请输入加工流程"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="当前状态" prop="currentStatus">
          <el-input
            v-model="formData.currentStatus"
            placeholder="请输入当前状态"
            style="width: 100%"
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
import { WorkpieceAPI } from "@/api/abb/workpiece-api";
import type { Workpiece, WorkpieceForm, WorkpieceQuery } from "@/api/abb/workpiece-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<Workpiece[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const drawerSize = ref("50%");

// 表单数据
const formData = ref<WorkpieceForm>({
  id: undefined,
  sn: undefined,
  code: undefined,
  model: undefined,
  harnessCount: undefined,
  harnessType: undefined,
  terminalType: undefined,
  length: undefined,
  width: undefined,
  height: undefined,
  processFlow: undefined,
  currentStatus: undefined,
});

// 对话框配置
const dialog = reactive({
  visible: false,
  title: "",
});

// 查询参数
const queryParams = reactive<WorkpieceQuery>({
  pageNum: 1,
  pageSize: 10,
  sn: undefined,
  keywords: undefined,
  code: undefined,
  model: undefined,
  currentStatus: undefined,
});

// 表单验证规则
const rules = {
  sn: [
    { required: true, message: "SN不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "SN长度在1-100个字符之间", trigger: "blur" },
  ],
  code: [
    { required: true, message: "编号不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "编号长度在1-100个字符之间", trigger: "blur" },
  ],
  harnessCount: [
    { required: true, message: "线束根数不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 999999,
      message: "线束根数必须为0-999999之间的数字",
      trigger: "blur",
    },
  ],
};

// 表单引用
const queryFormRef = ref();
const workpieceFormRef = ref();

// 获取工件分页列表
const fetchWorkpieceList = async () => {
  loading.value = true;
  try {
    const response = await WorkpieceAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchWorkpieceList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchWorkpieceList();
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
    const response = await WorkpieceAPI.getFormData(id);
    Object.assign(formData.value, response || {});
    dialog.title = "编辑工件";
  } else {
    // 新增
    formData.value = {
      id: undefined,
      sn: undefined,
      code: undefined,
      model: undefined,
      harnessCount: undefined,
      harnessType: undefined,
      terminalType: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      processFlow: undefined,
      currentStatus: undefined,
    };
    dialog.title = "新增工件";
  }
  dialog.visible = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  workpieceFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  await workpieceFormRef.value?.validate();

  if (formData.value.id) {
    // 更新
    await WorkpieceAPI.update(formData.value.id, formData.value);
    ElMessage.success("更新成功");
  } else {
    // 新增
    await WorkpieceAPI.create(formData.value);
    ElMessage.success("新增成功");
  }

  dialog.visible = false;
  fetchWorkpieceList();
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
    await WorkpieceAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchWorkpieceList();
  } catch {
    // 用户取消删除
  }
};

// 初始化数据
onMounted(() => {
  fetchWorkpieceList();
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
