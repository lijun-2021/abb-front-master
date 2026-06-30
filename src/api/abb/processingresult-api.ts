import request from "@/utils/request";

const PROCESSING_RESULT_BASE_URL = "/api/v1/processing-result";

/**
 * 甘特图数据对象
 */
export interface GanttDataItem {
  /**
   * 当前加工时间
   */
  processTime: number;

  /**
   * 工件ID
   */
  workpieceId: number;

  /**
   * 激发变迁
   */
  transition: string;
}

/**
 * C++算法处理结果对象
 */
export interface ProcessingResult {
  /**
   * 主键ID
   */
  id?: number;

  /**
   * 存储上传文件目录
   */
  uploadDir?: string;

  /**
   * 创建时间
   */
  createTime?: string;

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
 * C++算法处理结果分页查询参数
 */
export interface ProcessingResultQuery extends PageQuery {
  /**
   * 存储上传文件目录
   */
  uploadDir?: string;
}

export const ProcessingResultAPI = {
  /**
   * 获取C++算法处理结果分页列表
   *
   * @param queryParams 查询参数
   */
  getPage(queryParams: ProcessingResultQuery) {
    return request<any, PageResult<ProcessingResult[]>>({
      url: `${PROCESSING_RESULT_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /**
   * 批量删除C++算法处理结果，多个以英文逗号(,)分割
   *
   * @param ids C++算法处理结果ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${PROCESSING_RESULT_BASE_URL}/${ids}`,
      method: "delete",
    });
  },

  /**
   * 下载处理结果文件
   *
   * @param uploadDir 上传目录路径
   */
  downloadFile(uploadDir: string) {
    return request<Blob, any>({
      url: `${PROCESSING_RESULT_BASE_URL}/downloadProcessResult?uploadDir=${uploadDir}`,
      method: "get",
      responseType: "blob",
      headers: {
        Accept: "application/octet-stream, application/zip, application/x-zip-compressed",
      },
    });
  },

  /**
   * 获取C++算法处理结果下拉列表
   */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${PROCESSING_RESULT_BASE_URL}/options`,
      method: "get",
    });
  },

  /**
   * 获取甘特图数据
   *
   * @param uploadDir 上传目录路径
   */
  getGanttData(uploadDir: string) {
    return request<GanttDataItem[], any>({
      url: `${PROCESSING_RESULT_BASE_URL}/gantt-data?uploadDir=${uploadDir}`,
      method: "get",
    });
  },
};
