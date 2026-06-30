import request from "@/utils/request";

const TOKEN_BASE_URL = "/api/v1/token";

/**
 * Token数据对象
 */
export interface Token {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * token名称
   */
  tokenName?: string;

  /**
   * tokenID
   */
  tokenCode?: string;

  /**
   * 门板预装时间_预
   */
  doorPreinstallTime?: number;

  /**
   * 门板时间_预
   */
  doorTime?: number;

  /**
   * 网格预装时间_预
   */
  gridPreinstallTime?: number;

  /**
   * 网格时间_预
   */
  gridTime?: number;

  /**
   * 顶板时间_预
   */
  topPlateTime?: number;

  /**
   * 底板时间_预
   */
  bottomPlateTime?: number;

  /**
   * 壳体组装_预
   */
  shellAssemblyTime?: number;

  /**
   * 总成时间_预
   */
  totalAssemblyTime?: number;

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
 * Token表单类型
 */
export interface TokenForm {
  /** 主键ID */
  id?: number;
  /** token名称 */
  tokenName?: string;
  /** tokenID */
  tokenCode?: string;
  /** 门板预装时间_预 */
  doorPreinstallTime?: number;
  /** 门板时间_预 */
  doorTime?: number;
  /** 网格预装时间_预 */
  gridPreinstallTime?: number;
  /** 网格时间_预 */
  gridTime?: number;
  /** 顶板时间_预 */
  topPlateTime?: number;
  /** 底板时间_预 */
  bottomPlateTime?: number;
  /** 壳体组装_预 */
  shellAssemblyTime?: number;
  /** 总成时间_预 */
  totalAssemblyTime?: number;
}

/**
 * Token分页查询参数
 */
export interface TokenQuery {
  /**
   * 页码
   */
  pageNum: number;

  /**
   * 每页大小
   */
  pageSize: number;

  /**
   * token名称
   */
  tokenName?: string;

  /**
   * 关键字（用于搜索）
   */
  keywords?: string;

  /**
   * tokenID
   */
  tokenCode?: string;
}

export const TokenAPI = {
  /**
   * 获取Token分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: TokenQuery) {
    return request<any, PageResult<Token[]>>({
      url: `${TOKEN_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取Token表单详情
   *
   * @param tokenId TokenID
   * @returns Token表单详情
   */
  getFormData(tokenId: number) {
    return request({
      url: `${TOKEN_BASE_URL}/${tokenId}/form`,
      method: "get",
    });
  },

  /**
   * 添加Token
   *
   * @param data Token表单数据
   */
  create(data: TokenForm) {
    return request({
      url: `${TOKEN_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改Token
   *
   * @param id TokenID
   * @param data Token表单数据
   */
  update(id: number, data: TokenForm) {
    return request({
      url: `${TOKEN_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除Token，多个以英文逗号(,)分割
   *
   * @param ids TokenID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${TOKEN_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取Token下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${TOKEN_BASE_URL}/options`,
      method: "get",
    });
  },

  /**
   * 导入Token数据
   *
   * @param data FormData对象，包含Excel文件
   */
  import(data: FormData) {
    return request({
      url: `${TOKEN_BASE_URL}/import`,
      method: "post",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 下载Token导入模板
   */
  downloadTemplate() {
    return request({
      url: `${TOKEN_BASE_URL}/template`,
      method: "get",
      responseType: "blob",
    });
  },
};
