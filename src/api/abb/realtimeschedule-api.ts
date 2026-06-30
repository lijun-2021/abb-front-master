import request from "@/utils/request";

const REALTIME_SCHEDULE_BASE_URL = "/api/v1/realtimeschedule";

/**
 * 实时调度数据对象
 */
export interface RealtimeSchedule {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * 故障编号
   */
  faultCode?: string;

  /**
   * 故障信息
   */
  faultInfo?: string;

  /**
   * 故障类型
   */
  faultType?: string;

  /**
   * 故障状态
   */
  faultStatus?: string;

  /**
   * 超时数量
   */
  timeoutCount?: number;

  /**
   * 超时工件ID
   */
  timeoutWorkpieceId?: string;

  /**
   * 超时工人ID
   */
  timeoutWorkerId?: string;

  /**
   * 超时比例
   */
  timeoutRatio?: number;

  /**
   * 创建人ID
   */
  createBy?: number;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新人ID
   */
  updateBy?: number;

  /**
   * 更新时间
   */
  updateTime?: string;

  /**
   * 是否删除（0: 未删除, 1: 已删除）
   */
  isDeleted?: number;
}

/**
 * 实时调度表单类型
 */
export interface RealtimeScheduleForm {
  /** 主键ID */
  id?: number;
  /** 故障编号 */
  faultCode?: string;
  /** 故障信息 */
  faultInfo?: string;
  /** 故障类型 */
  faultType?: string;
  /** 故障状态 */
  faultStatus?: string;
  /** 超时数量 */
  timeoutCount?: number;
  /** 超时工件ID */
  timeoutWorkpieceId?: string;
  /** 超时工人ID */
  timeoutWorkerId?: string;
  /** 超时比例 */
  timeoutRatio?: number;
}

/**
 * 实时调度分页查询参数
 */
export interface RealtimeScheduleQuery extends PageQuery {
  /**
   * 故障编号
   */
  faultCode?: string;

  /**
   * 故障类型
   */
  faultType?: string;

  /**
   * 故障状态
   */
  faultStatus?: string;

  /**
   * 超时工件ID
   */
  timeoutWorkpieceId?: string;

  /**
   * 超时工人ID
   */
  timeoutWorkerId?: string;
}

export const RealtimeScheduleAPI = {
  /**
   * 获取实时调度分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: RealtimeScheduleQuery) {
    return request<any, PageResult<RealtimeSchedule[]>>({
      url: `${REALTIME_SCHEDULE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取实时调度表单详情
   *
   * @param realtimeScheduleId 实时调度ID
   * @returns 实时调度表单详情
   */
  getFormData(realtimeScheduleId: number) {
    return request({
      url: `${REALTIME_SCHEDULE_BASE_URL}/${realtimeScheduleId}/form`,
      method: "get",
    });
  },

  /**
   * 添加实时调度
   *
   * @param data 实时调度表单数据
   */
  create(data: RealtimeScheduleForm) {
    return request({
      url: `${REALTIME_SCHEDULE_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改实时调度
   *
   * @param id 实时调度ID
   * @param data 实时调度表单数据
   */
  update(id: number, data: RealtimeScheduleForm) {
    return request({
      url: `${REALTIME_SCHEDULE_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除实时调度，多个以英文逗号(,)分割
   *
   * @param ids 实时调度ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${REALTIME_SCHEDULE_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取实时调度下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${REALTIME_SCHEDULE_BASE_URL}/options`,
      method: "get",
    });
  },
};
