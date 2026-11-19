import request from "@/utils/request";

const ATTENDANCE_BASE_URL = "/api/v1/fqc/attendance-records";

export interface AttendanceRecord {
  pageNum?: number;
  pageSize?: number;
  id: string;
  empId: string;
  empTeam: string;
  empName: string;
  amState: number;
  pmState: number;
  recordDate: string;
}

export interface AttendanceQuery {
  pageNum: number;
  pageSize: number;
  empId?: string;
  empTeam?: string;
  empName?: string;
  amState?: number;
  pmState?: number;
  recordDate?: string;
}

export interface AttendanceStateItem {
  empId: string;
  amState: number;
  pmState: number;
  recordDate?: string;
}

export interface AttendanceStatePayload {
  items: AttendanceStateItem[];
}

export interface AttendancePageResult {
  list: AttendanceRecord[];
  total: number;
}

export const AttendanceAPI = {
  getPage(params: AttendanceQuery) {
    return request<any, AttendancePageResult>({
      url: ATTENDANCE_BASE_URL,
      method: "get",
      params,
    });
  },

  updateState(data: AttendanceStatePayload) {
    return request({
      url: `${ATTENDANCE_BASE_URL}/state`,
      method: "patch",
      data,
    });
  },
};
