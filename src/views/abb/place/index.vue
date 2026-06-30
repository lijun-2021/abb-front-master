<!-- 库所数据管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="库所名称" prop="placeName">
          <el-input
            v-model="queryParams.placeName"
            placeholder="请输入库所名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="库所类别" prop="placeType">
          <el-select
            v-model="queryParams.placeType"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="输入库所" value="输入库所" />
            <el-option label="输出库所" value="输出库所" />
            <el-option label="缓冲库所" value="缓冲库所" />
            <el-option label="资源库所" value="资源库所" />
          </el-select>
        </el-form-item>

        <el-form-item label="加工位ID" prop="processStationId">
          <el-input
            v-model="queryParams.processStationId"
            placeholder="请输入加工位ID"
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
        <el-table-column label="库所名称" prop="placeName" min-width="120" />
        <el-table-column label="容量" min-width="80" align="center" prop="capacity" />
        <el-table-column label="前置变迁" min-width="120" align="center" prop="preTransition" />
        <el-table-column label="后置变迁" min-width="120" align="center" prop="postTransition" />
        <el-table-column label="库所类别" min-width="100" align="center" prop="placeType" />
        <el-table-column label="赋时库所标志位" min-width="120" align="center">
          <template #default="scope">
            {{
              scope.row.timedPlaceFlag !== null && scope.row.timedPlaceFlag !== undefined
                ? scope.row.timedPlaceFlag.toString()
                : ""
            }}
          </template>
        </el-table-column>
        <el-table-column label="加工位ID" min-width="100" align="center" prop="processStationId" />
        <el-table-column label="阶段标志" min-width="100" align="center" prop="stageFlag" />
        <el-table-column label="库所颜色" min-width="100" align="center" prop="placeColor" />
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
        @pagination="fetchPlaceList"
      />
    </el-card>

    <!-- 库所表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="placeFormRef" :model="formData" :rules="rules as any" label-width="160px">
        <el-form-item label="库所名称" prop="placeName">
          <el-input
            v-model="formData.placeName"
            :readonly="!!formData.id"
            placeholder="请输入库所名称"
          />
        </el-form-item>

        <el-form-item label="容量" prop="capacity">
          <el-input-number
            v-model="formData.capacity"
            :min="0"
            :max="999999"
            placeholder="请输入容量"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="前置变迁" prop="preTransition">
          <el-input
            v-model="formData.preTransition"
            placeholder="请输入前置变迁"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="后置变迁" prop="postTransition">
          <el-input
            v-model="formData.postTransition"
            placeholder="请输入后置变迁"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="库所类别" prop="placeType">
          <el-select v-model="formData.placeType" placeholder="请选择库所类别" style="width: 100%">
            <el-option label="输入库所" value="输入库所" />
            <el-option label="输出库所" value="输出库所" />
            <el-option label="缓冲库所" value="缓冲库所" />
            <el-option label="资源库所" value="资源库所" />
          </el-select>
        </el-form-item>

        <el-form-item label="赋时库所标志位" prop="timedPlaceFlag">
          <el-select v-model="formData.timedPlaceFlag" placeholder="请选择">
            <el-option label="true" :value="true" />
            <el-option label="false" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="加工位ID" prop="processStationId">
          <el-input
            v-model="formData.processStationId"
            placeholder="请输入加工位ID"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="阶段标志" prop="stageFlag">
          <el-input-number
            v-model="formData.stageFlag"
            placeholder="请输入阶段标志"
            style="width: 100%"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="库所颜色" prop="placeColor">
          <el-input
            v-model="formData.placeColor"
            placeholder="请输入库所颜色"
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
import { PlaceAPI } from "@/api/abb/place-api";
import type { Place, PlaceForm, PlaceQuery } from "@/api/abb/place-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<Place[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const drawerSize = ref("60%");

// 表单数据
const formData = ref<PlaceForm>({
  id: undefined,
  placeName: undefined,
  capacity: undefined,
  preTransition: undefined,
  postTransition: undefined,
  placeType: undefined,
  timedPlaceFlag: undefined,
  processStationId: undefined,
  stageFlag: undefined,
  placeColor: undefined,
});

// 对话框配置
const dialog = reactive({
  visible: false,
  title: "",
});

// 查询参数
const queryParams = reactive<PlaceQuery>({
  pageNum: 1,
  pageSize: 10,
  placeName: undefined,
  keywords: undefined,
  placeType: undefined,
  processStationId: undefined,
});

// 表单验证规则
const rules = {
  placeName: [
    { required: true, message: "库所名称不能为空", trigger: "blur" },
    { min: 1, max: 100, message: "库所名称长度在1-100个字符之间", trigger: "blur" },
  ],
  capacity: [
    { required: true, message: "容量不能为空", trigger: "blur" },
    {
      type: "number",
      min: 0,
      max: 999999,
      message: "容量必须为0-999999之间的数字",
      trigger: "blur",
    },
  ],
  placeType: [{ required: true, message: "库所类别不能为空", trigger: "change" }],
  timedPlaceFlag: [{ required: true, message: "赋时库所标志位不能为空", trigger: "change" }],
};

// 表单引用
const queryFormRef = ref();
const placeFormRef = ref();

// 获取库所分页列表
const fetchPlaceList = async () => {
  loading.value = true;
  try {
    const response = await PlaceAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchPlaceList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchPlaceList();
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
    const response = await PlaceAPI.getFormData(id);
    Object.assign(formData.value, response || {});
    dialog.title = "编辑库所";
  } else {
    // 新增
    formData.value = {
      id: undefined,
      placeName: undefined,
      capacity: undefined,
      preTransition: undefined,
      postTransition: undefined,
      placeType: undefined,
      timedPlaceFlag: undefined,
      processStationId: undefined,
      stageFlag: undefined,
      placeColor: undefined,
    };
    dialog.title = "新增库所";
  }
  dialog.visible = true;
};

// 关闭对话框
const handleCloseDialog = () => {
  dialog.visible = false;
  placeFormRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  await placeFormRef.value?.validate();

  if (formData.value.id) {
    // 更新
    await PlaceAPI.update(formData.value.id, formData.value);
    ElMessage.success("更新成功");
  } else {
    // 新增
    await PlaceAPI.create(formData.value);
    ElMessage.success("新增成功");
  }

  dialog.visible = false;
  fetchPlaceList();
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
    await PlaceAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchPlaceList();
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

    await PlaceAPI.import(formData);
    ElMessage.success("导入成功");
    fetchPlaceList(); // 重新加载数据
  } catch (error) {
    console.error("导入失败:", error);
    ElMessage.error("导入失败，请检查文件格式是否正确");
  }
};

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    const response = await PlaceAPI.downloadTemplate();

    // 从响应头中获取文件名
    const contentDisposition = response.headers["content-disposition"];
    let filename = "place导入模板.xlsx"; // 默认文件名

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
  fetchPlaceList();
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
