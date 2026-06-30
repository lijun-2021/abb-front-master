import request from "@/utils/request";

const WORKPIECE_BASE_URL = "/api/v1/workpiece";

/**
 * 工件数据对象
 */
export interface Workpiece {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * SN
   */
  sn?: string;

  /**
   * 编号
   */
  code?: string;

  /**
   * 型号
   */
  model?: string;

  /**
   * 线束根数
   */
  harnessCount?: number;

  /**
   * 线束类型
   */
  harnessType?: string;

  /**
   * 端子类型
   */
  terminalType?: string;

  /**
   * 长度
   */
  length?: string;

  /**
   * 宽度
   */
  width?: string;

  /**
   * 高度
   */
  height?: string;

  /**
   * 加工流程
   */
  processFlow?: string;

  /**
   * 当前状态
   */
  currentStatus?: string;

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
 * 工件表单类型
 */
export interface WorkpieceForm {
  /** 主键ID */
  id?: number;
  /** SN */
  sn?: string;
  /** 编号 */
  code?: string;
  /** 型号 */
  model?: string;
  /** 线束根数 */
  harnessCount?: number;
  /** 线束类型 */
  harnessType?: string;
  /** 端子类型 */
  terminalType?: string;
  /** 长度 */
  length?: string;
  /** 宽度 */
  width?: string;
  /** 高度 */
  height?: string;
  /** 加工流程 */
  processFlow?: string;
  /** 当前状态 */
  currentStatus?: string;
}

/**
 * 工件分页查询参数
 */
export interface WorkpieceQuery {
  /**
   * 页码
   */
  pageNum: number;

  /**
   * 每页大小
   */
  pageSize: number;

  /**
   * SN
   */
  sn?: string;

  /**
   * 关键字（用于搜索）
   */
  keywords?: string;

  /**
   * 编号
   */
  code?: string;

  /**
   * 型号
   */
  model?: string;

  /**
   * 当前状态
   */
  currentStatus?: string;
}

export const WorkpieceAPI = {
  /**
   * 获取工件分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: WorkpieceQuery) {
    return request<any, PageResult<Workpiece[]>>({
      url: `${WORKPIECE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取工件表单详情
   *
   * @param workpieceId 工件ID
   * @returns 工件表单详情
   */
  getFormData(workpieceId: number) {
    return request({
      url: `${WORKPIECE_BASE_URL}/${workpieceId}/form`,
      method: "get",
    });
  },

  /**
   * 添加工件
   *
   * @param data 工件表单数据
   */
  create(data: WorkpieceForm) {
    return request({
      url: `${WORKPIECE_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改工件
   *
   * @param id 工件ID
   * @param data 工件表单数据
   */
  update(id: number, data: WorkpieceForm) {
    return request({
      url: `${WORKPIECE_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除工件，多个以英文逗号(,)分割
   *
   * @param ids 工件ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${WORKPIECE_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取工件下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${WORKPIECE_BASE_URL}/options`,
      method: "get",
    });
  },
};
