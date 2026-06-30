import request from "@/utils/request";

const PLACE_BASE_URL = "/api/v1/place";

/**
 * 库所数据对象
 */
export interface Place {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * 库所名称
   */
  placeName?: string;

  /**
   * 容量
   */
  capacity?: number;

  /**
   * 前置变迁
   */
  preTransition?: string;

  /**
   * 后置变迁
   */
  postTransition?: string;

  /**
   * 库所类别
   */
  placeType?: string;

  /**
   * 赋时库所标志位
   */
  timedPlaceFlag?: boolean;

  /**
   * 对应加工位ID
   */
  processStationId?: string;

  /**
   * 阶段标志
   */
  stageFlag?: number;

  /**
   * 库所颜色
   */
  placeColor?: string;

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
 * 库所表单类型
 */
export interface PlaceForm {
  /** 主键ID */
  id?: number;
  /** 库所名称 */
  placeName?: string;
  /** 容量 */
  capacity?: number;
  /** 前置变迁 */
  preTransition?: string;
  /** 后置变迁 */
  postTransition?: string;
  /** 库所类别 */
  placeType?: string;
  /** 赋时库所标志位 */
  timedPlaceFlag?: boolean;
  /** 对应加工位ID */
  processStationId?: string;
  /** 阶段标志 */
  stageFlag?: number;
  /** 库所颜色 */
  placeColor?: string;
}

/**
 * 库所分页查询参数
 */
export interface PlaceQuery {
  /**
   * 页码
   */
  pageNum: number;

  /**
   * 每页大小
   */
  pageSize: number;

  /**
   * 库所名称
   */
  placeName?: string;

  /**
   * 关键字（用于搜索）
   */
  keywords?: string;

  /**
   * 库所类别
   */
  placeType?: string;

  /**
   * 对应加工位ID
   */
  processStationId?: string;
}

export const PlaceAPI = {
  /**
   * 获取库所分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: PlaceQuery) {
    return request<any, PageResult<Place[]>>({
      url: `${PLACE_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取库所表单详情
   *
   * @param placeId 库所ID
   * @returns 库所表单详情
   */
  getFormData(placeId: number) {
    return request({
      url: `${PLACE_BASE_URL}/${placeId}/form`,
      method: "get",
    });
  },

  /**
   * 添加库所
   *
   * @param data 库所表单数据
   */
  create(data: PlaceForm) {
    return request({
      url: `${PLACE_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改库所
   *
   * @param id 库所ID
   * @param data 库所表单数据
   */
  update(id: number, data: PlaceForm) {
    return request({
      url: `${PLACE_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除库所，多个以英文逗号(,)分割
   *
   * @param ids 库所ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${PLACE_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取库所下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${PLACE_BASE_URL}/options`,
      method: "get",
    });
  },

  /**
   * 导入库所数据
   *
   * @param data FormData对象，包含Excel文件
   */
  import(data: FormData) {
    return request({
      url: `${PLACE_BASE_URL}/import`,
      method: "post",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 下载库所导入模板
   */
  downloadTemplate() {
    return request<Blob, any>({
      url: `${PLACE_BASE_URL}/template`,
      method: "get",
      responseType: "blob",
      headers: {
        Accept:
          "application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  },
};
