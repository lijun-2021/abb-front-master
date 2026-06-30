import request from "@/utils/request";

const WORKER_BASE_URL = "/api/v1/worker";

/**
 * 人员数据对象
 */
export interface Worker {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * 工人ID
   */
  workerCode?: string;

  /**
   * 性别，1-男，2-女
   */
  gender?: number;

  /**
   * 身高
   */
  height?: string;

  /**
   * 工龄
   */
  workYears?: string;

  /**
   * 熟练度/级别
   */
  skillLevel?: string;

  /**
   * 打卡开始时间
   */
  clockInTime?: string;

  /**
   * 打卡结束时间
   */
  clockOutTime?: string;

  /**
   * 所在加工位ID
   */
  processStationId?: string;

  /**
   * 排程工件ID序列
   */
  scheduledWorkpieceIds?: string;

  /**
   * 当前加工工件ID
   */
  currentWorkpieceId?: string;

  /**
   * 下一件加工工件ID
   */
  nextWorkpieceId?: string;
}

/**
 * 人员表单类型
 */
export interface WorkerForm {
  /** 主键ID */
  id?: number;
  /** 工人ID */
  workerCode?: string;
  /** 性别，1-男，2-女 */
  gender?: number;
  /** 身高 */
  height?: string;
  /** 工龄 */
  workYears?: string;
  /** 熟练度/级别 */
  skillLevel?: string;
  /** 打卡开始时间 */
  clockInTime?: string;
  /** 打卡结束时间 */
  clockOutTime?: string;
  /** 所在加工位ID */
  processStationId?: string;
  /** 排程工件ID序列 */
  scheduledWorkpieceIds?: string;
  /** 当前加工工件ID */
  currentWorkpieceId?: string;
  /** 下一件加工工件ID */
  nextWorkpieceId?: string;
}

/**
 * 人员分页查询参数
 */
export interface WorkerQuery {
  /**
   * 页码
   */
  pageNum: number;

  /**
   * 每页大小
   */
  pageSize: number;

  /**
   * 工人ID
   */
  workerCode?: string;

  /**
   * 关键字（用于搜索姓名或昵称）
   */
  keywords?: string;

  /**
   * 性别，1-男，2-女
   */
  gender?: number;

  /**
   * 熟练度/级别
   */
  skillLevel?: string;
}

export const WorkerAPI = {
  /**
   * 获取人员分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: WorkerQuery) {
    return request<any, PageResult<Worker[]>>({
      url: `${WORKER_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取人员表单详情
   *
   * @param workerId 人员ID
   * @returns 人员表单详情
   */
  getFormData(workerId: number) {
    return request({
      url: `${WORKER_BASE_URL}/${workerId}/form`,
      method: "get",
    });
  },

  /**
   * 添加人员
   *
   * @param data 人员表单数据
   */
  create(data: WorkerForm) {
    return request({
      url: `${WORKER_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改人员
   *
   * @param id 人员ID
   * @param data 人员表单数据
   */
  update(id: number, data: WorkerForm) {
    return request({
      url: `${WORKER_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除人员，多个以英文逗号(,)分割
   *
   * @param ids 人员ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${WORKER_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取人员下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${WORKER_BASE_URL}/options`,
      method: "get",
    });
  },
};
