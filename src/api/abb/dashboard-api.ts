import request from '@/utils/request'

/* ==========================================================
   一、 请求参数 
========================================================== */
export interface DashboardQuery {
  pageNum: number;       // 后端分页必传 (图表一般查第一页，给个大点的 pageSize 比如 100)
  pageSize: number;      
  createTimeStart?: string;    // 开始日期
  createTimeEnd?: string;      // 结束日期
  
}

/* ==========================================================
   二、 响应数据 ：按后端格式接收
========================================================== */
export interface DashboardRecord {
  fqcDailyInput: string;     //耐压产出数量        
  fqcDailyOutput: string;        //挂证数量    
  fqcWithstandUndistributed: string; //功能待分配数量
  fqcAllocated: string;  //功能已分配数量
  fqcFunctionTestOutput: string;      //功能试验产出数量        
  createTime: string; //  X 轴日期
}

export interface DashboardPageData {
  list: DashboardRecord[];
  total: number;
}

export interface DashboardResponse {
  code: string | number;
  msg: string;
  data: DashboardPageData;
}

/* ==========================================================
   三、 图表专用结构 (供你在 Vue 里渲染 ECharts 用)
========================================================== */
export interface DashboardChartData {
  dates: string[];                   
  fqcDailyInput: number[];           
  fqcDailyOutput: number[];          
  fqcWithstandUndistributed: number[]; 
  fqcAllocated: number[]; 
  fqcFunctionTestOutput: number[];
}

/* ==========================================================
   四、 API 请求
========================================================== */
export function getDashboardChartData(params: DashboardQuery) {
  return request({
    url: '/api/v1/fqc/display',
    method: 'get',
    params: params
  }) as unknown as Promise<DashboardResponse> // 返回 DashboardResponse 结构
}