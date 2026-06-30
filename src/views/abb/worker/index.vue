<!-- 人员数据管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="工人ID" prop="workerCode">
          <el-input
            v-model="queryParams.workerCode"
            placeholder="请输入工人ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-select v-model="queryParams.gender" placeholder="全部" clearable style="width: 100px">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="熟练度/级别" prop="skillLevel">
          <el-select
            v-model="queryParams.skillLevel"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
            <el-option label="专家" value="专家" />
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
        <el-table-column label="工人ID" prop="workerCode" min-width="100" />
        <el-table-column label="性别" min-width="60" align="center" prop="gender">
          <template #default="scope">
            {{ scope.row.gender === 1 ? "男" : scope.row.gender === 2 ? "女" : "" }}
          </template>
        </el-table-column>
        <el-table-column label="身高" min-width="80" align="center" prop="height" />
        <el-table-column label="工龄" min-width="80" align="center" prop="workYears" />
        <el-table-column label="熟练度/级别" min-width="100" align="center" prop="skillLevel" />
        <el-table-column label="打卡开始时间" min-width="180" align="center" prop="clockInTime" />
        <el-table-column label="打卡结束时间" min-width="180" align="center" prop="clockOutTime" />
        <el-table-column
          label="所在加工位ID"
          min-width="100"
          align="center"
          prop="processStationId"
        />
        <el-table-column
          label="当前加工工件ID"
          min-width="120"
          align="center"
          prop="currentWorkpieceId"
        />
        <el-table-column
          label="下一件加工工件ID"
          min-width="120"
          align="center"
          prop="nextWorkpieceId"
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
        @pagination="fetchWorkerList"
      />
    </el-card>

    <!-- 人员表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="workerFormRef" :model="formData" :rules="rules" label-width="140px">
        <el-form-item label="工人ID" prop="workerCode">
          <el-input
            v-model="formData.workerCode"
            :readonly="!!formData.id"
            placeholder="请输入工人ID"
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="身高" prop="height">
          <el-input v-model="formData.height" placeholder="请输入身高" style="width: 100%" />
        </el-form-item>

        <el-form-item label="工龄" prop="workYears">
          <el-input v-model="formData.workYears" placeholder="请输入工龄" style="width: 100%" />
        </el-form-item>

        <el-form-item label="熟练度/级别" prop="skillLevel">
          <el-select
            v-model="formData.skillLevel"
            placeholder="请选择熟练度/级别"
            style="width: 100%"
          >
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
            <el-option label="专家" value="专家" />
          </el-select>
        </el-form-item>

        <el-form-item label="打卡开始时间" prop="clockInTime">
          <el-date-picker
            v-model="formData.clockInTime"
            type="datetime"
            placeholder="请选择打卡开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="打卡结束时间" prop="clockOutTime">
          <el-date-picker
            v-model="formData.clockOutTime"
            type="datetime"
            placeholder="请选择打卡结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="所在加工位ID" prop="processStationId">
          <el-input
            v-model="formData.processStationId"
            placeholder="请输入所在加工位ID"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="当前加工工件ID" prop="currentWorkpieceId">
          <el-input
            v-model="formData.currentWorkpieceId"
            placeholder="请输入当前加工工件ID"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="下一件加工工件ID" prop="nextWorkpieceId">
          <el-input
            v-model="formData.nextWorkpieceId"
            placeholder="请输入下一件加工工件ID"
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
import { WorkerAPI } from "@/api/abb/worker-api";
import type { Worker, WorkerForm, WorkerQuery } from "@/api/abb/worker-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<Worker[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const drawerSize = ref("50%");

// 表单数据
const formData = ref<WorkerForm>({
  id: undefined,
  workerCode: undefined,
  gender: undefined,
  height: undefined,
  workYears: undefined,
  skillLevel: undefined,
  clockInTime: undefined,
  clockOutTime: undefined,
  processStationId: undefined,
  scheduledWorkpieceIds: undefined,
  currentWorkpieceId: undefined,
  nextWorkpieceId: undefined,
});

// 对话框配置
const dialog = reactive({
  visible: false,
  title: "",
});

// 查询参数
const queryParams = reactive<WorkerQuery>({
  pageNum: 1,
  pageSize: 10,
  workerCode: undefined,
  keywords: undefined,
  gender: undefined,
  skillLevel: undefined,
});

// 表单验证规则
const rules = {
  workerCode: [
    { required: true, message: "工人ID不能为空", trigger: "blur" },
    { min: 1, max: 50, message: "工人ID长度在1-50个字符之间", trigger: "blur" },
  ],
  gender: [{ required: true, message: "性别不能为空", trigger: "change" }],
  height: [
    { required: true, message: "身高不能为空", trigger: "blur" },
    { max: 10, message: "身高长度不能超过10个字符", trigger: "blur" },
  ],
  workYears: [
    { required: true, message: "工龄不能为空", trigger: "blur" },
    { max: 10, message: "工龄长度不能超过10个字符", trigger: "blur" },
  ],
  skillLevel: [{ required: true, message: "熟练度/级别不能为空", trigger: "change" }],
  scheduledWorkpieceIds: [
    { max: 100, message: "排程工件ID序列长度不能超过100个字符", trigger: "blur" },
  ],
  processStationId: [{ max: 100, message: "所在加工位ID长度不能超过100个字符", trigger: "blur" }],
  currentWorkpieceId: [
    { max: 100, message: "当前加工工件ID长度不能超过100个字符", trigger: "blur" },
  ],
  nextWorkpieceId: [
    { max: 100, message: "下一件加工工件ID长度不能超过100个字符", trigger: "blur" },
  ],
};

// 表单引用
const queryFormRef = ref();
const workerFormRef = ref();

// 获取人员分页列表
const fetchWorkerList = async () => {
  loading.value = true;
  try {
    const response = await WorkerAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchWorkerList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchWorkerList();
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
    const response = await WorkerAPI.getFormData(id);
    Object.assign(formData.value, response || {});
    dialog.title = "编辑人员";
  } else {
    // 新增
    formData.value = {
      id: undefined,
      workerCode: undefined,
      gender: undefined,
      height: undefined,
      workYears: undefined,
      skillLevel: undefined,
      clockInTime: undefined,
      clockOutTime: undefined,
      processStationId: undefined,
      scheduledWorkpieceIds: undefined,
      currentWorkpieceId: undefined,
      nextWorkpieceId: undefined,
    };
    dialog.title = "新增人员";
  }
  dialog.visible = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  workerFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  await workerFormRef.value?.validate();

  if (formData.value.id) {
    // 更新
    await WorkerAPI.update(formData.value.id, formData.value);
    ElMessage.success("更新成功");
  } else {
    // 新增
    await WorkerAPI.create(formData.value);
    ElMessage.success("新增成功");
  }

  dialog.visible = false;
  fetchWorkerList();
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
    await WorkerAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchWorkerList();
  } catch {
    // 用户取消删除
  }
};

// 初始化数据
onMounted(() => {
  fetchWorkerList();
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
