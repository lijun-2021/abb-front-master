<!-- 当日资源/状态数据管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="加工位ID" prop="processStationId">
          <el-input
            v-model="queryParams.processStationId"
            placeholder="请输入加工位ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="加工位状态" prop="processStationStatus">
          <el-select
            v-model="queryParams.processStationStatus"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="空闲" value="空闲" />
            <el-option label="工作中" value="工作中" />
            <el-option label="故障" value="故障" />
            <el-option label="维护" value="维护" />
          </el-select>
        </el-form-item>

        <el-form-item label="立库ID" prop="warehouseId">
          <el-input
            v-model="queryParams.warehouseId"
            placeholder="请输入立库ID"
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
        <el-table-column label="加工位ID" prop="processStationId" min-width="120" />
        <el-table-column label="加工位工人ID" prop="processWorkerId" min-width="120" />
        <el-table-column
          label="加工位状态"
          prop="processStationStatus"
          min-width="100"
          align="center"
        />
        <el-table-column label="立库ID" prop="warehouseId" min-width="100" align="center" />
        <el-table-column
          label="立库总空余存储数"
          prop="warehouseTotalFree"
          min-width="120"
          align="center"
        />
        <el-table-column
          label="立库当前空余存储数"
          prop="warehouseCurrentFree"
          min-width="120"
          align="center"
        />
        <el-table-column
          label="立库当前占用存储数"
          prop="warehouseCurrentUsed"
          min-width="120"
          align="center"
        />
        <el-table-column label="RGV标志位" prop="rgvFlag" min-width="100" align="center" />
        <el-table-column label="AGV标志位" prop="agvFlag" min-width="100" align="center" />
        <el-table-column
          label="立库机械臂标志位"
          prop="robotArmFlag"
          min-width="120"
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
        @pagination="fetchResourceStatusList"
      />
    </el-card>

    <!-- 当日资源/状态表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form
        ref="resourceStatusFormRef"
        :model="formData"
        :rules="rules as any"
        label-width="160px"
      >
        <el-form-item label="加工位ID" prop="processStationId">
          <el-input
            v-model="formData.processStationId"
            :readonly="!!formData.id"
            placeholder="请输入加工位ID"
          />
        </el-form-item>

        <el-form-item label="加工位工人ID" prop="processWorkerId">
          <el-input
            v-model="formData.processWorkerId"
            placeholder="请输入加工位工人ID"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="加工位状态" prop="processStationStatus">
          <el-select
            v-model="formData.processStationStatus"
            placeholder="请选择加工位状态"
            style="width: 100%"
          >
            <el-option label="空闲" value="空闲" />
            <el-option label="工作中" value="工作中" />
            <el-option label="故障" value="故障" />
            <el-option label="维护" value="维护" />
          </el-select>
        </el-form-item>

        <el-form-item label="立库ID" prop="warehouseId">
          <el-input v-model="formData.warehouseId" placeholder="请输入立库ID" style="width: 100%" />
        </el-form-item>

        <el-form-item label="立库总空余存储数" prop="warehouseTotalFree">
          <el-input-number
            v-model="formData.warehouseTotalFree"
            :min="0"
            :max="999999"
            placeholder="请输入立库总空余存储数"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="立库当前空余存储数" prop="warehouseCurrentFree">
          <el-input-number
            v-model="formData.warehouseCurrentFree"
            :min="0"
            :max="999999"
            placeholder="请输入立库当前空余存储数"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="立库当前占用存储数" prop="warehouseCurrentUsed">
          <el-input-number
            v-model="formData.warehouseCurrentUsed"
            :min="0"
            :max="999999"
            placeholder="请输入立库当前占用存储数"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="RGV标志位" prop="rgvFlag">
          <el-input v-model="formData.rgvFlag" placeholder="请输入RGV标志位" style="width: 100%" />
        </el-form-item>

        <el-form-item label="AGV标志位" prop="agvFlag">
          <el-input v-model="formData.agvFlag" placeholder="请输入AGV标志位" style="width: 100%" />
        </el-form-item>

        <el-form-item label="立库机械臂标志位" prop="robotArmFlag">
          <el-input
            v-model="formData.robotArmFlag"
            placeholder="请输入立库机械臂标志位"
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
import { ResourceStatusAPI } from "@/api/abb/resourcestatus-api";
import type {
  ResourceStatus,
  ResourceStatusForm,
  ResourceStatusQuery,
} from "@/api/abb/resourcestatus-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<ResourceStatus[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const drawerSize = ref("60%");

// 表单数据
const formData = ref<ResourceStatusForm>({
  id: undefined,
  processStationId: undefined,
  processWorkerId: undefined,
  processStationStatus: undefined,
  warehouseId: undefined,
  warehouseTotalFree: undefined,
  warehouseCurrentFree: undefined,
  warehouseCurrentUsed: undefined,
  rgvFlag: undefined,
  agvFlag: undefined,
  robotArmFlag: undefined,
});

// 对话框配置
const dialog = reactive({
  visible: false,
  title: "",
});

// 查询参数
const queryParams = reactive<ResourceStatusQuery>({
  pageNum: 1,
  pageSize: 10,
  processStationId: undefined,
  keywords: undefined,
  processStationStatus: undefined,
  warehouseId: undefined,
});

// 表单验证规则
const rules = {
  processStationId: [
    { required: true, message: "加工位ID不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "加工位ID长度在1-100个字符之间", trigger: "blur" },
  ],
  processStationStatus: [{ required: true, message: "加工位状态不能为空", trigger: "change" }],
  warehouseTotalFree: [
    { required: true, message: "立库总空余存储数不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 999999,
      message: "立库总空余存储数必须为0-999999之间的数字",
      trigger: "blur",
    },
  ],
  warehouseCurrentFree: [
    { required: true, message: "立库当前空余存储数不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 999999,
      message: "立库当前空余存储数必须为0-999999之间的数字",
      trigger: "blur",
    },
  ],
  warehouseCurrentUsed: [
    { required: true, message: "立库当前占用存储数不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 999999,
      message: "立库当前占用存储数必须为0-999999之间的数字",
      trigger: "blur",
    },
  ],
};

// 表单引用
const queryFormRef = ref();
const resourceStatusFormRef = ref();

// 获取当日资源/状态分页列表
const fetchResourceStatusList = async () => {
  loading.value = true;
  try {
    const response = await ResourceStatusAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchResourceStatusList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchResourceStatusList();
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
    const response = await ResourceStatusAPI.getFormData(id);
    Object.assign(formData.value, response || {});
    dialog.title = "编辑当日资源/状态";
  } else {
    // 新增
    formData.value = {
      id: undefined,
      processStationId: undefined,
      processWorkerId: undefined,
      processStationStatus: undefined,
      warehouseId: undefined,
      warehouseTotalFree: undefined,
      warehouseCurrentFree: undefined,
      warehouseCurrentUsed: undefined,
      rgvFlag: undefined,
      agvFlag: undefined,
      robotArmFlag: undefined,
    };
    dialog.title = "新增当日资源/状态";
  }
  dialog.visible = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  resourceStatusFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  await resourceStatusFormRef.value?.validate();

  if (formData.value.id) {
    // 更新
    await ResourceStatusAPI.update(formData.value.id, formData.value);
    ElMessage.success("更新成功");
  } else {
    // 新增
    await ResourceStatusAPI.create(formData.value);
    ElMessage.success("新增成功");
  }

  dialog.visible = false;
  fetchResourceStatusList();
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
    await ResourceStatusAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchResourceStatusList();
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

    await ResourceStatusAPI.import(formData);
    ElMessage.success("导入成功");
    fetchResourceStatusList(); // 重新加载数据
  } catch (error) {
    console.error("导入失败:", error);
    ElMessage.error("导入失败，请检查文件格式是否正确");
  }
};

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const response = await ResourceStatusAPI.downloadTemplate();

    // 从响应头中获取文件名
    const contentDisposition = response.headers["content-disposition"];
    let filename = "resourcestatus导入模板.xlsx"; // 默认文件名

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
  fetchResourceStatusList();
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
