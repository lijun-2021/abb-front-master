<template>
  <main class="lab-page">
    <header>
      <h1>实验室排程</h1>
      <p>选择排程策略，查看算法分配结果。</p>
    </header>
    <section class="panel">
      <div class="toolbar">
        <label for="strategy">排程策略</label>
        <select id="strategy" v-model="strategy">
          <option>优先级优先</option>
          <option>交期优先</option>
          <option>最短工时优先</option>
        </select>
        <button @click="run">立即排程</button>
        <span class="demo">演示数据</span>
      </div>
      <div class="result-heading">
        <h2>排程结果</h2>
        <span v-if="result">
          共 {{ result.rows.length }} 个任务 · 预计 {{ time(result.makespan) }} 全部完成
        </span>
      </div>
      <p v-if="changed" class="notice" role="status">策略已修改，点击“立即排程”更新结果。</p>
      <div v-else-if="result" class="sr-only" role="status">
        排程完成，共 {{ result.rows.length }} 个任务。
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>序号</th>
              <th>任务编号</th>
              <th>任务名称</th>
              <th>优先级</th>
              <th>处理设备顺序</th>
              <th>开始时间</th>
              <th>完成时间</th>
              <th>交期状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in result?.rows ?? []" :key="row.id">
              <td>{{ index + 1 }}</td>
              <td>{{ row.id }}</td>
              <td>{{ row.product }}</td>
              <td>{{ row.priority }}</td>
              <td>{{ row.route }}</td>
              <td>{{ time(row.start) }}</td>
              <td>{{ time(row.end) }}</td>
              <td :class="{ late: row.late }">{{ row.late ? "交期风险" : "按期完成" }}</td>
            </tr>
            <tr v-if="!result">
              <td colspan="8" class="empty">暂无排程结果，点击“立即排程”生成。</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="footnote">
        处理设备顺序表示任务依次经过的设备。例如 K1 → A1 → C1：耐压检测 → 功能检测 → 验收。
      </p>
    </section>
    <section class="panel gantt-panel">
      <div class="result-heading">
        <h2>设备排程甘特图</h2>
        <span>每行一台设备，每个色块代表一道任务工序</span>
      </div>
      <p v-if="!result" class="chart-empty">点击“立即排程”后展示甘特图。</p>
      <template v-else>
        <div class="legend">
          <span>
            <i class="voltage" />
            耐压检测
          </span>
          <span>
            <i class="functional" />
            功能检测
          </span>
          <span>
            <i class="acceptance" />
            验收
          </span>
        </div>
        <div class="chart-scroll">
          <div class="chart">
            <div class="chart-axis">
              <span>设备 / 时间</span>
              <div class="axis-track">
                <span
                  v-for="tick in ticks"
                  :key="tick"
                  :style="{ left: `${(tick / horizon) * 100}%` }"
                >
                  {{ time(tick) }}
                </span>
              </div>
            </div>
            <div v-for="resource in resources" :key="resource.id" class="chart-row">
              <div class="device-label">
                <b>{{ resource.id }}</b>
                <span>{{ resource.stage === "FAT 验收" ? "验收" : resource.stage }}</span>
              </div>
              <div class="chart-track" :style="{ backgroundSize: `${(60 / horizon) * 100}% 100%` }">
                <button
                  v-for="op in result.operations.filter((item) => item.resource === resource.id)"
                  :key="`${op.orderId}-${op.resource}`"
                  class="task-bar"
                  :class="{
                    voltage: op.stage === '耐压检测',
                    functional: op.stage === '功能检测',
                    acceptance: op.stage === 'FAT 验收',
                  }"
                  :style="{
                    left: `${(op.start / horizon) * 100}%`,
                    width: `${((op.end - op.start) / horizon) * 100}%`,
                  }"
                  :title="operationLabel(op)"
                  :aria-label="operationLabel(op)"
                  :aria-pressed="selectedOperation === op"
                  @click="selectedOperation = op"
                >
                  {{ op.orderId }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <p class="chart-detail" aria-live="polite">
          {{
            selectedOperation
              ? operationLabel(selectedOperation)
              : "点击色块查看任务编号、设备、工序和起止时间。空白时段表示设备空闲。"
          }}
        </p>
      </template>
      <p class="footnote">
        演示任务从 08:00 开始，按工序顺序分配设备；同一设备不同时执行多个任务。
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { resources, schedule, type ScheduleResult, type Operation } from "./scheduler";

const strategy = ref("优先级优先");
const result = ref<ScheduleResult | null>(null);
const appliedStrategy = ref("");
const changed = computed(() => result.value && strategy.value !== appliedStrategy.value);
const selectedOperation = ref<Operation | null>(null);
const horizon = computed(() => Math.max(480, Math.ceil((result.value?.makespan ?? 0) / 60) * 60));
const ticks = computed(() => Array.from({ length: horizon.value / 60 + 1 }, (_, i) => i * 60));
function operationLabel(op: Operation) {
  return `${op.orderId} · ${op.resource} · ${op.stage} · ${time(op.start)}–${time(op.end)} · ${op.end - op.start} 分钟`;
}
function run() {
  result.value = schedule("全部产线", strategy.value);
  appliedStrategy.value = strategy.value;
  selectedOperation.value = null;
}
function time(minutes: number) {
  return `${String(8 + Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
onMounted(() => {
  document.title = "实验室排程";
});
</script>

<style scoped>
.lab-page {
  min-height: 100vh;
  padding: 40px max(24px, calc((100vw - 1200px) / 2));
  font:
    14px/1.5 "Microsoft YaHei",
    sans-serif;
  color: #303743;
  background: #f6f7f9;
}
.lab-page * {
  box-sizing: border-box;
}
header {
  margin-bottom: 24px;
}
h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}
header p {
  margin: 0;
  font-size: 13px;
  color: #858b95;
}
.panel {
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.toolbar {
  display: flex;
  gap: 14px;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #eef0f3;
}
select,
button {
  height: 36px;
  font: inherit;
  border-radius: 4px;
}
select {
  width: 180px;
  padding: 0 10px;
  color: #414955;
  background: white;
  border: 1px solid #d9dde4;
}
button {
  padding: 0 20px;
  color: white;
  cursor: pointer;
  background: #397be8;
  border: 0;
}
button:hover {
  background: #2866cb;
}
button:focus-visible,
select:focus-visible {
  outline: 2px solid #82acf1;
  outline-offset: 3px;
}
.demo {
  margin-left: auto;
  font-size: 12px;
  color: #949ba6;
}
.result-heading {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin: 23px 0 16px;
}
h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.result-heading span {
  font-size: 12px;
  color: #838b97;
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid #e8ebef;
  border-radius: 4px;
}
table {
  width: 100%;
  font-size: 13px;
  text-align: left;
  white-space: nowrap;
  border-collapse: collapse;
}
th {
  padding: 13px 16px;
  font-weight: 500;
  color: #616b79;
  background: #f6f8fa;
}
td {
  padding: 12px 16px;
  border-top: 1px solid #eef0f3;
}
tbody tr:hover {
  background: #fafbfd;
}
.empty {
  height: 230px;
  color: #929aa6;
  text-align: center;
}
.late {
  color: #c27825;
}
.footnote {
  margin: 16px 0 0;
  font-size: 12px;
  color: #949ba5;
}
.notice {
  padding: 10px 12px;
  font-size: 12px;
  color: #a4772e;
  background: #fff8eb;
  border-radius: 4px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.gantt-panel {
  margin-top: 24px;
}
.gantt-panel .result-heading {
  margin-top: 0;
}
.chart-empty {
  padding: 50px 12px;
  font-size: 13px;
  color: #929aa6;
  text-align: center;
}
.legend {
  display: flex;
  gap: 20px;
  margin: 18px 0;
  font-size: 12px;
  color: #727c8a;
}
.legend span {
  display: flex;
  gap: 7px;
  align-items: center;
}
.legend i {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.voltage {
  color: #315e97;
  background: #dbeafe;
}
.functional {
  color: #725299;
  background: #e9e2f8;
}
.acceptance {
  color: #386f5b;
  background: #d8eee6;
}
.chart-scroll {
  padding-right: 12px;
  overflow-x: auto;
  border: 1px solid #e8ebef;
  border-radius: 4px;
}
.chart {
  min-width: 900px;
}
.chart-axis,
.chart-row {
  display: grid;
  grid-template-columns: 140px 1fr;
}
.chart-axis {
  align-items: center;
  height: 42px;
  font-size: 11px;
  color: #7e8997;
}
.chart-axis > span {
  padding-left: 16px;
}
.device-label {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-left: 16px;
  font-size: 12px;
}
.device-label b {
  font-weight: 500;
}
.device-label span {
  font-size: 11px;
  color: #8a94a1;
}
.axis-track {
  position: relative;
  height: 18px;
}
.axis-track span {
  position: absolute;
  transform: translateX(-50%);
}
.axis-track span:first-child {
  transform: none;
}
.axis-track span:last-child {
  transform: translateX(-100%);
}
.chart-row {
  height: 46px;
  border-top: 1px solid #edf0f4;
}
.chart-track {
  position: relative;
  background-image: linear-gradient(to right, #edf0f4 1px, transparent 1px);
}
.task-bar {
  position: absolute;
  top: 10px;
  height: 26px;
  padding: 0 2px;
  overflow: hidden;
  font-size: 10px;
  white-space: nowrap;
  border: 1px solid white;
  border-radius: 4px;
}
.task-bar:hover {
  color: #273c58;
  background: #cbd9e9;
}
.task-bar[aria-pressed="true"] {
  outline: 2px solid #6688b2;
  outline-offset: -2px;
}
.chart-detail {
  padding: 12px;
  margin: 14px 0 0;
  font-size: 12px;
  color: #677587;
  background: #f6f8fb;
  border-radius: 4px;
}
@media (max-width: 600px) {
  .lab-page {
    padding: 24px 14px;
  }
  .panel {
    padding: 16px;
  }
  .toolbar {
    flex-wrap: wrap;
    gap: 10px;
  }
  select {
    width: 150px;
  }
  .demo {
    display: none;
  }
  .result-heading {
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
  }
  .footnote {
    line-height: 1.8;
  }
}
</style>
