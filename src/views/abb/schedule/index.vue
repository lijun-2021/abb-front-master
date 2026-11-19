<template>
  <div style="width: 100%; height: 100%">
    <el-main class="main-content">
      <el-card class="search-card dashboard-card" shadow="never">
        <el-form :model="queryParams" label-width="90px" class="advanced-search-form">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="SN号" class="bold-label">
                <el-input
                  v-model="queryParams.snCode"
                  placeholder="请输入序列号"
                  clearable
                  prefix-icon="Search"
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="功能状态" class="bold-label">
                <el-select
                  v-model="queryParams.functionStatus"
                  placeholder="请选择状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="未完成" :value="0" />
                  <el-option label="进行中" :value="1" />
                  <el-option label="已完成" :value="2" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="员工姓名" class="bold-label">
                <el-input
                  v-model="queryParams.functionEmpName"
                  placeholder="请输入员工姓名"
                  clearable
                />
              </el-form-item>
            </el-col>

            <el-col v-show="isSearchExpand" :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="检测区域" class="bold-label">
                <el-select
                  v-model="queryParams.area"
                  placeholder="请选择区域"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="a in [
                      '500',
                      'K1',
                      'K2',
                      'A1',
                      'A2',
                      'A3',
                      'A4',
                      'A5',
                      'A6',
                      'A7',
                      'A8',
                      'A9',
                      'A10',
                      'A11',
                      'C1',
                      'C2',
                      'C3',
                      'C4',
                      'C5',
                      'D1',
                      'D2',
                      'D3',
                      'D4',
                    ]"
                    :key="a"
                    :label="a"
                    :value="a"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col v-show="isSearchExpand" :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="产线" class="bold-label">
                <el-input v-model="queryParams.productionLine" placeholder="请输入产线" clearable />
              </el-form-item>
            </el-col>

            <el-col v-show="isSearchExpand" :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="SN合同名称" class="bold-label">
                <el-input v-model="queryParams.snContract" placeholder="请输入合同名称" clearable />
              </el-form-item>
            </el-col>

            <el-col v-show="isSearchExpand" :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="需要FAT" class="bold-label">
                <el-select
                  v-model="queryParams.fat"
                  placeholder="请选择"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="是" :value="1" />
                  <el-option label="否" :value="0" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col v-show="isSearchExpand" :xs="24" :sm="24" :md="16" :lg="8">
              <el-form-item label="下线时间" class="bold-label">
                <el-date-picker
                  v-model="queryParams.offlineTime"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="YYYY-MM-DD"
                  clearable
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col v-show="isSearchExpand" :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="功能检测开始" class="bold-label">
                <el-date-picker
                  v-model="queryParams.functionStarttime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  clearable
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col v-show="isSearchExpand" :xs="24" :sm="12" :md="8" :lg="6">
              <el-form-item label="功能检测结束" class="bold-label">
                <el-date-picker
                  v-model="queryParams.functionEndtime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  clearable
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24" class="search-buttons-container">
              <el-form-item label-width="0">
                <el-button type="primary" icon="Search" class="abb-btn-danger" @click="handleQuery">
                  搜索
                </el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                <el-link
                  type="primary"
                  :icon="isSearchExpand ? 'ArrowUp' : 'ArrowDown'"
                  style="margin-left: 12px; font-size: 13px"
                  @click="isSearchExpand = !isSearchExpand"
                >
                  {{ isSearchExpand ? "收起高级筛选" : "展开高级筛选" }}
                </el-link>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <el-card class="table-card dashboard-card" shadow="never">
        <template #header>
          <div class="card-header abb-card-header">
            <span class="header-title">
              <i class="el-icon-list"></i>
              排程任务列表
            </span>

            <el-button
              type="primary"
              icon="Connection"
              :disabled="selectedRows.length === 0"
              class="batch-btn"
              @click="openBatchModal"
            >
              批量排程 {{ selectedRows.length > 0 ? `(已选 ${selectedRows.length} 台)` : "" }}
            </el-button>
          </div>
        </template>

        <el-table
          :data="tableData"
          border
          stripe
          style="width: 100%"
          row-key="snCode"
          class="abb-table"
          header-cell-class-name="abb-table-header"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
        >
          <el-table-column type="selection" width="55" align="center" fixed />

          <el-table-column type="expand">
            <template #default="scope">
              <div class="expand-detail">
                <div v-if="getNcrList(scope.row, 'h').length > 0" class="ncr-reason-box alert-box">
                  <el-alert
                    v-for="(ncr, index) in getNcrList(scope.row, 'h')"
                    :key="'h-' + index"
                    :title="`高压柜异常 ${index + 1} - 不合格原因：`"
                    type="error"
                    :description="ncr"
                    show-icon
                    :closable="false"
                    style="margin-bottom: 8px"
                  />
                </div>
                <div v-if="getNcrList(scope.row, 'l').length > 0" class="ncr-reason-box alert-box">
                  <el-alert
                    v-for="(ncr, index) in getNcrList(scope.row, 'l')"
                    :key="'l-' + index"
                    :title="`低压柜异常 ${index + 1} - 不合格原因：`"
                    type="error"
                    :description="ncr"
                    show-icon
                    :closable="false"
                    style="margin-bottom: 8px"
                  />
                </div>
                <div
                  v-if="
                    getNcrList(scope.row, 'h').length === 0 &&
                    getNcrList(scope.row, 'l').length === 0
                  "
                  class="empty-ncr"
                >
                  <el-alert
                    title="该柜无异常记录"
                    type="success"
                    show-icon
                    :closable="false"
                    plain
                  />
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="SN 编号" width="180" align="center" fixed>
            <template #default="scope">
              <span
                :style="{
                  color:
                    getNcrList(scope.row, 'h').length > 0 || getNcrList(scope.row, 'l').length > 0
                      ? '#f56c6c'
                      : '#67c23a',
                  fontWeight: 'bold',
                }"
              >
                {{ scope.row.snCode }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="snContract" label="合同名称" width="120" align="center" />

          <el-table-column label="挂证状态" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.certification === 1" type="success" effect="light">
                已挂证
              </el-tag>
              <el-tag v-else type="info" effect="plain">未挂证</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="productionLine" label="产线" width="100" align="center" />
          <el-table-column
            prop="offlineTime"
            label="耐压产出时间"
            width="160"
            align="center"
            sortable="custom"
            :sort-orders="['descending', 'ascending']"
          />

          <el-table-column label="FAT" width="80" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.fat === 1" type="success" effect="dark" size="small">
                是
              </el-tag>
              <el-tag v-else-if="scope.row.fat === 0" type="info" effect="plain" size="small">
                否
              </el-tag>
              <span v-else style="color: #909399">-</span>
            </template>
          </el-table-column>

          <el-table-column label="FAT 时间" width="150" align="center">
            <template #default="scope">
              <div v-if="scope.row.fatBeginT" style="font-size: 12px; line-height: 1.2">
                <div>{{ scope.row.fatBeginT }}</div>
                <div style="color: #909399">至</div>
                <div>{{ scope.row.fatEndT }}</div>
              </div>
              <span v-else style="color: #909399">-</span>
            </template>
          </el-table-column>

          <el-table-column label="功能状态" width="100" align="center">
            <template #default="scope">
              <span
                :class="[
                  'table-status-badge',
                  scope.row.functionStatus === 2
                    ? 'status-done'
                    : scope.row.functionStatus === 1
                      ? 'status-doing'
                      : 'status-todo',
                ]"
              >
                {{
                  scope.row.functionStatus === 2
                    ? "已完成"
                    : scope.row.functionStatus === 1
                      ? "进行中"
                      : "未开始"
                }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="功能检验区域" width="120" align="center">
            <template #default="scope">
              <el-select
                v-model="scope.row.area"
                size="small"
                placeholder="请选择"
                class="table-select"
                @change="(val) => handleAreaChange(scope.row, val)"
              >
                <el-option
                  v-for="a in ['500', 'K1', 'K2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6']"
                  :key="a"
                  :label="a"
                  :value="a"
                />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column label="功能检测员工" min-width="170" align="center">
            <template #default="scope">
              <div class="employee-cell">
                <el-input
                  v-model="scope.row.functionEmpName"
                  readonly
                  placeholder="双击分配人员"
                  class="click-input"
                  @dblclick="openModal(scope.row)"
                >
                  <template #suffix>
                    <el-icon class="el-input__icon"><User /></el-icon>
                  </template>
                </el-input>
                <el-button
                  v-if="scope.row.functionEmpName"
                  type="danger"
                  size="small"
                  class="delete-btn"
                  @click="removeEmployee(scope.row)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div
          class="pagination-container"
          style="display: flex; justify-content: flex-end; margin-top: 16px"
        >
          <el-pagination
            v-model:current-page="queryParams.pageNum"
            v-model:page-size="queryParams.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </el-main>

    <el-dialog
      v-model="dialogVisible"
      :title="isBatchMode ? '批量分配 - 人员任务调度看板' : '人员任务调度看板'"
      width="1100px"
      destroy-on-close
      class="abb-dialog"
    >
      <div class="group-filter-bar">
        <span class="filter-label">选择组别：</span>
        <el-radio-group
          v-model="workerQueryParams.empTeam"
          size="default"
          @change="handleGroupChange"
        >
          <el-radio-button label="">全部人员</el-radio-button>
          <el-radio-button label="A">A组</el-radio-button>
          <el-radio-button label="B">B组</el-radio-button>
          <el-radio-button label="C">C组</el-radio-button>
          <el-radio-button label="D">D组</el-radio-button>
        </el-radio-group>
      </div>

      <el-table
        :data="workerList"
        border
        class="worker-table"
        header-cell-class-name="abb-table-header"
      >
        <el-table-column label="员工姓名" width="130" align="center" fixed>
          <template #default="scope">
            <el-button
              type="primary"
              link
              class="worker-name-btn"
              :class="{ 'worker-name-disabled': !isWorkerOnDuty(scope.row) }"
              :disabled="!isWorkerOnDuty(scope.row)"
              @click="selectWorker(scope.row)"
            >
              <el-icon><Avatar /></el-icon>
              {{ scope.row.EmpName }}
            </el-button>
            <div v-if="scope.row.empTeam" class="worker-group-tag">{{ scope.row.empTeam }}组</div>
          </template>
        </el-table-column>

        <el-table-column label="上午考勤" width="110" align="center">
          <template #default="scope">
            <el-tag :type="getAttendanceStateMeta(scope.row.amState).type" effect="light">
              {{ getAttendanceStateMeta(scope.row.amState).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="下午考勤" width="110" align="center">
          <template #default="scope">
            <el-tag :type="getAttendanceStateMeta(scope.row.pmState).type" effect="light">
              {{ getAttendanceStateMeta(scope.row.pmState).label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="任务分配情况 (最多20个槽位)" min-width="600">
          <template #default="scope">
            <div class="task-slot-container">
              <div
                v-for="(task, index) in scope.row.taskList as any[]"
                :key="index"
                class="task-slot-wrapper"
              >
                <div
                  v-if="task"
                  :class="['modern-task-dot mini-dot', getTaskDotClass(task.status)]"
                  :title="task.snCode"
                >
                  <span class="sn-text">{{ task.snCode }}</span>
                </div>
                <div v-else class="empty-slot-mini" :title="`槽位 ${index + 1}`">
                  {{ index + 1 }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div
        class="pagination-container"
        style="display: flex; justify-content: flex-end; margin-top: 16px"
      >
        <el-pagination
          v-model:current-page="workerQueryParams.pageNum"
          v-model:page-size="workerQueryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          background
          layout="total, prev, pager, next"
          :total="workerTotal"
          @size-change="handleWorkerSizeChange"
          @current-change="handleWorkerCurrentChange"
        />
      </div>

      <template #footer>
        <div class="legend-bar-container">
          <span class="legend-title">状态图例：</span>
          <div class="legend-items">
            <span>
              <i class="dot-base done-solid"></i>
              已完成
            </span>
            <span>
              <i class="dot-base doing-solid"></i>
              进行中
            </span>
            <span>
              <i class="dot-base todo-solid"></i>
              未开始
            </span>
            <span>
              <i class="dot-base empty-solid"></i>
              无任务
            </span>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { User, Avatar, Close } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 假设这些方法已经在 api/abb/schedule-api 中定义
import { getScheduleList, getWorkerTasks, batchUpdateScheduleAssign } from "@/api/abb/schedule-api";

// 2. 🌟 新增一个响应式变量，用来控制展开/收起状态
const isSearchExpand = ref(false);

// 3. 🌟 扩展查询参数，严格对齐后端字段
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sortField: "offlineTime" as const,
  sortOrder: "desc" as "asc" | "desc",
  snCode: "", // SN号
  productionLine: "", // 产线
  area: "", // 检测区域
  offlineTime: null as string[] | null, // 下线时间范围（Element日期范围绑定为数组）
  functionEmpName: "", // 员工姓名
  functionStatus: null as number | null, // 功能检测状态 (0,1,2)
  fat: null as number | null, // 是否需要FAT (0,1)
  snContract: "", // SN合同号
  functionStarttime: "", // 功能检测开始时间
  functionEndtime: "", // 功能检测结束时间
});

// 4. 🌟 重置查询条件：把所有新增的字段全都恢复初始化
const resetQuery = () => {
  queryParams.snCode = "";
  queryParams.productionLine = "";
  queryParams.area = "";
  queryParams.offlineTime = null; // 日期重置为 null
  queryParams.functionEmpName = "";
  queryParams.functionStatus = null;
  queryParams.fat = null;
  queryParams.snContract = "";
  queryParams.functionStarttime = "";
  queryParams.functionEndtime = "";

  queryParams.pageNum = 1; // 重置页码
  fetchTableData(); // 重新触发查询刷新表格
};

const total = ref(0);

// 看板参数增加 empTeam
const workerQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  empTeam: "",
});
const workerTotal = ref(0);
const dialogVisible = ref(false);
const activeRow = ref<any>(null);

const selectedRows = ref<any[]>([]);
const isBatchMode = ref(false);

const getNcrList = (row: any, prefix: string) => {
  const targetPrefix = `${prefix}NcrDescription`;
  return Object.keys(row)
    .filter((key) => key.startsWith(targetPrefix))
    .sort((a, b) => {
      const numA = parseInt(a.replace(targetPrefix, "")) || 0;
      const numB = parseInt(b.replace(targetPrefix, "")) || 0;
      return numA - numB;
    })
    .map((key) => row[key])
    .filter((val) => val && String(val).trim() !== "");
};

const getTaskDotClass = (statusCode: number) => {
  if (statusCode === 2) return "task-done-solid";
  if (statusCode === 1) return "task-doing-solid";
  if (statusCode === 0) return "task-todo-solid";
  return "";
};

const tableData = ref<any[]>([]);
const workerList = ref<any[]>([]);

const attendanceStateOptions = [
  { value: 1, label: "在岗", type: "success" as const },
  { value: 2, label: "FAT", type: "primary" as const },
  { value: 3, label: "耐压", type: "warning" as const },
  { value: 4, label: "请假", type: "info" as const },
  { value: 5, label: "离职", type: "danger" as const },
];

const getAttendanceStateMeta = (state?: number | null) =>
  attendanceStateOptions.find((item) => item.value === state) || {
    label: "未知",
    type: "info" as const,
  };

const isWorkerOnDuty = (worker: any) => worker.amState === 1 || worker.pmState === 1;

const fetchTableData = async () => {
  try {
    const res: any = await getScheduleList({
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      sortField: queryParams.sortField,
      sortOrder: queryParams.sortOrder,
      snCode: queryParams.snCode || undefined,
      productionLine: queryParams.productionLine || undefined,
      area: queryParams.area || undefined,
      offlineTime: queryParams.offlineTime || undefined,
      functionEmpName: queryParams.functionEmpName || undefined,
      functionStatus: queryParams.functionStatus ?? undefined,
      fat: queryParams.fat ?? undefined,
      snContract: queryParams.snContract || undefined,
      functionStarttime: queryParams.functionStarttime || undefined,
      functionEndtime: queryParams.functionEndtime || undefined,
    });
    const list = res.list || res.data?.list || res.data?.rows || res.data || res;
    tableData.value = Array.isArray(list) ? list : [];
    total.value = res.total || res.data?.total || 0;
  } catch (error) {
    console.error("获取排程列表异常:", error);
  }
};

const fetchWorkerList = async () => {
  try {
    const res: any = await getWorkerTasks({
      pageNum: workerQueryParams.pageNum,
      pageSize: workerQueryParams.pageSize,
      empTeam: workerQueryParams.empTeam, // 传递组别参数给后端
    });

    let rawData = res.list || res.data?.list || res.data?.rows || res.data || res;
    if (!Array.isArray(rawData) && rawData.list) {
      rawData = rawData.list;
    }
    const workerArray = Array.isArray(rawData) ? rawData : [];
    workerTotal.value = res.total || res.data?.total || 0;

    workerList.value = workerArray.map((worker: any) => {
      const tasks = [];
      // 循环 20 次解析后端返回的 snCode1 到 snCode20
      for (let i = 1; i <= 20; i++) {
        const sn = worker[`snCode${i}`];
        if (sn) {
          const matchedRow = tableData.value.find((item) => item.snCode === sn);
          let taskStatus = 1;
          if (matchedRow) {
            if (matchedRow.functionStatus === 2) {
              taskStatus = 2;
            } else if (
              matchedRow.functionStatus === 1 ||
              (matchedRow.functionStatus === 0 && matchedRow.functionEmpName)
            ) {
              taskStatus = 1;
            } else {
              taskStatus = 0;
            }
          }
          tasks.push({ snCode: sn, status: taskStatus });
        } else {
          tasks.push(null);
        }
      }
      return {
        ...worker,
        EmpName: worker.empName,
        EmpId: worker.empId,
        empTeam: worker.empTeam, // 接住后端的组别
        amState: worker.amState,
        pmState: worker.pmState,
        taskList: tasks,
      };
    });
  } catch (error) {
    console.error("获取人员看板异常:", error);
  }
};

onMounted(() => {
  fetchTableData();
});

// 组别切换，重置页码并查询
const handleGroupChange = () => {
  workerQueryParams.pageNum = 1;
  fetchWorkerList();
};

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val;
};

const openModal = (row: any) => {
  isBatchMode.value = false;
  activeRow.value = row;
  fetchWorkerList();
  dialogVisible.value = true;
};

const openBatchModal = () => {
  isBatchMode.value = true;
  fetchWorkerList();
  dialogVisible.value = true;
};

// 统一的无感保存分配逻辑
const selectWorker = async (workerRow: any) => {
  if (!isWorkerOnDuty(workerRow)) {
    ElMessage.warning("该员工当前上午或下午不是在岗状态，无法排程");
    return;
  }
  const empName = workerRow.EmpName || workerRow.empName || "";

  if (isBatchMode.value) {
    const ids = selectedRows.value.map((r) => r.id);
    const names = selectedRows.value.map(() => empName);
    const areas = selectedRows.value.map((r) => r.area || "");

    try {
      await batchUpdateScheduleAssign({
        ids,
        functionEmpNames: names,
        areas,
      });
      ElMessage.success(`成功为 ${ids.length} 台设备批量分配员工：${empName}`);
      dialogVisible.value = false;
      fetchTableData();
    } catch {
      ElMessage.error("批量分配失败，请重试");
    }
  } else {
    if (!activeRow.value) return;
    const row = activeRow.value;
    const oldName = row.functionEmpName;
    row.functionEmpName = empName;

    try {
      await batchUpdateScheduleAssign({
        ids: [row.id],
        functionEmpNames: [row.functionEmpName],
        areas: [row.area || ""],
      });
      ElMessage.success(`设备 ${row.snCode} 成功分配给：${empName}`);
      dialogVisible.value = false;
    } catch {
      row.functionEmpName = oldName;
      ElMessage.error("分配失败，已回退数据");
    }
  }
};

// 无感删除分配
const removeEmployee = async (row: any) => {
  const oldName = row.functionEmpName;
  const oldArea = row.area;
  row.functionEmpName = "";
  row.area = "";

  try {
    await batchUpdateScheduleAssign({
      ids: [row.id],
      functionEmpNames: [""],
      areas: [""],
    });
    ElMessage.success("已清空该设备的人员和区域分配");
  } catch {
    row.functionEmpName = oldName;
    row.area = oldArea;
    ElMessage.error("清空失败，已回退数据");
  }
};

// 无感修改区域
const handleAreaChange = async (row: any, newVal: string) => {
  try {
    await batchUpdateScheduleAssign({
      ids: [row.id],
      functionEmpNames: [row.functionEmpName || ""],
      areas: [newVal],
    });
    ElMessage.success("区域更新成功");
  } catch {
    ElMessage.error("区域更新失败，正在刷新数据");
    fetchTableData();
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchTableData();
};

const handleSortChange = ({
  prop,
  order,
}: {
  prop: string;
  order: "ascending" | "descending" | null;
}) => {
  if (prop !== "offlineTime") return;
  queryParams.sortOrder = order === "ascending" ? "asc" : "desc";
  queryParams.pageNum = 1;
  fetchTableData();
};

const handleSizeChange = (newSize: number) => {
  queryParams.pageSize = newSize;
  fetchTableData();
};
const handleCurrentChange = (newPage: number) => {
  queryParams.pageNum = newPage;
  fetchTableData();
};
const handleWorkerSizeChange = (newSize: number) => {
  workerQueryParams.pageSize = newSize;
  fetchWorkerList();
};
const handleWorkerCurrentChange = (newPage: number) => {
  workerQueryParams.pageNum = newPage;
  fetchWorkerList();
};
</script>

<style scoped>
.main-content {
  min-height: calc(100vh - 64px);
  padding: 24px;
  background-color: #f4f6f9;
}
.dashboard-card {
  margin-bottom: 20px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s;
}
.dashboard-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1) !important;
}
.bold-label :deep(.el-form-item__label) {
  font-weight: bold;
  color: #303133;
}
.custom-input :deep(.el-input__wrapper) {
  padding-left: 15px;
  border-radius: 20px;
}
.abb-btn-danger {
  padding: 10px 20px;
  font-weight: bold;
  color: #fff;
  background-color: #ff0000;
  border-color: #ff0000;
  border-radius: 20px;
  transition: all 0.3s;
}
.abb-btn-danger:hover,
.abb-btn-danger:focus {
  background-color: #e60000;
  border-color: #e60000;
  opacity: 0.9;
  transform: translateY(-1px);
}
.abb-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}
.header-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.batch-btn {
  font-weight: bold;
  border-radius: 20px;
  transition: all 0.3s;
}
.batch-btn:disabled {
  opacity: 0.6;
}

.abb-table {
  overflow: hidden;
  border-radius: 8px;
}
:deep(.abb-table-header) {
  font-weight: bold;
  color: #606266;
  text-align: center;
  background-color: #f5f7fa !important;
}
:deep(.el-table__row) {
  transition: all 0.2s;
}
:deep(.el-table__row:hover > td) {
  background-color: #ecf5ff !important;
}
.expand-detail {
  padding: 15px 50px;
  background-color: #fafafa;
  border-radius: 4px;
}
.alert-box {
  margin: 5px 0;
}
.table-status-badge {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 12px;
}
.status-todo {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8);
}
.status-doing {
  color: #e6a23c;
  background-color: #fdf6ec;
  border: 1px solid #f5dab1;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8);
}
.status-done {
  color: #67c23a;
  background-color: #f0f9eb;
  border: 1px solid #c2e7b0;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8);
}
.table-select :deep(.el-input__wrapper) {
  border-radius: 15px;
}
.click-input :deep(.el-input__wrapper) {
  cursor: pointer;
  border-radius: 15px;
  transition: all 0.3s;
}
.click-input :deep(.el-input__wrapper):hover {
  background-color: #fff1f1;
  border-color: #ff0000;
}
.click-input :deep(.el-input__inner) {
  font-weight: bold;
  color: #ff0000;
  cursor: pointer;
}
.employee-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 4px;
  border-radius: 50%;
}
.delete-btn:hover {
  background-color: #ff4444;
  transform: scale(1.1);
}
:deep(.abb-dialog) {
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
:deep(.abb-dialog .el-dialog__header) {
  padding: 20px 25px;
  margin-right: 0;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}
:deep(.abb-dialog .el-dialog__title) {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}
.worker-table {
  margin: 10px 0;
}
.worker-name-btn {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
}
.worker-name-btn:hover {
  text-decoration: underline;
  transform: scale(1.05);
}
.worker-name-disabled,
.worker-name-disabled:hover {
  color: #f56c6c !important;
  text-decoration: none;
  cursor: not-allowed;
  transform: none;
}

/* 组别和 20槽位 样式 */
.group-filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 15px;
  margin-bottom: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
}
.filter-label {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}
.worker-group-tag {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
.task-slot-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 5px 0;
}
.task-slot-wrapper {
  display: inline-block;
}
.mini-dot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 28px;
  padding: 4px 8px;
  overflow: hidden;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
.mini-dot .sn-text {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
}
.mini-dot::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  content: "";
  background-image: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: translateX(-100%);
  transition: all 0.6s;
}
.mini-dot:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px) scale(1.03);
}
.mini-dot:hover::after {
  transform: translateX(100%);
}
.empty-slot-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 28px;
  font-size: 12px;
  font-weight: bold;
  color: #c0c4cc;
  background-color: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  transition: all 0.3s;
}
.empty-slot-mini:hover {
  color: #409eff;
  background-color: #ecf5ff;
  border-color: #a0cfff;
}

/* 状态色 */
.task-done-solid {
  background: linear-gradient(145deg, #67c23a, #58a531);
  border: none;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.15);
}
.task-doing-solid {
  background: linear-gradient(145deg, #e6a23c, #c98c33);
  border: none;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.15);
}
.task-todo-solid {
  background: linear-gradient(145deg, #f56c6c, #d65959);
  border: none;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.15);
}

.legend-bar-container {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 25px;
  background-color: #fafafa;
  border-top: 1px solid #dcdfe6;
}
.legend-title {
  font-size: 13px;
  font-weight: bold;
  color: #909399;
}
.legend-items {
  display: flex;
  gap: 18px;
  align-items: center;
  font-size: 13px;
  color: #606266;
}
.dot-base {
  position: relative;
  top: 1px;
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.done-solid {
  background-color: #67c23a;
  border: 1px solid #58a531;
}
.doing-solid {
  background-color: #e6a23c;
  border: 1px solid #c98c33;
}
.todo-solid {
  background-color: #f56c6c;
  border: 1px solid #d65959;
}
.empty-solid {
  background-color: #fafafa;
  border: 1px solid #dcdfe6;
}
</style>
