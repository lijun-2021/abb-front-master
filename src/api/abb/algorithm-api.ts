import request from "@/utils/request";

const ALGORITHM_BASE_URL = "/api/v1/algorithm";

/**
 * 算法数据对象
 */
export interface Algorithm {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * 预计完工时间
   */
  estimatedFinishTime?: string;

  /**
   * 调整次数
   */
  adjustCount?: number;

  /**
   * 立体仓预警位
   */
  warehouseWarningFlag?: string;

  /**
   * 壳体机器人利用率
   */
  shellRobotUtilization?: number;

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
 * 算法表单类型
 */
export interface AlgorithmForm {
  /** 主键ID */
  id?: number;
  /** 预计完工时间 */
  estimatedFinishTime?: string;
  /** 调整次数 */
  adjustCount?: number;
  /** 立体仓预警位 */
  warehouseWarningFlag?: string;
  /** 壳体机器人利用率 */
  shellRobotUtilization?: number;
}

/**
 * 算法分页查询参数
 */
export interface AlgorithmQuery extends PageQuery {
  /**
   * 预计完工时间
   */
  estimatedFinishTime?: string;

  /**
   * 调整次数
   */
  adjustCount?: number;

  /**
   * 立体仓预警位
   */
  warehouseWarningFlag?: string;

  /**
   * 壳体机器人利用率
   */
  shellRobotUtilization?: number;
}

export const AlgorithmAPI = {
  /**
   * 获取算法分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: AlgorithmQuery) {
    return request<any, PageResult<Algorithm[]>>({
      url: `${ALGORITHM_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取算法表单详情
   *
   * @param algorithmId 算法ID
   * @returns 算法表单详情
   */
  getFormData(algorithmId: number) {
    return request({
      url: `${ALGORITHM_BASE_URL}/${algorithmId}/form`,
      method: "get",
    });
  },

  /**
   * 添加算法
   *
   * @param data 算法表单数据
   */
  create(data: AlgorithmForm) {
    return request({
      url: `${ALGORITHM_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改算法
   *
   * @param id 算法ID
   * @param data 算法表单数据
   */
  update(id: number, data: AlgorithmForm) {
    return request({
      url: `${ALGORITHM_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除算法，多个以英文逗号(,)分割
   *
   * @param ids 算法ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${ALGORITHM_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取算法下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${ALGORITHM_BASE_URL}/options`,
      method: "get",
    });
  },
};
