<!-- 算法数据管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="预计完工时间" prop="estimatedFinishTime">
          <el-date-picker
            v-model="queryParams.estimatedFinishTime"
            type="datetime"
            placeholder="请选择预计完工时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
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
        <el-table-column label="预计完工时间" prop="estimatedFinishTime" min-width="150" />
        <el-table-column label="调整次数" min-width="100" align="center" prop="adjustCount" />
        <el-table-column
          label="立体仓预警位"
          min-width="120"
          align="center"
          prop="warehouseWarningFlag"
        />
        <el-table-column
          label="壳体机器人利用率(%)"
          min-width="150"
          align="center"
          prop="shellRobotUtilization"
          :formatter="formatUtilization"
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
        @pagination="fetchAlgorithmList"
      />
    </el-card>

    <!-- 算法表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="algorithmFormRef" :model="formData" :rules="rules as any" label-width="140px">
        <el-form-item label="预计完工时间" prop="estimatedFinishTime">
          <el-date-picker
            v-model="formData.estimatedFinishTime"
            type="datetime"
            placeholder="请选择预计完工时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="调整次数" prop="adjustCount">
          <el-input-number
            v-model="formData.adjustCount"
            :min="0"
            :max="999999"
            placeholder="请输入调整次数"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="立体仓预警位" prop="warehouseWarningFlag">
          <el-input
            v-model="formData.warehouseWarningFlag"
            placeholder="请输入立体仓预警位"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="壳体机器人利用率(%)" prop="shellRobotUtilization">
          <el-input-number
            v-model="formData.shellRobotUtilization"
            :min="0"
            :max="100"
            :precision="2"
            :step="0.01"
            placeholder="请输入壳体机器人利用率"
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
import { AlgorithmAPI } from "@/api/abb/algorithm-api";
import type { Algorithm, AlgorithmForm, AlgorithmQuery } from "@/api/abb/algorithm-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<Algorithm[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const drawerSize = ref("50%");

// 表单数据
const formData = ref<AlgorithmForm>({
  id: undefined,
  estimatedFinishTime: undefined,
  adjustCount: undefined,
  warehouseWarningFlag: undefined,
  shellRobotUtilization: undefined,
});

// 对话框配置
const dialog = reactive({
  visible: false,
  title: "",
});

// 查询参数
const queryParams = reactive<AlgorithmQuery>({
  pageNum: 1,
  pageSize: 10,
  estimatedFinishTime: undefined,
  adjustCount: undefined,
  warehouseWarningFlag: undefined,
  shellRobotUtilization: undefined,
});

// 表单验证规则
const rules = {
  estimatedFinishTime: [{ required: true, message: "预计完工时间不能为空", trigger: "change" }],
  adjustCount: [
    { required: true, message: "调整次数不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 999999,
      message: "调整次数必须为0-999999之间的数字",
      trigger: "blur",
    },
  ],
  warehouseWarningFlag: [
    { required: true, message: "立体仓预警位不能为空", trigger: "blur" },
    { min: 1, max: 50, message: "立体仓预警位长度在1-50个字符之间", trigger: "blur" },
  ],
  shellRobotUtilization: [
    { required: true, message: "壳体机器人利用率不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 100,
      message: "壳体机器人利用率必须为0-100之间的数字",
      trigger: "blur",
    },
  ],
};

// 表单引用
const queryFormRef = ref();
const algorithmFormRef = ref();

// 获取算法分页列表
const fetchAlgorithmList = async () => {
  loading.value = true;
  try {
    const response = await AlgorithmAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchAlgorithmList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchAlgorithmList();
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
    const response = await AlgorithmAPI.getFormData(id);
    Object.assign(formData.value, response || {});
    dialog.title = "编辑算法";
  } else {
    // 新增
    formData.value = {
      id: undefined,
      estimatedFinishTime: undefined,
      adjustCount: undefined,
      warehouseWarningFlag: undefined,
      shellRobotUtilization: undefined,
    };
    dialog.title = "新增算法";
  }
  dialog.visible = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  algorithmFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  await algorithmFormRef.value?.validate();

  if (formData.value.id) {
    // 更新
    await AlgorithmAPI.update(formData.value.id, formData.value);
    ElMessage.success("更新成功");
  } else {
    // 新增
    await AlgorithmAPI.create(formData.value);
    ElMessage.success("新增成功");
  }

  dialog.visible = false;
  fetchAlgorithmList();
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
    await AlgorithmAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchAlgorithmList();
  } catch {
    // 用户取消删除
  }
};

// 格式化利用率显示，保留最多2位小数
const formatUtilization = (row: Algorithm, column: any, cellValue: any) => {
  if (cellValue === null || cellValue === undefined) {
    return "";
  }
  return Number(cellValue).toFixed(2);
};

// 初始化数据
onMounted(() => {
  fetchAlgorithmList();
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
