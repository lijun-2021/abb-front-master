<!-- 实时调度数据管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="故障编号" prop="faultCode">
          <el-input
            v-model="queryParams.faultCode"
            placeholder="请输入故障编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="故障类型" prop="faultType">
          <el-input
            v-model="queryParams.faultType"
            placeholder="请输入故障类型"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="故障状态" prop="faultStatus">
          <el-input
            v-model="queryParams.faultStatus"
            placeholder="请输入故障状态"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="超时工件ID" prop="timeoutWorkpieceId">
          <el-input
            v-model="queryParams.timeoutWorkpieceId"
            placeholder="请输入超时工件ID"
            clearable
            style="width: 120px"
          />
        </el-form-item>

        <el-form-item label="超时工人ID" prop="timeoutWorkerId">
          <el-input
            v-model="queryParams.timeoutWorkerId"
            placeholder="请输入超时工人ID"
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
        <el-table-column label="故障编号" prop="faultCode" min-width="120" />
        <el-table-column label="故障信息" prop="faultInfo" min-width="150" />
        <el-table-column label="故障类型" prop="faultType" min-width="100" align="center" />
        <el-table-column label="故障状态" prop="faultStatus" min-width="100" align="center" />
        <el-table-column label="超时数量" prop="timeoutCount" min-width="100" align="center" />
        <el-table-column
          label="超时工件ID"
          prop="timeoutWorkpieceId"
          min-width="120"
          align="center"
        />
        <el-table-column label="超时工人ID" prop="timeoutWorkerId" min-width="120" align="center" />
        <el-table-column label="超时比例(%)" prop="timeoutRatio" min-width="120" align="center" />
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
        @pagination="fetchRealtimeScheduleList"
      />
    </el-card>

    <!-- 实时调度表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form
        ref="realtimeScheduleFormRef"
        :model="formData"
        :rules="rules as any"
        label-width="140px"
      >
        <el-form-item label="故障编号" prop="faultCode">
          <el-input v-model="formData.faultCode" placeholder="请输入故障编号" />
        </el-form-item>

        <el-form-item label="故障信息" prop="faultInfo">
          <el-input
            v-model="formData.faultInfo"
            placeholder="请输入故障信息"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="故障类型" prop="faultType">
          <el-input v-model="formData.faultType" placeholder="请输入故障类型" />
        </el-form-item>

        <el-form-item label="故障状态" prop="faultStatus">
          <el-input v-model="formData.faultStatus" placeholder="请输入故障状态" />
        </el-form-item>

        <el-form-item label="超时数量" prop="timeoutCount">
          <el-input-number
            v-model="formData.timeoutCount"
            :min="0"
            :max="999999"
            placeholder="请输入超时数量"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="超时工件ID" prop="timeoutWorkpieceId">
          <el-input v-model="formData.timeoutWorkpieceId" placeholder="请输入超时工件ID" />
        </el-form-item>

        <el-form-item label="超时工人ID" prop="timeoutWorkerId">
          <el-input v-model="formData.timeoutWorkerId" placeholder="请输入超时工人ID" />
        </el-form-item>

        <el-form-item label="超时比例(%)" prop="timeoutRatio">
          <el-input-number
            v-model="formData.timeoutRatio"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="请输入超时比例"
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
import { RealtimeScheduleAPI } from "@/api/abb/realtimeschedule-api";
import type {
  RealtimeSchedule,
  RealtimeScheduleForm,
  RealtimeScheduleQuery,
} from "@/api/abb/realtimeschedule-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<RealtimeSchedule[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const drawerSize = ref("50%");

// 表单数据
const formData = ref<RealtimeScheduleForm>({
  id: undefined,
  faultCode: undefined,
  faultInfo: undefined,
  faultType: undefined,
  faultStatus: undefined,
  timeoutCount: undefined,
  timeoutWorkpieceId: undefined,
  timeoutWorkerId: undefined,
  timeoutRatio: undefined,
});

// 对话框配置
const dialog = reactive({
  visible: false,
  title: "",
});

// 查询参数
const queryParams = reactive<RealtimeScheduleQuery>({
  pageNum: 1,
  pageSize: 10,
  faultCode: undefined,
  faultType: undefined,
  faultStatus: undefined,
  timeoutWorkpieceId: undefined,
  timeoutWorkerId: undefined,
});

// 表单验证规则
const rules = {
  faultCode: [
    { required: true, message: "故障编号不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "故障编号长度在1-100个字符之间", trigger: "blur" },
  ],
  faultInfo: [{ max: 255, message: "故障信息长度不能超过255个字符", trigger: "blur" }],
  faultType: [
    { required: true, message: "故障类型不能为空", trigger: "blur" },
    { min: 1, max: 50, message: "故障类型长度在1-50个字符之间", trigger: "blur" },
  ],
  faultStatus: [
    { required: true, message: "故障状态不能为空", trigger: "blur" },
    { min: 1, max: 50, message: "故障状态长度在1-50个字符之间", trigger: "blur" },
  ],
  timeoutCount: [
    { required: true, message: "超时数量不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 999999,
      message: "超时数量必须为0-999999之间的数字",
      trigger: "blur",
    },
  ],
  timeoutWorkpieceId: [
    { min: 1, max: 20, message: "超时工件ID长度在1-20个字符之间", trigger: "blur" },
  ],
  timeoutWorkerId: [
    { min: 1, max: 20, message: "超时工人ID长度在1-20个字符之间", trigger: "blur" },
  ],
  timeoutRatio: [
    { required: true, message: "超时比例不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 100,
      message: "超时比例必须为0-100之间的数字",
      trigger: "blur",
    },
  ],
};

// 表单引用
const queryFormRef = ref();
const realtimeScheduleFormRef = ref();

// 获取实时调度分页列表
const fetchRealtimeScheduleList = async () => {
  loading.value = true;
  try {
    const response = await RealtimeScheduleAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchRealtimeScheduleList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchRealtimeScheduleList();
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
    const response = await RealtimeScheduleAPI.getFormData(id);
    Object.assign(formData.value, response || {});
    dialog.title = "编辑实时调度";
  } else {
    // 新增
    formData.value = {
      id: undefined,
      faultCode: undefined,
      faultInfo: undefined,
      faultType: undefined,
      faultStatus: undefined,
      timeoutCount: undefined,
      timeoutWorkpieceId: undefined,
      timeoutWorkerId: undefined,
      timeoutRatio: undefined,
    };
    dialog.title = "新增实时调度";
  }
  dialog.visible = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  realtimeScheduleFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  await realtimeScheduleFormRef.value?.validate();

  if (formData.value.id) {
    // 更新
    await RealtimeScheduleAPI.update(formData.value.id, formData.value);
    ElMessage.success("更新成功");
  } else {
    // 新增
    await RealtimeScheduleAPI.create(formData.value);
    ElMessage.success("新增成功");
  }

  dialog.visible = false;
  fetchRealtimeScheduleList();
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
    await RealtimeScheduleAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchRealtimeScheduleList();
  } catch {
    // 用户取消删除
  }
};

// 初始化数据
onMounted(() => {
  fetchRealtimeScheduleList();
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
