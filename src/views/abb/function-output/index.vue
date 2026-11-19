<template>
  <div class="function-output-page">
    <header class="page-header">
      <h1>功能试验产出</h1>
    </header>

    <section class="summary-section" aria-label="功能试验产出汇总">
      <div class="summary-metrics">
        <div class="summary-metric">
          <span class="summary-metric__label">今日下线总数</span>
          <strong>{{ overview.fqcDailyInput }}</strong>
          <span class="summary-metric__unit">台</span>
        </div>
        <div class="summary-metric">
          <span class="summary-metric__label">功能产出总数</span>
          <strong>{{ overview.fqcFunctionTestOutput }}</strong>
          <span class="summary-metric__unit">台</span>
        </div>
      </div>

      <div class="refresh-area">
        <el-button
          class="abb-primary-button"
          :icon="Refresh"
          :loading="refreshing"
          @click="handleRefresh"
        >
          刷新数据
        </el-button>
        <span class="update-time">更新时间：{{ formattedUpdateTime }}</span>
      </div>
    </section>

    <section class="query-section" aria-label="查询条件">
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        :inline="true"
        label-position="left"
        @submit.prevent="handleQuery"
      >
        <el-form-item label="统计日期" prop="statDate">
          <el-date-picker
            v-model="queryParams.statDate"
            type="date"
            value-format="YYYY-MM-DD"
            :clearable="false"
            class="date-field"
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
        <el-form-item label="组别" prop="empTeam">
          <el-select
            v-model="queryParams.empTeam"
            placeholder="全部组别"
            clearable
            @change="handleTeamSelectChange"
          >
            <el-option v-for="team in TEAM_ORDER" :key="team" :label="`${team}组`" :value="team" />
          </el-select>
        </el-form-item>
        <el-form-item class="query-actions">
          <el-button
            native-type="submit"
            class="abb-primary-button query-button"
            :icon="Search"
            :loading="loading"
          >
            查询
          </el-button>
          <el-button :disabled="loading || refreshing" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section v-loading="loading" class="content-section" aria-label="组别与员工功能检测产出">
      <aside class="team-list" aria-label="员工组别">
        <button
          v-for="team in normalizedTeams"
          :key="team.empTeam"
          type="button"
          class="team-card"
          :class="{ 'is-active': activeTeam === team.empTeam }"
          :aria-expanded="activeTeam === team.empTeam"
          @click="handleTeamClick(team.empTeam)"
        >
          <span class="team-card__heading">
            <strong>{{ team.empTeam }}组</strong>
            <el-icon aria-hidden="true">
              <ArrowDown v-if="activeTeam === team.empTeam" />
              <ArrowRight v-else />
            </el-icon>
          </span>
          <span class="team-card__metrics">
            <span>
              <small>已分配</small>
              <b>{{ team.assignedCount }}</b>
              <em>台</em>
            </span>
            <span>
              <small>已完成</small>
              <b>{{ team.completedCount }}</b>
              <em>台</em>
            </span>
            <span>
              <small>未完成</small>
              <b>{{ team.incompleteCount }}</b>
              <em>台</em>
            </span>
          </span>
        </button>
      </aside>

      <div class="employee-panel">
        <el-table
          ref="employeeTableRef"
          :data="activeEmployees"
          row-key="empId"
          :expand-row-keys="expandedEmployeeIds"
          class="employee-table"
          empty-text="暂无符合条件的员工"
          @expand-change="handleExpandChange"
        >
          <el-table-column type="expand" width="50">
            <template #default="{ row }">
              <div class="employee-expanded" :aria-label="`${row.empName}功能检测统计`">
                <div>
                  <span>功能检测已分配台数</span>
                  <strong>{{ row.assignedCount }}</strong>
                  <em>台</em>
                </div>
                <div>
                  <span>功能检测已完成台数</span>
                  <strong>{{ row.completedCount }}</strong>
                  <em>台</em>
                </div>
                <div>
                  <span>功能检测未完成台数</span>
                  <strong>{{ row.incompleteCount }}</strong>
                  <em>台</em>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="员工姓名" min-width="150">
            <template #default="{ row }">
              <el-button link class="employee-name" @click="toggleEmployee(row)">
                {{ row.empName }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="组别" width="90" align="center">
            <template #default="{ row }">{{ row.empTeam }}组</template>
          </el-table-column>
          <el-table-column
            prop="assignedCount"
            label="功能检测已分配台数"
            min-width="180"
            align="center"
          >
            <template #default="{ row }">{{ row.assignedCount }}台</template>
          </el-table-column>
          <el-table-column
            prop="completedCount"
            label="功能检测已完成台数"
            min-width="180"
            align="center"
          >
            <template #default="{ row }">{{ row.completedCount }}台</template>
          </el-table-column>
          <el-table-column
            prop="incompleteCount"
            label="功能检测未完成台数"
            min-width="180"
            align="center"
          >
            <template #default="{ row }">{{ row.incompleteCount }}台</template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage, type FormInstance, type TableInstance } from "element-plus";
import { ArrowDown, ArrowRight, Refresh, Search } from "@element-plus/icons-vue";
import {
  FunctionOutputAPI,
  type EmployeeTeam,
  type FunctionOutputEmployee,
  type FunctionOutputOverview,
  type FunctionOutputTeam,
} from "@/api/abb/function-output-api";

defineOptions({ name: "FunctionOutput" });

const TEAM_ORDER: EmployeeTeam[] = ["A", "B", "C", "D"];

const formatToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createEmptyTeam = (empTeam: EmployeeTeam): FunctionOutputTeam => ({
  empTeam,
  assignedCount: 0,
  completedCount: 0,
  incompleteCount: 0,
  employees: [],
});

const createEmptyOverview = (): FunctionOutputOverview => ({
  statDate: formatToday(),
  fqcDailyInput: 0,
  fqcFunctionTestOutput: 0,
  updateTime: "",
  groups: TEAM_ORDER.map(createEmptyTeam),
});

const queryFormRef = ref<FormInstance>();
const employeeTableRef = ref<TableInstance>();
const loading = ref(false);
const refreshing = ref(false);
const activeTeam = ref<EmployeeTeam>("A");
const expandedEmployeeIds = ref<string[]>([]);
const overview = reactive<FunctionOutputOverview>(createEmptyOverview());
const queryParams = reactive<{ statDate: string; empName: string; empTeam?: EmployeeTeam }>({
  statDate: formatToday(),
  empName: "",
  empTeam: undefined,
});

const normalizedTeams = computed(() =>
  TEAM_ORDER.map((teamName) => {
    const team = overview.groups.find((item) => item.empTeam === teamName);
    return team || createEmptyTeam(teamName);
  })
);

const activeEmployees = computed(
  () => normalizedTeams.value.find((team) => team.empTeam === activeTeam.value)?.employees || []
);

const formattedUpdateTime = computed(() => {
  if (!overview.updateTime) return "--";
  return overview.updateTime.replace("T", " ").slice(0, 19);
});

const normalizeOverview = (data?: FunctionOutputOverview) => {
  const source = data || createEmptyOverview();
  overview.statDate = source.statDate || queryParams.statDate;
  overview.fqcDailyInput = Number(source.fqcDailyInput ?? 0);
  overview.fqcFunctionTestOutput = Number(source.fqcFunctionTestOutput ?? 0);
  overview.updateTime = source.updateTime || "";
  overview.groups = TEAM_ORDER.map((teamName) => {
    const team = source.groups?.find((item) => item.empTeam === teamName);
    if (!team) return createEmptyTeam(teamName);
    return {
      empTeam: teamName,
      assignedCount: Number(team.assignedCount ?? 0),
      completedCount: Number(team.completedCount ?? 0),
      incompleteCount: Number(team.incompleteCount ?? 0),
      employees: (team.employees || []).map((employee) => ({
        ...employee,
        assignedCount: Number(employee.assignedCount ?? 0),
        completedCount: Number(employee.completedCount ?? 0),
        incompleteCount: Number(employee.incompleteCount ?? 0),
      })),
    };
  });
};

const fetchOverview = async (kind: "query" | "refresh" = "query") => {
  const state = kind === "refresh" ? refreshing : loading;
  state.value = true;
  try {
    const data = await FunctionOutputAPI.getOverview({
      statDate: queryParams.statDate,
      empName: queryParams.empName.trim() || undefined,
      empTeam: queryParams.empTeam,
    });
    normalizeOverview(data);
    if (queryParams.empTeam) activeTeam.value = queryParams.empTeam;
    expandedEmployeeIds.value = expandedEmployeeIds.value.filter((id) =>
      activeEmployees.value.some((employee) => employee.empId === id)
    );
    if (kind === "refresh") ElMessage.success("数据已刷新");
  } finally {
    state.value = false;
  }
};

const handleQuery = () => fetchOverview("query");

const handleReset = async () => {
  queryParams.statDate = formatToday();
  queryParams.empName = "";
  queryParams.empTeam = undefined;
  activeTeam.value = "A";
  expandedEmployeeIds.value = [];
  queryFormRef.value?.clearValidate();
  await fetchOverview("query");
};

const handleRefresh = () => fetchOverview("refresh");

const handleTeamSelectChange = (team?: EmployeeTeam) => {
  if (team) activeTeam.value = team;
};

const handleTeamClick = async (team: EmployeeTeam) => {
  activeTeam.value = team;
  queryParams.empTeam = team;
  expandedEmployeeIds.value = [];
  await fetchOverview("query");
};

const handleExpandChange = (
  row: FunctionOutputEmployee,
  expandedRows: FunctionOutputEmployee[]
) => {
  expandedEmployeeIds.value = expandedRows.map((item) => item.empId);
};

const toggleEmployee = async (row: FunctionOutputEmployee) => {
  const isExpanded = expandedEmployeeIds.value.includes(row.empId);
  employeeTableRef.value?.toggleRowExpansion(row, !isExpanded);
  await nextTick();
};

onMounted(() => fetchOverview("query"));
</script>

<style scoped lang="scss">
.function-output-page {
  min-height: calc(100vh - 84px);
  padding: 20px 24px 28px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-page);
}

.page-header {
  padding-bottom: 18px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
    line-height: 1.35;
  }
}

.summary-section {
  display: flex;
  gap: 24px;
  align-items: stretch;
  justify-content: space-between;
  margin-bottom: 24px;
}

.summary-metrics {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, minmax(260px, 380px));
  gap: 20px;
}

.summary-metric {
  display: flex;
  align-items: baseline;
  min-height: 86px;
  padding: 18px 24px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;

  &__label {
    margin-right: auto;
    font-size: 18px;
    color: var(--el-text-color-regular);
  }

  strong {
    font-size: 38px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &__unit {
    margin-left: 8px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
}

.refresh-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 172px;
}

.abb-primary-button {
  --el-button-bg-color: #e30613;
  --el-button-border-color: #e30613;
  --el-button-hover-bg-color: #c80510;
  --el-button-hover-border-color: #c80510;
  --el-button-active-bg-color: #ad040e;
  --el-button-active-border-color: #ad040e;
  --el-button-text-color: #fff;
  min-height: 44px;
  padding-inline: 22px;
  font-size: 16px;
}

.update-time {
  margin-top: 10px;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}

.query-section {
  padding: 22px 24px 2px;
  margin-bottom: 20px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;

  :deep(.el-form) {
    display: flex;
    flex-wrap: wrap;
    gap: 0 28px;
  }

  :deep(.el-form-item) {
    margin-right: 0;
  }

  :deep(.el-form-item__label) {
    font-size: 16px;
  }

  :deep(.el-input),
  :deep(.el-select),
  :deep(.el-date-editor) {
    width: 220px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 40px;
  }

  :deep(.query-actions .el-button) {
    min-height: 44px;
  }
}

.query-actions {
  margin-left: auto;
}

.content-section {
  display: grid;
  grid-template-columns: minmax(280px, 368px) minmax(0, 1fr);
  gap: 20px;
  min-height: 706px;
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.team-card {
  position: relative;
  width: 100%;
  min-height: 166px;
  padding: 18px 20px;
  font: inherit;
  color: var(--el-text-color-primary);
  text-align: left;
  cursor: pointer;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }

  &.is-active {
    border-left: 4px solid #e30613;
  }

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;

    strong {
      font-size: 30px;
      font-weight: 600;
    }

    .el-icon {
      font-size: 20px;
    }
  }

  &__metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 18px;

    > span {
      min-width: 0;
    }

    small {
      display: block;
      margin-bottom: 4px;
      font-size: 15px;
      color: var(--el-text-color-secondary);
    }

    b {
      font-size: 28px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }

    em {
      margin-left: 3px;
      font-size: 12px;
      font-style: normal;
      color: var(--el-text-color-regular);
    }
  }
}

.employee-panel {
  overflow: hidden;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}

.employee-table {
  width: 100%;

  :deep(th.el-table__cell) {
    height: 84px;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }

  :deep(td.el-table__cell) {
    height: 88px;
    font-size: 16px;
  }

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
}

.employee-name {
  padding: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.employee-expanded {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  min-height: 132px;
  margin: 0 40px 16px;
  background: var(--el-fill-color-lighter);

  > div {
    padding: 30px 20px;
    text-align: center;
    border-right: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-right: 0;
    }
  }

  span {
    display: block;
    margin-bottom: 8px;
    font-size: 15px;
    color: var(--el-text-color-regular);
  }

  strong {
    font-size: 22px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  em {
    margin-left: 3px;
    font-size: 12px;
    font-style: normal;
    color: var(--el-text-color-regular);
  }
}

@media (max-width: 1100px) {
  .summary-section {
    align-items: flex-end;
  }

  .summary-metrics {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }

  .content-section {
    grid-template-columns: 1fr;
  }

  .team-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .function-output-page {
    padding: 16px;
  }

  .summary-section {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-metrics,
  .team-list {
    grid-template-columns: 1fr;
  }

  .refresh-area {
    align-items: stretch;
  }

  .update-time {
    text-align: right;
  }

  .query-section :deep(.el-form) {
    display: block;
  }

  .query-section :deep(.el-form-item),
  .query-section :deep(.el-input),
  .query-section :deep(.el-select),
  .query-section :deep(.el-date-editor) {
    width: 100%;
  }

  .query-actions {
    margin-left: 0;
  }

  .employee-panel {
    overflow-x: auto;
  }

  .employee-table {
    min-width: 850px;
  }
}
</style>
