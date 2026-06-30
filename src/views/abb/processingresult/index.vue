<!-- C++算法处理结果管理 -->
<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="记录ID" prop="uploadDir">
          <el-input
            v-model="queryParams.uploadDir"
            placeholder="请输入记录ID"
            clearable
            @keyup.enter="handleQuery"
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
        <el-table-column label="记录ID" prop="uploadDir" min-width="200" align="center">
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="handleDownload(scope.row.uploadDir)">
              {{ scope.row.uploadDir }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="150" align="center" />
        <el-table-column label="操作" fixed="right" min-width="240">
          <template #default="scope">
            <el-button
              type="success"
              icon="timer"
              link
              size="small"
              @click="handleGanttChart(scope.row)"
            >
              甘特图
            </el-button>
            <el-button
              type="primary"
              icon="download"
              link
              size="small"
              @click="handleDownload(scope.row.uploadDir)"
            >
              下载
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
        @pagination="fetchProcessingResultList"
      />
    </el-card>
  </div>

  <!-- 甘特图对话框 -->
  <el-dialog v-model="ganttDialogVisible" title="机台甘特图" width="80%" center>
    <div ref="workpieceOrderRef" class="workpiece-order"></div>
    <div ref="ganttChartRef" class="gantt-chart-container"></div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="ganttDialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as echarts from "echarts";
import { ProcessingResultAPI } from "@/api/abb/processingresult-api";
import type {
  ProcessingResult,
  ProcessingResultQuery,
  GanttDataItem,
} from "@/api/abb/processingresult-api";

// 响应式数据
const loading = ref(false);
const total = ref(0);
const pageData = ref<ProcessingResult[]>([]);
const hasSelection = ref(false);
const selectionIds = ref<number[]>([]);
const ganttDialogVisible = ref(false);
const ganttChartRef = ref<HTMLElement | null>(null);
const workpieceOrderRef = ref<HTMLElement | null>(null);
let ganttChart: any = null;

// 查询参数
const queryParams = reactive<ProcessingResultQuery>({
  pageNum: 1,
  pageSize: 10,
  uploadDir: undefined,
});

// 表单引用
const queryFormRef = ref();

// 获取C++算法处理结果分页列表
const fetchProcessingResultList = async () => {
  loading.value = true;
  try {
    const response = await ProcessingResultAPI.getPage(queryParams);
    pageData.value = response.list || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  fetchProcessingResultList();
};

// 重置搜索
const handleResetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  fetchProcessingResultList();
};

// 选择行变化
const handleSelectionChange = (selection: any[]) => {
  selectionIds.value = selection.map((item) => item.id);
  hasSelection.value = selectionIds.value.length > 0;
};

// 下载文件
const handleDownload = async (uploadDir: string) => {
  if (!uploadDir) {
    ElMessage.error("文件目录不存在");
    return;
  }

  try {
    // 调用下载API
    const response = await ProcessingResultAPI.downloadFile(uploadDir);

    // 从响应头中获取文件名
    const contentDisposition = response.headers["content-disposition"];
    let filename = `${uploadDir}.zip`; // 默认文件名

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
      type: "application/zip",
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
    console.error("下载失败:", error);
    ElMessage.error("下载失败");
  }
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
    await ProcessingResultAPI.deleteByIds(idsStr);
    ElMessage.success("删除成功");
    fetchProcessingResultList();
  } catch {
    // 用户取消删除
  }
};

// 打开甘特图对话框
const handleGanttChart = (row: ProcessingResult) => {
  if (!row.uploadDir) {
    ElMessage.warning("记录ID不存在");
    return;
  }
  ganttDialogVisible.value = true;
  // 延迟执行，确保对话框已渲染
  setTimeout(async () => {
    await fetchGanttData(row.uploadDir!); // 使用非空断言，因为前面已经检查过
  }, 100);
};

// 获取甘特图数据
const fetchGanttData = async (uploadDir: string) => {
  try {
    const response = await ProcessingResultAPI.getGanttData(uploadDir);
    // 假设response是包含code、data、msg的结构
    const ganttData = response.data || response;
    renderGanttChart(ganttData);
  } catch (error) {
    console.error("获取甘特图数据失败:", error);
    ElMessage.error("获取甘特图数据失败");
  }
};

// 渲染甘特图
const renderGanttChart = (data: GanttDataItem[]) => {
  if (!ganttChartRef.value) return;

  // 销毁之前的图表实例
  if (ganttChart) {
    ganttChart.dispose();
  }

  // 创建图表实例
  ganttChart = echarts.init(ganttChartRef.value);

  // 处理数据：按workpieceId和transition类型分组
  const taskMap = new Map<string, { start?: number; end?: number; workpieceId: number }>();

  data.forEach((item) => {
    const key = `${item.workpieceId}`;
    if (!taskMap.has(key)) {
      taskMap.set(key, { workpieceId: item.workpieceId });
    }

    const task = taskMap.get(key)!;
    if (item.transition === "t0-1") {
      task.start = item.processTime;
    } else if (item.transition === "td0-1") {
      task.end = item.processTime;
    }
  });

  // 转换为图表所需的数据格式
  const chartData = Array.from(taskMap.values()).filter(
    (task) => task.start !== undefined && task.end !== undefined
  );

  // 按开始时间排序
  chartData.sort((a, b) => a.start! - b.start!);

  // 显示工件ID顺序
  if (workpieceOrderRef.value) {
    workpieceOrderRef.value.innerHTML = `
      <div class="workpiece-order-title">加工顺序(工件ID)</div>
      <div class="workpiece-order-list">
        ${chartData.map((task) => `<span class="workpiece-id">${task.workpieceId}</span>`).join("→")}
      </div>
    `;
  }

  // 计算最大时间值
  const maxTime = Math.max(...chartData.map((task) => task.end!));

  // 设置图表配置
  // 定义颜色数组，用于给不同工件分配不同颜色
  const colors = [
    "#5470c6",
    "#91cc75",
    "#fac858",
    "#ee6666",
    "#73c0de",
    "#3ba272",
    "#fc8452",
    "#9a60b4",
    "#ea7ccc",
  ];

  // 准备甘特图数据
  const ganttSeriesData = chartData.map((task, index) => ({
    value: [index, task.start!, task.end!], // [y轴位置, 开始时间, 结束时间]
    itemStyle: {
      color: colors[index % colors.length],
    },
    tooltip: {
      formatter: () => `工件ID: ${task.workpieceId}<br/>时间范围: ${task.start!}-${task.end!}s`,
    },
  }));

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    legend: {
      data: ["robot"],
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "10%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      name: "时间(s)",
      axisLabel: {
        formatter: "{value}s",
      },
      min: 0,
      max: maxTime + 5, // 给最大值留出一些空间
      splitLine: {
        show: true,
      },
    },
    yAxis: {
      type: "category",
      data: chartData.map((task) => `ID: ${task.workpieceId}`),
      axisLabel: {
        fontSize: 10,
      },
    },
    series: [
      {
        name: "robot",
        type: "custom",
        renderItem: (params: any, api: any) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.8;
          const rectShape = {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height,
          };
          return {
            type: "rect",
            shape: rectShape,
            style: api.style(),
            label: {
              show: true,
              position: "inside",
              formatter:
                api.value(2) - api.value(1) <= 20
                  ? `${api.value(1)}-${api.value(2)}`
                  : `ID:${chartData[categoryIndex].workpieceId}`,
              fontSize: 9,
              color: "#fff",
            },
          };
        },
        data: ganttSeriesData,
        coordinateSystem: "cartesian2d",
      },
    ],
  };

  // 渲染图表
  ganttChart.setOption(option);

  // 监听窗口大小变化，自适应图表
  window.addEventListener("resize", () => {
    ganttChart?.resize();
  });
};

// 监听对话框关闭事件，销毁图表
watch(
  () => ganttDialogVisible.value,
  (newVal) => {
    if (!newVal && ganttChart) {
      ganttChart.dispose();
      ganttChart = null;
    }
  }
);

// 初始化数据
onMounted(() => {
  fetchProcessingResultList();
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

/* 甘特图容器样式 */
.gantt-chart-container {
  width: 100%;
  height: 500px;
}

/* 工件顺序显示样式 */
.workpiece-order {
  padding: 10px;
  margin-bottom: 15px;
  text-align: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.workpiece-order-title {
  display: block;
  width: 100%;
  margin-bottom: 8px;
  font-weight: bold;
  color: #606266;
  text-align: center;
}

.workpiece-order-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workpiece-id {
  display: inline-block;
  padding: 4px 10px;
  font-size: 14px;
  color: #409eff;
  white-space: nowrap;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
}
</style>
