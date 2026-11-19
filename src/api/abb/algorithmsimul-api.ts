import request from "@/utils/request";

const ALGORITHM_SIMUL_BASE_URL = "/api/v1/fqc/algorithm-simul";

export interface AlgorithmSimulRecord {
  id?: number;
  line?: string;
  rowId?: string;
  voltageZone?: string;
  worker?: number;
  functionZone?: string;
  inspector?: string;
  functionMinutes?: number;
}

export interface AlgorithmSimulQuery extends PageQuery {
  line?: string;
  rowId?: string;
  voltageZone?: string;
  worker?: number;
  functionZone?: string;
  inspector?: string;
}

export const AlgorithmSimulAPI = {
  getPage(params: AlgorithmSimulQuery) {
    return request<any, PageResult<AlgorithmSimulRecord[]>>({
      url: `${ALGORITHM_SIMUL_BASE_URL}/page`,
      method: "get",
      params,
    });
  },
};
