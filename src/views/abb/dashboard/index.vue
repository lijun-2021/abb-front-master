<template>
  <div class="dashboard-container">
    <el-card class="filter-card dashboard-card" shadow="never">
      <div class="filter-box">
        <span class="filter-label">查询日期：</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="custom-datepicker"
          @change="fetchData"
        />
        <el-button
          type="primary"
          class="search-btn abb-btn-danger"
          :loading="loading"
          @click="fetchData"
        >
          <el-icon style="margin-right: 5px"><Search /></el-icon>
          查询报表
        </el-button>
      </div>
    </el-card>

    <el-card v-loading="loading" class="chart-card dashboard-card" shadow="never">
      <template #header>
        <div class="chart-header">
          <span class="chart-title">加工实况</span>
          <span class="update-time">
            数据更新时间：{{ processingChartData.updateTime || "--" }}
          </span>
        </div>
      </template>
      <div ref="realtimeChartRef" style="width: 100%; height: 380px"></div>
    </el-card>

    <el-card class="chart-card dashboard-card" shadow="never">
      <div ref="chartRef" style="width: 100%; height: 550px"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, shallowRef } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";
// 🌟 引入你的 API 接口 (路径请根据实际情况确认)
import { getDashboardChartData } from "@/api/abb/dashboard-api";

const REALTIME_REFRESH_INTERVAL = 30 * 60 * 1000;

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultDateRange = (): [string, string] => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  return [formatDate(startDate), formatDate(endDate)];
};

// --- 1. 顶部查询逻辑 ---
// 默认查询最近 7 天，确保包含今天的数据
const dateRange = ref<[string, string]>(getDefaultDateRange());
const loading = ref(false);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 100, // 给个大数字保证查全
  createTimeStart: "",
  createTimeEnd: "",
});

// --- 2. 图表数据池 ---
const chartData = reactive({
  dates: [] as string[],
  fqcDailyInput: [] as number[], // 耐压产出总数 (仅用于 Tooltip)
  fqcWithstandUndistributed: [] as number[], // 功能未分配 (柱子1下半部分)
  fqcAllocated: [] as number[], // 功能已分配 (柱子1上半部分)
  fqcFunctionTestOutput: [] as number[], // 功能试验产出 (独立柱子2)
  fqcDailyOutput: [] as number[], // 挂证 (独立柱子3)
});

const processingChartData = reactive({
  dates: [] as string[],
  uncheckedTotal: [] as number[],
  fqcDailyInput: [] as number[],
  fqcFunctionTestOutput: [] as number[],
  uncertifiedTotal: [] as number[],
  updateTime: "",
});

const realtimeChartRef = ref<HTMLElement | null>(null);
const realtimeChartInstance = shallowRef<echarts.ECharts | null>(null);
let dashboardTimer: ReturnType<typeof setInterval> | undefined;

const renderRealtimeChart = () => {
  if (!realtimeChartRef.value) return;
  if (!realtimeChartInstance.value) {
    realtimeChartInstance.value = echarts.init(realtimeChartRef.value);
  }

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `${value} 台`,
    },
    legend: {
      bottom: "2%",
      data: ["未检总数", "今日下线", "功能完成", "未挂证数量"],
      textStyle: { fontSize: 13, fontWeight: "bold", color: "#606266" },
    },
    grid: { left: "4%", right: "4%", bottom: "15%", top: "12%", containLabel: true },
    xAxis: {
      type: "category",
      data: processingChartData.dates,
      axisTick: { alignWithLabel: true },
      axisLabel: { fontSize: 14, fontWeight: "bold", color: "#606266", margin: 12 },
      axisLine: { lineStyle: { color: "#dcdfe6" } },
    },
    yAxis: {
      type: "value",
      name: "开关柜数量 (台)",
      minInterval: 1,
      splitLine: { lineStyle: { type: "dashed", color: "#ebeef5" } },
      axisLabel: { fontWeight: "bold", color: "#606266" },
    },
    series: [
      {
        name: "未检总数",
        type: "bar",
        barMaxWidth: 45,
        itemStyle: { color: "#E6A23C", borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top", color: "#606266", fontWeight: "bold" },
        data: processingChartData.uncheckedTotal,
      },
      {
        name: "今日下线",
        type: "bar",
        barMaxWidth: 45,
        itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top", color: "#606266", fontWeight: "bold" },
        data: processingChartData.fqcDailyInput,
      },
      {
        name: "功能完成",
        type: "bar",
        barMaxWidth: 45,
        itemStyle: { color: "#67C23A", borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top", color: "#606266", fontWeight: "bold" },
        data: processingChartData.fqcFunctionTestOutput,
      },
      {
        name: "未挂证数量",
        type: "bar",
        barMaxWidth: 45,
        itemStyle: { color: "#F56C6C", borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: "top", color: "#606266", fontWeight: "bold" },
        data: processingChartData.uncertifiedTotal,
      },
    ],
  };

  realtimeChartInstance.value.setOption(option, true);
};

// --- 3. 获取数据并组装 ---
const fetchData = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return ElMessage.warning("请先选择查询日期范围");
  }

  queryParams.createTimeStart = dateRange.value[0];
  queryParams.createTimeEnd = dateRange.value[1];

  loading.value = true;
  try {
    const res: any = await getDashboardChartData(queryParams);

    // 暴力脱壳，获取数组
    const list = res.list || res.data?.list || res.data || res;

    if (!Array.isArray(list) || list.length === 0) {
      ElMessage.warning("这段时间内没有数据哦");
      processingChartData.updateTime = "";
      if (chartInstance.value) chartInstance.value.clear();
      if (realtimeChartInstance.value) realtimeChartInstance.value.clear();
      return;
    }

    // 数据反转，让日期正序排列
    const dataList = [...list].reverse();

    // 清空旧数据
    chartData.dates = [];
    chartData.fqcDailyInput = [];
    chartData.fqcWithstandUndistributed = [];
    chartData.fqcAllocated = [];
    chartData.fqcFunctionTestOutput = [];
    chartData.fqcDailyOutput = [];
    processingChartData.dates = [];
    processingChartData.uncheckedTotal = [];
    processingChartData.fqcDailyInput = [];
    processingChartData.fqcFunctionTestOutput = [];
    processingChartData.uncertifiedTotal = [];
    processingChartData.updateTime = "";

    // 拆解后端数据
    dataList.forEach((item) => {
      const dateStr =
        item.createTime.length > 10
          ? item.createTime.substring(5, 10)
          : item.createTime.substring(5);
      chartData.dates.push(dateStr);

      chartData.fqcDailyInput.push(Number(item.fqcDailyInput || 0));
      chartData.fqcWithstandUndistributed.push(Number(item.fqcWithstandUndistributed || 0));
      chartData.fqcAllocated.push(Number(item.fqcAllocated || 0));

      chartData.fqcFunctionTestOutput.push(Number(item.fqcFunctionTestOutput || 0));

      chartData.fqcDailyOutput.push(Number(item.fqcDailyOutput || 0));

      processingChartData.dates.push(dateStr);
      processingChartData.uncheckedTotal.push(Number(item.uncheckedTotal ?? 0));
      processingChartData.fqcDailyInput.push(Number(item.fqcDailyInput ?? 0));
      processingChartData.fqcFunctionTestOutput.push(Number(item.fqcFunctionTestOutput ?? 0));
      processingChartData.uncertifiedTotal.push(Number(item.uncertifiedTotal ?? 0));
      processingChartData.updateTime = item.updateTime || processingChartData.updateTime;
    });

    // 同一份历史数据同时渲染上下两张图表
    renderRealtimeChart();
    renderChart();
  } catch (error) {
    console.error("获取看板数据接口异常:", error);
  } finally {
    loading.value = false;
  }
};

// --- 4. ECharts 图表渲染逻辑 ---
const chartRef = ref<HTMLElement | null>(null);
const chartInstance = shallowRef<echarts.ECharts | null>(null);

const renderChart = () => {
  if (!chartRef.value) return;
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value);
  }

  const option: echarts.EChartsOption = {
    title: {
      text: "生产数据看板",
      left: "center",
      textStyle: { fontSize: 22, fontWeight: "bold", color: "#303133" },
      top: "10px",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#eee",
      borderWidth: 1,
      textStyle: { color: "#333" },
      formatter(params: any) {
        const dataIndex = params[0].dataIndex;
        const total = chartData.fqcDailyInput[dataIndex];

        let html = `<div style="font-size: 15px; font-weight: bold; margin-bottom: 8px; color: #303133; border-bottom: 1px solid #ebeef5; padding-bottom: 5px;">${params[0].axisValue} 数据详情</div>`;
        params.forEach((item: any) => {
          html += `<div style="margin: 4px 0; display: flex; justify-content: space-between; align-items: center;">
                     <span>${item.marker} ${item.seriesName}:</span> 
                     <span style="font-weight: bold; margin-left: 15px;">${item.data} 台</span>
                   </div>`;
        });
        html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #ebeef5; font-weight: bold; color: #ff0000; display: flex; justify-content: space-between; align-items: center;">
                   <span>📌 当日耐压产出总数:</span>
                   <span style="font-size: 15px;">${total} 台</span>
                 </div>`;
        return html;
      },
    },
    legend: {
      bottom: "2%",
      itemWidth: 14,
      itemHeight: 14,
      textStyle: { fontSize: 13, fontWeight: "bold", color: "#606266" },
      data: ["功能已分配", "功能待分配", "功能试验产出", "挂证"],
    },
    grid: { left: "4%", right: "4%", bottom: "12%", top: "15%", containLabel: true },
    xAxis: [
      {
        type: "category",
        data: chartData.dates,
        axisTick: { alignWithLabel: true },
        axisLabel: { fontSize: 13, fontWeight: "bold", color: "#606266", margin: 12 },
        axisLine: { lineStyle: { color: "#dcdfe6" } },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "开关柜数量 (台)",
        nameTextStyle: { fontWeight: "bold", color: "#909399", padding: [0, 0, 0, 20] },
        minInterval: 1,
        splitLine: { lineStyle: { type: "dashed", color: "#ebeef5" } },
        axisLabel: { fontWeight: "bold", color: "#606266" },
      },
    ],
    series: [
      {
        name: "功能已分配",
        type: "bar",
        stack: "Total", // 🌟 堆叠标识
        barMaxWidth: 45,
        itemStyle: { color: "#F56C6C", borderRadius: [0, 0, 4, 4] }, // 红色，底部圆角
        label: {
          show: true,
          position: "inside",
          color: "#fff",
          fontWeight: "bold",
          formatter: (params: any) => (Number(params.value) > 0 ? params.value : ""),
        },
        data: chartData.fqcWithstandUndistributed,
      },
      {
        name: "功能待分配",
        type: "bar",
        stack: "Total", // 🌟 堆叠标识，和上面拼成一根柱子
        barMaxWidth: 45,
        itemStyle: { color: "#E6A23C", borderRadius: [4, 4, 0, 0] }, // 橙黄，顶部圆角
        label: {
          show: true,
          position: "inside",
          color: "#7a4b00",
          fontWeight: "bold",
          formatter: (params: any) => (Number(params.value) > 0 ? params.value : ""),
        },
        data: chartData.fqcAllocated,
      },
      {
        name: "功能试验产出",
        type: "bar",
        barMaxWidth: 45,
        itemStyle: { color: "#67C23A", borderRadius: [4, 4, 0, 0] }, // 绿色，独立柱子
        label: { show: true, position: "top", color: "#606266", fontWeight: "bold" },
        data: chartData.fqcFunctionTestOutput,
      },
      {
        name: "挂证",
        type: "bar",
        barMaxWidth: 45,
        itemStyle: { color: "#409EFF", borderRadius: [4, 4, 0, 0] }, // 蓝色，独立柱子
        label: { show: true, position: "top", color: "#606266", fontWeight: "bold" },
        data: chartData.fqcDailyOutput,
      },
    ],
  };

  chartInstance.value.setOption(option);
};

const handleResize = () => {
  chartInstance.value?.resize();
  realtimeChartInstance.value?.resize();
};

const dateRangeIncludesToday = () => {
  if (!dateRange.value || dateRange.value.length !== 2) return false;
  const today = formatDate(new Date());
  return dateRange.value[0] <= today && dateRange.value[1] >= today;
};

onMounted(() => {
  fetchData();
  dashboardTimer = setInterval(() => {
    if (dateRangeIncludesToday()) fetchData();
  }, REALTIME_REFRESH_INTERVAL);
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (dashboardTimer) clearInterval(dashboardTimer);
  window.removeEventListener("resize", handleResize);
  chartInstance.value?.dispose();
  realtimeChartInstance.value?.dispose();
});
</script>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 64px);
  padding: 24px;
  background-color: #f4f6f9;
}

/* 卡片美化 */
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

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.update-time {
  font-size: 13px;
  color: #909399;
}

/* 搜索区布局 */
.filter-box {
  display: flex;
  align-items: center;
  padding: 5px 0;
}
.filter-label {
  margin-right: 15px;
  font-size: 15px;
  font-weight: bold;
  color: #303133;
}

/* 按钮和输入框美化 */
.custom-datepicker :deep(.el-input__wrapper) {
  border-radius: 20px;
}
.search-btn {
  padding: 10px 25px;
  margin-left: 20px;
  font-weight: bold;
  letter-spacing: 1px;
  border-radius: 20px;
}

/* ABB 红色风格 */
.abb-btn-danger {
  color: #fff;
  background-color: #ff0000;
  border-color: #ff0000;
  transition: all 0.3s;
}
.abb-btn-danger:hover,
.abb-btn-danger:focus {
  background-color: #e60000;
  border-color: #e60000;
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.2);
  opacity: 0.9;
  transform: translateY(-1px);
}
</style>
