import request from '@/utils/request'

/* ==========================================================
   一、 类型定义 (严格对齐后端)
========================================================== */

export interface ScheduleQuery {
  snCode?: string;
  pageNum?: number;
  pageSize?: number;
  // 预留字段...
}

/*export interface ScheduleRecord {
  id: number;               // 唯一ID，后端生成
  snCode: string;
  productionline: string;   //产线
  offlineTime: string;      
  functionStatus: number;   //功能状态 0未分配 1已分配 2已完成
  area: string;             
  functionEmpId: string; 
  functionEmpName?: string; // 功能员工姓名（方便前端显示）
  cabinetType: number;      // 柜子类型 1高压 2低压
  unqualifiedReason: string | null; // 不合格原因（文字）
}*/
export interface ScheduleRecord {
  id: string;               // 唯一ID，后端生成
  snCode: string;           // 开关柜号
  productionLine: string;   // 产线
  offlineTime: string;      // 下线时间
  fat?: number;      //是否需要FAT 1需要 0不需要 null空
  functionStatus: number;   // 功能状态 0未分配 1已分配 2已完成
  area: string;             // 区域
  functionEmpName?: string; // 功能员工姓名
  snHCode?: string;         // 高压柜SN号
  snLCode?: string;         // 低压柜SN号
  createTime?: string;      // 创建时间
  updateTime?: string;      // 更新时间
  
  // 字符串收纳
  [key: string]: any; 
}

export interface TaskItem {
  snCode: string;
  status: number; // 任务状态 0未完成 1已完成 2已取消
}

export interface WorkerBoardData {
  EmpId: string;         
  EmpName: string;       // 员工姓名（方便前端显示）
  taskList: TaskItem[];  // 任务列表
}

/* ==========================================================
   二、 接口请求函数 (更新了 URL 和请求方式)
========================================================== */

export function getScheduleList(params: ScheduleQuery) {
  return request({
    url: '/api/v1/fqc/switch-cabinets/page', // 调度列表
    method: 'get',
    params: params
  })
}

// 🌟 把参数名直接叫 query 或者 params（名字不重要，传过去的是整个对象就行）
export function getWorkerTasks(query?: any) {
  return request({
    url: '/api/v1/fqc/employee-tasks/page', // 你的真实路径，保持不变
    method: 'get',
    // 🌟 核心修改：直接把外面传进来的 query 对象扔给 params
    params: query 
  })
}

// 1. 定义批量提交的类型
export interface BatchUpdatePayload {
  ids: number[];
  functionEmpNames: string[];
  areas: string[];
}

// 2. 批量提交的请求函数
export function batchUpdateScheduleAssign(data: BatchUpdatePayload) {
  return request({
    
    url: '/api/v1/fqc/switch-cabinets/batch-update', // URL
    method: 'patch', // 请求方式
    data: data // 请求数据
  })
}