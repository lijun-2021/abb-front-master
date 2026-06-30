import request from "@/utils/request";

const RESOURCE_STATUS_BASE_URL = "/api/v1/resourcestatus";

/**
 * 当日资源/状态数据对象
 */
export interface ResourceStatus {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * 加工位ID
   */
  processStationId?: string;

  /**
   * 加工位工人ID
   */
  processWorkerId?: string;

  /**
   * 加工位状态
   */
  processStationStatus?: string;

  /**
   * 立库ID
   */
  warehouseId?: string;

  /**
   * 立库总空余存储数
   */
  warehouseTotalFree?: number;

  /**
   * 立库当前空余存储数
   */
  warehouseCurrentFree?: number;

  /**
   * 立库当前占用存储数
   */
  warehouseCurrentUsed?: number;

  /**
   * RGV标志位
   */
  rgvFlag?: string;

  /**
   * AGV标志位
   */
  agvFlag?: string;

  /**
   * 立库机械臂标志位
   */
  robotArmFlag?: string;

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
 * 当日资源/状态表单类型
 */
export interface ResourceStatusForm {
  /** 主键ID */
  id?: number;
  /** 加工位ID */
  processStationId?: string;
  /** 加工位工人ID */
  processWorkerId?: string;
  /** 加工位状态 */
  processStationStatus?: string;
  /** 立库ID */
  warehouseId?: string;
  /** 立库总空余存储数 */
  warehouseTotalFree?: number;
  /** 立库当前空余存储数 */
  warehouseCurrentFree?: number;
  /** 立库当前占用存储数 */
  warehouseCurrentUsed?: number;
  /** RGV标志位 */
  rgvFlag?: string;
  /** AGV标志位 */
  agvFlag?: string;
  /** 立库机械臂标志位 */
  robotArmFlag?: string;
}

/**
 * 当日资源/状态分页查询参数
 */
export interface ResourceStatusQuery {
  /**
   * 页码
   */
  pageNum: number;

  /**
   * 每页大小
   */
  pageSize: number;

  /**
   * 加工位ID
   */
  processStationId?: string;

  /**
   * 关键字（用于搜索）
   */
  keywords?: string;

  /**
   * 加工位状态
   */
  processStationStatus?: string;

  /**
   * 立库ID
   */
  warehouseId?: string;
}

export const ResourceStatusAPI = {
  /**
   * 获取当日资源/状态分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: ResourceStatusQuery) {
    return request<any, PageResult<ResourceStatus[]>>({
      url: `${RESOURCE_STATUS_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 获取当日资源/状态表单详情
   *
   * @param resourceStatusId 当日资源/状态ID
   * @returns 当日资源/状态表单详情
   */
  getFormData(resourceStatusId: number) {
    return request({
      url: `${RESOURCE_STATUS_BASE_URL}/${resourceStatusId}/form`,
      method: "get",
    });
  },

  /**
   * 添加当日资源/状态
   *
   * @param data 当日资源/状态表单数据
   */
  create(data: ResourceStatusForm) {
    return request({
      url: `${RESOURCE_STATUS_BASE_URL}`,
      method: "post",
      data,
    });
  },

  /**
   * 修改当日资源/状态
   *
   * @param id 当日资源/状态ID
   * @param data 当日资源/状态表单数据
   */
  update(id: number, data: ResourceStatusForm) {
    return request({
      url: `${RESOURCE_STATUS_BASE_URL}/${id}`,
      method: "put",
      data,
    });
  },

  /**
   * 批量删除当日资源/状态，多个以英文逗号(,)分割
   *
   * @param ids 当日资源/状态ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${RESOURCE_STATUS_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 获取当日资源/状态下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${RESOURCE_STATUS_BASE_URL}/options`,
      method: "get",
    });
  },

  /**
   * 导入当日资源/状态数据
   *
   * @param data FormData对象，包含Excel文件
   */
  import(data: FormData) {
    return request({
      url: `${RESOURCE_STATUS_BASE_URL}/import`,
      method: "post",
      data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 下载当日资源/状态导入模板
   */
  downloadTemplate() {
    return request<Blob, any>({
      url: `${RESOURCE_STATUS_BASE_URL}/template`,
      method: "get",
      responseType: "blob",
      headers: {
        Accept:
          "application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  },
};
