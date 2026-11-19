import request from "@/utils/request";

const FUNCTION_OUTPUT_BASE_URL = "/api/v1/fqc/function-output";

export type EmployeeTeam = "A" | "B" | "C" | "D";

export interface FunctionOutputQuery {
  statDate: string;
  empName?: string;
  empTeam?: EmployeeTeam;
}

/** 员工功能检测产出，与后端交接协议保持一致。 */
export interface FunctionOutputEmployee {
  empId: string;
  empName: string;
  empTeam: EmployeeTeam;
  assignedCount: number;
  completedCount: number;
  incompleteCount: number;
}

/** 组别功能检测产出汇总。 */
export interface FunctionOutputTeam {
  empTeam: EmployeeTeam;
  assignedCount: number;
  completedCount: number;
  incompleteCount: number;
  employees: FunctionOutputEmployee[];
}

/**
 * 功能试验产出总览。
 *
 * 顶部的 fqcDailyInput、fqcFunctionTestOutput、updateTime 均为已有字段。
 */
export interface FunctionOutputOverview {
  statDate: string;
  fqcDailyInput: number;
  fqcFunctionTestOutput: number;
  updateTime: string;
  groups: FunctionOutputTeam[];
}

export const FunctionOutputAPI = {
  getOverview(params: FunctionOutputQuery) {
    return request<any, FunctionOutputOverview>({
      url: `${FUNCTION_OUTPUT_BASE_URL}/overview`,
      method: "get",
      params,
    });
  },
};
