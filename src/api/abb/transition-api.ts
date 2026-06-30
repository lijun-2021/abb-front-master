import request from "@/utils/request";

const TRANSITION_BASE_URL = "/api/v1/transition";

/**
 * 变迁数据对象
 */
export interface Transition {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * 变迁名称
   */
  transitionName?: string;

  /**
   * 前置库所
   */
  prePlace?: string;

  /**
   * 后置库所
   */
  postPlace?: string;

  /**
   * place_check标志位
   */
  placeCheckFlag?: boolean;

  /**
   * place_lock标志位
   */
  placeLockFlag?: boolean;

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
 * 变迁表单类型
 */
export interface TransitionForm {
  /** 主键ID */
  id?: number;
  /** 变迁名称 */
  transitionName?: string;
  /** 前置库所 */
  prePlace?: string;
  /** 后置库所 */
  postPlace?: string;
  /** place_check标志位 */
  placeCheckFlag?: boolean;
  /** place_lock标志位 */
  placeLockFlag?: boolean;
}

/**
 * 变迁分页查询参数
 */
export interface TransitionQuery extends PageQuery {
  /**
   * 变迁名称
   */
  transitionName?: string;

  /**
   * 前置库所
   */
  prePlace?: string;

  /**
   * 后置库所
   */
  postPlace?: string;
}

export const TransitionAPI = {
  /**
   * 获取变迁分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: TransitionQuery) {
    return request<any, PageResult<Transition[]>>({
      url: `${TRANSITION_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取变迁表单详情
   *
   * @param transitionId 变迁ID
   * @returns 变迁表单详情
   */
  getFormData(transitionId: number) {
    return request({
      url: `${TRANSITION_BASE_URL}/${transitionId}/form`,
      method: "get",
    });
  },

  /**
   * 添加变迁
   *
   * @param data 变迁表单数据
   */
  create(data: TransitionForm) {
    return request({
      url: `${TRANSITION_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改变迁
   *
   * @param id 变迁ID
   * @param data 变迁表单数据
   */
  update(id: number, data: TransitionForm) {
    return request({
      url: `${TRANSITION_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除变迁，多个以英文逗号(,)分割
   *
   * @param ids 变迁ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${TRANSITION_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取变迁下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${TRANSITION_BASE_URL}/options`,
      method: "get",
    });
  },

  /**
   * 导入变迁数据
   *
   * @param data FormData对象，包含Excel文件
   */
  import(data: FormData) {
    return request({
      url: `${TRANSITION_BASE_URL}/import`,
      method: "post",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 下载变迁导入模板
   */
  downloadTemplate() {
    return request<Blob, any>({
      url: `${TRANSITION_BASE_URL}/template`,
      method: "get",
      responseType: "blob",
      headers: {
        Accept:
          "application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  },
};
