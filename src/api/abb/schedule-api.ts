import request from "@/utils/request";

/* ==========================================================
   一、 类型定义 (严格对齐后端)
========================================================== */

// 🌟 1. 更新主列表查询参数，加入高级搜索的字段
export interface ScheduleQuery {
  pageNum?: number;
  pageSize?: number;
  sortField?: "offlineTime";
  sortOrder?: "asc" | "desc";
  snCode?: string;
  productionLine?: string; // 🌟 新增：产线
  area?: string; // 🌟 新增：检测区域
  offlineTime?: string[] | null; // 🌟 新增：下线时间范围 (数组格式)
  functionEmpName?: string; // 🌟 新增：员工姓名
  functionStatus?: number | null; // 🌟 新增：功能检测状态
  fat?: number | null; // 🌟 新增：是否需要FAT
  snContract?: string; // 🌟 新增：SN合同名称
  functionStarttime?: string; // 功能检查开始时间
  functionEndtime?: string; // 功能检查结束时间
}

// 🌟 2. 更新列表记录结构，补充最新约定的字段
export interface ScheduleRecord {
  id: string; // 唯一ID，后端生成
  snCode: string; // 开关柜号
  snContract?: string; // 🌟 新增：SN合同号
  certification?: number; // 🌟 新增：挂证状态 (0-未挂证 1-挂证)
  productionLine: string; // 产线
  offlineTime: string; // 下线时间
  fat?: number; // 是否需要FAT 1需要 0不需要 null空
  fatBeginT?: string; // 🌟 新增：FAT开始时间
  fatEndT?: string; // 🌟 新增：FAT结束时间
  functionStatus: number; // 功能状态 0未分配 1已分配 2已完成
  area: string; // 区域
  functionEmpName?: string; // 功能员工姓名
  snHCode?: string; // 高压柜SN号
  snLCode?: string; // 低压柜SN号
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间

  // 字符串收纳
  [key: string]: any;
}

// 定义每个任务槽的数据结构
export interface TaskItem {
  snCode: string;
  status: number; // 任务状态 0未完成 1已完成 2已取消
}

// 🌟 3. 更新人员看板的数据结构
export interface WorkerBoardData {
  EmpId: string;
  EmpName: string; // 员工姓名（方便前端显示）
  empTeam?: string; // 🌟 新增：后端的组别字段
  amState?: number | null; // 上午考勤状态
  pmState?: number | null; // 下午考勤状态
  taskList: (TaskItem | null)[]; // 🌟 核心修改：明确告诉 TS 数组里允许有 null (空槽位)，彻底解决模板标红问题
  [key: string]: any; // 兜底属性
}

/* ==========================================================
   二、 接口请求函数 (更新了 URL 和请求方式)
========================================================== */

export function getScheduleList(params: ScheduleQuery) {
  return request({
    url: "/api/v1/fqc/switch-cabinets/page", // 调度列表
    method: "get",
    params,
  });
}

// 把参数名直接叫 query 或者 params（名字不重要，传过去的是整个对象就行）
export function getWorkerTasks(query?: any) {
  return request({
    url: "/api/v1/fqc/employee-tasks/page", // 你的真实路径，保持不变
    method: "get",
    params: query,
  });
}

// 🌟 4. 修改批量提交的类型，统一类型
export interface BatchUpdatePayload {
  ids: string[]; // 🌟 根据你上面 ScheduleRecord 的定义，id 是 string 类型，所以这里改成 string[] 更严谨
  functionEmpNames: string[];
  areas: string[];
}

// 批量提交的请求函数
export function batchUpdateScheduleAssign(data: BatchUpdatePayload) {
  return request({
    url: "/api/v1/fqc/switch-cabinets/batch-update", // URL
    method: "patch", // 请求方式
    data, // 请求数据
  });
}
