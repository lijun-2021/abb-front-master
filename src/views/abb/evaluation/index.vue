<template>
  <div class="app-container attendance-page">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="员工编号" prop="empId">
          <el-input
            v-model="queryParams.empId"
            placeholder="请输入员工编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="员工姓名" prop="empName">
          <el-input
            v-model="queryParams.empName"
            placeholder="请输入员工姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="员工组别" prop="empTeam">
          <el-select
            v-model="queryParams.empTeam"
            placeholder="全部组别"
            clearable
            style="width: 130px"
          >
            <el-option v-for="team in teams" :key="team" :label="`${team}组`" :value="team" />
          </el-select>
        </el-form-item>
        <el-form-item label="上午状态" prop="amState">
          <el-select
            v-model="queryParams.amState"
            placeholder="全部状态"
            clearable
            style="width: 130px"
          >
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下午状态" prop="pmState">
          <el-select
            v-model="queryParams.pmState"
            placeholder="全部状态"
            clearable
            style="width: 130px"
          >
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考勤日期" prop="recordDate">
          <el-date-picker
            v-model="queryParams.recordDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="默认当天"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="primary" :disabled="selectedRows.length === 0" @click="openBatchDialog">
            批量修改状态
          </el-button>
          <span class="selection-tip">已选择 {{ selectedRows.length }} 人</span>
        </div>
        <el-button icon="Refresh" :loading="loading" @click="fetchAttendanceList">刷新</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="pageData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="员工编号" prop="empId" min-width="130" align="center" />
        <el-table-column label="员工姓名" prop="empName" min-width="120" align="center" />
        <el-table-column label="组别" prop="empTeam" width="90" align="center">
          <template #default="{ row }">{{ row.empTeam ? `${row.empTeam}组` : "-" }}</template>
        </el-table-column>
        <el-table-column label="上午状态" prop="amState" min-width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStateMeta(row.amState).type" effect="light">
              {{ getStateMeta(row.amState).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下午状态" prop="pmState" min-width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStateMeta(row.pmState).type" effect="light">
              {{ getStateMeta(row.pmState).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="考勤日期" prop="recordDate" min-width="125" align="center" />
        <el-table-column label="操作" fixed="right" width="130" align="center">
          <template #default="{ row }">
            <el-button type="primary" link icon="Edit" @click="openSingleDialog(row)">
              修改状态
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchAttendanceList"
      />
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="420px"
      append-to-body
      @closed="editAmState = undefined"
    >
      <el-alert
        v-if="dialog.rows.length > 1"
        :title="`将统一修改已选中的 ${dialog.rows.length} 名员工`"
        type="info"
        show-icon
        :closable="false"
      />
      <el-form label-width="90px" class="state-form">
        <el-form-item label="考勤日期">
          <el-date-picker
            v-model="editDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="上午状态" required>
          <el-select v-model="editAmState" placeholder="请选择上午状态" style="width: 100%">
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下午状态" required>
          <el-select v-model="editPmState" placeholder="请选择下午状态" style="width: 100%">
            <el-option
              v-for="item in stateOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveState">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { AttendanceAPI } from "@/api/abb/evaluation-api";
import type { AttendanceQuery, AttendanceRecord } from "@/api/abb/evaluation-api";

const teams = ["A", "B", "C", "D"];
const stateOptions = [
  { value: 1, label: "在岗", type: "success" as const },
  { value: 2, label: "FAT", type: "primary" as const },
  { value: 3, label: "耐压", type: "warning" as const },
  { value: 4, label: "请假", type: "info" as const },
  { value: 5, label: "离职", type: "danger" as const },
];

const queryFormRef = ref();
const loading = ref(false);
const saving = ref(false);
const total = ref(0);
const pageData = ref<AttendanceRecord[]>([]);
const selectedRows = ref<AttendanceRecord[]>([]);
const editAmState = ref<number>();
const editPmState = ref<number>();
const editDate = ref("");
const queryParams = reactive<AttendanceQuery>({ pageNum: 1, pageSize: 10, recordDate: "" });
const dialog = reactive({ visible: false, title: "", rows: [] as AttendanceRecord[] });

const getStateMeta = (state: number) =>
  stateOptions.find((item) => item.value === state) || { label: "未知", type: "info" as const };

const fetchAttendanceList = async () => {
  loading.value = true;
  try {
    const response = await AttendanceAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchAttendanceList();
};
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchAttendanceList();
};
const handleSelectionChange = (rows: AttendanceRecord[]) => {
  selectedRows.value = rows;
};

const openSingleDialog = (row: AttendanceRecord) => {
  dialog.rows = [row];
  dialog.title = `修改 ${row.empName} 的考勤状态`;
  editAmState.value = row.amState;
  editPmState.value = row.pmState;
  editDate.value = row.recordDate;
  dialog.visible = true;
};

const openBatchDialog = () => {
  dialog.rows = [...selectedRows.value];
  dialog.title = "批量修改考勤状态";
  editAmState.value = undefined;
  editPmState.value = undefined;
  editDate.value = queryParams.recordDate || "";
  dialog.visible = true;
};

const handleSaveState = async () => {
  if (!editAmState.value || !editPmState.value)
    return ElMessage.warning("请完整选择上午和下午状态");
  saving.value = true;
  try {
    await AttendanceAPI.updateState({
      items: dialog.rows.map((row) => ({
        empId: row.empId,
        amState: editAmState.value!,
        pmState: editPmState.value!,
        recordDate: editDate.value || undefined,
      })),
    });
    ElMessage.success(dialog.rows.length > 1 ? "批量修改成功" : "状态修改成功");
    dialog.visible = false;
    selectedRows.value = [];
    await fetchAttendanceList();
  } finally {
    saving.value = false;
  }
};

onMounted(fetchAttendanceList);
</script>

<style scoped>
.attendance-page {
  min-width: 0;
}
.data-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.data-table__toolbar--actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.selection-tip {
  font-size: 13px;
  color: #909399;
}
.state-form {
  margin-top: 22px;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
</style>
